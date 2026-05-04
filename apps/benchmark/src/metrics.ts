import { CALIBRATION_SCENARIO_IDS } from './ground-truth.js'
import type { ScenarioResult } from './types.js'

/** The 4 axes of the confusion matrix (rows = actual, cols = predicted) */
export const MATRIX_AXES = ['Human', 'Bot', 'LLMAgent', 'AuthorizedAgent'] as const
export type MatrixAxis = (typeof MATRIX_AXES)[number]

/** 4×4 confusion matrix: matrix[actual][predicted] = count */
export type ConfusionMatrix = Record<MatrixAxis, Record<MatrixAxis, number>>

/** Per-rule metrics for each of the 6 detection rules */
export interface RuleMetrics {
  ruleName: string
  truePositives: number
  trueNegatives: number
  falsePositives: number
  falseNegatives: number
  accuracy: number
  precision: number
  recall: number
  f1: number
}

/** Per-actor-type accuracy */
export interface ActorTypeMetrics {
  actorType: MatrixAxis
  total: number
  correct: number
  accuracy: number
  misclassifiedAs: Partial<Record<MatrixAxis, number>>
}

export interface AggregateMetrics {
  f1: number
  f2: number
  confusionMatrix: ConfusionMatrix
  perRuleMetrics: RuleMetrics[]
  perActorTypeMetrics: ActorTypeMetrics[]
  calibrationCount: number
  evaluatedCount: number
}

export function isCalibration(result: ScenarioResult): boolean {
  return CALIBRATION_SCENARIO_IDS.has(result.groundTruth.id)
}

export function mapVerdictToAxis(verdictKind: string): MatrixAxis {
  // The demo page's computeVerdict returns shortLabel values, not SDK VerdictKind.
  // See apps/web/lib/verdict.ts for the mapping.
  const botLabels = [
    'Bot \u2014 multiple signals',
    'Bot - multiple signals',
    'Headless Browser',
    'Scripted Bot',
    'LLM Agent',
  ]
  if (botLabels.includes(verdictKind)) return 'Bot'
  if (verdictKind === 'Human' || verdictKind === 'Awaiting input') return 'Human'
  if (verdictKind === 'AuthorizedAgent' || verdictKind === 'Authorized Agent') return 'AuthorizedAgent'
  // Fallback for SDK internal VerdictKind values
  if (verdictKind === 'UnauthorizedBot') return 'Bot'
  if (verdictKind === 'Analyzing') return 'Human'
  return 'Human'
}

export function mapActorTypeToAxis(actorType: string): MatrixAxis {
  switch (actorType) {
    case 'Human':
      return 'Human'
    case 'Bot':
      return 'Bot'
    case 'LLMAgent':
      return 'LLMAgent'
    case 'AuthorizedAgent':
      return 'AuthorizedAgent'
    default:
      return 'Human'
  }
}

function createEmptyMatrix(): ConfusionMatrix {
  return {
    Human: { Human: 0, Bot: 0, LLMAgent: 0, AuthorizedAgent: 0 },
    Bot: { Human: 0, Bot: 0, LLMAgent: 0, AuthorizedAgent: 0 },
    LLMAgent: { Human: 0, Bot: 0, LLMAgent: 0, AuthorizedAgent: 0 },
    AuthorizedAgent: { Human: 0, Bot: 0, LLMAgent: 0, AuthorizedAgent: 0 },
  }
}

function getVerdictKindFromPayload(payload: Record<string, unknown> | null): string {
  if (!payload) return 'Analyzing'
  const kind = payload.verdictKind
  return typeof kind === 'string' ? kind : 'Analyzing'
}

function isRuleDetected(payload: Record<string, unknown> | null, ruleName: string): boolean {
  if (!payload) return false
  const detections = payload.detections
  if (detections && typeof detections === 'object' && detections !== null) {
    const detection = (detections as Record<string, unknown>)[ruleName]
    if (detection && typeof detection === 'object' && detection !== null) {
      const d = detection as Record<string, unknown>
      return d.detected === true
    }
  }
  return false
}

export function computeConfusionMatrix(results: ScenarioResult[]): ConfusionMatrix {
  const matrix = createEmptyMatrix()
  for (const result of results) {
    if (isCalibration(result)) continue
    if (!result.capturedPayload) continue
    const actual = mapActorTypeToAxis(result.groundTruth.actorType)
    const predicted = mapVerdictToAxis(getVerdictKindFromPayload(result.capturedPayload))
    matrix[actual][predicted] += 1
  }
  return matrix
}

