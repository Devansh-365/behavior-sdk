import type { CollectedSignals, DetectionResult } from '../types'
import type { ExtractedFeatures } from '../features'

export function detectMultimodalBot(
  signals: CollectedSignals,
  features: ExtractedFeatures,
  isScriptedResult: DetectionResult,
  isLLMAgentResult: DetectionResult,
): DetectionResult {
  const { behavioral } = signals
  const reasons: string[] = []

  // ── Near-miss composition ────────────────────────────────────────────────────
  // Both isScripted and isLLMAgent individually raised suspicion but neither
  // crossed their own threshold. Their partial signals together are meaningful.
  const scriptedNearMiss = !isScriptedResult.detected && isScriptedResult.reasons.length >= 1
  const llmNearMiss = !isLLMAgentResult.detected && isLLMAgentResult.reasons.length >= 1
  if (scriptedNearMiss && llmNearMiss) {
    reasons.push(
      `near-miss: scripted (${isScriptedResult.reasons.length} signal) + LLM agent (${isLLMAgentResult.reasons.length} signal) — neither rule fired alone`,
    )
  }

  // ── Cross-signal contradiction 1: natural mouse movement + pixel-precise clicks ──
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

  // ── Cross-signal contradiction 2: organic session rhythm + instant field fills ─
  // Natural rhythm variance means irregular gaps (human-like), but instant fills
  // mean the fields were populated programmatically despite the organic-looking pacing.
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
