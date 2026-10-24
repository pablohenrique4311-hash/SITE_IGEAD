import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  Users,
  Sparkles,
  Heart,
  Navigation,
  ExternalLink,
  Copy,
  CheckCheck,
  Phone,
  Mail,
  Instagram,
  MessageCircle
} from 'lucide-react';
import { ChurchEvent } from '../types';
import { CHURCH_INFO } from '../constants/churchInfo';

export const DEFAULT_EVENTS: ChurchEvent[] = [
  {
    id: 'culto_mulheres',
    title: 'Culto das Mulheres',
    dayOfWeek: 'Toda Quarta-feira',
    time: '19:30',
    frequency: 'semanal',
    category: 'mulheres',
    description: 'Encontro abençoado de louvor, oração, comunhão fraterna e edificação bíblica para todas as mulheres e convidadas.',
    location: 'Templo Sede • Pedra 90, Cuiabá - MT'
  },
  {
    id: 'sexta_profetica',
    title: 'Sexta Profética',
    dayOfWeek: 'Toda Sexta-feira',
    time: '19:30',
    frequency: 'semanal',
    category: 'profetica',
    description: 'Noite de clamor fervoroso, manifestação do poder de Deus, libertação e ministração profética da Palavra.',
    location: 'Templo Sede • Pedra 90, Cuiabá - MT'
  },
  {
    id: 'culto_familia',
    title: 'Culto da Família',
    dayOfWeek: 'Todo Domingo',
    time: '19:30',
    frequency: 'semanal',
    category: 'familia',
    description: 'Grande celebração dominical das famílias com louvor congregacional, adoração, comunhão e a proclamação da Palavra de Deus.',
    location: 'Templo Sede • Pedra 90, Cuiabá - MT'
  }
];

