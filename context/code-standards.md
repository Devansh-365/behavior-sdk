# Code Standards

## TypeScript

- `strict: true` in `tsconfig.json`. No exceptions.
- No `any`. No `@ts-ignore`. No non-null assertions (`!`) without a comment explaining why.
- Public and exported surfaces: parameters and return types **explicitly annotated** (avoid reliance on wide inference for package exports).
- Import types with `import type` where it keeps emitted JS clean and satisfies `isolatedModules`.

## Module conventions

- **`src/types.ts`** is the single source of truth for wire shapes and signal interfaces. If you need a new field, define it there first, then thread through collectors and demo.
- Signal collectors use types from **`types.ts`** — avoid large inline structural types in collector files.
- **Detection rules** import from **`../types`**, **`../utils`** (variance), and **`../features`** when they consume **`ExtractedFeatures`**. Do **not** import one detection module from another; composition (e.g. **`isMultimodalBot`**) is orchestrated in **`scanner.ts`** by passing results or **`features`** as arguments.

## Signal collectors (behavioral)

- **`BehaviorScanner`** passes a **mount `HTMLElement`** into factories that need it; others receive **`document`** explicitly in **`scanner.ts`**. When adding a collector, document whether it is **mount-scoped** vs **page-wide** so integrators know what **`collect()`**’s root controls.
- Each collector is a factory **`attach*Collector`** returning **`Collector<T>`**. Prefer factories over classes and avoid module-level mutable singletons.
- **Event handlers** that must be removed should be stable references (named functions) so **`removeEventListener`** works.
- **`getSignals()`** should return data safe for callers to read without mutating internal buffers (use spreads/copies for arrays/objects as needed).

## Signal collectors (fingerprint)

- Plain **`collect*Signal`** functions; no **`Collector`** lifecycle.
- Wrap browser-facing work in **`try/catch`**.
- Always return a **valid fallback object** in **`catch`** (never throw, never **`null`**).

## Feature extraction (`features.ts`)

- **`extractFeatures`** is the home for **derived metrics** shared by multiple detectors (variances, bursts, click precision, composite flags).
- **Tunable thresholds** used in both **`features`** and **`detections`** should stay consistent (constants exported from one place where practical, e.g. **`MACHINE_SPEED_MS`**).

## Detection rules

- **Pure** with respect to **`CollectedSignals`**: do not mutate **`signals`** or global DOM beyond read-only inspection where already encapsulated (prefer keeping DOM reads in dedicated helpers).
- **`reasons`**: short, human-readable strings for each contributing cue.
- **Multi-signal policy:** default is **≥ 2** contributing reasons before **`detected: true`** for bot-family rules; document exceptions in **`architecture.md`** and in the rule file if different (**`isHeadless`**, **`isAuthorizedAgent`**, **`isMultimodalBot`**).

## Client verdict (`scoring.ts`)

- **`deriveVerdict`** only combines **`Detections`**; keep weight tables and display labels here or next to them (**`DETECTION_DISPLAY_LABELS`** exported from **`scoring.ts`** for UIs).

## Naming

| Concept | Convention |
|---------|------------|
| Behavioral collector factories | `attach*Collector` |
| Fingerprint collectors | `collect*Signal` |
| Detection entrypoints | `detect*` |
| Signal interfaces | `*Signals` |
| Detection output | `DetectionResult` |

## Build and verification

- **`npm run typecheck`** from repo root — must pass before commit.
- **`npm run build`** — builds **`@devanshhq/nyasa`** via **`tsup`** into **`dist/`** (ESM, IIFE global, **`index.d.ts`**).
- Never hand-edit **`dist/`**.
