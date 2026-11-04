import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sparkles,
  X,
  Loader2
} from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  getPushSubscription,
  savePushSubscriptionToSupabase,
  triggerWelcomeNotification,
  dispararAlertaLive,
  isNotificationSupported
} from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

interface NotificationBannerProps {
  className?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      const dismissedUntil = window.localStorage.getItem('igead_notif_banner_dismissed');
      if (dismissedUntil) {
        return Number(dismissedUntil) > Date.now();
      }
    }
    return false;
  });

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  if (!isNotificationSupported()) {
    return null;
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    setStatusFeedback(null);

    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission === 'granted') {
        setStatusFeedback('Notificações ativadas com sucesso!');
        // 1. Tenta coletar subscription e salvar no Supabase
        const sub = await getPushSubscription();
        if (user) {
          await savePushSubscriptionToSupabase(sub, user.id);
        }
        // 2. Dispara notificação imediata de boas-vindas
        await triggerWelcomeNotification();
      } else if (newPermission === 'denied') {
        setStatusFeedback('Permissão negada. Você pode reativar nas configurações do navegador.');
      }
    } catch (err) {
      console.warn('[Notificações] Falha ao ativar:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestWelcome = async () => {
    setStatusFeedback('Disparando notificação de boas-vindas...');
    await triggerWelcomeNotification();
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleTestLiveAlert = async () => {
    setStatusFeedback('Disparando alerta de Culto Ao Vivo...');
    await dispararAlertaLive({
      titulo: 'Culto da Família • Ao Vivo!',
      link: 'https://www.youtube.com/channel/UCwWs_spTAEZaojGQDQSYQ-A'
    });
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Oculta por 7 dias
    window.localStorage.setItem(
      'igead_notif_banner_dismissed',
      String(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
  };

  // Se o usuário já aceitou as notificações, exibe barra de controle compacta com botões de teste
  if (permission === 'granted') {
    return (
      <div
        className={`rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-all ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Notificações da IGEAD-MT ativas</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Você receberá versículos diários e avisos de cultos transmitidos ao vivo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleTestWelcome}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
            title="Enviar notificação de teste agora"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Testar Alerta</span>
          </button>

          <button
            type="button"
            onClick={handleTestLiveAlert}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold text-[11px] transition-colors cursor-pointer"
            title="Simular notificação de transmissão de culto ao vivo"
          >
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>Simular Live</span>
          </button>
        </div>
      </div>
    );
  }

  // Se o usuário bloqueou nas configurações do navegador
  if (permission === 'denied') {
    return (
      <div
        className={`rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-[11px]">
            Notificações bloqueadas neste navegador. Para receber versículos diários e avisos de cultos, autorize nas configurações do site ou toque no botão ao lado.
          </span>
        </div>
        <button
          type="button"
          onClick={handleRequestPermission}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/25 font-semibold text-xs cursor-pointer transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Se o usuário dispensou recentemente
  if (isDismissed) {
    return null;
  }

  // Banner padrão de convite amigável
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-600/15 border border-amber-500/25 p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Dispensar aviso por enquanto"
        title="Dispensar por enquanto"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-6 sm:pr-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="w-5 h-5 fill-current" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Conexão & Palavra</span>
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              Deseja receber o Versículo do Dia e avisos de Cultos Ao Vivo?
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              Ative as notificações para receber diariamente a Palavra de Deus e nunca perder o início dos nossos cultos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            disabled={isRequesting}
            onClick={handleRequestPermission}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isRequesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Solicitando...</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Ativar Notificações</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusFeedback && (
        <div className="mt-3 text-[11px] text-amber-800 dark:text-amber-300 font-medium animate-in fade-in">
          {statusFeedback}
        </div>
      )}
    </div>
  );
};