export const EventsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [calendarSavedToast, setCalendarSavedToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const filteredEvents = DEFAULT_EVENTS.filter((ev) => {
    if (activeCategory === 'todos') return true;
    return ev.category === activeCategory;
  });

  const handleAddToCalendar = (event: ChurchEvent) => {
    const title = encodeURIComponent(`${event.title} — IGEAD-MT`);
    const details = encodeURIComponent(
      `${event.description}\n\nHorário oficial: ${event.time}\nLocal: Templo Sede IGEAD-MT\nEndereço: ${CHURCH_INFO.address.oneLine}\nIgreja Geração Eleita IGEAD-MT`
    );
    const location = encodeURIComponent(CHURCH_INFO.address.oneLine);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');

    setCalendarSavedToast(true);
    setTimeout(() => setCalendarSavedToast(false), 2500);
  };

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(CHURCH_INFO.address.oneLine);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    } catch {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mulheres':
        return <Heart className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />;
      case 'profetica':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'familia':
      default:
        return <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'mulheres':
        return 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20';
      case 'profetica':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30';
      case 'familia':
      default:
        return 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20';
    }
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast de Confirmação do Calendário */}
      {calendarSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>Abrindo Google Calendar...</span>
        </div>
      )}

      {/* Toast de Endereço Copiado */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCheck className="w-4 h-4" />
          <span>Endereço copiado para a área de transferência!</span>
        </div>
      )}

      {/* Cabeçalho da Programação */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-2">
            Agenda Oficial dos Cultos
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50 tracking-tight">
            Programação dos Cultos
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Todos os nossos cultos começam pontualmente às <strong>19:30</strong>. Você e sua família são nossos convidados de honra!
          </p>
        </div>

        {/* Informação de Início */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-zinc-900 text-amber-800 dark:text-amber-300 border border-amber-500/30 self-start md:self-auto">
          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Horário Oficial: 19:30</span>
        </div>
      </div>

      {/* Filtros dos Cultos */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {[
          { id: 'todos', label: 'Todos os Cultos (3)' },
          { id: 'mulheres', label: 'Quarta — Culto das Mulheres' },
          { id: 'profetica', label: 'Sexta — Sexta Profética' },
          { id: 'familia', label: 'Domingo — Culto da Família' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grade com os 3 Cultos Semanais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="flex flex-col justify-between rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 bg-white dark:bg-zinc-900/60 hover:shadow-xl hover:border-amber-500/40 transition-all duration-200"
          >
            <div>
              {/* Header do Card */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getCategoryBadgeClass(event.category)}`}>
                  {getCategoryIcon(event.category)}
                  {event.dayOfWeek}
                </span>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.time}</span>
                </div>
              </div>

              <h3 className="font-cinzel font-bold text-xl text-zinc-900 dark:text-zinc-50 mb-2">
                {event.title}
              </h3>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-3">
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{event.dayOfWeek} às {event.time}</span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                {event.description}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <a
                href={CHURCH_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate group"
                title="Ver endereço no Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{event.location}</span>
              </a>

              <button
                type="button"
                onClick={() => handleAddToCalendar(event)}
                className="shrink-0 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-amber-600 text-white dark:bg-zinc-800 dark:hover:bg-amber-500 dark:hover:text-zinc-950 transition-colors cursor-pointer shadow-xs"
                title="Adicionar lembrete no Google Calendar"
              >
                + Calendário
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BLOCO DE ENDEREÇO OFICIAL E BOTÃO DA LOCALIZAÇÃO NO GOOGLE MAPS */}
      <div className="mt-10 rounded-3xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Localização do Templo Sede</span>
            </div>

            <h3 className="font-cinzel font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-50">
              Endereço Oficial da IGEAD-MT
            </h3>

            {/* Endereço por escrito */}
            <div className="space-y-1 text-zinc-700 dark:text-zinc-300">
              <p className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{CHURCH_INFO.address.street}</span>
              </p>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                {CHURCH_INFO.address.neighborhood} • {CHURCH_INFO.address.city} - {CHURCH_INFO.address.state}
              </p>
              <p className="text-xs sm:text-sm font-mono text-zinc-500 dark:text-zinc-400">
                CEP: {CHURCH_INFO.address.cep}
              </p>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              Venha estar conosco! Estacionamento facilitado e recepção calorosa para você e sua família.
            </p>
          </div>

          {/* Botões de Ação: Abrir no Google Maps + Copiar Endereço */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href={CHURCH_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Abrir no Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="px-5 py-3 rounded-2xl text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              title="Copiar endereço completo"
            >
              <Copy className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span>Copiar Endereço</span>
            </button>
          </div>
        </div>

        {/* Informações de Contato, Grupo WhatsApp e Instagram */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Telefone */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Telefone</span>
              <a
                href={`tel:+${CHURCH_INFO.phoneClean}`}
                className="text-xs font-bold text-zinc-800 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate block"
              >
                {CHURCH_INFO.phone}
              </a>
            </div>
          </div>

          {/* E-mail */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">E-mail</span>
              <a
                href={`mailto:${CHURCH_INFO.email}`}
                className="text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate block"
                title={CHURCH_INFO.email}
              >
                {CHURCH_INFO.email}
              </a>
            </div>
          </div>

          {/* Grupo WhatsApp */}
          <a
            href={CHURCH_INFO.whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors group cursor-pointer"
            title="Entrar no Grupo Oficial do WhatsApp"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-emerald-100 block tracking-wider">WhatsApp</span>
              <span className="text-xs font-bold truncate block group-hover:underline">
                Entrar no Grupo
              </span>
            </div>
          </a>

          {/* Instagram */}
          <a
            href={CHURCH_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-95 text-white shadow-xs transition-opacity group cursor-pointer"
            title="Seguir Instagram oficial da igreja @igead_cba"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <Instagram className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-pink-100 block tracking-wider">Instagram</span>
              <span className="text-xs font-bold truncate block group-hover:underline">
                {CHURCH_INFO.instagramHandle}
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* Destaque Informativo dos Horários */}
      <div className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
            19:30
          </div>
          <div>
            <h4 className="font-cinzel font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Todos os cultos começam às 19:30
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Quartas (Mulheres), Sextas (Sexta Profética) e Domingos (Culto da Família).
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          Pedra 90 • Cuiabá - MT
        </span>
      </div>
    </section>
  );
};
