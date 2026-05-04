import type { Page } from 'playwright'

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function sleep(page: Page, ms: number): Promise<void> {
  await page.waitForTimeout(ms)
}

export async function getElementCenter(
  page: Page,
  selector: string,
): Promise<{ x: number; y: number }> {
  const box = await page.locator(selector).boundingBox()
  if (!box) {
    throw new Error(`Element ${selector} not found`)
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

function bezierPoints(
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  steps: number,
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x2
    const y = mt * mt * y0 + 2 * mt * t * cy + t * t * y2
    points.push({ x, y })
  }
  return points
}

export async function naturalMouseMove(
  page: Page,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  steps = 12,
): Promise<void> {
  const offset = randomInt(40, 120)
  const cx = (fromX + toX) / 2 + (Math.random() > 0.5 ? offset : -offset)
  const cy = (fromY + toY) / 2 + (Math.random() > 0.5 ? offset : -offset)
  const points = bezierPoints(fromX, fromY, cx, cy, toX, toY, steps)
  for (const point of points.slice(1)) {
    await page.mouse.move(point.x, point.y)
    await page.waitForTimeout(randomInt(4, 12))
  }
}

export async function typeWithVariance(
  page: Page,
  text: string,
  baseDelay: number,
  jitter: number,
): Promise<void> {
  for (const char of text) {
    const delay = randomInt(baseDelay - jitter, baseDelay + jitter)
    await page.keyboard.type(char, { delay: Math.max(5, delay) })
  }
}
