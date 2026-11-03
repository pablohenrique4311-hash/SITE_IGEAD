import React from 'react';
import { Loader2 } from 'lucide-react';
import { ChurchLogo } from './ChurchLogo';

interface SplashScreenProps {
  isDark?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="flex flex-col items-center max-w-sm text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Logotipo da Igreja com animação suave de respiração */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-amber-500/10 dark:bg-amber-400/10 blur-xl animate-pulse" />
          <ChurchLogo size="lg" className="relative shadow-md" />
        </div>

        {/* Nomes da Igreja */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-3">
          Igreja Geração Eleita
        </div>

        <h1 className="font-cinzel font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-50 tracking-tight mb-1">
          IGEAD-MT
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-8">
          Mato Grosso • Comunidade de Fé & Palavra
        </p>

        {/* Indicador de Carregamento */}
        <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <Loader2 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
          <span className="font-medium">Carregando aplicativo...</span>
        </div>
      </div>
    </div>
  );
};
