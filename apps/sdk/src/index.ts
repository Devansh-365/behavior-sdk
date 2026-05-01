/**
 * Behavior Analysis SDK — public entry point.
 *
 * Embeds into any web form with one call. Attaches signal collectors,
 * auto-flushes on submit or tab close, and sends the scored payload to
 * the scoring API via sendBeacon (non-blocking, survives page unload).
 *
 * ESM usage (bundler):
 *   import { collect } from 'behavior-sdk'
 *   const handle = collect('#signup-form', { endpoint: '/score', sessionId: crypto.randomUUID() })
 *   // SPA shutdown: handle.flush()  (manual send + detach)
 *   // Or just: handle.stop()        (detach without sending)
 *
 * IIFE usage (script tag):
 *   <script src="behavior-sdk.iife.js"></script>
 *   <script>BehaviorSDK.collect('#signup-form', { endpoint: '/score', sessionId: '...' })</script>
 */

import { BehaviorScanner } from './scanner'
import type { CollectOptions, CollectHandle } from './types'

export function collect(
  selectorOrEl: string | HTMLElement,
  options: CollectOptions
): CollectHandle {
  const formEl: HTMLElement | null =
    typeof selectorOrEl === 'string'
      ? document.querySelector<HTMLElement>(selectorOrEl)
      : selectorOrEl

  if (!formEl) throw new Error(`[behavior-sdk] element not found: ${String(selectorOrEl)}`)

  const scanner = new BehaviorScanner()
  scanner.attach(formEl)

  let flushed = false

  function flush(): void {
    if (flushed) return
    flushed = true
    const payload = scanner.buildPayload(options.sessionId)
    navigator.sendBeacon(options.endpoint, JSON.stringify(payload))
    scanner.detach()
  }

  function stop(): void {
    if (flushed) return
    flushed = true
    scanner.detach()
  }

  const form = formEl.closest('form') ?? formEl
  form.addEventListener('submit', flush, { once: true })

  document.addEventListener(
    'visibilitychange',
    () => { if (document.visibilityState === 'hidden') flush() },
    { once: true }
  )

  return { stop, flush }
}

export { BehaviorScanner }

// Named type exports for TypeScript consumers
export type {
  BehaviorPayload,
  CollectedSignals,
  BehavioralSignals,
  FingerprintSignals,
  DetectionResult,
  Detections,
  CollectOptions,
  CollectHandle,
} from './types'
