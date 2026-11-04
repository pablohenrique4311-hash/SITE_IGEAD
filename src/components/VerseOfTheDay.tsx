import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, BookOpen, Sparkles, MessageCircle } from 'lucide-react';
import { NotificationBanner } from './NotificationBanner';
import { checkAndTriggerDailyVerseNotification } from '../services/notificationService';
import { getDailyWord, DailyWord } from '../services/dailyWordService';
import { useAuth } from '../contexts/AuthContext';

interface VerseOfTheDayProps {
  onOpenBible?: (bookId: string, chapter: number) => void;
  onOpenAdminAutomation?: () => void;
}

export const VerseOfTheDay: React.FC<VerseOfTheDayProps> = ({ onOpenBible, onOpenAdminAutomation }) => {
  const [copied, setCopied] = useState(false);
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const { user, isWhatsAppAdmin } = useAuth();

  useEffect(() => {
    let isMounted = true;
    getDailyWord().then((word) => {
      if (isMounted) {
        setDailyWord(word);
        // Rotina diária: notificação push do versículo
        checkAndTriggerDailyVerseNotification(word.verseText, word.reference);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = async () => {
    if (!dailyWord) return;
    const textToCopy = `"${dailyWord.verseText}" — ${dailyWord.reference} (${dailyWord.translation})\n\n✨ Reflexão: ${dailyWord.reflection}\n\nIgreja Geração Eleita (IGEAD-MT)`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (!dailyWord) return;
    const textToShare = `"${dailyWord.verseText}" — ${dailyWord.reference} (${dailyWord.translation})\n\n✨ Reflexão: ${dailyWord.reflection}\n\nIgreja Geração Eleita (IGEAD-MT)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Palavra do Dia — ${dailyWord.reference}`,
          text: textToShare,
          url: window.location.href
        });
      } catch {
        // Ignora cancelamento pelo usuário
      }
    } else {
      handleCopy();
    }
  };

  if (!dailyWord) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6">
        <div className="rounded-3xl bg-amber-500/5 border border-amber-500/15 p-8 animate-pulse text-center text-xs text-amber-700/60 dark:text-amber-400/60">
          Carregando a Palavra e Alimento Diário...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6 space-y-4">
      {/* Banner Convite para Notificações Push do Versículo e Cultos */}
      <NotificationBanner />

      {/* Card Principal do Versículo do Dia */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-6 sm:p-8 backdrop-blur-xs shadow-xs">
        {/* Detalhe decorativo sutil */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Palavra e Alimento Diário
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {dailyWord.translation}
            </span>

            {user && isWhatsAppAdmin && onOpenAdminAutomation && (
              <button
                type="button"
                onClick={onOpenAdminAutomation}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 transition-colors cursor-pointer"
                title="Abrir Painel de Automação do WhatsApp"
              >
                <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Automação WhatsApp</span>
                <span className="sm:hidden">WhatsApp</span>
              </button>
            )}
          </div>
        </div>

        {/* Texto do Versículo */}
        <blockquote className="font-serif-reading text-lg sm:text-2xl text-zinc-800 dark:text-zinc-100 italic leading-relaxed">
          &ldquo;{dailyWord.verseText}&rdquo;
        </blockquote>

        {/* Reflexão Pastoral */}
        {dailyWord.reflection && (
          <div className="mt-4 pt-4 border-t border-amber-500/15">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reflexão do Dia</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
              {dailyWord.reflection}
            </p>
          </div>
        )}

        {/* Rodapé com referência e ações */}
        <div className="mt-6 pt-4 border-t border-amber-500/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50">
              {dailyWord.reference}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shadow-2xs"
              title="Copiar versículo e reflexão"
              aria-label="Copiar versículo e reflexão para área de transferência"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shadow-2xs"
              title="Compartilhar versículo e reflexão"
              aria-label="Compartilhar versículo e reflexão"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </button>

            {onOpenBible && (
              <button
                type="button"
                onClick={() => onOpenBible(dailyWord.bookName.toLowerCase(), dailyWord.chapter)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 transition-colors cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ler Capítulo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
