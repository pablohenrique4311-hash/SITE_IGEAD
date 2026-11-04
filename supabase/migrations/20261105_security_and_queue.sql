-- Segredos passam a existir apenas no ambiente das funções.
ALTER TABLE public.whatsapp_automation_settings DROP COLUMN IF EXISTS provider_api_key;
ALTER TABLE public.whatsapp_automation_settings DROP COLUMN IF EXISTS provider_token;
ALTER TABLE public.whatsapp_automation_settings ALTER COLUMN provider_instance_name DROP DEFAULT;
ALTER TABLE public.whatsapp_automation_settings ALTER COLUMN provider_endpoint DROP DEFAULT;
UPDATE public.whatsapp_automation_settings SET provider_instance_name = NULL, provider_endpoint = NULL;

CREATE TABLE public.staff_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('whatsapp_admin', 'pastor')),
  PRIMARY KEY (user_id, role)
);
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staff_roles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_roles TO service_role;
-- Sem atribuição automática por e-mail. O operador concede o papel por UUID confirmado.
CREATE FUNCTION public.is_whatsapp_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = auth.uid() AND role = 'whatsapp_admin');
$$;
REVOKE ALL ON FUNCTION public.is_whatsapp_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_whatsapp_admin() TO authenticated;

DO $$
DECLARE t text; p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['whatsapp_automation_settings','whatsapp_message_queue','whatsapp_message_history','daily_words'] LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('CREATE POLICY staff_read ON public.%I FOR SELECT TO authenticated USING (public.is_whatsapp_admin())', t);
  END LOOP;
END $$;
CREATE POLICY public_daily_words ON public.daily_words FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY staff_settings_update ON public.whatsapp_automation_settings FOR UPDATE TO authenticated
  USING (public.is_whatsapp_admin()) WITH CHECK (public.is_whatsapp_admin());
CREATE POLICY staff_words_write ON public.daily_words FOR ALL TO authenticated
  USING (public.is_whatsapp_admin()) WITH CHECK (public.is_whatsapp_admin());
REVOKE ALL ON public.whatsapp_automation_settings, public.whatsapp_message_queue, public.whatsapp_message_history FROM anon, authenticated;
GRANT SELECT ON public.whatsapp_automation_settings, public.whatsapp_message_queue, public.whatsapp_message_history TO authenticated;
GRANT UPDATE (is_enabled, scheduled_time, timezone, target_group_id, target_group_name, provider_type, updated_at)
  ON public.whatsapp_automation_settings TO authenticated;
ALTER TABLE public.whatsapp_automation_settings ADD CONSTRAINT valid_schedule CHECK (scheduled_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
ALTER TABLE public.whatsapp_automation_settings ADD CONSTRAINT church_timezone CHECK (timezone = 'America/Cuiaba');
ALTER TABLE public.whatsapp_automation_settings ADD CONSTRAINT supported_provider CHECK (provider_type IN ('greenapi', 'evolution', 'simulation'));

CREATE TABLE public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  phone text NOT NULL DEFAULT '' CHECK (length(phone) <= 30),
  category text NOT NULL CHECK (category IN ('familia','saude','espiritual','financeiro','agradecimento')),
  message text NOT NULL CHECK (length(message) BETWEEN 1 AND 4000),
  is_confidential boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prayer_user_date ON public.prayer_requests(user_id, created_at);
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.prayer_requests FROM anon, authenticated;
GRANT SELECT ON public.prayer_requests TO authenticated;
CREATE POLICY pastoral_read ON public.prayer_requests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = auth.uid() AND role = 'pastor')
);
-- Função definer evita acesso direto à tabela de papéis nas políticas.
CREATE FUNCTION public.is_pastor() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_roles WHERE user_id = auth.uid() AND role = 'pastor');
$$;
REVOKE ALL ON FUNCTION public.is_pastor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_pastor() TO authenticated;
DROP POLICY pastoral_read ON public.prayer_requests;
CREATE POLICY pastoral_read ON public.prayer_requests FOR SELECT TO authenticated USING (public.is_pastor());

