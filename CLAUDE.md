## Behavior Analysis SDK — Build Context

This is an npm-workspaces monorepo:
- `apps/sdk/` — `behavior-sdk` package (browser SDK, ESM + IIFE bundles)
- `apps/demo/` — Vite + TS demo app that consumes the SDK via path alias for HMR

Read in this order before touching any code:

1. `context/project-overview.md` — what this system does, scope, success criteria
2. `context/architecture.md` — signal taxonomy, detection framework, monorepo layout, invariants
3. `context/code-standards.md` — TypeScript rules, naming, module conventions
4. `context/ai-workflow-rules.md` — how to work incrementally, when to split, protected files
5. `context/progress-tracker.md` — current state, open questions, what's next

For unit sequencing, see `specs/00-build-plan.md`.

## Common commands (run from repo root)

- `npm run typecheck` — typecheck all workspaces
- `npm run build` — build SDK only (produces `apps/sdk/dist/`)
- `npm run demo` — start Vite dev server with HMR on SDK source
- `npm run demo:build` — build SDK + demo (deployable static files in `apps/demo/dist/`)

## Rules

- Run `npm run typecheck` before every commit. Zero errors is non-negotiable.
- Update `context/progress-tracker.md` after completing any unit from the build plan.
- Do not mix `apps/sdk/` (open SDK) and future `services/` (closed scorer) work in one step.
- Do not add `any`, `@ts-ignore`, or non-null assertions (`!`) without a comment explaining why.
