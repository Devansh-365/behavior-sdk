import type { Page } from 'playwright'
import type { ScenarioGroundTruth } from '../types.js'

export type ScenarioRunner = (page: Page, groundTruth: ScenarioGroundTruth) => Promise<void>
export type ScenarioRegistry = Map<string, ScenarioRunner>
