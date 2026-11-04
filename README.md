# IGEAD-MT

Site da Igreja Geração Eleita de Deus de Mato Grosso, desenvolvido com React 19, TypeScript, Vite e Tailwind CSS 4. A aplicação reúne conteúdo da igreja e recursos para membros, com autenticação pelo Supabase.

## Funcionalidades

- Bíblia com busca e leitura de capítulos.
- Palavra do Dia, versículos e reflexões.
- Transmissões e vídeos recentes do YouTube.
- Agenda, informações da igreja e contribuições.
- Pedidos de oração registrados no backend, com acesso exclusivo aos responsáveis pastorais.
- Tema claro/escuro e recursos de PWA, incluindo instalação e cache para acesso offline a conteúdo previamente carregado.
- Painel restrito de WhatsApp para configuração de provedores, fila e histórico de mensagens.

## Executar localmente

Use Node.js 22, versão utilizada no workflow de publicação, e npm para instalar com o `package-lock.json` versionado.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Edite `.env.local` com a configuração do seu ambiente. O servidor de desenvolvimento fica disponível em `http://localhost:3000` e escuta em todas as interfaces de rede.

## Configuração e operação

Use `.env.example` para configurar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e, opcionalmente, `VITE_YOUTUBE_API_KEY`. Tudo que começa com `VITE_` é público; restrinja a chave YouTube por origem e API. `VITE_BASE_PATH` ajusta o caminho de hospedagem.

A atualização de segurança exige as novas migrações e a função Supabase antes de publicar o frontend. Credenciais WhatsApp ficam somente no servidor; o painel não recebe tokens. Administração e acesso pastoral dependem de papéis por UUID, gerenciados no banco. A função suporta GREEN-API, Evolution e simulação.

Pedidos de oração são registrados para consulta pastoral; não há envio automático por e-mail ou WhatsApp nem confirmação de leitura. Revise o procedimento pastoral e a retenção antes de liberar o formulário.

Consulte [Operação segura e homologação](docs/OPERACAO_SEGURA.md) para a ordem de implantação, segredos, papéis, agendador, recuperação de envios incertos e comandos de teste. O andamento está no [Plano de correção](PLANO_DE_CORRECAO.md).

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o Vite na porta 3000. |
| `npm run lint` | Verifica os tipos com `tsc --noEmit`; não executa ESLint. |
| `npm run build` | Gera o bundle de produção em `dist/`. |
| `npm run preview` | Serve o build de produção localmente. |

Os testes usam `node:test` e `node:assert/strict`, executados com `tsx`:

```sh
npm test
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
VITE_BASE_PATH=/ npm run preview
```

Para usar outro projeto Supabase na publicação, disponibilize as variáveis `VITE_SUPABASE_*` ao build. O workflow lê `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_YOUTUBE_API_KEY` das variáveis do repositório.

## Contribuir

Consulte [AGENTS.md](AGENTS.md) para as convenções do repositório. Preserve os textos da interface em português, execute as verificações pertinentes e descreva alterações de configuração ou banco no pull request. Para mudanças visuais, inclua capturas de tela.
