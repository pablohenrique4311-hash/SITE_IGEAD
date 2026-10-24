import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      title={isDark ? 'Ativar Modo Claro (White Mode)' : 'Ativar Modo Escuro (Black Mode)'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
        isDark
          ? 'bg-zinc-800 text-amber-400 hover:bg-zinc-700 hover:text-amber-300 border border-zinc-700/60'
          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 border border-zinc-200/80 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 -rotate-12 hover:rotate-0 text-zinc-700" />
      )}
      <span className="sr-only">{isDark ? 'Tema Claro' : 'Tema Escuro'}</span>
    </button>
  );
};
