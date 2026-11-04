/**
 * Supabase Edge Function: whatsapp-daily-word
 * Executa diariamente via pg_cron ou webhook agendado no fuso America/Cuiaba.
 * 
 * Fluxo:
 * 1. Verifica se a automação está ativada em whatsapp_automation_settings
 * 2. Verifica se a Palavra do Dia já foi enviada hoje no grupo (Prevenção de duplicidade)
 * 3. Enfileira a Palavra do Dia e envia diretamente para o grupo existente via provedor configurado
 * 4. Registra no histórico (whatsapp_message_history)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const AUTHORIZED_ADMIN_EMAIL = 'pablohenrique4311@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  try {
    // 0. Verificação estrita de autorização
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Permite chamadas internas do cron agendado (service_role)
    const isServiceRole = Boolean(token && SUPABASE_SERVICE_ROLE_KEY && token === SUPABASE_SERVICE_ROLE_KEY);

    if (!isServiceRole) {
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Acesso não autorizado: Token de autenticação ausente.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Valida o usuário autenticado no Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user || user.email?.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        return new Response(
          JSON.stringify({ error: `Acesso negado: Somente o administrador autorizado (${AUTHORIZED_ADMIN_EMAIL}) pode acionar a automação.` }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 1. Busca configurações
    const { data: settings, error: settingsError } = await supabase
      .from('whatsapp_automation_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (settingsError || !settings) {
      return new Response(JSON.stringify({ error: 'Configurações de automação não encontradas.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!settings.is_enabled) {
      return new Response(JSON.stringify({ message: 'Automação pausada nas configurações.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Data de hoje no fuso America/Cuiaba (GMT-4)
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Cuiaba',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const todayCuiaba = formatter.format(new Date());

    // 3. Verifica duplicidade
    const { data: existing } = await supabase
      .from('whatsapp_message_history')
      .select('id')
      .eq('daily_word_date', todayCuiaba)
      .eq('group_id', settings.target_group_id)
      .eq('status', 'sent')
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ message: `Palavra do dia já enviada hoje (${todayCuiaba}).` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Busca Palavra do Dia
    const { data: wordData } = await supabase
      .from('daily_words')
      .select('*')
      .eq('date', todayCuiaba)
      .maybeSingle();

    const verseText = wordData?.verse_text || 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.';
    const reference = wordData?.reference || 'Romanos 8:28 (Almeida JFA)';
    const reflection = wordData?.reflection || 'Mesmo em meio às adversidades da vida, o Senhor guia cada um dos Seus passos. Descanse no amor e na providência de Deus.';

    // 5. Formatação oficial
    const formattedMessage = [
      '🙏 *PAZ DO SENHOR!*',
      '',
      '📖 *PALAVRA DO DIA — IGEAD-MT*',
      '',
      '*VERSÍCULO:*',
      `"${verseText.trim()}"`,
      '',
      '📚 *REFERÊNCIA:*',
      reference.trim(),
      '',
      '✨ *REFLEXÃO:*',
      reflection.trim(),
      '',
      '🙌 Que Deus abençoe seu dia e fortaleça sua fé!',
      '',
      '*IGEAD-MT — Igreja Evangélica Assembleia de Deus*'
    ].join('\n');

    let sendResult = { success: false, providerMessageId: '', error: '' };

    // 6. Envio conforme provedor configurado
    if (settings.provider_type === 'evolution') {
      const endpoint = (settings.provider_endpoint || '').replace(/\/+$/, '');
      const instance = settings.provider_instance_name || 'igead_oficial';
      const apikey = settings.provider_api_key || '';

      const resp = await fetch(`${endpoint}/message/sendText/${instance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey },
        body: JSON.stringify({
          number: settings.target_group_id,
          text: formattedMessage,
          options: { delay: 1200, presence: 'composing', linkPreview: false }
        })
      });

      const resJson = await resp.json();
      if (resp.ok && (resJson?.key?.id || resJson?.id)) {
        sendResult = { success: true, providerMessageId: resJson.key?.id || resJson.id, error: '' };
      } else {
        sendResult = { success: false, providerMessageId: '', error: resJson?.message || `HTTP ${resp.status}` };
      }
    } else if (settings.provider_type === 'zapi') {
      const endpoint = (settings.provider_endpoint || 'https://api.z-api.io').replace(/\/+$/, '');
      const instance = settings.provider_instance_name || '';
      const token = settings.provider_token || settings.provider_api_key || '';

      const resp = await fetch(`${endpoint}/instances/${instance}/token/${token}/send-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: settings.target_group_id, message: formattedMessage })
      });

      const resJson = await resp.json();
      if (resp.ok && (resJson?.zaapId || resJson?.messageId || resJson?.id)) {
        sendResult = { success: true, providerMessageId: resJson.zaapId || resJson.messageId || resJson.id, error: '' };
      } else {
        sendResult = { success: false, providerMessageId: '', error: resJson?.message || `HTTP ${resp.status}` };
      }
    } else {
      // Simulação
      sendResult = {
        success: true,
        providerMessageId: `EDGE_SIM_${Date.now()}`,
        error: ''
      };
    }

    // 7. Registra no histórico
    await supabase.from('whatsapp_message_history').insert({
      id: `edge_${Date.now()}`,
      daily_word_date: todayCuiaba,
      group_id: settings.target_group_id,
      group_name: settings.target_group_name,
      verse_reference: reference,
      verse_text: verseText,
      reflection_text: reflection,
      formatted_message: formattedMessage,
      status: sendResult.success ? 'sent' : 'failed',
      attempts: 1,
      sent_at: new Date().toISOString(),
      provider_type: settings.provider_type,
      provider_message_id: sendResult.providerMessageId,
      error_message: sendResult.error || null,
      is_simulated: settings.provider_type === 'simulation'
    });

    if (sendResult.success) {
      await supabase
        .from('whatsapp_automation_settings')
        .update({ last_sent_at: new Date().toISOString(), last_error: null })
        .eq('id', 'default');
    } else {
      await supabase
        .from('whatsapp_automation_settings')
        .update({ last_error: sendResult.error })
        .eq('id', 'default');
    }

    return new Response(JSON.stringify({ success: sendResult.success, sendResult }), {
      status: sendResult.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
