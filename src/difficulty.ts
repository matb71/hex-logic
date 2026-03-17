export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

export const DIFFICULTY_RATIO: Record<Difficulty, number> = {
  easy: 0.10,
  medium: 0.25,
  hard: 0.35,
};

export function computeK(n: number, difficulty: Difficulty): number {
  const raw = Math.round(n * DIFFICULTY_RATIO[difficulty]);
  const minK = Math.max(1, Math.round(n * 0.05));
  const maxK = Math.max(1, Math.min(n - 1, Math.round(n * 0.60)));
  return Math.max(minK, Math.min(maxK, raw));
}

export function attemptsForDifficulty(d: Difficulty) {
  switch (d) {
    case 'easy': return 250;
    case 'medium': return 600;
    case 'hard': return 1200;
  }
}