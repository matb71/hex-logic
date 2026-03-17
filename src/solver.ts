import type { Axial } from './hex';
import { keyOf, neighbors } from './hex';

export type PuzzleCore = {
  cells: Axial[];
  clue: number[];
  K: number;
};

type Precomp = {
  n: number;
  neigh: number[][];
  rev: number[][];
  impactOrder: number[];
};

export function precompute(cells: Axial[]): { indexOf: Map<string, number>; pre: Precomp } {
  const indexOf = new Map<string, number>();
  cells.forEach((a, i) => indexOf.set(keyOf(a), i));

  const n = cells.length;
  const neigh: number[][] = Array.from({ length: n }, () => []);
  const rev: number[][] = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    for (const nb of neighbors(cells[i])) {
      const j = indexOf.get(keyOf(nb));
      if (j !== undefined) neigh[i].push(j);
    }
  }
  for (let c = 0; c < n; c++) {
    for (const v of neigh[c]) rev[v].push(c);
  }

  const impactOrder = Array.from({ length: n }, (_, i) => i)
    .sort((a, b) => (rev[b].length - rev[a].length) || (neigh[b].length - neigh[a].length));

  return { indexOf, pre: { n, neigh, rev, impactOrder } };
}

export function countSolutions(puzzle: PuzzleCore, pre: Precomp, limit = 2): number {
  const { n, neigh, rev, impactOrder } = pre;
  const clue = puzzle.clue;
  const K = puzzle.K;

  const assign = new Int8Array(n);
  assign.fill(-1);

  const known = new Int16Array(n);
  const unk = new Int16Array(n);
  for (let c = 0; c < n; c++) {
    const deg = neigh[c].length;
    if (clue[c] < 0 || clue[c] > deg) return 0;
    unk[c] = deg;
  }

  let blackKnown = 0;
  let unknownCount = n;

  const globalOk = () => blackKnown <= K && K <= blackKnown + unknownCount;

  const localOk = (affected: number[]) => {
    for (const c of affected) {
      const need = clue[c];
      const k = known[c];
      const u = unk[c];
      if (k > need) return false;
      if (k + u < need) return false;
    }
    return true;
  };

  const pickVar = () => {
    for (const v of impactOrder) if (assign[v] === -1) return v;
    return -1;
  };

  const apply = (v: number, val: 0 | 1, touched: number[]) => {
    assign[v] = val;
    unknownCount--;
    if (val === 1) blackKnown++;
    for (const c of rev[v]) {
      touched.push(c);
      unk[c]--;
      if (val === 1) known[c]++;
    }
  };

  const undo = (v: number, val: 0 | 1, touched: number[]) => {
    for (let i = touched.length - 1; i >= 0; i--) {
      const c = touched[i];
      if (val === 1) known[c]--;
      unk[c]++;
    }
    touched.length = 0;
    if (val === 1) blackKnown--;
    unknownCount++;
    assign[v] = -1;
  };

  const branchOrder = (v: number): (0 | 1)[] => {
    let pressure = 0;
    for (const c of rev[v]) {
      const need = clue[c];
      const k = known[c];
      const u = unk[c];
      pressure += (need - k) - u / 2;
    }
    return pressure > 0 ? [1, 0] : [0, 1];
  };

  let count = 0;

  const dfs = () => {
    if (count >= limit) return;
    if (!globalOk()) return;

    const v = pickVar();
    if (v === -1) {
      if (blackKnown !== K) return;
      for (let c = 0; c < n; c++) if (known[c] !== clue[c]) return;
      count++;
      return;
    }

    for (const val of branchOrder(v)) {
      const touched: number[] = [];
      apply(v, val, touched);
      if (globalOk() && localOk(touched)) dfs();
      undo(v, val, touched);
      if (count >= limit) return;
    }
  };

  if (!globalOk()) return 0;
  dfs();
  return count;
}