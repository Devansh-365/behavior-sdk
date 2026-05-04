import { chromium } from 'playwright'
import {
  captureVerdict,
  captureDetections,
  overrideSendBeacon,
} from './capture.js'

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await overrideSendBeacon(page)
  await page.goto('http://localhost:3000/demo')
  await page.waitForSelector('#field-name')

  const beaconOverrideActive = await page.evaluate(() => {
    interface BeaconWindow extends Window {
      __capturedBeacons?: string[]
    }
    return Array.isArray((window as BeaconWindow).__capturedBeacons)
  })
  console.log('Option B — sendBeacon override installed:', beaconOverrideActive)

  await page.close()
  const demoPage = await browser.newPage()

  await demoPage.goto('http://localhost:3000/demo')
  await demoPage.waitForSelector('#field-name')

  await demoPage.type('#field-name', 'Ada Lovelace', { delay: 100 })
  await demoPage.type('#field-message', 'Hello from the benchmark harness.', {
    delay: 100,
  })

  await demoPage.click('button[type="submit"]')

  await demoPage.waitForTimeout(1500)

  const verdict = await captureVerdict(demoPage)
  const detections = await captureDetections(demoPage)

  console.log('Verdict:', verdict)
  console.log('Detections:', detections)

  await browser.close()
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
