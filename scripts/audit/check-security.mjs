import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

async function files(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const lists = await Promise.all(entries.map((entry) => {
    const name = path.join(root, entry.name);
    return entry.isDirectory() ? files(name) : [name];
  }));
  return lists.flat();
}
let failures = 0;
for (const name of [...await files('src'), ...await files('supabase')]) {
  if (!/\.(tsx?|sql)$/.test(name)) continue;
  const source = await readFile(name, 'utf8');
  if (/['"][a-f0-9]{40,}['"]|AIza[0-9A-Za-z_-]{30,}|-----BEGIN .*PRIVATE KEY-----/.test(source)) {
    console.error(`Possível credencial fixa: ${name}`); failures++;
  }
  if (name.startsWith('src/') && /VITE_(?:GREEN|EVOLUTION|CALLMEBOT|ZAPI)[A-Z_]*(?:TOKEN|KEY)/.test(source)) {
    console.error(`Segredo de provedor exposto por variável pública: ${name}`); failures++;
  }
}
for (const name of await files('dist')) {
  if (!name.endsWith('.js')) continue;
  const source = await readFile(name, 'utf8');
  if (/waInstance|\/sendMessage\/|\/message\/sendText\/|VITE_GREEN_API_TOKEN|['"][a-f0-9]{40,}['"]/.test(source)) {
    console.error(`Credencial ou chamada direta de gateway no bundle: ${name}`); failures++;
  }
}
if (failures) process.exitCode = 1;
else console.log('PASS: fontes e bundle sem credenciais fixas detectadas ou envio direto pelo navegador.');
// Verificação direcionada: não substitui rotação de credenciais ou auditoria do histórico.
