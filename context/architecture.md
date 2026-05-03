# Architecture

## Monorepo layout

npm workspaces — `@devanshhq/nyasa` SDK under `apps/sdk/` and Next.js site under `apps/web/`:

```
zoven/
├── package.json                  # workspaces root, shared scripts
├── tsconfig.base.json            # shared strict TS config
│
├── apps/
│   ├── sdk/                      # name: "@devanshhq/nyasa"
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts        # ESM + IIFE (globalName: "BehaviorSDK")
│   │   └── src/
│   │       ├── types.ts          # All shared interfaces — single source of truth
│   │       ├── utils.ts          # computeVariance (shared by detection rules + features)
│   │       ├── features.ts      # extractFeatures(signals) — derived metrics for detectors
│   │       ├── scoring.ts        # deriveVerdict(detections) — client-side noisy-OR verdict
│   │       ├── scanner.ts        # BehaviorScanner orchestrator class
│   │       ├── index.ts          # collect() + type re-exports + DETECTION_DISPLAY_LABELS
│   │       ├── signals/
│   │       │   ├── behavioral/   # Stateful collectors — attach event listeners
│   │       │   │   ├── keystroke.ts      # dwells + flights
│   │       │   │   ├── mouse.ts          # path, curvature, stillnessRatio
│   │       │   │   ├── touch.ts          # touch counts + path length
│   │       │   │   ├── correction.ts     # backspace/delete, correctionRatio
│   │       │   │   ├── paste.ts          # pasteRatio, counts
│   │       │   │   ├── scroll.ts         # depths + timestamps
│   │       │   │   ├── input-type.ts     # typed / pasted / dropped / programmatic
│   │       │   │   ├── upload.ts         # picker vs drag-drop vs programmatic; EXIF via exif.ts
│   │       │   │   ├── exif.ts           # JPEG/PDF/PNG metadata (used by upload)
│   │       │   │   ├── visibility.ts     # tab hidden/blur + totalHiddenMs
│   │       │   │   ├── click.ts          # centerOffsets, targeted interactive clicks
│   │       │   │   ├── session-rhythm.ts # inter-event gaps, bursts (LLM rhythm proxy)
│   │       │   │   └── field-timing.ts   # per-field dwells, instantFills (<100ms)
│   │       │   ├── fingerprint/  # One-shot reads at flush; see caching note below
│   │       │   │   ├── webdriver.ts
│   │       │   │   ├── iframe.ts
│   │       │   │   ├── canvas.ts
│   │       │   │   ├── webgl.ts
│   │       │   │   ├── audio.ts            # prewarmed on attach
│   │       │   │   ├── incognito.ts        # prewarmed on attach
│   │       │   │   ├── timezone.ts         # IANA vs navigator.language consistency
│   │       │   │   └── device-persistence.ts  # localStorage device UUID, isNew
│   │       │   └── network/
│   │       │       ├── reaction.ts     # stateful: focus → first input, engagement delay
│   │       │       ├── connection.ts   # navigator.connection snapshot
│   │       │       └── timing.ts       # Navigation Timing DNS/TCP/TLS/TTFB/DOM
│   │       └── detections/       # Pure functions → DetectionResult
│   │           ├── isHeadless.ts
│   │           ├── isScripted.ts
│   │           ├── isLLMAgent.ts
│   │           ├── isAuthorizedAgent.ts  # client claim only; server validates crypto
│   │           ├── isUploadAutomation.ts
│   │           └── isMultimodalBot.ts      # cross-signal + near-miss composition
│   │
│   └── web/                      # Next.js (marketing, docs, /demo); deps: "@devanshhq/nyasa"
│       └── app/ demo/ docs/ components/ lib/ content/docs/ …
│
├── CLAUDE.md / context/ / specs/
└── README.md
```

## Pattern (inspired by fpscanner by Antoine Vastel)

- **One file per signal** (behavioral collectors; fingerprint checks; `exif.ts` is a utility consumed by `upload.ts`).
- **Two-phase evaluation.** `BehaviorScanner` runs Phase 1 (collect all signals) then Phase 2 (run all detection rules, then `deriveVerdict`).
- **Three pillars.** `behavioral`, `fingerprint`, `network` — same as the `CollectedSignals` shape in `types.ts`.

## Integration surface: mount `HTMLElement`, not “forms SDK only”

**`BehaviorScanner.attach(formEl: HTMLElement)`** (and **`collect(selector | element, …)`**) take a **DOM mount**, not a special form type. In practice:

| Scope | Examples |
|-------|----------|
| **Typical mounts** | `<form>`, a `div` wrapping step fields, a modal dialog with inputs, a chat input region |
| **Subtree-oriented collectors** | Keystroke, correction, paste, input-type, upload, field-timing, reaction — wired from **`scanner.ts`** to the **mount** (or derive focus targets under it) |
| **Broader collectors** | Mouse, touch, click — attached to **`document`** where the implementation needs full-pointer context; scroll and session rhythm are global to the page |
| **Environment** | Fingerprint + connection + navigation timing — **page / browser**, independent of mount |

**`collect()`** registers **`submit`** on **`mount.closest('form') ?? mount`**. Multi-page SPAs or headless UI flows without a wrapping `<form>` should rely on **`flush()`** (and/or **`visibilitychange`**) instead of expecting submit.

