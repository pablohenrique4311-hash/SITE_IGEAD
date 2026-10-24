import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Share2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Book,
  Compass,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { BibleBook, BibleChapterData, BibleTranslationId, BibleVerse } from '../types';
import {
  getAllBooks,
  getBookById,
  getTranslationInfo,
  fetchChapterVerses,
  formatFullVerseShare,
  formatVerseCitation,
  parseBibleQuery
} from '../services/bibleService';
import { CATEGORY_LABELS } from '../services/bibleData';

interface BibleReaderProps {
  initialBookId?: string;
  initialChapter?: number;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  initialBookId = 'joao',
  initialChapter = 3
}) => {
  const books = getAllBooks();

  // Estado da leitura
  const [translation, setTranslation] = useState<BibleTranslationId>('jfa');
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId);
  const [currentChapter, setCurrentChapter] = useState<number>(initialChapter);

  // Dados do capítulo e status
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI state
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0 = P, 1 = M, 2 = G, 3 = GG
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modais de Seleção
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);

  // Filtros no seletor de livros
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [activeTestamentFilter, setActiveTestamentFilter] = useState<'todos' | 'antigo' | 'novo'>('todos');

  // Campo de busca rápida de referência
  const [quickReferenceInput, setQuickReferenceInput] = useState('');

  const currentBook = getBookById(selectedBookId) || books[0];
  const translationInfo = getTranslationInfo(translation);

  // Carrega o capítulo sempre que muda livro, capítulo ou tradução
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setErrorMessage(null);
      setSelectedVerseNumber(null);

      try {
        const data = await fetchChapterVerses(translation, selectedBookId, currentChapter);
        if (!isCancelled) {
          setChapterData(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : 'Falha ao carregar o capítulo';
          setErrorMessage(msg);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [translation, selectedBookId, currentChapter]);

  // Navegação de capítulos
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      // Ir para o livro anterior
      const currentIndex = books.findIndex((b) => b.id === currentBook.id);
      if (currentIndex > 0) {
        const prevBook = books[currentIndex - 1];
        setSelectedBookId(prevBook.id);
        setCurrentChapter(prevBook.chaptersCount);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.chaptersCount) {
      setCurrentChapter(currentChapter + 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      // Ir para o próximo livro
      const currentIndex = books.findIndex((b) => b.id === currentBook.id);
      if (currentIndex < books.length - 1) {
        const nextBook = books[currentIndex + 1];
        setSelectedBookId(nextBook.id);
        setCurrentChapter(1);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  // Copiar versículo
  const handleCopyVerse = async (verse: BibleVerse) => {
    const shareText = formatFullVerseShare(verse, currentBook.name, translation);
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedVerseNum(verse.verse);
      showToast(`Versículo ${currentBook.name} ${verse.chapter}:${verse.verse} copiado!`);
      setTimeout(() => setCopiedVerseNum(null), 2500);
    } catch {
      showToast('Erro ao copiar versículo.');
    }
  };

  // Compartilhar versículo
  const handleShareVerse = async (verse: BibleVerse) => {
    const shareText = formatFullVerseShare(verse, currentBook.name, translation);
    const citation = formatVerseCitation(currentBook.name, verse.chapter, verse.verse, translation);

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Bíblia Sagrada — ${citation}`,
          text: shareText,
          url: window.location.href
        });
      } catch {
        // Usuário cancelou
      }
    } else {
      handleCopyVerse(verse);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Busca rápida de referência
  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReferenceInput.trim()) return;

    const parsed = parseBibleQuery(quickReferenceInput);
    if (parsed) {
      setSelectedBookId(parsed.book.id);
      setCurrentChapter(parsed.chapter);
      if (parsed.verse) {
        setSelectedVerseNumber(parsed.verse);
      }
      setQuickReferenceInput('');
      showToast(`Abrindo ${parsed.book.name} ${parsed.chapter}${parsed.verse ? `:${parsed.verse}` : ''}`);
    } else {
      showToast('Referência não encontrada. Exemplo: "Salmos 23" ou "João 3:16"');
    }
  };

  // Filtro de livros para o modal
  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      b.abbreviation.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      b.englishName.toLowerCase().includes(bookSearchQuery.toLowerCase());

    const matchTestament =
      activeTestamentFilter === 'todos' || b.testament === activeTestamentFilter;

    return matchSearch && matchTestament;
  });

  // Tamanho de fonte
  const fontSizes = [
    'text-base leading-relaxed',
    'text-lg sm:text-xl leading-relaxed',
    'text-xl sm:text-2xl leading-loose',
    'text-2xl sm:text-3xl leading-loose'
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabeçalho da Bíblia */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Escrituras Sagradas Online
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50">
            Bíblia Sagrada
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Texto canônico completo nas traduções Almeida (JFA) e King James (KJV).
          </p>
        </div>

        {/* Seletor de Tradução */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={() => setTranslation('jfa')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              translation === 'jfa'
                ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            title="João Ferreira de Almeida (Almeida Revista e Atualizada/Corrigida)"
          >
            Almeida (JFA)
          </button>
          <button
            type="button"
            onClick={() => setTranslation('kjv')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              translation === 'kjv'
                ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            title="King James Version (KJV)"
          >
            King James (KJV)
          </button>
        </div>
      </div>

      {/* Barra de Busca de Referência Rápida */}
      <form onSubmit={handleQuickSearch} className="my-6">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={quickReferenceInput}
            onChange={(e) => setQuickReferenceInput(e.target.value)}
            placeholder="Buscar por livro, capítulo ou referência (ex: João 3:16, Salmos 23, Romanos 8)..."
            className="w-full pl-11 pr-24 py-3 text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:text-zinc-950 text-white transition-colors cursor-pointer"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Barra de Controle de Leitura (Livro, Capítulo, Fonte, Navegação) */}
      <div className="sticky top-20 z-40 my-4 py-3 px-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Seletor de Livro e Capítulo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700 transition-colors cursor-pointer"
            aria-label="Selecionar livro da Bíblia"
          >
            <Book className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{currentBook.name}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChapterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700 transition-colors cursor-pointer"
            aria-label="Selecionar capítulo"
          >
            <span>Cap. {currentChapter}</span>
            <span className="text-xs text-zinc-400">/ {currentBook.chaptersCount}</span>
          </button>
        </div>

        {/* Controles de Tamanho de Fonte */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setFontSizeLevel(Math.max(0, fontSizeLevel - 1))}
            disabled={fontSizeLevel === 0}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
            title="Diminuir tamanho da letra (A-)"
            aria-label="Diminuir fonte"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold px-2 text-zinc-500 dark:text-zinc-400">
            {fontSizeLevel === 0 ? 'P' : fontSizeLevel === 1 ? 'M' : fontSizeLevel === 2 ? 'G' : 'GG'}
          </span>
          <button
            type="button"
            onClick={() => setFontSizeLevel(Math.min(fontSizes.length - 1, fontSizeLevel + 1))}
            disabled={fontSizeLevel === fontSizes.length - 1}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
            title="Aumentar tamanho da letra (A+)"
            aria-label="Aumentar fonte"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {fontSizeLevel !== 1 && (
            <button
              type="button"
              onClick={() => setFontSizeLevel(1)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              title="Redefinir tamanho padrão"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Botões de Navegação Anterior / Próximo */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevChapter}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Capítulo Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <button
            type="button"
            onClick={handleNextChapter}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Próximo Capítulo"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nota da Edição Bíblica / Licença */}
      <div className="my-3 px-3 py-2 rounded-xl bg-amber-50/50 dark:bg-zinc-900/60 border border-amber-500/20 text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            Edição: <strong className="text-zinc-800 dark:text-zinc-200">{translationInfo.edition}</strong> • {translationInfo.language}
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
          Armazenamento local ativo para leitura offline
        </span>
      </div>

      {/* Área Principal de Leitura dos Versículos */}
      <article className="mt-8 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-10 shadow-xs transition-colors">
        {/* Título do Livro e Capítulo */}
        <div className="text-center mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-600 dark:text-amber-400">
            {CATEGORY_LABELS[currentBook.category]} • {currentBook.testament === 'antigo' ? 'Antigo Testamento' : 'Novo Testamento'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {currentBook.name} {currentChapter}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {translationInfo.name} • {chapterData?.verses.length || 0} versículos
          </p>
        </div>

        {/* Estado de Carregamento com Skeleton */}
        {isLoading ? (
          <div className="py-8 space-y-4 animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-6 text-amber-700 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Carregando {currentBook.name} {currentChapter}...</span>
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/40 space-y-2.5">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700/60 rounded w-11/12"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700/60 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="p-8 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-center space-y-3">
            <AlertCircle className="w-9 h-9 text-red-600 dark:text-red-400 mx-auto" />
            <h3 className="text-base font-semibold text-red-900 dark:text-red-200">
              Não foi possível carregar o capítulo
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">
              {errorMessage}
            </p>
            <div className="pt-3 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setErrorMessage(null);
                  fetchChapterVerses(translation, selectedBookId, currentChapter)
                    .then((data) => {
                      setChapterData(data);
                      setIsLoading(false);
                    })
                    .catch((err) => {
                      setErrorMessage(err instanceof Error ? err.message : 'Falha ao recarregar');
                      setIsLoading(false);
                    });
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
              >
                Tentar Novamente
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedBookId('salmos');
                  setCurrentChapter(23);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
              >
                Ler Salmos 23
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedBookId('joao');
                  setCurrentChapter(3);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
              >
                Ler João 3
              </button>
            </div>
          </div>
        ) : chapterData && chapterData.verses.length > 0 ? (

          <div className={`space-y-4 font-serif-reading ${fontSizes[fontSizeLevel]}`}>
            {chapterData.verses.map((verse) => {
              const isSelected = selectedVerseNumber === verse.verse;
              const isCopied = copiedVerseNum === verse.verse;

              return (
                <div
                  key={verse.verse}
                  onClick={() => setSelectedVerseNumber(isSelected ? null : verse.verse)}
                  className={`group relative p-3 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  <p className="text-zinc-800 dark:text-zinc-100 leading-relaxed">
                    <span className="font-sans font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400 select-none mr-2">
                      {verse.verse}
                    </span>
                    {verse.text}
                  </p>

                  {/* Ações contextuais ao clicar no versículo */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs font-sans animate-in fade-in duration-150">
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {currentBook.name} {currentChapter}:{verse.verse}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyVerse(verse);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Copiado</span>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareVerse(verse);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Compartilhar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Navegação de Rodapé */}
        <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevChapter}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Capítulo Anterior</span>
          </button>

          <span className="font-cinzel text-xs font-semibold text-zinc-400">
            {currentBook.name} {currentChapter}
          </span>

          <button
            type="button"
            onClick={handleNextChapter}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <span>Próximo Capítulo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </article>

      {/* Modal / Diálogo para Selecionar Livro (66 Livros) */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Topo do Modal */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-cinzel font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Selecionar Livro da Bíblia (66 Livros)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Busca e Abas do Modal */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  placeholder="Filtrar livro por nome ou abreviação..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTestamentFilter('todos')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                    activeTestamentFilter === 'todos'
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Todos (66)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTestamentFilter('antigo')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                    activeTestamentFilter === 'antigo'
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Antigo Testamento (39)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTestamentFilter('novo')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                    activeTestamentFilter === 'novo'
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  Novo Testamento (27)
                </button>
              </div>
            </div>

            {/* Grade de Livros com rolagem suave */}
            <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredBooks.map((book) => {
                const isCurrent = book.id === currentBook.id;
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => {
                      setSelectedBookId(book.id);
                      setCurrentChapter(1);
                      setIsBookModalOpen(false);
                      setIsChapterModalOpen(true);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-semibold'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200/60 dark:border-zinc-700/60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{book.name}</div>
                      <div className="text-[10px] text-zinc-400">{book.chaptersCount} cap.</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      {book.abbreviation}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Selecionar Capítulo */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[80vh] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-cinzel font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  {currentBook.name} — Escolha o Capítulo
                </h3>
                <p className="text-xs text-zinc-500">Selecione entre 1 e {currentBook.chaptersCount}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsChapterModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[50vh] grid grid-cols-5 sm:grid-cols-6 gap-2">
              {[...Array(currentBook.chaptersCount)].map((_, i) => {
                const chapNum = i + 1;
                const isCurrent = chapNum === currentChapter;
                return (
                  <button
                    key={chapNum}
                    type="button"
                    onClick={() => {
                      setCurrentChapter(chapNum);
                      setIsChapterModalOpen(false);
                    }}
                    className={`h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300'
                    }`}
                  >
                    {chapNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
