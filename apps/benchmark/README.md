# Benchmark Suite

Playwright-based benchmark harness that measures the detection accuracy of `@devanshhq/nyasa` across 4 actor types: **Bots**, **LLM Agents**, **Humans**, and **Authorized Agents**.

This is not a unit test suite. It runs real browser interactions through Playwright, captures the SDK's verdict and fired detection rules, and computes aggregate accuracy metrics.

## Quick Start

```bash
# From repo root
npm install
npm run web          # Start demo server (required — benchmark hits the live demo)
npm run benchmark    # Run all 14 scenarios
```

Or use `--auto-start` to launch the demo server automatically:

```bash
npm run benchmark -- --auto-start
```

## CLI Flags

| Command | Description |
|---------|-------------|
| `npm run benchmark` | Run all 14 scenarios with default settings |
| `npm run benchmark -- --filter bot` | Run only bot scenarios |
| `npm run benchmark -- --filter llm` | Run only LLM agent scenarios |
| `npm run benchmark -- --filter human` | Run only human scenarios |
| `npm run benchmark -- --headful` | Run in visible browser mode (useful for debugging) |
| `npm run benchmark -- --iterations 5` | Run each scenario 5 times and average results |
| `npm run benchmark -- --verbose` | Show debug output during execution |
| `npm run benchmark -- --json-only` | Write JSON results only, skip terminal output |
| `npm run benchmark -- --auto-start` | Auto-start demo server if not already running |

Filters accept partial matches. `--filter bot` matches `bot-headless-chrome`, `bot-scripted-uniform`, etc.

## How to Read Results

### Macro F1 Score

Balanced precision and recall across all 4 classes (Human, Bot, LLMAgent, AuthorizedAgent). Each class contributes equally regardless of sample size. A score of 1.0 means perfect classification.

### Macro F2 Score

Like F1 but weights recall twice as heavily as precision. This matters for bot detection: missing a bot (false negative) is worse than flagging a human (false positive). A higher F2 means the system catches more actual bots even if it occasionally mislabels a human.

### Confusion Matrix

A 4x4 table where rows are actual actor types and columns are predicted types. Diagonal cells are correct classifications. Off-diagonal cells show misclassifications.

```
                Predicted
              Human  Bot  LLM  Auth
Actual Human    3     0    0    0
Actual Bot      0     5    0    0
Actual LLM      0     1    2    0
Actual Auth     0     0    0    1
```

### Per-Actor-Type Accuracy

Breakdown of how well each actor type is detected:

- **Bot detection**: percentage of bot scenarios correctly classified as UnauthorizedBot
- **LLM Agent detection**: percentage of LLM scenarios correctly classified as UnauthorizedBot
- **Human acceptance**: percentage of human scenarios correctly classified as Human
- **Authorized Agent**: percentage of authorized agent scenarios correctly classified as AuthorizedAgent

### Per-Rule Accuracy

Shows which detection rules fired and whether they matched expectations. For example, if `isScripted` was expected to fire in 3 scenarios and fired in all 3, that rule has 100% accuracy.

## The 14 Scenarios

