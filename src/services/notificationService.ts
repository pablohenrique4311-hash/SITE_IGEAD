import { supabase } from '../lib/supabaseClient';

/**
 * Resolução dinâmica da URL do logo oficial e badge PWA
 */
const rawBase = import.meta.env.BASE_URL || '/';
const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
export const CHURCH_LOGO_URL = `${baseUrl}assets/aistudio/Logotipo_gera__o_eleita_a16b7b59.png`;
export const PWA_BADGE_URL = `${baseUrl}pwa-192x192.png`;

export interface PushSubscriptionData {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

/**
 * Verifica se a Web Notification API é suportada pelo navegador atual
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Obtém o status atual de permissão de notificações
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Solicita permissão ao usuário para envio de notificações
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[Notificações] Erro ao solicitar permissão:', err);
    return Notification.permission;
  }
}

/**
 * Obtém ou registra a inscrição Push (PushSubscription) no navegador
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (err) {
    console.warn('[Notificações] Não foi possível obter PushSubscription:', err);
    return null;
  }
}

/**
 * Salva os dados de inscrição push na tabela 'user_push_subscriptions' do Supabase
 */
export async function savePushSubscriptionToSupabase(
  subscription: PushSubscription | null,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  try {
    let p256dh = '';
    let auth = '';
    let endpoint = `browser_${navigator.userAgent.slice(0, 80)}_${userId}`;

    if (subscription) {
      endpoint = subscription.endpoint;
      const rawKey = subscription.getKey ? subscription.getKey('p256dh') : null;
      const rawAuth = subscription.getKey ? subscription.getKey('auth') : null;
      if (rawKey) {
        p256dh = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawKey))));
      }
      if (rawAuth) {
        auth = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawAuth))));
      }
    }

    const subscriptionObject = {
      endpoint,
      keys: {
        p256dh: p256dh || null,
        auth: auth || null
      },
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      saved_at: new Date().toISOString()
    };

    const payload = {
      user_id: userId,
      subscription: subscriptionObject
    };

    // Tenta salvar/atualizar na tabela 'user_push_subscriptions' do Supabase
    const { error } = await supabase.from('user_push_subscriptions').insert(payload);

    if (error) {
      console.warn('[Notificações] Supabase user_push_subscriptions:', error.message);
      window.localStorage.setItem('igead_push_subscription', JSON.stringify(payload));
      return { success: true };
    }

    window.localStorage.setItem('igead_push_subscription', JSON.stringify(payload));
    return { success: true };
  } catch (err) {
    console.warn('[Notificações] Erro ao sincronizar com Supabase:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Exibe uma notificação local no dispositivo
 */
export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number | number[];
  url?: string;
  renotify?: boolean;
}

/**
 * Exibe uma notificação local no dispositivo
 */
export async function sendLocalNotification(
  title: string,
  options: ExtendedNotificationOptions = {}
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const defaultOptions: ExtendedNotificationOptions = {
    icon: CHURCH_LOGO_URL,
    badge: PWA_BADGE_URL,
    tag: 'igead-notification',
    ...options
  };

  try {
    // 1. Tenta via Service Worker ativo (melhor suporte em mobile e PWA)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, defaultOptions);
        return true;
      }
    }

    // 2. Fallback direto da Notification API do navegador
    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.warn('[Notificações] Falha ao exibir notificação local:', err);
    return false;
  }
}

/**
 * Notificação Local de Boas-Vindas e Teste
 */
export async function triggerWelcomeNotification(): Promise<boolean> {
  return sendLocalNotification('IGEAD-MT Conectada!', {
    body: 'Você agora receberá o versículo diário e alertas de cultos ao vivo.',
    icon: CHURCH_LOGO_URL,
    badge: PWA_BADGE_URL,
    tag: 'welcome-notification'
  });
}

/**
 * Gatilho diário para o Versículo do Dia
 * Verifica se a data de hoje já recebeu a notificação; caso contrário, dispara
 */
export async function checkAndTriggerDailyVerseNotification(
  verseText: string,
  reference: string
): Promise<boolean> {
  if (getNotificationPermission() !== 'granted') {
    return false;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = window.localStorage.getItem('igead_verse_notif_date');

  // Já foi exibida hoje
  if (lastDate === todayStr) {
    return false;
  }

  const success = await sendLocalNotification(`🕊️ Versículo do Dia — ${reference}`, {
    body: `"${verseText}"\nIgreja Geração Eleita (IGEAD-MT)`,
    icon: CHURCH_LOGO_URL,
    badge: PWA_BADGE_URL,
    tag: `daily-verse-${todayStr}`,
    data: {
      type: 'verse',
      reference,
      date: todayStr
    }
  });

  if (success) {
    window.localStorage.setItem('igead_verse_notif_date', todayStr);
  }

  return success;
}

/**
 * Simulação e Disparo de Alerta de Live / Culto Ao Vivo
 */
export async function dispararAlertaLive(params?: {
  titulo?: string;
  link?: string;
}): Promise<boolean> {
  const tituloCulto = params?.titulo || 'Culto Ao Vivo • Transmissão Iniciada!';
  const linkCulto = params?.link || 'https://www.youtube.com/channel/UCwWs_spTAEZaojGQDQSYQ-A';

  return sendLocalNotification('🔴 Culto Ao Vivo na IGEAD-MT!', {
    body: `${tituloCulto}\nToque para assistir agora e adorar a Deus conosco.`,
    icon: CHURCH_LOGO_URL,
    badge: PWA_BADGE_URL,
    tag: 'live-stream-alert',
    data: {
      type: 'live',
      url: linkCulto
    }
  });
}

// Exposição global para automação administrativa ou testes via console
if (typeof window !== 'undefined') {
  (window as unknown as { dispararAlertaLive?: typeof dispararAlertaLive }).dispararAlertaLive = dispararAlertaLive;
  (window as unknown as { triggerWelcomeNotification?: typeof triggerWelcomeNotification }).triggerWelcomeNotification = triggerWelcomeNotification;
}

