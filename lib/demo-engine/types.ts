// lib/demo-engine/types.ts — Core types and DemoEngine interface for Fieldnotes hero workspace
import type { Scenario } from '../config-schema';

export type { Scenario };

export type TimelineEventType =
  | 'select'
  | 'inputLine'
  | 'attend'
  | 'plan'
  | 'writeStart'
  | 'chars'
  | 'chip'
  | 'caveat'
  | 'done';

export interface TimelineEvent {
  t: number; // milliseconds from the start, already divided by speed
  type: TimelineEventType;
  payload: Record<string, unknown>; // ids, text slices, counts
}

export interface ScheduleOptions {
  speed: 1 | 2;
  charsPerSecond?: number; // default 35
  minStreamMs?: number; // default 1500
  maxStreamMs?: number; // default 3500
}

export type DemoRunStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'done'
  | 'skipped'
  | 'custom'
  | 'error';

export interface DemoSnapshot {
  scenarioId: string;
  status: DemoRunStatus;
  statusLine: string;
  visibleInputIds: string[];
  attendedInputIds: string[];
  readCount: number;
  totalToRead: number;
  visibleStepIds: string[];
  cardSegmentsText: Record<string, string>; // key: `${cardId}:${segmentIdx}`
  visibleCardIds: string[];
  visibleChipKeys: string[]; // key: `${cardId}:${segmentIdx}`
  visibleCaveatIds: string[];
  elapsedMs: number;
}

export interface DemoEngine {
  id: 'scripted' | 'live';
  isScripted: boolean;
  getTimeline(scenario: Scenario, options: ScheduleOptions): TimelineEvent[];
}

