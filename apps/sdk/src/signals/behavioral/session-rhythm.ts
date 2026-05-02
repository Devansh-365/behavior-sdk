import type { Collector, SessionRhythmSignals } from '../../types'
import { computeVariance } from '../../utils'

// Gap between activity bursts larger than this = LLM-style inference pause
const BURST_GAP_MS = 800
// Mouse sample rate for rhythm — lower than mouse.ts; we only need presence, not path
const MOUSE_THROTTLE_MS = 200

export function attachSessionRhythmCollector(): Collector<SessionRhythmSignals> {
  const timestamps: number[] = []
  let lastMouseAt = 0

  function record(): void {
    timestamps.push(performance.now())
  }

  function onMouseMove(): void {
    const now = performance.now()
    if (now - lastMouseAt < MOUSE_THROTTLE_MS) return
    lastMouseAt = now
    timestamps.push(now)
  }

  document.addEventListener('keydown', record)
  document.addEventListener('click', record)
  document.addEventListener('focusin', record)
  document.addEventListener('mousemove', onMouseMove)
  window.addEventListener('scroll', record)

  return {
    getSignals: (): SessionRhythmSignals => {
      if (timestamps.length < 2) {
        return { eventGaps: [], maxGapMs: 0, burstCount: 0, meanBurstGapMs: 0, gapVariance: 0 }
      }

      // Events from the queue are already temporally ordered — no sort needed
      const gaps: number[] = []
      for (let i = 1; i < timestamps.length; i++) {
        gaps.push(timestamps[i]! - timestamps[i - 1]!)
      }

      const maxGapMs = gaps.reduce((m, g) => (g > m ? g : m), 0)

      // Inter-burst gaps: pauses longer than BURST_GAP_MS
      // Each such gap = one LLM inference cycle
      const interBurstGaps: number[] = []
      let burstCount = 1
      for (const gap of gaps) {
        if (gap > BURST_GAP_MS) {
          burstCount++
          interBurstGaps.push(gap)
        }
      }

      const meanBurstGapMs =
        interBurstGaps.length > 0
          ? interBurstGaps.reduce((s, g) => s + g, 0) / interBurstGaps.length
          : 0

      return {
        eventGaps: gaps,
        maxGapMs,
        burstCount,
        meanBurstGapMs,
        gapVariance: computeVariance(interBurstGaps),
      }
    },
    detach: (): void => {
      document.removeEventListener('keydown', record)
      document.removeEventListener('click', record)
      document.removeEventListener('focusin', record)
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', record)
    },
  }
}
