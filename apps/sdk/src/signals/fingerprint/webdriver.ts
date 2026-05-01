import type { WebdriverSignals } from '../../types'

export function collectWebdriverSignal(): WebdriverSignals {
  const webdriver = !!navigator.webdriver

  // Use `in` operator for type-safe property existence checks (no casts needed)
  const cdpKeys = [
    '__puppeteer_evaluation_script__',
    'cdc_adoQpoasnfa76pfcZLmcfl_Array',
    '__nightmare',
    '_phantom',
    '__webdriver_script_fn',
  ] as const
  const cdpPresent = cdpKeys.some((key) => key in window)

  const playwrightPresent = '__playwright' in window || '__pw_manual' in window

  return { webdriver, cdpPresent, playwrightPresent }
}
