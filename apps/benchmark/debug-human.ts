import { chromium } from 'playwright'
import { humanNatural } from './src/scenarios/human-natural.js'
import { captureVerdict, captureDetections } from './src/capture.js'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle' })
  await page.waitForSelector('#field-name')

  // Run human-natural scenario
  const groundTruth = {
    id: 'human-natural',
    actorType: 'Human' as const,
    expectedVerdict: 'Human' as const,
    expectedFiredRules: [] as string[],
    description: 'Test',
    minDurationMs: 2000,
  }

  await humanNatural(page, groundTruth)
  await page.waitForTimeout(2000)
  await page.click('button[type="submit"]')
  await page.waitForSelector('h2', { timeout: 5000 })
  await page.waitForTimeout(1500)

  // Capture verdict + detections
  const verdict = await captureVerdict(page)
  const detections = await captureDetections(page)

  console.log('Verdict:', verdict)
  console.log('Detections:', JSON.stringify(detections, null, 2))

  // Also grab the raw payload from the page's scanner
  const rawPayload = await page.evaluate(() => {
    // The demo page stores scanner in a ref, but we can try to access window
    return (window as any).__nyasaDebugPayload || null
  })
  console.log('Raw payload available:', !!rawPayload)

  await browser.close()
}

main().catch(console.error)
