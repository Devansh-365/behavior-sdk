/**
 * Synthetic actor scenarios.
 *
 * Each scenario fires real DOM events (KeyboardEvent / MouseEvent / ClipboardEvent)
 * that the SDK collectors listen for. The collectors don't filter on `isTrusted`,
 * so dispatched events accumulate into signals just like organic input would.
 *
 * Detection thresholds (from apps/sdk/src/detections/):
 *   isScripted: ≥2 of  no-pointer | curvature variance < 0.05 | dwell var < 2
 *                       | flight var < 5 | paste ratio > 0.9 | zero corrections in >50 chars
 *                       | first input <50ms after focus (reaction time)
 *   isLLMAgent: ≥2 of  paste ratio > 0.8 | no-scroll & charCount > 20
 *                       | <8s & charCount > 40 | flight variance < 10
 */

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// Synthetic event helpers
// ---------------------------------------------------------------------------

function fireKeyPair(
  target: HTMLInputElement | HTMLTextAreaElement,
  ch: string,
  dwellMs: number
): Promise<void> {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }))
  return sleep(dwellMs).then(() => {
    target.value += ch
    target.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }))
    target.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true }))
  })
}

function firePaste(
  target: HTMLInputElement | HTMLTextAreaElement,
  text: string
): void {
  const dt = new DataTransfer()
  dt.setData('text/plain', text)
  const event = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true })
  target.dispatchEvent(event)
  target.value += text
  target.dispatchEvent(new InputEvent('input', { inputType: 'insertFromPaste', bubbles: true }))
}

function fireMouseMove(x: number, y: number): void {
  document.dispatchEvent(
    new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true })
  )
}

function fireScroll(y: number): void {
  window.scrollTo({ top: y, behavior: 'auto' })
  // scroll listener is on `window`; scrollTo dispatches a scroll event automatically
}

function fireBackspace(target: HTMLInputElement | HTMLTextAreaElement): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
  target.value = target.value.slice(0, -1)
  target.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }))
  target.dispatchEvent(new KeyboardEvent('keyup', { key: 'Backspace', bubbles: true }))
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

/**
 * Human flow — high-variance keystrokes, organic curved mouse, scrolls,
 * and a couple of typos-then-corrections (Backspace) so the correction-ratio
 * signal looks realistic. Should NOT trigger any detection.
 */
async function synthesizeHumanFlow(form: HTMLFormElement): Promise<void> {
  const name = form.querySelector<HTMLInputElement>('#field-name')
  const message = form.querySelector<HTMLTextAreaElement>('#field-message')
  if (!name || !message) return

  // Organic mouse path with non-uniform curvature (sine wave + noise)
  let x = 100
  let y = 200
  for (let i = 0; i < 30; i++) {
    x += 6 + Math.random() * 14
    y += Math.sin(i / 2.3) * 9 + (Math.random() - 0.5) * 6
    fireMouseMove(x, y)
    await sleep(30 + Math.random() * 45)
  }

  name.focus()
  // Human reaction delay between focus and first keystroke (~200-400ms)
  await sleep(220 + Math.random() * 180)
  for (const ch of 'Ada Lovelace') {
    const dwell = 50 + Math.random() * 100
    await fireKeyPair(name, ch, dwell)
    await sleep(80 + Math.random() * 220)
  }

  // Scroll a bit (real human scrolls when filling a long form)
  fireScroll(120)
  await sleep(300)

  message.focus()
  // Same reaction delay before starting to type in a new field
  await sleep(200 + Math.random() * 200)
  // Type the message but with a typo that gets corrected with Backspace
  // — humans typo, see it, hit backspace, retype.
  const phrase1 = 'I would like to lern' // typo: "lern"
  for (const ch of phrase1) {
    await fireKeyPair(message, ch, 50 + Math.random() * 100)
    await sleep(70 + Math.random() * 240)
  }
  // Realize the typo, backspace 3 times to remove "ern"
  for (let i = 0; i < 3; i++) {
    fireBackspace(message)
    await sleep(60 + Math.random() * 60)
  }
  // Retype correctly
  for (const ch of 'earn more about your platform') {
    await fireKeyPair(message, ch, 40 + Math.random() * 110)
    await sleep(70 + Math.random() * 240)
  }

  fireScroll(40)
}

