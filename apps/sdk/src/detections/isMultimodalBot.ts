import type { CollectedSignals, DetectionResult } from '../types'
import type { ExtractedFeatures } from '../features'

export function detectMultimodalBot(signals: CollectedSignals, features: ExtractedFeatures): DetectionResult {
  const { behavioral } = signals
  const reasons: string[] = []

  // ── Contradiction 1: natural mouse movement + pixel-precise clicks ──────────
  // curvatureSamples >= 8 needed here: checking for HIGH variance requires more
  // data points than the baseline minimum of 5 used during extraction.
  if (
    features.curvatureSamples >= 8 &&
    features.curvatureVariance !== null &&
    features.meanClickOffset !== null &&
    features.curvatureVariance > 0.08 &&
    features.meanClickOffset < 2
  ) {
    reasons.push(
      `natural mouse curve (var ${features.curvatureVariance.toFixed(3)}) with pixel-precise clicks (${features.meanClickOffset.toFixed(1)}px mean offset) — mouse events injected`,
    )
  }

  // ── Contradiction 2: typed content + zero corrections + zero scroll ──────────
  const { charCount, pasteRatio } = behavioral.paste
  if (
    charCount > 60 &&
    pasteRatio < 0.5 &&
    behavioral.correction.correctionRatio === 0 &&
    behavioral.scroll.depths.length === 0
  ) {
    reasons.push(
      `${charCount} typed chars, zero corrections, zero scroll — genuine form-filling always produces both`,
    )
  }

  // ── Contradiction 3: keyboard activity with no pointer on a non-touch device ─
  if (
    behavioral.keystroke.dwells.length > 10 &&
    behavioral.mouse.pathLength === 0 &&
    behavioral.touch.touchCount === 0 &&
    behavioral.click.count === 0
  ) {
    reasons.push('keyboard activity with zero mouse, touch, or click — bot typing without pointer interaction')
  }

  // ── Contradiction 4: session rhythm looks natural but field fills are instant ─
  const { instantFills, totalFields } = behavioral.fieldTiming
  const naturalRhythm =
    behavioral.sessionRhythm.gapVariance > 200000 &&
    behavioral.sessionRhythm.burstCount >= 2
  if (naturalRhythm && totalFields >= 3 && instantFills >= 2)
    reasons.push(
      `session rhythm looks organic but ${instantFills}/${totalFields} fields were filled in <100ms`,
    )

  return {
    detected: reasons.length >= 1,
    severity: reasons.length >= 2 ? 'high' : 'medium',
    reasons,
  }
}
