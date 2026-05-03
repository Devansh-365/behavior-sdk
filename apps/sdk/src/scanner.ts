/**
 * BehaviorScanner — main orchestrator.
 *
 * Inspired by fpscanner's FingerprintScanner class (Antoine Vastel, MIT).
 * Two-phase evaluation:
 *   Phase 1 — Signal collection (behavioral + fingerprint + network)
 *   Phase 2 — Detection rules (analysis runs after collection is complete)
 *
 * Signals are organized into three pillars that match the file layout under
 * `signals/`: behavioral (event-driven, stateful), fingerprint (one-shot
 * environment reads), and network (timing + connection metadata; mixes
 * stateful and stateless collectors).
 */

import { attachKeystrokeCollector }   from './signals/behavioral/keystroke'
import { attachMouseCollector }       from './signals/behavioral/mouse'
import { attachTouchCollector }       from './signals/behavioral/touch'
import { attachCorrectionCollector }  from './signals/behavioral/correction'
import { attachPasteCollector }       from './signals/behavioral/paste'
import { attachScrollCollector }      from './signals/behavioral/scroll'
import { attachInputTypeCollector }    from './signals/behavioral/input-type'
import { attachUploadCollector }       from './signals/behavioral/upload'
import { attachVisibilityCollector }   from './signals/behavioral/visibility'
import { attachClickCollector }         from './signals/behavioral/click'
import { attachSessionRhythmCollector } from './signals/behavioral/session-rhythm'
import { attachFieldTimingCollector }   from './signals/behavioral/field-timing'

import { collectWebdriverSignal }    from './signals/fingerprint/webdriver'
import { collectIframeSignal }       from './signals/fingerprint/iframe'
import { collectCanvasSignal }       from './signals/fingerprint/canvas'
import { collectWebGLSignal }        from './signals/fingerprint/webgl'
import {
  collectAudioSignal,
  prewarmAudioFingerprint,
  resetAudioFingerprint,
} from './signals/fingerprint/audio'
import {
  collectIncognitoSignal,
  prewarmIncognitoDetection,
} from './signals/fingerprint/incognito'
import { collectTimezoneSignal }     from './signals/fingerprint/timezone'
import { collectDevicePersistenceSignal } from './signals/fingerprint/device-persistence'

import { attachReactionCollector }   from './signals/network/reaction'
import { collectConnectionSignal }   from './signals/network/connection'
import { collectTimingSignal }       from './signals/network/timing'

import { detectHeadless }            from './detections/isHeadless'
import { detectScripted }            from './detections/isScripted'
import { detectLLMAgent }            from './detections/isLLMAgent'
import { detectAuthorizedAgent }      from './detections/isAuthorizedAgent'
import { detectUploadAutomation }    from './detections/isUploadAutomation'
import { detectMultimodalBot }       from './detections/isMultimodalBot'
import { deriveVerdict }             from './scoring'
import { extractFeatures }           from './features'

import type {
  Collector,
  KeystrokeSignals,
  MouseSignals,
  TouchSignals,
  CorrectionSignals,
  PasteSignals,
  ScrollSignals,
  InputTypeSignals,
  UploadSignals,
  VisibilitySignals,
  ClickSignals,
  SessionRhythmSignals,
  FieldTimingSignals,
  ReactionSignals,
  CollectedSignals,
  FingerprintSignals,
  Detections,
  BehaviorPayload,
} from './types'

/**
 * Stateful collectors — anything that attaches event listeners and accumulates
 * data over the session. Most live in behavioral/, but reaction is in network/.
 * The category is structural (where the file lives), the type below is about
 * the lifecycle pattern.
 */
type AttachedCollectors = {
  // behavioral
  keystroke: Collector<KeystrokeSignals>
  mouse: Collector<MouseSignals>
  touch: Collector<TouchSignals>
  correction: Collector<CorrectionSignals>
  paste: Collector<PasteSignals>
  scroll: Collector<ScrollSignals>
  inputType: Collector<InputTypeSignals>
  upload: Collector<UploadSignals>
  visibility: Collector<VisibilitySignals>
  click: Collector<ClickSignals>
  sessionRhythm: Collector<SessionRhythmSignals>
  fieldTiming: Collector<FieldTimingSignals>
  // network
  reaction: Collector<ReactionSignals>
}

export class BehaviorScanner {
  #startedAt: number = 0
  #collectors: AttachedCollectors | null = null
  #fingerprintCache: FingerprintSignals | null = null

