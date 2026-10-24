import React, { useState } from 'react';
import {
  HeartHandshake,
  Copy,
  CheckCircle,
  QrCode,
  ShieldCheck,
  User,
  Smartphone,
  Sparkles,
  HelpCircle,
  MessageCircle,
  Calendar,
  Check
} from 'lucide-react';
import { CHURCH_INFO } from '../constants/churchInfo';

export const GivingSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  // Dados oficiais Pix conforme PDF anexo e especificações
  const pixData = {
    titular: 'DAVID ESTEVESCARDOSO FILHO',
    tipoChave: 'Celular',
    chaveFormatada: '(65) 99644-3569',
    chaveCopia: '65996443569',
    // QR Code dinâmico e fallback de asset local gerado a partir do PDF
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=65996443569',
    localQrCodeUrl: `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/assets/aistudio/pix_qrcode.png`
  };

  const [useLocalQr, setUseLocalQr] = useState(false);

  const handleCopyPix = async () => {
    let success = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(pixData.chaveCopia);
        success = true;
      }
    } catch {
      // Falha de permissão de clipboard moderno (ex: iframe ou sem permissão explícita)
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = pixData.chaveCopia;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.warn('Erro no fallback de cópia:', err);
      }
    }

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className="w-full py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-4">
          <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Fidelidade & Generosidade Cristã</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dízimos e Ofertas
        </h1>

        <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Sua contribuição sustenta a pregação do Evangelho, a assistência social às famílias e o avanço da obra de Deus através da Igreja Geração Eleita.
        </p>

        {/* Versículo em Destaque */}
        <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 text-center relative overflow-hidden shadow-xs">
          <div className="absolute top-2 right-4 text-6xl font-serif text-amber-500/10 select-none pointer-events-none">
            &ldquo;
          </div>
          <p className="font-serif-reading italic text-base sm:text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-2xl mx-auto">
            &ldquo;Cada um dê conforme determinou em seu coração, não com tristeza ou por obrigação, pois Deus ama quem dá com alegria.&rdquo;
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-cinzel">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2 Coríntios 9:7</span>
          </div>
        </div>
      </div>

      {/* 2. CARTÃO PRINCIPAL DO PIX (QR CODE & DADOS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna do QR Code */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900/90 border border-amber-500/20 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-4">
            <QrCode className="w-3.5 h-3.5" />
            <span>Pix Instantâneo</span>
          </div>

          <h3 className="font-cinzel font-bold text-lg text-zinc-900 dark:text-zinc-50">
            Escaneie o QR Code
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
            Abra o app do seu banco e aponte a câmera
          </p>

          {/* Moldura do QR Code */}
          <div className="relative p-4 rounded-2xl bg-white border-2 border-amber-400/40 shadow-inner group hover:border-amber-500 transition-colors">
            <img
              src={useLocalQr ? pixData.localQrCodeUrl : pixData.qrCodeUrl}
              alt="QR Code Pix Igreja Geração Eleita"
              className="w-56 h-56 sm:w-60 sm:h-60 object-contain rounded-lg"
              onError={() => setUseLocalQr(true)}
              loading="eager"
            />
            <div className="mt-2 text-[11px] text-zinc-500 font-medium">
              Chave Celular: 65 99644-3569
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Transação 100% segura e direta</span>
          </div>
        </div>

        {/* Coluna dos Dados para Transferência e Cópia */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900/90 border border-amber-500/20 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
              <div>
                <h2 className="font-cinzel font-bold text-xl text-zinc-900 dark:text-zinc-50">
                  Dados da Chave Pix
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Copie a chave para colar no aplicativo do seu banco
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                PIX
              </div>
            </div>

            {/* Campos de Dados */}
            <div className="space-y-4">
              {/* Titular */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
                  <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Nome do Titular</span>
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {pixData.titular}
                </div>
              </div>

              {/* Tipo de Chave & Chave */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
                      <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Tipo de Chave ({pixData.tipoChave})</span>
                    </div>
                    <div className="font-mono text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">
                      {pixData.chaveFormatada}
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold uppercase tracking-wider">
                    Celular
                  </span>
                </div>
              </div>
            </div>

            {/* Botão de Copiar Chave */}
            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={handleCopyPix}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white scale-[1.01]'
                    : 'bg-zinc-900 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 hover:scale-[1.01]'
                }`}
                aria-label="Copiar Chave Pix"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-200 animate-in zoom-in-75 duration-150" />
                    <span>Chave Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copiar Chave Pix (Celular)</span>
                  </>
                )}
              </button>

              {copied && (
                <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 animate-in fade-in duration-200">
                  ✓ Número <strong>{pixData.chaveCopia}</strong> copiado para a área de transferência!
                </p>
              )}
            </div>
          </div>

          {/* 3. COMO OFERTAR PASSO A PASSO */}
          <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/15 text-zinc-800 dark:text-zinc-200">
            <h3 className="font-cinzel font-bold text-sm text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Como fazer a transferência pelo celular:</span>
            </h3>

            <ol className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 list-decimal list-inside leading-relaxed">
              <li>Abra o aplicativo do seu banco ou carteira digital.</li>
              <li>Acesse a área <strong>Pix</strong> e selecione <strong>Pagar com Chave</strong> ou <strong>Pagar com QR Code</strong>.</li>
              <li>Escolha a opção <strong>Celular</strong> e cole <strong>{pixData.chaveCopia}</strong> (ou aponte a câmera para o QR Code ao lado).</li>
              <li>Verifique o nome do titular: <strong>{pixData.titular}</strong>.</li>
              <li>Informe o valor que Deus colocou em seu coração e confirme.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 4. SEÇÃO INSTITUCIONAL & CULTOS PRESENCIAIS */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contribuição Presencial */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-cinzel font-bold text-base text-zinc-900 dark:text-zinc-100">
            Dízimos e Ofertas nos Cultos
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Se preferir entregar sua contribuição pessoalmente, nossos diáconos e obreiros estão à disposição em todos os nossos cultos semanais:
          </p>
          <ul className="mt-3 space-y-1 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
            <li>• Quarta-feira (Mulheres) — 19:30</li>
            <li>• Sexta-feira (Sexta Profética) — 19:30</li>
            <li>• Domingo (Culto da Família) — 19:30</li>
          </ul>
        </div>

        {/* Comprovante e Atendimento Pastoral */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
          <h3 className="font-cinzel font-bold text-base text-zinc-900 dark:text-zinc-100">
            Envio de Comprovante ou Dúvidas
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Caso necessite enviar o comprovante para a tesouraria ou desejar uma oração pastoral de gratidão, entre em contato direto pelo nosso canal oficial no WhatsApp.
          </p>
          <a
            href={CHURCH_INFO.whatsappContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Falar no WhatsApp da Igreja</span>
          </a>
        </div>
      </div>
    </div>
  );
};
