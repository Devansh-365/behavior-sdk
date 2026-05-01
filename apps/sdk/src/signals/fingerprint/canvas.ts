import type { CanvasSignals } from '../../types'

export function collectCanvasSignal(): CanvasSignals {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 60
    const ctx = canvas.getContext('2d')

    // Explicit null guard — do not use non-null assertion.
    // getContext('2d') returns null in some headless environments.
    if (!ctx) return { hash: '', supported: false }

    ctx.font = 'italic 14px Arial, sans-serif'
    ctx.fillStyle = '#f60'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#069'
    ctx.fillText('BehaviorSDK☃ ❤ fraud-detect', 2, 30)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('BehaviorSDK☃ ❤ fraud-detect', 4, 34)

    return { hash: canvas.toDataURL().slice(-20), supported: true }
  } catch {
    return { hash: '', supported: false }
  }
}
