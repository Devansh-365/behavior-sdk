import type { DetectionResult, CollectedSignals } from '../types'

/** Signature format prefixes the SDK recognizes. Server performs crypto validation. */
const KNOWN_FORMATS = ['v1:'] as const

/** Reads an agent signature claim from the two supported client-side channels. */
function readAgentSignature(): string | null {
  // Channel 1: JS global set by the automation layer before page scripts run
  const win = window as typeof window & { __nyasaAgentSignature?: unknown }
  if (typeof win.__nyasaAgentSignature === 'string' && win.__nyasaAgentSignature.length > 0)
    return win.__nyasaAgentSignature

  // Channel 2: meta tag injected by a server-rendered agent identity header
  const meta = document.querySelector<HTMLMetaElement>('meta[name="x-agent-signature"]')
  if (meta?.content && meta.content.length > 0)
    return meta.content

  return null
}

export function detectAuthorizedAgent(_signals: CollectedSignals): DetectionResult {
  const signature = readAgentSignature()

  if (signature === null)
    return { detected: false, severity: 'high', reasons: [] }

  const hasKnownFormat = KNOWN_FORMATS.some(prefix => signature.startsWith(prefix))
  if (!hasKnownFormat) {
    return {
      detected: false,
      severity: 'high',
      reasons: [`unrecognized agent signature format: ${signature.substring(0, 20)}…`],
    }
  }

  return {
    detected: true,
    severity: 'high',
    // Full signature included so the server can perform cryptographic validation.
    // It is not a secret — public-key signatures are designed to be transmitted.
    reasons: [`agent-sig: ${signature}`],
  }
}
