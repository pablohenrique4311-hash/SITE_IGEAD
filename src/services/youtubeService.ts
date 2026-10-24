/**
 * Integração Oficial com a YouTube Data API v3
 * Igreja Geração Eleita — IGEAD-MT
 */

import { YouTubeLiveStatus, YouTubeVideo } from '../types';

export const API_KEY = "AIzaSyDV754ROGEUEKioxFHGceXBV5PCIav-PMI";
export const CHANNEL_ID = "UCwWs_spTAEZaojGQDQSYQ-A";
export const UPLOADS_PLAYLIST_ID = "UUwWs_spTAEZaojGQDQSYQ-A";
export const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;

// Cache em memória para otimização de requisições e respeito à cota da API
let cachedLiveStatus: { data: YouTubeLiveStatus; timestamp: number } | null = null;
let liveRequestPromise: Promise<YouTubeLiveStatus> | null = null;

let cachedVideos: { data: YouTubeVideo[]; timestamp: number } | null = null;
let videosRequestPromise: Promise<YouTubeVideo[]> | null = null;

const LIVE_CACHE_TTL_MS = 60 * 1000; // 60 segundos
const VIDEOS_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos

/**
 * Verificação de transmissão ao vivo em tempo real
 * Endpoint: https://www.googleapis.com/youtube/v3/search
 */
export async function checkLiveStream(forceRefresh = false): Promise<YouTubeLiveStatus> {
  const now = Date.now();

  if (!forceRefresh && cachedLiveStatus && now - cachedLiveStatus.timestamp < LIVE_CACHE_TTL_MS) {
    return cachedLiveStatus.data;
  }

  if (liveRequestPromise) {
    return liveRequestPromise;
  }

  liveRequestPromise = (async () => {
    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('channelId', CHANNEL_ID);
      url.searchParams.set('eventType', 'live');
      url.searchParams.set('type', 'video');
      url.searchParams.set('key', API_KEY);
      url.searchParams.set('maxResults', '1');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[YouTube API] Live check status: ${response.status}`);
        return { isLive: false };
      }

      const data = await response.json();

      interface YouTubeSearchItem {
        id: { videoId: string };
        snippet: {
          title: string;
          description: string;
          thumbnails?: {
            maxres?: { url: string };
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
          publishedAt: string;
        };
      }

      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        const item = data.items[0] as YouTubeSearchItem;
        const liveStatus: YouTubeLiveStatus = {
          isLive: true,
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl:
            item.snippet.thumbnails?.maxres?.url ||
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
          startedAt: item.snippet.publishedAt
        };
        cachedLiveStatus = { data: liveStatus, timestamp: Date.now() };
        return liveStatus;
      }

      const noLive: YouTubeLiveStatus = { isLive: false };
      cachedLiveStatus = { data: noLive, timestamp: Date.now() };
      return noLive;
    } catch (error) {
      console.warn('[YouTube API] Erro ao consultar transmissão ao vivo:', error);
      return { isLive: false };
    } finally {
      liveRequestPromise = null;
    }
  })();

  return liveRequestPromise;
}

/**
 * Listagem dos vídeos oficiais mais recentes do canal via Playlist de Uploads
 * Endpoint: https://www.googleapis.com/youtube/v3/playlistItems
 */
export async function getLatestVideos(maxResults = 8, forceRefresh = false): Promise<YouTubeVideo[]> {
  const now = Date.now();

  if (!forceRefresh && cachedVideos && now - cachedVideos.timestamp < VIDEOS_CACHE_TTL_MS) {
    return cachedVideos.data;
  }

  if (videosRequestPromise) {
    return videosRequestPromise;
  }

  videosRequestPromise = (async () => {
    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('playlistId', UPLOADS_PLAYLIST_ID);
      url.searchParams.set('maxResults', String(maxResults));
      url.searchParams.set('key', API_KEY);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`[YouTube API] Falha ao consultar playlist de uploads (${response.status})`);
        return cachedVideos?.data || [];
      }

      const data = await response.json();

      interface PlaylistItem {
        snippet: {
          resourceId: { videoId: string };
          title: string;
          description: string;
          publishedAt: string;
          thumbnails?: {
            maxres?: { url: string };
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
        };
      }

      if (!data.items || !Array.isArray(data.items)) {
        return [];
      }

      const videos: YouTubeVideo[] = data.items.map((item: PlaylistItem) => {
        const vidId = item.snippet.resourceId.videoId;
        const thumb =
          item.snippet.thumbnails?.maxres?.url ||
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;

        return {
          id: vidId,
          title: item.snippet.title,
          description: item.snippet.description || '',
          thumbnailUrl: thumb,
          publishedAt: item.snippet.publishedAt,
          videoUrl: `https://www.youtube.com/watch?v=${vidId}`
        };
      });

      cachedVideos = { data: videos, timestamp: Date.now() };
      return videos;
    } catch (error) {
      console.error('[YouTube API] Erro ao carregar vídeos do canal:', error);
      return cachedVideos?.data || [];
    } finally {
      videosRequestPromise = null;
    }
  })();

  return videosRequestPromise;
}

/**
 * Formata data ISO para PT-BR (ex: "23 de Outubro de 2026")
 */
export function formatVideoDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
