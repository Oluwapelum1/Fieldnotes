// lib/annotations/anchor.ts — Target element measurement, anchoring geometry, and missing-target handling
import type { Point, RectGeometry } from './paths';

export type AnchorSide = 'top' | 'bottom' | 'left' | 'right' | 'around';

export interface AnchorSpec {
  id: string;
  targetSelector: string;
  side: AnchorSide;
  offsetX?: number;
  offsetY?: number;
}

export interface ComputedAnchor {
  id: string;
  rect: RectGeometry;
  anchorPoint: Point;
}

/**
 * Resolves a target element within `container`, measures its bounding box relative to `container`,
 * and computes anchor geometry. Logs a console warning and returns null if target cannot be found.
 */
export function resolveAnchorGeometry(
  container: HTMLElement | Document,
  spec: AnchorSpec,
  warnFn: (msg: string) => void = console.warn
): ComputedAnchor | null {
  const target = container.querySelector(spec.targetSelector) as HTMLElement | null;
  if (!target) {
    warnFn(
      `[Fieldnotes Annotation] Target element "${spec.targetSelector}" for mark "${spec.id}" was not found. Skipping annotation.`
    );
    return null;
  }

  const containerEl =
    container instanceof Document ? container.documentElement : container;
  const cRect = containerEl.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();

  const ox = spec.offsetX ?? 0;
  const oy = spec.offsetY ?? 0;

  const rect: RectGeometry = {
    x: tRect.left - cRect.left + ox,
    y: tRect.top - cRect.top + oy,
    width: tRect.width,
    height: tRect.height,
  };

  let anchorPoint: Point = { x: rect.x, y: rect.y };
  switch (spec.side) {
    case 'top':
      anchorPoint = { x: rect.x + rect.width / 2, y: rect.y };
      break;
    case 'bottom':
      anchorPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height };
      break;
    case 'left':
      anchorPoint = { x: rect.x, y: rect.y + rect.height / 2 };
      break;
    case 'right':
      anchorPoint = { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
      break;
    case 'around':
      anchorPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      break;
  }

  return {
    id: spec.id,
    rect,
    anchorPoint,
  };
}

/**
 * Attaches a ResizeObserver to recompute positions when the container or window resizes,
 * without mutating any layout properties on the target elements.
 */
export function observeAnchorContainer(
  container: HTMLElement,
  specs: AnchorSpec[],
  onUpdate: (computed: ComputedAnchor[]) => void,
  warnFn: (msg: string) => void = console.warn
): () => void {
  const warnedMissing = new Set<string>();
  const guardedWarn = (msg: string) => {
    if (!warnedMissing.has(msg)) {
      warnedMissing.add(msg);
      warnFn(msg);
    }
  };

  const measureAll = () => {
    // Enforce at most 3 annotations per viewport / container group
    const resolved: ComputedAnchor[] = [];
    for (const spec of specs) {
      if (resolved.length >= 3) break;
      const item = resolveAnchorGeometry(container, spec, guardedWarn);
      if (item) resolved.push(item);
    }
    onUpdate(resolved);
  };

  measureAll();

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      measureAll();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }

  return () => {};
}

