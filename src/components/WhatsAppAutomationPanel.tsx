import { WhatsAppConnectionSettings } from './whatsapp/WhatsAppConnectionSettings';
import { WhatsAppScheduleSettings } from './whatsapp/WhatsAppScheduleSettings';
import { WhatsAppMessagePreview } from './whatsapp/WhatsAppMessagePreview';
import { WhatsAppHistory } from './whatsapp/WhatsAppHistory';
import React, { useState } from 'react';
import { useWhatsAppAutomationData } from '../hooks/useWhatsAppAutomationData';
import { MessageCircle, Play, Pause, Clock, Users, CheckCircle2, AlertCircle, ShieldAlert, Calendar, History, FileCode, Sliders, Smartphone } from 'lucide-react';
import type { WhatsAppAutomationSettings } from '../types/whatsappAutomation';
import { whatsappAutomationService } from '../services/whatsappAutomationService';
import { useAuth } from '../contexts/AuthContext';

interface WhatsAppAutomationPanelProps {
  onBackToHome?: () => void;
}

export const WhatsAppAutomationPanel: React.FC<WhatsAppAutomationPanelProps> = ({ onBackToHome }) => {
  const { user, isWhatsAppAdmin } = useAuth();

  const { settings, setSettings, savedSettings, setSavedSettings, isLoading, loadError,
    connectionStatus, setConnectionStatus, groups, setGroups, dailyWord,
    queue, setQueue, history, setHistory } = useWhatsAppAutomationData(isWhatsAppAdmin);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Feedback Visual / Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Abas do Painel
  const [activeTab, setActiveTab] = useState<'settings' | 'history' | 'setup'>('settings');


  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Salva configurações
  const handleSaveSettings = async (override?: Partial<WhatsAppAutomationSettings>) => {
    setIsSaving(true);
    const updated = { ...settings, ...(override || {}), updatedAt: new Date().toISOString() };
    try {
      const result = await whatsappAutomationService.saveSettings(updated);
      if (!result.success) throw new Error();
      setSettings(updated);
      setSavedSettings(updated);
      showToast('Configurações salvas no servidor.');
      return true;
    } catch {
      showToast('Erro ao salvar configurações. A alteração não foi confirmada.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Alterna ativação / pausa
  const handleToggleAutomation = async () => {
    const newState = !savedSettings?.isEnabled;
    const saved = await handleSaveSettings({ isEnabled: newState });
    if (!saved) return;
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
      showToast(`${list.length} grupo(s) configurado(s) no WhatsApp Business.`);
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
            : 'Mensagem aceita pelo provedor. Consulte o histórico.',
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

  const hasUnsavedChanges = !!savedSettings && JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const nextRun = whatsappAutomationService.calculateNextRun(savedSettings?.scheduledTime || '07:00');


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
              O painel de Automação do WhatsApp da Igreja (Palavra do Dia) é de acesso exclusivo do administrador autorizado.
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
      {loadError && <p role="alert" className="p-4 rounded-xl bg-red-50 text-red-700">{loadError}</p>}
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
            disabled={isSaving || isLoading || !savedSettings}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
              savedSettings?.isEnabled
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {savedSettings?.isEnabled ? (
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
                savedSettings?.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
              }`}
            ></span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {!savedSettings ? 'Não confirmado' : savedSettings.isEnabled ? 'Ativação salva' : 'Pausado'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Diariamente às <strong className="text-zinc-700 dark:text-zinc-300">{savedSettings?.scheduledTime}</strong> (Cuiabá)
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
          <span>Configuração da conexão</span>
        </button>
      </div>

      {/* =========================================================================
          ABA 1: CONFIGURAÇÃO, PROVEDORES, PRÉVIA E TESTES
          ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda: Configurações do Provedor e Agendamento (7 colunas) */}
          <div className="lg:col-span-7 space-y-6">
            <WhatsAppConnectionSettings providerType={settings.providerType}
              onChange={(providerType) => setSettings({ ...settings, providerType })}
              onTest={handleTestConnection} isTesting={isTestingConnection} />

            <WhatsAppScheduleSettings settings={settings} setSettings={setSettings} savedSettings={savedSettings}
              groups={groups} isLoadingGroups={isLoadingGroups} handleFetchGroups={handleFetchGroups}
              isSaving={isSaving} isLoading={isLoading} hasUnsavedChanges={hasUnsavedChanges}
              handleSaveSettings={handleSaveSettings} handleSendTestMessage={handleSendTestMessage} isSendingTest={isSendingTest} />
          </div>

          <WhatsAppMessagePreview settings={settings} dailyWord={dailyWord} />
        </div>
      )}

      {/* =========================================================================
          ABA 2: HISTÓRICO DE PUBLICAÇÕES E FILA
          ========================================================================= */}
      {activeTab === 'history' && <WhatsAppHistory queue={queue} history={history}
        isProcessingQueue={isProcessingQueue} handleProcessQueue={handleProcessQueue} />}


      {/* =========================================================================
          ABA 3: GUIA TÉCNICO, SQL E ARQUITETURA
          ========================================================================= */}
      {activeTab === 'setup' && (
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          A equipe responsável deve concluir a configuração do servidor antes de ativar os envios.
          Use o teste de conexão para verificar a disponibilidade.
        </div>
      )}
    </div>
  );
};
