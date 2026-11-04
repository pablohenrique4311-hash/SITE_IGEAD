import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Play,
  Pause,
  Clock,
  Users,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Server,
  Calendar,
  History,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Radio,
  FileCode,
  Sliders,
  Smartphone
} from 'lucide-react';
import {
  WhatsAppAutomationSettings,
  WhatsAppConnectionStatus,
  WhatsAppGroupInfo,
  WhatsAppMessageHistoryItem,
  WhatsAppMessageQueueItem,
  WhatsAppProviderType
} from '../types/whatsappAutomation';
import {
  whatsappAutomationService,
  DEFAULT_SETTINGS
} from '../services/whatsappAutomationService';
import { formatWhatsAppDailyMessage, getDailyWord, DailyWord } from '../services/dailyWordService';
import { WhatsAppProviderFactory } from '../services/whatsapp/WhatsAppProviderFactory';
import { useAuth } from '../contexts/AuthContext';
import { AUTHORIZED_WHATSAPP_ADMIN_EMAIL } from '../constants/authConfig';

interface WhatsAppAutomationPanelProps {
  onBackToHome?: () => void;
}

export const WhatsAppAutomationPanel: React.FC<WhatsAppAutomationPanelProps> = ({ onBackToHome }) => {
  const { user, isWhatsAppAdmin } = useAuth();

  // Configurações
  const [settings, setSettings] = useState<WhatsAppAutomationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Status de Conexão
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnectionStatus>({
    state: 'disconnected',
    isSimulated: true,
    lastCheckedAt: new Date().toISOString()
  });
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  // Grupos
  const [groups, setGroups] = useState<WhatsAppGroupInfo[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(false);

  // Palavra do Dia e Prévia
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string>('');

  // Fila e Histórico
  const [queue, setQueue] = useState<WhatsAppMessageQueueItem[]>([]);
  const [history, setHistory] = useState<WhatsAppMessageHistoryItem[]>([]);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState<boolean>(false);

  // Feedback Visual / Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Abas do Painel
  const [activeTab, setActiveTab] = useState<'settings' | 'history' | 'setup'>('settings');

  // Script SQL para cópia rápida
  const [copiedSql, setCopiedSql] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Carrega dados iniciais
  const loadData = useCallback(async () => {
    if (!isWhatsAppAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [currSettings, conn, word, currQueue, currHistory] = await Promise.all([
        whatsappAutomationService.getSettings(),
        whatsappAutomationService.getConnectionStatus(),
        getDailyWord(),
        whatsappAutomationService.getQueue(),
        whatsappAutomationService.getHistory()
      ]);

      setSettings(currSettings);
      setConnectionStatus(conn);
      setDailyWord(word);
      setPreviewMessage(formatWhatsAppDailyMessage(word));
      setQueue(currQueue);
      setHistory(currHistory);

      // Carrega grupos se disponível
      if (conn.state === 'connected' || conn.state === 'simulated') {
        const detectedGroups = await whatsappAutomationService.getGroups();
        setGroups(detectedGroups);
      }
    } catch (err) {
      console.warn('[WhatsApp Panel] Erro ao carregar dados:', err);
      showToast('Falha ao sincronizar dados da automação.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Salva configurações
  const handleSaveSettings = async (override?: Partial<WhatsAppAutomationSettings>) => {
    setIsSaving(true);
    const updated = { ...settings, ...(override || {}), updatedAt: new Date().toISOString() };
    try {
      await whatsappAutomationService.saveSettings(updated);
      setSettings(updated);
      showToast('Configurações salvas com sucesso!');
    } catch {
      showToast('Erro ao salvar configurações.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Alterna ativação / pausa
  const handleToggleAutomation = async () => {
    const newState = !settings.isEnabled;
    await handleSaveSettings({ isEnabled: newState });
    showToast(newState ? 'Automação ativada com sucesso!' : 'Automação pausada imediatamente.', newState ? 'success' : 'info');
  };

  // Testa conexão do WhatsApp
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await whatsappAutomationService.testConnection();
      setConnectionStatus(result.status);

      if (result.success) {
        showToast(result.message, 'success');
        const detected = await whatsappAutomationService.getGroups();
        setGroups(detected);
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      showToast(`Falha no teste: ${(err as Error).message}`, 'error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Busca grupos no WhatsApp Business
  const handleFetchGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const list = await whatsappAutomationService.getGroups();
      setGroups(list);
      showToast(`${list.length} grupo(s) detectado(s) no WhatsApp Business.`);
    } catch (err) {
      showToast(`Falha ao buscar grupos: ${(err as Error).message}`, 'error');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Disparo manual de mensagem de teste
  const handleSendTestMessage = async () => {
    if (!settings.targetGroupId) {
      showToast('Por favor, informe ou selecione o grupo de destino.', 'error');
      return;
    }

    setIsSendingTest(true);
    try {
      const result = await whatsappAutomationService.sendTestMessage();
      if (result.success) {
        showToast(
          result.isSimulated
            ? 'Mensagem simulada registrada com sucesso no histórico de testes!'
            : 'Palavra do Dia enviada com sucesso para o grupo do WhatsApp!',
          'success'
        );
        const [updatedHistory, updatedQueue] = await Promise.all([
          whatsappAutomationService.getHistory(),
          whatsappAutomationService.getQueue()
        ]);
        setHistory(updatedHistory);
        setQueue(updatedQueue);
      } else {
        showToast(result.error || 'Falha ao enviar mensagem de teste.', 'error');
      }
    } catch (err) {
      showToast(`Erro no envio: ${(err as Error).message}`, 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Processa fila manualmente
  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    try {
      const res = await whatsappAutomationService.processQueue();
      const [updatedHistory, updatedQueue] = await Promise.all([
        whatsappAutomationService.getHistory(),
        whatsappAutomationService.getQueue()
      ]);
      setHistory(updatedHistory);
      setQueue(updatedQueue);

      if (res.successCount > 0) {
        showToast(`${res.successCount} mensagem(ns) enviada(s) da fila com sucesso!`);
      } else if (res.errors.length > 0) {
        showToast(res.errors[0], 'error');
      } else {
        showToast('Nenhuma mensagem pendente na fila.');
      }
    } catch (err) {
      showToast(`Erro ao processar fila: ${(err as Error).message}`, 'error');
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const nextRun = whatsappAutomationService.calculateNextRun(settings.scheduledTime);

  const sqlCode = `-- SQL para Supabase (Execute no SQL Editor do Supabase)
-- Cria as tabelas da automação com RLS e índices
CREATE TABLE IF NOT EXISTS public.whatsapp_automation_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  scheduled_time TEXT NOT NULL DEFAULT '07:00',
  timezone TEXT NOT NULL DEFAULT 'America/Cuiaba',
  target_group_id TEXT NOT NULL DEFAULT '120363361678530962@g.us',
  target_group_name TEXT NOT NULL DEFAULT 'IGEAD-MT • Grupo Oficial da Igreja',
  provider_type TEXT NOT NULL DEFAULT 'evolution',
  provider_endpoint TEXT,
  provider_instance_name TEXT,
  provider_api_key TEXT,
  provider_token TEXT,
  last_sent_at TIMESTAMPTZ,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.whatsapp_message_queue (
  id TEXT PRIMARY KEY,
  daily_word_date DATE NOT NULL,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  last_error TEXT,
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.whatsapp_message_history (
  id TEXT PRIMARY KEY,
  daily_word_date DATE NOT NULL,
  group_id TEXT NOT NULL,
  group_name TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  reflection_text TEXT,
  formatted_message TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 1,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  provider_type TEXT NOT NULL,
  provider_message_id TEXT,
  error_message TEXT,
  is_simulated BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.whatsapp_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_history ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS ESTRITAS: Acesso exclusivo ao e-mail ${AUTHORIZED_WHATSAPP_ADMIN_EMAIL}
CREATE POLICY "Acesso restrito ao administrador whatsapp_automation_settings"
  ON public.whatsapp_automation_settings FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = '${AUTHORIZED_WHATSAPP_ADMIN_EMAIL}')
  WITH CHECK ((auth.jwt() ->> 'email') = '${AUTHORIZED_WHATSAPP_ADMIN_EMAIL}');

CREATE POLICY "Acesso restrito ao administrador whatsapp_message_queue"
  ON public.whatsapp_message_queue FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = '${AUTHORIZED_WHATSAPP_ADMIN_EMAIL}')
  WITH CHECK ((auth.jwt() ->> 'email') = '${AUTHORIZED_WHATSAPP_ADMIN_EMAIL}');

CREATE POLICY "Acesso restrito ao administrador whatsapp_message_history"
  ON public.whatsapp_message_history FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = '${AUTHORIZED_WHATSAPP_ADMIN_EMAIL}')
  WITH CHECK ((auth.jwt() ->> 'email') = '${AUTHORIZED_WHATSAPP_ADMIN_EMAIL}');`;

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(sqlCode);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
      showToast('Script SQL copiado para a área de transferência!');
    } catch {
      // Fallback
    }
  };

  const allProviders = WhatsAppProviderFactory.getAllProviders();

  // Fallback de segurança: Caso o usuário não seja o administrador autorizado
  if (!isWhatsAppAdmin) {
    return (
      <div className="w-full max-w-3xl mx-auto py-16 px-4 sm:px-6 text-center animate-in fade-in duration-200">
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-red-500/30 shadow-lg space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Acesso Restrito ao Administrador
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-lg mx-auto">
              O painel de Automação do WhatsApp da Igreja (Palavra do Dia) é de acesso exclusivo do administrador autorizado (<strong>{AUTHORIZED_WHATSAPP_ADMIN_EMAIL}</strong>).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-500 dark:text-zinc-400">
            Usuário atual conectado: <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{user?.email || 'Não autenticado'}</span>
          </div>

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
            >
              Voltar para a Página Inicial
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      {/* Toast flutuante */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-red-600 text-white'
              : toastMessage.type === 'info'
              ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* =========================================================================
          CABEÇALHO PRINCIPAL DO PAINEL DE AUTOMAÇÃO
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Painel Administrativo Pastoral</span>
            </div>

            {settings.providerType === 'simulation' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Ambiente de Simulação
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Provedor em Produção
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50 tracking-tight">
            Automação WhatsApp — Palavra do Dia
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
            Publicação diária programada da Palavra e Alimento Diário diretamente no grupo de WhatsApp existente da IGEAD-MT via WhatsApp Business.
          </p>
        </div>

        {/* Botão de Pausa / Retomada Imediata */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleAutomation}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
              settings.isEnabled
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {settings.isEnabled ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pausar Automação</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Ativar Automação</span>
              </>
            )}
          </button>

          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Voltar ao Site
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          CARDS DE RESUMO DE STATUS E AGENDAMENTO
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Status da Automação */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-2">
            <span>Status do Agendador</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                settings.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
              }`}
            ></span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {settings.isEnabled ? 'Ativo & Operante' : 'Pausado'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Diariamente às <strong className="text-zinc-700 dark:text-zinc-300">{settings.scheduledTime}</strong> (Cuiabá)
          </p>
        </div>

        {/* Card 2: Status do WhatsApp */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-2">
            <span>Conexão WhatsApp</span>
            <Smartphone className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus.state === 'connected' || connectionStatus.state === 'simulated'
                  ? 'bg-emerald-500'
                  : connectionStatus.state === 'connecting'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-red-500'
              }`}
            ></span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {connectionStatus.state === 'connected'
                ? 'Conectado'
                : connectionStatus.state === 'simulated'
                ? 'Simulado (Ativo)'
                : connectionStatus.state === 'connecting'
                ? 'Conectando...'
                : 'Desconectado'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
            {connectionStatus.phoneNumber || 'Número não detectado'}
          </p>
        </div>

        {/* Card 3: Grupo de Destino */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-2">
            <span>Grupo Existente</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate" title={settings.targetGroupName}>
            {settings.targetGroupName || 'Nenhum selecionado'}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate font-mono">
            {settings.targetGroupId || 'Sem JID configurado'}
          </p>
        </div>

        {/* Card 4: Próximo Disparo */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-2">
            <span>Próximo Disparo</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {nextRun.formattedText}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            {settings.lastSentAt
              ? `Último envio: ${new Date(settings.lastSentAt).toLocaleDateString('pt-BR')} às ${new Date(settings.lastSentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Nenhum envio registrado'}
          </p>
        </div>
      </div>

      {/* Alerta de Erro caso exista */}
      {settings.lastError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-xs text-red-800 dark:text-red-300">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm mb-0.5">Última falha registrada:</div>
            <p className="leading-relaxed">{settings.lastError}</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          NAVEGAÇÃO POR ABAS DO PAINEL
          ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configuração & Testes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico & Fila ({history.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'setup'
              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Script SQL & Arquitetura</span>
        </button>
      </div>

      {/* =========================================================================
          ABA 1: CONFIGURAÇÃO, PROVEDORES, PRÉVIA E TESTES
          ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda: Configurações do Provedor e Agendamento (7 colunas) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Bloco 1: Provedor de Integração WhatsApp */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    Provedor de Integração WhatsApp
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>Testar Conexão</span>
                </button>
              </div>

              {/* Seletor de Tipo de Provedor */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Selecione o Provedor Ativo:
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {allProviders.map((prov) => {
                    const isSelected = settings.providerType === prov.id;
                    return (
                      <div
                        key={prov.id}
                        onClick={() => setSettings({ ...settings, providerType: prov.id })}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/35 ring-1 ring-amber-500/20'
                            : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-50">
                            {prov.name}
                          </span>
                          {prov.isSimulation ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">
                              Simulação
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                              Produção
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {prov.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Campos de Credenciais para Provedores Reais */}
              {settings.providerType !== 'simulation' && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3 pt-3">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      Credenciais do Gateway (
                      {settings.providerType === 'greenapi'
                        ? 'GREEN-API (Gratuito / Developer)'
                        : settings.providerType === 'evolution'
                        ? 'Evolution API'
                        : 'Z-API'}
                      )
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      {settings.providerType === 'greenapi' ? 'API URL da GREEN-API' : 'Endpoint URL da API'}
                    </label>
                    <input
                      type="url"
                      value={settings.providerEndpoint || ''}
                      onChange={(e) => setSettings({ ...settings, providerEndpoint: e.target.value })}
                      placeholder={
                        settings.providerType === 'greenapi'
                          ? 'https://7107.api.greenapi.com'
                          : settings.providerType === 'evolution'
                          ? 'https://sua-evolution-api.com'
                          : 'https://api.z-api.io'
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    {settings.providerType === 'greenapi' && (
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                        Exemplo oficial da conta Developer: <code>https://7107.api.greenapi.com</code>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        {settings.providerType === 'greenapi'
                          ? 'ID da Instância (idInstance)'
                          : 'Nome da Instância (Instance Name / ID)'}
                      </label>
                      <input
                        type="text"
                        value={settings.providerInstanceName || ''}
                        onChange={(e) => setSettings({ ...settings, providerInstanceName: e.target.value })}
                        placeholder={settings.providerType === 'greenapi' ? '710722790899' : 'igead_oficial'}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        {settings.providerType === 'greenapi'
                          ? 'Token da Instância (apiTokenInstance)'
                          : settings.providerType === 'evolution'
                          ? 'Chave de API (apikey)'
                          : 'Token da Instância'}
                      </label>
                      <input
                        type="password"
                        value={settings.providerApiKey || settings.providerToken || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            providerApiKey: e.target.value,
                            providerToken: e.target.value
                          })
                        }
                        placeholder={
                          settings.providerType === 'greenapi'
                            ? 'dcdbfe8720b844619359f2ecf8138491768d407aace44835b8'
                            : '••••••••••••••••'
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bloco 2: Agendamento e Grupo de Destino */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Agendamento Diário & Grupo de Destino
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Horário da Publicação (Fuso Cuiabá - MT)
                  </label>
                  <input
                    type="time"
                    value={settings.scheduledTime}
                    onChange={(e) => setSettings({ ...settings, scheduledTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">
                    Fuso: America/Cuiaba (GMT-4). Disparo 1x ao dia.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Status da Automação
                  </label>
                  <div className="flex items-center gap-2.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, isEnabled: !settings.isEnabled })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.isEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {settings.isEnabled ? 'Ativada (Enviando diariamente)' : 'Pausada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seleção do Grupo de Destino */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Grupo Existente do WhatsApp da Igreja:
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchGroups}
                    disabled={isLoadingGroups}
                    className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingGroups ? 'animate-spin' : ''}`} />
                    <span>Atualizar Grupos Detectados</span>
                  </button>
                </div>

                {/* Dropdown de Grupos Detectados */}
                {groups.length > 0 && (
                  <select
                    value={settings.targetGroupId}
                    onChange={(e) => {
                      const selected = groups.find((g) => g.id === e.target.value);
                      if (selected) {
                        setSettings({
                          ...settings,
                          targetGroupId: selected.id,
                          targetGroupName: selected.name
                        });
                      } else {
                        setSettings({ ...settings, targetGroupId: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} {g.participantsCount ? `(${g.participantsCount} participantes)` : ''}
                      </option>
                    ))}
                  </select>
                )}

                {/* Edição manual de Nome e JID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">
                      Nome Amigável do Grupo
                    </label>
                    <input
                      type="text"
                      value={settings.targetGroupName}
                      onChange={(e) => setSettings({ ...settings, targetGroupName: e.target.value })}
                      placeholder="Ex: IGEAD-MT • Grupo Oficial"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">
                      Identificador do Grupo (JID / ID WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={settings.targetGroupId}
                      onChange={(e) => setSettings({ ...settings, targetGroupId: e.target.value })}
                      placeholder="Ex: 120363361678530962@g.us"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação para Salvar e Testar Envio */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendTestMessage}
                    disabled={isSendingTest}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-pulse' : ''}`} />
                    <span>{isSendingTest ? 'Enviando...' : 'Disparar Teste Imediato'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Prévia Visual Realista da Mensagem no WhatsApp (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    Prévia da Mensagem no WhatsApp
                  </h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  Formato Oficial
                </span>
              </div>

              {/* Simulação Visual de Chat do WhatsApp */}
              <div className="rounded-2xl bg-[#e5ddd5] dark:bg-[#0b141a] p-4 sm:p-5 border border-zinc-300 dark:border-zinc-800 shadow-inner overflow-hidden">
                {/* Header do Chat */}
                <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-zinc-300/80 dark:border-zinc-800/80">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    IG
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {settings.targetGroupName || 'Grupo IGEAD-MT'}
                    </div>
                    <div className="text-[10px] text-zinc-600 dark:text-zinc-400">
                      WhatsApp Business • Online
                    </div>
                  </div>
                </div>

                {/* Balão de Mensagem */}
                <div className="bg-white dark:bg-[#1f2c34] text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-xs p-4 shadow-sm text-xs leading-relaxed space-y-3 font-sans max-w-full">
                  <div className="font-bold text-amber-700 dark:text-amber-400">
                    🙏 PAZ DO SENHOR!
                  </div>

                  <div className="font-bold text-zinc-900 dark:text-zinc-100">
                    📖 PALAVRA DO DIA — IGEAD-MT
                  </div>

                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-0.5">
                      *VERSÍCULO:*
                    </span>
                    <blockquote className="italic font-serif-reading text-zinc-800 dark:text-zinc-200 pl-2 border-l-2 border-amber-500/50">
                      &ldquo;{dailyWord?.verseText}&rdquo;
                    </blockquote>
                  </div>

                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-0.5">
                      *REFERÊNCIA:*
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {dailyWord?.reference} ({dailyWord?.translation || 'Almeida JFA'})
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-0.5">
                      *REFLEXÃO:*
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {dailyWord?.reflection}
                    </p>
                  </div>

                  <div className="text-zinc-700 dark:text-zinc-300 pt-1 border-t border-zinc-200/80 dark:border-zinc-700/60">
                    🙌 Que Deus abençoe seu dia e fortaleça sua fé!
                  </div>

                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    IGEAD-MT — Igreja Evangélica Assembleia de Deus
                  </div>

                  <div className="flex justify-end text-[9px] text-zinc-400 pt-1">
                    07:00 • ✓✓
                  </div>
                </div>
              </div>

              {/* Informação sobre prevenção de duplicidade */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Garantias da Automação</span>
                </div>
                <ul className="text-[11px] space-y-1 list-disc list-inside text-zinc-700 dark:text-zinc-300">
                  <li><strong>Zero Duplicidade:</strong> O sistema checa se a data de hoje já foi enviada com sucesso no grupo antes de autorizar novo disparo.</li>
                  <li><strong>Mesmo Conteúdo:</strong> O texto enviado consome exatamente o mesmo versículo e reflexão exibidos no site.</li>
                  <li><strong>Controle de Falhas:</strong> Registra tentativas e mensagens de erro do provedor caso o WhatsApp caia.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 2: HISTÓRICO DE PUBLICAÇÕES E FILA
          ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Histórico de Publicações no Grupo</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Registros auditáveis de cada Palavra do Dia enviada ou tentada.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleProcessQueue}
                  disabled={isProcessingQueue}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessingQueue ? 'animate-spin' : ''}`} />
                  <span>Processar Fila Pendente</span>
                </button>
              </div>
            </div>

            {/* Fila de Mensagens Pendentes (se houver) */}
            {queue.filter((q) => q.status === 'pending').length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mensagens Pendentes na Fila ({queue.filter((q) => q.status === 'pending').length})</span>
                </div>
                {queue
                  .filter((q) => q.status === 'pending')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-amber-500/20 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          Data: {item.dailyWordDate} • {item.groupName}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Programado para: {new Date(item.scheduledFor).toLocaleString('pt-BR')} (Tentativa {item.attempts}/{item.maxAttempts})
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        Pendente
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Tabela / Cards de Histórico */}
            {history.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 text-xs">
                Nenhuma publicação registrada até o momento. Utilize o botão &ldquo;Disparar Teste Imediato&rdquo; para realizar o primeiro envio.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/90 dark:border-zinc-800 space-y-2.5 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'sent'
                              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-800 dark:text-red-300 border border-red-500/30'
                          }`}
                        >
                          {item.status === 'sent' ? 'Enviado com Sucesso' : 'Falha no Envio'}
                        </span>

                        {item.isSimulated && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            Simulado
                          </span>
                        )}

                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                          {item.verseReference}
                        </span>
                      </div>

                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {new Date(item.sentAt).toLocaleString('pt-BR')} (Fuso Cuiabá)
                      </div>
                    </div>

                    <div className="text-xs text-zinc-700 dark:text-zinc-300">
                      <strong>Grupo de Destino:</strong> {item.groupName} <span className="font-mono text-[11px] text-zinc-400">({item.groupId})</span>
                    </div>

                    <blockquote className="text-xs italic text-zinc-600 dark:text-zinc-300 border-l-2 border-amber-500/40 pl-2">
                      &ldquo;{item.verseText}&rdquo;
                    </blockquote>

                    {item.errorMessage && (
                      <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-[11px] text-red-700 dark:text-red-300">
                        <strong>Motivo do erro:</strong> {item.errorMessage}
                      </div>
                    )}

                    {item.providerMessageId && (
                      <div className="text-[10px] text-zinc-400 font-mono">
                        ID Provedor: {item.providerMessageId} • Provedor: {item.providerType.toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 3: GUIA TÉCNICO, SQL E ARQUITETURA
          ========================================================================= */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Estrutura do Banco de Dados no Supabase</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Copie e execute o script SQL abaixo no <strong>SQL Editor</strong> do painel do Supabase para provisionar as tabelas oficiais.
                </p>
              </div>

              <button
                type="button"
                onClick={copySql}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto max-h-96">
              <code>{sqlCode}</code>
            </pre>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Instruções para Ativação Definitiva</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                <li>
                  <strong>Tabelas Supabase:</strong> Execute o script SQL acima no <em>SQL Editor</em> do seu projeto Supabase (<code>https://qncplvrzpcbvwptprsjg.supabase.co</code>).
                </li>
                <li>
                  <strong>Escolha do Fornecedor:</strong> Para grupos de WhatsApp existentes (9 a 50 membros), recomendamos utilizar a <strong>Evolution API</strong> (Docker ou hospedada na VPS/Easypanel da igreja) ou a <strong>Z-API</strong>. A API oficial do Meta Cloud API não permite envio de mensagens livres para grupos existentes sem aprovações empresariais de co-presença.
                </li>
                <li>
                  <strong>Conectar WhatsApp Business:</strong> No provedor escolhido, conecte a instância lendo o QR Code pelo WhatsApp Business oficial da igreja. O número deve ser participante do grupo e ter permissão de envio.
                </li>
                <li>
                  <strong>Agendamento Automático:</strong> A automação pode ser disparada automaticamente através da Supabase Edge Function (<code>whatsapp-daily-word</code>) com um cron job (<code>pg_cron</code>) programado para as 07:00 (Cuiabá / GMT-4) = 11:00 UTC.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
