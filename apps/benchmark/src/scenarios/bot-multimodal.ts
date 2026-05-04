import type { ScenarioRunner } from './types.js'
import { getElementCenter, naturalMouseMove, randomInt, sleep } from './utils.js'

export const botMultimodal: ScenarioRunner = async (page, groundTruth) => {
  // Natural mouse movement + instant fills + precise clicks.
  // Targets isMultimodalBot: natural curves but machine-precise clicks and instant fills.

  // Start mouse at a neutral position
  await page.mouse.move(100, 100)

  const fields = ['#field-name', '#field-email', '#field-message']
  let currentX = 100
  let currentY = 100

  // 8+ mouse movements with natural curves between fields and random points
  for (let i = 0; i < 8; i++) {
    const targetX = randomInt(200, 800)
    const targetY = randomInt(150, 600)
    await naturalMouseMove(page, currentX, currentY, targetX, targetY, 14)
    currentX = targetX
    currentY = targetY
  }

  // Click precisely on field centers (Playwright .click() hits exact center)
  for (const selector of fields) {
    const center = await getElementCenter(page, selector)
    await naturalMouseMove(page, currentX, currentY, center.x, center.y, 10)
    await page.click(selector)
    currentX = center.x
    currentY = center.y

    // Instant fill — dwell < 100ms, no per-keystroke events
    if (selector === '#field-name') {
      await page.fill(selector, 'Multimodal Bot')
    } else if (selector === '#field-email') {
      await page.fill(selector, 'bot@multimodal.ai')
    } else {
      await page.fill(
        selector,
        'I exhibit natural mouse curves but my fills are instantaneous and my clicks are pixel-perfect.',
      )
    }
  }

  // Additional random mouse movements to accumulate path data
  for (let i = 0; i < 4; i++) {
    const targetX = randomInt(200, 800)
    const targetY = randomInt(150, 600)
    await naturalMouseMove(page, currentX, currentY, targetX, targetY, 14)
    currentX = targetX
    currentY = targetY
  }

  await sleep(page, groundTruth.minDurationMs)
}
