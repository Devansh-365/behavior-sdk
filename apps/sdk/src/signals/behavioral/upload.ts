import type { Collector, ExifSignals, UploadSignals } from '../../types'
import { analyzeFileExif } from './exif'

export function attachUploadCollector(target: HTMLElement): Collector<UploadSignals> {
  let pickerCount = 0
  let dragDropCount = 0
  let programmaticCount = 0
  const exifResults: ExifSignals[] = []

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
    knownCounts.set(input, input.files?.length ?? 0)
    // Analyze each newly picked file asynchronously; results land whenever ready
    if (input.files) {
      for (const file of Array.from(input.files)) {
        analyzeFileExif(file).then(result => { exifResults.push(result) })
      }
    }
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
      exifResults: [...exifResults],
    }),
    detach: (): void => {
      clearInterval(pollId)
      target.removeEventListener('change', onChange)
      target.removeEventListener('drop', onDrop)
    },
  }
}
