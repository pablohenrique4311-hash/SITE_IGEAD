"""Integração contra PostgreSQL real; usa exclusivamente o contêiner de teste."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess

CONTAINER = 'igead-audit-postgres'
ROOT = Path(__file__).resolve().parents[2]

def sql(source, ok=True):
    result = subprocess.run(['docker', 'exec', '-i', CONTAINER, 'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres'],
                            input=source, text=True, capture_output=True)
    if ok and result.returncode:
        raise AssertionError(result.stderr)
    if not ok:
        assert result.returncode != 0, 'Operação deveria ter sido negada'
    return result.stdout.strip()

# Cada execução usa banco novo dentro do contêiner exclusivo de teste.
subprocess.run(['docker', 'exec', CONTAINER, 'dropdb', '-U', 'postgres', '--if-exists', 'igead_test'], check=True, capture_output=True)
subprocess.run(['docker', 'exec', CONTAINER, 'createdb', '-U', 'postgres', 'igead_test'], check=True)
# PGDATABASE é configurado explicitamente em cada conexão abaixo.
original_sql = sql
def sql(source, ok=True):
    return original_sql('\\connect igead_test\n' + source, ok)

sql("""
DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE service_role NOLOGIN BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
""")
for migration in sorted((ROOT / 'supabase/migrations').glob('*.sql')):
    if migration.name.startswith('20261105'):
        # Dados sintéticos legados para exercitar a atualização, não somente banco vazio.
        sql("""
        UPDATE public.whatsapp_automation_settings SET provider_token='legacy-synthetic-secret',last_error='legacy-url-with-secret';
        INSERT INTO public.whatsapp_message_history(id,daily_word_date,group_id,group_name,verse_reference,verse_text,formatted_message,status,provider_type,error_message)
        VALUES ('old-a',current_date-1,'legacy-a@g.us','Teste','Ref','Verso','Sintética','sent','greenapi','legacy-url-with-secret'),
        ('old-b',current_date-1,'legacy-b@g.us','Teste','Ref','Verso','Sintética','sent','greenapi',NULL);
        INSERT INTO public.whatsapp_message_queue(id,daily_word_date,group_id,group_name,message_text,scheduled_for,last_error)
        VALUES ('old-queued',current_date-1,'legacy-a@g.us','Teste','Sintética',now(),'legacy-url-with-secret');
        """)
    sql(migration.read_text())
assert sql("SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='whatsapp_automation_settings' AND column_name IN ('provider_token','provider_api_key')") == '0'
assert sql("SELECT status FROM public.whatsapp_message_queue WHERE id='old-queued'") == 'cancelled'
assert sql("SELECT status FROM public.whatsapp_message_queue WHERE id='legacy_old-b'") == 'sent'
assert sql("SELECT count(*) FROM public.whatsapp_message_history WHERE error_message LIKE '%legacy-url%'") == '0'
print('PASS: atualização de dados legados remove segredos e preserva bloqueio de duplicidade')
print('PASS: migrações aplicadas em banco vazio')
admin = '00000000-0000-0000-0000-000000000001'
member = '00000000-0000-0000-0000-000000000002'
pastor = '00000000-0000-0000-0000-000000000003'
sql(f"INSERT INTO auth.users VALUES ('{admin}'),('{member}'),('{pastor}'); INSERT INTO public.staff_roles VALUES ('{admin}','whatsapp_admin'),('{pastor}','pastor');")
def as_user(user, query):
    return f"SET ROLE authenticated; SET request.jwt.claim.sub = '{user}'; {query}"
assert sql(as_user(member, 'SELECT public.is_whatsapp_admin()')) == 'f'
assert sql(as_user(admin, 'SELECT public.is_whatsapp_admin()')) == 't'
assert sql(as_user(member, 'SELECT count(*) FROM public.whatsapp_automation_settings')) == '0'
assert sql(as_user(admin, 'SELECT count(*) FROM public.whatsapp_automation_settings')) == '1'
sql('SET ROLE anon; SELECT * FROM public.whatsapp_automation_settings', ok=False)
sql(as_user(member, "INSERT INTO public.staff_roles VALUES ('%s','whatsapp_admin')" % member), ok=False)
sql(as_user(admin, "UPDATE public.whatsapp_automation_settings SET last_sent_at = now()"), ok=False)
sql(as_user(admin, "UPDATE public.whatsapp_automation_settings SET is_enabled=true WHERE id='default'"))
assert sql("SELECT is_enabled FROM public.whatsapp_automation_settings") == 't'
sql(as_user(member, "UPDATE public.whatsapp_automation_settings SET is_enabled=false WHERE id='default'"))
assert sql("SELECT is_enabled FROM public.whatsapp_automation_settings") == 't'
sql(as_user(admin, "SELECT public.claim_whatsapp_job()"), ok=False)
print('PASS: RLS de configurações, papéis e funções privilegiadas')
submit = "SELECT public.submit_prayer_request('Pessoa','000','saude','Pedido sintético',true)"
for _ in range(5):
    assert sql(as_user(member, submit))
sql(as_user(member, submit), ok=False)
assert sql(as_user(member, 'SELECT count(*) FROM public.prayer_requests')) == '0'
assert sql(as_user(admin, 'SELECT count(*) FROM public.prayer_requests')) == '0'
assert sql(as_user(pastor, 'SELECT count(*) FROM public.prayer_requests')) == '5'
sql('SET ROLE anon; ' + submit, ok=False)
print('PASS: confidencialidade pastoral, autenticação e limite de pedidos')
sql("""
INSERT INTO public.whatsapp_message_queue(id,daily_word_date,group_id,group_name,message_text,scheduled_for)
VALUES ('due',current_date,'test@g.us','Teste','Sintética',now()-interval '1 minute'),
('future',current_date,'future@g.us','Teste','Sintética',now()+interval '1 day');
""")
with ThreadPoolExecutor(max_workers=2) as pool:
    results = list(pool.map(lambda _: sql("SET ROLE service_role; SELECT id FROM public.claim_whatsapp_job()"), range(2)))
assert sorted(results) == ['', 'due'], results
assert sql("SELECT status FROM public.whatsapp_message_queue WHERE id='future'") == 'pending'
claim = sql("SELECT claim_id FROM public.whatsapp_message_queue WHERE id='due'")
sql("SET ROLE service_role; SELECT public.finish_whatsapp_job('due','00000000-0000-0000-0000-000000000099','sent','provider-id',NULL)", ok=False)
sql(f"SET ROLE service_role; SELECT public.finish_whatsapp_job('due','{claim}','sent','provider-id',NULL)")
assert sql("SELECT count(*) FROM public.whatsapp_message_history WHERE id='due'") == '1'
sql(f"SET ROLE service_role; SELECT public.finish_whatsapp_job('due','{claim}','sent','provider-id',NULL)", ok=False)
sql("INSERT INTO public.whatsapp_message_queue(id,daily_word_date,group_id,group_name,message_text,scheduled_for) VALUES ('duplicate',current_date,'test@g.us','Teste','Sintética',now())", ok=False)
print('PASS: concorrência real, horário futuro, posse do trabalho e unicidade')
sql("UPDATE public.whatsapp_message_queue SET status='processing',updated_at=now()-interval '3 minutes' WHERE id='future'")
sql('SET ROLE service_role; SELECT id FROM public.claim_whatsapp_job()')
assert sql("SELECT status FROM public.whatsapp_message_queue WHERE id='future'") == 'uncertain'
sql("UPDATE public.whatsapp_automation_settings SET is_enabled=false; INSERT INTO public.whatsapp_message_queue(id,daily_word_date,group_id,group_name,message_text,scheduled_for) VALUES ('paused',current_date,'paused@g.us','Teste','Sintética',now())")
assert sql('SET ROLE service_role; SELECT id FROM public.claim_whatsapp_job()') == ''
print('PASS: interrupção exige reconciliação; pausa bloqueia aquisição')

sql("INSERT INTO public.whatsapp_message_queue(id,daily_word_date,group_id,group_name,message_text,scheduled_for,is_test) VALUES ('manual',current_date,'manual@g.us','Teste','Sintética',now(),true)")
assert sql('SET ROLE service_role; SELECT id FROM public.claim_whatsapp_job()') == ''
assert sql("SET ROLE service_role; SELECT id FROM public.claim_whatsapp_job('manual')") == 'manual'
print('PASS: cron não adquire teste manual; aquisição explícita funciona mesmo pausado')

sql("""
INSERT INTO public.whatsapp_message_queue(id,daily_word_date,group_id,group_name,message_text,scheduled_for,is_test)
VALUES ('failpersist',current_date,'persistence@g.us','Teste','Sintética',now(),true);
CREATE FUNCTION public.reject_history_fixture() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN IF NEW.id='failpersist' THEN RAISE EXCEPTION 'simulated_write_failure'; END IF; RETURN NEW; END $$;
CREATE TRIGGER reject_history_fixture BEFORE INSERT ON public.whatsapp_message_history FOR EACH ROW EXECUTE FUNCTION public.reject_history_fixture();
""")
assert sql("SET ROLE service_role; SELECT id FROM public.claim_whatsapp_job('failpersist')") == 'failpersist'
claim = sql("SELECT claim_id FROM public.whatsapp_message_queue WHERE id='failpersist'")
sql(f"SET ROLE service_role; SELECT public.finish_whatsapp_job('failpersist','{claim}','sent','accepted-by-provider',NULL)", ok=False)
assert sql("SELECT status FROM public.whatsapp_message_queue WHERE id='failpersist'") == 'processing'
assert sql("SELECT count(*) FROM public.whatsapp_message_history WHERE id='failpersist'") == '0'
sql("UPDATE public.whatsapp_message_queue SET updated_at=now()-interval '3 minutes' WHERE id='failpersist'")
sql('SET ROLE service_role; SELECT id FROM public.claim_whatsapp_job()')
assert sql("SELECT status FROM public.whatsapp_message_queue WHERE id='failpersist'") == 'uncertain'
print('PASS: aceite seguido de falha real de persistência mantém reserva e exige reconciliação')
