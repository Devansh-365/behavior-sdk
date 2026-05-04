import type { ScenarioRunner } from './types.js'
import { sleep } from './utils.js'

export const botStealthProgrammatic: ScenarioRunner = async (page, groundTruth) => {
  // Programmatic input via dispatchEvent with empty inputType.
  // Triggers isScripted (programmatic input > 5 with no known origin)
  // and isUploadAutomation (programmatic file attach).
  // NO mouse movement.

  // Use string-based evaluate to avoid tsx __name transpilation issue
  await page.evaluate(`
    (function() {
      const setInputValue = function(selector, value) {
        const el = document.querySelector(selector)
        if (!el) return
        el.focus()
        el.value = value
        el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: '' }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }

      setInputValue('#field-name', 'Stealth Bot')
      setInputValue('#field-email', 'stealth@example.com')
      setInputValue('#field-message', 'This text was injected programmatically via dispatchEvent without any keyboard interaction.')

      const docInput = document.querySelector('#field-doc')
      if (docInput) {
        const dt = new DataTransfer()
        dt.items.add(new File(['pdf content'], 'document.pdf', { type: 'application/pdf' }))
        docInput.files = dt.files
        docInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })()
  `)

  await sleep(page, groundTruth.minDurationMs)
}
