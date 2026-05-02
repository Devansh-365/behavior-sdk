import type { CollectedSignals, DetectionResult } from '../types'
import { computeVariance } from '../utils'

// Cross-signal coherence check. A sophisticated bot may convincingly fake one
// behavioral dimension (add realistic mouse movement, or add keystroke events)
// but rarely fakes all simultaneously. Incoherence between pillars is a strong
// indicator of signal injection.
export function detectMultimodalBot(signals: CollectedSignals): DetectionResult {
  const { behavioral } = signals
  const reasons: string[] = []

  // ── Contradiction 1: natural mouse movement + pixel-precise clicks ──────────
  // Browser-use / Playwright agents sometimes inject mouse-move events to look
  // human, but their element.click() still targets the exact bounding-box center.
  // Real humans with naturally-curved mouse paths have ±5–20px click scatter.
  const { centerOffsets, targeted } = behavioral.click
  if (behavioral.mouse.curvature.length >= 8 && targeted >= 3 && centerOffsets.length >= 3) {
    const curvVar = computeVariance(behavioral.mouse.curvature)
    const meanOffset = centerOffsets.reduce((s, [dx, dy]) => s + Math.sqrt(dx * dx + dy * dy), 0) / centerOffsets.length
    if (curvVar > 0.08 && meanOffset < 2)
      reasons.push(
        `natural mouse curve (var ${curvVar.toFixed(3)}) with pixel-precise clicks (${meanOffset.toFixed(1)}px mean offset) — mouse events injected`,
      )
  }

  // ── Contradiction 2: typed content + zero corrections + zero scroll ──────────
  // Humans filling any multi-field form always scroll and always make at least
  // one correction. Both being zero simultaneously with substantial typed input
  // means the typing events are synthetic (bot adds keystrokes but skips the
  // friction that comes with real typing).
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
  // A bot that types into fields via keyboard dispatch never needs to click or
  // move a mouse. Zero pointer + zero touch + active keystroke = non-human flow.
  if (
    behavioral.keystroke.dwells.length > 10 &&
    behavioral.mouse.pathLength === 0 &&
    behavioral.touch.touchCount === 0 &&
    behavioral.click.count === 0
  ) {
    reasons.push('keyboard activity with zero mouse, touch, or click — bot typing without pointer interaction')
  }

  // ── Contradiction 4: session rhythm looks natural but field fills are instant ─
  // LLM agents sometimes produce realistic inter-event gaps at the session level
  // (to avoid rhythm detection) but still fill individual fields at machine speed.
  const { instantFills, totalFields } = behavioral.fieldTiming
  const naturalRhythm =
    behavioral.sessionRhythm.gapVariance > 200000 &&  // irregular gaps = looks human
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
