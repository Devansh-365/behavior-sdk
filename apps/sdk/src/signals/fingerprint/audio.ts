import type { AudioSignals } from '../../types'

/**
 * Audio context fingerprint — runs a synthetic oscillator through a compressor
 * in OfflineAudioContext, then hashes a slice of the rendered samples. The result
 * is stable per device and very hard to spoof (depends on the audio implementation,
 * which differs across OS / browser / hardware).
 *
 * Async by nature — pre-warmed on attach() and cached so buildPayload() reads
 * a synchronous result. Returns an empty signal until the render completes.
 */

let cache: AudioSignals | null = null
let pending: Promise<void> | null = null

export function prewarmAudioFingerprint(): void {
  if (cache !== null || pending !== null) return
  pending = computeAudioHash()
    .then((result) => { cache = result })
    .catch(() => { cache = { hash: '', supported: false } })
    .finally(() => { pending = null })
}

export function collectAudioSignal(): AudioSignals {
  return cache ?? { hash: '', supported: false }
}

/** Reset the cache — used by the scanner on detach to free memory. */
export function resetAudioFingerprint(): void {
  cache = null
  pending = null
}

async function computeAudioHash(): Promise<AudioSignals> {
  const Ctx = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext
  if (!Ctx) return { hash: '', supported: false }

  const ctx = new Ctx(1, 44100, 44100)
  const oscillator = ctx.createOscillator()
  oscillator.type = 'triangle'
  oscillator.frequency.value = 10000

  const compressor = ctx.createDynamicsCompressor()
  compressor.threshold.value = -50
  compressor.knee.value = 40
  compressor.ratio.value = 12
  compressor.attack.value = 0
  compressor.release.value = 0.25

  oscillator.connect(compressor)
  compressor.connect(ctx.destination)
  oscillator.start(0)

  const buffer = await ctx.startRendering()
  const samples = buffer.getChannelData(0)

  let sum = 0
  for (let i = 4500; i < 5000; i++) {
    sum += Math.abs(samples[i] ?? 0)
  }
  return { hash: sum.toString(36).slice(0, 20), supported: true }
}
