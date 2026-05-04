import type { ScenarioRunner } from './types.js'
import { sleep } from './utils.js'

export const llmPasteHeavy: ScenarioRunner = async (page, groundTruth) => {
  // All fields filled via simulated paste events.
  // Targets isLLMAgent: pasteRatio > 0.8, no scroll, minimal mouse stillness > 70%.

  const name = 'Large pasted name block that was copied from somewhere else entirely'
  const email = 'agent-8472@large-language-model.example.com'
  const message =
    'This entire message was pasted in one single action. No keystrokes were typed individually. The content is long enough to ensure charCount exceeds thresholds and pasteRatio dominates.'

  // Use string-based evaluate to avoid tsx __name transpilation issue
  await page.evaluate(`
    (function() {
      const pasteInto = function(selector, text) {
        const el = document.querySelector(selector)
        if (!el) return
        el.focus()
        const dt = new DataTransfer()
        dt.setData('text/plain', text)
        el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }))
        el.value = text
        el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }

      pasteInto('#field-name', ${JSON.stringify(name)})
      pasteInto('#field-email', ${JSON.stringify(email)})
      pasteInto('#field-message', ${JSON.stringify(message)})
    })()
  `)

  // Minimal mouse movement (3-5 small moves, stillness > 70%)
  await page.mouse.move(100, 100)
  await page.mouse.move(105, 102)
  await page.mouse.move(103, 108)
  await page.mouse.move(107, 105)

  // NO scroll events

  await sleep(page, groundTruth.minDurationMs)
}
