import type { Collector, KeystrokeSignals } from '../../types'

export function attachKeystrokeCollector(target: HTMLElement): Collector<KeystrokeSignals> {
  const dwells: number[] = []
  const flights: number[] = []
  const downTimes = new Map<string, number>()
  let lastKeyUp = 0

  function onKeyDown(e: KeyboardEvent): void {
    downTimes.set(e.code, performance.now())
  }

  function onKeyUp(e: KeyboardEvent): void {
    const t0 = downTimes.get(e.code)
    if (t0 !== undefined) {
      dwells.push(Math.round(performance.now() - t0))
      downTimes.delete(e.code)
    }
    const now = performance.now()
    if (lastKeyUp > 0) flights.push(Math.round(now - lastKeyUp))
    lastKeyUp = now
  }

  target.addEventListener('keydown', onKeyDown)
  target.addEventListener('keyup', onKeyUp)

  return {
    getSignals: (): KeystrokeSignals => ({ dwells: [...dwells], flights: [...flights] }),
    detach: (): void => {
      target.removeEventListener('keydown', onKeyDown)
      target.removeEventListener('keyup', onKeyUp)
    },
  }
}
