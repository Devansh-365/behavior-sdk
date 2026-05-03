# Progress Tracker

## Current phase

**SDK v0.7+ — full behavioral + fingerprint + network stack with client verdict.**

The SDK collects **13 behavioral**, **8 fingerprint**, and **3 network** signals. **`BehaviorScanner.buildPayload()`** returns **`BehaviorPayload`**: raw **`signals`**, per-rule **`detections`**, and **`verdict`** from **`deriveVerdict()`** (noisy-OR over fired rules; **`AuthorizedAgent`** short-circuit when a valid-format signature is present). Demo (**`/demo`**) uses **`DemoTelemetryPanel`**, **`SignalsCard`**, **`FingerprintCard`**, **`NetworkCard`**, **`VerdictCard`**, **`DetectionsCard`**, and **`PayloadViewer`**.

---

## Completed

### Foundations

- [x] Signal taxonomy (`apps/sdk/src/types.ts`) — `BehavioralSignals`, `FingerprintSignals`, `NetworkSignals`, `BehaviorPayload`, `Verdict`
- [x] `BehaviorScanner` — collect → `extractFeatures` → detect → `deriveVerdict`
- [x] Public **`collect()`** — **`string | HTMLElement`** mount, **`{ stop, flush }`**; default flush on **nearest `<form>` submit** (if any) + **`visibilitychange` → hidden** (SPA / no-form flows use **`flush()`**)
- [x] ESM + IIFE (`window.BehaviorSDK`) via **tsup**
- [x] **`computeVariance`** in **`utils.ts`**; **`extractFeatures`** in **`features.ts`**
- [x] npm workspaces: **`apps/sdk`** + **`apps/web`**

### Behavioral collectors (13)

- [x] `keystroke.ts` — dwells, flights
- [x] `mouse.ts` — pathLength, curvature, **stillnessRatio**
- [x] `touch.ts` — touch counts, path length
- [x] `correction.ts` — backspace/delete, **correctionRatio**
- [x] `paste.ts` — **pasteRatio**, counts, charCount
- [x] `scroll.ts` — depths, timestamps
- [x] `input-type.ts` — typed / pasted / dropped / deleted / **programmatic**
- [x] `upload.ts` — picker vs drag-drop vs programmatic; **`exifResults`** per picked file
- [x] `exif.ts` — JPEG/PDF/PNG metadata helper for **`upload`**
- [x] `visibility.ts` — hidden/blur counts, **totalHiddenMs**
- [x] `click.ts` — **centerOffsets**, **targeted** (interactive hits)
- [x] `session-rhythm.ts` — gaps, bursts, **gapVariance**
- [x] `field-timing.ts` — per-field dwells, **instantFills** (<100ms)

### Fingerprint signals (8)

- [x] `webdriver.ts` — navigator.webdriver, CDP, Playwright markers
- [x] `iframe.ts` — parent vs iframe plugin consistency
- [x] `canvas.ts` — data URL hash
- [x] `webgl.ts` — vendor/renderer (SwiftShader / LLVMpipe cues)
- [x] `audio.ts` — OfflineAudioContext hash; **prewarm** on attach
- [x] `incognito.ts` — quota / IndexedDB-style probes; **prewarm** on attach
- [x] `timezone.ts` — IANA vs **navigator.language** region consistency
- [x] `device-persistence.ts` — **deviceId** (localStorage), **isNew**

### Network (3)

- [x] `reaction.ts` — firstInputDelay, minInputDelay, **engagementDelayMs**
- [x] `connection.ts` — **navigator.connection** snapshot
- [x] `timing.ts` — Navigation Timing breakdown

### Detection rules (6)

- [x] `isHeadless.ts` — automation / software-renderer / iframe cues (severity scales with reason count)
- [x] `isScripted.ts` — multi-signal scripted / bot typing patterns (uses **`ExtractedFeatures`**)
- [x] `isLLMAgent.ts` — paste, scroll, timing, rhythm, clicks, instant fills, etc. (**`SessionMeta`**, **`ExtractedFeatures`**)
- [x] `isAuthorizedAgent.ts` — **`__nyasaAgentSignature`** or **`meta[name=x-agent-signature]`** (format check only; **server validates** crypto)
- [x] `isUploadAutomation.ts` — programmatic files + EXIF cues
- [x] `isMultimodalBot.ts` — cross-signal inconsistency + **near-miss** on scripted+LLM (wired after the two rules above)

### Client scoring

- [x] `scoring.ts` — **`deriveVerdict`**, **`WEIGHTS`**, **`DETECTION_DISPLAY_LABELS`**

### Web demo (`apps/web`)

- [x] Next.js + Tailwind v4 + shared UI primitives
- [x] **`DemoApp`**, **`DemoForm`**, **`DemoTelemetryPanel`** (Behavior / Environment tabs)
- [x] **`VerdictCard`**, **`DetectionsCard`**, **`SignalsCard`**, **`FingerprintCard`**, **`NetworkCard`**, **`PayloadViewer`**, **`ScenariosPanel`**

---

## Open questions

| Question | Why it matters | Who resolves |
|----------|----------------|--------------|
| Which surface ships first? (signup, login, KYB, payments?) | Threshold tuning priority | Product |
| Scoring API URL, auth, and **payload schema version** | End-to-end testing and evolution | Engineering |
| Per-tenant configurable thresholds? | Today largely hardcoded in detectors | Product + eng |

---

## Next up (from roadmap / ideas)

See **`specs/02-future-roadmap.md`** or similar for prioritized ideas. Examples often discussed:

1. **CSS / pointer media** consistency fingerprint.
2. **Idle gap** analysis from existing timestamps.
3. **`mediaDevices` count** fingerprint.
4. **Test harness** (unit tests for **`extractFeatures`** + each **`detect*`** with fixtures).
5. **Registry-based** collector attachment to reduce **`scanner.ts`** churn.

Demo: extend scenarios to stress **`isMultimodalBot`** and rare paths as needed.
