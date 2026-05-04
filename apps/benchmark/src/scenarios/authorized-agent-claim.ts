import type { ScenarioRunner } from './types.js'
import { randomInt, sleep, typeWithVariance } from './utils.js'

export const authorizedAgentClaim: ScenarioRunner = async (page, groundTruth) => {
  // The harness injects window.__nyasaAgentSignature before page load.
  // This scenario performs natural typing; the signature triggers isAuthorizedAgent.

  await page.locator('#field-name').click()
  await typeWithVariance(page, 'Authorized Agent', 90, 25)
  await sleep(page, randomInt(400, 800))

  await page.locator('#field-email').click()
  await typeWithVariance(page, 'agent@authorized.org', 90, 25)
  await sleep(page, randomInt(400, 800))

  await page.locator('#field-message').click()
  await typeWithVariance(
    page,
    'I am an authorized agent with a valid signature injected before scanner attachment.',
    90,
    25,
  )

  await sleep(page, groundTruth.minDurationMs)
}
