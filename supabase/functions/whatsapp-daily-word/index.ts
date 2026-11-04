/**
 * Supabase Edge Function: whatsapp-daily-word
 * Executa o envio real da Palavra do Dia via GREEN-API para o grupo do WhatsApp da igreja.
 * 
 * Especificações oficiais GREEN-API:
 * - Chamada HTTP POST: ${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}
 * - Cabeçalho: Content-Type: application/json
 * - Corpo (JSON):
 *   {
 *     "chatId": "120363361678530962@g.us",
 *     "message": "[Texto do versículo formatado]"
 *   }
 * 
 * Suporta:
 * 1. Disparos agendados diários (07:00 Cuiabá via pg_cron ou webhook)
 * 2. Disparos manuais de teste ("Disparar Teste Imediato" no painel)
 * 3. Registro auditável de status (sent/failed) em whatsapp_message_history
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const AUTHORIZED_ADMIN_EMAIL = 'pablohenrique4311@gmail.com';

// Configurações padrão GREEN-API fornecidas pelo usuário
const DEFAULT_GREEN_API_URL = 'https://7107.api.greenapi.com';
const DEFAULT_GREEN_API_INSTANCE = '710722790899';
const DEFAULT_GREEN_API_TOKEN = 'dcdbfe8720b844619359f2ecf8138491768d407aace44835b8';
const DEFAULT_TARGET_GROUP_ID = '120363361678530962@g.us';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  // Tratamento de requisições OPTIONS (Preflight CORS para chamadas diretas do navegador)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 0. Verificação estrita de autorização
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Permite chamadas internas automáticas do cron agendado (service_role)
    const isServiceRole = Boolean(token && SUPABASE_SERVICE_ROLE_KEY && token === SUPABASE_SERVICE_ROLE_KEY);

    if (!isServiceRole) {
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Acesso não autorizado: Token de autenticação ausente.' }),
          { status: 401, headers: corsHeaders }
        );
      }

      // Valida o usuário autenticado no Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user || user.email?.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        return new Response(
          JSON.stringify({
            error: `Acesso negado: Somente o administrador autorizado (${AUTHORIZED_ADMIN_EMAIL}) pode acionar a automação.`
          }),
          { status: 403, headers: corsHeaders }
        );
      }
    }

    // Lê parâmetros da requisição (se houver)
    let body: Record<string, unknown> = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    const isTest = Boolean(body.isTest);

    // 1. Busca configurações salvas na tabela whatsapp_automation_settings
    const { data: dbSettings } = await supabase
      .from('whatsapp_automation_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    const settings = dbSettings || {};

    const providerType = (
      (typeof body.providerType === 'string' && body.providerType.trim()) ||
      settings.provider_type ||
      'greenapi'
    );

    // 2. Resolução das configurações da GREEN-API (Painel, Body ou Variáveis de Ambiente)
    const rawApiUrl = (
      (typeof body.providerEndpoint === 'string' && body.providerEndpoint.trim()) ||
      settings.provider_endpoint ||
      Deno.env.get('GREEN_API_URL') ||
      DEFAULT_GREEN_API_URL
    ).replace(/\/+$/, '');

    const rawInstance = (
      (typeof body.instanceName === 'string' && body.instanceName.trim()) ||
      settings.provider_instance_name ||
      Deno.env.get('GREEN_API_INSTANCE_ID') ||
      DEFAULT_GREEN_API_INSTANCE
    ).trim();

    // Remove qualquer prefixo waInstance caso digitado no formulário
    const idInstance = rawInstance.startsWith('waInstance')
      ? rawInstance.replace(/^waInstance/i, '')
      : rawInstance;

    const apiTokenInstance = (
      (typeof body.providerApiKey === 'string' && body.providerApiKey.trim()) ||
      settings.provider_api_key ||
      settings.provider_token ||
      Deno.env.get('GREEN_API_TOKEN') ||
      DEFAULT_GREEN_API_TOKEN
    ).trim();

    const targetGroupId = (
      (typeof body.targetGroupId === 'string' && body.targetGroupId.trim()) ||
      settings.target_group_id ||
      Deno.env.get('WHATSAPP_GROUP_ID') ||
      DEFAULT_TARGET_GROUP_ID
    ).trim();

    const targetGroupName = (
      settings.target_group_name ||
      'IGEAD-MT • Grupo Oficial da Igreja'
    ).trim();

    // Se não for teste manual, respeita a pausa da automação
    if (!isTest && settings.is_enabled === false) {
      return new Response(JSON.stringify({ message: 'Automação pausada nas configurações.' }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 3. Data de hoje no fuso America/Cuiaba (GMT-4)
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Cuiaba',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const todayCuiaba = formatter.format(new Date());

    // 4. Prevenção de duplicidade (apenas em envios automáticos diários normais; testes podem ser reenviados)
    if (!isTest) {
      const { data: existing } = await supabase
        .from('whatsapp_message_history')
        .select('id')
        .eq('daily_word_date', todayCuiaba)
        .eq('group_id', targetGroupId)
        .eq('status', 'sent')
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ message: `Palavra do dia já enviada hoje (${todayCuiaba}) para o grupo.` }),
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // 5. Busca a Palavra do Dia correspondente à data
    const { data: wordData } = await supabase
      .from('daily_words')
      .select('*')
      .eq('date', todayCuiaba)
      .maybeSingle();

    const verseText = wordData?.verse_text || 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.';
    const reference = wordData?.reference || 'Romanos 8:28 (Almeida JFA)';
    const reflection = wordData?.reflection || 'Mesmo em meio às adversidades da vida, o Senhor guia cada um dos Seus passos. Descanse no amor e na providência de Deus.';

    // 6. Formatação canônica da mensagem para o WhatsApp
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

    // 7. Disparo conforme Provedor (Padrão: GREEN-API)
    if (providerType === 'greenapi') {
      if (!rawApiUrl || !idInstance || !apiTokenInstance) {
        const missingErr = 'Credenciais da GREEN-API incompletas (API URL, ID da Instância ou Token ausente).';
        await supabase.from('whatsapp_message_history').insert({
          id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          daily_word_date: todayCuiaba,
          group_id: targetGroupId,
          group_name: targetGroupName,
          verse_reference: reference,
          verse_text: verseText,
          reflection_text: reflection,
          formatted_message: formattedMessage,
          status: 'failed',
          attempts: 1,
          sent_at: new Date().toISOString(),
          provider_type: 'greenapi',
          provider_message_id: null,
          error_message: missingErr,
          is_simulated: false
        });

        return new Response(JSON.stringify({ success: false, error: missingErr }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Endpoint oficial GREEN-API: ${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}
      const greenApiUrl = `${rawApiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
      const greenApiPayload = {
        chatId: targetGroupId,
        message: formattedMessage
      };

      try {
        const resp = await fetch(greenApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(greenApiPayload)
        });

        const resJson = await resp.json().catch(() => ({}));

        if (resp.ok && (resJson?.idMessage || resJson?.id)) {
          sendResult = {
            success: true,
            providerMessageId: String(resJson.idMessage || resJson.id),
            error: ''
          };
        } else {
          const detail =
            resJson?.message ||
            resJson?.error ||
            (typeof resJson === 'string' ? resJson : `HTTP ${resp.status}`);

          sendResult = {
            success: false,
            providerMessageId: '',
            error: `GREEN-API retornou erro: ${detail}`
          };
        }
      } catch (fetchErr) {
        sendResult = {
          success: false,
          providerMessageId: '',
          error: `Falha de rede ao conectar à GREEN-API (${greenApiUrl}): ${(fetchErr as Error).message}`
        };
      }
    } else if (providerType === 'evolution') {
      // Fallback Evolution API
      const endpoint = rawApiUrl;
      const resp = await fetch(`${endpoint}/message/sendText/${idInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiTokenInstance },
        body: JSON.stringify({
          number: targetGroupId,
          text: formattedMessage,
          options: { delay: 1200, presence: 'composing', linkPreview: false }
        })
      });
      const resJson = await resp.json().catch(() => ({}));
      if (resp.ok && (resJson?.key?.id || resJson?.id)) {
        sendResult = { success: true, providerMessageId: resJson.key?.id || resJson.id, error: '' };
      } else {
        sendResult = { success: false, providerMessageId: '', error: resJson?.message || `HTTP ${resp.status}` };
      }
    } else {
      // Simulação
      sendResult = {
        success: true,
        providerMessageId: `GREEN_SIM_${Date.now()}`,
        error: ''
      };
    }

    // 8. Registra o status detalhado na tabela whatsapp_message_history
    const historyId = `edge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await supabase.from('whatsapp_message_history').insert({
      id: historyId,
      daily_word_date: todayCuiaba,
      group_id: targetGroupId,
      group_name: targetGroupName,
      verse_reference: reference,
      verse_text: verseText,
      reflection_text: reflection,
      formatted_message: formattedMessage,
      status: sendResult.success ? 'sent' : 'failed',
      attempts: 1,
      sent_at: new Date().toISOString(),
      provider_type: providerType,
      provider_message_id: sendResult.providerMessageId || null,
      error_message: sendResult.error || null,
      is_simulated: providerType === 'simulation'
    });

    // 9. Atualiza metadados na tabela whatsapp_automation_settings
    if (sendResult.success) {
      await supabase
        .from('whatsapp_automation_settings')
        .update({
          last_sent_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'default');
    } else {
      await supabase
        .from('whatsapp_automation_settings')
        .update({
          last_error: sendResult.error,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'default');
    }

    return new Response(
      JSON.stringify({
        success: sendResult.success,
        isTest,
        targetGroupId,
        providerType,
        sendResult,
        historyId
      }),
      {
        status: sendResult.success ? 200 : 500,
        headers: corsHeaders
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
