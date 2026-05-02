import type { Collector, ClickSignals } from '../../types'

const INTERACTIVE_TAGS = new Set(['input', 'button', 'select', 'textarea', 'a', 'label'])

export function attachClickCollector(target: Document | HTMLElement): Collector<ClickSignals> {
  let count = 0
  let targeted = 0
  const centerOffsets: Array<[number, number]> = []

  function onClick(e: Event): void {
    count++
    const me = e as MouseEvent
    const el = me.target instanceof Element ? me.target : null
    if (!el) return

    // Compute offset from element's bounding box center
    // Playwright element.click() always targets exact center → dx≈0, dy≈0
    // Human clicks land with natural scatter of ±5–20px
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    centerOffsets.push([me.clientX - cx, me.clientY - cy])

    if (INTERACTIVE_TAGS.has(el.tagName.toLowerCase())) targeted++
  }

  target.addEventListener('click', onClick)

  return {
    getSignals: (): ClickSignals => ({
      count,
      centerOffsets: [...centerOffsets],
      targeted,
    }),
    detach: (): void => target.removeEventListener('click', onClick),
  }
}
