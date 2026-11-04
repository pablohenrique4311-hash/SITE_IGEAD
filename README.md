# IGEAD-MT

Site da Igreja Geração Eleita de Deus de Mato Grosso, desenvolvido com React 19, TypeScript, Vite e Tailwind CSS 4. A aplicação reúne conteúdo da igreja e recursos para membros, com autenticação pelo Supabase.

## Funcionalidades

- Bíblia com busca e leitura de capítulos.
- Palavra do Dia, versículos e reflexões.
- Transmissões e vídeos recentes do YouTube.
- Agenda, informações da igreja e contribuições.
- Pedidos de oração com registro local e tentativas de envio por e-mail e WhatsApp.
- Tema claro/escuro e recursos de PWA, incluindo instalação e cache para acesso offline a conteúdo previamente carregado.
- Painel restrito de WhatsApp para configuração de provedores, fila e histórico de mensagens.

## Executar localmente

Use Node.js 22, versão utilizada no workflow de publicação, e Bun para instalar as dependências com o `bun.lock` do repositório.

```sh
bun install
cp .env.example .env.local
npm run dev
```

Edite `.env.local` com a configuração do seu ambiente. O servidor de desenvolvimento fica disponível em `http://localhost:3000` e escuta em todas as interfaces de rede.

## Configuração

| Variável | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do projeto Supabase para autenticação e dados. |
| `VITE_SUPABASE_ANON_KEY` | Chave pública do Supabase; as permissões dependem das políticas do banco. |
| `VITE_EVOLUTION_API_URL` | Endpoint opcional do provedor Evolution API. |
| `VITE_EVOLUTION_API_KEY` | Chave opcional da Evolution API, também configurável no painel. |
| `VITE_EVOLUTION_INSTANCE_NAME` | Nome da instância Evolution API. |
| `VITE_CALLMEBOT_API_KEY` | Integração opcional de WhatsApp para pedidos de oração; não consta no exemplo de ambiente. |
| `VITE_BASE_PATH` | Caminho de publicação, definido no ambiente do comando de build. |

O `.env.example` também contém `GEMINI_API_KEY` e `APP_URL` para o ambiente AI Studio. Não há consumo dessas variáveis na configuração atual do Vite.

Todas as variáveis `VITE_*` ficam acessíveis no navegador. Mantenha credenciais privilegiadas, como a chave `service_role`, no backend. Não versione arquivos de ambiente locais nem registre tokens ou detalhes de pedidos de oração em logs.

## Supabase e WhatsApp

A migração em `supabase/migrations/20261104_whatsapp_automation.sql` cria tabelas e políticas de acesso para a automação e a Palavra do Dia. Revise-a e aplique-a ao projeto Supabase antes de utilizar esses recursos.

A função `supabase/functions/whatsapp-daily-word/index.ts` executa envios no backend. Ela utiliza `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` e aceita configuração por `GREEN_API_URL`, `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN` e `WHATSAPP_GROUP_ID`. Configure os segredos no ambiente da função e publique-a no projeto Supabase correspondente.

O frontend inclui provedores GREEN-API, Evolution API, Z-API e simulação. O acesso administrativo é validado em `src/constants/authConfig.ts`, na função e nas políticas SQL; mantenha essas regras alinhadas ao alterar o administrador autorizado.

O envio automático depende de um agendador externo, como cron ou webhook, chamando a função com autorização adequada. A migração presente não cria esse agendamento. O horário padrão configurado é 07:00 em `America/Cuiaba`.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o Vite na porta 3000. |
| `npm run lint` | Verifica os tipos com `tsc --noEmit`; não executa ESLint. |
| `npm run build` | Gera o bundle de produção em `dist/`. |
| `npm run preview` | Serve o build de produção localmente. |

Os testes usam `node:test` e `node:assert/strict`, executados com `tsx`:

```sh
npx tsx --test src/services/*.test.ts src/services/whatsapp/*.test.ts
```

A verificação TypeScript da raiz exclui `supabase/`; alterações na Edge Function precisam de validação separada.

## Estrutura

```text
src/
  components/     Seções das páginas e componentes de interface
  constants/      Dados da igreja e regras de autenticação
  contexts/       Estado compartilhado e autenticação
  hooks/          Hooks reutilizáveis
  lib/            Cliente Supabase
  services/       Bíblia, oração, YouTube, Palavra do Dia e WhatsApp
  types/          Tipos compartilhados
public/           Assets, dados bíblicos, manifesto e service worker
supabase/
  functions/      Função de envio da Palavra do Dia
  migrations/     Estrutura e políticas do banco
.github/workflows/ Publicação no GitHub Pages
```

## Publicação

O workflow em `.github/workflows/` compila e publica `dist/` no GitHub Pages a cada push na branch `main`, ou por execução manual. Configure o Pages do repositório para utilizar GitHub Actions.

O build utiliza `/SITE_IGEAD/` como caminho padrão. Para hospedar na raiz de outro domínio:

```sh
VITE_BASE_PATH=/ npm run build
npm run preview
```

Para usar outro projeto Supabase na publicação, disponibilize as variáveis `VITE_SUPABASE_*` ao build. O workflow atual define explicitamente apenas `VITE_BASE_PATH`.

## Contribuir

Consulte [AGENTS.md](AGENTS.md) para as convenções do repositório. Preserve os textos da interface em português, execute as verificações pertinentes e descreva alterações de configuração ou banco no pull request. Para mudanças visuais, inclua capturas de tela.
