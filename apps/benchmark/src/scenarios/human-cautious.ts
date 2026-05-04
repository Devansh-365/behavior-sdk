import type { ScenarioRunner } from './types.js'
import { naturalMouseMove, randomInt, sleep } from './utils.js'

export const humanCautious: ScenarioRunner = async (page, groundTruth) => {
  // Slow, deliberate typer with many corrections. Expected verdict: Human.

  let mouseX = 100
  let mouseY = 100

  const moveToAndClick = async (selector: string) => {
    const box = await page.locator(selector).boundingBox()
    if (!box) return
    const tx = box.x + box.width / 2
    const ty = box.y + box.height / 2
    await naturalMouseMove(page, mouseX, mouseY, tx, ty, 14)
    await page.click(selector)
    mouseX = tx
    mouseY = ty
  }

  const typeWithCorrections = async (text: string) => {
    let output = ''
    for (const char of text) {
      if (output.length > 0 && output.length % randomInt(5, 8) === 0 && char !== ' ') {
        const wrongChar = String.fromCharCode(char.charCodeAt(0) + 1)
        await page.keyboard.type(wrongChar, { delay: randomInt(100, 250) })
        await sleep(page, randomInt(150, 300))
        await page.keyboard.press('Backspace')
        await sleep(page, randomInt(150, 300))
      }
      await page.keyboard.type(char, { delay: randomInt(100, 250) })
      output += char
    }
  }

  await moveToAndClick('#field-name')
  await typeWithCorrections('Cautious User')
  await sleep(page, randomInt(1000, 3000))

  await moveToAndClick('#field-email')
  await typeWithCorrections('cautious@example.com')
  await sleep(page, randomInt(1000, 3000))

  await moveToAndClick('#field-message')
  await typeWithCorrections(
    'I prefer to take my time when filling out forms to ensure everything is correct.',
  )

  // Generous scrolling
  await page.mouse.wheel(0, 150)
  await sleep(page, randomInt(300, 600))
  await page.mouse.wheel(0, -100)
  await sleep(page, randomInt(300, 600))
  await page.mouse.wheel(0, 80)

  // Deliberate mouse movement with pauses
  for (let i = 0; i < 3; i++) {
    const tx = randomInt(200, 800)
    const ty = randomInt(150, 600)
    await naturalMouseMove(page, mouseX, mouseY, tx, ty, 16)
    mouseX = tx
    mouseY = ty
    await sleep(page, randomInt(400, 900))
  }

  await sleep(page, groundTruth.minDurationMs)
}
