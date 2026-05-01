import type { ConnectionSignals } from '../../types'

/**
 * navigator.connection snapshot.
 *
 * Available in Chromium-based browsers (Chrome, Edge, Opera) — Firefox and
 * Safari ship without it, so callers must treat null fields as "unknown",
 * not "human". Useful signal combinations:
 *   - rtt < 20 && downlink > 100  → datacenter / VPS connection
 *   - effectiveType claims 4g but rtt suggests fixed-line → suspicious mismatch
 */
type NavConn = {
  effectiveType?: string
  rtt?: number
  downlink?: number
  saveData?: boolean
}

export function collectConnectionSignal(): ConnectionSignals {
  try {
    const conn = (navigator as Navigator & { connection?: NavConn }).connection
    if (!conn) {
      return { effectiveType: null, rtt: null, downlink: null, saveData: null, supported: false }
    }
    return {
      effectiveType: typeof conn.effectiveType === 'string' ? conn.effectiveType : null,
      rtt: typeof conn.rtt === 'number' ? conn.rtt : null,
      downlink: typeof conn.downlink === 'number' ? conn.downlink : null,
      saveData: typeof conn.saveData === 'boolean' ? conn.saveData : null,
      supported: true,
    }
  } catch {
    return { effectiveType: null, rtt: null, downlink: null, saveData: null, supported: false }
  }
}
