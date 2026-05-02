# Progress Tracker

## Current phase

**SDK v0.6 — incognito detection and timezone/locale consistency.**

The SDK now collects 13 behavioral + 7 fingerprint + 3 network signals. Added: incognito mode detection (Chrome/Edge quota cap + Safari IndexedDB probe, prewarmed async pattern), and timezone vs locale region consistency check (IANA timezone prefix vs `navigator.language` country code region matching — flags when both sides are known and differ). Detection rules unchanged at 5. `FingerprintCard` in the demo updated with new pills and detail rows for both signals.

---

## Completed

### Foundations
- [x] Signal taxonomy (`apps/sdk/src/types.ts`)
- [x] `BehaviorScanner` orchestrator — two-phase evaluation (collect → detect)
- [x] Public `collect()` entry returning `{ stop, flush }` (SPA-friendly)
- [x] ESM + IIFE bundles (`window.BehaviorSDK` global)
- [x] `computeVariance` in `apps/sdk/src/utils.ts`
- [x] tsup + tsc build pipeline, zero errors
- [x] npm-workspaces monorepo (`apps/sdk/` + `apps/web/`)

### Behavioral collectors (13)
- [x] `keystroke.ts` — dwells + flights arrays
- [x] `mouse.ts` — path + curvature + **stillnessRatio** (fraction of consecutive samples with < 2px movement)
- [x] `touch.ts` — touchstart / touchend / touchmove counts
- [x] `correction.ts` — Backspace + Delete, `correctionRatio`
- [x] `paste.ts` — `pasteRatio = pastedChars / totalChars`
- [x] `scroll.ts` — depths + timestamps
- [x] `input-type.ts` — `InputEvent.inputType` → typed / pasted / dropped / deleted / programmatic
- [x] `upload.ts` — picker vs drag-drop vs programmatic; **EXIF analysis** per picked file (AI-generated flag, software tag, missing metadata)
- [x] `visibility.ts` — hiddenCount, blurCount, totalHiddenMs (tab switching)
- [x] `click.ts` — centerOffsets (dx/dy from element bounding box center), targeted count
- [x] `session-rhythm.ts` — eventGaps, maxGapMs, burstCount, meanBurstGapMs, gapVariance
- [x] `field-timing.ts` — per-field dwell times, **instantFills** (fields filled in <100ms = LLM batch-fill)
- [x] `exif.ts` — zero-dependency JPEG/PDF/PNG metadata parser (utility used by upload.ts)

### Fingerprint collectors (7)
- [x] `webdriver.ts` — `navigator.webdriver`, CDP, Playwright markers
- [x] `iframe.ts` — parent vs iframe plugin count consistency
- [x] `canvas.ts` — canvas data URL hash
- [x] `webgl.ts` — GPU vendor + renderer (SwiftShader / LLVMpipe = headless)
- [x] `audio.ts` — OfflineAudioContext render hash, prewarmed on attach
- [x] `incognito.ts` — storage quota cap (Chrome/Edge) + IndexedDB probe (Safari), prewarmed on attach
- [x] `timezone.ts` — IANA timezone region vs `navigator.language` country region consistency

### Network collectors (3)
- [x] `reaction.ts` — focus → first input delay; `minInputDelay`; **`engagementDelayMs`** (attach → first focusin)
- [x] `connection.ts` — `navigator.connection` snapshot (effectiveType, rtt, downlink, saveData)
- [x] `timing.ts` — Navigation Timing: DNS / TCP / TLS / TTFB / domLoad

### Detection rules (5)
- [x] `isHeadless` — 6 signals (webdriver, CDP, Playwright, iframe, WebGL SwiftShader/LLVMpipe, audio)
- [x] `isScripted` — 8 signals (no-pointer mobile-aware, curvature variance, dwell var, flight var, paste ratio, zero corrections, reaction < 50ms, programmatic input > 5)
- [x] `isLLMAgent` — 8 signals (paste ratio, no-scroll-with-input, fast completion, machine-speed burst, uniform flight variance, mouse stillness > 70%, click precision < 3px offset, burst-pause-burst session rhythm, **instant field fills ≥ 2**)
- [x] `isUploadAutomation` — programmatic file attachment + **AI-generated document flag** (EXIF Software match) + JPEG with no EXIF block
- [x] `isMultimodalBot` — 4 cross-signal incoherence checks (natural mouse + precise clicks, typing + zero corrections + zero scroll, keyboard with no pointer, organic rhythm + instant field fills)

### Web demo (`apps/web`)
- [x] Next.js + Tailwind v4 + lucide-react
- [x] `VerdictCard` — hero verdict: Human / Scripted Bot / LLM Agent / Headless / Multi-signal
- [x] `SignalsCard` — live behavioral readout (keystroke, pointer, paste, corrections, input origin, file upload)
- [x] `DetectionsCard` — all 4 rules with severity badges + red-pulse animation on first fire
- [x] `FingerprintCard` — WebGL renderer, audio hash, headless pills
- [x] `NetworkCard` — reaction time, connection class, navigation timing breakdown
- [x] `PayloadViewer` — collapsible JSON + copy-to-clipboard
- [x] `ScenariosPanel` — 4 synthetic scenarios
- [x] Scenarios: Human (organic mouse, variable timing, Backspace corrections), Scripted Bot (uniform 50ms, no mouse), LLM Agent (paste chunks, brief mouse, no scroll), Stealth Bot (programmatic input + programmatic file attach)
- [x] `npm run web` — Next.js dev (HMR for web; SDK changes need rebuild or path alias in tsconfig)
- [x] Vercel: `build:vercel` builds `@devanshhq/nyasa` then `web`

---

## Open questions

| Question | Why it matters | Who resolves |
|----------|---------------|-------------|
| Which surface is the SDK running on first? (onboarding, login, KYB, money movement?) | Determines which signal thresholds need tuning first | Founder |
| What is the scoring API endpoint + auth scheme? | Needed to test full flush → score → response round-trip | Engineering |
| Should detection thresholds be configurable per customer? | Currently hardcoded — fine for prototype, changes for production | Founder |

---

## Next up

Remaining low-priority items from `specs/02-future-roadmap.md` (all WAIT/SKIP from research evaluation):

1. **CSS pointer type** — `fingerprint/pointerType.ts` (20 min) — UA vs pointer-media-query consistency check.
2. **Idle gap analysis** — computed from existing scroll + keystroke timestamps (~30 min, no new collector).
3. **Media device count** — `fingerprint/mediaDevices.ts` (~30 min) — 0 cameras + 0 mics on a claimed desktop = headless signal.
4. **Native API integrity** — `fingerprint/nativeIntegrity.ts` (1 hour) — WAIT; catches unsophisticated bots only, Camoufox/Patchright immune.
5. **Fingerprint consistency cross-check** — `detections/isFingerprintInconsistent.ts` (tier 2) — combines pointer type, media devices, webgl, canvas to detect spoofing.

Demo: update scenarios to exercise `isMultimodalBot` and per-field timing signals in the synthetic runs.
