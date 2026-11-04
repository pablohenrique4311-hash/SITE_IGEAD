# Plano de correção — IGEAD-MT

## Objetivo e regra de conclusão

Corrigir segurança, confiabilidade e organização sem confundir build aprovado com aplicação funcionando. A implementação está em andamento. Os itens marcados têm evidência local; implantação e homologação continuam separadas.

Marcar uma tarefa com `[x]` somente após implementar e executar seus testes de aceite. Registrar comando, resultado, ambiente e evidência sem tokens ou dados pessoais. Teste não executado permanece pendente. Falha esperada de regressão comprova o defeito, não a correção. O código local já contém correções; nenhuma implantação remota foi realizada.

## Acompanhamento da implementação

**Última atualização: 04/11/2026 13:56 (Cuiabá).**

**Etapa atual:** implementação local e validações concluídas. Próxima etapa depende de homologação, revogação do token antigo e publicação coordenada de banco, função e frontend. Nenhum deploy foi executado.

**Última bateria concluída:** 35 testes de serviços/gateway/cache; 8 testes de navegador desktop/celular; integração PostgreSQL com dados legados, concorrência e falha real de persistência; TypeScript estrito, Deno com lockfile congelado e build aprovados.

| Frente | Situação | Evidência / próximo passo |
| --- | --- | --- |
| Tokens no frontend | Validado localmente | `check:security` aprovado após o build; sem tokens fixos detectados ou chamadas diretas de gateway no bundle |
| Credencial já exposta | Pendente externo | Revogar no provedor; não houve acesso nem alteração em produção |
| Resultados e privacidade | Validado localmente | As três regressões originais passaram: HTTP 503, armazenamento confidencial e credenciais vazias |
| Banco e autorização | Validado em PostgreSQL isolado | Migrações, papéis por UUID, RLS, confidencialidade pastoral e limite de pedidos passaram |
| Fila | Validado em PostgreSQL isolado | Dois consumidores disputaram o mesmo trabalho: um adquiriu; horário futuro, pausa e resultado incerto passaram |
| Gateway e handler | Validado localmente | HTTP local real: sucesso, 401, 429, 503 e JSON inválido; bloqueios de autenticação/origem e provedor inválido |
| Suíte após consolidação dos provedores | 35 testes aprovados | Testes antigos de interface/constantes substituídos por contratos comportamentais do gateway; inclui falha ao salvar, ausência de fallback, fuso e cache |
| Organização e CI | Validado localmente; execução remota pendente | `npm ci` passou, audit reportou zero vulnerabilidades; TypeScript `strict` e Deno aprovados; pipeline agora exige validações |
| Navegador desktop/celular | 8 testes aprovados | Login, falha e sucesso de gravação, ativar/pausar, simulação, histórico, pedido confidencial, Bíblia offline, logout e troca de usuário; APIs simuladas |
| Homologação de ponta a ponta | Pendente | Exige Supabase e grupo de teste próprios; nenhuma mensagem real foi enviada |

A nova migração está em `supabase/migrations/20261105_security_and_queue.sql`. Não foi aplicada no Supabase remoto. O teste usa um contêiner PostgreSQL exclusivo e não altera os outros bancos existentes.

## Diagnóstico executado

- [x] Instalar dependências localmente, sem alterar manifesto ou gerar lockfile npm.
- [x] Executar `npm run lint`: aprovado.
- [x] Executar `npm run build`: aprovado, com avisos sobre `__dirname` e bundle acima de 500 kB; JavaScript principal de aproximadamente 740 kB antes de gzip.
- [x] Verificar o bundle: token padrão do provedor encontrado em um arquivo JavaScript de produção, sem imprimir o valor.
- [x] Executar testes legados com rede bloqueada: cinco arquivos aprovados e dois reprovados (Bíblia e YouTube). Isso não valida integrações externas.
- [x] Executar três regressões comportamentais: inicialmente reprovadas; aprovadas após as correções locais.
- [ ] Validar banco, RLS, função publicada e provedores em ambiente de homologação.

