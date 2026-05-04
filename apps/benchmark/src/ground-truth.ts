import type { ScenarioGroundTruth } from './types.js'

/**
 * Ground truth definitions for all 14 benchmark scenarios.
 *
 * Each entry declares the actor type being simulated, the verdict and
 * detection rules the SDK *should* produce, and metadata the harness uses
 * to configure the interaction.
 *
 * Two calibration scenarios are excluded from aggregate accuracy metrics
 * (F1 / F2) because they probe specific rule-decision boundaries rather
 * than representing realistic traffic.
 */

/** Human — natural interaction with variance, corrections, and scrolling. */
const HUMAN_NATURAL: ScenarioGroundTruth = {
  id: 'human-natural',
  actorType: 'Human',
  expectedVerdict: 'Human',
  expectedFiredRules: [],
  description:
    'Variable typing (50-150ms dwells), mouse with curvature, corrections, scroll, natural rhythm',
  minDurationMs: 3000,
}

/** Human — fast but still organic, variance present, typo corrections. */
const HUMAN_FAST_TYPIST: ScenarioGroundTruth = {
  id: 'human-fast-typist',
  actorType: 'Human',
  expectedVerdict: 'Human',
  expectedFiredRules: [],
  description:
    'Fast but human dwells (30-80ms), still some variance, corrections present',
  minDurationMs: 2000,
}

/** Human — slow, deliberate, many corrections, long field dwells. */
const HUMAN_CAUTIOUS: ScenarioGroundTruth = {
  id: 'human-cautious',
  actorType: 'Human',
  expectedVerdict: 'Human',
  expectedFiredRules: [],
  description:
    'Slow deliberate corrections, long field dwells',
  minDurationMs: 4000,
}

/** Bot — raw headless Chrome with navigator.webdriver=true and CDP markers. */
const BOT_HEADLESS_CHROME: ScenarioGroundTruth = {
  id: 'bot-headless-chrome',
  actorType: 'Bot',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isHeadless'],
  description:
    'Headless Chromium via Playwright, navigator.webdriver=true, CDP markers',
  minDurationMs: 2000,
}

/** Bot — uniform keystroke timing with zero mouse activity. */
const BOT_SCRIPTED_UNIFORM: ScenarioGroundTruth = {
  id: 'bot-scripted-uniform',
  actorType: 'Bot',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isScripted'],
  description:
    'Uniform 50ms keystrokes, no mouse, no corrections',
  minDurationMs: 2000,
}

/** Bot — dispatchEvent input + programmatic file attachment. */
const BOT_STEALTH_PROGRAMMATIC: ScenarioGroundTruth = {
  id: 'bot-stealth-programmatic',
  actorType: 'Bot',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isScripted', 'isUploadAutomation'],
  description:
    'dispatchEvent input with programmatic file attach, no mouse',
  minDurationMs: 2000,
}

/** Bot — natural-looking mouse movement contradicted by machine-precise clicks. */
const BOT_MULTIMODAL: ScenarioGroundTruth = {
  id: 'bot-multimodal',
  actorType: 'Bot',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isMultimodalBot'],
  description:
    'Natural mouse movements BUT instant fills and click precision (cross-signal incoherence)',
  minDurationMs: 3000,
}

/** Bot — file upload via DataTransfer with EXIF-absent images. */
const BOT_UPLOAD_AUTOMATION: ScenarioGroundTruth = {
  id: 'bot-upload-automation',
  actorType: 'Bot',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isUploadAutomation'],
  description:
    'File attach via DataTransfer, EXIF-absent images',
  minDurationMs: 2000,
}

/** LLM agent — all fields pasted, minimal mouse, no scroll, instant fills. */
const LLM_PASTE_HEAVY: ScenarioGroundTruth = {
  id: 'llm-paste-heavy',
  actorType: 'LLMAgent',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isLLMAgent'],
  description:
    'All fields pasted in bulk, minimal mouse, no scroll, instant fills',
  minDurationMs: 2000,
}

