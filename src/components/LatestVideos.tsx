import React, { useState } from 'react';
import { Play, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { YouTubeVideo } from '../types';
import { CHANNEL_URL, formatVideoDate } from '../services/youtubeService';

interface LatestVideosProps {
  videos: YouTubeVideo[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const LatestVideos: React.FC<LatestVideosProps> = ({
  videos,
  isLoading,
  onRefresh
}) => {
  // Guarda qual vídeo está sendo reproduzido no momento (carregamento sob demanda 16:9)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Cabeçalho Limpo da Seção */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
            Canal Oficial YouTube
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50 tracking-tight">
            Cultos e Mensagens Recentes
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Transmissões gravadas, cultos da família e pregações da Palavra de Deus direto do canal oficial da IGEAD-MT.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Botão de Atualizar Lista */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer disabled:opacity-50"
            title="Atualizar vídeos do canal"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            <span>{isLoading ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          {/* Link para o Canal Oficial */}
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white transition-all shadow-xs cursor-pointer"
          >
            <span>Ver no YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grade de Vídeos Oficiais (Layout Profissional sem nenhum banner ou aviso de chave) */}
      {isLoading && videos.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 animate-pulse"
            >
              <div className="aspect-video bg-zinc-200 dark:bg-zinc-800"></div>
              <div className="p-4 space-y-2.5">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Nenhum vídeo carregado no momento
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Clique em Atualizar ou acesse diretamente o canal oficial da igreja.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => {
            const isPlaying = playingVideoId === video.id;
            const embedSrc = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;

            return (
              <article
                key={video.id}
                className="group flex flex-col rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden bg-white dark:bg-zinc-900/70 hover:shadow-xl hover:border-amber-500/40 transition-all duration-200"
              >
                {/* Proporção 16:9 com Carregamento Sob Demanda */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  {isPlaying ? (
                    <iframe
                      src={embedSrc}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    ></iframe>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayingVideoId(video.id)}
                      className="w-full h-full relative block text-left group/btn cursor-pointer focus:outline-none"
                      aria-label={`Reproduzir ${video.title}`}
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover/btn:scale-105 transition-transform duration-300"
                      />
                      {/* Overlay com gradiente suave e botão de play */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600/90 group-hover/btn:bg-red-600 group-hover/btn:scale-110 flex items-center justify-center text-white shadow-xl transition-all duration-200">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white backdrop-blur-xs">
                        16:9
                      </span>
                    </button>
                  )}
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="text-[11px] font-medium">
                      {formatVideoDate(video.publishedAt)}
                    </span>

                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      <span>Assistir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Botão de Rodapé da Seção */}
      <div className="mt-12 text-center">
        <a
          href={CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white transition-all shadow-md hover:scale-[1.01] cursor-pointer"
        >
          <span>Acessar Todos os Vídeos no Canal Oficial da IGEAD-MT</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};
