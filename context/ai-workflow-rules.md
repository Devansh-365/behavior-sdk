# AI Workflow Rules

## Approach

Build incrementally. **`context/`** plus **`specs/`** describe intent and structure — avoid inventing behavior that contradicts them without updating the docs in the same change.

## Scoping rules

- Prefer **one focused concern** per step (e.g. new collector + `types.ts` + `scanner.ts` wiring, without also retuning unrelated detectors).
- **Avoid** mixing **`apps/sdk/`** and any future **`services/`** closed code in a single PR/step.
- **`apps/web/`** demo changes can ship with SDK changes when they only **surface** new signals or fix consumption; keep scoring **logic** in **`apps/sdk/`**.

## When to split

Split a task if it:

- Touches **`types.ts`** **and** many dependents — land types first or in a dedicated PR.
- Changes **multiple detection rules** with different review risk — isolate each rule.
- Changes **`BehaviorPayload`** or other **wire contracts** — treat as a breaking/API step: document version impact.

## Handling ambiguity

- If collection semantics are unclear, add an **Open question** to **`context/progress-tracker.md`** and prefer a **safe default** (empty arrays, `supported: false`) over silent guesses.
- If a threshold needs product calibration, add **`// tunable:`** near the constant and note it in **`progress-tracker.md`**.

## Protected / high-blast-radius files

- **`apps/sdk/src/types.ts`** — cascades everywhere; review carefully.
- **`apps/sdk/dist/`** — generated; never edit by hand.
- **Root / workspace `tsconfig`** — discuss before relaxing **`strict`**.

## Before considering a unit done

1. **`npm run typecheck`** — zero errors.
2. **`npm run build`** for the SDK when **`src/`** changed — succeeds; spot-check bundle size if the change is large.
3. **`context/progress-tracker.md`** — update **Current phase** / **Completed** when shipping meaningful SDK or demo milestones.
