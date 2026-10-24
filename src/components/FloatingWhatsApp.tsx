import React, { useState } from 'react';
import { MessageCircle, ExternalLink, Users, X } from 'lucide-react';
import { CHURCH_INFO } from '../constants/churchInfo';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* Popover Card quando expandido */}
      {isOpen && (
        <div className="mb-3 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                  Comunidade no WhatsApp
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Igreja Geração Eleita (IGEAD-MT)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Faça parte do nosso grupo oficial no WhatsApp e receba em primeira mão:
            <ul className="mt-2 space-y-1 text-zinc-500 dark:text-zinc-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Avisos e links dos cultos ao vivo
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Devocionais e versículos diários
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Programação especial da igreja
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href={CHURCH_INFO.whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Entrar no Grupo Agora</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="text-center">
              <a
                href={`https://wa.me/${CHURCH_INFO.phoneClean}?text=${encodeURIComponent('A paz do Senhor! Gostaria de informações sobre a Igreja Geração Eleita.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Ou fale no WhatsApp: <strong>{CHURCH_INFO.phone}</strong>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante Padrão */}
      <div className="flex items-center gap-2">
        <a
          href={CHURCH_INFO.whatsappGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Entrar no Grupo Oficial do WhatsApp da IGEAD-MT"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
        >
          {/* Ícone estilizado do WhatsApp */}
          <span className="relative flex items-center justify-center">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
            </span>
          </span>
          <span className="text-xs font-bold tracking-tight whitespace-nowrap hidden sm:inline">
            Grupo no WhatsApp
          </span>
        </a>

        {/* Botão de info complementar para abrir popover */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
          title="Ver informações do grupo"
          aria-label="Ver informações do grupo no WhatsApp"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
