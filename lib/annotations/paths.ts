// lib/annotations/paths.ts — Seeded SVG path generators for hand-drawn notebook annotations (Part 2.4)
import { mulberry32 } from './prng';

export interface Point {
  x: number;
  y: number;
}

export interface RectGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

const fmt = (n: number): string => Number(n.toFixed(2)).toString();

/**
 * Wobbly line: A straight line with 3 to 5 control points offset by up to 1.5 px perpendicular to it.
 */
export function wobblyLine(start: Point, end: Point, seed: number): string {
  const rng = mulberry32(seed);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  // Unit perpendicular vector
  const nx = -dy / len;
  const ny = dx / len;

  const numPoints = 3 + Math.floor(rng() * 3); // 3, 4, or 5 internal points
  const pts: Point[] = [start];

  for (let i = 1; i <= numPoints; i++) {
    const t = i / (numPoints + 1);
    const offset = (rng() * 2 - 1) * 1.5; // [-1.5, +1.5] px
    pts.push({
      x: start.x + dx * t + nx * offset,
      y: start.y + dy * t + ny * offset,
    });
  }
  pts.push(end);

  let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${fmt(prev.x)} ${fmt(prev.y)} ${fmt(midX)} ${fmt(midY)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${fmt(last.x)} ${fmt(last.y)}`;
  return d;
}

/**
 * Curved arrow: A cubic curve whose control points are offset by 6 to 14 px;
 * the head is two short strokes at 25 degrees.
 */
export function arrow(
  start: Point,
  end: Point,
  seed: number,
  options?: { flipBend?: boolean }
): string {
  const rng = mulberry32(seed);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (options?.flipBend ? -1 : 1);
  const ny = (dx / len) * (options?.flipBend ? -1 : 1);

  const offset1 = 6 + rng() * 8; // 6 to 14 px
  const offset2 = 6 + rng() * 8; // 6 to 14 px

  const c1: Point = {
    x: start.x + dx * 0.33 + nx * offset1,
    y: start.y + dy * 0.33 + ny * offset1,
  };
  const c2: Point = {
    x: start.x + dx * 0.68 + nx * offset2,
    y: start.y + dy * 0.68 + ny * offset2,
  };

  // Tangent at end of cubic bezier is from c2 to end
  const tx = end.x - c2.x;
  const ty = end.y - c2.y;
  const baseAngle = Math.atan2(ty, tx);
  const headAngle = (25 * Math.PI) / 180; // 25 degrees
  const headLen = 8.5 + rng() * 1.5;

  const wing1: Point = {
    x: end.x - Math.cos(baseAngle - headAngle) * headLen,
    y: end.y - Math.sin(baseAngle - headAngle) * headLen,
  };
  const wing2: Point = {
    x: end.x - Math.cos(baseAngle + headAngle) * headLen,
    y: end.y - Math.sin(baseAngle + headAngle) * headLen,
  };

  return [
    `M ${fmt(start.x)} ${fmt(start.y)}`,
    `C ${fmt(c1.x)} ${fmt(c1.y)} ${fmt(c2.x)} ${fmt(c2.y)} ${fmt(end.x)} ${fmt(end.y)}`,
    `M ${fmt(wing1.x)} ${fmt(wing1.y)} L ${fmt(end.x)} ${fmt(end.y)} L ${fmt(wing2.x)} ${fmt(wing2.y)}`,
  ].join(' ');
}

/**
 * Circle: An imperfect ellipse that overshoots its start by about 8 percent,
 * so the ends overlap as when circled by hand.
 */
export function circle(rect: RectGeometry, seed: number): string {
  const rng = mulberry32(seed);
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const rx = rect.width / 2 + 6;
  const ry = rect.height / 2 + 4;

  const steps = 16;
  const totalRadians = Math.PI * 2 * 1.08; // 8% overshoot overlap
  const startAngle = -Math.PI * 0.65 + (rng() - 0.5) * 0.2;

  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + t * totalRadians;
    const radialJitter = 1 + (rng() * 2 - 1) * 0.04;
    pts.push({
      x: cx + Math.cos(angle) * rx * radialJitter,
      y: cy + Math.sin(angle) * ry * radialJitter,
    });
  }

  let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${fmt(pts[i].x)} ${fmt(pts[i].y)}`;
  }
  return d;
}

/**
 * Bracket: A square or curly bracket with a slightly uneven spine.
 */
