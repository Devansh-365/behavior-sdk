import type { ScenarioRunner } from './types.js'
import { sleep } from './utils.js'

export const botStealthProgrammatic: ScenarioRunner = async (page, groundTruth) => {
  // NO mouse movement — triggers isScripted "no pointer activity" signal.
  // Multiple programmatic input events with empty inputType — triggers "programmatic > 5".
  // Programmatic file attach — triggers isUploadAutomation.

  // Dispatch programmatic input events per character to accumulate count > 5
  const fields: Array<{ selector: string; value: string }> = [
    { selector: '#field-name', value: 'Stealth Bot' },
    { selector: '#field-email', value: 'stealth@example.com' },
    {
      selector: '#field-message',
      value: 'This was injected via programmatic dispatchEvent calls with no real user interaction.',
    },
  ]

  for (const { selector, value } of fields) {
    await page.locator(selector).click()
    // Dispatch one programmatic event per character to accumulate count
    for (const _char of value) {
      await page.evaluate(
        ({ sel }: { sel: string }) => {
          const el = document.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement | null
          if (!el) return
          el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: '' }))
        },
        { sel: selector },
      )
    }
  }

  // Attach file programmatically, then wait for upload collector poll (500ms interval)
  await page.evaluate(() => {
    const docInput = document.querySelector('#field-doc') as HTMLInputElement | null
    if (!docInput) return
    const dt = new DataTransfer()
    dt.items.add(new File(['pdf content'], 'document.pdf', { type: 'application/pdf' }))
    docInput.files = dt.files
  })
  await sleep(page, 600)

  await sleep(page, groundTruth.minDurationMs)
}
