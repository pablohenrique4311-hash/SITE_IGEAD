import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, whatsappAutomationService } from '../services/whatsappAutomationService';
import { getDailyWord, type DailyWord } from '../services/dailyWordService';
import type { WhatsAppAutomationSettings, WhatsAppConnectionStatus, WhatsAppGroupInfo,
  WhatsAppMessageHistoryItem, WhatsAppMessageQueueItem } from '../types/whatsappAutomation';

export function useWhatsAppAutomationData(isAdmin: boolean) {
  const [settings, setSettings] = useState<WhatsAppAutomationSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<WhatsAppAutomationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<WhatsAppConnectionStatus>({
    state: 'disconnected', isSimulated: false, lastCheckedAt: '',
  });
  const [groups, setGroups] = useState<WhatsAppGroupInfo[]>([]);
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [queue, setQueue] = useState<WhatsAppMessageQueueItem[]>([]);
  const [history, setHistory] = useState<WhatsAppMessageHistoryItem[]>([]);

  useEffect(() => {
    let active = true;
    if (!isAdmin) { setIsLoading(false); return; }
    setIsLoading(true);
    setLoadError('');
    async function load() {
      try {
        const [loadedSettings, status, word, loadedQueue, loadedHistory] = await Promise.all([
          whatsappAutomationService.getSettings(), whatsappAutomationService.getConnectionStatus(),
          getDailyWord(), whatsappAutomationService.getQueue(), whatsappAutomationService.getHistory(),
        ]);
        const loadedGroups = ['connected', 'simulated'].includes(status.state)
          ? await whatsappAutomationService.getGroups() : [];
        if (!active) return;
        setSettings(loadedSettings); setSavedSettings(loadedSettings); setConnectionStatus(status);
        setDailyWord(word); setQueue(loadedQueue); setHistory(loadedHistory); setGroups(loadedGroups);
      } catch {
        if (active) setLoadError('Falha ao carregar dados da automação. Reabra o painel para tentar novamente.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [isAdmin]);

  return { settings, setSettings, savedSettings, setSavedSettings, isLoading, loadError,
    connectionStatus, setConnectionStatus, groups, setGroups, dailyWord,
    queue, setQueue, history, setHistory };
}
