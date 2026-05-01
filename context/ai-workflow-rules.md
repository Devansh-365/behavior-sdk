# AI Workflow Rules

## Approach

Build incrementally, one unit at a time per `specs/00-build-plan.md`. The context files define what to build and how — do not invent behavior not described here.

## Scoping rules

- One file per change where possible. Adding a new signal = one new file in `src/signals/`, one entry in `src/types.ts`, one update to `src/scanner.ts`.
- Do not add a new detection rule and a new signal collector in the same step — they are separate concerns.
- Do not mix SDK code (`src/`) with any future server-side code (`services/`) in one step.

## When to split

Split a task if it:
- Touches both `src/types.ts` and more than two other files (type changes cascade — verify separately).
- Adds a new detection rule AND changes an existing one.
- Changes the `ZovenPayload` shape (breaking change for the scoring API contract).

## Handling ambiguity

- If a signal's collection method is unclear, add an open question to `context/progress-tracker.md` and implement a placeholder that returns empty arrays. Do not guess.
- If a detection rule threshold (e.g. `pasteRatio > 0.8`) needs tuning, mark it with a `// tunable:` comment and add it to progress-tracker open questions.

## Protected files

Do not modify without explicit instruction:
- `src/types.ts` — changes cascade to every file; update architecture.md first.
- `dist/` — generated output, never hand-edited.
- `tsconfig.json` — changes affect the entire type system; discuss first.

## Before moving to the next unit

1. `npm run typecheck` passes with zero errors.
2. `npm run build` succeeds and bundle size is under 15KB.
3. The unit's acceptance criteria from `specs/00-build-plan.md` are met.
4. `context/progress-tracker.md` is updated.
