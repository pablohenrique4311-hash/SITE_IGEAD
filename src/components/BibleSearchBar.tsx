import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, Sparkles, Book, Hash } from 'lucide-react';
import { BibleBook } from '../types';
import {
  getAllBooks,
  parseBibleQuery,
  searchBibleBooks,
  normalizeClean
} from '../services/bibleService';
import { CATEGORY_LABELS } from '../services/bibleData';

interface BibleSearchBarProps {
  onSelectBook: (book: BibleBook) => void;
  onSelectChapter: (book: BibleBook, chapter: number, verse?: number) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

// Passagens e referências bíblicas mais acessadas para sugestões rápidas
const QUICK_SUGGESTIONS = [
  { label: 'Salmos 23', bookId: 'salmos', chapter: 23, desc: 'O Senhor é o meu pastor' },
  { label: 'João 3:16', bookId: 'joao', chapter: 3, verse: 16, desc: 'Porque Deus amou o mundo' },
  { label: 'Romanos 8', bookId: 'romanos', chapter: 8, desc: 'Nenhuma condenação há' },
  { label: 'Mateus 5', bookId: 'mateus', chapter: 5, desc: 'O Sermão do Monte' },
  { label: 'Provérbios 3', bookId: 'proverbios', chapter: 3, desc: 'Confia no Senhor de coração' },
  { label: '1 Coríntios 13', bookId: '1corintios', chapter: 13, desc: 'O Hino ao Amor' },
  { label: 'Filipenses 4', bookId: 'filipenses', chapter: 4, desc: 'Tudo posso naquele que me fortalece' },
  { label: 'Isaías 53', bookId: 'isaias', chapter: 53, desc: 'O Servo Sofredor' }
];

export const BibleSearchBar: React.FC<BibleSearchBarProps> = ({
  onSelectBook,
  onSelectChapter,
  placeholder = 'Buscar por livro, capítulo ou versículo (ex: Salmos 23, João 3:16, Mateus, Gn 1)...',
  className = '',
  compact = false
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Análise da consulta digitada
  const parsedReference = query.trim() ? parseBibleQuery(query) : null;
  const matchingBooks = query.trim() ? searchBibleBooks(query).slice(0, 5) : [];

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectParsedReference = () => {
    if (parsedReference) {
      onSelectChapter(parsedReference.book, parsedReference.chapter, parsedReference.verse);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSelectBookDirect = (book: BibleBook) => {
    onSelectBook(book);
    setIsOpen(false);
    setQuery('');
  };

  const handleSelectChapterDirect = (book: BibleBook, chapter: number) => {
    onSelectChapter(book, chapter);
    setIsOpen(false);
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (parsedReference) {
      onSelectChapter(parsedReference.book, parsedReference.chapter, parsedReference.verse);
      setIsOpen(false);
      setQuery('');
      return;
    }

    if (matchingBooks.length > 0) {
      // Se encontrou livro pelo nome, abre seus capítulos
      onSelectBook(matchingBooks[0]);
      setIsOpen(false);
      setQuery('');
      return;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Formulário Principal de Busca */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 sm:left-4 pointer-events-none text-zinc-400 dark:text-zinc-500">
          <Search className={compact ? 'w-4 h-4' : 'w-4 sm:w-5 h-4 sm:h-5 text-amber-600 dark:text-amber-400'} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder={placeholder}
          className={`w-full transition-all duration-200 outline-none ${
            compact
              ? 'pl-10 pr-20 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500'
              : 'pl-11 sm:pl-12 pr-24 py-3 sm:py-3.5 text-sm sm:text-base rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500'
          }`}
          aria-label="Buscar livro ou capítulo na Bíblia"
        />

        {/* Botão Limpar (X) */}
        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-18 sm:right-20 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Limpar busca"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Botão Buscar */}
        <button
          type="submit"
          className={`absolute right-1.5 sm:right-2 font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 transition-colors cursor-pointer shadow-xs ${
            compact ? 'px-3 py-1 rounded-lg text-xs' : 'px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm'
          }`}
        >
          Buscar
        </button>
      </form>

      {/* Dropdown com Sugestões e Resultados Instantâneos */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
          {/* 1. Resultado de Referência Reconhecida Direta */}
          {parsedReference && (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                    {parsedReference.book.abbreviation}
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                      Passagem encontrada
                    </div>
                    <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {parsedReference.book.name} {parsedReference.chapter}
                      {parsedReference.verse ? `:${parsedReference.verse}` : ''}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSelectParsedReference}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Abrir Texto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Lista de Livros Correspondentes */}
          {matchingBooks.length > 0 && (
            <div className="p-3 space-y-1.5">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Livros correspondentes ({matchingBooks.length})
              </div>

              {matchingBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                      {book.abbreviation}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {book.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {book.chaptersCount} capítulos • {book.testament === 'antigo' ? 'Antigo Testamento' : 'Novo Testamento'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectBookDirect(book)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="Ver todos os capítulos deste livro"
                    >
                      Capítulos
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectChapterDirect(book, 1)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/20 transition-colors cursor-pointer"
                      title="Abrir diretamente o capítulo 1"
                    >
                      Ler Cap. 1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Mensagem quando nada for encontrado para o texto digitado */}
          {query.trim().length > 0 && !parsedReference && matchingBooks.length === 0 && (
            <div className="p-6 text-center text-zinc-500 dark:text-zinc-400 space-y-1.5">
              <BookOpen className="w-6 h-6 mx-auto text-zinc-400 mb-1" />
              <div className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Nenhum livro ou passagem encontrada para "{query}"
              </div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Tente digitar o nome do livro seguido do capítulo, como <strong>"Salmos 23"</strong>, <strong>"João 3"</strong> ou a sigla <strong>"Gn 1"</strong>.
              </p>
            </div>
          )}

          {/* 4. Sugestões Rápidas de Passagens Conhecidas (sempre visíveis ou quando consulta curta) */}
          {(!query.trim() || query.trim().length <= 2) && (
            <div className="p-3 sm:p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Passagens Bíblicas Populares</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_SUGGESTIONS.map((sug) => {
                  const book = getAllBooks().find((b) => b.id === sug.bookId);
                  if (!book) return null;

                  return (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => {
                        onSelectChapter(book, sug.chapter, sug.verse);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 border border-zinc-200/80 dark:border-zinc-700 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {sug.label}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          {sug.desc}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
