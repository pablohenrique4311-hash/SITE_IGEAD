import React, { useState, useEffect, useCallback } from 'react';
import { Header, PageId } from './components/Header';
import { HomePage } from './components/HomePage';
import { BibleReader } from './components/BibleReader';
import { LatestVideos } from './components/LatestVideos';
import { EventsSection } from './components/EventsSection';
import { ContentSection } from './components/ContentSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { YouTubeLiveStatus, YouTubeVideo } from './types';
import { checkLiveStream, getLatestVideos } from './services/youtubeService';

export default function App() {
  // 1. TEMA CLARO / ESCURO (White Mode padrão, persistido no navegador)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('igead_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    }
    return false; // Padrão: Modo Claro (White Mode) conforme especificação
  });

  // Atualiza a classe no elemento <html> ao alternar o tema
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      window.localStorage.setItem('igead_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      window.localStorage.setItem('igead_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // 2. NAVEGAÇÃO ENTRE PÁGINAS
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [bibleInitialBook, setBibleInitialBook] = useState<string>('joao');
  const [bibleInitialChapter, setBibleInitialChapter] = useState<number>(3);

  const navigateTo = (page: PageId, bookId?: string, chapter?: number) => {
    if (bookId) setBibleInitialBook(bookId);
    if (chapter) setBibleInitialChapter(chapter);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. INTEGRAÇÃO COM YOUTUBE (Live Detection e Vídeos Recentes)
  const [liveStatus, setLiveStatus] = useState<YouTubeLiveStatus | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState<boolean>(true);

  // Consulta da live (com intervalo de 60 segundos)
  const refreshLiveStatus = useCallback(async (force = false) => {
    try {
      const status = await checkLiveStream(force);
      setLiveStatus(status);
    } catch {
      setLiveStatus({ isLive: false });
    }
  }, []);

  // Consulta dos vídeos recentes oficiais (8 vídeos)
  const refreshVideosList = useCallback(async (force = false) => {
    setIsVideosLoading(true);
    try {
      const list = await getLatestVideos(8, force);
      setVideos(list);
    } catch {
      // Falha tratada no service
    } finally {
      setIsVideosLoading(false);
    }
  }, []);


  // Carregamento inicial e timer de 60 segundos para checagem de Live
  useEffect(() => {
    refreshLiveStatus();
    refreshVideosList();

    // REGRA 3: Atualização automática a cada 60 segundos
    const liveIntervalId = setInterval(() => {
      refreshLiveStatus();
    }, 60 * 1000);

    return () => clearInterval(liveIntervalId);
  }, [refreshLiveStatus, refreshVideosList]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      {/* Cabeçalho Fixo com Navegação, Logo e ThemeToggle */}
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isLive={Boolean(liveStatus?.isLive)}
      />

      {/* Conteúdo da Página Ativa */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            liveStatus={liveStatus}
            videos={videos}
            isVideosLoading={isVideosLoading}
            onRefreshVideos={() => refreshVideosList(true)}
            onRefreshLive={() => refreshLiveStatus(true)}
          />
        )}

        {currentPage === 'bible' && (
          <BibleReader
            initialBookId={bibleInitialBook}
            initialChapter={bibleInitialChapter}
          />
        )}

        {currentPage === 'videos' && (
          <div className="py-6">
            <LatestVideos
              videos={videos}
              isLoading={isVideosLoading}
              onRefresh={() => {
                refreshVideosList(true);
                refreshLiveStatus(true);
              }}
            />
          </div>
        )}

        {currentPage === 'agenda' && <EventsSection />}

        {currentPage === 'content' && (
          <ContentSection
            onOpenBibleReference={(bookId, chapter) => navigateTo('bible', bookId, chapter)}
          />
        )}

        {currentPage === 'about' && <AboutSection />}
      </main>

      {/* Rodapé com Identificação da Igreja e Navegação Completa */}
      <Footer onNavigate={navigateTo} />

      {/* Botão Fixo/Flutuante para Comunidade e Grupo Oficial no WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
}
