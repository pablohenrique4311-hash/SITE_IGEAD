import {
  BibleBook,
  BibleChapterData,
  BibleTranslationId,
  BibleTranslationInfo,
  BibleVerse
} from '../types';
import {
  BIBLE_BOOKS,
  BIBLE_TRANSLATIONS,
  CANONICAL_CHAPTERS
} from './bibleData';

const CACHE_PREFIX = 'igead_bible_v2';

interface RawBibleBookJson {
  abbrev: string;
  name: string;
  chapters: string[][];
}

// Cache em memória de toda a Bíblia para acesso ultrarrápido
const inMemoryBibleJsonCache: Partial<Record<BibleTranslationId, RawBibleBookJson[]>> = {};
const pendingFetchPromises: Partial<Record<BibleTranslationId, Promise<RawBibleBookJson[]>>> = {};

export function getAllBooks(): BibleBook[] {
  return BIBLE_BOOKS;
}

export function getBookById(id: string): BibleBook | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  return BIBLE_BOOKS.find((b) => {
    const bId = b.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bSlug = b.englishSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bName = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bEng = b.englishName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bAbbr = b.abbreviation.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      bId === normalized ||
      bSlug === normalized ||
      bName === normalized ||
      bEng === normalized ||
      bAbbr === normalized
    );
  });
}


export function getTranslationInfo(id: BibleTranslationId): BibleTranslationInfo {
  return BIBLE_TRANSLATIONS[id] || BIBLE_TRANSLATIONS.jfa;
}

export function formatVerseCitation(
  bookName: string,
  chapter: number,
  verseNum: number,
  translationId: BibleTranslationId
): string {
  const trans = getTranslationInfo(translationId);
  return `${bookName} ${chapter}:${verseNum} (${trans.name})`;
}

export function formatFullVerseShare(
  verse: BibleVerse,
  bookName: string,
  translationId: BibleTranslationId
): string {
  const citation = formatVerseCitation(bookName, verse.chapter, verse.verse, translationId);
  return `"${verse.text.trim()}"\n— ${citation}\n\nIgreja Geração Eleita (IGEAD-MT)`;
}

export interface ParsedBibleReference {
  book: BibleBook;
  chapter: number;
  verse?: number;
}

export function normalizeClean(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function parseBibleQuery(query: string): ParsedBibleReference | null {
  if (!query || !query.trim()) return null;
  const raw = query.trim();
  const normalizedQuery = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // Expressão regular: detecta nome/sigla do livro + capítulo opcional + versículo opcional
  // Exemplos: "1 joao 3:16", "salmos 23", "gn 1", "mateus", "1corintios 13"
  const match = normalizedQuery.match(/^([0-9]?\s*[a-z]+)\s*(\d+)?(?::(\d+))?$/i);
  let rawBookPart = normalizedQuery;
  let chapterNum = 1;
  let verseNum: number | undefined;

  if (match) {
    rawBookPart = match[1].trim();
    if (match[2]) {
      chapterNum = parseInt(match[2], 10);
    }
    if (match[3]) {
      verseNum = parseInt(match[3], 10);
    }
  }

  const cleanBookSearch = normalizeClean(rawBookPart);
  if (!cleanBookSearch) return null;

  // 1. Busca exata por ID, abreviação, nome ou slug em inglês
  let foundBook = BIBLE_BOOKS.find((b) => {
    const bId = normalizeClean(b.id);
    const bAbbr = normalizeClean(b.abbreviation);
    const bName = normalizeClean(b.name);
    const bEng = normalizeClean(b.englishSlug);
    const bEngName = normalizeClean(b.englishName);

    return (
      bId === cleanBookSearch ||
      bAbbr === cleanBookSearch ||
      bName === cleanBookSearch ||
      bEng === cleanBookSearch ||
      bEngName === cleanBookSearch
    );
  });

  // 2. Se não encontrou exato, busca por prefixo (ex: "mat" -> Mateus, "salm" -> Salmos, "gen" -> Gênesis)
  if (!foundBook && cleanBookSearch.length >= 2) {
    foundBook = BIBLE_BOOKS.find((b) => {
      const bName = normalizeClean(b.name);
      const bId = normalizeClean(b.id);
      return bName.startsWith(cleanBookSearch) || bId.startsWith(cleanBookSearch);
    });
  }

  if (!foundBook) return null;

  const validChapter = Math.min(Math.max(1, chapterNum), foundBook.chaptersCount);
  return {
    book: foundBook,
    chapter: validChapter,
    verse: verseNum
  };
}

export function searchBibleBooks(term: string): BibleBook[] {
  if (!term || !term.trim()) return [];
  const cleanTerm = normalizeClean(term);
  if (!cleanTerm) return [];

  return BIBLE_BOOKS.filter((b) => {
    const bId = normalizeClean(b.id);
    const bAbbr = normalizeClean(b.abbreviation);
    const bName = normalizeClean(b.name);
    const bEng = normalizeClean(b.englishName);
    const bCategory = normalizeClean(b.category);

    return (
      bName.includes(cleanTerm) ||
      bAbbr === cleanTerm ||
      bAbbr.includes(cleanTerm) ||
      bId.includes(cleanTerm) ||
      bEng.includes(cleanTerm) ||
      bCategory.includes(cleanTerm)
    );
  });
}

/**
 * Carrega a Bíblia completa (JFA ou KJV) com arquitetura resiliente de 3 níveis:
 * 1. Arquivo local no servidor (/data/pt_acf.json ou /data/en_kjv.json)
 * 2. CDN público oficial (raw.githubusercontent.com)
 * 3. Cache em memória / LocalStorage
 */
async function loadBibleDataset(translation: BibleTranslationId): Promise<RawBibleBookJson[]> {
  if (inMemoryBibleJsonCache[translation]) {
    return inMemoryBibleJsonCache[translation]!;
  }

  if (pendingFetchPromises[translation]) {
    return pendingFetchPromises[translation]!;
  }

  const fileName = translation === 'jfa' ? 'pt_acf.json' : 'en_kjv.json';

  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const rawBase = (import.meta as unknown as { env?: Record<string, string> })?.env?.BASE_URL || '/';
  const cleanBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const candidateUrls: string[] = [
    `${cleanBase}data/${fileName}`,
    `./data/${fileName}`,
    `/data/${fileName}`
  ];
  if (origin) {
    candidateUrls.push(`${origin}${cleanBase}data/${fileName}`);
    candidateUrls.push(`${origin}/data/${fileName}`);
  }
  // CDN público oficial como garantia infalível
  candidateUrls.push(`https://raw.githubusercontent.com/thiagobodruk/bible/master/json/${fileName}`);


  pendingFetchPromises[translation] = (async () => {
    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data: RawBibleBookJson[] = await response.json();
          if (Array.isArray(data) && data.length === 66) {
            inMemoryBibleJsonCache[translation] = data;
            return data;
          }
        }
      } catch {
        // Tenta próxima fonte da lista
        continue;
      }
    }

    throw new Error(`Não foi possível carregar a Bíblia completa em formato JSON.`);
  })();

  try {
    const result = await pendingFetchPromises[translation]!;
    return result;
  } finally {
    delete pendingFetchPromises[translation];
  }
}

