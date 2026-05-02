import type { Collector, UploadSignals } from '../../types'

export function attachUploadCollector(target: HTMLElement): Collector<UploadSignals> {
  let pickerCount = 0
  let dragDropCount = 0
  let programmaticCount = 0

  // Track last-known file count per input to detect programmatic changes
  const knownCounts = new WeakMap<HTMLInputElement, number>()

  function getFileInputs(): HTMLInputElement[] {
    return Array.from(target.querySelectorAll<HTMLInputElement>('input[type="file"]'))
  }

  function totalFiles(): number {
    return getFileInputs().reduce((sum, el) => sum + (el.files?.length ?? 0), 0)
  }

  function onChange(e: Event): void {
    const input = e.target as HTMLInputElement
    if (input.type !== 'file') return
    pickerCount++
    // Record the new count so the poll doesn't double-count it as programmatic
    knownCounts.set(input, input.files?.length ?? 0)
  }

  function onDrop(e: DragEvent): void {
    if ((e.dataTransfer?.files.length ?? 0) > 0) dragDropCount++
  }

  // Poll every 500ms. If any file input's count grew since last tick without
  // a corresponding change event, the file was attached programmatically.
  const pollId = setInterval(() => {
    for (const input of getFileInputs()) {
      const current = input.files?.length ?? 0
      const last = knownCounts.get(input) ?? 0
      if (current > last) {
        programmaticCount++
        knownCounts.set(input, current)
      }
    }
  }, 500)

  target.addEventListener('change', onChange)
  target.addEventListener('drop', onDrop)

  return {
    getSignals: (): UploadSignals => ({
      pickerCount,
      dragDropCount,
      programmaticCount,
      filesAttached: totalFiles(),
    }),
    detach: (): void => {
      clearInterval(pollId)
      target.removeEventListener('change', onChange)
      target.removeEventListener('drop', onDrop)
    },
  }
}
