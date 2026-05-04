import type { Browser, BrowserContext } from 'playwright'
import { chromium } from 'playwright'
import type { ScenarioGroundTruth, ScenarioResult } from './types.js'
import { captureVerdict, captureDetections, overrideSendBeacon } from './capture.js'
import type { ScenarioRunner, ScenarioRegistry } from './scenarios/types.js'
import { spawn } from 'node:child_process'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export async function launchBrowser(headless = true): Promise<Browser> {
  return chromium.launch({
    headless,
    args: ['--disable-blink-features=AutomationControlled'],
  })
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../..')

function checkServerRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode !== undefined && res.statusCode < 500)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(3000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

export async function startDemoServer(options?: { verbose?: boolean }): Promise<number | undefined> {
  const isRunning = await checkServerRunning()
  if (isRunning) {
    if (options?.verbose) console.log('[harness] Demo server already running on localhost:3000')
    return undefined
  }

  if (options?.verbose) console.log('[harness] Starting demo server...')
  const proc = spawn('npm', ['run', 'web'], {
    cwd: REPO_ROOT,
    stdio: options?.verbose ? 'inherit' : 'ignore',
  })

  const start = Date.now()
  while (Date.now() - start < 30000) {
    if (await checkServerRunning()) {
      if (options?.verbose) console.log('[harness] Demo server ready')
      return proc.pid ?? undefined
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  proc.kill()
  throw new Error('Demo server failed to start within 30s')
}

export async function stopDemoServer(pid?: number): Promise<void> {
  if (!pid) return
  try {
    process.kill(pid, 'SIGTERM')
  } catch {
    // Ignore errors if process already exited
  }
}

export interface RunScenarioOptions {
  headless?: boolean
  iterations?: number
  verbose?: boolean
  demoUrl?: string
}

export async function runScenario(
  context: BrowserContext,
  groundTruth: ScenarioGroundTruth,
  runner: ScenarioRunner,
  options: RunScenarioOptions = {},
): Promise<ScenarioResult> {
  const { demoUrl = 'http://localhost:3000/demo' } = options
  const page = await context.newPage()
  const startTime = Date.now()

  if (options.verbose) {
    console.log(`[harness] Starting scenario: ${groundTruth.id}`)
  }

  try {
    if (groundTruth.id === 'authorized-agent-claim') {
      await page.addInitScript(() => {
        ;(window as unknown as Record<string, unknown>).__nyasaAgentSignature =
          'v1:test-agent-signature'
      })
    }

    await overrideSendBeacon(page)

    try {
      await page.goto(demoUrl, { waitUntil: 'networkidle', timeout: 30000 })
    } catch (navErr) {
      const message = navErr instanceof Error ? navErr.message : String(navErr)
      return {
        groundTruth,
        capturedPayload: null,
        passed: false,
        error: `PAGE_LOAD_FAILED: ${message}`,
      }
    }

    await page.waitForSelector('#field-name', { timeout: 10000 })
    await runner(page, groundTruth)

    const elapsed = Date.now() - startTime
    const remaining = groundTruth.minDurationMs - elapsed
    if (remaining > 0) {
      await page.waitForTimeout(remaining)
    }

    await page.click('button[type="submit"]')
    await page.waitForSelector('h2', { timeout: 5000 })
    await page.waitForTimeout(1500)

    const verdict = await captureVerdict(page)
    const detections = await captureDetections(page)

    const rulesFired: string[] = []
    for (const [ruleName, detection] of Object.entries(detections)) {
      if (detection.detected) {
        rulesFired.push(ruleName)
      }
    }

    const capturedPayload: Record<string, unknown> = {
      verdictKind: verdict.verdictKind,
      confidence: verdict.confidence,
      badges: verdict.badges,
      detections,
      isHeadlessExpected: groundTruth.expectedFiredRules.includes('isHeadless'),
    }

    const hasNullVerdict = !verdict.verdictKind || verdict.verdictKind === 'Unknown'
    const hasEmptyDetections = Object.keys(detections).length === 0

    if (hasNullVerdict || hasEmptyDetections) {
      const issues: string[] = []
      if (hasNullVerdict) issues.push('null verdict')
      if (hasEmptyDetections) issues.push('empty detections')
      return {
        groundTruth,
        capturedPayload,
        passed: false,
        error: `DATA_QUALITY_ISSUE: ${issues.join(', ')}`,
      }
    }

    // The demo page's computeVerdict returns shortLabel strings, not SDK VerdictKind.
    // Map them back for comparison.
    const mapDemoVerdict = (kind: string): string => {
      if (kind === 'Human' || kind === 'Awaiting input') return 'Human'
      if (kind === 'Authorized Agent') return 'AuthorizedAgent'
      // All bot sub-kinds and "multiple" map to UnauthorizedBot
      const botLabels = ['Bot \u2014 multiple signals', 'Bot - multiple signals', 'Headless Browser', 'Scripted Bot', 'LLM Agent']
      if (botLabels.includes(kind)) return 'UnauthorizedBot'
      return kind
    }

    const mappedActualVerdict = mapDemoVerdict(verdict.verdictKind)
    const verdictMatches = mappedActualVerdict === groundTruth.expectedVerdict
    const expectedRulesAllFired = groundTruth.expectedFiredRules.every((r) =>
      rulesFired.includes(r),
    )
    const passed = verdictMatches && expectedRulesAllFired

    if (options.verbose) {
      const elapsed = Date.now() - startTime
      console.log(
        `[harness] Scenario ${groundTruth.id} completed in ${elapsed}ms — verdict: ${verdict.verdictKind}, rules: [${rulesFired.join(', ')}]`,
      )
    }

    return {
      groundTruth,
      capturedPayload,
      passed,
    }
  } catch (err) {
    const elapsed = Date.now() - startTime
    const message = err instanceof Error ? err.message : String(err)
    const isTimeout = elapsed > 30000 || message.toLowerCase().includes('timeout')
    return {
      groundTruth,
      capturedPayload: null,
      passed: false,
      error: isTimeout ? `TIMEOUT: ${message}` : message,
    }
  } finally {
    await page.close().catch(() => {})
  }
}

export interface ProgressUpdate {
  current: number
  total: number
  scenarioId: string
  result?: ScenarioResult
}

export interface HarnessOptions extends RunScenarioOptions {
  filter?: string
  maxRetries?: number
  autoStartServer?: boolean
  onProgress?: (update: ProgressUpdate) => void
}

export async function runHarness(
  scenarios: ScenarioGroundTruth[],
  registry: ScenarioRegistry,
  options: HarnessOptions = {},
): Promise<ScenarioResult[]> {
  const {
    filter,
    iterations = 3,
    headless = true,
    verbose = false,
    maxRetries = 0,
  } = options

  const filteredScenarios = filter
    ? scenarios.filter((s) => new RegExp(filter).test(s.id))
    : scenarios

  const browser = await launchBrowser(headless)
  const results: ScenarioResult[] = []

  try {
    for (let idx = 0; idx < filteredScenarios.length; idx++) {
      const scenario = filteredScenarios[idx]!
      const runner = registry.get(scenario.id)
      if (!runner) {
        results.push({
          groundTruth: scenario,
          capturedPayload: null,
          passed: false,
          error: `NO_RUNNER: no runner registered for scenario "${scenario.id}"`,
        })
        continue
      }

      if (verbose) {
        console.log(`[harness] Running scenario: ${scenario.id}`)
      }

      let finalResult: ScenarioResult | undefined

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (verbose && attempt > 0) {
          console.log(
            `[harness] Retry ${attempt}/${maxRetries} for scenario "${scenario.id}"`,
          )
        }

        const context = await browser.newContext()
        let lastResult: ScenarioResult | undefined
        let firstNonErrorResult: ScenarioResult | undefined

        try {
          for (let i = 0; i < iterations; i++) {
            const result = await runScenario(context, scenario, runner, options)
            lastResult = result
            if (!result.error && firstNonErrorResult === undefined) {
              firstNonErrorResult = result
            }
          }

          if (lastResult && !lastResult.error) {
            finalResult = lastResult
          } else if (firstNonErrorResult) {
            finalResult = firstNonErrorResult
          } else if (lastResult) {
            finalResult = lastResult
          } else {
            finalResult = {
              groundTruth: scenario,
              capturedPayload: null,
              passed: false,
              error: 'NO_RESULT: no result produced after iterations',
            }
          }
        } finally {
          await context.close().catch(() => {})
        }

        if (!finalResult.error) break
      }

      if (finalResult) {
        if (verbose) {
          const status = finalResult.error
            ? `ERROR (${finalResult.error})`
            : finalResult.passed
              ? 'PASS'
              : 'FAIL'
          console.log(`[harness] Scenario ${scenario.id} result: ${status}`)
        }
        results.push(finalResult)
        options.onProgress?.({
          current: results.length,
          total: filteredScenarios.length,
          scenarioId: scenario.id,
          result: finalResult,
        })
      }
    }
  } finally {
    await browser.close().catch(() => {})
  }

  return results
}
