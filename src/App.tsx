import React, { useState, useEffect, useCallback } from 'react';
import { Header, PageId } from './components/Header';
import { HomePage } from './components/HomePage';
import { BibleReader } from './components/BibleReader';
import { LatestVideos } from './components/LatestVideos';
import { EventsSection } from './components/EventsSection';
import { ContentSection } from './components/ContentSection';
import { AboutSection } from './components/AboutSection';
import { GivingSection } from './components/GivingSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { YouTubeLiveStatus, YouTubeVideo } from './types';
import { checkLiveStream, getLatestVideos } from './services/youtubeService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { SplashScreen } from './components/SplashScreen';

/**
 * Conteúdo principal autenticado da aplicação IGEAD-MT
 */
interface AuthenticatedAppProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ isDark, onToggleTheme }) => {
  // 1. NAVEGAÇÃO ENTRE PÁGINAS
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [bibleInitialBook, setBibleInitialBook] = useState<string | undefined>(undefined);
  const [bibleInitialChapter, setBibleInitialChapter] = useState<number | undefined>(undefined);

  const navigateTo = (page: PageId, bookId?: string, chapter?: number) => {
    setBibleInitialBook(bookId);
    setBibleInitialChapter(chapter);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. INTEGRAÇÃO COM YOUTUBE (Live Detection e Vídeos Recentes)
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

    const liveIntervalId = setInterval(() => {
      refreshLiveStatus();
    }, 60 * 1000);

    return () => clearInterval(liveIntervalId);
  }, [refreshLiveStatus, refreshVideosList]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200 overflow-x-clip w-full max-w-full">
      {/* Cabeçalho Fixo com Navegação, Logo, Tema, Instagram, WhatsApp e Perfil */}
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
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
          <LatestVideos
            videos={videos}
            isLoading={isVideosLoading}
            onRefresh={() => {
              refreshVideosList(true);
              refreshLiveStatus(true);
            }}
          />
        )}

        {currentPage === 'agenda' && <EventsSection />}

        {currentPage === 'content' && (
          <ContentSection
            onOpenBibleReference={(bookId, chapter) => navigateTo('bible', bookId, chapter)}
          />
        )}

        {currentPage === 'giving' && <GivingSection />}

        {currentPage === 'about' && <AboutSection />}
      </main>

      {/* Rodapé com Identificação da Igreja e Navegação Completa */}
      <Footer onNavigate={navigateTo} />

      {/* Indicador de Conectividade / Modo Offline do PWA */}
      <OfflineIndicator />

      {/* Banner / Botão Flutuante Discreto de Instalação do Aplicativo (PWA) */}
      <PWAInstallBanner />

      {/* Botão Fixo/Flutuante para Comunidade e Grupo Oficial no WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
};

/**
 * Componente intermediário que gerencia a transição de autenticação e estados
 */
const AppRoot: React.FC = () => {
  const { user, loading } = useAuth();

  // TEMA CLARO / ESCURO (White Mode padrão, persistido no navegador)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('igead_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    }
    return false; // Padrão: Modo Claro (White Mode)
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

  // Garante que, ao autenticar com sucesso, qualquer foco residual em campos do formulário
  // seja removido, a rolagem volte ao topo e a escala do viewport retorne a 100% (evita zoom do Safari)
  useEffect(() => {
    if (user) {
      if (document.activeElement && 'blur' in document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
      window.scrollTo(0, 0);

      // Reafirma a meta viewport para escala normal 1.0 sem travar zoom manual de acessibilidade
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
      }
    }
  }, [user]);

  // 1. Estado de Carregamento Inicial: Splash Screen suave sem flicker
  if (loading) {
    return <SplashScreen isDark={isDark} />;
  }

  // 2. Bloqueio Inicial: Se não estiver autenticado, exibe a tela de login cheia dedicada
  if (!user) {
    return <AuthScreen isDark={isDark} onToggleTheme={toggleTheme} />;
  }

  // 3. Usuário autenticado: Acesso completo ao aplicativo
  return <AuthenticatedApp isDark={isDark} onToggleTheme={toggleTheme} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
}
