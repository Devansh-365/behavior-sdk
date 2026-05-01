# Progress Tracker

## Current phase

**SDK v0.2 — expanded signal coverage. Demo rebuilt as React + Tailwind app with verdict UI.**

The SDK now collects 6 behavioral + 5 fingerprint signals, and detection rules use mobile-aware pointer checks, mouse curvature variance, correction ratio, and WebGL software-renderer detection. The demo is a Vite + React app with a hero verdict card that classifies the session as Human / Scripted Bot / LLM Agent / Headless Browser at a glance.

## Completed

### Foundations
- [x] Signal taxonomy (`apps/sdk/src/types.ts`)
- [x] `BehaviorScanner` orchestrator with two-phase evaluation
- [x] Public `collect()` entry returning `{ stop, flush }` (SPA-friendly)
- [x] ESM + IIFE bundles (`window.BehaviorSDK` global)
- [x] `computeVariance` deduplicated into `apps/sdk/src/utils.ts`
- [x] tsup + tsc build pipeline, zero errors
- [x] npm-workspaces monorepo (`apps/sdk/` + `apps/demo/`)

### Behavioral collectors (6)
- [x] `keystroke.ts` — dwells + flights
- [x] `mouse.ts` — path + curvature, **bounded to 1000 points + 20 samples/sec**
- [x] `touch.ts` — touchstart / touchend / touchmove counts
- [x] `correction.ts` — Backspace + Delete tracking, computes `correctionRatio`
- [x] `paste.ts` — `pasteRatio = pastedChars / totalChars` (fixed semantics)
- [x] `scroll.ts` — depths + timestamps

### Fingerprint collectors (5)
- [x] `webdriver.ts` — `navigator.webdriver`, CDP, Playwright markers
- [x] `iframe.ts` — parent vs iframe plugin count consistency
- [x] `canvas.ts` — canvas data URL hash
- [x] `webgl.ts` — GPU vendor + renderer (catches SwiftShader / LLVMpipe)
- [x] `audio.ts` — OfflineAudioContext render hash (async, prewarmed on attach)

### Detection rules
- [x] `isHeadless` — 6 signals (added SwiftShader + LLVMpipe checks)
- [x] `isScripted` — 6 signals (mobile-aware no-pointer, mouse curvature variance, correction ratio)
- [x] `isLLMAgent` — 4 signals (paste ratio, no-scroll-with-input, fast completion, uniform flights)

### Demo app
- [x] React 18 + Tailwind v4 + lucide-react
- [x] **Verdict hero card** — color-coded, large, classifies as Human / Scripted Bot / LLM Agent / Headless / Multi-signal Bot with confidence score 0–100
- [x] Live signals panel (4 sections: Keystroke, Pointer, Paste, Corrections/Scroll)
- [x] Detection cards with severity badges + red-pulse animation on first fire
- [x] Fingerprint card with WebGL renderer / audio hash / pills for SwiftShader & LLVMpipe
- [x] Collapsible payload viewer with copy-to-clipboard
- [x] Synthetic scenarios — Human (with realistic Backspace corrections) / Scripted Bot / LLM Agent
- [x] Vite alias `behavior-sdk` → `../sdk/src/index.ts` for HMR
- [x] Production build smoke test — `npm run demo:build` produces deployable static bundle

## Future direction — network signals

A new third signal category ("network") is feasible in the browser sandbox via:

- **`navigator.connection`** (Chrome/Edge only) — `effectiveType`, `rtt`, `downlink`, `saveData`. Useful for datacenter signature detection.
- **Resource Timing / Navigation Timing API** — DNS, TCP, TLS handshake durations. Cross-origin requires `Timing-Allow-Origin` header.
- **Reaction time** (focus → first input delay). The strongest single signal here — sub-50ms is essentially impossible for a human.

Server-side complement: client reports `navigator.connection.rtt`; scoring API compares against the actual measured TCP RTT. Mismatch reveals a lying client (e.g. proxy spoofing residential connection).

Sequencing: `reaction.ts` first (highest ROI, no browser-support gaps), then `connection.ts` (raw capture, no detection rule yet — defer to model training). Live as `apps/sdk/src/signals/network/` if/when the third category is added.

## Open questions

| Question | Why it matters | Who resolves |
|----------|---------------|-------------|
| Which surface is the system running on today? (onboarding, login, money movement?) | Determines which signal categories need tuning first | Founder |
| What is the scoring API's endpoint and auth scheme? | Needed to test the full flush → score → response round-trip | Engineering |
| Should detection thresholds be configurable per customer? | Currently hardcoded — fine for take-home, would need to change for production | Founder |
| Is agent-trust verification (`agent-trust` package) in scope for this phase? | Currently the SDK has no HTTP Message Signature verification | Founder |

## Next up

**Unit 04 — Integration test harness.** Connect the SDK to a local scoring API stub and verify the full payload shape end-to-end for each actor type. The synthetic scenarios in `apps/demo/src/scenarios.ts` can be reused as test fixtures.

See `specs/00-build-plan.md` Unit 04 for the test scenario list.
