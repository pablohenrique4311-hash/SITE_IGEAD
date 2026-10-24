import React, { useState } from 'react';
import { BookOpen, Video, ArrowRight, Tag, Bookmark } from 'lucide-react';
import { ChurchMessage } from '../types';
import { CHANNEL_URL } from '../services/youtubeService';

export const CHURCH_MESSAGES: ChurchMessage[] = [
  {
    id: 'msg_fe_inabalavel',
    title: 'A Fé que Prevalece em Meio às Tempestades',
    passage: 'Hebreus 11:1-6 & Marcos 4:35-41',
    summary: 'A verdadeira fé cristã não é a ausência de dificuldades, mas a certeza inabalável de que Cristo está no mesmo barco conosco, acalmando o mar da incerteza.',
    author: 'Pastor Presidente — IGEAD-MT',
    date: '18 de Outubro de 2026',
    category: 'Fé e Firmeza',
    youtubeVideoId: 'igead_culto_celebra'
  },
  {
    id: 'msg_familia_projeto',
    title: 'A Família Segundo o Coração de Deus',
    passage: 'Josué 24:14-15 & Efésios 5:21-33',
    summary: 'Princípios bíblicos para edificar um lar fundado no amor sacrificial, no perdão contínuo e no sacerdócio espiritual familiar.',
    author: 'Ministério da Família — IGEAD-MT',
    date: '11 de Outubro de 2026',
    category: 'Família Cristã',
    youtubeVideoId: 'igead_culto_celebra'
  },
  {
    id: 'msg_poder_oracao',
    title: 'O Poder Sobrenatural da Oração Eficaz',
    passage: 'Tiago 5:13-18 & 2 Crônicas 7:14',
    summary: 'Como uma igreja de joelhos transforma realidades, quebra cadeias espirituais e atrai o favor do Senhor para cidades e nações.',
    author: 'Equipe de Intercessão IGEAD-MT',
    date: '04 de Outubro de 2026',
    category: 'Oração',
    youtubeVideoId: 'igead_oracao_intercessao'
  },
  {
    id: 'msg_geracao_eleita',
    title: 'Vós Sois a Geração Eleita: Identidade e Propósito',
    passage: '1 Pedro 2:9-10',
    summary: 'Fomos chamados das trevas para a sua maravilhosa luz a fim de proclamar as virtudes daquele que nos redimiu com sangue precioso.',
    author: 'Liderança Pastoral IGEAD-MT',
    date: '27 de Setembro de 2026',
    category: 'Vida Cristã',
    youtubeVideoId: 'igead_jovens_geracao'
  }
];

interface ContentSectionProps {
  onOpenBibleReference?: (bookId: string, chapter: number) => void;
}

export const ContentSection: React.FC<ContentSectionProps> = ({ onOpenBibleReference }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [readingMessage, setReadingMessage] = useState<ChurchMessage | null>(null);

  const categories = ['todos', 'Fé e Firmeza', 'Família Cristã', 'Oração', 'Vida Cristã'];

  const filtered = CHURCH_MESSAGES.filter((msg) => {
    if (selectedCategory === 'todos') return true;
    return msg.category === selectedCategory;
  });

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
            Edificação e Doutrina
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50 tracking-tight">
            Estudos Bíblicos e Mensagens
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Reflexões bíblicas profundas baseadas fielmente nas Sagradas Escrituras para o seu fortalecimento espiritual diário.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {cat === 'todos' ? 'Todos os Temas' : cat}
          </button>
        ))}
      </div>

      {/* Grade de Mensagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((msg) => (
          <article
            key={msg.id}
            className="flex flex-col justify-between rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-8 bg-white dark:bg-zinc-900/60 hover:shadow-lg hover:border-amber-500/30 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                  <Tag className="w-3 h-3" />
                  {msg.category}
                </span>
                <span className="text-xs text-zinc-400">{msg.date}</span>
              </div>

              <h3 className="font-cinzel font-bold text-xl text-zinc-900 dark:text-zinc-50 mb-2">
                {msg.title}
              </h3>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-4">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Base Bíblica: {msg.passage}</span>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                {msg.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                {msg.author}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Assistir pregação no canal da IGEAD-MT"
                >
                  <Video className="w-3.5 h-3.5 text-red-600" />
                  <span>Vídeo</span>
                </a>

                <button
                  type="button"
                  onClick={() => setReadingMessage(msg)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  <span>Ler Estudo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal para leitura completa do estudo */}
      {readingMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {readingMessage.category}
                </span>
                <h3 className="font-cinzel font-bold text-xl text-zinc-900 dark:text-zinc-100 mt-1">
                  {readingMessage.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReadingMessage(null)}
                className="p-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-serif-reading">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-zinc-800/60 border border-amber-500/20 font-sans text-xs space-y-1">
                <div><strong>Passagem Central:</strong> {readingMessage.passage}</div>
                <div><strong>Ministrado em:</strong> {readingMessage.date} — {readingMessage.author}</div>
              </div>

              <p>
                As Escrituras nos ensinam em <em>{readingMessage.passage}</em> que Deus estabeleceu promessas eternas para o Seu povo. Na caminhada cristã diária, somos convocados a manter os olhos fitos no Autor e Consumador da nossa fé, Cristo Jesus.
              </p>
              <p>
                {readingMessage.summary}
              </p>
              <p>
                A igreja local, no poder do Espírito Santo, é coluna e baluarte da verdade. Que esta mensagem guarde o seu coração em perfeita paz e renove o seu compromisso com o Evangelho.
              </p>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between font-sans">
              <span className="text-xs text-zinc-500">Igreja Geração Eleita — IGEAD-MT</span>
              <button
                type="button"
                onClick={() => setReadingMessage(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white cursor-pointer"
              >
                Fechar Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
