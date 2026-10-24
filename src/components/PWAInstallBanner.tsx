import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ChurchLogo } from './ChurchLogo';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismiss } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Escuta evento customizado para acionar instruções de instalação pelo menu
  React.useEffect(() => {
    const handleOpenIOS = () => setShowIOSModal(true);
    window.addEventListener('open-ios-install', handleOpenIOS);
    return () => window.removeEventListener('open-ios-install', handleOpenIOS);
  }, []);

  // Se já estiver instalado em modo aplicativo (standalone), não exibe nada
  if (isInstalled) {
    return null;
  }

  // Não exibe se o navegador não suportar instalação ou se não for iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    await install();
  };

  // Se o usuário minimizou ou dispensou temporariamente, mostra apenas um botão flutuante discreto
  if (isDismissed || isMinimized) {
    return (
      <>
        <div className="fixed bottom-6 left-4 z-30 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900/90 dark:bg-zinc-800/90 hover:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-zinc-100 shadow-xl border border-amber-500/30 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer hover:scale-105"
            title="Instalar Aplicativo IGEAD-MT"
            aria-label="Abrir instalador do aplicativo"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Instalar App</span>
          </button>
        </div>

        {/* Modal para iOS quando solicitado via botão minimizado */}
        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      {/* Banner Flutuante Discreto */}
      <aside
        className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:w-96 z-30 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300"
        aria-label="Instalação do Aplicativo"
      >
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-amber-500/30 dark:border-amber-500/25 shadow-2xl text-zinc-900 dark:text-zinc-100">
          <div className="flex items-start justify-between gap-3">
            {/* Ícone e Identificação */}
            <div className="flex items-center gap-3">
              <ChurchLogo size="sm" className="shadow-xs" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold font-cinzel text-zinc-900 dark:text-zinc-50">
                    Aplicativo IGEAD-MT
                  </h4>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  Bíblia offline e cultos no seu celular
                </p>
              </div>
            </div>

            {/* Botão de Fechar / Dispensar */}
            <button
              type="button"
              onClick={() => {
                setIsMinimized(true);
                dismiss();
              }}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Dispensar aviso de instalação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Botões de Ação */}
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar Aplicativo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="py-2 px-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              Depois
            </button>
          </div>
        </div>
      </aside>

      {/* Modal explicativo para dispositivos iOS */}
      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  );
};

interface IOSInstallModalProps {
  onClose: () => void;
}

const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <ChurchLogo size="sm" />
            <div>
              <h3 className="text-sm font-bold font-cinzel text-zinc-900 dark:text-zinc-50">
                Instalar no iPhone / iPad
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Adicione o app à sua tela de início
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <p>
              Toque no botão <strong>Compartilhar</strong>{' '}
              <Share className="w-3.5 h-3.5 inline text-blue-500 align-text-bottom" /> na barra inferior do Safari.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <p>
              Role a lista para baixo e toque em{' '}
              <strong>Adicionar à Tela de Início</strong>{' '}
              <PlusSquare className="w-3.5 h-3.5 inline text-zinc-700 dark:text-zinc-300 align-text-bottom" />.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <p>
              Toque em <strong>Adicionar</strong> no canto superior direito para concluir.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
        >
          Entendi
        </button>
      </div>
    </div>
  );
};