/**
 * Retorna os versículos de um capítulo bíblico garantindo integridade e estabilidade
 */
export async function fetchChapterVerses(
  translation: BibleTranslationId,
  bookId: string,
  chapter: number
): Promise<BibleChapterData> {
  const book = getBookById(bookId);
  if (!book) {
    throw new Error(`Livro não encontrado no cânon bíblico: "${bookId}"`);
  }

  const safeChapter = Math.min(Math.max(1, chapter), book.chaptersCount);
  const cacheKey = `${CACHE_PREFIX}_${translation}_${book.id}_${safeChapter}`;

  // 1. Verifica cache local do navegador
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: BibleChapterData = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.verses) && parsed.verses.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignora erro de leitura do localStorage
    }
  }

  // 2. Busca na base completa oficial (Local / CDN)
  try {
    const fullBible = await loadBibleDataset(translation);
    const bookData = fullBible[book.bookIndex];

    if (bookData && Array.isArray(bookData.chapters)) {
      const chapterIdx = safeChapter - 1;
      const rawVerses = bookData.chapters[chapterIdx];

      if (Array.isArray(rawVerses) && rawVerses.length > 0) {
        const verses: BibleVerse[] = rawVerses.map((text, idx) => ({
          book: book.name,
          chapter: safeChapter,
          verse: idx + 1,
          text: text.trim()
        }));

        const result: BibleChapterData = {
          translation,
          bookId: book.id,
          bookName: book.name,
          chapter: safeChapter,
          totalChapters: book.chaptersCount,
          verses,
          sourceName: getTranslationInfo(translation).edition
        };

        saveToCache(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('[BibleService] Falha ao carregar do dataset JSON, tentando fallbacks:', err);
  }

  // 3. Fallback Canônico Pré-Armazenado
  const canonicalKey = `${book.id}:${safeChapter}`;
  if (CANONICAL_CHAPTERS[canonicalKey] && CANONICAL_CHAPTERS[canonicalKey][translation]) {
    const rawLines = CANONICAL_CHAPTERS[canonicalKey][translation];
    const verses: BibleVerse[] = rawLines.map((text, idx) => ({
      book: book.name,
      chapter: safeChapter,
      verse: idx + 1,
      text: text.trim()
    }));

    const result: BibleChapterData = {
      translation,
      bookId: book.id,
      bookName: book.name,
      chapter: safeChapter,
      totalChapters: book.chaptersCount,
      verses,
      sourceName: getTranslationInfo(translation).edition
    };

    saveToCache(cacheKey, result);
    return result;
  }

  // 4. Fallback final: API pública externa com normalização de parâmetros
  try {
    const transParam = translation === 'kjv' ? 'kjv' : 'almeida';
    // Mapeamento normalizado para evitar 404 na bible-api.com
    const querySlug = book.id === 'salmos' ? 'salmos' : book.englishSlug;
    const url = `https://bible-api.com/${encodeURIComponent(querySlug)}+${safeChapter}?translation=${transParam}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.verses) && data.verses.length > 0) {
        interface ApiV { verse: number; text: string; }
        const verses: BibleVerse[] = data.verses.map((v: ApiV) => ({
          book: book.name,
          chapter: safeChapter,
          verse: v.verse,
          text: v.text.replace(/[\r\n]+/g, ' ').trim()
        }));

        const result: BibleChapterData = {
          translation,
          bookId: book.id,
          bookName: book.name,
          chapter: safeChapter,
          totalChapters: book.chaptersCount,
          verses,
          sourceName: data.translation_name || getTranslationInfo(translation).edition
        };

        saveToCache(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Falha na API pública
  }

  throw new Error(
    `Não foi possível carregar ${book.name} ${safeChapter}. Por favor verifique sua conexão com a internet.`
  );
}

function saveToCache(key: string, data: BibleChapterData): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignora erro de cota de armazenamento
    }
  }
}
