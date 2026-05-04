import type { ScenarioRunner } from './types.js'
import { sleep } from './utils.js'

export const botScriptedUniform: ScenarioRunner = async (page, groundTruth) => {
  // Uniform 50ms keystrokes, no mouse movement, no corrections.
  // Targets isScripted: uniform dwell + uniform flight + no pointer + no corrections.

  const name = 'Bot User'
  const email = 'bot@example.com'
  const message =
    'This is a scripted message with perfectly uniform timing between every single keystroke.'

  await page.locator('#field-name').click()
  await page.keyboard.type(name, { delay: 50 })

  await page.locator('#field-email').click()
  await page.keyboard.type(email, { delay: 50 })

  await page.locator('#field-message').click()
  await page.keyboard.type(message, { delay: 50 })

  await sleep(page, groundTruth.minDurationMs)
}
