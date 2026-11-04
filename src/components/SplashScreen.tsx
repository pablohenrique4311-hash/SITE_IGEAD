import React from 'react';
import { Loader2 } from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';

interface SplashScreenProps {
  isDark?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isDark = false }) => {
  return (
    <div
      role="status"
      aria-label="Carregando aplicativo"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-6 select-none transition-colors duration-200 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
      }`}
    >
      <div className="flex flex-col items-center text-center max-w-sm space-y-6 animate-in fade-in duration-300">
        <div className="relative">
          <ChurchLogo size="lg" className="shadow-lg ring-4 ring-amber-500/20 rounded-2xl" />
        </div>

        <div className="space-y-1.5">
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-amber-600 dark:text-amber-400">
            IGREJA GERAÇÃO ELEITA
          </h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500 dark:text-zinc-400">
            IGEAD-MT
          </p>
        </div>

        <div className="flex items-center gap-2.5 pt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          <span>Iniciando aplicação...</span>
        </div>
      </div>
    </div>
  );
};
