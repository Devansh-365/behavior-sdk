import type { Collector, PasteSignals } from '../../types'

export function attachPasteCollector(target: HTMLElement): Collector<PasteSignals> {
  let pasteCount = 0
  let typedChars = 0
  let pastedChars = 0

  function onPaste(e: ClipboardEvent): void {
    pasteCount++
    pastedChars += e.clipboardData?.getData('text/plain').length ?? 0
  }

  function onKeyUp(e: KeyboardEvent): void {
    if (e.key.length === 1) typedChars++ // printable characters only
  }

  target.addEventListener('paste', onPaste)
  target.addEventListener('keyup', onKeyUp)

  return {
    getSignals: (): PasteSignals => {
      const charCount = typedChars + pastedChars
      return {
        pasteRatio: charCount > 0 ? pastedChars / charCount : 0,
        pasteCount,
        charCount,
      }
    },
    detach: (): void => {
      target.removeEventListener('paste', onPaste)
      target.removeEventListener('keyup', onKeyUp)
    },
  }
}
