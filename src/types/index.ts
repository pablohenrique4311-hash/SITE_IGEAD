export type BibleTranslationId = 'jfa' | 'kjv';

export interface BibleTranslationInfo {
  id: BibleTranslationId;
  name: string;
  fullName: string;
  edition: string;
  language: string;
  description: string;
}

export type Testament = 'antigo' | 'novo';

export type BookCategory =
  | 'pentateuco'
  | 'historicos'
  | 'poeticos'
  | 'profetas_maiores'
  | 'profetas_menores'
  | 'evangelhos'
  | 'historico_nt'
  | 'cartas_paulinas'
  | 'cartas_gerais'
  | 'profetico';

export interface BibleBook {
  id: string; // e.g. "genesis", "joao"
  bookIndex: number; // 0 to 65
  name: string; // "Gênesis", "João"
  abbreviation: string; // "Gn", "Jo"
  englishName: string; // "Genesis", "John" for KJV query
  englishSlug: string; // "genesis", "john"
  testament: Testament;
  category: BookCategory;
  chaptersCount: number;
}


export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapterData {
  translation: BibleTranslationId;
  bookId: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
  verses: BibleVerse[];
  sourceName: string;
}

export interface YouTubeLiveStatus {
  isLive: boolean;
  videoId?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  startedAt?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  videoUrl: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  dayOfWeek?: string;
  time: string;
  frequency: 'semanal' | 'mensal' | 'especial';
  category: 'culto' | 'jovens' | 'oracao' | 'ensino' | 'especial' | 'mulheres' | 'profetica' | 'familia';
  description: string;
  location: string;
}


export interface ChurchMessage {
  id: string;
  title: string;
  passage: string;
  summary: string;
  author: string;
  date: string;
  category: string;
  youtubeVideoId?: string;
}

export interface PrayerRequest {
  name: string;
  phone?: string;
  email?: string;
  requestType: string;
  message: string;
  confidential: boolean;
  date: string;
}
