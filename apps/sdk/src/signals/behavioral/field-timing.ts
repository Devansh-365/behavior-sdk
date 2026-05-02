import type { Collector, FieldTimingSignals } from '../../types'

// A field filled with content in under 100ms was almost certainly pasted or set
// programmatically — no human focus→type→blur cycle can complete that fast.
const INSTANT_FILL_MS = 100

const FIELD_TAGS = new Set(['input', 'textarea', 'select'])

export function attachFieldTimingCollector(target: HTMLElement): Collector<FieldTimingSignals> {
  const fieldDwells = new Map<string, number[]>()
  let instantFills = 0

  let focusedKey: string | null = null
  let focusedAt = 0
  let valueAtFocus = 0

  function fieldKey(el: HTMLElement): string | null {
    if (!FIELD_TAGS.has(el.tagName.toLowerCase())) return null
    const input = el as HTMLInputElement
    return input.name || input.id || `${el.tagName.toLowerCase()}[${input.type ?? ''}]`
  }

  function onFocusin(e: FocusEvent): void {
    const key = fieldKey(e.target as HTMLElement)
    if (key === null) return
    focusedKey = key
    focusedAt = performance.now()
    valueAtFocus = (e.target as HTMLInputElement).value?.length ?? 0
  }

  function onFocusout(e: FocusEvent): void {
    if (focusedKey === null) return
    const dwell = Math.round(performance.now() - focusedAt)
    const arr = fieldDwells.get(focusedKey) ?? []
    arr.push(dwell)
    fieldDwells.set(focusedKey, arr)
    const newLength = (e.target as HTMLInputElement).value?.length ?? 0
    if (valueAtFocus === 0 && newLength > 0 && dwell < INSTANT_FILL_MS) instantFills++
    focusedKey = null
  }

  target.addEventListener('focusin', onFocusin)
  target.addEventListener('focusout', onFocusout)

  return {
    getSignals: (): FieldTimingSignals => ({
      fieldDwells: Object.fromEntries(fieldDwells),
      instantFills,
      totalFields: fieldDwells.size,
    }),
    detach: (): void => {
      target.removeEventListener('focusin', onFocusin)
      target.removeEventListener('focusout', onFocusout)
    },
  }
}