A instalação utilizou `npm install --ignore-scripts --package-lock=false --legacy-peer-deps --no-audit --no-fund`, pois Bun não estava disponível. Essa execução não comprova reprodutibilidade pelo `bun.lock`. Na implementação, foi criado `package-lock.json`, removido o lockfile Bun e executado `npm ci`: instalação limpa aprovada, com zero vulnerabilidades reportadas pelo npm nessa execução.

### Evidência adicional e limites

- `npm ci`: instalação limpa sem `--legacy-peer-deps`, zero vulnerabilidades reportadas.
- `npm run lint`: aprovado com `strict: true`.
- `npx --yes deno check supabase/functions/whatsapp-daily-word/index.ts`: aprovado. Lockfile sincronizado e checagem com `--frozen` aprovada.
- `npm run check:security`: aprovado após build; verificação direcionada, não auditoria completa do histórico.
- Testes de banco repetidos após proteção do histórico legado: aprovados; cron também não adquire testes manuais pendentes.
- Falha real de escrita no histórico provocada por trigger no PostgreSQL: transação revertida, reserva preservada e resultado marcado para reconciliação.
- Guia operacional criado em `docs/OPERACAO_SEGURA.md`, incluindo mudanças no atendimento de pedidos, papéis, segredos e agendamento.
- `npm run test:env`: aprovado em build isolado; variáveis sintéticas de gateway e service_role não foram publicadas e a variável pública permitida foi preservada.
- O script de agendamento e retenção está preparado, mas não foi aplicado no Supabase remoto.

## Fase 1 — Conter exposição de credenciais (P0)

- [ ] Revogar o token exposto no painel do provedor e emitir outro exclusivamente para o servidor.
- [x] Remover credenciais fixas de providers, configurações padrão, função, SQL e testes atuais; validar fontes e bundle.
- [ ] Revisar e tratar exposição no histórico Git, artefatos já publicados e logs externos, em conjunto com a revogação.
- [x] Retirar segredos de variáveis `VITE_*`, respostas ao navegador e `localStorage`.
- [x] Remover envio direto pelo navegador e seu fallback após erro da Edge Function.
- [x] Remover a URL completa com token das mensagens de erro e dos logs.
- [x] Invalidar caches e remover credenciais locais antigas na atualização/logout.

**Aceite:** build novo sem os tokens antigos ou novos; nenhum segredo no HTML, JS, armazenamento ou respostas do painel. Requisição manual ao backend sem sessão recebe 401; membro recebe 403; administrador pode operar sem receber o segredo. Verificar revogação pelo painel ou operação de leitura controlada, sem enviar mensagens.

## Fase 2 — Tornar resultados e privacidade confiáveis (P1)

- [x] Fazer `saveSettings` retornar erro quando o banco falhar; exibir estado local não sincronizado se houver rascunho.
- [x] Fazer pedidos de oração passarem pelo backend, com validação de campos, limites e proteção contra abuso.
- [x] Distinguir pedido recebido, envio aceito pelo provedor e entrega confirmada; não prometer entrega após timeout.
- [x] Não persistir conteúdo confidencial no navegador; remover registros locais legados e estabelecer acesso exclusivo por papel pastoral no servidor.
- [ ] Ativar e validar a retenção de 30 dias em homologação (`supabase/ops/schedule.sql`).
- [x] Tratar erros HTTP e respostas inválidas; cancelar requisição do gateway no timeout e preservar resultado incerto.

**Aceite:** HTTP 400/500/503, erro de rede e timeout não exibem sucesso de entrega. Falha ao pausar automação não aparece como pausa salva. Pedido confidencial não permanece no armazenamento após envio, recarregamento ou logout; outro usuário não consegue consultá-lo.

## Fase 3 — Consolidar autorização e automação (P1)

