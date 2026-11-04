import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const out = await mkdtemp(path.join(tmpdir(), 'igead-public-env-'));
try {
  execFileSync('npm', ['run', 'build', '--', '--outDir', out], {
    env: { ...process.env,
      VITE_GREEN_API_TOKEN: 'PRIVATE_GATEWAY_SENTINEL_MUST_NOT_LEAK',
      VITE_SUPABASE_SERVICE_ROLE_KEY: 'PRIVATE_ROLE_SENTINEL_MUST_NOT_LEAK',
      VITE_YOUTUBE_API_KEY: 'PUBLIC_YOUTUBE_SENTINEL_ALLOWED',
    }, stdio: 'pipe',
  });
  let bundle = '';
  for (const file of await readdir(path.join(out, 'assets'))) {
    if (file.endsWith('.js')) bundle += await readFile(path.join(out, 'assets', file), 'utf8');
  }
  if (bundle.includes('PRIVATE_GATEWAY_SENTINEL_MUST_NOT_LEAK') || bundle.includes('PRIVATE_ROLE_SENTINEL_MUST_NOT_LEAK')) {
    throw new Error('Build publicou variável fora da lista pública.');
  }
  if (!bundle.includes('PUBLIC_YOUTUBE_SENTINEL_ALLOWED')) throw new Error('Configuração pública permitida não chegou ao build.');
  console.log('PASS: build real publica a configuração permitida e ignora variáveis de credenciais legadas.');
} finally {
  await rm(out, { recursive: true, force: true });
}
