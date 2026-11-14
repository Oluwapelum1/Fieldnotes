// tests/schedule.test.ts — Unit tests for pure demo timeline scheduler & streaming vectors (Part 5.9)
import { describe, it, expect } from 'vitest';
import {
  buildTimeline,
  computeStreamingBudgetMs,
  computeSnapshotAtTime,
} from '../lib/demo-engine/schedule';
import { getScenariosForLocale } from '../lib/config-loader';

describe('Timeline Scheduler & Streaming Vectors (Part 5.9)', () => {
  it('computes streaming time clamped to 1.5 s .. 3.5 s at 1x speed (Part 5.9 vectors)', () => {
    // 40 chars / 35 = 1.14 s -> clamped to 1.5 s (1500 ms)
    expect(computeStreamingBudgetMs(40, { speed: 1 })).toBe(1500);
    // 70 chars / 35 = 2.0 s -> 2.0 s (2000 ms)
    expect(computeStreamingBudgetMs(70, { speed: 1 })).toBe(2000);
    // 200 chars / 35 = 5.71 s -> clamped to 3.5 s (3500 ms)
    expect(computeStreamingBudgetMs(200, { speed: 1 })).toBe(3500);
  });

  it('halves streaming time at 2x speed', () => {
    expect(computeStreamingBudgetMs(40, { speed: 2 })).toBe(750);
    expect(computeStreamingBudgetMs(70, { speed: 2 })).toBe(1000);
    expect(computeStreamingBudgetMs(200, { speed: 2 })).toBe(1750);
  });

  it('is pure: same scenario and options always produce the exact same timeline', () => {
    const scenario = getScenariosForLocale('en')[0];
    const t1 = buildTimeline(scenario, { speed: 1 });
    const t2 = buildTimeline(scenario, { speed: 1 });
    expect(t1).toEqual(t2);
  });

  it('scales event timestamps by half when speed is 2x', () => {
    const scenario = getScenariosForLocale('en')[0];
    const t1 = buildTimeline(scenario, { speed: 1 });
    const t2 = buildTimeline(scenario, { speed: 2 });
    const done1 = t1.find((e) => e.type === 'done')!;
    const done2 = t2.find((e) => e.type === 'done')!;
    expect(done2.t).toBe(Math.round(done1.t / 2));
  });

  it('folds snapshot states accurately from start to done', () => {
    const scenario = getScenariosForLocale('en')[0];
    const timeline = buildTimeline(scenario, { speed: 1 });
    const doneEvent = timeline.find((e) => e.type === 'done')!;
    const endSnap = computeSnapshotAtTime(scenario, timeline, doneEvent.t + 10);

    expect(endSnap.isDone).toBe(true);
    expect(endSnap.visibleInputIds.length).toBe(scenario.inputBlocks.length);
    expect(endSnap.visibleStepIds.length).toBe(scenario.steps.length);
    expect(endSnap.visibleCardIds.length).toBe(scenario.outputCards.length);
    expect(endSnap.visibleCaveatIds.length).toBe(scenario.caveats.length);
  });
});

