// lib/demo-engine/schedule.ts — Pure, deterministic timeline scheduler for the hero demo workspace
import type { Scenario } from '../config-schema';
import type { ScheduleOptions, TimelineEvent } from './types';
import { mulberry32, hashString } from '../annotations/prng';

/**
 * Computes the total streaming budget in milliseconds for a given character count at 1x speed,
 * clamped between minStreamMs (1500) and maxStreamMs (3500), then divided by speed (1 or 2).
 */
export function computeStreamingBudgetMs(
  totalCharacters: number,
  options: ScheduleOptions
): number {
  const charsPerSecond = options.charsPerSecond ?? 35;
  const minStreamMs = options.minStreamMs ?? 1500;
  const maxStreamMs = options.maxStreamMs ?? 3500;
  const rawSeconds = totalCharacters / charsPerSecond;
  const rawMs = rawSeconds * 1000;
  const clamped1x = Math.min(maxStreamMs, Math.max(minStreamMs, rawMs));
  return Math.round(clamped1x / options.speed);
}

/**
 * Pure function: turns a Scenario and ScheduleOptions into a sorted list of TimelineEvents.
 * Same scenario and options always produce the exact same timeline.
 */
export function buildTimeline(
  scenario: Scenario,
  options: ScheduleOptions
): TimelineEvent[] {
  const speed = options.speed;
  const scale = (ms1x: number) => Math.round(ms1x / speed);
  const events: TimelineEvent[] = [];

  // 1. 0 to 300 ms: Select phase & Input lines fade in 40 ms apart (600 ms max total)
  events.push({
    t: 0,
    type: 'select',
    payload: {
      scenarioId: scenario.id,
      chipLabel: scenario.chipLabel,
      title: scenario.title,
    },
  });

  const numInputs = scenario.inputBlocks.length;
  const inputSpacing1x = numInputs > 1 ? Math.min(40, Math.floor(600 / numInputs)) : 0;
  scenario.inputBlocks.forEach((block, index) => {
    events.push({
      t: scale(index * inputSpacing1x),
      type: 'inputLine',
      payload: {
        blockId: block.id,
        index,
        total: numInputs,
      },
    });
  });

  // 2. 300 to 1100 ms: Reading phase — marker highlight sweeps over attended lines, 120 ms apart
  const attendedBlocks = scenario.inputBlocks.filter((b) => b.attended);
  attendedBlocks.forEach((block, idx) => {
    const start1x = 300 + idx * 120;
    events.push({
      t: scale(start1x),
      type: 'attend',
      payload: {
        blockId: block.id,
        readCount: idx + 1,
        totalToRead: scenario.inputBlocks.length,
        attendedTotal: attendedBlocks.length,
        durationMs: scale(500),
      },
    });
  });

  // 3. 1100 to 1500 ms: Planning phase — step list gains items
  const numSteps = scenario.steps.length;
  const stepSpacing1x = numSteps > 0 ? Math.floor(400 / numSteps) : 80;
  scenario.steps.forEach((step, idx) => {
    events.push({
      t: scale(1100 + idx * stepSpacing1x),
      type: 'plan',
      payload: {
        stepId: step.id,
        label: step.label,
        detail: step.detail,
        index: idx,
      },
    });
  });

  // 4. From 1500 ms: Writing & Sourcing phase
  // Gather all segments across outputCards and calculate total characters
  interface FlatSegment {
    cardId: string;
    cardIndex: number;
    segmentIndex: number;
    text: string;
    sources: string[];
    claimType: 'sourced' | 'inferred' | 'unknown';
    stepId: string;
  }

  const flatSegments: FlatSegment[] = [];
  scenario.outputCards.forEach((card, cardIndex) => {
    card.segments.forEach((seg, segmentIndex) => {
      const resolvedType =
        seg.claimType ?? (seg.sources.length > 0 ? 'sourced' : 'unknown');
      flatSegments.push({
        cardId: card.id,
        cardIndex,
        segmentIndex,
        text: seg.text,
        sources: seg.sources,
        claimType: resolvedType,
        stepId: seg.stepId,
      });
    });
  });

  const totalChars = flatSegments.reduce((acc, s) => acc + s.text.length, 0);
  const streamBudget1x = computeStreamingBudgetMs(totalChars, {
    ...options,
    speed: 1,
  });

  // Seeded PRNG for punctuation + +/-30% jitter inside the clamped budget
  const rng = mulberry32(hashString(scenario.id));

  let cursor1x = 1500;
  const seenCards = new Set<string>();

  flatSegments.forEach((seg) => {
    if (!seenCards.has(seg.cardId)) {
      seenCards.add(seg.cardId);
      events.push({
        t: scale(cursor1x),
        type: 'writeStart',
        payload: {
          cardId: seg.cardId,
          cardIndex: seg.cardIndex,
        },
      });
    }

    const segWeight = totalChars > 0 ? seg.text.length / totalChars : 1 / flatSegments.length;
    const segBudget1x = Math.max(80, Math.round(streamBudget1x * segWeight));

    // Compute per-character relative weights using punctuation pauses and +/-30% jitter
    const chars = Array.from(seg.text);
    const weights: number[] = chars.map((ch) => {
      let base = 28;
      if (ch === ',') base += 120;
      else if (ch === '.' || ch === '!' || ch === '?' || ch === '。') base += 260;
      const jitter = 0.7 + rng() * 0.6; // 0.7 to 1.3 (+/- 30%)
      return base * jitter;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    let accumWeight = 0;

    // Emit chunked character slices (~every 3 chars or on punctuation) to keep event count nimble for 60fps
    for (let i = 0; i < chars.length; i++) {
      accumWeight += weights[i];
      const isLast = i === chars.length - 1;
      const isPunct = chars[i] === ',' || chars[i] === '.' || chars[i] === '。';
      if (isLast || isPunct || i % 3 === 0) {
        const dt1x = Math.round((accumWeight / totalWeight) * segBudget1x);
        events.push({
          t: scale(cursor1x + dt1x),
          type: 'chars',
          payload: {
            cardId: seg.cardId,
            segmentIndex: seg.segmentIndex,
            text: chars.slice(0, i + 1).join(''),
            charCount: i + 1,
            isComplete: isLast,
          },
        });
      }
    }

    const segEnd1x = cursor1x + segBudget1x;

    // Sourcing: 120 ms after claim completes, its source chips pop in
    events.push({
      t: scale(segEnd1x + 120),
      type: 'chip',
      payload: {
        cardId: seg.cardId,
        segmentIndex: seg.segmentIndex,
        sources: seg.sources,
        claimType: seg.claimType,
        stepId: seg.stepId,
      },
    });

    cursor1x = segEnd1x;
  });

  // 5. After the last card: Checking phase — caveat draws a red-pencil bracket (600 ms)
  const checkStart1x = cursor1x + 160;
  scenario.caveats.forEach((cav, idx) => {
    events.push({
      t: scale(checkStart1x + idx * 200),
      type: 'caveat',
      payload: {
        caveatId: cav.id,
        text: cav.text,
        relatedBlocks: cav.relatedBlocks,
        conflictNote: cav.conflictNote ?? null,
        strokeDurationMs: scale(600),
      },
    });
  });

  // 6. End: Done phase
  const doneTime1x =
    scenario.caveats.length > 0
      ? checkStart1x + scenario.caveats.length * 200 + 600
      : checkStart1x + 120;

  events.push({
    t: scale(doneTime1x),
    type: 'done',
    payload: {
      scenarioId: scenario.id,
      sampleRunSeconds: scenario.sampleRunSeconds,
      cardCount: scenario.outputCards.length,
      sourceCount: new Set(flatSegments.flatMap((s) => s.sources)).size,
      caveatCount: scenario.caveats.length,
    },
  });

  return events.sort((a, b) => a.t - b.t);
}

/**
 * Pure helper to fold all timeline events up to `elapsedMs` into a deterministic DemoSnapshot.
 */
export function computeSnapshotAtTime(
  scenario: Scenario,
  timeline: TimelineEvent[],
  elapsedMs: number
): {
  visibleInputIds: string[];
  attendedInputIds: string[];
  readCount: number;
  visibleStepIds: string[];
  visibleCardIds: string[];
  cardSegmentsText: Record<string, string>;
  visibleChipKeys: string[];
  visibleCaveatIds: string[];
  isDone: boolean;
} {
  const visibleInputIds: string[] = [];
  const attendedInputIds: string[] = [];
  let readCount = 0;
  const visibleStepIds: string[] = [];
  const visibleCardIds: string[] = [];
  const cardSegmentsText: Record<string, string> = {};
  const visibleChipKeys: string[] = [];
  const visibleCaveatIds: string[] = [];
  let isDone = false;

  for (const ev of timeline) {
    if (ev.t > elapsedMs) break;
    switch (ev.type) {
      case 'inputLine': {
        const id = String(ev.payload.blockId);
        if (!visibleInputIds.includes(id)) visibleInputIds.push(id);
        break;
      }
      case 'attend': {
        const id = String(ev.payload.blockId);
        if (!attendedInputIds.includes(id)) attendedInputIds.push(id);
        readCount = Number(ev.payload.readCount);
        break;
      }
      case 'plan': {
        const id = String(ev.payload.stepId);
        if (!visibleStepIds.includes(id)) visibleStepIds.push(id);
        break;
      }
      case 'writeStart': {
        const id = String(ev.payload.cardId);
        if (!visibleCardIds.includes(id)) visibleCardIds.push(id);
        break;
      }
      case 'chars': {
        const key = `${ev.payload.cardId}:${ev.payload.segmentIndex}`;
        cardSegmentsText[key] = String(ev.payload.text);
        break;
      }
      case 'chip': {
        const key = `${ev.payload.cardId}:${ev.payload.segmentIndex}`;
        if (!visibleChipKeys.includes(key)) visibleChipKeys.push(key);
        break;
      }
      case 'caveat': {
        const id = String(ev.payload.caveatId);
        if (!visibleCaveatIds.includes(id)) visibleCaveatIds.push(id);
        break;
      }
      case 'done': {
        isDone = true;
        break;
      }
    }
  }

  return {
    visibleInputIds,
    attendedInputIds,
    readCount,
    visibleStepIds,
    visibleCardIds,
    cardSegmentsText,
    visibleChipKeys,
    visibleCaveatIds,
    isDone,
  };
}

