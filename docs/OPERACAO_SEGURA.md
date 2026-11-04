# Operação e homologação da atualização de segurança

## Mudanças de comportamento

- O navegador não recebe tokens de WhatsApp. A função é o único caminho de envio.
- Somente GREEN-API, Evolution e simulação são aceitos. Z-API foi retirada até haver implementação validada no servidor.
- Pedidos de oração são registrados no Supabase para consulta pastoral. Não há mais envio automático por FormSubmit/CallMeBot. A interface confirma registro, não leitura ou entrega.
- Papéis são atribuídos por UUID em `staff_roles`. E-mail e metadados editáveis não concedem acesso. O papel `whatsapp_admin` não permite ler pedidos; `pastor` permite.
- Trabalhos com resultado incerto não são reenviados automaticamente. Erros definitivos ficam como falha. Retentativas exigem conferência operacional; não há promessa de entrega exatamente uma vez pelo provedor.

## Ordem de implantação

1. Pausar os disparos atuais no agendador e no provedor. Revogar o token exposto, inclusive se removido do código; a atualização não consegue revogá-lo remotamente.
2. Fazer backup e testar as migrações em homologação. Conferir duplicatas de `(daily_word_date, group_id)` na fila e valores de `provider_type` legados; a migração falha em vez de apagar dados conflitantes. Detalhes de erros legados serão removidos porque podiam conter tokens em URLs; status e registros são preservados. Configurações `zapi` precisam ser substituídas por um provedor suportado antes da aplicação.
3. Aplicar as migrações versionadas. Em banco existente, aplicar apenas as pendentes; não executar novamente o seed antigo. Não publicar somente o frontend: ele depende das novas RPCs e políticas.
4. Conferir o UUID de cada usuário na administração do Supabase e conceder os papéis necessários, com acesso administrativo ao banco:

   ```sql
   -- Substituir o UUID pelo usuário confirmado. Não usar cadastro por e-mail como regra de acesso.
   INSERT INTO public.staff_roles(user_id, role)
   VALUES ('00000000-0000-0000-0000-000000000001', 'whatsapp_admin');
   -- Conceder 'pastor' separadamente aos responsáveis por consultar pedidos.
   ```

5. Configurar os segredos da função e publicar `whatsapp-daily-word`. `verify_jwt = false` em `supabase/config.toml` permite chegar ao handler; este valida usuários com `getUser` e exige papel no banco. O cron utiliza segredo exclusivo, restrito à ação `process`.
6. Publicar o frontend somente após tipos, testes, build e varredura de segurança passarem. Configurar as variáveis públicas pela hospedagem; restringir a chave YouTube no Google Cloud por origem e API.
7. Concluir os testes integrados, conectar a instância no painel do provedor e fazer um envio ao grupo de homologação. Só então ativar o cron e o grupo de destino pretendido.

## Segredos do servidor

| Nome | Uso |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Disponibilizados pelo ambiente Supabase; nunca usados no navegador. |
| `GREEN_API_URL`, `GREEN_API_INSTANCE_ID`, `GREEN_API_TOKEN` | Conta GREEN-API com token novo. |
| `EVOLUTION_API_URL`, `EVOLUTION_API_INSTANCE_ID`, `EVOLUTION_API_TOKEN` | Conta Evolution, se utilizada. |
| `WHATSAPP_ALLOWED_PROVIDER_ORIGINS` | Origens HTTPS exatas permitidas, separadas por vírgula; exemplo fictício: `https://gateway.example.org`. Sem caminho, redirecionamento ou wildcard. |
| `ALLOWED_ORIGINS` | Origens exatas do site. Caminho `/SITE_IGEAD/` não faz parte da origem. |
| `WHATSAPP_CRON_SECRET` | Segredo aleatório exclusivo para o agendador; não reutilizar `service_role`. |

O Vite publica somente as três configurações públicas conhecidas. Variáveis antigas de gateways ou `service_role` são ignoradas mesmo se ainda existirem no ambiente; isso é testado por um build com sentinelas sintéticas.

Os endpoints e tokens enviados no corpo da requisição são rejeitados. Somente a configuração do ambiente resolve o provedor. Não colocar segredos em commits, argumentos de comandos, screenshots ou variáveis `VITE_*`.

## Agendamento, retenção e consulta pastoral

Provisionar no Vault, pela administração do Supabase, `igead_project_url` e `igead_whatsapp_cron_secret`. O segundo deve coincidir com `WHATSAPP_CRON_SECRET`. Aplicar explicitamente `supabase/ops/schedule.sql` após revisar o ambiente: instala o disparo a cada minuto e a exclusão de pedidos com mais de 30 dias. Essa operação requer suporte a `pg_cron`, `pg_net` e Vault; não foi executada no Supabase remoto.

O horário de envio é calculado em `America/Cuiaba`. Chamadas anteriores ao horário apenas enfileiram; não enviam antes do vencimento. O cron deve ser monitorado junto a `cron.job_run_details`, respostas do `pg_net` e tabelas de fila/histórico. A indicação “ativação salva” no painel não comprova que o cron está instalado.

A consulta pastoral inicial é pela Data API usando a sessão de um usuário com papel `pastor`, respeitando RLS. Não há painel pastoral nesta alteração. O procedimento de atendimento deve ser combinado antes de liberar o formulário em produção. A política de 30 dias só passa a ser executada após provisionar o agendador; backups exigem política de retenção própria.

## Resultado incerto e recuperação

Consultar a instância no provedor antes de qualquer repetição. `uncertain` pode significar envio aceito com resposta perdida ou falha ao persistir o histórico. O sistema preserva a reserva e não recupera esse trabalho como pendente. Após dois minutos, reservas interrompidas passam a `uncertain` na próxima chamada de aquisição.

Se houve aceite, reconciliar fila e histórico com o identificador do provedor, em operação administrativa auditada. Se não houve, um operador pode liberar nova tentativa apenas após confirmar a ausência de envio e verificar `attempts < max_attempts`. Nunca redefinir em massa reservas incertas. Manter o agendador pausado durante reconciliações; não desfazer a migração restaurando tokens no navegador.

## Verificações reproduzíveis

```sh
npm ci
npm run lint
npm test
npm run check:functions  # requer Deno 2
npm run build
npm run check:security
npm run test:env         # build isolado com sentinelas sintéticas
npm run test:e2e         # Chrome local; Chromium do Playwright no CI
```

Para o banco, criar um contêiner de teste sem porta publicada:

```sh
docker run --name igead-audit-postgres -e POSTGRES_PASSWORD=local-test-only -d postgres:16
# Aguardar pg_isready antes dos testes.
npm run test:database
docker stop igead-audit-postgres
docker rm igead-audit-postgres
```

`test:database` recria exclusivamente o banco `igead_test` nesse contêiner. Ele reproduz papéis e funções Auth necessários ao PostgreSQL; não reproduz toda a infraestrutura Supabase nem substitui testes com JWT real em homologação.