- [x] Definir autorização administrativa no servidor/banco, preferencialmente por identidade estável e papel gerenciado; alinhar frontend, função e RLS.
- [x] Testar RLS por chamadas reais ao banco, sem depender da ocultação de botões.
- [x] Preparar script versionado do agendador e documentar deploy, segredos, pausa e monitoramento.
- [ ] Validar o script com pg_cron, pg_net e Vault no Supabase de homologação.
- [x] Processar somente itens com `scheduled_for <= agora`, respeitando `America/Cuiaba` independentemente do fuso do navegador.
- [x] Reservar trabalhos atomicamente, com unicidade por envio lógico, tentativas limitadas e recuperação de trabalhos interrompidos.
- [x] Tratar envio aceito seguido de falha de persistência sem reenvio automático indiscriminado; usar idempotência do provedor quando disponível e reconciliação quando não houver.
- [x] Rejeitar provedor desconhecido; implementar Z-API no servidor ou remover a opção. Simulação deve ser explícita e nunca contar como envio real.
- [x] Validar endpoints com lista de destinos permitidos e HTTPS, evitando requisições arbitrárias pelo servidor.

**Aceite:** duas chamadas concorrentes geram um único envio aceito; item futuro não é enviado; pausa impede processamento; falha intermediária não perde trabalho nem dispara repetição cega. Z-API indisponível retorna erro explícito. Executar testes de horário com relógio controlado, inclusive virada do dia.

### Organização implementada

O envio e a consulta de conexão foram centralizados em `supabase/functions/_shared/gateway.ts`; os providers antigos do frontend foram removidos. Formatação e acervo diário são compartilhados como funções puras. Histórico/fila, conexão, agendamento e prévia foram extraídos para componentes próprios. O carregamento foi separado em `useWhatsAppAutomationData`, com descarte de respostas após desmontagem. A divisão foi validada por TypeScript, build e repetição dos oito testes de navegador. O componente principal caiu de 1.196 para cerca de 470 linhas. A fila não repete automaticamente respostas ambíguas; falhas definitivas exigem nova tentativa operacional controlada.

## Fase 4 — Restringir cache e organizar responsabilidades (P2)

- [x] Limitar o service worker a recursos públicos explicitamente permitidos; excluir APIs autenticadas e dados administrativos.
- [x] Separar o painel em configuração, conexão, fila/histórico e prévia; extrair carregamento para hook e manter ações no coordenador do painel.
- [x] Centralizar integrações, formatação e regras de envio no servidor, compartilhando funções puras quando apropriado.
- [x] Remover SQL embutido no JSX; usar migrações versionadas e testar sua aplicação em banco vazio.
- [x] Usar carregamento sob demanda para telas grandes e revisar dependências sem uso.

**Aceite:** usuário A consulta painel, sai e usuário B entra no mesmo navegador; B não acessa dados de A pelo cache ou offline. Navegação e Bíblia pública offline continuam funcionando. Comparar tamanho dos bundles e testar telas em desktop e celular.

### Próximos passos externos

1. Revogar o token antigo e revisar histórico Git, builds antigos e logs do provedor.
2. Preparar Supabase de homologação, atribuir papéis por UUID e aplicar migrações pendentes.
3. Configurar segredos novos, publicar a função e provisionar cron/Vault e retenção.
4. Validar JWT real, RLS via API e recebimento no grupo de homologação.
5. Executar o workflow no GitHub. A configuração está pronta; nenhum push ou deploy foi feito nesta sessão.

## Fase 5 — Criar barreiras de qualidade (P2)

- [x] Escolher um gerenciador e instalar no CI com lockfile congelado, sem mascarar conflitos de dependências.
- [x] Adicionar scripts de testes unitários, integração e ponta a ponta; separar testes que exigem serviços externos.
- [x] Ativar verificações TypeScript mais estritas gradualmente e validar funções Supabase com ferramenta compatível com Deno.
- [x] Configurar workflow para exigir tipos, testes, banco, navegador, build e verificações de segurança antes do deploy.
- [ ] Executar e confirmar o workflow no GitHub, incluindo bloqueio de publicação diante de uma regressão.
- [x] Adicionar detecção direcionada de segredos em fontes/bundle e teste de variáveis públicas; instalação limpa reportou zero vulnerabilidades pelo npm.
- [ ] Verificar restrições de origem/API/cota da chave YouTube no Google Cloud, sem pressupor que estejam ausentes.

**Aceite:** checkout limpo instala de forma reproduzível; regressão proposital bloqueia CI; migrações e funções são verificadas; nenhum teste unitário faz envio real ou consome credenciais de produção.