  /**
   * Attach all stateful signal collectors to the target form element.
   * Call as early as possible — signals only accumulate while attached.
   */
  attach(formEl: HTMLElement): this {
    this.#startedAt = performance.now()
    this.#collectors = {
      keystroke:  attachKeystrokeCollector(formEl),
      mouse:      attachMouseCollector(document),
      touch:      attachTouchCollector(document),
      correction: attachCorrectionCollector(formEl),
      paste:      attachPasteCollector(formEl),
      scroll:     attachScrollCollector(),
      inputType:  attachInputTypeCollector(formEl),
      upload:     attachUploadCollector(formEl),
      visibility:    attachVisibilityCollector(),
      click:         attachClickCollector(document),
      sessionRhythm: attachSessionRhythmCollector(),
      fieldTiming:   attachFieldTimingCollector(formEl),
      reaction:      attachReactionCollector(formEl, this.#startedAt),
    }
    // Kick off async fingerprints so they're ready by the time buildPayload() is called.
    prewarmAudioFingerprint()
    prewarmIncognitoDetection()
    return this
  }

  /**
   * Collect all signals and run detection rules.
   * Safe to call repeatedly — collectors stay attached until detach().
   * Derives a client-side verdict for immediate feedback.
   */
  buildPayload(sessionId: string): BehaviorPayload {
    if (!this.#collectors) throw new Error('[nyasa] call attach() before buildPayload()')
    const signals = this.#collectSignals()
    const detections = this.#runDetections(signals)
    const verdict = deriveVerdict(detections)
    return { sessionId, collectedAt: new Date().toISOString(), signals, detections, verdict }
  }

  /** Remove all event listeners. Call after flush to avoid memory leaks. */
  detach(): void {
    if (!this.#collectors) return
    this.#collectors.keystroke.detach()
    this.#collectors.mouse.detach()
    this.#collectors.touch.detach()
    this.#collectors.correction.detach()
    this.#collectors.paste.detach()
    this.#collectors.scroll.detach()
    this.#collectors.inputType.detach()
    this.#collectors.upload.detach()
    this.#collectors.visibility.detach()
    this.#collectors.click.detach()
    this.#collectors.sessionRhythm.detach()
    this.#collectors.fieldTiming.detach()
    this.#collectors.reaction.detach()
    this.#collectors = null
    this.#fingerprintCache = null
    resetAudioFingerprint()
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  #collectSignals(): CollectedSignals {
    const c = this.#collectors!  // guarded by buildPayload() check above
    return {
      behavioral: {
        keystroke:  c.keystroke.getSignals(),
        mouse:      c.mouse.getSignals(),
        touch:      c.touch.getSignals(),
        correction: c.correction.getSignals(),
        paste:      c.paste.getSignals(),
        scroll:     c.scroll.getSignals(),
        inputType:  c.inputType.getSignals(),
        upload:     c.upload.getSignals(),
        visibility:    c.visibility.getSignals(),
        click:         c.click.getSignals(),
        sessionRhythm: c.sessionRhythm.getSignals(),
        fieldTiming:   c.fieldTiming.getSignals(),
      },
      fingerprint: this.#getFingerprint(),
      network: {
        reaction:   c.reaction.getSignals(),
        connection: collectConnectionSignal(),
        timing:     collectTimingSignal(),
      },
    }
  }

  /**
   * Fingerprint signals are deterministic per session — compute once, then reuse.
   * Skip caching if iframe collection failed (e.g. document.body not yet available)
   * OR if audio hasn't finished yet; the next call will retry and self-heal.
   */
  #getFingerprint(): FingerprintSignals {
    if (this.#fingerprintCache) return this.#fingerprintCache
    const fingerprint: FingerprintSignals = {
      webdriver:  collectWebdriverSignal(),
      iframe:     collectIframeSignal(),
      canvas:     collectCanvasSignal(),
      webgl:      collectWebGLSignal(),
      audio:      collectAudioSignal(),
      incognito:  collectIncognitoSignal(),
      timezone:   collectTimezoneSignal(),
      device:     collectDevicePersistenceSignal(),
    }
    const ready = fingerprint.iframe.consistent && fingerprint.audio.supported
    if (ready) this.#fingerprintCache = fingerprint
    return fingerprint
  }

  #runDetections(signals: CollectedSignals): Detections {
    const sessionMeta = { elapsedMs: performance.now() - this.#startedAt }
    const features = extractFeatures(signals)
    // isScripted and isLLMAgent run first so isMultimodalBot can compose their near-miss results.
    const isScripted = detectScripted(signals, features)
    const isLLMAgent = detectLLMAgent(signals, sessionMeta, features)
    return {
      isHeadless:         detectHeadless(signals),
      isScripted,
      isLLMAgent,
      isAuthorizedAgent:  detectAuthorizedAgent(signals),
      isUploadAutomation: detectUploadAutomation(signals),
      isMultimodalBot:    detectMultimodalBot(signals, features, isScripted, isLLMAgent),
    }
  }
}

