import { Smartphone, Sparkles } from 'lucide-react';
import type { DailyWord } from '../../services/dailyWordService';
import type { WhatsAppAutomationSettings } from '../../types/whatsappAutomation';
export function WhatsAppMessagePreview({ settings, dailyWord }: {
  settings: WhatsAppAutomationSettings; dailyWord: DailyWord | null;
}) {
  return (
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
                      Prévia da mensagem
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
                  <li><strong>Controle de duplicidade:</strong> A fila reserva cada envio diário. Resultados desconhecidos exigem conferência antes de repetir.</li>
                  <li><strong>Mesmo Conteúdo:</strong> O texto enviado consome exatamente o mesmo versículo e reflexão exibidos no site.</li>
                  <li><strong>Controle de Falhas:</strong> Registra tentativas e mensagens de erro do provedor caso o WhatsApp caia.</li>
                </ul>
              </div>
            </div>
          </div>
  );
}
