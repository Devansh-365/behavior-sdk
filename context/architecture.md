# Architecture

## Monorepo layout

npm workspaces — `@devanshhq/nyasa` SDK under `apps/sdk/` and Next.js site under `apps/web/`:

```
zoven/
├── package.json                  # workspaces root, scripts only
├── tsconfig.base.json            # shared strict TS config
│
├── apps/
│   ├── sdk/                      # name: "@devanshhq/nyasa"
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts        # ESM + IIFE (globalName: "BehaviorSDK")
│   │   └── src/
│   │       ├── types.ts          # All shared interfaces — single source of truth
│   │       ├── utils.ts          # computeVariance (shared by detection rules)
│   │       ├── scanner.ts        # BehaviorScanner orchestrator class
│   │       ├── index.ts          # Public API: collect() + type re-exports
│   │       ├── signals/
│   │       │   ├── behavioral/   # Stateful collectors — attach event listeners
│   │       │   │   ├── keystroke.ts    # dwells + flights arrays
│   │       │   │   ├── mouse.ts        # path + curvature, ring-buffered
│   │       │   │   ├── touch.ts        # touchstart / touchend / touchmove
│   │       │   │   ├── correction.ts   # Backspace + Delete, correctionRatio
│   │       │   │   ├── paste.ts        # pasteRatio = pastedChars / totalChars
│   │       │   │   ├── scroll.ts       # depths + timestamps
│   │       │   │   ├── input-type.ts   # InputEvent.inputType classification
│   │       │   │   └── upload.ts       # picker vs drag-drop vs programmatic file attach
│   │       │   ├── fingerprint/  # Stateless functions, called once at flush time
│   │       │   │   ├── webdriver.ts    # navigator.webdriver, CDP, Playwright markers
│   │       │   │   ├── iframe.ts       # parent vs iframe plugin count consistency
│   │       │   │   ├── canvas.ts       # canvas data URL hash
│   │       │   │   ├── webgl.ts        # GPU vendor + renderer (SwiftShader/LLVMpipe catch)
│   │       │   │   └── audio.ts        # OfflineAudioContext render hash, prewarmed
│   │       │   └── network/      # Mix of stateful collectors and one-shot reads
│   │       │       ├── reaction.ts     # focus → first input delay (stateful)
│   │       │       ├── connection.ts   # navigator.connection snapshot (one-shot)
│   │       │       └── timing.ts       # Navigation Timing: DNS/TCP/TLS/TTFB (one-shot)
│   │       └── detections/       # Pure functions: CollectedSignals → DetectionResult
│   │           ├── isHeadless.ts
│   │           ├── isScripted.ts
│   │           ├── isLLMAgent.ts
│   │           └── isUploadAutomation.ts
│   │
│   └── web/                      # Next.js (private); deps: "@devanshhq/nyasa": "*"
│       └── app/ demo/ docs/ components/ lib/ content/docs/ …
│
├── CLAUDE.md / context/ / specs/
└── README.md
```

## Pattern (inspired by fpscanner by Antoine Vastel)

- **One file per signal.** Each collector or fingerprint check is isolated and independently testable.
- **Two-phase evaluation.** `BehaviorScanner` runs Phase 1 (collect all signals) then Phase 2 (run all detection rules). Signals are inputs; detections are outputs.
- **Three signal pillars.** `behavioral` (stateful, event-driven), `fingerprint` (stateless, environment reads at flush), `network` (mix: reaction is stateful, connection/timing are one-shot).

## The Collector<T> interface

Behavioral collectors implement `{ getSignals(): T, detach(): void }`. The scanner stores them in `#collectors` and calls `detach()` after flushing.

Fingerprint and one-shot network collectors are plain functions — no lifecycle. `BehaviorScanner.#getFingerprint()` caches the fingerprint result after the first successful read (cache skipped if `iframe.consistent === false`, e.g. `document.body` not yet available).

## Web demo (`apps/web`)

The live demo (`/demo`) is a Next.js client route. It depends on the workspace package **`@devanshhq/nyasa`**. For local dev, `apps/web/tsconfig` can map `@devanshhq/nyasa` to `../sdk/src/index.ts` for instant typecheck; production/Vercel builds run `tsup` first so imports resolve to `apps/sdk/dist/`.

## 3-way actor taxonomy

| Actor type | Identified by |
|------------|--------------|
| `human` | Organic behavioral signals, clean fingerprint |
| `authorized_agent` | Valid HTTP Message Signature (RFC 9421) — handled by scoring API, not this SDK |
| `unauthorized_bot` | Detection rules fire: `isHeadless`, `isScripted`, `isLLMAgent`, or `isUploadAutomation` |

The SDK's detection rules pre-classify the session. The scoring API makes the final call and enriches with the cross-customer graph.

## Signal categories

| Category | Collector count | Catches |
|----------|----------------|---------|
| Behavioral | 8 | Scripted bots, LLM agents, upload automation |
| Fingerprint | 5 | Headless browsers, CDP-based automation, spoofed environments |
| Network | 3 | Sub-human reaction times, datacenter connection signatures |

## Detection rules

Each rule in `apps/sdk/src/detections/` is a pure function `(signals: CollectedSignals, [meta]) → DetectionResult`. Rules never mutate signals or share state. All fire on ≥ 2 signals.

- **`isHeadless`** — `navigator.webdriver`, CDP markers, Playwright markers, iframe plugin inconsistency, WebGL SwiftShader/LLVMpipe renderer, audio fingerprint hash matching headless profile.
- **`isScripted`** — ≥ 2 of: no pointer/touch activity (mobile-aware), mouse curvature variance < 0.05, dwell variance < 2ms, flight variance < 5ms, paste ratio > 90% with > 10 chars, zero corrections over 50+ chars, reaction time < 50ms, programmatic input events > 5 with no typed/pasted/dropped origin.
- **`isLLMAgent`** — ≥ 2 of: paste ratio > 80% with > 5 chars, no scroll with > 20 chars input, < 8s completion with > 40 chars, machine-speed keystroke burst (≥ 3 consecutive flights < 20ms), uniform flight timing across > 10 samples (variance < 10).
- **`isUploadAutomation`** — files attached with `programmaticCount > 0` and zero picker or drag-drop events.

## Paste collector semantics

`PasteSignals.pasteRatio = pastedChars / totalChars` (0.0 = all typed, 1.0 = all pasted). `charCount` includes both typed and pasted characters.

## Invariants

1. The SDK never blocks the page — `sendBeacon` for flush, all collection async.
2. `computeVariance` lives only in `apps/sdk/src/utils.ts` — not duplicated across detection files.
3. `apps/sdk/` never imports from future `services/` — open/closed boundary enforced at the module level.
4. Every detection rule fires on ≥ 2 signals to reduce false positives.
5. Fingerprint collectors always return a valid fallback shape in their `catch` block — never throw, never return `null`.
6. Fingerprint signals are cached after first valid read; `detach()` resets the cache.
