export type Axial = { q: number; r: number };
export const keyOf = (a: Axial) => `${a.q},${a.r}`;

export const DIRS: Axial[] = [
  { q: 1, r: 0 }, { q: -1, r: 0 },
  { q: 0, r: 1 }, { q: 0, r: -1 },
  { q: 1, r: -1 }, { q: -1, r: 1 },
];

export function neighbors(a: Axial): Axial[] {
  return DIRS.map(d => ({ q: a.q + d.q, r: a.r + d.r }));
}

// Pointy-top axial -> pixel
export function axialToPixel(a: Axial, size: number) {
  const x = size * (Math.sqrt(3) * a.q + (Math.sqrt(3) / 2) * a.r);
  const y = size * (3 / 2) * a.r;
  return { x, y };
}

function hexCorner(cx: number, cy: number, size: number, i: number) {
  // pointy-top: start angle -30deg
  const angle = (Math.PI / 180) * (60 * i - 30);
  return { x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) };
}

export function hexPolygonPoints(cx: number, cy: number, size: number) {
  const pts = Array.from({ length: 6 }, (_, i) => hexCorner(cx, cy, size, i));
  return pts.map(p => `${p.x},${p.y}`).join(' ');
}