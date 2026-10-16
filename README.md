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

## Sprints

- S0: fundação do monorepo, API, web, banco, Compose e CI.
