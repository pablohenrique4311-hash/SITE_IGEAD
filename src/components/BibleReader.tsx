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
  Info,
  ArrowLeft,
  Grid,
  Filter
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

type BibleViewMode = 'books' | 'chapters' | 'reading';

export const BibleReader: React.FC<BibleReaderProps> = ({
  initialBookId,
  initialChapter
}) => {
  const books = getAllBooks();

  // 1. MODO DE VISUALIZAÇÃO: Começa em 'books' se nenhum livro inicial for passado
  const [viewMode, setViewMode] = useState<BibleViewMode>(() => {
    return initialBookId ? 'reading' : 'books';
  });

  // Estado da seleção e leitura
  const [translation, setTranslation] = useState<BibleTranslationId>('jfa');
  const [selectedBookId, setSelectedBookId] = useState<string>(initialBookId || 'joao');
  const [currentChapter, setCurrentChapter] = useState<number>(initialChapter || 1);

  // Dados do capítulo e status
  const [chapterData, setChapterData] = useState<BibleChapterData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI state
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0 = P, 1 = M, 2 = G, 3 = GG
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null);
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtros no seletor de livros
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [activeTestamentFilter, setActiveTestamentFilter] = useState<'todos' | 'antigo' | 'novo'>('todos');

  // Campo de busca rápida de referência
  const [quickReferenceInput, setQuickReferenceInput] = useState('');

  const currentBook = getBookById(selectedBookId) || books[0];
  const translationInfo = getTranslationInfo(translation);

  // Sincroniza props iniciais quando atualizadas externamente (ex: links de estudos)
  useEffect(() => {
    if (initialBookId) {
      setSelectedBookId(initialBookId);
      if (initialChapter) {
        setCurrentChapter(initialChapter);
      }
      setViewMode('reading');
    }
  }, [initialBookId, initialChapter]);

  // Carrega o capítulo quando estiver no modo de leitura
  useEffect(() => {
    if (viewMode !== 'reading') return;

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
  }, [translation, selectedBookId, currentChapter, viewMode]);

  // Selecionar um livro (avança para seleção de capítulos)
  const handleSelectBook = (book: BibleBook) => {
    setSelectedBookId(book.id);
    setViewMode('chapters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selecionar um capítulo (inicia a leitura do texto bíblico)
  const handleSelectChapter = (chapterNum: number) => {
    setCurrentChapter(chapterNum);
    setViewMode('reading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navegação de capítulos durante a leitura
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
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
      setViewMode('reading');
      setQuickReferenceInput('');
      showToast(`Abrindo ${parsed.book.name} ${parsed.chapter}${parsed.verse ? `:${parsed.verse}` : ''}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast('Referência não encontrada. Exemplo: "Salmos 23" ou "João 3:16"');
    }
  };

  // Filtro de livros para a tela de livros
  const filterBookItem = (b: BibleBook) => {
    const matchSearch =
      b.name.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      b.abbreviation.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      b.englishName.toLowerCase().includes(bookSearchQuery.toLowerCase());

    const matchTestament =
      activeTestamentFilter === 'todos' || b.testament === activeTestamentFilter;

    return matchSearch && matchTestament;
  };

  const oldTestamentBooks = books.filter((b) => b.testament === 'antigo' && filterBookItem(b));
  const newTestamentBooks = books.filter((b) => b.testament === 'novo' && filterBookItem(b));

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

      {/* =========================================================================
          CENÁRIO 1: GRADE ORGANIZADA DE SELEÇÃO DE LIVROS (FLUXO INICIAL)
          ========================================================================= */}
      {viewMode === 'books' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Cabeçalho do Seletor */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cânon Sagrado • 66 Livros</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50">
              Bíblia Sagrada
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Escolha um livro abaixo para navegar pelos capítulos ou utilize a busca rápida por referência.
            </p>
          </div>

          {/* Barra de Busca de Referência Rápida */}
          <form onSubmit={handleQuickSearch} className="max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={quickReferenceInput}
                onChange={(e) => setQuickReferenceInput(e.target.value)}
                placeholder="Buscar por livro, capítulo ou versículo (ex: João 3:16, Salmos 23, Romanos 8)..."
                className="w-full pl-11 pr-24 py-3.5 text-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 shadow-xs transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:text-zinc-950 text-white transition-colors cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Filtros de Testamento e Tradução */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
            {/* Abas dos Testamentos */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTestamentFilter('todos')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTestamentFilter === 'todos'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Todos (66)
              </button>
              <button
                type="button"
                onClick={() => setActiveTestamentFilter('antigo')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTestamentFilter === 'antigo'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Antigo Testamento (39)
              </button>
              <button
                type="button"
                onClick={() => setActiveTestamentFilter('novo')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTestamentFilter === 'novo'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Novo Testamento (27)
              </button>
            </div>

            {/* Seletor de Tradução */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-2">
                Tradução:
              </span>
              <button
                type="button"
                onClick={() => setTranslation('jfa')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  translation === 'jfa'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Almeida (JFA)
              </button>
              <button
                type="button"
                onClick={() => setTranslation('kjv')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  translation === 'kjv'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                King James (KJV)
              </button>
            </div>
          </div>

          {/* Campo secundário para filtrar livros por nome */}
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={bookSearchQuery}
              onChange={(e) => setBookSearchQuery(e.target.value)}
              placeholder="Filtrar livros pelo nome ou sigla..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Seção 1: ANTIGO TESTAMENTO */}
          {(activeTestamentFilter === 'todos' || activeTestamentFilter === 'antigo') && oldTestamentBooks.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl select-none">📜</span>
                  <h2 className="font-cinzel font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100">
                    Antigo Testamento
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">
                    {oldTestamentBooks.length} {oldTestamentBooks.length === 1 ? 'livro' : 'livros'}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                  Do Pentateuco aos Profetas Menores
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {oldTestamentBooks.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectBook(book)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 hover:border-amber-500/60 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs font-mono uppercase group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        {book.abbreviation}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap">
                        {book.chaptersCount} cap.
                      </span>
                    </div>

                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {book.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                        {CATEGORY_LABELS[book.category] || book.category}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seção 2: NOVO TESTAMENTO */}
          {(activeTestamentFilter === 'todos' || activeTestamentFilter === 'novo') && newTestamentBooks.length > 0 && (
            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl select-none">✝️</span>
                  <h2 className="font-cinzel font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100">
                    Novo Testamento
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold">
                    {newTestamentBooks.length} {newTestamentBooks.length === 1 ? 'livro' : 'livros'}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                  Dos Evangelhos ao Apocalipse
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {newTestamentBooks.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectBook(book)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 hover:border-amber-500/60 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs font-mono uppercase group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        {book.abbreviation}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap">
                        {book.chaptersCount} cap.
                      </span>
                    </div>

                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {book.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                        {CATEGORY_LABELS[book.category] || book.category}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {oldTestamentBooks.length === 0 && newTestamentBooks.length === 0 && (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 space-y-3">
              <Search className="w-8 h-8 mx-auto text-zinc-400" />
              <p className="text-sm">Nenhum livro encontrado para "{bookSearchQuery}".</p>
              <button
                type="button"
                onClick={() => {
                  setBookSearchQuery('');
                  setActiveTestamentFilter('todos');
                }}
                className="text-xs font-semibold text-amber-600 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          CENÁRIO 2: SELEÇÃO DE CAPÍTULOS DO LIVRO ESCOLHIDO
          ========================================================================= */}
      {viewMode === 'chapters' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Barra Superior de Navegação */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setViewMode('books');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Escolher outro livro</span>
            </button>

            {/* Tradução Ativa */}
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Tradução: <strong className="text-amber-600 dark:text-amber-400">{translationInfo.name}</strong>
            </div>
          </div>

          {/* Cartão de Apresentação do Livro */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-3">
              <span>{currentBook.testament === 'antigo' ? 'Antigo Testamento' : 'Novo Testamento'}</span>
              <span>•</span>
              <span>{CATEGORY_LABELS[currentBook.category]}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-zinc-900 dark:text-zinc-50">
              {currentBook.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Selecione o capítulo desejado para iniciar a leitura (1 a {currentBook.chaptersCount}):
            </p>
          </div>

          {/* Grade com os Números de Todos os Capítulos */}
          <div className="bg-white dark:bg-zinc-900/60 p-6 sm:p-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 sm:gap-3">
              {[...Array(currentBook.chaptersCount)].map((_, idx) => {
                const chapterNum = idx + 1;
                const isCurrent = chapterNum === currentChapter;
                return (
                  <button
                    key={chapterNum}
                    type="button"
                    onClick={() => handleSelectChapter(chapterNum)}
                    className={`py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-bold transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                      isCurrent
                        ? 'bg-amber-600 text-white shadow-md scale-105'
                        : 'bg-zinc-50 hover:bg-amber-500/15 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:text-amber-700 dark:hover:text-amber-300 border border-zinc-200/80 dark:border-zinc-700 hover:border-amber-500/50 hover:scale-105'
                    }`}
                    aria-label={`Capítulo ${chapterNum}`}
                  >
                    {chapterNum}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode('books');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Ver lista com todos os 66 livros da Bíblia</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CENÁRIO 3: LEITURA COMPLETA DO TEXTO BÍBLICO
          ========================================================================= */}
      {viewMode === 'reading' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Barra de Ações Rápidas & Retorno */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            {/* Botão de Retorno Rápido para Escolher outro livro */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('books');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 transition-all cursor-pointer"
                title="Voltar para a seleção de todos os livros"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Escolher outro livro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('chapters');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                title={`Ver todos os capítulos de ${currentBook.name}`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Capítulos ({currentBook.chaptersCount})</span>
              </button>
            </div>

            {/* Seletor de Tradução */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setTranslation('jfa')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  translation === 'jfa'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="João Ferreira de Almeida"
              >
                Almeida (JFA)
              </button>
              <button
                type="button"
                onClick={() => setTranslation('kjv')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  translation === 'kjv'
                    ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-300 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title="King James Version"
              >
                King James (KJV)
              </button>
            </div>
          </div>

          {/* Barra de Busca de Referência Rápida (permanece no topo para buscas diretas) */}
          <form onSubmit={handleQuickSearch} className="my-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={quickReferenceInput}
                onChange={(e) => setQuickReferenceInput(e.target.value)}
                placeholder="Pesquisar por versículo ou referência direta (ex: João 3:16, Salmos 23, Mateus 5)..."
                className="w-full pl-11 pr-24 py-2.5 text-xs sm:text-sm rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:text-zinc-950 text-white transition-colors cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Barra Fixa de Controle de Leitura */}
          <div className="sticky top-20 z-40 my-3 py-3 px-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Botão Clicável do Livro e Capítulo (Reabre Seletor Instantaneamente) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('books');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30 transition-colors cursor-pointer"
                title="Clique para escolher outro livro da Bíblia"
              >
                <Book className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{currentBook.name}</span>
                <span className="text-zinc-400 text-xs">▾</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('chapters');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700 transition-colors cursor-pointer"
                title="Clique para escolher outro capítulo"
              >
                <span>Cap. {currentChapter}</span>
                <span className="text-xs text-zinc-400">/ {currentBook.chaptersCount}</span>
                <span className="text-zinc-400 text-xs">▾</span>
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

          {/* Área Principal de Leitura dos Versículos */}
          <article className="mt-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-10 shadow-xs transition-colors">
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
                    onClick={() => setViewMode('books')}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                  >
                    Voltar aos Livros
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
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                              title="Copiar texto do versículo"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareVerse(verse);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
                              title="Compartilhar versículo com amigos"
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

            {/* Rodapé da Leitura com Navegação de Capítulos e Botão de Retorno aos Livros */}
            <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevChapter}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Capítulo Anterior</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('books');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 transition-all cursor-pointer"
              >
                <Grid className="w-4 h-4" />
                <span>← Escolher outro livro</span>
              </button>

              <button
                type="button"
                onClick={handleNextChapter}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <span>Próximo Capítulo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
