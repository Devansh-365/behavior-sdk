import type { TimingSignals } from '../../types'

/**
 * Page-load timing snapshot from the Performance Navigation Timing entry.
 * Measured by the browser during the actual handshake — DNS lookup, TCP
 * connect, TLS handshake, time-to-first-byte. Stable per session; reflects
 * the network conditions at page load.
 *
 * Rounded to integer ms to keep payload size small and reduce passive
 * fingerprinting surface vs. sub-millisecond precision.
 */
export function collectTimingSignal(): TimingSignals {
  try {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const nav = entries[0]
    if (!nav) {
      return { dnsMs: null, tcpMs: null, tlsMs: null, ttfbMs: null, domLoadMs: null, supported: false }
    }
    const round = (n: number): number => Math.max(0, Math.round(n))
    return {
      dnsMs: round(nav.domainLookupEnd - nav.domainLookupStart),
      tcpMs: round(nav.connectEnd - nav.connectStart),
      tlsMs: nav.secureConnectionStart > 0
        ? round(nav.connectEnd - nav.secureConnectionStart)
        : null,
      ttfbMs: round(nav.responseStart - nav.requestStart),
      domLoadMs: round(nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart),
      supported: true,
    }
  } catch {
    return { dnsMs: null, tcpMs: null, tlsMs: null, ttfbMs: null, domLoadMs: null, supported: false }
  }
}
