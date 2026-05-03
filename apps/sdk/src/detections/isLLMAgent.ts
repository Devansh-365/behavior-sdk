import type { CollectedSignals, DetectionResult, SessionMeta } from '../types'
import type { ExtractedFeatures } from '../features'
import { MACHINE_SPEED_MS } from '../features'

const BURST_RUN_MIN = 3

export function detectLLMAgent(signals: CollectedSignals, sessionMeta: SessionMeta, features: ExtractedFeatures): DetectionResult {
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

  // Click precision: Playwright element.click() always targets bounding box center
  if (features.meanClickOffset !== null && features.meanClickOffset < 3)
    reasons.push(`click precision ${features.meanClickOffset.toFixed(1)}px mean offset from element center — automation-level targeting`)

  // Mouse stillness: LLM Decide phase = complete mouse inactivity
  const { pathLength, stillnessRatio } = behavioral.mouse
  if (pathLength > 5 && stillnessRatio > 0.7 && charCount > 20)
    reasons.push(`mouse still ${(stillnessRatio * 100).toFixed(0)}% of session — LLM inference pauses`)

  // Machine-speed burst: consecutive flights under MACHINE_SPEED_MS
  if (features.maxMachineSpeedBurstRun >= BURST_RUN_MIN)
    reasons.push(`machine-speed keystroke burst: ${features.maxMachineSpeedBurstRun} consecutive flights <${MACHINE_SPEED_MS}ms`)

  // Uniform timing over a meaningful sample
  if (features.flightSamples > 10 && features.flightVariance !== null && features.flightVariance < 10)
    reasons.push('inter-keystroke timing suspiciously uniform across long session')

  // Per-field dwell: LLMs batch-fill by pasting/setting each field in <100ms
  const { instantFills, totalFields } = behavioral.fieldTiming
  if (totalFields >= 2 && instantFills >= 2)
    reasons.push(`${instantFills}/${totalFields} fields filled in <100ms — LLM batch-fill pattern`)

  // Session rhythm: LLM Act→Decide cycle produces burst→silence→burst sawtooth
  const rhythm = behavioral.sessionRhythm
  if (rhythm.burstCount > 3 && rhythm.gapVariance < 50000 && rhythm.meanBurstGapMs > 800)
    reasons.push(`burst-pause rhythm: ${rhythm.burstCount} bursts, ${rhythm.meanBurstGapMs.toFixed(0)}ms mean gap — LLM inference cycle`)

  return {
    detected: reasons.length >= 2,
    severity: 'high',
    reasons,
  }
}
