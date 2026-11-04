import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, isPreview, mode }) => {
  // Para GitHub Pages (/SITE_IGEAD/) em build de produção, ou configurável via VITE_BASE_PATH.
  // Em modo 'serve' (servidor de desenvolvimento local / AI Studio), roda na raiz '/' para responder na porta 3000.
  const base = process.env.VITE_BASE_PATH || (command === 'build' || isPreview ? '/SITE_IGEAD/' : '/');

  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const publicKeys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_YOUTUBE_API_KEY'];
  return {
    base,
    // Publicar apenas configuração conhecida; variáveis antigas de gateways são ignoradas.
    envPrefix: [],
    define: Object.fromEntries(publicKeys.map((key) => [`import.meta.env.${key}`, JSON.stringify(env[key] || '')])),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
