/**
 * Behavior Analysis SDK — public entry point.
 *
 * Embeds into a **customer page** with one call. Pass a **CSS selector or HTMLElement**
 * as the **mount** (commonly a `<form>` or any container wrapping inputs — modals,
 * wizard steps, chat UIs). The scanner attaches subtree-oriented collectors to that
 * mount and page-wide collectors (e.g. pointer on `document`) where needed.
 *
 * Auto-flush: **submit** on `mount.closest('form') ?? mount`, plus **tab hidden**
 * (`visibilitychange`). If there is no `<form>` ancestor, **submit will not fire** —
 * call **`handle.flush()`** from your app (SPA navigation, wizard Next, etc.).
 * Payload is sent via **sendBeacon** (non-blocking, survives page unload).
 *
 * ESM usage (bundler):
 *   import { collect } from '@devanshhq/nyasa'
 *   const handle = collect('#signup', { endpoint: '/score', sessionId: crypto.randomUUID() })
 *   // SPA shutdown: handle.flush()  (manual send + detach)
 *   // Or just: handle.stop()        (detach without sending)
 *
 * IIFE usage (script tag):
 *   <script src="index.global.js"></script>
 *   <script>BehaviorSDK.collect('#signup', { endpoint: '/score', sessionId: '...' })</script>
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

  if (!formEl) throw new Error(`[nyasa] element not found: ${String(selectorOrEl)}`)

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
export { DETECTION_DISPLAY_LABELS } from './scoring'

// Named type exports for TypeScript consumers
export type {
  BehaviorPayload,
  CollectedSignals,
  BehavioralSignals,
  FingerprintSignals,
  NetworkSignals,
  InputTypeSignals,
  UploadSignals,
  DetectionResult,
  Detections,
  CollectOptions,
  CollectHandle,
} from './types'
