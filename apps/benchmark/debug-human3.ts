import { chromium } from 'playwright'
import { humanNatural } from './src/scenarios/human-natural.js'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

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
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)

  // Access the scanner through the React app's global
  const scannerInfo = await page.evaluate(() => {
    // Try to find the scanner instance through React devtools or DOM
    const anyWindow = window as any

    // The demo page might expose scanner on a ref; try to find it
    // Look for any object with buildPayload method
    for (const key of Object.keys(anyWindow)) {
      const val = anyWindow[key]
      if (val && typeof val.buildPayload === 'function') {
        try {
          const payload = val.buildPayload('debug-session')
          return {
            found: true,
            key,
            detections: payload?.detections,
            signals: payload?.signals,
          }
        } catch (e) {
          return { found: true, key, error: String(e) }
        }
      }
    }

    // Alternative: look for React root and traverse
    const roots = (anyWindow as any).__REACT_ROOTS__ || []
    return { found: false, keys: Object.keys(anyWindow).filter(k => k.includes('nyasa') || k.includes('scanner')).slice(0, 10) }
  })

  console.log('Scanner info:', JSON.stringify(scannerInfo, null, 2))

  await browser.close()
}

main().catch(console.error)
