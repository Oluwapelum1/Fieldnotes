// tests/annotations.test.ts — Unit tests for deterministic SVG path generators and DOM anchoring (Part 5.9)
import { describe, it, expect, vi } from 'vitest';
import {
  wobblyLine,
  arrow,
  circle,
  bracket,
  tick,
  cross,
  computeStrokeDurationMs,
} from '../lib/annotations/paths';
import {
  resolveAnchorGeometry,
  observeAnchorContainer,
} from '../lib/annotations/anchor';

describe('Hand-drawn Annotation Engine (Part 5.9)', () => {
  it('returns identical path strings for the same seed and geometry', () => {
    const p1 = wobblyLine({ x: 0, y: 10 }, { x: 140, y: 10 }, 42);
    const p2 = wobblyLine({ x: 0, y: 10 }, { x: 140, y: 10 }, 42);
    expect(p1).toBe(p2);

    const a1 = arrow({ x: 10, y: 20 }, { x: 120, y: 80 }, 99);
    const a2 = arrow({ x: 10, y: 20 }, { x: 120, y: 80 }, 99);
    expect(a1).toBe(a2);
  });

  it('returns different path strings for different seeds', () => {
    const p1 = wobblyLine({ x: 0, y: 10 }, { x: 140, y: 10 }, 42);
    const p2 = wobblyLine({ x: 0, y: 10 }, { x: 140, y: 10 }, 43);
    expect(p1).not.toBe(p2);

    const c1 = circle({ x: 10, y: 10, width: 80, height: 32 }, 1);
    const c2 = circle({ x: 10, y: 10, width: 80, height: 32 }, 2);
    expect(c1).not.toBe(c2);
  });

  it('builds valid SVG path commands for bracket, tick, and cross', () => {
    expect(bracket({ x: 10, y: 10, width: 100, height: 48 }, 7)).toContain('M ');
    expect(tick({ x: 0, y: 0 }, 11)).toContain('L ');
    expect(cross({ x: 0, y: 0 }, 15)).toContain('M ');
  });

  it('caps stroke animation duration at 800 ms max', () => {
    expect(computeStrokeDurationMs(50)).toBeGreaterThanOrEqual(500);
    expect(computeStrokeDurationMs(5000)).toBeLessThanOrEqual(800);
  });

  it('draws nothing and logs one warning when a target selector is missing', () => {
    const container = document.createElement('div');
    const warnSpy = vi.fn();

    const res = resolveAnchorGeometry(
      container,
      { id: 'missing-mark', targetSelector: '#does-not-exist', side: 'left' },
      warnSpy
    );
    expect(res).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('recomputes anchor positions without mutating target element layout and caps at 3 marks', () => {
    const container = document.createElement('div');
    for (let i = 1; i <= 4; i++) {
      const el = document.createElement('span');
      el.id = `target-${i}`;
      el.style.width = '50px';
      container.appendChild(el);
    }

    let latest: ReturnType<typeof resolveAnchorGeometry>[] = [];
    const disconnect = observeAnchorContainer(
      container,
      [
        { id: 'm1', targetSelector: '#target-1', side: 'bottom' },
        { id: 'm2', targetSelector: '#target-2', side: 'bottom' },
        { id: 'm3', targetSelector: '#target-3', side: 'bottom' },
        { id: 'm4', targetSelector: '#target-4', side: 'bottom' },
      ],
      (computed) => {
        latest = computed;
      }
    );

    // At most 3 annotations per container/viewport
    expect(latest.length).toBe(3);
    expect(container.querySelector('#target-1')?.getAttribute('style')).toBe('width: 50px;');
    disconnect();
  });
});

