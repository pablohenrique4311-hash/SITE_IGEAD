import { RefreshCw, Server } from 'lucide-react';
import { WHATSAPP_PROVIDERS } from '../../constants/whatsappProviders';
import type { WhatsAppProviderType } from '../../types/whatsappAutomation';

export function WhatsAppConnectionSettings({ providerType, onChange, onTest, isTesting }: {
  providerType: WhatsAppProviderType; onChange: (type: WhatsAppProviderType) => void;
  onTest: () => Promise<void>; isTesting: boolean;
}) {
  return (
    <section className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold flex gap-2"><Server className="w-4 h-4" />Provedor de Integração WhatsApp</h2>
        <button type="button" onClick={onTest} disabled={isTesting} className="text-xs flex gap-2 disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />Testar Conexão
        </button>
      </div>
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold mb-2">Selecione o provedor:</legend>
        {WHATSAPP_PROVIDERS.map((provider) => (
          <label key={provider.id} className="flex gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer">
            <input type="radio" name="whatsapp-provider" checked={providerType === provider.id} onChange={() => onChange(provider.id)} />
            <span className="text-sm"><strong>{provider.name}</strong><span className="block text-xs text-zinc-500">{provider.description}</span></span>
          </label>
        ))}
      </fieldset>
      <p className="text-xs text-zinc-500">A conexão é configurada pela equipe responsável. Credenciais não são exibidas nem armazenadas neste dispositivo.</p>
    </section>
  );
}
