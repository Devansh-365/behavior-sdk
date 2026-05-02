# Progress Tracker

## Current phase

**SDK v0.4 — expanded behavioral signal coverage with LLM-specific detection signals.**

The SDK now collects 12 behavioral + 5 fingerprint + 3 network signals. `isLLMAgent` fires on 7 signals (was 4). New: engagement delay, mouse stillness ratio, tab visibility, click precision, and session rhythm (burst-pause-burst inference pattern). Demo updated to surface all new signals in the live panel.

---

## Completed

### Foundations
- [x] Signal taxonomy (`apps/sdk/src/types.ts`)
- [x] `BehaviorScanner` orchestrator — two-phase evaluation (collect → detect)
- [x] Public `collect()` entry returning `{ stop, flush }` (SPA-friendly)
- [x] ESM + IIFE bundles (`window.BehaviorSDK` global)
- [x] `computeVariance` in `apps/sdk/src/utils.ts`
- [x] tsup + tsc build pipeline, zero errors
- [x] npm-workspaces monorepo (`apps/sdk/` + `apps/demo/`)

### Behavioral collectors (12)
- [x] `keystroke.ts` — dwells + flights arrays
- [x] `mouse.ts` — path + curvature + **stillnessRatio** (fraction of consecutive samples with < 2px movement)
- [x] `touch.ts` — touchstart / touchend / touchmove counts
- [x] `correction.ts` — Backspace + Delete, `correctionRatio`
- [x] `paste.ts` — `pasteRatio = pastedChars / totalChars`
- [x] `scroll.ts` — depths + timestamps
- [x] `input-type.ts` — `InputEvent.inputType` → typed / pasted / dropped / deleted / programmatic
- [x] `upload.ts` — picker vs drag-drop vs programmatic file attachment, 500ms poll
- [x] `visibility.ts` — hiddenCount, blurCount, totalHiddenMs (tab switching)
- [x] `click.ts` — centerOffsets (dx/dy from element bounding box center), targeted count
- [x] `session-rhythm.ts` — eventGaps, maxGapMs, burstCount, meanBurstGapMs, gapVariance

### Fingerprint collectors (5)
- [x] `webdriver.ts` — `navigator.webdriver`, CDP, Playwright markers
- [x] `iframe.ts` — parent vs iframe plugin count consistency
- [x] `canvas.ts` — canvas data URL hash
- [x] `webgl.ts` — GPU vendor + renderer (SwiftShader / LLVMpipe = headless)
- [x] `audio.ts` — OfflineAudioContext render hash, prewarmed on attach

### Network collectors (3)
- [x] `reaction.ts` — focus → first input delay; `minInputDelay`; **`engagementDelayMs`** (attach → first focusin)
- [x] `connection.ts` — `navigator.connection` snapshot (effectiveType, rtt, downlink, saveData)
- [x] `timing.ts` — Navigation Timing: DNS / TCP / TLS / TTFB / domLoad

### Detection rules (4)
- [x] `isHeadless` — 6 signals (webdriver, CDP, Playwright, iframe, WebGL SwiftShader/LLVMpipe, audio)
- [x] `isScripted` — 8 signals (no-pointer mobile-aware, curvature variance, dwell var, flight var, paste ratio, zero corrections, reaction < 50ms, programmatic input > 5)
- [x] `isLLMAgent` — 7 signals (paste ratio, no-scroll-with-input, fast completion, machine-speed burst, uniform flight variance, **mouse stillness > 70%**, **click precision < 3px offset**, **burst-pause-burst session rhythm**)
- [x] `isUploadAutomation` — programmatic file attachment with no picker or drag-drop

### Demo app
- [x] React 18 + Tailwind v4 + lucide-react
- [x] `VerdictCard` — hero verdict: Human / Scripted Bot / LLM Agent / Headless / Multi-signal
- [x] `SignalsCard` — live behavioral readout (keystroke, pointer, paste, corrections, input origin, file upload)
- [x] `DetectionsCard` — all 4 rules with severity badges + red-pulse animation on first fire
- [x] `FingerprintCard` — WebGL renderer, audio hash, headless pills
- [x] `NetworkCard` — reaction time, connection class, navigation timing breakdown
- [x] `PayloadViewer` — collapsible JSON + copy-to-clipboard
- [x] `ScenariosPanel` — 4 synthetic scenarios
- [x] Scenarios: Human (organic mouse, variable timing, Backspace corrections), Scripted Bot (uniform 50ms, no mouse), LLM Agent (paste chunks, brief mouse, no scroll), Stealth Bot (programmatic input + programmatic file attach)
- [x] Vite source alias (`npm run demo`) for HMR on SDK source changes
- [x] `USE_SDK_PACKAGE` mode (`npm run demo:package`) — builds SDK, resolves via real dist/

---

## Open questions

| Question | Why it matters | Who resolves |
|----------|---------------|-------------|
| Which surface is the SDK running on first? (onboarding, login, KYB, money movement?) | Determines which signal thresholds need tuning first | Founder |
| What is the scoring API endpoint + auth scheme? | Needed to test full flush → score → response round-trip | Engineering |
| Should detection thresholds be configurable per customer? | Currently hardcoded — fine for prototype, changes for production | Founder |

---

## Next up

All quick-win roadmap signals are now implemented. Remaining items from `specs/02-future-roadmap.md`:

1. **CSS pointer type** — `fingerprint/pointerType.ts` (20 min) — UA vs pointer-media-query consistency check.
2. **Idle gap analysis** — computed from existing scroll + keystroke timestamps (~30 min, no new collector).
3. **Media device count** — `fingerprint/mediaDevices.ts` (~30 min) — 0 cameras + 0 mics on a claimed desktop = headless signal.
4. **Native API integrity** — `fingerprint/nativeIntegrity.ts` (1 hour) — detect Playwright stealth patching via toString !== `[native code]`.
5. **Fingerprint consistency cross-check** — `detections/isFingerprintInconsistent.ts` (tier 2) — combines pointer type, media devices, webgl, canvas to detect spoofing.

Demo: update scenarios to demonstrate visibility, click precision, and session rhythm signals in the synthetic runs.