/** LLM agent — machine-speed bursts, mouse stillness during inference, click precision. */
const LLM_RHYTHM_AGENT: ScenarioGroundTruth = {
  id: 'llm-rhythm-agent',
  actorType: 'LLMAgent',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isLLMAgent'],
  description:
    'Machine-speed bursts with uniform gap variance, mouse stillness, click precision',
  minDurationMs: 4000,
}

/** LLM agent — mixed typing and pasting, still paste-heavy and uniform. */
const LLM_HYBRID: ScenarioGroundTruth = {
  id: 'llm-hybrid',
  actorType: 'LLMAgent',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isLLMAgent'],
  description:
    'Some typing + some paste, paste-heavy and uniform rhythm (may also fire isScripted)',
  minDurationMs: 3000,
}

/**
 * Authorized agent — claims identity via window.__nyasaAgentSignature
 * before the scanner attaches. The SDK short-circuits to AuthorizedAgent.
 */
const AUTHORIZED_AGENT_CLAIM: ScenarioGroundTruth = {
  id: 'authorized-agent-claim',
  actorType: 'AuthorizedAgent',
  expectedVerdict: 'AuthorizedAgent',
  expectedFiredRules: ['isAuthorizedAgent'],
  description:
    'Sets window.__nyasaAgentSignature before scanner attach, then interacts',
  minDurationMs: 2000,
}

/**
 * Calibration — fast typing with occasional corrections.
 * Near-miss for isScripted: tests the boundary between fast human and
 * deterministic scripted timing.
 */
const CALIBRATION_NEAR_MISS_SCRIPTED: ScenarioGroundTruth = {
  id: 'calibration-near-miss-scripted',
  actorType: 'Bot',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isScripted'],
  description:
    'Fast typing with occasional corrections, short field dwells \u2014 near-miss threshold testing',
  minDurationMs: 2000,
  isCalibration: true,
}

/**
 * Calibration — Playwright in headful mode.
 * navigator.webdriver is still true in headful Playwright, so isHeadless
 * fires. Documents the Playwright footprint that exists even with a
 * visible browser window.
 */
const CALIBRATION_BARE_PLAYWRIGHT_HEADFUL: ScenarioGroundTruth = {
  id: 'calibration-bare-playwright-headful',
  actorType: 'Bot',
  expectedVerdict: 'UnauthorizedBot',
  expectedFiredRules: ['isHeadless'],
  description:
    'Playwright in headful mode, webdriver=true but natural behavior \u2014 documents Playwright footprint',
  minDurationMs: 2000,
  isCalibration: true,
}

/**
 * All 14 benchmark scenarios.
 * Order: Humans (3), Bots (5), LLM Agents (3), Authorized Agent (1), Calibration (2).
 */
export const SCENARIOS: ScenarioGroundTruth[] = [
  HUMAN_NATURAL,
  HUMAN_FAST_TYPIST,
  HUMAN_CAUTIOUS,
  BOT_HEADLESS_CHROME,
  BOT_SCRIPTED_UNIFORM,
  BOT_STEALTH_PROGRAMMATIC,
  BOT_MULTIMODAL,
  BOT_UPLOAD_AUTOMATION,
  LLM_PASTE_HEAVY,
  LLM_RHYTHM_AGENT,
  LLM_HYBRID,
  AUTHORIZED_AGENT_CLAIM,
  CALIBRATION_NEAR_MISS_SCRIPTED,
  CALIBRATION_BARE_PLAYWRIGHT_HEADFUL,
]

/** IDs of calibration-only scenarios, excluded from F1/F2 accuracy metrics. */
export const CALIBRATION_SCENARIO_IDS: ReadonlySet<string> = new Set([
  'calibration-near-miss-scripted',
  'calibration-bare-playwright-headful',
])
