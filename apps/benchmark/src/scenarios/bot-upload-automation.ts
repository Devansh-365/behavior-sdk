import type { ScenarioRunner } from './types.js'
import { sleep, typeWithVariance } from './utils.js'

export const botUploadAutomation: ScenarioRunner = async (page, groundTruth) => {
  // File upload via DataTransfer without clicking the browse button.
  // Triggers isUploadAutomation: programmaticCount > 0, pickerCount = 0, dragDropCount = 0.
  // Fill text fields normally to avoid triggering isScripted via no-pointer.

  const name = 'Uploader Bot'
  const email = 'uploader@example.com'
  const message = 'Please find my supporting document attached via programmatic automation.'

  // Simple mouse move to avoid "no pointer activity"
  await page.mouse.move(150, 150)
  await page.mouse.move(300, 300)

  await page.locator('#field-name').click()
  await typeWithVariance(page, name, 100, 30)

  await page.locator('#field-email').click()
  await typeWithVariance(page, email, 100, 30)

  await page.locator('#field-message').click()
  await typeWithVariance(page, message, 100, 30)

  // Programmatically set files — no picker, no drag-drop
  await page.evaluate(() => {
    const docInput = document.querySelector('#field-doc') as HTMLInputElement | null
    if (!docInput) return
    const dt = new DataTransfer()
    dt.items.add(new File(['pdf content'], 'test.pdf', { type: 'application/pdf' }))
    docInput.files = dt.files
    docInput.dispatchEvent(new Event('change', { bubbles: true }))
  })

  await sleep(page, groundTruth.minDurationMs)
}
