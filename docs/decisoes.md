# Decisões do projeto

## S0

- O pnpm workspace é a única ferramenta de orquestração de pacotes; não foi adicionado Turborepo para manter o custo e a complexidade mínimos.
- O Caddy serve `apps/web/out` montado como volume e encaminha `/api/*` para o serviço Fastify.
- O Fastify executa `prisma migrate deploy` antes de iniciar em Docker. Em desenvolvimento, as migrações versionadas continuam sendo aplicadas explicitamente.
- O schema Prisma usa `@map`/`@@map` para manter os nomes de domínio em português no banco sem perder convenções TypeScript.
- O endpoint de saúde não consulta o banco: ele informa disponibilidade do processo. A saúde da dependência do banco é controlada pelo healthcheck do Compose.

## S1

- A autenticação usa sessão opaca persistida em `sessoes`: o cookie de acesso assinado expira em 15 minutos e o refresh token expira em 30 dias, é armazenado apenas como SHA-256 e é substituído atomicamente a cada refresh. O cadastro e o login usam Argon2id para a senha.
- O cookie de refresh usa `Path=/api/auth`, que é o caminho público das rotas quando o Caddy encaminha `/api` para o Fastify.
- A recuperação de senha usa o SES v2, guarda somente o hash SHA-256 do token por uma hora, não revela se um e-mail existe e revoga as sessões após a redefinição.
- O perfil é protegido pela sessão autenticada: o cookie identifica a sessão, e a API resolve o `nutricionista_id` no banco antes de consultar ou alterar os dados.
- Logos são validadas no backend (PNG, JPEG ou WebP, até 5 MB), enviadas para o S3 no prefixo `logos/{nutricionista_id}/` e apenas a chave do objeto é persistida em `logo_path`. O bucket é separado da configuração de backups por `S3_BUCKET`.
