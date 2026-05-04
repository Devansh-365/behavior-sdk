import type { ScenarioRunner } from './types.js'
import { randomInt, sleep, typeWithVariance } from './utils.js'

export const llmHybrid: ScenarioRunner = async (page, groundTruth) => {
  // Mixed typing and pasting. PasteRatio > 0.5 overall.
  // Targets isLLMAgent: paste-heavy + uniform rhythm.

  // Type a few characters into name field naturally
  await page.locator('#field-name').click()
  await typeWithVariance(page, 'LLM ', 80, 25)

  // Paste a long email
  const email = 'hybrid-language-model-agent@artificial-intelligence-example.com'
  await page.evaluate((text: string) => {
    const el = document.querySelector('#field-email') as HTMLInputElement | null
    if (!el) return
    el.focus()
    const dt = new DataTransfer()
    dt.setData('text/plain', text)
    el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }))
    el.value = text
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, email)

  // Type a few chars into message, then paste the rest
  await page.locator('#field-message').click()
  await typeWithVariance(page, 'I am ', 80, 25)

  const restOfMessage =
    'an advanced language model capable of generating coherent text. This portion was pasted to simulate rapid content insertion typical of LLM agents operating browser automation.'
  await page.evaluate((text: string) => {
    const el = document.querySelector('#field-message') as HTMLTextAreaElement | null
    if (!el) return
    const current = el.value
    el.focus()
    const dt = new DataTransfer()
    dt.setData('text/plain', text)
    el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }))
    el.value = current + text
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, restOfMessage)

  // Minimal corrections: one backspace
  await page.keyboard.press('Backspace')
  await page.keyboard.type('.', { delay: randomInt(60, 100) })

  await sleep(page, groundTruth.minDurationMs)
}
