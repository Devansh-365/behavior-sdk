import type { Collector, ReactionSignals } from '../../types'

/**
 * Reaction-time collector.
 *
 * Measures the delay between a form field receiving focus and the first
 * input event after that focus. Humans are bounded by physiology: even
 * "tab and type" is rarely faster than ~80ms. Sub-50ms is essentially
 * impossible — only a script that calls `input.value = …; dispatchEvent(...)`
 * can hit that range.
 *
 * Tracks two values:
 *   - firstInputDelay — delay from the first focus to the first input
 *   - minInputDelay   — smallest delay observed across all focus→input pairs
 *
 * Detection rules consume `minInputDelay` (strongest single signal).
 */
export function attachReactionCollector(target: HTMLElement): Collector<ReactionSignals> {
  let lastFocusAt: number | null = null
  let firstInputDelay: number | null = null
  let minInputDelay: number | null = null

  function onFocusIn(): void {
    lastFocusAt = performance.now()
  }

  function onInput(): void {
    if (lastFocusAt === null) return // input without prior focus (programmatic; ignore)
    const delay = performance.now() - lastFocusAt
    if (firstInputDelay === null) firstInputDelay = delay
    if (minInputDelay === null || delay < minInputDelay) minInputDelay = delay
    lastFocusAt = null // require a new focus before measuring again
  }

  target.addEventListener('focusin', onFocusIn)
  target.addEventListener('input', onInput)

  return {
    getSignals: (): ReactionSignals => ({ firstInputDelay, minInputDelay }),
    detach: (): void => {
      target.removeEventListener('focusin', onFocusIn)
      target.removeEventListener('input', onInput)
    },
  }
}
