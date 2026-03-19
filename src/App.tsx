import { useState, useMemo, useEffect } from 'react';
import './styles.css';

import HexBoard from './HexBoard';
import { SHAPES } from './shapes';
import { DIFFICULTY_LABEL, computeK, attemptsForDifficulty, type Difficulty } from './difficulty';
import { generateUniquePuzzle, type Puzzle } from './generator';
import { nextMark, checkWin, type Mark } from './game';

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  // Sélections
  const [shapeId, setShapeId] = useState<string>(SHAPES[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  // Forme courante
  const shape = useMemo(
    () => SHAPES.find((s) => s.id === shapeId)!,
    [shapeId]
  );
  const n = shape.cells.length;
  const K = useMemo(() => computeK(n, difficulty), [n, difficulty]);

  // Puzzle et état joueur
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [verifyMode, setVerifyMode] = useState<boolean>(false);

  // UX
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [won, setWon] = useState<boolean>(false);

  const markedBlackCount = useMemo(
    () => marks.filter((m: Mark) => m === 'black').length,
    [marks]
  );

  async function newPuzzle() {
    setLoading(true);
    setError(null);
    setVerifyMode(false);
    setWon(false);

    await sleep(20);

    try {
      const p = generateUniquePuzzle(shape.cells, K, {
        maxAttempts: attemptsForDifficulty(difficulty),
      });
      setPuzzle(p);
      setMarks(new Array<Mark>(p.cells.length).fill('unknown'));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Erreur lors de la génération du puzzle');
      }
      setPuzzle(null);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  }

  // Génère automatiquement à l'ouverture + quand forme/difficulté change
  useEffect(() => {
    newPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeId, difficulty]);

  function onCycle(i: number) {
    if (!puzzle || won) return;

    setMarks((prev: Mark[]) => {
      const next = [...prev];
      next[i] = nextMark(next[i]);

      if (checkWin(next, puzzle.solutionBlack, puzzle.K)) {
        setWon(true);
      }

      return next;
    });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="controls">
          <label className="ctrl">
            Forme
            <select
              value={shapeId}
              onChange={(e) => setShapeId(e.target.value)}
              disabled={loading}
            >
              {SHAPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="ctrl">
            Difficulté
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              disabled={loading}
            >
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABEL[d]}
                </option>
              ))}
            </select>
          </label>

          <div className="info">
            <div>
              <strong>Cases noires</strong> : {K} / {n} ({Math.round((K / n) * 100)}%)
            </div>
            <div>
              <strong>Marquées noires</strong> : {markedBlackCount} / {K}
            </div>
          </div>

          <button className="btn" onClick={newPuzzle} disabled={loading}>
            {loading ? 'Génération...' : 'Nouveau puzzle'}
          </button>

          <label className="toggle">
            <input
              type="checkbox"
              checked={verifyMode}
              onChange={(e) => setVerifyMode(e.target.checked)}
              disabled={!puzzle || loading || won}
            />
            Vérifier
          </label>
        </div>

        {error && (
          <div style={{ marginTop: 10, color: '#dc2626', fontWeight: 700 }}>
            {error}
          </div>
        )}
      </header>

      <main className="main">
        {puzzle && (
          <HexBoard
            cells={puzzle.cells}
            clues={puzzle.clue}
            marks={marks}
            solutionBlack={puzzle.solutionBlack}
            verifyMode={verifyMode}
            onCycle={onCycle}
          />
        )}
      </main>

      {won && (
        <div className="modalBackdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Bravo ! 🎉</h2>
            <p>Tu as trouvé toutes les cases noires.</p>
            <div className="modalActions">
              <button className="btn" onClick={newPuzzle}>
                Rejouer
              </button>
              <button className="btnSecondary" onClick={() => setWon(false)}>
                Continuer à regarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}