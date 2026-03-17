import React, { useMemo } from 'react';
import type { Axial } from './hex';
import { axialToPixel, hexPolygonPoints } from './hex';
import type { Mark } from './game';
import { getVerifyFlag } from './game';

type Props = {
  cells: Axial[];
  clues: number[];
  marks: Mark[];
  solutionBlack: boolean[];
  verifyMode: boolean;
  onCycle: (index: number) => void;
};

function cellStyle(mark: Mark) {
  if (mark === 'black') return { fill: '#111827', stroke: '#111827', text: '#ffffff' };
  if (mark === 'white') return { fill: '#ffffff', stroke: '#9ca3af', text: '#111827' };
  return { fill: '#f3f4f6', stroke: '#d1d5db', text: '#111827' };
}

function verifyStroke(flag: ReturnType<typeof getVerifyFlag>) {
  if (flag === 'wrongBlack') return { stroke: '#dc2626', strokeWidth: 4 }; // rouge
  if (flag === 'missedBlack') return { stroke: '#f59e0b', strokeWidth: 4 }; // orange
  return { stroke: undefined as string | undefined, strokeWidth: undefined as number | undefined };
}

export default function HexBoard(props: Props) {
  const { cells, clues, marks, solutionBlack, verifyMode, onCycle } = props;

  const size = 26;
  const padding = 18;

  const layout = useMemo(() => {
    const pts = cells.map((c) => axialToPixel(c, size));
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);

    const minX = Math.min(...xs) - size - padding;
    const maxX = Math.max(...xs) + size + padding;
    const minY = Math.min(...ys) - size - padding;
    const maxY = Math.max(...ys) + size + padding;

    return { pts, viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}` };
  }, [cells]);

  return (
    <svg className="board" viewBox={layout.viewBox} role="img" aria-label="Grille hexagonale">
      {cells.map((cell, i) => {
        const cx = layout.pts[i].x;
        const cy = layout.pts[i].y;
        const poly = hexPolygonPoints(cx, cy, size);

        const base = cellStyle(marks[i]);
        const flag = getVerifyFlag(marks[i], solutionBlack[i], verifyMode);
        const vs = verifyStroke(flag);

        return (
          <g key={i} onPointerDown={() => onCycle(i)} style={{ cursor: 'pointer' }}>
            <polygon
              points={poly}
              fill={base.fill}
              stroke={vs.stroke ?? base.stroke}
              strokeWidth={vs.strokeWidth ?? 2}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={16}
              fill={base.text}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {clues[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}