export interface GatewayConfig {
  type: string;
  endpoint: string;
  instance: string;
  token: string;
  allowedOrigins: string[];
}
export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  isSimulated: boolean;
  uncertain?: boolean;
  error?: string;
}

export class Gateway {
  constructor(private config: GatewayConfig, private http: typeof fetch = fetch, private timeoutMs = 10000) {}

  private url(path: string) {
    const { endpoint, instance, token, allowedOrigins, type } = this.config;
    if (!['greenapi', 'evolution'].includes(type)) throw new Error('Provedor não suportado.');
    if (!instance || !token || !endpoint) throw new Error('Credenciais ausentes no servidor.');
    const base = new URL(endpoint);
    if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash ||
        base.pathname !== '/' || !allowedOrigins.includes(base.origin)) {
      throw new Error('Destino não permitido.');
    }
    return `${base.origin}${path}`;
  }

  async send(group: string, text: string): Promise<SendResult> {
    const { type, instance, token } = this.config;
    if (type === 'simulation') {
      return { success: true, providerMessageId: `simulation_${crypto.randomUUID()}`, isSimulated: true };
    }
    let url: string;
    try {
      url = this.url(type === 'greenapi'
        ? `/waInstance${encodeURIComponent(instance)}/sendMessage/${encodeURIComponent(token)}`
        : `/message/sendText/${encodeURIComponent(instance)}`);
    } catch (error) {
      return { success: false, isSimulated: false, error: (error as Error).message };
    }
    try {
      const response = await this.http(url, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(this.timeoutMs),
        headers: { 'Content-Type': 'application/json', ...(type === 'evolution' ? { apikey: token } : {}) },
        body: JSON.stringify(type === 'greenapi' ? { chatId: group, message: text } : { number: group, text }),
      });
      if (!response.ok) {
        return { success: false, isSimulated: false, uncertain: response.status >= 500,
          error: `Provedor respondeu HTTP ${response.status}.` };
      }
      const data = await response.json();
      const id = type === 'greenapi' ? data.idMessage : data.key?.id || data.id;
      if (typeof id !== 'string' || !id) throw new Error('missing_id');
      return { success: true, providerMessageId: id, isSimulated: false };
    } catch {
      // Não incluir URL, token ou resposta arbitrária do provedor no erro.
      return { success: false, isSimulated: false, uncertain: true,
        error: 'Resultado do envio desconhecido. Reconciliar com o provedor antes de repetir.' };
    }
  }

  async status() {
    if (this.config.type === 'simulation') {
      return { state: 'simulated', isSimulated: true, lastCheckedAt: new Date().toISOString() };
    }
    const { type, instance, token } = this.config;
    try {
      const url = this.url(type === 'greenapi'
        ? `/waInstance${encodeURIComponent(instance)}/getStateInstance/${encodeURIComponent(token)}`
        : `/instance/connectionState/${encodeURIComponent(instance)}`);
      const response = await this.http(url, {
        redirect: 'error', signal: AbortSignal.timeout(8000),
        headers: type === 'evolution' ? { apikey: token } : {},
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      const connected = type === 'greenapi' ? data.stateInstance === 'authorized' : data.instance?.state === 'open';
      return { state: connected ? 'connected' : 'disconnected', isSimulated: false,
        lastCheckedAt: new Date().toISOString() };
    } catch {
      return { state: 'disconnected', isSimulated: false, lastCheckedAt: new Date().toISOString(),
        errorMessage: 'Não foi possível confirmar a conexão no servidor.' };
    }
  }
}
