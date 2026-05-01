import type { WebGLSignals } from '../../types'

/**
 * WebGL renderer string — exposes the underlying GPU.
 * Headless Chrome typically reports "SwiftShader" (software renderer) here,
 * a strong indicator that detect rules consume in isHeadless.
 */
export function collectWebGLSignal(): WebGLSignals {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
    if (!gl) return { vendor: '', renderer: '', supported: false }

    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    if (!ext) return { vendor: '', renderer: '', supported: true }

    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
    return {
      vendor: typeof vendor === 'string' ? vendor : '',
      renderer: typeof renderer === 'string' ? renderer : '',
      supported: true,
    }
  } catch {
    return { vendor: '', renderer: '', supported: false }
  }
}
