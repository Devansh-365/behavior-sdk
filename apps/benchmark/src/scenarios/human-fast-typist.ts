import type { ScenarioRunner } from './types.js'
import { naturalMouseMove, randomInt, sleep, typeWithVariance } from './utils.js'

export const humanFastTypist: ScenarioRunner = async (page, groundTruth) => {
  // Fast but still organic. Expected verdict: Human.

  let mouseX = 100
  let mouseY = 100

  const moveToAndClick = async (selector: string) => {
    const box = await page.locator(selector).boundingBox()
    if (!box) return
    const tx = box.x + box.width / 2
    const ty = box.y + box.height / 2
    await naturalMouseMove(page, mouseX, mouseY, tx, ty, 8)
    await page.click(selector)
    mouseX = tx
    mouseY = ty
  }

  await moveToAndClick('#field-name')
  await typeWithVariance(page, 'Fast Typer', 55, 20)
  await sleep(page, randomInt(300, 700))

  await moveToAndClick('#field-email')
  await typeWithVariance(page, 'fast@example.com', 55, 20)
  // One small correction
  await page.keyboard.press('Backspace')
  await sleep(page, randomInt(40, 80))
  await page.keyboard.type('m', { delay: randomInt(40, 80) })
  await sleep(page, randomInt(300, 700))

  await moveToAndClick('#field-message')
  await typeWithVariance(
    page,
    'I type quickly but still make occasional mistakes and correct them.',
    55,
    20,
  )

  // Scroll
  await page.mouse.wheel(0, 100)
  await sleep(page, randomInt(150, 300))
  await page.mouse.wheel(0, -50)

  // Faster mouse movement
  for (let i = 0; i < 2; i++) {
    const tx = randomInt(200, 800)
    const ty = randomInt(150, 600)
    await naturalMouseMove(page, mouseX, mouseY, tx, ty, 6)
    mouseX = tx
    mouseY = ty
  }

  await sleep(page, groundTruth.minDurationMs)
}
