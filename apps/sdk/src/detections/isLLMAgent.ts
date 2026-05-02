import type { CollectedSignals, DetectionResult, SessionMeta } from '../types'
import { computeVariance } from '../utils'

// LLM "Act phase" dispatches keys at 0-15ms (browser-use, Playwright type()).
// Humans cannot physically sustain below ~50ms; even a brief sub-20ms run of
// 3+ consecutive flights is a reliable machine-speed signal.
const MACHINE_SPEED_MS = 20
const BURST_RUN_MIN = 3

export function detectLLMAgent(signals: CollectedSignals, sessionMeta: SessionMeta): DetectionResult {
  const { behavioral } = signals
  const reasons: string[] = []

  const { pasteRatio, charCount } = behavioral.paste
  if (charCount > 5 && pasteRatio > 0.8)
    reasons.push(`paste ratio ${(pasteRatio * 100).toFixed(0)}% — LLMs compose then paste`)

  if (behavioral.scroll.depths.length === 0 && charCount > 20)
    reasons.push('no scroll events with substantial input — LLMs navigate without scrolling')

  const elapsedSec = sessionMeta.elapsedMs / 1000
  if (elapsedSec < 8 && charCount > 40)
    reasons.push(`${charCount} chars entered in ${elapsedSec.toFixed(1)}s — faster than human baseline`)

  // Click precision: Playwright element.click() always targets bounding box center → offsets ≈ 0px
  // Human clicks land with natural scatter of ±5–20px from center
  const { centerOffsets, targeted } = behavioral.click
  if (targeted >= 3 && centerOffsets.length >= 3) {
    const meanOffset = centerOffsets.reduce((sum, [dx, dy]) => sum + Math.sqrt(dx * dx + dy * dy), 0) / centerOffsets.length
    if (meanOffset < 3)
      reasons.push(`click precision ${meanOffset.toFixed(1)}px mean offset from element center — automation-level targeting`)
  }

  // Mouse stillness: LLM Decide phase = complete mouse inactivity; humans have constant micro-drift
  // Require pathLength > 5 to avoid firing on touchscreen-only sessions
  const { pathLength, stillnessRatio } = behavioral.mouse
  if (pathLength > 5 && stillnessRatio > 0.7 && charCount > 20)
    reasons.push(`mouse still ${(stillnessRatio * 100).toFixed(0)}% of session — LLM inference pauses`)

  const { flights } = behavioral.keystroke

  // Machine-speed burst: ≥BURST_RUN_MIN consecutive flights under MACHINE_SPEED_MS
  if (flights.length >= BURST_RUN_MIN) {
    let maxRun = 0
    let run = 0
    for (const f of flights) {
      if (f < MACHINE_SPEED_MS) { run++; if (run > maxRun) maxRun = run }
      else run = 0
    }
    if (maxRun >= BURST_RUN_MIN)
      reasons.push(`machine-speed keystroke burst: ${maxRun} consecutive flights <${MACHINE_SPEED_MS}ms`)
  }

  // Uniform timing over a meaningful sample (tightened to >10 to reduce FP on short inputs;
  // scripted bots are caught earlier by isScripted, so this targets LLM keyboard-act agents)
  if (flights.length > 10 && computeVariance(flights) < 10)
    reasons.push('inter-keystroke timing suspiciously uniform across long session')

  // Session rhythm: LLM Act→Decide cycle produces a sawtooth of burst→silence→burst
  // burstCount > 3 = multiple inference cycles observed
  // gapVariance < 50000ms² = inter-burst gaps are regular (LLM has consistent inference time)
  // meanBurstGapMs > 800 = gaps are in LLM inference range (not just human pauses)
  const rhythm = behavioral.sessionRhythm
  if (rhythm.burstCount > 3 && rhythm.gapVariance < 50000 && rhythm.meanBurstGapMs > 800)
    reasons.push(`burst-pause rhythm: ${rhythm.burstCount} bursts, ${rhythm.meanBurstGapMs.toFixed(0)}ms mean gap — LLM inference cycle`)

  return {
    detected: reasons.length >= 2,
    severity: 'high',
    reasons,
  }
}
