# Architecture

## Monorepo layout

npm workspaces — two packages under `apps/`:

```
zoven/
├── package.json                  # workspaces root, scripts only
├── tsconfig.base.json            # shared strict TS config
│
├── apps/
│   ├── sdk/                      # name: "behavior-sdk"
│   │   ├── package.json
│   │   ├── tsconfig.json         # extends ../../tsconfig.base.json
│   │   ├── tsup.config.ts        # ESM + IIFE (globalName: "BehaviorSDK")
│   │   ├── src/
│   │   │   ├── types.ts          # All shared interfaces — single source of truth
│   │   │   ├── utils.ts          # computeVariance (shared by detection rules)
│   │   │   ├── scanner.ts        # BehaviorScanner orchestrator class
│   │   │   ├── index.ts          # Public API: collect() + type re-exports
│   │   │   ├── signals/
│   │   │   │   ├── behavioral/   # Stateful collectors
│   │   │   │   │   ├── keystroke.ts
│   │   │   │   │   ├── mouse.ts
│   │   │   │   │   ├── paste.ts
│   │   │   │   │   └── scroll.ts
│   │   │   │   └── fingerprint/  # Stateless functions, called at flush time
│   │   │   │       ├── webdriver.ts
│   │   │   │       ├── iframe.ts
│   │   │   │       └── canvas.ts
│   │   │   └── detections/       # Pure functions: CollectedSignals → DetectionResult
│   │   │       ├── isHeadless.ts
│   │   │       ├── isScripted.ts
│   │   │       └── isLLMAgent.ts
│   │   └── dist/
│   │
│   └── demo/                     # name: "demo" (private)
│       ├── package.json          # deps: "behavior-sdk": "*"
│       ├── vite.config.ts        # alias 'behavior-sdk' → '../sdk/src/index.ts'
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── main.ts           # boot: scanner.attach + 250ms poll + submit handler
│           ├── ui.ts             # render: signal panel, detection cards, payload viewer
│           ├── scenarios.ts      # synthesizeHumanFlow / ScriptedBot / LLMAgent
│           └── styles.css
│
├── CLAUDE.md / context/ / specs/
└── README.md
```

## Pattern (inspired by fpscanner by Antoine Vastel)

- **One file per signal.** Each signal collector or fingerprint check is isolated and independently testable.
- **Two-phase evaluation.** `BehaviorScanner` runs Phase 1 (collect all signals) then Phase 2 (run all detection rules). Signals are inputs; detections are outputs.
- **Behavioral vs fingerprint split.** Behavioral collectors are stateful — they attach event listeners and accumulate data over the session. Fingerprint collectors are stateless — they read browser state once at flush time, then are cached on the scanner for subsequent calls.

## The Collector<T> interface

Behavioral collectors implement `{ getSignals(): T, detach(): void }`. The scanner stores them in `#collectors: BehavioralCollectors | null` and calls `detach()` after flushing.

Fingerprint collectors are plain functions — no interface, no lifecycle, called via `BehaviorScanner.#getFingerprint()` which caches the result on first successful call (cache skipped if `iframe.consistent === false`, e.g. `document.body` not yet available).

## Demo dev loop

The demo imports the SDK as a real package (`import { BehaviorScanner } from 'behavior-sdk'`). Vite's `resolve.alias` resolves that to `../sdk/src/index.ts` for both dev and production build. Workspace symlink in `node_modules/behavior-sdk` is the fallback resolution layer.

Editing any file in `apps/sdk/src/` triggers HMR in the running demo — no rebuild needed.

## 3-way actor taxonomy

| Actor type | Identified by |
|------------|--------------|
| `human` | Organic behavioral signals, clean fingerprint |
| `authorized_agent` | Valid HTTP Message Signature (RFC 9421) — handled by scoring API, not this SDK |
| `unauthorized_bot` | Detection rules fire: `isHeadless`, `isScripted`, or `isLLMAgent` |

The SDK's detection rules pre-classify the session before the payload reaches the scoring API. The API makes the final determination and enriches with the cross-customer graph.

## Signal categories and what they catch

| Category | Signals | Catches |
|----------|---------|---------|
| Behavioral | Keystroke dwell/flight, mouse curvature, paste ratio, scroll | Scripted bots, LLM agents |
| Fingerprint | `navigator.webdriver`, iframe consistency, canvas hash | Headless browsers, CDP-based automation |
| Network (server-side) | IP/ASN, JA4 TLS fingerprint | Proxied bots (not collected by SDK) |
| Agent-trust (server-side) | HTTP Message Signatures (RFC 9421) | Identifies authorized agents |

## Detection rules

Each rule in `apps/sdk/src/detections/` is a pure function `(signals: CollectedSignals) → DetectionResult`. Rules never mutate signals or share state.

- **`isHeadless`** — fires on `navigator.webdriver`, CDP markers, Playwright markers, iframe inconsistency.
- **`isScripted`** — fires when ≥ 2 of: no mouse movement, near-zero keystroke dwell variance, paste ratio > 90% with > 10 chars, near-zero flight variance.
- **`isLLMAgent`** — fires when ≥ 2 of: paste ratio > 80% with > 5 chars, no scroll with > 20 chars, < 8s completion with > 40 chars, uniform inter-keystroke flight timing.

## Paste collector semantics

`PasteSignals.pasteRatio = pastedChars / totalChars` (0.0 = all typed, 1.0 = all pasted). `charCount` includes both typed and pasted characters. This is the semantic the detection rules consume.

## Invariants

1. The SDK never blocks the page — `sendBeacon` for flush, all collection async.
2. `computeVariance` lives only in `apps/sdk/src/utils.ts` — not duplicated across detection files.
3. `apps/sdk/` never imports from future `services/` — open/closed boundary is enforced at the module level.
4. Every detection rule fires on ≥ 2 signals to reduce false positives.
5. `canvas.ts` uses an explicit `if (!ctx) return` — no non-null assertions.
6. Fingerprint signals are cached after first valid read; detach() resets the cache.
