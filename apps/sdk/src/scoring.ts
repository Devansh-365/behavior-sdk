import type { Detections, Verdict } from './types'

type SeverityWeights = { high: number; medium: number; low: number }

/**
 * Per-detection confidence weights at each severity level.
 * Tune these without touching any detection rule.
 *
 * isHeadless is weighted highest: environment markers are near-unfakeable.
 * isLLMAgent is weighted lower: paste-heavy sessions can be legitimate.
 */
const WEIGHTS = {
  isHeadless:         { high: 0.95, medium: 0.70, low: 0.40 },
  isScripted:         { high: 0.85, medium: 0.65, low: 0.35 },
  isLLMAgent:         { high: 0.80, medium: 0.60, low: 0.30 },
  isUploadAutomation: { high: 0.90, medium: 0.70, low: 0.50 },
  isMultimodalBot:    { high: 0.88, medium: 0.68, low: 0.38 },
  isAuthorizedAgent:  { high: 1.00, medium: 1.00, low: 1.00 },
} satisfies Record<keyof Detections, SeverityWeights>

/**
 * Stable display labels independent of symbol names.
 * Exposed for docs sites and dashboard UIs — keep in sync with payload JSON keys.
 */
export const DETECTION_DISPLAY_LABELS: Record<keyof Detections, string> = {
  isHeadless:         'Headless Browser',
  isScripted:         'Scripted Bot',
  isLLMAgent:         'LLM Agent',
  isUploadAutomation: 'Upload Automation',
  isMultimodalBot:    'Multimodal Bot',
  isAuthorizedAgent:  'Authorized Agent',
}

/**
 * Derives a Verdict from detection results using noisy-OR combination.
 *
 * Noisy OR: P(bot | rules A, B, C) = 1 - (1 - P_A)(1 - P_B)(1 - P_C)
 * Each additional fired rule increases confidence monotonically.
 * A single low-severity signal (~0.30) differs meaningfully from three
 * high-severity signals firing together (~0.99).
 */
export function deriveVerdict(detections: Detections): Verdict {
  if (detections.isAuthorizedAgent.detected) {
    return { kind: 'AuthorizedAgent', confidence: 1.0, badges: [DETECTION_DISPLAY_LABELS.isAuthorizedAgent] }
  }

  const badges: string[] = []
  let confidence = 0.0

  for (const [key, result] of Object.entries(detections) as Array<[keyof Detections, Detections[keyof Detections]]>) {
    if (key === 'isAuthorizedAgent' || !result.detected) continue
    const weight = WEIGHTS[key][result.severity]
    confidence = 1 - (1 - confidence) * (1 - weight)
    badges.push(`${DETECTION_DISPLAY_LABELS[key]} (${result.severity})`)
  }

  if (badges.length === 0) {
    return { kind: 'Human', confidence: 1.0, badges: [] }
  }

  return {
    kind: 'UnauthorizedBot',
    confidence: Math.round(confidence * 100) / 100,
    badges,
  }
}
