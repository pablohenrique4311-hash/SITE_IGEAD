import { History, Clock, RefreshCw } from 'lucide-react';
import type { WhatsAppMessageHistoryItem, WhatsAppMessageQueueItem } from '../../types/whatsappAutomation';

interface Props {
  queue: WhatsAppMessageQueueItem[];
  history: WhatsAppMessageHistoryItem[];
  isProcessingQueue: boolean;
  handleProcessQueue: () => Promise<void>;
}
export function WhatsAppHistory({ queue, history, isProcessingQueue, handleProcessQueue }: Props) {
  return (
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
            {queue.filter((q) => ['pending','processing','uncertain'].includes(q.status)).length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Trabalhos na Fila ({queue.filter((q) => ['pending','processing','uncertain'].includes(q.status)).length})</span>
                </div>
                {queue
                  .filter((q) => ['pending','processing','uncertain'].includes(q.status))
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
                          Programado para: {new Date(item.scheduledFor).toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })} (Tentativa {item.attempts}/{item.maxAttempts})
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        {item.status}
                      </span>
                      {item.lastError && <p role="status">{item.lastError}</p>}
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
                          {item.isSimulated ? 'Simulação registrada' : item.status === 'sent' ? 'Aceito pelo provedor' : 'Envio não confirmado'}
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
                        {new Date(item.sentAt).toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' })} (Fuso Cuiabá)
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
  );
}