| ID | Actor Type | Expected Verdict | Expected Rules | Description |
|----|------------|-----------------|----------------|-------------|
| `human-natural` | Human | Human | *(none)* | Variable typing (50-150ms dwells), mouse with curvature, corrections, scroll, natural rhythm |
| `human-fast-typist` | Human | Human | *(none)* | Fast but human dwells (30-80ms), still some variance, corrections present |
| `human-cautious` | Human | Human | *(none)* | Slow deliberate corrections, long field dwells |
| `bot-headless-chrome` | Bot | UnauthorizedBot | `isHeadless` | Headless Chromium via Playwright, navigator.webdriver=true, CDP markers |
| `bot-scripted-uniform` | Bot | UnauthorizedBot | `isScripted` | Uniform 50ms keystrokes, no mouse, no corrections |
| `bot-stealth-programmatic` | Bot | UnauthorizedBot | `isScripted`, `isUploadAutomation` | dispatchEvent input with programmatic file attach, no mouse |
| `bot-multimodal` | Bot | UnauthorizedBot | `isMultimodalBot` | Natural mouse movements BUT instant fills and click precision (cross-signal incoherence) |
| `bot-upload-automation` | Bot | UnauthorizedBot | `isUploadAutomation` | File attach via DataTransfer, EXIF-absent images |
| `llm-paste-heavy` | LLMAgent | UnauthorizedBot | `isLLMAgent` | All fields pasted in bulk, minimal mouse, no scroll, instant fills |
| `llm-rhythm-agent` | LLMAgent | UnauthorizedBot | `isLLMAgent` | Machine-speed bursts with uniform gap variance, mouse stillness, click precision |
| `llm-hybrid` | LLMAgent | UnauthorizedBot | `isLLMAgent` | Some typing + some paste, paste-heavy and uniform rhythm (may also fire isScripted) |
| `authorized-agent-claim` | AuthorizedAgent | AuthorizedAgent | `isAuthorizedAgent` | Sets `window.__nyasaAgentSignature` before scanner attach, then interacts |
| `calibration-near-miss-scripted` | Bot | UnauthorizedBot | `isScripted` | Fast typing with occasional corrections, short field dwells — near-miss threshold testing |
| `calibration-bare-playwright-headful` | Bot | UnauthorizedBot | `isHeadless` | Playwright in headful mode, webdriver=true but natural behavior — documents Playwright footprint |

Calibration scenarios (last 2 rows) are excluded from F1/F2 computation. They probe decision boundaries rather than representing realistic traffic.

## Known Caveats

- **Playwright's `navigator.webdriver=true` footprint**: The `isHeadless` rule fires for ALL Playwright scenarios, including headful mode. This is Playwright's own detection footprint, not a flaw in the SDK. The calibration scenarios document this behavior explicitly.

- **Bare Playwright vs Stealth Playwright**: Some scenarios use Playwright's default behavior (which triggers `isHeadless`). Others attempt to avoid detection footprints. The distinction matters when interpreting which rules fire and why.

- **Calibration scenarios excluded from F1/F2**: The two calibration scenarios test threshold boundaries. They are included in per-rule accuracy but not in aggregate F1/F2 scores.

- **Human scenarios are synthetic**: Human interactions are programmatically simulated (variable typing delays, mouse curvature, corrections). They are not recorded from real humans. No real human false-positive rate (FPR) metrics exist in v1.

- **HTTP-only scenarios not testable with Playwright**: Scenarios that require raw HTTP requests (no browser) need curl or similar tooling. Playwright always runs in a browser context.

## How to Add New Scenarios

1. **Add ground truth**: Add a new entry to the `SCENARIOS` array in `src/ground-truth.ts` with id, actor type, expected verdict, expected fired rules, and description.

2. **Create a runner**: Create a new file in `src/scenarios/` that exports a `ScenarioRunner` function. Use existing runners as templates.

3. **Register it**: Add the runner to `src/scenarios/index.ts` so the harness can find it by scenario ID.

4. **Verify types**: Run `npm run typecheck` from the repo root. Zero errors required.

5. **Test it**: Run `npm run benchmark -- --filter your-scenario-id` to verify the scenario executes and produces expected results.

## Architecture

```
CLI (cli.ts) → Harness (harness.ts) → Scenario Runners (scenarios/) → Capture (capture.ts) → Metrics (metrics.ts) → Reporter (reporter.ts)
```

| Component | Role |
|-----------|------|
| **CLI** (`cli.ts`) | Argument parsing, flag handling, orchestration of the full run |
| **Harness** (`harness.ts`) | Creates a fresh BrowserContext per scenario, handles errors, implements retry logic |
| **Scenario Runners** (`scenarios/`) | Playwright scripts that simulate a specific actor's behavior on the demo page |
| **Capture** (`capture.ts`) | Scrapes the VerdictCard and DetectionsCard from the DOM, overrides `sendBeacon` to intercept the SDK payload |
| **Metrics** (`metrics.ts`) | Pure functions that compute Macro F1, Macro F2, 4x4 confusion matrix, per-rule accuracy, and per-actor-type accuracy |
| **Reporter** (`reporter.ts`) | Renders terminal ASCII tables and writes JSON output files |

Each scenario runs in isolation with its own browser context to prevent signal leakage between runs.
