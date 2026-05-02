# nyasa

Browser SDK that classifies a session as **human**, **authorized AI agent**, or **unauthorized bot** by collecting behavioral and fingerprint signals and running detection rules.

This is an npm-workspaces monorepo:

- `apps/sdk/` — the SDK itself (`@devanshhq/nyasa` on npm, ESM + IIFE)
- `apps/web/` — Next.js marketing site, docs (Fumadocs), and live demo

## Quick start

```bash
npm install
npm run web           # marketing site + docs + demo (Next.js)
npm run build         # build SDK to apps/sdk/dist/
npm run typecheck     # typecheck workspaces
```

Install in your app:

```bash
npm install @devanshhq/nyasa
```
