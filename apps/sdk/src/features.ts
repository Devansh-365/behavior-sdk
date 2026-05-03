import type { CollectedSignals } from './types'
import { computeVariance } from './utils'

/** Speed threshold for machine-generated keystrokes. Exported so detection
 *  rules can reference the same constant in their reason strings. */
export const MACHINE_SPEED_MS = 20

export interface ExtractedFeatures {
  // Mouse curvature
  curvatureVariance: number | null  // null if < 5 samples (insufficient for reliable estimate)
  curvatureSamples: number          // raw count; rules needing a tighter minimum check this

  // Keystroke timing
  dwellVariance: number | null      // null if <= 4 samples
  flightVariance: number | null     // null if <= 4 samples
  flightSamples: number             // raw count; rules needing a tighter minimum check this

  // Longest consecutive run of flights below MACHINE_SPEED_MS
  maxMachineSpeedBurstRun: number   // 0 if no burst or < 3 flight samples

  // Click precision — Euclidean distance from bounding box center, averaged
  meanClickOffset: number | null    // null if targeted < 3 or centerOffsets.length < 3
  clickTargeted: number             // how many clicks landed on interactive elements

  // Composite booleans extracted once to avoid re-reading the same properties
  hasNoPointerActivity: boolean     // mouse.pathLength === 0 && touch.touchCount === 0
  hasKnownInputOrigin: boolean      // typed + pasted + dropped > 0 (at least one real input origin)
}

export function extractFeatures(signals: CollectedSignals): ExtractedFeatures {
  const { behavioral } = signals

  // ── Mouse curvature variance ─────────────────────────────────────────────
  const curvatureSamples = behavioral.mouse.curvature.length
  const curvatureVariance = curvatureSamples >= 5
    ? computeVariance(behavioral.mouse.curvature)
    : null

  // ── Keystroke timing variances ───────────────────────────────────────────
  const { dwells, flights } = behavioral.keystroke
  const dwellVariance = dwells.length > 4 ? computeVariance(dwells) : null
  const flightSamples = flights.length
  const flightVariance = flightSamples > 4 ? computeVariance(flights) : null

  // ── Longest machine-speed keystroke burst ────────────────────────────────
  let maxMachineSpeedBurstRun = 0
  if (flightSamples >= 3) {
    let run = 0
    for (const f of flights) {
      if (f < MACHINE_SPEED_MS) { run++; if (run > maxMachineSpeedBurstRun) maxMachineSpeedBurstRun = run }
      else run = 0
    }
  }

  // ── Click precision ──────────────────────────────────────────────────────
  const { centerOffsets, targeted } = behavioral.click
  const clickTargeted = targeted
  const meanClickOffset =
    targeted >= 3 && centerOffsets.length >= 3
      ? centerOffsets.reduce((sum, [dx, dy]) => sum + Math.sqrt(dx * dx + dy * dy), 0) / centerOffsets.length
      : null

  // ── Composite booleans ───────────────────────────────────────────────────
  const hasNoPointerActivity =
    behavioral.mouse.pathLength === 0 && behavioral.touch.touchCount === 0

  const { typed, pasted, dropped } = behavioral.inputType
  const hasKnownInputOrigin = typed + pasted + dropped > 0

  return {
    curvatureVariance,
    curvatureSamples,
    dwellVariance,
    flightVariance,
    flightSamples,
    maxMachineSpeedBurstRun,
    meanClickOffset,
    clickTargeted,
    hasNoPointerActivity,
    hasKnownInputOrigin,
  }
}
