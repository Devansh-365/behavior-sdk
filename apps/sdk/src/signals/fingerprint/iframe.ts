import type { IframeSignals } from '../../types'

export function collectIframeSignal(): IframeSignals {
  try {
    const f = document.createElement('iframe')
    f.style.cssText = 'display:none;position:absolute;top:-9999px'
    document.body.appendChild(f)

    const parentCount = navigator.plugins.length
    const iframeCount = f.contentWindow?.navigator.plugins.length ?? -1

    document.body.removeChild(f)

    return {
      consistent: parentCount === iframeCount,
      parentPluginCount: parentCount,
      iframePluginCount: iframeCount,
    }
  } catch {
    // If iframe creation fails, treat as inconsistent (conservative default)
    return { consistent: false, parentPluginCount: 0, iframePluginCount: -1 }
  }
}
