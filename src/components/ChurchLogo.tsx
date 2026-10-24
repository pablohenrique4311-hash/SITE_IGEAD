import React, { useState } from 'react';

export interface ChurchLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  forceFallback?: boolean;
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  className = '',
  size = 'md',
  forceFallback = false
}) => {
  const [hasError, setHasError] = useState(forceFallback);

  // Dynamic base URL resolution for GitHub Pages subpath or root deployments
  const rawBase = import.meta.env.BASE_URL || '/';
  const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const logoSrc = `${baseUrl}assets/aistudio/Logotipo_gera__o_eleita_a16b7b59.png`;

  // Standard fixed dimensions so that image failure NEVER shifts or breaks layout
  const dimensions = {
    sm: 'w-8 h-8 min-w-[32px] min-h-[32px]',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px]',
    lg: 'w-14 h-14 min-w-[56px] min-h-[56px]'
  }[size];

  // Elegant golden emblem fallback when image is missing or fails to load
  if (hasError || forceFallback) {
    return (
      <div
        className={`${dimensions} shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-300 text-white shadow-sm border border-amber-200/50 select-none overflow-hidden transition-transform duration-200 ${className}`}
        title="Igreja Geração Eleita — IGEAD-MT"
        aria-label="Emblema Oficial IGEAD-MT"
        role="img"
      >
        <div className="flex flex-col items-center justify-center text-center leading-none">
          <span className="text-[10px] text-amber-100 font-serif leading-none opacity-90 drop-shadow-xs">
            ✝
          </span>
          <span className="font-cinzel font-black tracking-wider text-white text-xs sm:text-sm drop-shadow-xs leading-tight">
            IG
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${dimensions} shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-transform duration-200 ${className}`}
    >
      <img
        src={logoSrc}
        alt="Logotipo Oficial Igreja Geração Eleita IGEAD-MT"
        className="w-full h-full object-contain shrink-0"
        onError={() => setHasError(true)}
        loading="eager"
      />
    </div>
  );
};
