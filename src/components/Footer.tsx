import { BookOpen, Video, Calendar, Heart, ExternalLink, ArrowUp, MapPin } from 'lucide-react';
import { PageId } from './Header';
import { CHANNEL_URL } from '../services/youtubeService';
import { CHURCH_INFO } from '../constants/churchInfo';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Identificação Institucional */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Logotipo Oficial IGEAD-MT */}
              <img
                src="/assets/aistudio/Logotipo_gera__o_eleita_a16b7b59.png"
                alt="Logotipo Oficial Igreja Geração Eleita IGEAD-MT"
                className="w-14 h-14 object-contain shrink-0"
              />


              <div>
                <h3 className="font-cinzel font-bold text-base text-zinc-900 dark:text-zinc-50">
                  IGEAD-MT
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Igreja Geração Eleita
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-serif-reading italic">
              &ldquo;Mas vós sois a geração eleita, o sacerdócio real, a nação santa, o povo adquirido, para que anuncieis as virtudes daquele que vos chamou das trevas para a sua maravilhosa luz.&rdquo;
              <span className="block not-italic font-sans font-bold text-amber-700 dark:text-amber-400 mt-1">
                — 1 Pedro 2:9
              </span>
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-cinzel">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('bible')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Bíblia Sagrada (JFA e KJV)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('videos')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Ao Vivo & Vídeos Recentes</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('agenda')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Programação dos Cultos</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('content')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Estudos e Mensagens
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Sobre a Igreja & Pedido de Oração
                </button>
              </li>
            </ul>
          </div>

          {/* Cultos Principais */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-cinzel">
              Cultos Semanais (19h30)
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div>
                <strong className="text-zinc-800 dark:text-zinc-200 block">Quarta-feira — 19h30</strong>
                <span>Culto das Mulheres</span>
              </div>
              <div>
                <strong className="text-zinc-800 dark:text-zinc-200 block">Sexta-feira — 19h30</strong>
                <span>Sexta Profética</span>
              </div>
              <div>
                <strong className="text-zinc-800 dark:text-zinc-200 block">Domingo — 19h30</strong>
                <span>Culto da Família</span>
              </div>
            </div>
          </div>


          {/* Conexão e Redes Oficiais */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-4 font-cinzel">
              Canal Oficial
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
              Inscreva-se em nosso canal no YouTube e ative o sino para não perder nenhuma transmissão ao vivo.
            </p>
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
            >
              <span>Canal no YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                {CHURCH_INFO.address.street}
              </p>
              <p>
                {CHURCH_INFO.address.neighborhood} • {CHURCH_INFO.address.city} - {CHURCH_INFO.address.state}
              </p>
              <p className="font-mono text-[10px]">
                CEP: {CHURCH_INFO.address.cep}
              </p>
              <a
                href={CHURCH_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline pt-1"
              >
                <MapPin className="w-3 h-3" />
                <span>Ver no Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            © {new Date().getFullYear()} Igreja Geração Eleita — IGEAD-MT. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Feito com <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> para a Glória de Deus
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              title="Voltar ao topo da página"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
