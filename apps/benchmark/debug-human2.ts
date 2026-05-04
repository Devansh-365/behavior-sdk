import { chromium } from 'playwright'
import { humanNatural } from './src/scenarios/human-natural.js'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Intercept buildPayload to log raw detections
  await page.addInitScript(() => {
    const orig = (window as any).BehaviorScanner?.prototype?.buildPayload
    if (orig) {
      (window as any).BehaviorScanner.prototype.buildPayload = function(...args: any[]) {
        const payload = orig.apply(this, args)
        ;(window as any).__nyasaDebugPayload = payload
        console.log('NYASA PAYLOAD:', JSON.stringify(payload, null, 2))
        return payload
      }
    }
  })

  await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle' })
  await page.waitForSelector('#field-name')

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

  // Listen for console logs
  const logs: string[] = []
  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('NYASA PAYLOAD')) logs.push(text)
  })

  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)

  console.log('Logs captured:', logs.length)
  for (const log of logs) console.log(log.substring(0, 2000))

  // Also try to get payload from window
  const payload = await page.evaluate(() => (window as any).__nyasaDebugPayload)
  console.log('Window payload:', payload ? 'found' : 'not found')
  if (payload) {
    console.log('Detections:', JSON.stringify(payload.detections, null, 2))
  }

  await browser.close()
}

main().catch(console.error)
