import type { ScenarioRunner } from './types.js'
import { naturalMouseMove, randomInt, sleep, typeWithVariance } from './utils.js'

export const calibrationBarePlaywrightHeadful: ScenarioRunner = async (page, groundTruth) => {
  // Natural behavior in headful Playwright.
  // The harness launches with { headless: false }.
  // navigator.webdriver is still true, so isHeadless fires.

  let mouseX = 100
  let mouseY = 100

  const moveToAndClick = async (selector: string) => {
    const box = await page.locator(selector).boundingBox()
    if (!box) return
    const tx = box.x + box.width / 2
    const ty = box.y + box.height / 2
    await naturalMouseMove(page, mouseX, mouseY, tx, ty, 10)
    await page.click(selector)
    mouseX = tx
    mouseY = ty
  }

  await moveToAndClick('#field-name')
  await typeWithVariance(page, 'Headful Playwright', 90, 25)
  await sleep(page, randomInt(400, 800))

  await moveToAndClick('#field-email')
  await typeWithVariance(page, 'headful@example.com', 90, 25)
  // One correction
  await page.keyboard.press('Backspace')
  await sleep(page, randomInt(60, 120))
  await page.keyboard.type('m', { delay: randomInt(60, 120) })
  await sleep(page, randomInt(400, 800))

  await moveToAndClick('#field-message')
  await typeWithVariance(
    page,
    'Even in headful mode, Playwright sets navigator.webdriver to true.',
    90,
    25,
  )

  // Occasional scroll
  await page.mouse.wheel(0, 100)
  await sleep(page, randomInt(200, 400))
  await page.mouse.wheel(0, -50)

  // Natural mouse movement
  for (let i = 0; i < 2; i++) {
    const tx = randomInt(200, 800)
    const ty = randomInt(150, 600)
    await naturalMouseMove(page, mouseX, mouseY, tx, ty, 10)
    mouseX = tx
    mouseY = ty
  }

  await sleep(page, groundTruth.minDurationMs)
}
