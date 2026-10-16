# NutriApp — Especificação para o agente construtor

App web para nutricionistas: cadastrar pacientes, registrar medições com cálculo automático de TMB/GET, buscar alimentos em tabelas nutricionais e montar planos alimentares com PDF. Piloto com ~10 nutricionistas (~300 pacientes). Custo mínimo é requisito de projeto.

## 0. Como trabalhar

1. Execute **uma sprint por vez**, na ordem. Não comece a seguinte antes de cumprir os critérios de aceite da atual.
2. Não implemente nada da seção 9 (fora de escopo).
3. Itens marcados **[HUMANO]** dependem de uma pessoa (contas, domínio, validação, texto jurídico). Pare, liste o que falta e siga com o que não depende deles.
4. Toda regra de cálculo fica em `packages/shared`. Nunca duplique fórmula em `apps/web` ou `apps/api`.
5. Todo CRUD novo nasce com teste de autorização (nutricionista A não acessa dado do nutricionista B).
6. Ao fim de cada sprint: testes passando, lint limpo, deploy funcionando (a partir da S1), README atualizado com o que mudou.
7. Se uma decisão não estiver neste documento, escolha a opção mais simples e mais barata, registre em `docs/decisoes.md` e siga.

## 1. Stack (fixa)

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript em tudo |
| Monorepo | pnpm workspaces |
| Web | Next.js com `output: 'export'` (estático) + Tailwind |
| API | Fastify + Zod (validação) |
| Banco | PostgreSQL 16 + Prisma. Extensões `unaccent` e `pg_trgm` |
| Proxy/HTTPS | Caddy (serve o web estático e faz proxy de `/api` → Fastify) |
| Testes | Vitest (unitário/integração) |
| CI/CD | GitHub Actions: lint → testes → build → deploy por SSH |
| E-mail | Amazon SES (só recuperação de senha) |
| Mobile (V2, não construir agora) | React Native + Expo |

**Proibido no MVP** (custo e complexidade): Redis, filas (SQS etc.), Kubernetes/ECS, banco gerenciado, balanceador, Server Actions e rotas de API do Next, SSR.

## 2. Estrutura do repositório

```
/
├─ apps/
│  ├─ web/            # Next.js estático
│  └─ api/            # Fastify
│     └─ src/
│        ├─ controllers/   # HTTP, validação de entrada e respostas
│        ├─ repositories/  # acesso ao Prisma e persistência
│        ├─ services/      # regras de negócio e orquestração
│        └─ types/         # contratos e tipos compartilhados da API
├─ packages/
│  └─ shared/         # schemas Zod, tipos, nutri-calc (fórmulas e totais)
├─ scripts/
│  ├─ import-taco/    # importação reproduzível da TACO
│  ├─ import-pof/     # medidas caseiras
│  └─ backup/         # pg_dump → S3
├─ docker/            # Dockerfile da API, Caddyfile
├─ docs/decisoes.md
├─ docker-compose.yml
└─ AGENTS.md
```

### Organização interna da API

As rotas do Fastify são compostas em `src/app.ts`, que não deve concentrar regras de negócio. Controllers cuidam do protocolo HTTP e da validação com Zod; services concentram autenticação, tokens e demais regras de negócio; repositories encapsulam o acesso ao Prisma; e `types` contém contratos de injeção e tipos específicos da API. Novos módulos devem seguir essa separação e manter testes de integração das rotas e testes unitários das regras isoladas quando houver lógica relevante.

## 3. Arquitetura e infraestrutura

```
Internet ─HTTPS─> VM única
                   ├─ Caddy ── arquivos estáticos do web
                   │        └─ /api → Fastify
                   ├─ Fastify
                   └─ PostgreSQL (volume em disco)

Backup noturno: pg_dump → S3
E-mail: SES      Alimentos externos: USDA API (cache no banco)
```

