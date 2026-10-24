import React, { useState } from 'react';
import { BookOpen, Radio, Calendar, FileText, Info, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export type PageId = 'home' | 'bible' | 'videos' | 'agenda' | 'content' | 'about';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  isDark,
  onToggleTheme,
  isLive
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string; icon: React.ReactNode; isSpecial?: boolean }[] = [
    { id: 'home', label: 'Início', icon: null },
    { id: 'bible', label: 'Bíblia Sagrada', icon: <BookOpen className="w-4 h-4" />, isSpecial: true },
    {
      id: 'videos',
      label: 'Ao Vivo & Vídeos',
      icon: (
        <span className="relative inline-flex items-center">
          <Radio className={`w-4 h-4 mr-1 ${isLive ? 'text-red-500 animate-pulse' : ''}`} />
          {isLive && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </span>
      )
    },
    { id: 'agenda', label: 'Programação', icon: <Calendar className="w-4 h-4" /> },
    { id: 'content', label: 'Estudos', icon: <FileText className="w-4 h-4" /> },
    { id: 'about', label: 'Sobre & Contato', icon: <Info className="w-4 h-4" /> }
  ];

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Nome Oficial */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            aria-label="Página inicial da IGEAD-MT"
          >
            {/* Logotipo Oficial IGEAD-MT */}
            <img
              src="/assets/aistudio/Logotipo_gera__o_eleita_a16b7b59.png"
              alt="Logotipo Oficial Igreja Geração Eleita IGEAD-MT"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 group-hover:scale-105 transition-transform duration-200"
            />


            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-cinzel font-bold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-50 whitespace-nowrap group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  IGEAD-MT
                </span>

                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Geração Eleita
                </span>
                {isLive && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    AO VIVO
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Igreja Geração Eleita • Mato Grosso
              </span>
            </div>
          </button>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/20'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Ações do Topo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão rápido para a Bíblia no Desktop */}
            <button
              type="button"
              onClick={() => handleNavClick('bible')}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-900 text-white hover:bg-amber-600 dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ler a Bíblia</span>
            </button>

            {/* Alternância de tema Claro / Escuro */}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {/* Botão menu mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Retrátil */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/98 dark:bg-zinc-950/98 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1.5" aria-label="Menu móvel">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/20'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'videos' && isLive && (
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      AO VIVO
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
