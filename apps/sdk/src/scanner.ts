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

import { attachKeystrokeCollector }  from './signals/behavioral/keystroke'
import { attachMouseCollector }      from './signals/behavioral/mouse'
import { attachTouchCollector }      from './signals/behavioral/touch'
import { attachCorrectionCollector } from './signals/behavioral/correction'
import { attachPasteCollector }      from './signals/behavioral/paste'
import { attachScrollCollector }     from './signals/behavioral/scroll'

import { collectWebdriverSignal }    from './signals/fingerprint/webdriver'
import { collectIframeSignal }       from './signals/fingerprint/iframe'
import { collectCanvasSignal }       from './signals/fingerprint/canvas'
import { collectWebGLSignal }        from './signals/fingerprint/webgl'
import {
  collectAudioSignal,
  prewarmAudioFingerprint,
  resetAudioFingerprint,
} from './signals/fingerprint/audio'

import { attachReactionCollector }   from './signals/network/reaction'
import { collectConnectionSignal }   from './signals/network/connection'
import { collectTimingSignal }       from './signals/network/timing'

import { detectHeadless }            from './detections/isHeadless'
import { detectScripted }            from './detections/isScripted'
import { detectLLMAgent }            from './detections/isLLMAgent'

import type {
  Collector,
  KeystrokeSignals,
  MouseSignals,
  TouchSignals,
  CorrectionSignals,
  PasteSignals,
  ScrollSignals,
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
      reaction:   attachReactionCollector(formEl),
    }
    // Kick off async fingerprints so they're ready by the time buildPayload() is called.
    prewarmAudioFingerprint()
    return this
  }

  /**
   * Collect all signals and run detection rules.
   * Safe to call repeatedly — collectors stay attached until detach().
   */
  buildPayload(sessionId: string): BehaviorPayload {
    if (!this.#collectors) throw new Error('[behavior-sdk] call attach() before buildPayload()')
    const signals = this.#collectSignals()
    const detections = this.#runDetections(signals)
    return { sessionId, collectedAt: new Date().toISOString(), signals, detections }
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
      webdriver: collectWebdriverSignal(),
      iframe:    collectIframeSignal(),
      canvas:    collectCanvasSignal(),
      webgl:     collectWebGLSignal(),
      audio:     collectAudioSignal(),
    }
    const ready = fingerprint.iframe.consistent && fingerprint.audio.supported
    if (ready) this.#fingerprintCache = fingerprint
    return fingerprint
  }

  #runDetections(signals: CollectedSignals): Detections {
    const sessionMeta = { elapsedMs: performance.now() - this.#startedAt }
    return {
      isHeadless: detectHeadless(signals),
      isScripted: detectScripted(signals),
      isLLMAgent: detectLLMAgent(signals, sessionMeta),
    }
  }
}

