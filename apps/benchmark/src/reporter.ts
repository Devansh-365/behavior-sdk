// Benchmark results reporter — terminal ASCII tables + JSON output.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import type { ScenarioResult, ActorType } from './types.js'
import type { AggregateMetrics } from './metrics.js'

const ACTOR_TYPES: ActorType[] = [
  'Human',
  'Bot',
  'LLMAgent',
  'AuthorizedAgent',
]

const USE_COLOR = process.stdout.isTTY

function green(s: string): string {
  return USE_COLOR ? `\x1b[32m${s}\x1b[0m` : s
}

function red(s: string): string {
  return USE_COLOR ? `\x1b[31m${s}\x1b[0m` : s
}

function dim(s: string): string {
  return USE_COLOR ? `\x1b[2m${s}\x1b[0m` : s
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[\d+m/g, '')
}

function yellow(s: string): string {
  return USE_COLOR ? `\x1b[33m${s}\x1b[0m` : s
}

function cyan(s: string): string {
  return USE_COLOR ? `\x1b[36m${s}\x1b[0m` : s
}

/** Render a live-updating progress bar for the benchmark harness.
 *  Call once to get an updater function, then call the updater after each scenario.
 */
export function createProgressBar(total: number): {
  update: (current: number, scenarioId: string, result?: import('./types.js').ScenarioResult) => void
  finish: () => void
} {
  const startTime = Date.now()
  let maxWidth = 0

  const update = (current: number, scenarioId: string, result?: import('./types.js').ScenarioResult) => {
    const elapsedMs = Date.now() - startTime
    const elapsedSec = (elapsedMs / 1000).toFixed(1)
    const pct = Math.round((current / total) * 100)
    const barWidth = 20
    const filled = Math.round((current / total) * barWidth)
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled)

    const statusIcon = result
      ? result.error
        ? yellow('⚠')
        : result.passed
          ? green('✓')
          : red('✗')
      : cyan('→')

    const line = `${cyan('Benchmark')} ${bar} ${pct}% │ ${current}/${total} │ ${statusIcon} ${scenarioId} │ ${dim(elapsedSec + 's')}`
    const plain = stripAnsi(line)

    // Pad to clear previous longer lines
    const pad = maxWidth > plain.length ? ' '.repeat(maxWidth - plain.length) : ''
    maxWidth = Math.max(maxWidth, plain.length)

    process.stdout.write(`\r${line}${pad}`)
  }

  const finish = () => {
    process.stdout.write('\n')
  }

  return { update, finish }
}

function padRight(s: string, width: number): string {
  const pad = Math.max(0, width - stripAnsi(s).length)
  return s + ' '.repeat(pad)
}

function padLeft(s: string, width: number): string {
  const pad = Math.max(0, width - stripAnsi(s).length)
  return ' '.repeat(pad) + s
}

/**
 * Extract the SDK's output verdict from a captured payload.
 *
 * Handles two known shapes:
 * - capture.ts: `{ verdictKind: string }`
 * - SDK BehaviorPayload: `{ verdict: { kind: string } }`
 */
function extractActualVerdict(result: ScenarioResult): string {
  const p = result.capturedPayload as Record<string, unknown> | null
  if (!p) return result.error ? 'ERROR' : result.groundTruth.expectedVerdict

  if (typeof p.verdictKind === 'string') return p.verdictKind

  const verdict = p.verdict
  if (verdict && typeof verdict === 'object') {
    const kind = (verdict as Record<string, unknown>).kind
    if (typeof kind === 'string') return kind
  }

  return result.passed ? result.groundTruth.expectedVerdict : 'Mismatch'
}

/**
 * Extract the list of rules that fired from a captured payload.
 *
 * Handles:
 * - capture.ts: `{ detections: Record<string, { detected: boolean }> }`
 * - SDK BehaviorPayload: `{ detections: Detections }` (same inner shape)
 * - Direct array: `{ firedRules: string[] }`
 */
function extractFiredRules(result: ScenarioResult): string[] {
  const p = result.capturedPayload as Record<string, unknown> | null
  if (!p) return []

  const detections = p.detections
  if (detections && typeof detections === 'object') {
    const fired: string[] = []
    for (const [rule, d] of Object.entries(
      detections as Record<string, unknown>,
    )) {
      if (
        d &&
        typeof d === 'object' &&
        (d as Record<string, unknown>).detected === true
      ) {
        fired.push(rule)
      }
    }
    return fired
  }

  if (Array.isArray(p.firedRules)) return p.firedRules as string[]

  return []
}

/**
 * Format benchmark results as a terminal-friendly ASCII table.
 *
 * Sections:
 * 1. Header with ISO timestamp
 * 2. Summary (Macro F1, F2, evaluated/calibration counts)
 * 3. Per-scenario table with PASS/FAIL coloring
 * 4. Per-actor-type accuracy
 * 5. 4x4 confusion matrix
 * 6. Per-rule accuracy (precision, recall, F1)
 *
 * ANSI color codes are emitted only when `process.stdout.isTTY` is true.
 * Calibration rows are dimmed and labelled.
 */