CREATE FUNCTION public.submit_prayer_request(p_name text, p_phone text, p_category text, p_message text, p_confidential boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE new_id uuid; caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(caller::text, 0));
  IF (SELECT count(*) FROM public.prayer_requests WHERE user_id = caller AND created_at > now() - interval '1 hour') >= 5 THEN
    RAISE EXCEPTION 'rate_limit_exceeded';
  END IF;
  INSERT INTO public.prayer_requests(user_id,name,phone,category,message,is_confidential)
    VALUES(caller,trim(p_name),trim(p_phone),p_category,trim(p_message),p_confidential) RETURNING id INTO new_id;
  RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.submit_prayer_request(text,text,text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_prayer_request(text,text,text,text,boolean) TO authenticated;

ALTER TABLE public.whatsapp_message_queue ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.whatsapp_message_queue ADD COLUMN provider_type text NOT NULL DEFAULT 'greenapi';
ALTER TABLE public.whatsapp_message_queue ADD COLUMN word_snapshot jsonb NOT NULL DEFAULT '{}';
ALTER TABLE public.whatsapp_message_queue ADD COLUMN claim_id uuid;
ALTER TABLE public.whatsapp_message_queue ADD CONSTRAINT queue_status CHECK (status IN ('pending','processing','sent','failed','cancelled','uncertain'));
-- Reconcilie duplicatas legadas antes de aplicar esta restrição; falhar é preferível a apagá-las.
CREATE UNIQUE INDEX wa_one_daily_job ON public.whatsapp_message_queue(daily_word_date,group_id) WHERE NOT is_test;

CREATE FUNCTION public.claim_whatsapp_job(p_id text DEFAULT NULL) RETURNS SETOF public.whatsapp_message_queue
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  -- Resultado desconhecido exige reconciliação humana, nunca reenvio automático.
  UPDATE public.whatsapp_message_queue SET status = 'uncertain', last_error = 'Envio interrompido; reconciliar com o provedor.'
    WHERE status = 'processing' AND updated_at < now() - interval '2 minutes';
  RETURN QUERY
    WITH candidate AS (
      SELECT q.id FROM public.whatsapp_message_queue q
      JOIN public.whatsapp_automation_settings s ON s.id = 'default'
      WHERE ((p_id IS NULL AND NOT q.is_test) OR q.id = p_id) AND q.status = 'pending' AND q.scheduled_for <= now() AND q.attempts < q.max_attempts
        AND (s.is_enabled OR q.is_test)
      ORDER BY q.scheduled_for FOR UPDATE OF q SKIP LOCKED LIMIT 1
    )
    UPDATE public.whatsapp_message_queue q SET status = 'processing', attempts = q.attempts + 1,
      claim_id = gen_random_uuid(), updated_at = now()
    FROM candidate c WHERE q.id = c.id RETURNING q.*;
END $$;
REVOKE ALL ON FUNCTION public.claim_whatsapp_job(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_whatsapp_job(text) TO service_role;

CREATE FUNCTION public.finish_whatsapp_job(p_id text, p_claim uuid, p_status text, p_provider_id text, p_error text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE q public.whatsapp_message_queue;
BEGIN
  IF p_status NOT IN ('sent','failed','uncertain') THEN RAISE EXCEPTION 'invalid_status'; END IF;
  SELECT * INTO q FROM public.whatsapp_message_queue WHERE id = p_id AND status = 'processing' AND claim_id = p_claim FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'job_not_owned'; END IF;
  UPDATE public.whatsapp_message_queue SET status = p_status, provider_message_id = p_provider_id,
    last_error = p_error, updated_at = now() WHERE id = p_id;
  INSERT INTO public.whatsapp_message_history(id,daily_word_date,group_id,group_name,verse_reference,verse_text,
    reflection_text,formatted_message,status,attempts,provider_type,provider_message_id,error_message,is_simulated)
  VALUES(q.id,q.daily_word_date,q.group_id,q.group_name,coalesce(q.word_snapshot->>'reference',''),
    coalesce(q.word_snapshot->>'verseText',''),coalesce(q.word_snapshot->>'reflection',''),q.message_text,
    CASE WHEN p_status = 'sent' THEN 'sent' ELSE 'failed' END,q.attempts,q.provider_type,p_provider_id,p_error,q.provider_type = 'simulation');
  UPDATE public.whatsapp_automation_settings SET last_error = p_error,
    last_sent_at = CASE WHEN p_status = 'sent' AND q.provider_type <> 'simulation' THEN now() ELSE last_sent_at END,
    updated_at = now() WHERE id = 'default';
END $$;
REVOKE ALL ON FUNCTION public.finish_whatsapp_job(text,uuid,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_whatsapp_job(text,uuid,text,text,text) TO service_role;

GRANT SELECT ON public.daily_words TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_words TO authenticated;
-- Erros legados podiam conter URLs autenticadas. Preservar status, retirar o detalhe sensível.
UPDATE public.whatsapp_automation_settings SET last_error = NULL;
UPDATE public.whatsapp_message_queue SET last_error = 'Detalhe legado removido por segurança.' WHERE last_error IS NOT NULL;
UPDATE public.whatsapp_message_history SET error_message = 'Detalhe legado removido por segurança.' WHERE error_message IS NOT NULL;

-- Histórico anterior deve impedir um novo envio diário após a atualização.
UPDATE public.whatsapp_message_queue q SET status = 'cancelled', last_error = 'Envio já consta no histórico anterior.'
WHERE q.status = 'pending' AND NOT q.is_test AND EXISTS (
  SELECT 1 FROM public.whatsapp_message_history h WHERE h.daily_word_date = q.daily_word_date
    AND h.group_id = q.group_id AND h.status = 'sent' AND NOT h.is_simulated
);
INSERT INTO public.whatsapp_message_queue(id,daily_word_date,group_id,group_name,message_text,scheduled_for,status,provider_type)
SELECT 'legacy_' || h.id,h.daily_word_date,h.group_id,h.group_name,h.formatted_message,h.sent_at,'sent',h.provider_type
FROM (SELECT DISTINCT ON (daily_word_date,group_id) * FROM public.whatsapp_message_history
      WHERE status = 'sent' AND NOT is_simulated ORDER BY daily_word_date,group_id,sent_at DESC) h
WHERE NOT EXISTS (SELECT 1 FROM public.whatsapp_message_queue q WHERE q.daily_word_date = h.daily_word_date AND q.group_id = h.group_id AND NOT q.is_test);
