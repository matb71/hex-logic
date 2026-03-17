import type { Axial } from './hex';
import { keyOf, neighbors } from './hex';
import { precompute, countSolutions, type PuzzleCore } from './solver';

export type Puzzle = {
  cells: Axial[];
  clue: number[];
  K: number;
  solutionBlack: boolean[];
};

function shuffle<T>(arr: T[], rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCandidateSolution(n: number, K: number, rng = Math.random): boolean[] {
  const black = new Array<boolean>(n).fill(false);
  const idx = shuffle([...Array(n).keys()], rng);
  for (let i = 0; i < Math.min(K, n); i++) black[idx[i]] = true;
  return black;
}

function computeClues(cells: Axial[], black: boolean[]) {
  const indexOf = new Map<string, number>();
  cells.forEach((a, i) => indexOf.set(keyOf(a), i));

  const clue = new Array<number>(cells.length).fill(0);
  for (let i = 0; i < cells.length; i++) {
    let cnt = 0;
    for (const nb of neighbors(cells[i])) {
      const j = indexOf.get(keyOf(nb));
      if (j !== undefined && black[j]) cnt++;
    }
    clue[i] = cnt;
  }
  return clue;
}

export function generateUniquePuzzle(
  cells: Axial[],
  K: number,
  opts?: { maxAttempts?: number; rng?: () => number; limitSolutions?: number }
): Puzzle {
  const maxAttempts = opts?.maxAttempts ?? 600;
  const rng = opts?.rng ?? Math.random;
  const limitSolutions = opts?.limitSolutions ?? 2;

  const { pre } = precompute(cells);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const sol = generateCandidateSolution(cells.length, K, rng);
    const clue = computeClues(cells, sol);
    const core: PuzzleCore = { cells, clue, K };

    const count = countSolutions(core, pre, limitSolutions);
    if (count === 1) {
      return { cells, clue, K, solutionBlack: sol };
    }
  }

  throw new Error(`Impossible de générer une grille UNIQUE après ${maxAttempts} essais (K=${K}, n=${cells.length}).`);
}