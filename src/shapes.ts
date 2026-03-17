import type { Axial } from './hex';

export type Shape = { id: string; name: string; cells: Axial[] };

export function hexagon(radius: number): Axial[] {
  const cells: Axial[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) cells.push({ q, r });
  }
  return cells;
}

export function axialRect(w: number, h: number): Axial[] {
  const cells: Axial[] = [];
  const q0 = -Math.floor(w / 2);
  const r0 = -Math.floor(h / 2);
  for (let dq = 0; dq < w; dq++) {
    for (let dr = 0; dr < h; dr++) {
      cells.push({ q: q0 + dq, r: r0 + dr });
    }
  }
  return dedup(cells);
}

export function ring(radius: number): Axial[] {
  const outer = new Set(hexagon(radius).map(k));
  const inner = new Set(hexagon(radius - 1).map(k));
  const cells: Axial[] = [];
  for (const key of outer) if (!inner.has(key)) {
    const [q, r] = key.split(',').map(Number);
    cells.push({ q, r });
  }
  return cells;
}

export function rocket(): Axial[] {
  const cells: Axial[] = [];
  for (let r = -4; r <= 4; r++) cells.push({ q: 0, r });
  for (let r = -3; r <= 3; r++) cells.push({ q: 1, r }, { q: -1, r });
  cells.push({ q: 0, r: -5 }, { q: 0, r: -6 });
  cells.push({ q: 2, r: 3 }, { q: 2, r: 4 });
  cells.push({ q: -2, r: 3 }, { q: -2, r: 4 });
  cells.push({ q: 0, r: 5 }, { q: 0, r: 6 });
  return dedup(cells);
}

type Segment = [number, number];
export function unicornHeadV2(): Axial[] {
  const rows: Record<number, Segment[]> = {
    [-6]: [[4, 4]],
    [-5]: [[3, 4]],
    [-4]: [[2, 4]],
    [-3]: [[1, 4], [-1, 0]],
    [-2]: [[0, 5], [-2, -1]],
    [-1]: [[-3, 5]],
    [0]:  [[-4, 5]],
    [1]:  [[-4, 4]],
    [2]:  [[-3, 4]],
    [3]:  [[-2, 3]],
    [4]:  [[-1, 2]],
    [5]:  [[0, 1]],
  };

  const cells: Axial[] = [];
  for (const rStr of Object.keys(rows)) {
    const r = Number(rStr);
    for (const [qMin, qMax] of rows[r]) {
      for (let q = qMin; q <= qMax; q++) cells.push({ q, r });
    }
  }
  return dedup(cells);
}

export const SHAPES: Shape[] = [
  { id: 'rect', name: 'Quasi-carré', cells: axialRect(8, 8) },
  { id: 'hex', name: 'Hexagone', cells: hexagon(5) },
  { id: 'ring', name: 'Anneau', cells: ring(6) },
  { id: 'rocket', name: 'Fusée', cells: rocket() },
  { id: 'unicorn', name: 'Tête de licorne', cells: unicornHeadV2() },
];

function k(a: Axial) { return `${a.q},${a.r}`; }
function dedup(cells: Axial[]) {
  const m = new Map<string, Axial>();
  for (const c of cells) m.set(k(c), c);
  return [...m.values()];
}