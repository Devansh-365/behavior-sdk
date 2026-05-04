import type { ScenarioRunner } from './types.js'
import { randomInt, sleep } from './utils.js'

export const llmRhythmAgent: ScenarioRunner = async (page, groundTruth) => {
  // Machine-speed bursts with uniform timing.
  // Targets isLLMAgent: burst-pause rhythm, click precision, mouse stillness > 70%.

  const bursts = [
    'Hello ',
    'this is ',
    'an agent ',
    'typing in ',
    'rapid bursts ',
    'with pauses ',
    'between each ',
    'segment.',
  ]

  // Click precisely on field center before typing
  await page.locator('#field-message').click()

  for (const burst of bursts) {
    for (const char of burst) {
      await page.keyboard.type(char, { delay: 15 })
    }
    // Pause 1-1.5s between bursts
    await sleep(page, 1000 + randomInt(0, 499))
  }

  // Also fill name/email with similar burst pattern
  await page.locator('#field-name').click()
  for (const char of 'Rhythm Agent') {
    await page.keyboard.type(char, { delay: 15 })
  }

  await page.locator('#field-email').click()
  for (const char of 'rhythm@agent.ai') {
    await page.keyboard.type(char, { delay: 15 })
  }

  // Minimal mouse movement (stillness > 70%)
  await page.mouse.move(200, 200)
  await page.mouse.move(202, 201)
  await page.mouse.move(201, 203)

  await sleep(page, groundTruth.minDurationMs)
}
