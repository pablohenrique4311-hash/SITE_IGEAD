import { test, expect, type Page } from '@playwright/test';

async function prepare(page: Page) {
  const state = { admin: true, failSave: false, failPrayer: true, functionCalls: 0, enabled: false };
  const privateGroupName = 'PRIVATE_ADMIN_GROUP_FIXTURE';
  const user = { id: '00000000-0000-0000-0000-000000000001', email: 'teste@example.invalid',
    aud: 'authenticated', role: 'authenticated', user_metadata: { full_name: 'Pessoa de teste' }, app_metadata: {} };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const makeToken = (id: string) => `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.synthetic`;
  await page.context().route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (['127.0.0.1', 'localhost'].includes(url.hostname)) return route.continue();
    if (!url.hostname.endsWith('.supabase.co')) return route.abort();
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    const currentUser = state.admin ? user : { ...user, id: '00000000-0000-0000-0000-000000000002', email: 'membro@example.invalid' };
    if (url.pathname.endsWith('/token')) return json({ access_token: makeToken(currentUser.id), refresh_token: 'synthetic-refresh',
      token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600, user: currentUser });
    if (url.pathname.endsWith('/user')) return json(currentUser);
    if (url.pathname.endsWith('/logout')) return route.fulfill({ status: 204 });
    if (url.pathname.endsWith('/rpc/is_whatsapp_admin')) return json(state.admin);
    if (url.pathname.endsWith('/rpc/submit_prayer_request')) return state.failPrayer ? json({ message: 'unavailable' }, 503) : json('synthetic-prayer-id');
    if (url.pathname.endsWith('/whatsapp_automation_settings')) {
      if (request.method() === 'PATCH' && state.failSave) return json({ message: 'unavailable' }, 503);
      if (request.method() === 'PATCH') state.enabled = request.postDataJSON().is_enabled;
      return json({ id: 'default', is_enabled: state.enabled, scheduled_time: '07:00', timezone: 'America/Cuiaba',
        target_group_id: '12345@g.us', target_group_name: privateGroupName, provider_type: 'simulation', updated_at: '' });
    }
    if (url.pathname.endsWith('/functions/v1/whatsapp-daily-word')) {
      state.functionCalls++;
      const body = request.postDataJSON();
      if (body.action === 'status') return json({ state: 'simulated', isSimulated: true, lastCheckedAt: new Date().toISOString() });
      if (body.action === 'process') return json({ processedCount: 0, successCount: 0, errors: [] });
      if (body.action === 'groups') return json([{ id: '12345@g.us', name: 'Grupo de teste' }]);
      return json({ success: true, isSimulated: true, providerMessageId: 'synthetic' });
    }
    return json([]);
  });
  await page.addInitScript(() => {
    localStorage.setItem('igead_prayer_requests', '[{"message":"legacy-private"}]');
    localStorage.setItem('igead_whatsapp_automation_settings', '{"providerToken":"legacy-secret"}');
  });
  return state;
}
async function login(page: Page) {
  await page.goto('./');
  await page.getByLabel('E-mail', { exact: true }).fill('teste@example.invalid');
  await page.getByLabel('Senha', { exact: true }).fill('synthetic-password');
  await page.getByRole('button', { name: 'Entrar no portal', exact: true }).click();
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveCount(0);
}

