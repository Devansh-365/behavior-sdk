const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

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
}

function fireBackspace(target: HTMLInputElement | HTMLTextAreaElement): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
  target.value = target.value.slice(0, -1)
  target.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward', bubbles: true }))
  target.dispatchEvent(new KeyboardEvent('keyup', { key: 'Backspace', bubbles: true }))
}

async function synthesizeHumanFlow(form: HTMLFormElement): Promise<void> {
  const name = form.querySelector<HTMLInputElement>('#field-name')
  const message = form.querySelector<HTMLTextAreaElement>('#field-message')
  if (!name || !message) return

  let x = 100
  let y = 200
  for (let i = 0; i < 30; i++) {
    x += 6 + Math.random() * 14
    y += Math.sin(i / 2.3) * 9 + (Math.random() - 0.5) * 6
    fireMouseMove(x, y)
    await sleep(30 + Math.random() * 45)
  }

  name.focus()
  await sleep(220 + Math.random() * 180)
  for (const ch of 'Ada Lovelace') {
    const dwell = 50 + Math.random() * 100
    await fireKeyPair(name, ch, dwell)
    await sleep(80 + Math.random() * 220)
  }

  fireScroll(120)
  await sleep(300)

  message.focus()
  await sleep(200 + Math.random() * 200)
  const phrase1 = 'I would like to lern'
  for (const ch of phrase1) {
    await fireKeyPair(message, ch, 50 + Math.random() * 100)
    await sleep(70 + Math.random() * 240)
  }
  for (let i = 0; i < 3; i++) {
    fireBackspace(message)
    await sleep(60 + Math.random() * 60)
  }
  for (const ch of 'earn more about your platform') {
    await fireKeyPair(message, ch, 40 + Math.random() * 110)
    await sleep(70 + Math.random() * 240)
  }

  fireScroll(40)
}

async function synthesizeScriptedBot(form: HTMLFormElement): Promise<void> {
  const name = form.querySelector<HTMLInputElement>('#field-name')
  if (!name) return
  name.focus()

  const text = 'automation_test_18'
  for (const ch of text) {
    await fireKeyPair(name, ch, 0)
    await sleep(50)
  }
}

async function synthesizeLLMAgent(form: HTMLFormElement): Promise<void> {
  const message = form.querySelector<HTMLTextAreaElement>('#field-message')
  const name = form.querySelector<HTMLInputElement>('#field-name')
  if (!message || !name) return

  let x = 200
  let y = 300
  for (let i = 0; i < 12; i++) {
    x += 15
    y += Math.sin(i / 2) * 8
    fireMouseMove(x, y)
    await sleep(20)
  }

  name.focus()
  await sleep(280)
  firePaste(name, 'agent@example.com')
  await sleep(150)

  message.focus()
  await sleep(260)
  firePaste(message, 'Thank you for your inquiry. Based on the requirements you described, ')
  await sleep(400)
  firePaste(message, 'I recommend exploring the enterprise tier which includes advanced ')
  await sleep(350)
  firePaste(message, 'analytics, priority support, and custom integrations.')
}

async function synthesizeStealthBot(form: HTMLFormElement): Promise<void> {
  const name = form.querySelector<HTMLInputElement>('#field-name')
  const file = form.querySelector<HTMLInputElement>('#field-doc')
  if (!name) return

  name.focus()
  for (const ch of 'agent_kyb_applicant') {
    name.value += ch
    name.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await sleep(5)
  }

  if (file) {
    const dt = new DataTransfer()
    dt.items.add(new File(['fake kyb document content'], 'kyb-identity.pdf', { type: 'application/pdf' }))
    file.files = dt.files
  }
}

export async function runScenario(
  name: string,
  form: HTMLFormElement
): Promise<void> {
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
