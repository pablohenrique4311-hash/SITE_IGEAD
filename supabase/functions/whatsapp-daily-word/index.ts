import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';
import { Gateway } from '../_shared/gateway.ts';
import { createWhatsAppHandler, type WhatsAppStore } from '../_shared/whatsappHandler.ts';

const env = (name: string) => Deno.env.get(name) || '';
const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const store: WhatsAppStore = {
  async authorize(token) {
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return false;
    const result = await db.from('staff_roles').select('user_id').eq('user_id', user.id).eq('role', 'whatsapp_admin').maybeSingle();
    return !result.error && Boolean(result.data);
  },
  async settings() {
    const { data, error } = await db.from('whatsapp_automation_settings')
      .select('is_enabled,scheduled_time,target_group_id,target_group_name,provider_type').eq('id', 'default').single();
    if (error || !data) throw new Error('settings_unavailable');
    return data;
  },
  async word(date) {
    const { data, error } = await db.from('daily_words').select('*').eq('date', date).maybeSingle();
    if (error) throw new Error('word_unavailable');
    if (!data) return null;
    return { id: data.id, date, reference: data.reference, bookName: data.book_name,
      chapter: data.chapter, verseNumber: data.verse_number, verseText: data.verse_text,
      reflection: data.reflection, translation: data.translation };
  },
  async enqueue(job) {
    const { error } = await db.from('whatsapp_message_queue').insert(job);
    // Somente colisão da chave determinística do mesmo trabalho é esperada.
    if (error && !(error.code === '23505' && String(job.id).startsWith('daily_'))) throw new Error('enqueue_failed');
  },
  async claim(id) {
    const { data, error } = await db.rpc('claim_whatsapp_job', { p_id: id || null });
    if (error) throw new Error('claim_failed');
    return data?.[0] || null;
  },
  async finish(job, result) {
    const { error } = await db.rpc('finish_whatsapp_job', {
      p_id: job.id, p_claim: job.claim_id,
      p_status: result.success ? 'sent' : result.uncertain ? 'uncertain' : 'failed',
      p_provider_id: result.providerMessageId || null, p_error: result.error || null,
    });
    if (error) throw new Error('history_failed');
  },
};

Deno.serve(createWhatsAppHandler({
  store, cronSecret: env('WHATSAPP_CRON_SECRET'),
  allowedOrigins: env('ALLOWED_ORIGINS').split(',').map((s) => s.trim()).filter(Boolean),
  gateway(type) {
    const prefix = type === 'evolution' ? 'EVOLUTION_API' : 'GREEN_API';
    return new Gateway({ type, endpoint: env(`${prefix}_URL`), instance: env(`${prefix}_INSTANCE_ID`),
      token: env(`${prefix}_TOKEN`),
      allowedOrigins: env('WHATSAPP_ALLOWED_PROVIDER_ORIGINS').split(',').map((s) => s.trim()).filter(Boolean) });
  },
}));
