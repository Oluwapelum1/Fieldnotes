// lib/demo-engine/scripted-engine.ts — Default ScriptedEngine implementation playing scenario JSON files
import type { Scenario } from '../config-schema';
import type { DemoEngine, ScheduleOptions, TimelineEvent } from './types';
import { buildTimeline } from './schedule';

export class ScriptedEngine implements DemoEngine {
  public readonly id = 'scripted' as const;
  public readonly isScripted = true;

  public getTimeline(scenario: Scenario, options: ScheduleOptions): TimelineEvent[] {
    return buildTimeline(scenario, options);
  }
}

export const defaultScriptedEngine = new ScriptedEngine();

