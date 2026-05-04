import type { ScenarioRunner } from './types.js'
import { sleep } from './utils.js'

export const calibrationNearMissScripted: ScenarioRunner = async (page, groundTruth) => {
  // Fast typing with occasional corrections. Near-miss for isScripted.
  // Creates low dwell variance + some corrections (correctionRatio > 0).
  // No mouse movement, no scroll.

  const text =
    'This is a calibration scenario designed to test the boundary between fast human typing and scripted automation.'

  await page.locator('#field-name').click()
  await page.keyboard.type('Calibration', { delay: 45 })

  await page.locator('#field-email').click()
  await page.keyboard.type('cal@example.com', { delay: 45 })

  await page.locator('#field-message').click()
  let chars = 0
  for (const char of text) {
    await page.keyboard.type(char, { delay: 45 })
    chars++
    // Correction every 10-15 characters
    if (chars % 12 === 0 && char !== ' ') {
      await page.keyboard.press('Backspace')
      await sleep(page, 45)
      await page.keyboard.type(char, { delay: 45 })
    }
  }

  await sleep(page, groundTruth.minDurationMs)
}
