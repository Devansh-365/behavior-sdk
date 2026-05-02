// ---------------------------------------------------------------------------
// Signal shapes — one interface per collector, matching runtime return values
// ---------------------------------------------------------------------------

export interface KeystrokeSignals {
  dwells: number[]    // ms each key was held
  flights: number[]   // ms between keyup and next keydown
}

export interface MouseSignals {
  pathLength: number      // total points recorded (capped, see mouse.ts)
  curvature: number[]     // angular deltas along path (radians)
  stillnessRatio: number  // fraction of consecutive samples with < 2px movement (0 = always moving, 1 = fully still)
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
// Network signal shapes
// (Network is a third signal pillar alongside behavioral and fingerprint:
//  it covers reaction-time behavior, the browser-reported connection class,
//  and the navigation-timing breakdown captured at page load.)
// ---------------------------------------------------------------------------

export interface ReactionSignals {
  firstInputDelay: number | null    // ms from first focus → first input; null if no input yet
  minInputDelay: number | null      // smallest focus→input delay observed; null if none
  engagementDelayMs: number | null  // ms from attach() → first focusin; null if user never focused
}

export interface ConnectionSignals {
  effectiveType: string | null  // "4g" | "3g" | "2g" | "slow-2g" | null if unsupported
  rtt: number | null            // browser-reported round-trip time in ms
  downlink: number | null       // estimated downlink bandwidth in Mbps
  saveData: boolean | null      // true if user has data-saver enabled
  supported: boolean            // false on Firefox / Safari (API not implemented)
}

export interface TimingSignals {
  dnsMs: number | null    // domainLookupEnd - domainLookupStart
  tcpMs: number | null    // connectEnd - connectStart
  tlsMs: number | null    // connectEnd - secureConnectionStart (null if not HTTPS)
  ttfbMs: number | null   // responseStart - requestStart
  domLoadMs: number | null // domContentLoadedEventEnd - domContentLoadedEventStart
  supported: boolean
}

// ---------------------------------------------------------------------------
// Composite containers
// ---------------------------------------------------------------------------

export interface InputTypeSignals {
  typed: number        // insertText / insertReplacementText
  pasted: number       // insertFromPaste
  dropped: number      // insertFromDrop
  deleted: number      // deleteContent*
  programmatic: number // input event with empty/unknown inputType
}

export interface FieldTimingSignals {
  fieldDwells: Record<string, number[]>  // field name/id → ms spent focused per visit
  instantFills: number                    // visits where field got content in <100ms
  totalFields: number                     // distinct fields visited
}

export interface ExifSignals {
  fileType: 'jpeg' | 'pdf' | 'png' | 'unknown'
  hasExif: boolean           // JPEG only: false = no EXIF block (suspicious for claimed photo)
  software: string | null    // EXIF Software tag or PDF /Producer value
  aiGenerated: boolean       // software matched a known AI generator pattern
  metadataEmpty: boolean     // no readable metadata found at all
}

export interface UploadSignals {
  pickerCount: number         // change events on file inputs
  dragDropCount: number       // drop events with files
  programmaticCount: number   // file count grew without picker or drop event
  filesAttached: number       // total files currently in form file inputs
  exifResults: ExifSignals[]  // metadata analysis for each file attached via picker
}

export interface SessionRhythmSignals {
  eventGaps: number[]      // ms between any consecutive events (key, mouse, scroll, click, focus)
  maxGapMs: number         // largest dead period — direct inference-pause proxy
  burstCount: number       // distinct activity bursts separated by >800ms gaps
  meanBurstGapMs: number   // mean silence between bursts (≈ LLM inference time)
  gapVariance: number      // variance of inter-burst gaps: low = regular LLM rhythm, high = human irregular
}

export interface ClickSignals {
  count: number
  centerOffsets: Array<[number, number]>  // [dx, dy] px from clicked element's bounding box center
  targeted: number                         // clicks on interactive elements (input, button, select, a)
}

export interface VisibilitySignals {
  hiddenCount: number    // times document went to 'hidden' visibilityState
  blurCount: number      // window blur events
  totalHiddenMs: number  // cumulative ms the page was not visible
}

export interface BehavioralSignals {
  keystroke: KeystrokeSignals
  mouse: MouseSignals
  touch: TouchSignals
  correction: CorrectionSignals
  paste: PasteSignals
  scroll: ScrollSignals
  inputType: InputTypeSignals
  upload: UploadSignals
  visibility: VisibilitySignals
  click: ClickSignals
  sessionRhythm: SessionRhythmSignals
  fieldTiming: FieldTimingSignals
}

export interface IncognitoSignals {
  isIncognito: boolean | null  // null = could not determine
  method: string | null        // 'quota' | 'indexeddb' | null
}

export interface DevicePersistenceSignals {
  deviceId: string   // stable UUID per browser profile (localStorage)
  isNew: boolean     // true = first visit, no prior UUID found
}

export interface TimezoneSignals {
  timezone: string       // IANA timezone name (e.g. "America/New_York")
  timezoneOffset: number // minutes west of UTC (Date.getTimezoneOffset())
  language: string       // navigator.language
  languages: string[]    // navigator.languages
  consistent: boolean    // false = timezone region contradicts language country
}

export interface FingerprintSignals {
  webdriver: WebdriverSignals
  iframe: IframeSignals
  canvas: CanvasSignals
  webgl: WebGLSignals
  audio: AudioSignals
  incognito: IncognitoSignals
  timezone: TimezoneSignals
  device: DevicePersistenceSignals
}

export interface NetworkSignals {
  reaction: ReactionSignals
  connection: ConnectionSignals
  timing: TimingSignals
}

export interface CollectedSignals {
  behavioral: BehavioralSignals
  fingerprint: FingerprintSignals
  network: NetworkSignals
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
  isAuthorizedAgent: DetectionResult  // Cryptographic identity check Wedge
  isUploadAutomation: DetectionResult
  isMultimodalBot: DetectionResult
}

// ---------------------------------------------------------------------------
// Verdict kinds (Ternary Model for 2026 Strategy)
// ---------------------------------------------------------------------------

export type VerdictKind =
  | 'Human'
  | 'AuthorizedAgent'  // Differentiator: validated cryptographic identity Wedge
  | 'UnauthorizedBot'  // Renamed from 'Bot' to follow new taxonomy
  | 'Analyzing'        // Temporary state if needed

export interface Verdict {
  kind: VerdictKind
  confidence: number  // 0.0 - 1.0 based on severity/count of detections
  badges: string[]    // e.g. ["CDP-Markers", "LLM-Rhythm", "UnauthorizedBot"]
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
  verdict: Verdict     // Added: client-side derived classification
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
  /** Build payload, send Beacon, then detach. Idempotent. */
  flush: () => void
}
