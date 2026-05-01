import type { Collector, ScrollSignals } from '../../types'

export function attachScrollCollector(): Collector<ScrollSignals> {
  const depths: number[] = []
  const timestamps: number[] = []

  function onScroll(): void {
    depths.push(Math.round(window.scrollY))
    timestamps.push(Math.round(performance.now()))
  }

  window.addEventListener('scroll', onScroll, { passive: true })

  return {
    getSignals: (): ScrollSignals => ({ depths: [...depths], timestamps: [...timestamps] }),
    detach: (): void => window.removeEventListener('scroll', onScroll),
  }
}
