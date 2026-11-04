-- ==============================================================================
-- SCHEMA SUPABASE: AUTOMAÇÃO DA PALAVRA DO DIA NO WHATSAPP — IGEAD-MT
-- ==============================================================================

-- 1. Tabela de Configurações da Automação
CREATE TABLE IF NOT EXISTS public.whatsapp_automation_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  scheduled_time TEXT NOT NULL DEFAULT '07:00',
  timezone TEXT NOT NULL DEFAULT 'America/Cuiaba',
  target_group_id TEXT NOT NULL DEFAULT '120363361678530962@g.us',
  target_group_name TEXT NOT NULL DEFAULT 'IGEAD-MT • Grupo Oficial da Igreja',
  provider_type TEXT NOT NULL DEFAULT 'greenapi', -- 'greenapi' | 'evolution' | 'zapi' | 'simulation'
  provider_endpoint TEXT DEFAULT 'https://7107.api.greenapi.com',
  provider_instance_name TEXT DEFAULT '',
  provider_api_key TEXT,
  provider_token TEXT,
  last_sent_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insere configuração padrão inicial se não existir
INSERT INTO public.whatsapp_automation_settings (
  id, is_enabled, scheduled_time, timezone, target_group_id, target_group_name, provider_type, provider_endpoint, provider_instance_name, provider_token
)
VALUES (
  'default', false, '07:00', 'America/Cuiaba', '120363361678530962@g.us', 'IGEAD-MT • Grupo Oficial da Igreja', 'greenapi', 'https://7107.api.greenapi.com', '', ''
)
ON CONFLICT (id) DO UPDATE SET
  target_group_id = EXCLUDED.target_group_id,
  provider_type = EXCLUDED.provider_type,
  provider_endpoint = EXCLUDED.provider_endpoint,
  provider_instance_name = EXCLUDED.provider_instance_name,
  provider_token = EXCLUDED.provider_token;

-- 2. Tabela de Fila de Mensagens da Automação
CREATE TABLE IF NOT EXISTS public.whatsapp_message_queue (
  id TEXT PRIMARY KEY,
  daily_word_date DATE NOT NULL,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  last_error TEXT,
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_wa_queue_status_date ON public.whatsapp_message_queue (status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_wa_queue_daily_word ON public.whatsapp_message_queue (daily_word_date, group_id);

-- 3. Tabela de Histórico de Mensagens Enviadas
CREATE TABLE IF NOT EXISTS public.whatsapp_message_history (
  id TEXT PRIMARY KEY,
  daily_word_date DATE NOT NULL,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  reflection_text TEXT,
  formatted_message TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent' | 'failed'
  attempts INT NOT NULL DEFAULT 1,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  provider_type TEXT NOT NULL,
  provider_message_id TEXT,
  error_message TEXT,
  is_simulated BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_wa_history_date_group ON public.whatsapp_message_history (daily_word_date, group_id, status);
CREATE INDEX IF NOT EXISTS idx_wa_history_sent_at ON public.whatsapp_message_history (sent_at DESC);

-- 4. Tabela Opcional para Customização Pastoral da Palavra do Dia
CREATE TABLE IF NOT EXISTS public.daily_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  reference TEXT NOT NULL,
  book_name TEXT NOT NULL,
  chapter INT NOT NULL DEFAULT 1,
  verse_number INT NOT NULL DEFAULT 1,
  verse_text TEXT NOT NULL,
  reflection TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT 'Almeida (JFA)',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- Restrição estrita: Apenas o e-mail autorizado (pablohenrique4311@gmail.com)
-- pode visualizar, gerenciar configurações, consultar fila e histórico.
-- Triggers automáticos/pg_cron utilizando service_role mantêm acesso irrestrito.
-- ==============================================================================

ALTER TABLE public.whatsapp_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_words ENABLE ROW LEVEL SECURITY;

-- 1. Configurações da Automação: restrito a pablohenrique4311@gmail.com
CREATE POLICY "Acesso restrito ao administrador whatsapp_automation_settings"
  ON public.whatsapp_automation_settings FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'pablohenrique4311@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'pablohenrique4311@gmail.com');

-- 2. Fila de Mensagens: restrito a pablohenrique4311@gmail.com
CREATE POLICY "Acesso restrito ao administrador whatsapp_message_queue"
  ON public.whatsapp_message_queue FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'pablohenrique4311@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'pablohenrique4311@gmail.com');

-- 3. Histórico de Mensagens: restrito a pablohenrique4311@gmail.com
CREATE POLICY "Acesso restrito ao administrador whatsapp_message_history"
  ON public.whatsapp_message_history FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'pablohenrique4311@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'pablohenrique4311@gmail.com');

-- 4. Leitura pública da Palavra do Dia (para que membros e o site possam ler)
CREATE POLICY "Leitura pública da Palavra do Dia"
  ON public.daily_words FOR SELECT
  TO public
  USING (true);

-- 5. Gestão da Palavra do Dia: restrito ao administrador oficial
CREATE POLICY "Gestão da Palavra do Dia para administrador"
  ON public.daily_words FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'pablohenrique4311@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'pablohenrique4311@gmail.com');
