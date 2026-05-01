import type { Collector, TouchSignals } from '../../types'

export function attachTouchCollector(target: Document | HTMLElement): Collector<TouchSignals> {
  let touchCount = 0
  let taps = 0
  let pathLength = 0

  function onTouchStart(): void { touchCount++ }
  function onTouchEnd(): void { taps++ }
  function onTouchMove(): void { pathLength++ }

  target.addEventListener('touchstart', onTouchStart, { passive: true })
  target.addEventListener('touchend', onTouchEnd, { passive: true })
  target.addEventListener('touchmove', onTouchMove, { passive: true })

  return {
    getSignals: (): TouchSignals => ({ touchCount, taps, pathLength }),
    detach: (): void => {
      target.removeEventListener('touchstart', onTouchStart)
      target.removeEventListener('touchend', onTouchEnd)
      target.removeEventListener('touchmove', onTouchMove)
    },
  }
}
