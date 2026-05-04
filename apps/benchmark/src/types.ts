// ---------------------------------------------------------------------------
// Shared types for the benchmark suite.
// These mirror a subset of the SDK's domain model — intentionally independent
// so ground truth definitions don't need a dependency on apps/sdk/src.
// ---------------------------------------------------------------------------

/** The actor the scenario simulates. */
export type ActorType = 'Human' | 'Bot' | 'LLMAgent' | 'AuthorizedAgent'

/**
 * The three verdict kinds used in ground-truth assertions.
 * A subset of the SDK's VerdictKind; we omit 'Analyzing' since it is a
 * transient state, never a final classification.
 */
export type VerdictKind = 'Human' | 'UnauthorizedBot' | 'AuthorizedAgent'

/** Ground truth definition for a single benchmark scenario. */
export interface ScenarioGroundTruth {
  /** Unique scenario identifier (kebab-case, e.g. "human-natural"). */
  id: string
  /** The simulated actor type. */
  actorType: ActorType
  /** The verdict the SDK *should* return for this scenario. */
  expectedVerdict: VerdictKind
  /** Detection rule names that should fire (e.g. "isHeadless", "isScripted"). */
  expectedFiredRules: string[]
  /** Human-readable description of what this scenario simulates. */
  description: string
  /** Minimum wall-clock duration (ms) before the SDK is flushed. */
  minDurationMs: number
  /**
   * When true this scenario is excluded from aggregate accuracy metrics
   * (F1, F2) because it exists to calibrate a specific rule boundary rather
   * than represent a realistic traffic class.
   */
  isCalibration?: boolean
}

/** Runtime result of running one scenario iteration. */
export interface ScenarioResult {
  groundTruth: ScenarioGroundTruth
  /** The full payload captured from the SDK, or null if the run failed. */
  capturedPayload: Record<string, unknown> | null
  /** True when the verdict matches expectedVerdict and all expected rules fired. */
  passed: boolean
  /** Populated when an error occurred during scenario execution or assertion. */
  error?: string
}