export function formatTerminal(
  aggregated: AggregateMetrics,
  results: ScenarioResult[],
): string {
  const lines: string[] = []

  lines.push(`Benchmark Results — ${new Date().toISOString()}`)
  lines.push('')

  lines.push('Summary:')
  lines.push(`  Macro F1:              ${aggregated.f1.toFixed(3)}`)
  lines.push(`  Macro F2:              ${aggregated.f2.toFixed(3)}`)
  lines.push(`  Scenarios evaluated:   ${aggregated.evaluatedCount}`)
  lines.push(`  Calibration scenarios: ${aggregated.calibrationCount}`)
  lines.push('')

  lines.push('Scenario-by-Scenario Results:')

  const colScenario = 30
  const colActor = 10
  const colExpected = 15
  const colActual = 15
  const colRules = 20

  const head =
    padRight('Scenario', colScenario) +
    ' ' +
    padRight('Actor', colActor) +
    ' ' +
    padRight('Expected', colExpected) +
    ' ' +
    padRight('Actual', colActual) +
    ' ' +
    padRight('Rules Fired', colRules) +
    '  ' +
    'Result'

  lines.push(head)
  lines.push('─'.repeat(stripAnsi(head).length))

  for (const result of results) {
    const gt = result.groundTruth
    const actualVerdict = extractActualVerdict(result)
    const firedRules = extractFiredRules(result)
    const isCal = gt.isCalibration ?? false

    const scenarioName =
      gt.id.length > colScenario
        ? gt.id.slice(0, colScenario - 3) + '...'
        : gt.id

    const rulesJoined = firedRules.join(',')
    const rulesDisplay =
      rulesJoined.length > colRules
        ? rulesJoined.slice(0, colRules - 3) + '...'
        : rulesJoined

    let resultLabel: string
    if (result.error) {
      resultLabel = red('ERROR')
    } else {
      resultLabel = result.passed ? green('PASS') : red('FAIL')
    }

    const row =
      padRight(scenarioName, colScenario) +
      ' ' +
      padRight(gt.actorType, colActor) +
      ' ' +
      padRight(gt.expectedVerdict, colExpected) +
      ' ' +
      padRight(actualVerdict, colActual) +
      ' ' +
      padRight(rulesDisplay, colRules) +
      '  ' +
      resultLabel

    if (isCal) {
      lines.push(dim(stripAnsi(row) + '  (calibration)'))
    } else {
      lines.push(row)
    }
  }
  lines.push('')

  lines.push('Per-Actor-Type Accuracy:')
  for (const at of aggregated.perActorTypeMetrics) {
    const pct = at.total > 0 ? ((at.correct / at.total) * 100).toFixed(1) : 'N/A'
    lines.push(
      `  ${padRight(at.actorType, 18)} ${at.correct}/${at.total}  (${pct}%)`,
    )
  }
  lines.push('')

  const cmW = 11

  lines.push('Confusion Matrix (actual vs predicted):')
  lines.push(
    ' '.repeat(14) + padRight('Predicted', cmW * 4 + 2).trimStart(),
  )

  lines.push(
    ' '.repeat(14) +
      ACTOR_TYPES.map((t) => padLeft(t.length > cmW ? t.slice(0, cmW) : t, cmW)).join(' '),
  )

  for (const actual of ACTOR_TYPES) {
    const rowData = ACTOR_TYPES.map((predicted) => {
      const count = aggregated.confusionMatrix[actual]?.[predicted] ?? 0
      return padLeft(String(count), cmW)
    }).join(' ')
    lines.push(padRight(actual, 14) + rowData)
  }
  lines.push('')

  if (aggregated.perRuleMetrics.length > 0) {
    lines.push('Per-Rule Accuracy:')

    const ruleHead =
      padRight('Rule', 20) +
      '  ' +
      padRight('Accuracy', 9) +
      '  ' +
      padRight('Precision', 9) +
      '  ' +
      padRight('Recall', 9) +
      '  ' +
      padRight('F1', 9)

    lines.push(ruleHead)
    lines.push('─'.repeat(stripAnsi(ruleHead).length))

    for (const rule of aggregated.perRuleMetrics) {
      lines.push(
        padRight(rule.ruleName, 20) +
          '  ' +
          padRight(rule.accuracy.toFixed(3), 9) +
          '  ' +
          padRight(rule.precision.toFixed(3), 9) +
          '  ' +
          padRight(rule.recall.toFixed(3), 9) +
          '  ' +
          padRight(rule.f1.toFixed(3), 9),
      )
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Write benchmark results as a structured JSON file.
 *
 * The JSON structure mirrors the terminal output with additional fields
 * per scenario (actual verdict, fired rules, raw captured payload).
 *
 * @param aggregated  Pre-computed aggregate metrics (including confusion
 *                    matrix, per-rule and per-actor metrics).
 * @param results     Raw per-scenario results.
 * @param outputPath  Filesystem path for the JSON file.
 *                    Defaults to `results/latest.json` (relative to CWD).
 */
export function writeJSON(
  aggregated: AggregateMetrics,
  results: ScenarioResult[],
  outputPath: string = 'results/latest.json',
): void {
  const resolvedPath = resolve(outputPath)
  const dir = dirname(resolvedPath)

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const scenarios = results.map((r) => {
    const gt = r.groundTruth
    return {
      id: gt.id,
      actorType: gt.actorType,
      expectedVerdict: gt.expectedVerdict,
      actualVerdict: extractActualVerdict(r),
      firedRules: extractFiredRules(r),
      expectedRules: gt.expectedFiredRules,
      passed: r.passed,
      isCalibration: gt.isCalibration ?? false,
      capturedPayload: r.capturedPayload,
    }
  })

  const output = {
    timestamp: new Date().toISOString(),
    scenarios,
    aggregateMetrics: {
      f1: aggregated.f1,
      f2: aggregated.f2,
      evaluatedCount: aggregated.evaluatedCount,
      calibrationCount: aggregated.calibrationCount,
    },
    confusionMatrix: aggregated.confusionMatrix,
    perRuleMetrics: aggregated.perRuleMetrics,
    perActorTypeMetrics: aggregated.perActorTypeMetrics,
  }

  writeFileSync(resolvedPath, JSON.stringify(output, null, 2), 'utf-8')
}
