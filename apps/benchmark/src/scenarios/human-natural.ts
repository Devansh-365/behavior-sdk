import type { ScenarioRunner } from './types.js'
import { getElementCenter, naturalMouseMove, randomInt, sleep, typeWithVariance } from './utils.js'

export const humanNatural: ScenarioRunner = async (page, groundTruth) => {
  // Natural human-like interaction with variance, corrections, scrolling, and curved mouse.
  // Expected verdict: Human (no rules fire).

  let mouseX = 100
  let mouseY = 100

  // --- Name field ---
  const nameCenter = await getElementCenter(page, '#field-name')
  await naturalMouseMove(page, mouseX, mouseY, nameCenter.x, nameCenter.y, 12)
  await page.click('#field-name')
  mouseX = nameCenter.x
  mouseY = nameCenter.y

  await typeWithVariance(page, 'Jane Smith', 100, 30)
  await sleep(page, randomInt(500, 1500))

  // --- Email field with typo correction ---
  const emailCenter = await getElementCenter(page, '#field-email')
  await naturalMouseMove(page, mouseX, mouseY, emailCenter.x, emailCenter.y, 12)
  await page.click('#field-email')
  mouseX = emailCenter.x
  mouseY = emailCenter.y

  await typeWithVariance(page, 'jane@exampel.com', 90, 25)
  // Correct typo: backspace 4 chars then type ".com"
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Backspace')
    await sleep(page, randomInt(60, 120))
  }
  await typeWithVariance(page, '.com', 90, 25)
  await sleep(page, randomInt(500, 1500))

  // --- Message field with corrections ---
  const msgCenter = await getElementCenter(page, '#field-message')
  await naturalMouseMove(page, mouseX, mouseY, msgCenter.x, msgCenter.y, 14)
  await page.click('#field-message')
  mouseX = msgCenter.x
  mouseY = msgCenter.y

  await typeWithVariance(
    page,
    'I would like to learn more about your services and how they can help our team grow.',
    95,
    35,
  )
  // Add a small correction
  await page.keyboard.press('Backspace')
  await sleep(page, randomInt(80, 150))
  await page.keyboard.type('.', { delay: randomInt(80, 140) })

  // --- Scroll ---
  await page.mouse.wheel(0, 120)
  await sleep(page, randomInt(200, 400))
  await page.mouse.wheel(0, -120)

  // Extra mouse movement for natural path accumulation
  for (let i = 0; i < 3; i++) {
    const tx = randomInt(200, 800)
    const ty = randomInt(150, 600)
    await naturalMouseMove(page, mouseX, mouseY, tx, ty, 10)
    mouseX = tx
    mouseY = ty
    await sleep(page, randomInt(200, 500))
  }

  await sleep(page, groundTruth.minDurationMs)
}
