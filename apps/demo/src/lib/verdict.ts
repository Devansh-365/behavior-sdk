import type { BehaviorPayload, Detections } from 'behavior-sdk'

export type VerdictKind = 'analyzing' | 'human' | 'headless' | 'scripted' | 'llm' | 'multiple'

export interface Verdict {
  kind: VerdictKind
  label: string
  shortLabel: string
  description: string
  confidence: number              // 0–100
  tone: 'green' | 'amber' | 'red' | 'slate'
  firedRules: Array<keyof Detections>
  reasons: string[]               // flat list, prefixed with rule name
}

const RULE_LABEL: Record<keyof Detections, string> = {
  isHeadless:         'Headless browser',
  isScripted:         'Scripted bot',
  isLLMAgent:         'LLM agent',
  isUploadAutomation: 'Upload automation',
}

const SUBKIND_FOR: Record<keyof Detections, Exclude<VerdictKind, 'analyzing' | 'human' | 'multiple'>> = {
  isHeadless:         'headless',
  isScripted:         'scripted',
  isLLMAgent:         'llm',
  isUploadAutomation: 'scripted',
}

const SHORT_LABEL: Record<VerdictKind, string> = {
  analyzing: 'Awaiting input',
  human: 'Human',
  headless: 'Headless browser',
  scripted: 'Scripted bot',
  llm: 'LLM agent',
  multiple: 'Bot — multiple signals',
}

const DESCRIPTION: Record<VerdictKind, string> = {
  analyzing: 'Type, paste, scroll, or move your mouse to begin signal collection.',
  human: 'Behavioral signals look organic — variance, mouse movement, scroll all consistent with a human.',
  headless: 'Headless browser markers detected — likely a Playwright, Puppeteer, or Selenium driver.',
  scripted: 'Mechanical input pattern — uniform timing, no mouse, signature of a scripted automation tool.',
  llm: 'Heavy paste with little organic input — signature of an LLM agent composing then submitting.',
  multiple: 'Two or more independent detection rules fired. High-confidence non-human session.',
}

export function computeVerdict(payload: BehaviorPayload | null): Verdict {
  if (!payload) return baseAnalyzing()

  const { detections, signals } = payload
  const fired = (Object.entries(detections) as Array<[keyof Detections, Detections[keyof Detections]]>)
    .filter(([, r]) => r.detected)
    .map(([k]) => k)

  const reasons = (Object.entries(detections) as Array<[keyof Detections, Detections[keyof Detections]]>)
    .filter(([, r]) => r.detected)
    .flatMap(([k, r]) => r.reasons.map((reason) => `${RULE_LABEL[k]}: ${reason}`))

  const hasInput =
    signals.behavioral.keystroke.dwells.length > 0 ||
    signals.behavioral.mouse.pathLength > 0 ||
    signals.behavioral.paste.charCount > 0 ||
    signals.behavioral.scroll.depths.length > 0

  if (!hasInput && fired.length === 0) return baseAnalyzing()

  if (fired.length === 0) {
    // Compute a "richness" confidence — more activity = higher confidence
    const activity =
      signals.behavioral.keystroke.dwells.length +
      Math.min(signals.behavioral.mouse.pathLength, 60) / 2 +
      signals.behavioral.scroll.depths.length * 3 +
      signals.behavioral.paste.pasteCount * 2
    const confidence = Math.min(98, 55 + activity)
    return {
      kind: 'human',
      label: 'Looks human',
      shortLabel: SHORT_LABEL.human,
      description: DESCRIPTION.human,
      confidence: Math.round(confidence),
      tone: 'green',
      firedRules: [],
      reasons: [],
    }
  }

  if (fired.length >= 2) {
    return {
      kind: 'multiple',
      label: 'Bot detected',
      shortLabel: SHORT_LABEL.multiple,
      description: DESCRIPTION.multiple,
      confidence: 95,
      tone: 'red',
      firedRules: fired,
      reasons,
    }
  }

  // Exactly one rule fired
  const only = fired[0]!
  const kind = SUBKIND_FOR[only]
  const severity = detections[only].severity
  const confidence = severity === 'high' ? 88 : severity === 'medium' ? 76 : 64
  return {
    kind,
    label: 'Bot detected',
    shortLabel: SHORT_LABEL[kind],
    description: DESCRIPTION[kind],
    confidence,
    tone: 'red',
    firedRules: fired,
    reasons,
  }
}

function baseAnalyzing(): Verdict {
  return {
    kind: 'analyzing',
    label: 'Analyzing…',
    shortLabel: SHORT_LABEL.analyzing,
    description: DESCRIPTION.analyzing,
    confidence: 0,
    tone: 'slate',
    firedRules: [],
    reasons: [],
  }
}
