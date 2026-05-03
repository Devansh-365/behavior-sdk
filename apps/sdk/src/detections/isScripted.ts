import type { CollectedSignals, DetectionResult } from '../types'
import type { ExtractedFeatures } from '../features'

export function detectScripted(signals: CollectedSignals, features: ExtractedFeatures): DetectionResult {
  const { behavioral } = signals
  const reasons: string[] = []

  // ── Pointer activity ──────────────────────────────────────────────────────
  if (features.hasNoPointerActivity)
    reasons.push('no mouse or touch activity recorded')

  // ── Mouse curvature ──────────────────────────────────────────────────────
  if (features.curvatureVariance !== null && features.curvatureVariance < 0.05)
    reasons.push(`mouse curvature variance ${features.curvatureVariance.toFixed(3)}rad² (human baseline > 0.1)`)

  // ── Keystroke timing ─────────────────────────────────────────────────────
  if (features.dwellVariance !== null && features.dwellVariance < 2)
    reasons.push(`keystroke dwell variance ${features.dwellVariance.toFixed(2)}ms² (human baseline > 50ms²)`)

  if (features.flightVariance !== null && features.flightVariance < 5)
    reasons.push(`keystroke flight variance ${features.flightVariance.toFixed(2)}ms² (human baseline > 200ms²)`)

  // ── Paste ratio ──────────────────────────────────────────────────────────
  const { pasteRatio, charCount } = behavioral.paste
  if (charCount > 10 && pasteRatio > 0.9)
    reasons.push(`paste ratio ${(pasteRatio * 100).toFixed(0)}% with ${charCount} chars`)

  // ── Correction ratio ─────────────────────────────────────────────────────
  if (charCount > 50 && behavioral.correction.correctionRatio === 0)
    reasons.push(`zero corrections in ${charCount} chars (humans typo and fix)`)

  // ── Reaction time (network pillar) ──────────────────────────────────────
  const { minInputDelay } = signals.network.reaction
  if (minInputDelay !== null && minInputDelay < 50)
    reasons.push(`first input ${minInputDelay.toFixed(0)}ms after focus (humans need >80ms physiologically)`)

  // ── Programmatic input dispatch ──────────────────────────────────────────
  const { programmatic } = behavioral.inputType
  if (programmatic > 5 && !features.hasKnownInputOrigin)
    reasons.push(`${programmatic} programmatic input events with no typed/pasted/dropped origin`)

  return {
    detected: reasons.length >= 2,
    severity: reasons.length >= 3 ? 'high' : 'medium',
    reasons,
  }
}
