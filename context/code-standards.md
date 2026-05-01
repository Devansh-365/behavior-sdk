# Code Standards

## TypeScript

- `strict: true` in `tsconfig.json`. No exceptions.
- No `any`. No `@ts-ignore`. No non-null assertions (`!`) without a comment explaining why.
- All function parameters and return types explicitly annotated. Don't rely on inference for public surfaces.
- Import types with `import type` — keeps the compiled JS clean and satisfies `isolatedModules`.

## Module conventions

- `src/types.ts` is the single source of truth for all interfaces. If you need a new shape, add it there first.
- Signal collectors return types defined in `types.ts` — never inline object types in signal files.
- Detection rules import only from `../types` and `../utils`. No cross-detection imports.

## Signal collectors (behavioral)

- Each collector is a factory function that returns `Collector<T>`. No classes, no globals.
- Event handlers are named functions (not arrow functions) so `removeEventListener` works correctly.
- `getSignals()` returns a shallow copy (spread) of accumulated arrays — callers can't mutate internal state.

## Signal collectors (fingerprint)

- Plain exported functions, no lifecycle, called once at flush time.
- Always wrap in `try/catch` — fingerprint checks touch browser APIs that can throw in restricted environments.
- Always return a valid fallback shape in the catch block (never throw, never return `null`).

## Detection rules

- Pure functions: `(signals: CollectedSignals) → DetectionResult`. No side effects.
- Fire on ≥ 2 signals before setting `detected: true` (reduces false positives).
- `reasons` array must contain a human-readable explanation for each signal that fired.
- Import `computeVariance` from `../utils` — never re-implement it.

## Naming

| Concept | Convention |
|---------|-----------|
| Behavioral collector factories | `attach*Collector` — e.g. `attachKeystrokeCollector` |
| Fingerprint collector functions | `collect*Signal` — e.g. `collectCanvasSignal` |
| Detection rules | `detect*` — e.g. `detectHeadless` |
| Signal interfaces | `*Signals` — e.g. `KeystrokeSignals` |
| Detection result | `DetectionResult` (shared interface, not per-rule) |

## Build

- `npm run typecheck` — `tsc --noEmit`. Must pass before any commit.
- `npm run build` — `tsup`. Produces `dist/index.js` (ESM), `dist/index.global.js` (IIFE), `dist/index.d.ts`.
- Never hand-edit anything in `dist/` — it is generated output.