## The `Collector<T>` interface

Behavioral collectors implement `{ getSignals(): T, detach(): void }`. The scanner holds them in `#collectors` and calls `detach()` after flush.

Fingerprint slices and one-shot network reads use plain functions. **`#getFingerprint()`** caches the full fingerprint object after the first successful read when **`iframe.consistent`** and **`audio.supported`** are both true; otherwise the next `buildPayload()` retries (e.g. audio still warming). **`detach()`** clears the fingerprint cache and resets audio state.

## Feature extraction (`features.ts`)

**`extractFeatures(signals)`** computes shared derived values (variance thresholds, machine-speed burst, click precision, composited booleans) so detection rules do not duplicate math. Rules that need timing take **`SessionMeta`** (`elapsedMs`). **`isMultimodalBot`** additionally takes the **`DetectionResult`** from `isScripted` and `isLLMAgent` (near-miss composition); **`scanner.ts`** runs those two before it.

## Client verdict (`scoring.ts`)

**`deriveVerdict(detections)`** applies **noisy-OR** weighting over fired rules (see `WEIGHTS` in `scoring.ts`). **`isAuthorizedAgent`** short-circuits to **`AuthorizedAgent`** when `detected`. Otherwise consumers get **`Human`** or **`UnauthorizedBot`** with **`badges`** and **`confidence`**. This is **client-side** triage; the scoring API remains authoritative for production.

## Web demo (`apps/web`)

The live demo is at **`/demo`** (Next.js client route). It consumes **`@devanshhq/nyasa`**. Local dev may map the package to `../sdk/src` for instant typecheck; production builds compile **`apps/sdk/dist/`** first (e.g. `npm run build:vercel`).

Demo UI (under `components/demo/`): **`DemoApp`** layout, **`DemoTelemetryPanel`** (Behavior / Environment tabs), **`SignalsCard`**, **`FingerprintCard`**, **`NetworkCard`**, **`VerdictCard`**, **`DetectionsCard`**, **`PayloadViewer`**, **`ScenariosPanel`**, etc.

## Actor taxonomy (product)

| Verdict / actor        | Role |
|------------------------|------|
| Human                  | No bot rules fired (client-side) |
| AuthorizedAgent        | Valid-format agent signature present (`isAuthorizedAgent`); server must verify |
| UnauthorizedBot        | One or more bot-family rules fired (combined via noisy-OR) |

## Signal categories (current counts)

| Category   | Count | Notes |
|-----------|-------|--------|
| Behavioral | 13    | Includes visibility, click, session-rhythm, field-timing; `exif` is not a top-level pillar |
| Fingerprint | 8    | webdriver, iframe, canvas, webgl, audio, incognito, timezone, device persistence |
| Network  | 3     | reaction (stateful), connection, timing |

## Detection rules

Each rule returns **`DetectionResult`** (`detected`, `severity`, `reasons`). Rules do not mutate **`CollectedSignals`**.

- **Threshold convention:** Most bot-family rules require **≥ 2 contributing signals/reasons** before `detected: true` to limit false positives. Exceptions: **`isHeadless`** may set `detected` with a single strong reason (severity scales with reason count); **`isAuthorizedAgent`** is format + presence based, not multi-signal; **`isMultimodalBot`** composes cross-signal patterns and scripted/LLM near-misses (see source).

- **`isHeadless`** — Automation and environment markers (webdriver, CDP, Playwright, iframe inconsistency, SwiftShader/LLVMpipe, etc. per `isHeadless.ts`).

- **`isScripted`** — Combines pointer/touch absence (mobile-aware), low timing variance, paste-heavy sessions, corrections, reaction time, programmatic input, etc.

- **`isLLMAgent`** — Paste-heavy, scroll/input patterns, completion speed, machine-speed bursts, uniform flights, mouse stillness, click precision, session rhythm, instant field fills, etc.

- **`isAuthorizedAgent`** — Reads `window.__nyasaAgentSignature` or `<meta name="x-agent-signature">`; **cryptographic validation is server-side**.

- **`isUploadAutomation`** — Programmatic file attachment plus EXIF-based cues (e.g. AI software string, JPEG missing EXIF).

- **`isMultimodalBot`** — Incoherence across modalities (e.g. natural mouse + too-precise clicks) plus **near-miss** when both `isScripted` and `isLLMAgent` almost fired.

## Paste collector semantics

`PasteSignals.pasteRatio = pastedChars / totalChars` (0.0 = all typed, 1.0 = all pasted). `charCount` is total characters (typed + pasted).

## Invariants

1. The SDK does not block navigation for delivery — **`sendBeacon`** on flush; collection work is designed to stay lightweight.
2. **Variance:** use **`computeVariance`** from **`utils.ts`** (or **`extractFeatures`** where appropriate); do not duplicate.
3. **`apps/sdk/`** does not import from future **`services/`** (closed scorer).
4. Fingerprint collectors: **try/catch**, always return a **valid fallback shape**, never throw, never **`null`**.
5. Fingerprint cache: see **`#getFingerprint`**; **`detach()`** resets cache and audio.
6. **`types.ts`** is the contract for payloads and signals; breaking changes require API/version discipline (see `BehaviorPayload` in **`types.ts`**).
