import React, { useState } from 'react';
import { Radio, Volume2, VolumeX, ExternalLink, Play, Film, Calendar } from 'lucide-react';
import { YouTubeLiveStatus, YouTubeVideo } from '../types';
import { formatVideoDate } from '../services/youtubeService';

interface LiveSectionProps {
  liveStatus: YouTubeLiveStatus | null;
  latestVideo?: YouTubeVideo | null;
  onRefreshLive?: () => void;
}

export const LiveSection: React.FC<LiveSectionProps> = ({ liveStatus, latestVideo }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  const isLive = Boolean(liveStatus && liveStatus.isLive && liveStatus.videoId);
  const activeVideoId = isLive ? liveStatus?.videoId : latestVideo?.id;
  const activeTitle = isLive ? liveStatus?.title : latestVideo?.title;
  const activeDescription = isLive ? liveStatus?.description : latestVideo?.description;
  const activeThumb = isLive ? liveStatus?.thumbnailUrl : latestVideo?.thumbnailUrl;

  if (!activeVideoId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&enablejsapi=1&rel=0`;

  return (
    <section
      aria-label={isLive ? 'Transmissão ao vivo da IGEAD-MT' : 'Último culto transmitido da IGEAD-MT'}
      className={`w-full border-b transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8 ${
        isLive
          ? 'bg-gradient-to-b from-red-500/10 via-amber-500/5 to-transparent border-red-500/20'
          : 'bg-gradient-to-b from-amber-500/5 via-transparent to-transparent border-zinc-200/80 dark:border-zinc-800/80'
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho da Seção de Destaque */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {isLive ? (
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
              </span>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    AO VIVO AGORA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                    ÚLTIMO CULTO
                  </span>
                )}
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline">
                  Canal Oficial IGEAD-MT
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-zinc-900 dark:text-zinc-50 mt-1 line-clamp-1">
                {activeTitle || (isLive ? 'Culto Ao Vivo — Geração Eleita' : 'Culto Mais Recente')}
              </h2>
            </div>
          </div>

          {/* Controles de Áudio e Link Oficial */}
          <div className="flex items-center gap-2.5">
            {(isLive || isPlayingRecorded) && (
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-xs cursor-pointer"
                title={isMuted ? 'Ativar Som da Transmissão' : 'Silenciar'}
                aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Áudio: Mudo (Clique para Ouvir)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span>Áudio Ativo</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`https://www.youtube.com/watch?v=${activeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <span>Assistir no YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Player Incorporado 16:9 com Carregamento Inteligente */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-200/90 dark:border-zinc-800 bg-black aspect-video">
          {isLive || isPlayingRecorded ? (
            <iframe
              src={embedUrl}
              title={activeTitle || 'Vídeo IGEAD-MT'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            ></iframe>
          ) : (
            <button
              type="button"
              onClick={() => setIsPlayingRecorded(true)}
              className="w-full h-full relative block text-left group/btn cursor-pointer focus:outline-none"
              aria-label={`Reproduzir ${activeTitle}`}
            >
              <img
                src={activeThumb}
                alt={activeTitle}
                loading="eager"
                className="w-full h-full object-cover group-hover/btn:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-600 group-hover/btn:bg-red-500 group-hover/btn:scale-110 flex items-center justify-center text-white shadow-2xl transition-all duration-200">
                    <Play className="w-7 h-7 ml-1 fill-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Clique para assistir agora
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold font-cinzel text-white line-clamp-1">
                      {activeTitle}
                    </h3>
                  </div>
                </div>
              </div>
              <span className="absolute top-4 right-4 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/80 text-white backdrop-blur-xs">
                HD 16:9
              </span>
            </button>
          )}
        </div>

        {/* Informações Complementares abaixo do player */}
        {activeDescription && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <p className="line-clamp-2 leading-relaxed max-w-3xl">
              {activeDescription}
            </p>
            {latestVideo?.publishedAt && !isLive && (
              <span className="shrink-0 flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {formatVideoDate(latestVideo.publishedAt)}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
