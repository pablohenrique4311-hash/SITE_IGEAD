import React, { useState } from 'react';
import { Share2, Copy, Check, BookOpen } from 'lucide-react';

interface VerseOfTheDayProps {
  onOpenBible?: (bookId: string, chapter: number) => void;
}

export const VerseOfTheDay: React.FC<VerseOfTheDayProps> = ({ onOpenBible }) => {
  const [copied, setCopied] = useState(false);

  // Versículo do Dia oficial da igreja
  const verseData = {
    bookId: 'romanos',
    bookName: 'Romanos',
    chapter: 8,
    verse: 28,
    reference: 'Romanos 8:28',
    text: 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
    translation: 'Almeida (JFA)'
  };

  const handleCopy = async () => {
    const textToCopy = `"${verseData.text}" — ${verseData.reference} (${verseData.translation})\nIgreja Geração Eleita (IGEAD-MT)`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    const textToShare = `"${verseData.text}" — ${verseData.reference} (${verseData.translation})\nIgreja Geração Eleita (IGEAD-MT)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Versículo do Dia — ${verseData.reference}`,
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

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6">
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

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            {verseData.translation}
          </span>
        </div>

        {/* Texto do Versículo */}
        <blockquote className="font-serif-reading text-lg sm:text-2xl text-zinc-800 dark:text-zinc-100 italic leading-relaxed">
          &ldquo;{verseData.text}&rdquo;
        </blockquote>

        {/* Rodapé com referência e ações */}
        <div className="mt-6 pt-4 border-t border-amber-500/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50">
              {verseData.reference}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer shadow-2xs"
              title="Copiar versículo"
              aria-label="Copiar versículo para área de transferência"
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
              title="Compartilhar versículo"
              aria-label="Compartilhar versículo"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartilhar</span>
            </button>

            {onOpenBible && (
              <button
                type="button"
                onClick={() => onOpenBible(verseData.bookId, verseData.chapter)}
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
