import type { ScenarioRunner } from './types.js'
import { randomInt, sleep } from './utils.js'

export const botHeadlessChrome: ScenarioRunner = async (page, groundTruth) => {
  // Raw headless Playwright Chrome — navigator.webdriver=true and SwiftShader
  // fire isHeadless automatically. No stealth tricks.

  const name = 'Alex Johnson'
  const email = 'alex@example.com'
  const message =
    'Hello, I am interested in learning more about your product and how it can help our team.'

  // field-name with random 80-150ms delays
  await page.locator('#field-name').click()
  for (const char of name) {
    await page.keyboard.type(char, { delay: randomInt(80, 150) })
  }

  // field-email filled normally
  await page.locator('#field-email').click()
  for (const char of email) {
    await page.keyboard.type(char, { delay: randomInt(80, 150) })
  }

  // field-message with random 80-150ms delays
  await page.locator('#field-message').click()
  for (const char of message) {
    await page.keyboard.type(char, { delay: randomInt(80, 150) })
  }

  await sleep(page, groundTruth.minDurationMs)
}
