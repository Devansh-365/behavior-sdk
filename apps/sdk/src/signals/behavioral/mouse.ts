import type { Collector, MouseSignals } from '../../types'

// Bound the mouse path so a long session doesn't grow unbounded memory or
// blow past sendBeacon's ~64KB payload limit. Throttle the sample rate to
// roughly 20 samples/sec so curvature math has good signal without flooding.
const MAX_PATH_POINTS = 1000
const SAMPLE_INTERVAL_MS = 50

export function attachMouseCollector(target: Document | HTMLElement): Collector<MouseSignals> {
  const path: [number, number][] = []
  let lastSampleAt = 0

  function onMouseMove(e: Event): void {
    const now = performance.now()
    if (now - lastSampleAt < SAMPLE_INTERVAL_MS) return
    lastSampleAt = now

    const me = e as MouseEvent
    if (path.length >= MAX_PATH_POINTS) path.shift() // drop oldest, keep recent
    path.push([me.clientX, me.clientY])
  }

  target.addEventListener('mousemove', onMouseMove)

  return {
    getSignals: (): MouseSignals => ({
      pathLength: path.length,
      curvature: computeCurvature(path),
      stillnessRatio: computeStillness(path),
    }),
    detach: (): void => target.removeEventListener('mousemove', onMouseMove),
  }
}

function computeStillness(path: [number, number][]): number {
  if (path.length < 2) return 1 // no samples = assume still
  let stillCount = 0
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]
    const curr = path[i]
    if (!prev || !curr) continue
    if (Math.abs(curr[0] - prev[0]) + Math.abs(curr[1] - prev[1]) < 2) stillCount++
  }
  return stillCount / (path.length - 1)
}

function computeCurvature(path: [number, number][]): number[] {
  if (path.length < 3) return []
  const angles: number[] = []
  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1]
    const curr = path[i]
    const next = path[i + 1]
    // noUncheckedIndexedAccess: all three can be undefined at the type level
    if (!prev || !curr || !next) continue
    const [ax, ay] = prev
    const [bx, by] = curr
    const [cx, cy] = next
    angles.push(Math.abs(Math.atan2(by - ay, bx - ax) - Math.atan2(cy - by, cx - bx)))
  }
  return angles
}