export function bracket(
  rect: RectGeometry,
  seed: number,
  side: 'left' | 'right' = 'left'
): string {
  const rng = mulberry32(seed);
  const xSpine = side === 'left' ? rect.x : rect.x + rect.width;
  const dir = side === 'left' ? 1 : -1;
  const lip = Math.min(8, Math.max(5, rect.width || 7)) * dir;

  const topY = rect.y;
  const midY = rect.y + rect.height / 2 + (rng() - 0.5) * 2;
  const botY = rect.y + rect.height;
  const spineWobble = xSpine + (rng() * 2 - 1) * 1.2;

  return [
    `M ${fmt(xSpine + lip)} ${fmt(topY)}`,
    `L ${fmt(xSpine)} ${fmt(topY + (rng() - 0.5) * 0.8)}`,
    `Q ${fmt(spineWobble)} ${fmt(midY)} ${fmt(xSpine)} ${fmt(botY)}`,
    `L ${fmt(xSpine + lip)} ${fmt(botY + (rng() - 0.5) * 0.8)}`,
  ].join(' ');
}

/**
 * Tick: Two-stroke verified mark.
 */
export function tick(origin: Point, seed: number, size = 14): string {
  const rng = mulberry32(seed);
  const p1: Point = {
    x: origin.x + size * 0.15,
    y: origin.y + size * 0.55 + (rng() - 0.5),
  };
  const p2: Point = {
    x: origin.x + size * 0.42,
    y: origin.y + size * 0.82 + (rng() - 0.5),
  };
  const p3: Point = {
    x: origin.x + size * 0.88 + (rng() - 0.5),
    y: origin.y + size * 0.18 + (rng() - 0.5),
  };
  return `M ${fmt(p1.x)} ${fmt(p1.y)} L ${fmt(p2.x)} ${fmt(p2.y)} L ${fmt(p3.x)} ${fmt(p3.y)}`;
}

/**
 * Cross: Two-stroke not-verified / crossed-out mark.
 */
export function cross(origin: Point, seed: number, size = 14): string {
  const rng = mulberry32(seed);
  const j = () => (rng() - 0.5) * 1.1;
  return [
    `M ${fmt(origin.x + size * 0.2 + j())} ${fmt(origin.y + size * 0.2 + j())}`,
    `L ${fmt(origin.x + size * 0.8 + j())} ${fmt(origin.y + size * 0.8 + j())}`,
    `M ${fmt(origin.x + size * 0.8 + j())} ${fmt(origin.y + size * 0.2 + j())}`,
    `L ${fmt(origin.x + size * 0.2 + j())} ${fmt(origin.y + size * 0.8 + j())}`,
  ].join(' ');
}

/**
 * Asterisk: Three-stroke footnote star.
 */
export function asterisk(origin: Point, seed: number, size = 12): string {
  const rng = mulberry32(seed);
  const cx = origin.x + size / 2;
  const cy = origin.y + size / 2;
  const r = size * 0.44;
  const strokes: string[] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3 + (rng() - 0.5) * 0.12;
    strokes.push(
      `M ${fmt(cx - Math.cos(a) * r)} ${fmt(cy - Math.sin(a) * r)} L ${fmt(cx + Math.cos(a) * r)} ${fmt(cy + Math.sin(a) * r)}`
    );
  }
  return strokes.join(' ');
}

/**
 * Question mark: Two-stroke hand-drawn question mark.
 */
export function questionMark(origin: Point, seed: number, size = 14): string {
  const rng = mulberry32(seed);
  const j = () => (rng() - 0.5) * 0.8;
  const x = origin.x;
  const y = origin.y;
  return [
    `M ${fmt(x + size * 0.28 + j())} ${fmt(y + size * 0.28)}`,
    `C ${fmt(x + size * 0.28)} ${fmt(y + size * 0.08)} ${fmt(x + size * 0.76)} ${fmt(y + size * 0.08)} ${fmt(x + size * 0.74)} ${fmt(y + size * 0.34)}`,
    `C ${fmt(x + size * 0.72)} ${fmt(y + size * 0.5)} ${fmt(x + size * 0.5)} ${fmt(y + size * 0.52)} ${fmt(x + size * 0.5 + j())} ${fmt(y + size * 0.68)}`,
    `M ${fmt(x + size * 0.5)} ${fmt(y + size * 0.84)} L ${fmt(x + size * 0.5 + 0.4)} ${fmt(y + size * 0.9)}`,
  ].join(' ');
}

/**
 * Computes stroke-dashoffset animation duration (500 to 700 ms, capped at 800 ms;
 * long marks draw faster so no mark ever exceeds 800 ms).
 */
export function computeStrokeDurationMs(pathLengthPx: number): number {
  const raw = 500 + Math.min(200, Math.round(pathLengthPx * 0.45));
  return Math.min(800, Math.max(500, raw));
}

