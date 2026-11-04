import React, { useState } from 'react';
import {
  BookOpen,
  Radio,
  Calendar,
  FileText,
  Info,
  Menu,
  X,
  Instagram,
  HeartHandshake,
  LogOut,
  Download
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ChurchLogo } from './ChurchLogo';
import { CHURCH_INFO } from '../constants/churchInfo';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBanner } from './NotificationBanner';

export type PageId = 'home' | 'bible' | 'videos' | 'agenda' | 'content' | 'giving' | 'about';

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
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { user, firstName, displayName, signOut } = useAuth();

  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Início', icon: null },
    { id: 'bible', label: 'Bíblia Sagrada', icon: <BookOpen className="w-3.5 h-3.5" /> },
    {
      id: 'videos',
      label: 'Ao Vivo & Vídeos',
      icon: (
        <span className="relative inline-flex items-center">
          <Radio className={`w-3.5 h-3.5 mr-1 ${isLive ? 'text-red-500 animate-pulse' : ''}`} />
          {isLive && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </span>
      )
    },
    { id: 'agenda', label: 'Programação', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'content', label: 'Estudos', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'giving', label: 'Dízimos & Ofertas', icon: <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> },
    { id: 'about', label: 'Sobre & Contato', icon: <Info className="w-3.5 h-3.5" /> }
  ];

  const handleNavClick = (id: PageId) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    signOut();
  };

  return (
    <>
      <header
        style={{ paddingTop: 'var(--header-safe-top)' }}
        className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200 shadow-xs"
      >
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 w-full">
          
          {/* ========================================================
              ÁREA 1 (ESQUERDA): Logo Oficial, Nome IGEAD-MT e Selo
             ======================================================== */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
              aria-label="Página inicial da IGEAD-MT"
            >
              <ChurchLogo size="md" className="group-hover:scale-105 shrink-0 transition-transform duration-200" />

              <div className="flex flex-col justify-center shrink-0 leading-tight">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-cinzel font-bold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-50 whitespace-nowrap group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    IGEAD-MT
                  </span>

                  <span className="hidden sm:inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap leading-none">
                    Geração Eleita
                  </span>

                  {isLive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap leading-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      AO VIVO
                    </span>
                  )}
                </div>

                <span className="hidden 2xl:inline text-[11px] text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap mt-0.5">
                  Igreja Geração Eleita • Mato Grosso
                </span>
              </div>
            </button>
          </div>

          {/* ========================================================
              ÁREA 2 (CENTRO): Links de Navegação Horizontal (Desktop)
             ======================================================== */}
          <nav className="hidden xl:flex items-center justify-center gap-1 2xl:gap-1.5 shrink-0 px-2" aria-label="Navegação principal">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 2xl:px-3 py-1.5 rounded-xl text-xs 2xl:text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold border border-amber-500/25 shadow-2xs'
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

          {/* ========================================================
              ÁREA 3 (DIREITA - DESKTOP >= 1280px): Tema, Redes e Perfil
             ======================================================== */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-2.5 shrink-0">
            {/* 1. Botão de alternar Tema (Lua/Sol) */}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} className="shrink-0" />

            {/* 2. Ícone/link do Instagram Oficial (@igead_cba) */}
            <a
              href={CHURCH_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
              title="Instagram Oficial @igead_cba"
              aria-label="Instagram Oficial @igead_cba"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* 3. Botão Verde Oficial do WhatsApp */}
            <a
              href={CHURCH_INFO.whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs hover:shadow-md transition-all whitespace-nowrap shrink-0"
              title="Entrar no Grupo Oficial do WhatsApp da IGEAD-MT"
              aria-label="Grupo Oficial do WhatsApp"
            >
              <svg
                className="w-4 h-4 fill-current shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* 4. Badge / Perfil do Usuário Logado */}
            <div className="relative shrink-0">
              <div className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 shadow-2xs shrink-0">
                {/* Avatar circular com inicial */}
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {firstName ? firstName.charAt(0).toUpperCase() : 'M'}
                </div>

                {/* Nome do usuário */}
                <span className="text-xs font-bold truncate max-w-[90px] 2xl:max-w-[120px]" title={displayName || firstName}>
                  {firstName || 'Membro'}
                </span>

                {/* Botão Sair / Logout */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Sair da conta (Logout)"
                  aria-label="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Sair</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              ÁREA 4 (MOBILE E TABLETS < 1280px): Tema e Menu Hambúrguer
             ======================================================== */}
          <div className="flex xl:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Alternar Tema (Claro / Escuro) */}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} className="shrink-0" />

            {/* Botão Menu Hambúrguer (3 barrinhas / X) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="shrink-0 inline-flex items-center justify-center p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* GAVETA / MENU MOBILE E TABLETS (< 1280px) RETRÁTIL */}
      {mobileMenuOpen && (
        <div
          style={{ maxHeight: 'calc(100vh - var(--header-total-height))' }}
          className="xl:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-xl px-4 pt-3 pb-8 shadow-2xl animate-in slide-in-from-top duration-200 overflow-y-auto"
        >
          {/* Card do Usuário Logado (Perfil Completo no Mobile) */}
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {firstName ? firstName.charAt(0).toUpperCase() : 'M'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">
                  Olá, {displayName || firstName}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer shrink-0"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>

          {/* Lista de Navegação Mobile */}
          <nav className="flex flex-col gap-1" aria-label="Menu móvel">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                      AO VIVO
                    </span>
                  )}
                </button>
              );
            })}

            {/* Notificações Push no Menu Mobile */}
            <div className="pt-2">
              <NotificationBanner />
            </div>

            {/* Ações Rápidas no Menu Mobile: WhatsApp Oficial, Instagram e Instalação */}
            <div className="pt-3 mt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
              {/* WhatsApp Oficial da Igreja */}
              <a
                href={CHURCH_INFO.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
              >
                <svg
                  className="w-4 h-4 fill-current shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Entrar no Grupo do WhatsApp</span>
              </a>

              {/* Instagram Oficial */}
              <a
                href={CHURCH_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white font-semibold text-xs shadow-xs"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram @igead_cba</span>
              </a>

              {/* Instalar PWA */}
              {!isInstalled && (isInstallable || isIOS) && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isIOS) {
                      window.dispatchEvent(new CustomEvent('open-ios-install'));
                    } else {
                      install();
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/25 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar App IGEAD-MT</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>

    {/* Espaçador que reserva fisicamente a altura total do cabeçalho fixo (incluindo safe-area) */}
    <div
      className="w-full shrink-0 pointer-events-none select-none"
      style={{ height: 'var(--header-total-height)' }}
      aria-hidden="true"
    />
  </>
);
};
