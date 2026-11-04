-- Aplicar explicitamente em homologação após configurar o Vault. Não é migração automática.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.invoke_whatsapp_cron() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE project_url text; cron_secret text;
BEGIN
  SELECT decrypted_secret INTO project_url FROM vault.decrypted_secrets WHERE name = 'igead_project_url';
  SELECT decrypted_secret INTO cron_secret FROM vault.decrypted_secrets WHERE name = 'igead_whatsapp_cron_secret';
  IF project_url IS NULL OR cron_secret IS NULL OR project_url !~ '^https://[a-z0-9]+\.supabase\.co$' THEN
    RAISE EXCEPTION 'Configuração do agendador ausente ou inválida';
  END IF;
  PERFORM net.http_post(
    url := project_url || '/functions/v1/whatsapp-daily-word',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || cron_secret),
    body := '{"action":"process"}'::jsonb,
    timeout_milliseconds := 20000
  );
END $$;
REVOKE ALL ON FUNCTION public.invoke_whatsapp_cron() FROM PUBLIC, anon, authenticated, service_role;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname IN ('igead-whatsapp-minute','igead-prayer-retention');
SELECT cron.schedule('igead-whatsapp-minute','* * * * *','SELECT public.invoke_whatsapp_cron()');
SELECT cron.schedule('igead-prayer-retention','0 5 * * *',
  $$DELETE FROM public.prayer_requests WHERE created_at < now() - interval '30 days'$$);
