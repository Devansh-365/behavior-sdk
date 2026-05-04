import type { ScenarioRegistry } from './types.js'
import { authorizedAgentClaim } from './authorized-agent-claim.js'
import { botHeadlessChrome } from './bot-headless-chrome.js'
import { botMultimodal } from './bot-multimodal.js'
import { botScriptedUniform } from './bot-scripted-uniform.js'
import { botStealthProgrammatic } from './bot-stealth-programmatic.js'
import { botUploadAutomation } from './bot-upload-automation.js'
import { calibrationBarePlaywrightHeadful } from './calibration-bare-playwright-headful.js'
import { calibrationNearMissScripted } from './calibration-near-miss-scripted.js'
import { humanCautious } from './human-cautious.js'
import { humanFastTypist } from './human-fast-typist.js'
import { humanNatural } from './human-natural.js'
import { llmHybrid } from './llm-hybrid.js'
import { llmPasteHeavy } from './llm-paste-heavy.js'
import { llmRhythmAgent } from './llm-rhythm-agent.js'

export const registry: ScenarioRegistry = new Map([
  ['bot-headless-chrome', botHeadlessChrome],
  ['bot-scripted-uniform', botScriptedUniform],
  ['bot-stealth-programmatic', botStealthProgrammatic],
  ['bot-multimodal', botMultimodal],
  ['bot-upload-automation', botUploadAutomation],
  ['llm-paste-heavy', llmPasteHeavy],
  ['llm-rhythm-agent', llmRhythmAgent],
  ['llm-hybrid', llmHybrid],
  ['human-natural', humanNatural],
  ['human-fast-typist', humanFastTypist],
  ['human-cautious', humanCautious],
  ['authorized-agent-claim', authorizedAgentClaim],
  ['calibration-near-miss-scripted', calibrationNearMissScripted],
  ['calibration-bare-playwright-headful', calibrationBarePlaywrightHeadful],
])
