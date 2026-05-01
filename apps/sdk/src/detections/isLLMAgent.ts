import type { CollectedSignals, DetectionResult, SessionMeta } from '../types'
import { computeVariance } from '../utils'

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

  const { flights } = behavioral.keystroke
  if (flights.length > 3 && computeVariance(flights) < 10)
    reasons.push('inter-keystroke timing suspiciously uniform')

  return {
    detected: reasons.length >= 2,
    severity: 'high',
    reasons,
  }
}
