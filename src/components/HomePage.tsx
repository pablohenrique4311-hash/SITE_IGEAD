import React from 'react';
import {
  BookOpen,
  Calendar,
  Radio,
  FileText,
  Users,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { PageId } from './Header';
import { YouTubeLiveStatus, YouTubeVideo } from '../types';
import { LiveSection } from './LiveSection';
import { LatestVideos } from './LatestVideos';
import { VerseOfTheDay } from './VerseOfTheDay';

interface HomePageProps {
  onNavigate: (page: PageId, bookId?: string, chapter?: number) => void;
  liveStatus: YouTubeLiveStatus | null;
  videos: YouTubeVideo[];
  isVideosLoading: boolean;
  onRefreshVideos: () => void;
  onRefreshLive: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  liveStatus,
  videos,
  isVideosLoading,
  onRefreshVideos,
  onRefreshLive
}) => {
  return (
    <div className="w-full">
      {/* SEÇÃO 1: TRANSMISSÃO AO VIVO DO YOUTUBE OU ÚLTIMO CULTO */}
      <LiveSection
        liveStatus={liveStatus}
        latestVideo={videos.length > 0 ? videos[0] : null}
        onRefreshLive={onRefreshLive}
      />


      {/* SEÇÃO 2: ÁREA DE DESTAQUE / HERO CRISTÃO */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
        {/* Glow dourado suave de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bem-vindo à Casa do Senhor • IGEAD-MT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cinzel font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
            Uma Igreja Viva para uma{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500">
              Geração Eleita
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Somos uma comunidade cristã em Mato Grosso alicerçada na Palavra de Deus, no amor fraterno e no poder do Espírito Santo. Venha caminhar conosco rumo ao propósito eterno de Deus.
          </p>

          {/* Botões de Ação do Hero */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => onNavigate('bible', 'joao', 3)}
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold uppercase tracking-wider bg-zinc-900 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950 text-white transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ler a Bíblia Sagrada</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('agenda')}
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold uppercase tracking-wider bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Nossos Cultos e Horários</span>
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: VERSÍCULO DO DIA */}
      <VerseOfTheDay onOpenBible={(bookId, chapter) => onNavigate('bible', bookId, chapter)} />

      {/* SEÇÃO 4: SEIS VÍDEOS MAIS RECENTES DO YOUTUBE */}
      <LatestVideos
        videos={videos}
        isLoading={isVideosLoading}
        onRefresh={onRefreshVideos}
      />

      {/* SEÇÃO 5: ATALHOS RÁPIDOS & PILARES DA IGREJA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Conecte-se com a IGEAD-MT
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50 mt-1">
            Canais de Comunhão e Fé
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            Acesse as principais áreas do nosso ministério e encontre apoio espiritual para você e sua família.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Bíblia */}
          <div
            onClick={() => onNavigate('bible')}
            className="group p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:shadow-xl hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                Bíblia Sagrada
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Navegue pelos 66 livros bíblicos com duas traduções completas: Almeida (JFA) e King James (KJV).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Abrir Leitor Bíblico</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: Programação */}
          <div
            onClick={() => onNavigate('agenda')}
            className="group p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:shadow-xl hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                Cultos & Agenda
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Quarta (Mulheres), Sexta (Sexta Profética) e Domingo (Culto da Família), sempre pontualmente às 19:30.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Ver Programação</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: Mensagens */}
          <div
            onClick={() => onNavigate('content')}
            className="group p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:shadow-xl hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                Estudos Bíblicos
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Acesse mensagens temáticas, sermões e reflexões para o seu crescimento espiritual contínuo.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Explorar Conteúdos</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4: Pedido de Oração & Sobre */}
          <div
            onClick={() => onNavigate('about')}
            className="group p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:shadow-xl hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                Pedido de Oração
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Envie seu pedido para nossa equipe pastoral de intercessão e conheça a visão da IGEAD-MT.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Enviar Pedido</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 6: CONVITE PARA O PRÓXIMO CULTO */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-600/90 dark:to-amber-800 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Cultos Presenciais & Ao Vivo no YouTube • Sempre às 19:30
            </span>
            <h3 className="text-2xl sm:text-3xl font-cinzel font-bold">
              Culto da Família • Sexta Profética • Culto das Mulheres
            </h3>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl">
              Venha adorar conosco às Quartas (Mulheres), Sextas (Sexta Profética) e Domingos (Culto da Família), todos com início pontual às 19:30.
            </p>
          </div>


          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('agenda')}
              className="px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-white text-zinc-900 hover:bg-amber-50 transition-colors shadow-md cursor-pointer"
            >
              Ver Horários
            </button>
            <button
              type="button"
              onClick={() => onNavigate('videos')}
              className="px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-black/20 hover:bg-black/30 text-white border border-white/20 transition-colors cursor-pointer"
            >
              Canal YouTube
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
