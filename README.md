# NutriApp

Aplicação web estática e API para nutricionistas.

## Desenvolvimento

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Para iniciar PostgreSQL, API e Caddy:

```bash
docker compose up --build
```

A API responde em `http://localhost/api/health` quando acessada pelo Caddy e diretamente em `http://localhost:3001/health`.

## Autenticação

A S1 fornece:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

O cadastro e o login criam uma sessão. O token de acesso é um cookie `httpOnly` de curta duração; o refresh token também é `httpOnly`, armazenado somente como hash no banco e rotacionado a cada uso. Em produção, os cookies recebem `Secure` e `SameSite=Lax`.

A recuperação responde de forma igual para e-mails existentes e inexistentes. O token enviado por e-mail expira em uma hora, pode ser usado uma única vez e revoga as sessões existentes após a troca da senha.

O perfil autenticado usa:

- `GET /api/me`
- `PATCH /api/me` com `{ "nome": "...", "crn": "..." }`
- `POST /api/me/logo` como `multipart/form-data`, campo `logo`

Logos aceitas são PNG, JPEG ou WebP com até 5 MB. A API envia o arquivo para o bucket configurado em `S3_BUCKET` e armazena apenas a chave no campo `logoPath`.

As telas estáticas correspondentes estão disponíveis em `/login/`, `/cadastro/`, `/recuperar-senha/`, `/redefinir-senha/` e `/app/perfil/`.

## Sprints

- S0: fundação do monorepo, API, web, banco, Compose e CI.
