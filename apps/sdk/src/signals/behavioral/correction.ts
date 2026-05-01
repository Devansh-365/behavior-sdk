import type { Collector, CorrectionSignals } from '../../types'

export function attachCorrectionCollector(target: HTMLElement): Collector<CorrectionSignals> {
  let backspaceCount = 0
  let deleteCount = 0
  let typedChars = 0

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Backspace') backspaceCount++
    else if (e.key === 'Delete') deleteCount++
  }

  function onKeyUp(e: KeyboardEvent): void {
    if (e.key.length === 1) typedChars++ // printable characters only
  }

  target.addEventListener('keydown', onKeyDown)
  target.addEventListener('keyup', onKeyUp)

  return {
    getSignals: (): CorrectionSignals => ({
      backspaceCount,
      deleteCount,
      correctionRatio: typedChars > 0 ? (backspaceCount + deleteCount) / typedChars : 0,
    }),
    detach: (): void => {
      target.removeEventListener('keydown', onKeyDown)
      target.removeEventListener('keyup', onKeyUp)
    },
  }
}
