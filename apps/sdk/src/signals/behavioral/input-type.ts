import type { Collector, InputTypeSignals } from '../../types'

export function attachInputTypeCollector(target: HTMLElement): Collector<InputTypeSignals> {
  let typed = 0
  let pasted = 0
  let dropped = 0
  let deleted = 0
  let programmatic = 0

  function onInput(e: Event): void {
    const inputType = (e as InputEvent).inputType ?? ''
    if (inputType === 'insertText' || inputType === 'insertReplacementText') {
      typed++
    } else if (inputType === 'insertFromPaste' || inputType === 'insertFromPasteAsQuotation') {
      pasted++
    } else if (inputType === 'insertFromDrop') {
      dropped++
    } else if (inputType.startsWith('deleteContent')) {
      deleted++
    } else {
      // empty string = programmatically dispatched InputEvent (no real user action)
      programmatic++
    }
  }

  target.addEventListener('input', onInput)

  return {
    getSignals: (): InputTypeSignals => ({ typed, pasted, dropped, deleted, programmatic }),
    detach: (): void => { target.removeEventListener('input', onInput) },
  }
}
