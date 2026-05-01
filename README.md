# behavior-sdk

Browser SDK that classifies a session as **human**, **authorized AI agent**, or **unauthorized bot** by collecting behavioral and fingerprint signals and running detection rules.

This is an npm-workspaces monorepo:

- `apps/sdk/` — the SDK itself (`behavior-sdk` package, ESM + IIFE)
- `apps/demo/` — Vite + React demo with live verdict UI and synthetic actor scenarios

## Quick start

```bash
npm install
npm run demo          # http://localhost:5173 — interactive demo
npm run build         # build SDK to apps/sdk/dist/
npm run typecheck     # typecheck both workspaces
npm run demo:build    # full prod build (SDK + demo)
```