/**
 * Scripted bot — uniform 50ms keystrokes, no mouse, no paste.
 * Triggers isScripted (no-mouse + dwell variance < 2 + flight variance < 5).
 *
 * Bounded to 18 keystrokes so charCount stays at 18 — below the
 * isLLMAgent thresholds (charCount > 20 for no-scroll, > 40 for fast-completion).
 */
async function synthesizeScriptedBot(form: HTMLFormElement): Promise<void> {
  const name = form.querySelector<HTMLInputElement>('#field-name')
  if (!name) return
  name.focus()

  const text = 'automation_test_18'
  for (const ch of text) {
    await fireKeyPair(name, ch, 0)  // 0ms dwell — uniform
    await sleep(50)                  // uniform 50ms flight
  }
}

/**
 * LLM agent — pastes ~200 chars, organic mouse, no scroll, fast completion.
 * Triggers isLLMAgent (high paste ratio + no-scroll-with-input + fast-completion).
 *
 * Mouse movement is needed so isScripted's no-mouse condition fails — otherwise
 * the LLM scenario would also trigger isScripted via the high-paste check.
 */
async function synthesizeLLMAgent(form: HTMLFormElement): Promise<void> {
  const message = form.querySelector<HTMLTextAreaElement>('#field-message')
  const name = form.querySelector<HTMLInputElement>('#field-name')
  if (!message || !name) return

  // Brief mouse path so we don't look identical to a scripted bot
  let x = 200
  let y = 300
  for (let i = 0; i < 12; i++) {
    x += 15
    y += Math.sin(i / 2) * 8
    fireMouseMove(x, y)
    await sleep(20)
  }

  name.focus()
  // LLM agents typically have model "think time" before the paste fires —
  // simulate that so the reaction rule (<50ms) doesn't also flag this as scripted.
  await sleep(280)
  firePaste(name, 'agent@example.com')
  await sleep(150)

  message.focus()
  await sleep(260)
  const chunk1 =
    'Thank you for your inquiry. Based on the requirements you described, '
  const chunk2 =
    'I recommend exploring the enterprise tier which includes advanced '
  const chunk3 = 'analytics, priority support, and custom integrations.'

  firePaste(message, chunk1)
  await sleep(400)
  firePaste(message, chunk2)
  await sleep(350)
  firePaste(message, chunk3)
  // No scroll, no typing — submit fast (<8s elapsed)
}

/**
 * Stealth bot — sets input.value directly and dispatches bare InputEvent (no inputType),
 * then attaches a file programmatically with no picker or drag-drop event.
 *
 * Triggers isScripted via:
 *   1. no mouse or touch activity
 *   2. reaction time < 50ms (focus → immediate input)
 *   3. programmatic > 5 with no known-origin events
 *
 * Triggers isUploadAutomation via programmatic file attachment.
 */
async function synthesizeStealthBot(form: HTMLFormElement): Promise<void> {
  const name = form.querySelector<HTMLInputElement>('#field-name')
  const file = form.querySelector<HTMLInputElement>('#field-doc')
  if (!name) return

  // Focus then immediately set value — sub-1ms reaction trips the <50ms rule
  name.focus()
  for (const ch of 'agent_kyb_applicant') {
    name.value += ch
    // No inputType — these look programmatic to the collector
    name.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await sleep(5)
  }

  // Programmatic file attachment: DataTransfer, no picker, no change event
  if (file) {
    const dt = new DataTransfer()
    dt.items.add(new File(['fake kyb document content'], 'kyb-identity.pdf', { type: 'application/pdf' }))
    file.files = dt.files
    // Poll in upload.ts will detect the count grew without a change event
  }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export async function runScenario(
  name: string,
  form: HTMLFormElement
): Promise<void> {
  // Reset form to a clean slate
  form.reset()

  switch (name) {
    case 'human':
      return synthesizeHumanFlow(form)
    case 'scripted':
      return synthesizeScriptedBot(form)
    case 'llm':
      return synthesizeLLMAgent(form)
    case 'stealth':
      return synthesizeStealthBot(form)
    default:
      console.warn(`[demo] unknown scenario: ${name}`)
  }
}
