import type { Dispatch, SetStateAction } from 'react';
import { Clock, RefreshCw, Send } from 'lucide-react';
import type { WhatsAppAutomationSettings, WhatsAppGroupInfo } from '../../types/whatsappAutomation';
interface Props {
  settings: WhatsAppAutomationSettings;
  setSettings: Dispatch<SetStateAction<WhatsAppAutomationSettings>>;
  savedSettings: WhatsAppAutomationSettings | null;
  groups: WhatsAppGroupInfo[];
  isLoadingGroups: boolean;
  handleFetchGroups: () => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  handleSaveSettings: () => Promise<boolean>;
  handleSendTestMessage: () => Promise<void>;
  isSendingTest: boolean;
}
export function WhatsAppScheduleSettings({ settings, setSettings, savedSettings, groups,
  isLoadingGroups, handleFetchGroups, isSaving, isLoading, hasUnsavedChanges,
  handleSaveSettings, handleSendTestMessage, isSendingTest }: Props) {
  return (
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
                      {settings.isEnabled ? 'Ativação selecionada' : 'Pausa selecionada'}
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
                    <span>Atualizar Grupo Configurado</span>
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

              {hasUnsavedChanges && <p role="status" className="text-sm text-amber-700">Alterações não salvas no servidor.</p>}
              {/* Botões de Ação para Salvar e Testar Envio */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={isSaving || isLoading || !savedSettings}
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
  );
}
