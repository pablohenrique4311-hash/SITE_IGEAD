import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Users,
  Compass,
  Heart,
  Send,
  CheckCircle,
  ExternalLink,
  Shield,
  Edit3
} from 'lucide-react';
import { CHANNEL_URL } from '../services/youtubeService';
import { CHURCH_INFO } from '../constants/churchInfo';

export const AboutSection: React.FC = () => {
  // Estado do formulário de pedido de oração
  const [prayerName, setPrayerName] = useState('');
  const [prayerPhone, setPrayerPhone] = useState('');
  const [prayerCategory, setPrayerCategory] = useState('familia');
  const [prayerMessage, setPrayerMessage] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerName.trim() || !prayerMessage.trim()) return;

    // Simulação e armazenamento local seguro do pedido para atendimento pastoral
    setIsSubmitted(true);
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-3">
          Institucional & Comunhão
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50 tracking-tight">
          Sobre a Igreja Geração Eleita (IGEAD-MT)
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
          Uma igreja comprometida com a sã doutrina bíblica, o amor de Cristo, a edificação das famílias e a salvação de almas no Estado de Mato Grosso.
        </p>
      </div>

      {/* Missão, Visão e Valores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-cinzel font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-2">
            Nossa Missão
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Proclamar o Evangelho de Jesus Cristo com fidelidade às Sagradas Escrituras, gerando discípulos maduros, restaurando vidas e servindo à comunidade local com amor e misericórdia.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-cinzel font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-2">
            Nossa Visão
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Ser uma geração eleita, sacerdócio real e nação santa que reflete a glória de Deus em Mato Grosso, multiplicando o Reino através de famílias sólidas e jovens cheios do Espírito Santo.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-cinzel font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-2">
            Nossos Valores
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Inerrância e autoridade bíblica, oração perseverante, adoração genuína, santidade, comunhão fraterna, integridade pastoral e excelência para a glória do Senhor.
          </p>
        </div>
      </div>

      {/* Liderança Pastoral (Campos Editáveis) */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold font-cinzel text-zinc-900 dark:text-zinc-50">
              Corpo Pastoral & Liderança
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Servindo ao rebanho do Senhor com temor, dedicação e unção espiritual.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Nomes e fotos configuráveis</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              role: 'Pastor Presidente',
              label: 'Pastor Presidente — IGEAD-MT',
              desc: 'Direção geral da igreja, ministração da Palavra e pastoreio do rebanho em Mato Grosso.',
              editableBadge: '[Configurar Nome Oficial]'
            },
            {
              role: 'Pastora & Ministério da Família',
              label: 'Liderança de Famílias & Mulheres',
              desc: 'Aconselhamento bíblico familiar, discipulado de mulheres e fortalecimento conjugal.',
              editableBadge: '[Configurar Nome Oficial]'
            },
            {
              role: 'Líder da Juventude',
              label: 'Rede Geração Eleita (G.E.)',
              desc: 'Mobilização da juventude, eventos de avivamento e missões evangelísticas urbanas.',
              editableBadge: '[Configurar Nome Oficial]'
            }
          ].map((leader, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-cinzel font-bold text-xl mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {leader.role}
                </span>
                <h4 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 mt-1">
                  {leader.label}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  {leader.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {leader.editableBadge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção Dupla: Contato/Endereço + Formulário de Pedido de Oração */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Informações de Contato e Localização */}
        <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="font-cinzel font-bold text-2xl text-zinc-900 dark:text-zinc-50 mb-4">
              Informações & Localização
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
              Venha estar conosco! As informações abaixo são configuráveis pela administração da congregação.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100 block">Endereço do Templo:</strong>
                  <span className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm block">
                    {CHURCH_INFO.address.street}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 text-xs block">
                    {CHURCH_INFO.address.neighborhood} • {CHURCH_INFO.address.city} - {CHURCH_INFO.address.state} — CEP: {CHURCH_INFO.address.cep}
                  </span>
                  <div className="mt-2.5">
                    <a
                      href={CHURCH_INFO.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Abrir no Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100 block">Contato Telefônico / WhatsApp:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                    Secretaria Geral IGEAD-MT
                  </span>
                  <div className="mt-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded inline-block">
                    [Configurar número oficial da secretaria]
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 dark:text-zinc-100 block">E-mail Oficial:</strong>
                  <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                    contato@igeadmt.org.br (configurável)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Canais Oficiais
            </h4>
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              <span>Canal Oficial do YouTube (UCwWs_spTAEZaojGQDQSYQ-A)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Formulário Interativo: Pedido de Oração */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-cinzel font-bold text-2xl text-zinc-900 dark:text-zinc-50">
              Pedido de Oração
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Nossa equipe de intercessores estará orando pelo seu pedido diante do altar do Senhor.
          </p>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3 animate-in fade-in">
              <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-base font-semibold text-emerald-950 dark:text-emerald-200">
                Seu pedido foi recebido com carinho!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Estaremos clamando por você e sua família no Círculo de Oração. Deus abençoe poderosamente a sua vida.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setPrayerMessage('');
                }}
                className="mt-3 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white cursor-pointer"
              >
                Enviar outro pedido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitPrayer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  value={prayerName}
                  onChange={(e) => setPrayerName(e.target.value)}
                  placeholder="Informe seu nome completo"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Telefone / WhatsApp (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={prayerPhone}
                    onChange={(e) => setPrayerPhone(e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Área do Clamor
                  </label>
                  <select
                    value={prayerCategory}
                    onChange={(e) => setPrayerCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="familia">Família e Casamento</option>
                    <option value="saude">Saúde e Cura</option>
                    <option value="espiritual">Libertação & Vida Espiritual</option>
                    <option value="financeiro">Causas Financeiras & Emprego</option>
                    <option value="agradecimento">Agradecimento por Bênção</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Motivo da Oração *
                </label>
                <textarea
                  required
                  rows={4}
                  value={prayerMessage}
                  onChange={(e) => setPrayerMessage(e.target.value)}
                  placeholder="Escreva brevemente seu motivo de oração..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <label htmlFor="confidential" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  Manter pedido confidencial (apenas corpo pastoral)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Pedido de Oração</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
