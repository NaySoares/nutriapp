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

O cadastro e o login criam uma sessão. O token de acesso é um cookie `httpOnly` de curta duração; o refresh token também é `httpOnly`, armazenado somente como hash no banco e rotacionado a cada uso. Em produção, os cookies recebem `Secure` e `SameSite=Lax`.

## Sprints

- S0: fundação do monorepo, API, web, banco, Compose e CI.
