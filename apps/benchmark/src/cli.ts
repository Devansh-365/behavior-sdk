#!/usr/bin/env node

import { Command } from 'commander'
import { SCENARIOS } from './ground-truth.js'
import { registry } from './scenarios/index.js'
import {
  runHarness,
  startDemoServer,
  stopDemoServer,
  type HarnessOptions,
} from './harness.js'
import { computeAggregateMetrics } from './metrics.js'
import { formatTerminal, writeJSON, createProgressBar } from './reporter.js'

const program = new Command()

program
  .name('benchmark')
  .description('SDK detection accuracy benchmark harness')
  .option('--filter <pattern>', 'Run only matching scenario files')
  .option('--headful', 'Run browser in headed (visible) mode')
  .option('--iterations <number>', 'Number of iterations per scenario', '3')
  .option('--verbose', 'Enable verbose logging')
  .option('--json-only', 'Output results as JSON only (no TTY output)')
  .option('--auto-start', 'Auto-start demo server if not running')
  .parse(process.argv)

async function main() {
  const opts = program.opts()

  const options: HarnessOptions = {
    filter: opts.filter,
    headless: !opts.headful,
    iterations: parseInt(opts.iterations, 10),
    verbose: opts.verbose,
  }

  let serverPid: number | undefined
  let exitCode = 0

  try {
    if (opts.autoStart) {
      serverPid = await startDemoServer({ verbose: opts.verbose })
    }

    const filteredScenarios = opts.filter
      ? SCENARIOS.filter((s) => new RegExp(opts.filter).test(s.id))
      : SCENARIOS

    const progressBar = opts.jsonOnly ? null : createProgressBar(filteredScenarios.length)
    if (progressBar) {
      options.onProgress = (update) => {
        progressBar.update(update.current, update.scenarioId, update.result)
      }
    }

    const results = await runHarness(SCENARIOS, registry, options)

    if (progressBar) progressBar.finish()
    const aggregated = computeAggregateMetrics(results)

    if (!opts.jsonOnly) {
      console.log(formatTerminal(aggregated, results))
      console.log('')
    }

    writeJSON(aggregated, results)

    const calibrationCount = results.filter((r) => r.groundTruth.isCalibration)
      .length
    const nonCalibration = results.filter((r) => !r.groundTruth.isCalibration)
    const passedCount = nonCalibration.filter((r) => r.passed).length
    const evaluatedCount = nonCalibration.length

    const summary = `${passedCount}/${evaluatedCount} scenarios passed (${calibrationCount} calibration excluded)`
    if (!opts.jsonOnly) {
      console.log(summary)
    }

    const allPassed = evaluatedCount > 0 && passedCount === evaluatedCount
    exitCode = allPassed ? 0 : 1
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err))
    exitCode = 1
  } finally {
    if (opts.autoStart && serverPid !== undefined) {
      await stopDemoServer(serverPid)
    }
    process.exit(exitCode)
  }
}

main()