const RULE_NAMES = [
  'isHeadless',
  'isScripted',
  'isLLMAgent',
  'isUploadAutomation',
  'isMultimodalBot',
  'isAuthorizedAgent',
] as const

export function computePerRuleAccuracy(results: ScenarioResult[]): RuleMetrics[] {
  const metrics: RuleMetrics[] = []
  for (const ruleName of RULE_NAMES) {
    let tp = 0
    let tn = 0
    let fp = 0
    let fn = 0
    for (const result of results) {
      if (isCalibration(result)) continue
      const expected = result.groundTruth.expectedFiredRules.includes(ruleName)
      const actual = isRuleDetected(result.capturedPayload, ruleName)
      if (expected && actual) {
        tp += 1
      } else if (!expected && !actual) {
        tn += 1
      } else if (!expected && actual) {
        fp += 1
      } else {
        fn += 1
      }
    }
    const total = tp + tn + fp + fn
    const accuracy = total > 0 ? (tp + tn) / total : 0
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0
    metrics.push({
      ruleName,
      truePositives: tp,
      trueNegatives: tn,
      falsePositives: fp,
      falseNegatives: fn,
      accuracy,
      precision,
      recall,
      f1,
    })
  }
  return metrics
}

export function computePerActorTypeAccuracy(results: ScenarioResult[]): ActorTypeMetrics[] {
  const metrics: ActorTypeMetrics[] = []
  for (const actorType of MATRIX_AXES) {
    let total = 0
    let correct = 0
    const misclassifiedAs: Partial<Record<MatrixAxis, number>> = {}
    for (const result of results) {
      if (isCalibration(result)) continue
      if (mapActorTypeToAxis(result.groundTruth.actorType) !== actorType) continue
      if (!result.capturedPayload) continue
      total += 1
      const expected = mapVerdictToAxis(result.groundTruth.expectedVerdict)
      const predicted = mapVerdictToAxis(getVerdictKindFromPayload(result.capturedPayload))
      if (expected === predicted) {
        correct += 1
      } else {
        misclassifiedAs[predicted] = (misclassifiedAs[predicted] ?? 0) + 1
      }
    }
    metrics.push({
      actorType,
      total,
      correct,
      accuracy: total > 0 ? correct / total : 0,
      misclassifiedAs,
    })
  }
  return metrics
}

export function computeF1(results: ScenarioResult[]): number {
  const matrix = computeConfusionMatrix(results)
  let totalF1 = 0
  for (const axis of MATRIX_AXES) {
    const tp = matrix[axis][axis]
    let fp = 0
    let fn = 0
    for (const other of MATRIX_AXES) {
      if (other === axis) continue
      fp += matrix[other][axis]
      fn += matrix[axis][other]
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0
    totalF1 += f1
  }
  return totalF1 / MATRIX_AXES.length
}

export function computeF2(results: ScenarioResult[]): number {
  const matrix = computeConfusionMatrix(results)
  let totalF2 = 0
  for (const axis of MATRIX_AXES) {
    const tp = matrix[axis][axis]
    let fp = 0
    let fn = 0
    for (const other of MATRIX_AXES) {
      if (other === axis) continue
      fp += matrix[other][axis]
      fn += matrix[axis][other]
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0
    const f2 = precision + recall > 0 ? (5 * precision * recall) / (4 * precision + recall) : 0
    totalF2 += f2
  }
  return totalF2 / MATRIX_AXES.length
}

export function computeAggregateMetrics(results: ScenarioResult[]): AggregateMetrics {
  const calibrationCount = results.filter(isCalibration).length
  const evaluatedCount = results.filter((r) => !isCalibration(r)).length
  const confusionMatrix = computeConfusionMatrix(results)
  const perRuleMetrics = computePerRuleAccuracy(results)
  const perActorTypeMetrics = computePerActorTypeAccuracy(results)
  const f1 = computeF1(results)
  const f2 = computeF2(results)
  return {
    f1,
    f2,
    confusionMatrix,
    perRuleMetrics,
    perActorTypeMetrics,
    calibrationCount,
    evaluatedCount,
  }
}
