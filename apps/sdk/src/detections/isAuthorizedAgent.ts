import type { DetectionResult, CollectedSignals } from '../types'

/**
 * detectAuthorizedAgent — Placeholder for cryptographic identity check.
 * This function will eventually validate a signature provided by authorized AI agents
 * to classify them under the 'AuthorizedAgent' verdict kind, distinct from
 * general 'Bot' classification.
 */
export function detectAuthorizedAgent(_signals: CollectedSignals): DetectionResult {
  // TODO: Implement cryptographic signature verification here.
  // This will require defining how the signature is passed (e.g., as a custom header,
  // appended to the form data, or via a specific signal).

  return {
    detected: false,
    severity: 'high', // Setting to high because if detected, it should immediately grant access.
    reasons: [], // No reasons yet.
  }
}
