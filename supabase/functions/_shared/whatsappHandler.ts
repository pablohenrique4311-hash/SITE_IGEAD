import { canonicalWord, getCuiabaDateString, formatWhatsAppDailyMessage } from './dailyWord.ts';
import type { DailyWord } from './dailyWord.ts';
import { Gateway } from './gateway.ts';

export interface Settings {
  is_enabled: boolean; scheduled_time: string; target_group_id: string;
  target_group_name: string; provider_type: string;
}
export interface Job {
  id: string; claim_id: string; group_id: string; message_text: string; provider_type: string;
}
export interface WhatsAppStore {
  authorize(token: string): Promise<boolean>;
  settings(): Promise<Settings>;
  word(date: string): Promise<DailyWord | null>;
  enqueue(job: Record<string, unknown>): Promise<void>;
  claim(id?: string): Promise<Job | null>;
  finish(job: Job, result: Awaited<ReturnType<Gateway['send']>>): Promise<void>;
}

export function createWhatsAppHandler(options: {
  store: WhatsAppStore; gateway: (type: string) => Gateway; cronSecret: string;
  allowedOrigins: string[]; now?: () => Date;
}) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' };
    if (origin && options.allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info';
      headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    }
    const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (origin && !options.allowedOrigins.includes(origin)) return json({ error: 'Origem não permitida.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);
    const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return json({ error: 'Autenticação obrigatória.' }, 401);
    try {
      const cron = Boolean(options.cronSecret && token === options.cronSecret);
      if (!cron && !await options.store.authorize(token)) return json({ error: 'Acesso negado.' }, 403);
      if (Number(request.headers.get('content-length') || 0) > 2048) return json({ error: 'Requisição muito grande.' }, 413);
      const raw = await request.text();
      if (raw.length > 2048) return json({ error: 'Requisição muito grande.' }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return json({ error: 'JSON inválido.' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some((k) => k !== 'action')) {
        return json({ error: 'Parâmetros não permitidos.' }, 400);
      }
      const action = body.action;
      if (!['status', 'groups', 'test', 'process'].includes(action)) return json({ error: 'Ação inválida.' }, 400);
      if (cron && action !== 'process') return json({ error: 'Cron restrito ao processamento.' }, 403);
      const settings = await options.store.settings();
      if (!['greenapi', 'evolution', 'simulation'].includes(settings.provider_type)) {
        return json({ error: 'Provedor não suportado.' }, 400);
      }
      if (action === 'status') return json(await options.gateway(settings.provider_type).status());
      if (action === 'groups') return json(settings.target_group_id
        ? [{ id: settings.target_group_id, name: settings.target_group_name, isReadOnly: false }] : []);
      if (!/^\d{5,30}@g\.us$/.test(settings.target_group_id)) return json({ error: 'Grupo de destino inválido.' }, 400);
      if (action === 'process' && !settings.is_enabled) return json({ processedCount: 0, successCount: 0, errors: ['Automação pausada.'] });
      const now = options.now?.() || new Date();
      const date = getCuiabaDateString(now);
      const word = await options.store.word(date) || canonicalWord(date);
      const isTest = action === 'test';
      const scheduledFor = isTest ? now : new Date(`${date}T${settings.scheduled_time}:00-04:00`);
      const jobId = isTest ? `test_${crypto.randomUUID()}` : `daily_${date}_${settings.target_group_id}`;
      await options.store.enqueue({
        id: jobId,
        daily_word_date: date, group_id: settings.target_group_id, group_name: settings.target_group_name,
        message_text: formatWhatsAppDailyMessage(word), word_snapshot: word, provider_type: settings.provider_type,
        scheduled_for: scheduledFor.toISOString(), is_test: isTest,
      });
      const job = await options.store.claim(isTest ? jobId : undefined);
      if (!job) return json(isTest ? { success: false, error: 'Nenhum envio adquirido.' } : { processedCount: 0, successCount: 0, errors: [] });
      const result = await options.gateway(job.provider_type).send(job.group_id, job.message_text);
      await options.store.finish(job, result);
      return json(isTest ? result : {
        processedCount: 1, successCount: result.success && !result.isSimulated ? 1 : 0,
        errors: result.error ? [result.error] : [],
      });
    } catch {
      return json({ error: 'Operação não confirmada. Consulte o histórico antes de repetir.' }, 500);
    }
  };
}
