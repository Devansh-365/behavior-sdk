import type { ScenarioRunner } from './types.js'
import { sleep, typeWithVariance } from './utils.js'

export const botUploadAutomation: ScenarioRunner = async (page, groundTruth) => {
  // Fill text fields normally to avoid isScripted triggers.
  // Programmatic file attach — triggers isUploadAutomation.

  await page.mouse.move(150, 150)
  await page.mouse.move(300, 300)

  await page.locator('#field-name').click()
  await typeWithVariance(page, 'Uploader Bot', 100, 30)

  await page.locator('#field-email').click()
  await typeWithVariance(page, 'uploader@example.com', 100, 30)

  await page.locator('#field-message').click()
  await typeWithVariance(
    page,
    'Please find my supporting document attached via programmatic automation.',
    100,
    30,
  )

  // Programmatically set files — no picker, no drag-drop.
  // The upload collector polls every 500ms. Wait >= 500ms for detection.
  await page.evaluate(() => {
    const docInput = document.querySelector('#field-doc') as HTMLInputElement | null
    if (!docInput) return
    const dt = new DataTransfer()
    dt.items.add(new File(['pdf content'], 'test.pdf', { type: 'application/pdf' }))
    docInput.files = dt.files
  })
  await sleep(page, 600)

  await sleep(page, groundTruth.minDurationMs)
}
