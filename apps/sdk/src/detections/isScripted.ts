import type { CollectedSignals, DetectionResult } from '../types'
import { computeVariance } from '../utils'

export function detectScripted(signals: CollectedSignals): DetectionResult {
  const { behavioral } = signals
  const reasons: string[] = []

  // ── Pointer activity ──────────────────────────────────────────────────────
  // "No mouse movement" alone false-positives every mobile user. Treat
  // "no mouse AND no touch" as the actual signal of zero pointer activity.
  if (behavioral.mouse.pathLength === 0 && behavioral.touch.touchCount === 0)
    reasons.push('no mouse or touch activity recorded')

  // ── Mouse curvature ──────────────────────────────────────────────────────
  // Bots that DO move the mouse often produce straight or smoothly-curved
  // paths — curvature variance much lower than a real human's wobble.
  if (behavioral.mouse.curvature.length >= 5) {
    const cvar = computeVariance(behavioral.mouse.curvature)
    if (cvar < 0.05)
      reasons.push(`mouse curvature variance ${cvar.toFixed(3)}rad² (human baseline > 0.1)`)
  }

  // ── Keystroke timing ─────────────────────────────────────────────────────
  const { dwells, flights } = behavioral.keystroke
  if (dwells.length > 4) {
    const variance = computeVariance(dwells)
    if (variance < 2)
      reasons.push(`keystroke dwell variance ${variance.toFixed(2)}ms² (human baseline > 50ms²)`)
  }

  if (flights.length > 4) {
    const variance = computeVariance(flights)
    if (variance < 5)
      reasons.push(`keystroke flight variance ${variance.toFixed(2)}ms² (human baseline > 200ms²)`)
  }

  // ── Paste ratio ──────────────────────────────────────────────────────────
  const { pasteRatio, charCount } = behavioral.paste
  if (charCount > 10 && pasteRatio > 0.9)
    reasons.push(`paste ratio ${(pasteRatio * 100).toFixed(0)}% with ${charCount} chars`)

  // ── Correction ratio ─────────────────────────────────────────────────────
  // Humans typo and fix; bots typically don't. Long input with zero corrections
  // is a strong scripting signal.
  const { correctionRatio } = behavioral.correction
  if (charCount > 50 && correctionRatio === 0)
    reasons.push(`zero corrections in ${charCount} chars (humans typo and fix)`)

  return {
    detected: reasons.length >= 2,
    severity: reasons.length >= 3 ? 'high' : 'medium',
    reasons,
  }
}