- **Hospedagem:** Amazon Lightsail 2 GB (ou EC2 t4g.small se o Lightsail não consumir créditos AWS), região us-east-1. **[HUMANO]** cria a conta AWS no **Paid plan** (o Free plan fecha a conta em 6 meses) e ativa alerta de orçamento.
- **Docker Compose** com 3 serviços: `caddy`, `api`, `db`.
- **Mesma origem** para web e API, então não configure CORS.
- **Meta de custo:** ~US$ 11–14/mês. Medir uso de memória na S1 e avisar o humano se passar de ~70%.
- **Variáveis de ambiente:** `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`, `USDA_API_KEY`, `SES_REGION`, `SES_FROM`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BACKUP_BUCKET`. Nunca versionar segredos. A `USDA_API_KEY` nunca vai para o web.

### Convenção de rotas do web (importante)
Com export estático, o Next não conhece IDs de pacientes/planos em tempo de build. Use **query string** em vez de segmentos dinâmicos: `/app/paciente?id=<uuid>`, `/app/plano?id=<uuid>`.

## 4. Modelo de dados

Todos os ids são UUID. Todas as tabelas têm `criado_em` e `atualizado_em`.

| Tabela | Campos principais |
|---|---|
| `nutricionistas` | email (único), senha_hash (argon2id), nome, crn, logo_path, formula_padrao (`mifflin` \| `harris_benedict`), fatores_atividade (JSON) |
| `sessoes` | nutricionista_id, refresh_token_hash, expira_em, revogada_em |
| `reset_senha` | nutricionista_id, token_hash, expira_em, usado_em |
| `pacientes` | nutricionista_id, nome, data_nascimento, sexo (`M` \| `F`), contato (opcional), anamnese (texto), arquivado_em |
| `medicoes` | paciente_id, data, peso_kg, altura_cm, circunferencias (JSON: cintura, quadril, braço, etc.), nivel_atividade, **tmb_kcal, get_kcal, imc, formula_usada, fator_usado** (snapshot) |
| `alimentos` | fonte (`taco` \| `usda`), id_externo, nome, nome_busca (sem acento), grupo, energia_kcal, proteina_g, lipidio_g, carboidrato_g, fibra_g, sodio_mg, outros (JSONB). Valores **por 100 g**. Nutriente ausente = `NULL` (nunca 0) |
| `medidas_caseiras` | alimento_id, descricao (ex.: "colher de sopa"), gramas |
| `planos` | paciente_id, nome, meta_kcal (opcional), versao_de (plano de origem, opcional) |
| `refeicoes` | plano_id, nome, horario (opcional), ordem |
| `itens_plano` | refeicao_id, alimento_id, gramas, medida_id (opcional), quantidade_medida (opcional), ordem |
| `consentimentos` | nutricionista_id, versao_termo, aceito_em, ip |
| `auditoria_acessos` | nutricionista_id, acao, entidade, entidade_id, ocorrido_em |

**Regra de ouro:** toda consulta a `pacientes`, `medicoes`, `planos`, `refeicoes` e `itens_plano` filtra pelo `nutricionista_id` da sessão (direto ou via join). Exclusão de paciente é **arquivamento** (soft delete).

## 5. Regras de negócio

Unidades: peso em kg, altura em cm, idade em anos completos (calculada de `data_nascimento` na data da medição).

**TMB — Mifflin-St Jeor (padrão):**
- Homem: `10·peso + 6,25·altura − 5·idade + 5`
- Mulher: `10·peso + 6,25·altura − 5·idade − 161`

**TMB — Harris-Benedict revisada (1984):**
- Homem: `88,362 + 13,397·peso + 4,799·altura − 5,677·idade`
- Mulher: `447,593 + 9,247·peso + 3,098·altura − 4,330·idade`

**GET** = TMB × fator de atividade. Fatores padrão (editáveis por nutricionista): sedentário 1,2 · leve 1,375 · moderado 1,55 · ativo 1,725 · muito ativo 1,9.

**IMC** = peso ÷ (altura em metros)².

**Cálculo automático:** ao criar ou editar uma medição, a API calcula TMB, GET e IMC e grava o snapshot na própria `medicoes`, na mesma requisição. A resposta já devolve os valores. O nutricionista não aciona cálculo manual.

**Totais do plano:** para cada item, `gramas ÷ 100 × valor_do_nutriente`. Some por refeição e por plano. Se um item tem nutriente `NULL`, **não some como zero**: liste o alimento e o nutriente em `dados_ausentes` e exiba isso no resumo.

**Medida caseira → gramas:** `quantidade_medida × medidas_caseiras.gramas`.

**Validações padrão** (decisão de projeto, ajustáveis): peso 2–500 kg, altura 50–250 cm, idade 0–120.

## 6. API (REST, prefixo `/api`, JSON)

| Grupo | Endpoints |
|---|---|
| Saúde | `GET /health` |
| Auth | `POST /auth/register` · `/auth/login` · `/auth/logout` · `/auth/refresh` · `/auth/forgot-password` · `/auth/reset-password` |
| Conta | `GET/PATCH /me` · `POST /me/logo` · `PATCH /me/settings` · `POST /me/consent` |
| Pacientes | `GET/POST /patients` · `GET/PATCH /patients/:id` · `POST /patients/:id/archive` |
| Medições | `GET/POST /patients/:id/measurements` · `PATCH/DELETE /measurements/:id` |
| Alimentos | `GET /foods?q=&source=` · `GET /foods/:id` · `GET /foods/:id/measures` |
| Planos | `GET/POST /patients/:id/plans` · `GET/PATCH/DELETE /plans/:id` · `POST /plans/:id/duplicate` · `PUT /plans/:id/meals` (substitui refeições e itens) · `GET /plans/:id/summary` · `GET /plans/:id/pdf` |

Sessão: cookie `httpOnly`, `Secure`, `SameSite=Lax` + refresh token com rotação (guardar só o hash). Erros em formato único `{ codigo, mensagem, detalhes? }`. Rate limit nas rotas de auth.

## 7. Telas do web

`/login` · `/cadastro` · `/recuperar-senha` · `/redefinir-senha` · `/app/pacientes` (lista + busca) · `/app/paciente?id=` (abas: dados, medições, planos) · `/app/plano?id=` (montagem, resumo, metas, PDF) · `/app/perfil` · `/app/configuracoes` (fórmula padrão e fatores de atividade).

## 8. Sprints

Cada sprint é entregue com os critérios de aceite cumpridos.

### S0 — Fundação
**Tarefas**
- [x] Monorepo pnpm com `apps/web`, `apps/api`, `packages/shared`, TypeScript e lint
- [x] `docker-compose.yml` local (Postgres, Caddy, API) e Dockerfile da API
- [x] API base: Fastify, Zod, Prisma, migrações, tratamento de erro padrão, logs, `GET /health`
- [x] Web base: Next estático, Tailwind, layout, cliente de API tipado
- [x] Schema Prisma com as tabelas da seção 4
- [x] CI no GitHub Actions (lint + testes + build)

**Aceite:** `docker compose up` sobe tudo local; `/api/health` responde; CI verde.

### S1 — Conta do nutricionista e deploy
**Tarefas**
- [x] Cadastro, login, logout, refresh com rotação (cookie httpOnly)
- [x] Recuperação de senha por e-mail via SES **[HUMANO: criar identidade verificada e pedir saída do sandbox]**
- [ ] Verificar no final da S1 as permissões IAM do SES, a identidade remetente verificada e um envio controlado de recuperação de senha
- [ ] Perfil: nome, CRN, upload de logo (disco da VM, dentro do volume com backup)
- [ ] Telas de login, cadastro, recuperação e perfil
- [ ] Provisionar VM, Docker Compose de produção, Caddy com HTTPS **[HUMANO: conta AWS, domínio, DNS]**
- [ ] Deploy automático pelo CI
- [ ] Medir memória da VM e registrar em `docs/decisoes.md`
- [ ] Verificar as permissões da aws para envio de email

**Aceite:** em produção, um nutricionista cria conta, entra, recupera senha e edita perfil.

### S2 — Pacientes
**Tarefas**
- [ ] CRUD de pacientes, anamnese em texto, arquivamento
- [ ] Filtro por `nutricionista_id` em todas as consultas
- [ ] Telas: lista com busca, formulário, detalhe
- [ ] Testes de autorização entre dois nutricionistas

**Aceite:** teste automatizado comprova que nutricionista A recebe 404 para paciente do B em todos os endpoints.

### S3 — Medições e cálculos
**Tarefas**
- [ ] `packages/shared/nutri-calc`: TMB (2 fórmulas), GET, IMC, com testes unitários cobrindo homem, mulher e limites
- [ ] CRUD de medições com snapshot calculado na mesma requisição
- [ ] Tela de medições: formulário, indicadores (TMB, GET, IMC) exibidos ao salvar, gráfico de peso e IMC no tempo
- [ ] Tela de configurações (fórmula padrão, fatores de atividade)
- [ ] **[HUMANO]** nutricionista parceiro confere 5 casos reais

**Aceite:** os testes unitários passam com valores de referência calculados à mão; o nutricionista parceiro confirma os 5 casos.

### S4 — Base de alimentos
**Tarefas**
- [ ] `scripts/import-taco`: importar a TACO (597 alimentos) para `alimentos`, reproduzível. `Tr` vira 0; vazio/NA vira `NULL` **[HUMANO: confirmar termos de uso dos dados com NEPA/UNICAMP]**
- [ ] `scripts/import-pof`: importar medidas caseiras (POF/IBGE). O código IBGE **não** casa com o id da TACO: criar o vínculo manualmente (arquivo CSV versionado) para ~100–150 alimentos mais usados
- [ ] Integração USDA FoodData Central: chamada no backend com a chave, respeitando o limite de 1.000 req/hora por IP; todo item consultado é gravado em `alimentos` (cache)
- [ ] Busca unificada por `unaccent` + `pg_trgm`; TACO vem antes da USDA
- [ ] Componente de busca com autocomplete e painel de valores nutricionais (por 100 g e por medida caseira)

**Aceite:** buscar "arroz" lista TACO primeiro, com valores por 100 g e medidas caseiras; item da USDA consultado uma vez é servido do banco na segunda vez.

### S5 — Plano alimentar: montagem
**Tarefas**
- [ ] CRUD de planos, refeições e itens; `PUT /plans/:id/meals`
- [ ] Cálculo de totais em `packages/shared`, usado pela API e pelo web
- [ ] Tela de montagem: criar refeições, buscar e adicionar alimento, informar quantidade em gramas ou medida caseira, ver kcal e macros por refeição e total
- [ ] Testes de totais com casos conferidos à mão, incluindo nutriente ausente

**Aceite:** montar um plano de 5 refeições e ver os totais corretos; itens com dado ausente aparecem em `dados_ausentes`.

### S6 — Plano: metas, versões e PDF
**Tarefas**
- [ ] Comparar o total do plano com o GET da última medição e com `meta_kcal`; mostrar desvio
- [ ] Duplicar plano (campo `versao_de`) e listar versões
- [ ] `GET /plans/:id/pdf`: PDF com logo, nome e CRN do nutricionista, refeições, itens e totais. Usar biblioteca JS leve (pdfmake ou @react-pdf/renderer). **Não usar navegador headless**
- [ ] Mostrar "dados ausentes" no resumo e no PDF

**Aceite:** PDF abre com logo e CRN corretos; plano duplicado mantém itens e totais idênticos.

### S7 — Segurança, backup e LGPD
**Tarefas**
- [ ] `scripts/backup`: `pg_dump` noturno para S3 com expiração em 30 dias, mais **teste de restauração documentado e executado**
- [ ] Hardening da VM: SSH por chave, firewall só 22/80/443, atualizações automáticas
- [ ] Rate limit, cabeçalhos de segurança, `auditoria_acessos` para leitura e escrita de dados de paciente
- [ ] Tela de aceite do termo de consentimento (versão registrada em `consentimentos`) **[HUMANO: fornecer texto do termo e da política de privacidade; consultar advogado sobre hospedagem fora do Brasil e LGPD]**
- [ ] Checklist OWASP Top 10 revisado e registrado em `docs/seguranca.md`
- [ ] Teste de carga leve (~10 usuários simultâneos) e registro dos resultados

**Aceite:** restauração do backup em banco limpo funciona; nenhum endpoint de paciente responde sem sessão; aceite do termo é obrigatório no primeiro login.

### S8 — Piloto e estabilização
**Tarefas**
- [ ] Corrigir bugs reportados pelos 10 nutricionistas do piloto
- [ ] Ajustes de UX a partir do feedback
- [ ] Documentação de operação em `docs/operacao.md` (deploy, backup, restauração, rotação de segredos)
- [ ] Lista priorizada de melhorias para a V2

**Aceite:** piloto rodando em produção sem erro crítico aberto; documentação de operação testada por alguém que não escreveu o código.

## 9. Fora de escopo (V2 — não construir)

App mobile do paciente (Expo), diário alimentar, notificações push, chat, telemedicina, wearables, Open Food Facts/código de barras, reconhecimento de refeição por foto, cobrança/assinatura, agenda, multi-nutricionista por clínica, alergias e restrições, substituição de alimentos.

**Preparar sem construir:** manter `nutricionista_id` como único papel de usuário hoje, mas não acoplar regras de autorização à tabela `nutricionistas` de um jeito que impeça adicionar um papel `paciente` depois.

## 10. Definição de pronto (vale para toda tarefa)

- Código tipado, sem `any` desnecessário, lint limpo
- Entrada validada com Zod; erro no formato único
- Teste cobrindo regra de negócio e autorização
- Nenhum segredo no repositório
- Funciona em produção após o deploy do CI (a partir da S1)
