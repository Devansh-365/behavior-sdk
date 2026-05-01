import type { CollectedSignals, DetectionResult } from '../types'

export function detectHeadless(signals: CollectedSignals): DetectionResult {
  const { fingerprint } = signals
  const reasons: string[] = []

  if (fingerprint.webdriver.webdriver)
    reasons.push('navigator.webdriver is true')
  if (fingerprint.webdriver.cdpPresent)
    reasons.push('Chrome DevTools Protocol marker found in window')
  if (fingerprint.webdriver.playwrightPresent)
    reasons.push('Playwright marker found in window')
  if (!fingerprint.iframe.consistent)
    reasons.push(
      `iframe plugin count mismatch (parent: ${fingerprint.iframe.parentPluginCount}, iframe: ${fingerprint.iframe.iframePluginCount})`
    )

  // WebGL renderer string — headless Chrome falls back to SwiftShader (software
  // renderer) when no GPU is available. Real browsers report the actual GPU.
  const renderer = fingerprint.webgl.renderer.toLowerCase()
  if (fingerprint.webgl.supported && renderer.includes('swiftshader'))
    reasons.push('WebGL using SwiftShader software renderer (typical of headless Chrome)')
  if (fingerprint.webgl.supported && renderer.includes('llvmpipe'))
    reasons.push('WebGL using LLVM pipe software renderer (typical of containerized browsers)')

  return {
    detected: reasons.length > 0,
    severity: reasons.length >= 2 ? 'high' : 'medium',
    reasons,
  }
}
