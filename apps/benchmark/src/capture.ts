import type { Page } from 'playwright'

export interface CapturedVerdict {
  verdictKind: string
  confidence: number
  badges: string[]
}

export interface CapturedDetection {
  detected: boolean
  severity: string
  reasons: string[]
}

export type CapturedDetections = Record<string, CapturedDetection>

const DISPLAY_LABEL_TO_RULE: Record<string, string> = {
  'Headless Browser': 'isHeadless',
  'Scripted Bot': 'isScripted',
  'LLM Agent': 'isLLMAgent',
  'Upload Automation': 'isUploadAutomation',
  'Multimodal Bot': 'isMultimodalBot',
  'Authorized Agent': 'isAuthorizedAgent',
}

/**
 * Capture the verdict displayed in the demo page's VerdictCard.
 *
 * Scrapes the DOM after submission to extract the verdict kind, confidence
 * (0-100 as shown in the UI), and reason strings (returned as badges).
 *
 * Caveats:
 * - The demo uses computeVerdict() which returns a different Verdict shape
 *   than the SDK's deriveVerdict(). Confidence is 0-100 (not 0-1).
 * - Playwright sets navigator.webdriver=true, so isHeadless fires in ALL
 *   Playwright-run scenarios.
 */
export async function captureVerdict(page: Page): Promise<CapturedVerdict> {
  return page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section'))
    const verdictSection = sections.find((s) => {
      const spans = Array.from(s.querySelectorAll('span'))
      return spans.some((span) => {
        const text = span.textContent?.trim() ?? ''
        return text === 'Verdict' || text === 'Status'
      })
    })

    if (!verdictSection) {
      return { verdictKind: 'Unknown', confidence: 0, badges: [] }
    }

    const h2 = verdictSection.querySelector('h2')
    const verdictKind = h2?.textContent?.trim() ?? 'Unknown'

    const textContent = verdictSection.textContent ?? ''
    const confidenceMatch = textContent.match(/(\d+)\s*\/\s*100/)
    const confidence =
      confidenceMatch?.[1] !== undefined
        ? parseInt(confidenceMatch[1], 10)
        : 0

    const badges: string[] = []
    const ul = verdictSection.querySelector('ul')
    if (ul) {
      const items = Array.from(ul.querySelectorAll('li'))
      for (const li of items) {
        const text = li.textContent?.trim()
        if (text) badges.push(text)
      }
    }

    return { verdictKind, confidence, badges }
  })
}

/**
 * Capture per-rule detection results from the demo page's DetectionsCard.
 *
 * Scrapes each detection row for its title, status (clear / severity),
 * and any listed reasons.
 */
export async function captureDetections(
  page: Page,
): Promise<CapturedDetections> {
  return page.evaluate((labelMap) => {
    const detections: Record<string, CapturedDetection> = {}

    const sections = Array.from(document.querySelectorAll('section'))
    const detectionsSection = sections.find((s) => {
      const h3 = s.querySelector('h3')
      return h3?.textContent?.trim().includes('Detections') ?? false
    })

    if (!detectionsSection) return detections

    const titleEls = detectionsSection.querySelectorAll('div.text-sm.font-medium')
    for (const titleEl of Array.from(titleEls)) {
      const row = titleEl.closest('div.rounded-lg')
      if (!row) continue

      const title = titleEl.textContent?.trim() ?? ''
      if (!title) continue

      const ruleKey = labelMap[title] ?? title

      // The status badge is the last span.rounded-full in the row.
      // The first one is a dot indicator (no text) — we must skip it.
      const badgeEls = row.querySelectorAll('span.rounded-full')
      const statusEl = badgeEls.length >= 2 ? badgeEls[badgeEls.length - 1] : badgeEls[0]
      const statusText = statusEl?.textContent?.trim().toLowerCase() ?? 'clear'
      const detected = statusText !== 'clear'
      const severity = detected ? statusText : 'none'

      const reasons: string[] = []
      const ul = row.querySelector('ul')
      if (ul) {
        const items = Array.from(ul.querySelectorAll('li'))
        for (const li of items) {
          const text = li.textContent?.trim().replace(/^>\s*/, '')
          if (text) reasons.push(text)
        }
      }

      detections[ruleKey] = { detected, severity, reasons }
    }

    return detections
  }, DISPLAY_LABEL_TO_RULE)
}

/**
 * Option B: Override navigator.sendBeacon before page load so that
 * collect()-based pages can have their payloads intercepted.
 *
 * For the demo page this override will not fire (the demo uses
 * BehaviorScanner directly, not collect()), but it is useful for
 * testing production-like integrations.
 */
export async function overrideSendBeacon(page: Page): Promise<void> {
  await page.addInitScript(() => {
    interface BeaconWindow extends Window {
      __capturedBeacons?: string[]
    }

    const captured: string[] = []
    ;(window as BeaconWindow).__capturedBeacons = captured

    const originalSendBeacon = navigator.sendBeacon.bind(navigator)
    navigator.sendBeacon = (
      url: string | URL,
      data?: BodyInit | null,
    ): boolean => {
      let payload = ''
      if (typeof data === 'string') {
        payload = data
      } else if (data instanceof Blob) {
        payload = '[Blob]'
      }
      captured.push(`${String(url)}|${payload}`)
      return originalSendBeacon(url, data)
    }
  })
}
