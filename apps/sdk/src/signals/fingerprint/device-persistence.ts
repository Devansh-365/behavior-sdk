import type { DevicePersistenceSignals } from '../../types'

const STORAGE_KEY = '__bsdk_did__'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function collectDevicePersistenceSignal(): DevicePersistenceSignals {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) {
      return { deviceId: existing, isNew: false }
    }
    const id = generateUUID()
    localStorage.setItem(STORAGE_KEY, id)
    return { deviceId: id, isNew: true }
  } catch {
    // localStorage blocked (incognito with strict settings, sandboxed iframe, etc.)
    return { deviceId: generateUUID(), isNew: true }
  }
}