## Testes fiéis e reproduzíveis

Os testes em `scripts/audit/regressions.test.ts` chamam as implementações atuais. O HTTP 503 agora é exercitado na chamada RPC ao backend de pedidos; o contrato de não confirmar sucesso foi preservado. Apenas as fronteiras externas são substituídas: HTTP retorna 503 e armazenamento usa um mapa isolado. Não substituem integração com banco, navegador ou provedor real. Os dados são fictícios.

```sh
# Regressões: saída 0 após as correções locais.
node --import ./scripts/audit/block-network.mjs --import tsx scripts/audit/regressions.test.ts

# Suíte existente sem chamadas externas.
node --import ./scripts/audit/block-network.mjs --import tsx --test src/services/*.test.ts src/services/whatsapp/*.test.ts

npm run lint
npm run build
```

| Cenário executado | Contrato exigido | Resultado atual |
| --- | --- | --- |
| Pedido recebe HTTP 503 | Não confirmar entrega | Aprovado após correção: não confirma registro |
| Pedido confidencial salvo | Não persistir conteúdo no navegador | Aprovado após correção: conteúdo não persistido |
| Provedor recebe credenciais vazias | Falhar sem chamada HTTP | Aprovado após correção: zero chamadas |

Não enfraquecer as asserções para obter aprovação. Após a migração das interfaces, adaptar o ponto de entrada dos testes preservando os contratos. O teste legado da GREEN-API aceitava qualquer booleano e foi substituído por testes do gateway no servidor; a regressão continua exigindo zero chamadas sem credenciais.

## Validação integrada antes de declarar funcionamento

- [ ] Preparar Supabase de homologação, contas de administrador e membro, dados sintéticos e grupo de teste separado.
- [ ] Testar autenticação ausente, JWT inválido/expirado, membro e administrador nos endpoints e no banco, incluindo leitura e escrita de tabelas restritas.
- [x] Exercitar provedor com servidor HTTP local: sucesso, 401, 429, 503, resposta inválida e timeout; verificar quantidade e corpo das chamadas.
- [x] Testar fila concorrente e recuperação contra PostgreSQL real, não apenas mocks de consultas.
- [x] Executar fluxo no navegador: login, salvar configuração, pausar, retomar, consultar fila e histórico, logout e troca de usuário.
- [x] Executar testes de cache com service worker ativo, recarregamento e modo offline.
- [ ] Fazer envio controlado ao grupo de homologação; verificar recebimento e correlação com histórico e identificador do provedor.
- [ ] Registrar evidências sem dados pessoais; manter como pendente qualquer etapa sem ambiente disponível.

**Conclusão de release:** todas as tarefas P0/P1 e todos os testes integrados aplicáveis aprovados. Build e tipos aprovados isoladamente não autorizam afirmar que segurança, entrega e agendamento funcionam. Não aplicar migrações, revogar credenciais ou enviar mensagens em produção como parte desta auditoria local.

## Resultado desta execução

| Verificação | Resultado local |
| --- | --- |
| Instalação com lockfile final (`npm ci`) | Aprovada; zero vulnerabilidades reportadas |
| TypeScript estrito | Aprovado |
| Serviços, gateway e cache (`npm test`) | 35 testes aprovados |
| Navegador desktop e celular (`npm run test:e2e`) | 8 testes aprovados, inclusive após refatoração |
| PostgreSQL (`npm run test:database`) | 8 grupos de verificações aprovados; dados legados, RLS, limite de pedidos, concorrência e rollback |
| Função Deno com `--frozen` | Aprovada |
| Build e varredura de segurança | Aprovados |
| Build com sentinelas de variáveis (`npm run test:env`) | Aprovado |
| Supabase e WhatsApp reais | Pendentes; nenhuma mensagem real enviada |

O build ainda avisa sobre um chunk principal de aproximadamente 611 kB antes de gzip, frente a 740 kB no diagnóstico. As telas Bíblia e administração já são carregadas sob demanda; otimização adicional de bundle pode ser feita separadamente. O agendador, a retenção e o atendimento pastoral precisam ser provisionados antes de liberar a atualização em produção.
