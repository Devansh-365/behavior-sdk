// ---------------------------------------------------------------------------
// Signal shapes — one interface per collector, matching runtime return values
// ---------------------------------------------------------------------------

export interface KeystrokeSignals {
  dwells: number[]    // ms each key was held
  flights: number[]   // ms between keyup and next keydown
}

export interface MouseSignals {
  pathLength: number  // total points recorded (capped, see mouse.ts)
  curvature: number[] // angular deltas along path (radians)
}

export interface TouchSignals {
  touchCount: number  // touchstart events (≈ finger-down count)
  taps: number        // touchend events (≈ tap count)
  pathLength: number  // touchmove events
}

export interface CorrectionSignals {
  backspaceCount: number   // # of Backspace keys pressed
  deleteCount: number      // # of Delete keys pressed
  correctionRatio: number  // (backspace + delete) / typedChars; 0 if no typing
}

export interface PasteSignals {
  pasteRatio: number  // pastedChars / totalChars (1.0 = all input came from pasting)
  pasteCount: number  // number of paste events
  charCount: number   // total characters in input (typed + pasted)
}

export interface ScrollSignals {
  depths: number[]      // scrollY positions visited (px)
  timestamps: number[]  // performance.now() at each scroll event
}

export interface WebdriverSignals {
  webdriver: boolean        // navigator.webdriver
  cdpPresent: boolean       // Chrome DevTools Protocol markers in window
  playwrightPresent: boolean
}

export interface IframeSignals {
  consistent: boolean       // plugin count same in parent + iframe
  parentPluginCount: number
  iframePluginCount: number
}

export interface CanvasSignals {
  hash: string       // last 20 chars of canvas data URL (stable per device)
  supported: boolean
}

export interface WebGLSignals {
  vendor: string     // GPU vendor (e.g. "Apple", "Google Inc.")
  renderer: string   // GPU renderer (e.g. "Apple M1", "SwiftShader" on headless)
  supported: boolean
}

export interface AudioSignals {
  hash: string       // hash of an OfflineAudioContext render (stable per device)
  supported: boolean
}

// ---------------------------------------------------------------------------
// Composite containers
// ---------------------------------------------------------------------------

export interface BehavioralSignals {
  keystroke: KeystrokeSignals
  mouse: MouseSignals
  touch: TouchSignals
  correction: CorrectionSignals
  paste: PasteSignals
  scroll: ScrollSignals
}

export interface FingerprintSignals {
  webdriver: WebdriverSignals
  iframe: IframeSignals
  canvas: CanvasSignals
  webgl: WebGLSignals
  audio: AudioSignals
}

export interface CollectedSignals {
  behavioral: BehavioralSignals
  fingerprint: FingerprintSignals
}

// ---------------------------------------------------------------------------
// Collector interface — the lifecycle contract for behavioral signal collectors.
// Fingerprint collectors are plain functions (no lifecycle), not Collector<T>.
// ---------------------------------------------------------------------------

export interface Collector<T> {
  getSignals(): T
  detach(): void
}

// ---------------------------------------------------------------------------
// Detection results
// ---------------------------------------------------------------------------

export type Severity = 'high' | 'medium' | 'low'

export interface DetectionResult {
  detected: boolean
  severity: Severity
  reasons: string[]
}

export interface Detections {
  isHeadless: DetectionResult
  isScripted: DetectionResult
  isLLMAgent: DetectionResult
}

// ---------------------------------------------------------------------------
// Session metadata passed to detection rules that need timing context
// ---------------------------------------------------------------------------

export interface SessionMeta {
  elapsedMs: number
}

// ---------------------------------------------------------------------------
// Final scored payload built by BehaviorScanner.buildPayload()
// ---------------------------------------------------------------------------

export interface BehaviorPayload {
  sessionId: string
  collectedAt: string  // ISO 8601
  signals: CollectedSignals
  detections: Detections
}

// ---------------------------------------------------------------------------
// Public API options
// ---------------------------------------------------------------------------

export interface CollectOptions {
  endpoint: string
  sessionId: string
}

/** Returned by collect(). flush() lets SPAs trigger a manual send (no <form> submit). */
export interface CollectHandle {
  /** Detach all listeners. Safe to call multiple times. */
  stop: () => void
  /** Build payload, send via sendBeacon, then detach. Idempotent. */
  flush: () => void
}
