import type { Collector, VisibilitySignals } from '../../types'

export function attachVisibilityCollector(): Collector<VisibilitySignals> {
  let hiddenCount = 0
  let blurCount = 0
  let totalHiddenMs = 0
  let hiddenSince: number | null = null

  function onVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      hiddenCount++
      hiddenSince = performance.now()
    } else if (hiddenSince !== null) {
      totalHiddenMs += performance.now() - hiddenSince
      hiddenSince = null
    }
  }

  function onBlur(): void {
    blurCount++
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('blur', onBlur)

  return {
    getSignals: (): VisibilitySignals => {
      // If currently hidden when getSignals() is called, count elapsed hidden time
      const pendingMs = hiddenSince !== null ? performance.now() - hiddenSince : 0
      return { hiddenCount, blurCount, totalHiddenMs: totalHiddenMs + pendingMs }
    },
    detach: (): void => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onBlur)
    },
  }
}
