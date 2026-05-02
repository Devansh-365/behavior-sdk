import type { IncognitoSignals } from '../../types'

// Chrome / Edge incognito caps navigator.storage quota at roughly 120 MB.
// Normal sessions receive a device-proportional share (typically several GB).
const QUOTA_THRESHOLD = 150 * 1024 * 1024  // 150 MB

let cached: IncognitoSignals | null = null

export function prewarmIncognitoDetection(): void {
  if (cached !== null) return
  runDetection().then(result => { cached = result })
}

export function collectIncognitoSignal(): IncognitoSignals {
  return cached ?? { isIncognito: null, method: null }
}

async function runDetection(): Promise<IncognitoSignals> {
  // Technique 1: storage quota (Chrome / Edge — most reliable modern signal)
  if (typeof navigator.storage?.estimate === 'function') {
    try {
      const { quota } = await navigator.storage.estimate()
      if (typeof quota === 'number' && quota > 0) {
        return { isIncognito: quota < QUOTA_THRESHOLD, method: 'quota' }
      }
    } catch { /* API unavailable */ }
  }

  // Technique 2: IndexedDB open probe (catches Safari < 13 private mode,
  // which throws a SecurityError on any IDB open attempt)
  if (typeof indexedDB !== 'undefined') {
    const blocked = await new Promise<boolean>(resolve => {
      try {
        const req = indexedDB.open('__bsdk_probe__')
        req.onsuccess = () => {
          req.result?.close()
          indexedDB.deleteDatabase('__bsdk_probe__')
          resolve(false)
        }
        req.onerror = () => resolve(true)
      } catch {
        resolve(true)
      }
    })
    if (blocked) return { isIncognito: true, method: 'indexeddb' }
    return { isIncognito: false, method: 'indexeddb' }
  }

  return { isIncognito: null, method: null }
}