test('login, limpeza de dados legados e falha ao salvar sem confirmação falsa', async ({ page }) => {
  const state = await prepare(page);
  await login(page);
  expect(await page.evaluate(() => localStorage.getItem('igead_prayer_requests'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('igead_whatsapp_automation_settings'))).toBeNull();
  if ((page.viewportSize()?.width || 1280) < 1024) {
    await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
    await page.getByRole('button', { name: /Automação WhatsApp/ }).click();
  } else {
    await page.getByRole('button', { name: 'Automação do WhatsApp', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Automação WhatsApp — Palavra do Dia', exact: true })).toBeVisible();
  state.failSave = true;
  await page.getByRole('button', { name: 'Salvar Configurações', exact: true }).click();
  await expect(page.getByText('Erro ao salvar configurações. A alteração não foi confirmada.', { exact: true })).toBeVisible();
  await expect(page.getByText('Configurações salvas no servidor.', { exact: true })).toHaveCount(0);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  state.failSave = false;
  await page.getByRole('button', { name: 'Ativar Automação', exact: true }).click();
  await expect(page.getByText('Automação ativada com sucesso!', { exact: true })).toBeVisible();
  expect(state.enabled).toBe(true);
  await page.getByRole('button', { name: 'Pausar Automação', exact: true }).click();
  await expect(page.getByText('Automação pausada imediatamente.', { exact: true })).toBeVisible();
  expect(state.enabled).toBe(false);
  await page.getByRole('button', { name: 'Disparar Teste Imediato', exact: true }).click();
  await expect(page.getByText('Mensagem simulada registrada com sucesso no histórico de testes!', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Histórico/ }).click();
  await expect(page.getByRole('heading', { name: 'Histórico de Publicações no Grupo', exact: true })).toBeVisible();

});

test('pedido confidencial preserva formulário após 503 e só confirma registro aceito', async ({ page }) => {
  const state = await prepare(page);
  await login(page);
  if ((page.viewportSize()?.width || 1280) < 1024) await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  await page.getByRole('button', { name: 'Sobre & Contato', exact: true }).filter({ visible: true }).first().click();
  await page.getByPlaceholder('Informe seu nome completo').fill('Pessoa sintética');
  await page.locator('textarea').fill('CONTEUDO_SINTETICO_CONFIDENCIAL');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enviar Pedido de Oração', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível confirmar o registro');
  await expect(page.locator('textarea')).toHaveValue('CONTEUDO_SINTETICO_CONFIDENCIAL');
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('CONTEUDO_SINTETICO_CONFIDENCIAL');
  state.failPrayer = false;
  await page.getByRole('button', { name: 'Enviar Pedido de Oração', exact: true }).click();
  await expect(page.getByText('Pedido registrado com sucesso!', { exact: true })).toBeVisible();
});

test('service worker ativo mantém Bíblia offline sem cachear respostas privadas', async ({ page, context }) => {
  await prepare(page);
  await login(page);
  if ((page.viewportSize()?.width || 1280) < 1024) {
    await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
    await page.getByRole('button', { name: /Automação WhatsApp/ }).click();
  } else {
    await page.getByRole('button', { name: 'Automação do WhatsApp', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Automação WhatsApp — Palavra do Dia', exact: true })).toBeVisible();
  await expect(page.getByText('PRIVATE_ADMIN_GROUP_FIXTURE', { exact: true }).first()).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(async () => {
    const cache = await caches.open('igead-pwa-v4-public-only');
    return Boolean(await cache.match(new URL('data/pt_acf.json', location.href).href));
  })).toBe(true);
  await context.setOffline(true);
  const count = await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    // Aguarda o controle do documento pela ativação do worker.
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    return (await (await fetch('data/pt_acf.json')).json()).length;
  });
  expect(count).toBe(66);
  await context.setOffline(false);
  expect(await page.evaluate(async () => {
    const cache = await caches.open('igead-pwa-v4-public-only');
    return (await cache.keys()).some((request) => /supabase|rpc|auth|whatsapp/.test(request.url));
  })).toBe(false);
});


test('logout e troca de usuário removem acesso ao painel e dados administrativos', async ({ page }) => {
  const state = await prepare(page);
  await login(page);
  const mobile = (page.viewportSize()?.width || 1280) < 1024;
  if (mobile) {
    await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
    await page.getByRole('button', { name: /Automação WhatsApp/ }).click();
  } else {
    await page.getByRole('button', { name: 'Automação do WhatsApp', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Automação WhatsApp — Palavra do Dia', exact: true })).toBeVisible();
  if (mobile) {
    await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
  } else {
    await page.getByRole('button', { name: 'Sair da conta', exact: true }).click();
  }
  await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
  state.admin = false;
  await page.getByLabel('E-mail', { exact: true }).fill('membro@example.invalid');
  await page.getByLabel('Senha', { exact: true }).fill('synthetic-password');
  await page.getByRole('button', { name: 'Entrar no portal', exact: true }).click();
  await expect(page.getByLabel('E-mail', { exact: true })).toHaveCount(0);
  if (mobile) await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  await expect(page.getByRole('button', { name: /Automação (do )?WhatsApp/ })).toHaveCount(0);
  await expect(page.getByText('PRIVATE_ADMIN_GROUP_FIXTURE')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('PRIVATE_ADMIN_GROUP_FIXTURE');
});
