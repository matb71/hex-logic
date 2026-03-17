export type Mark = 'unknown' | 'black' | 'white';
export type VerifyFlag = 'wrongBlack' | 'missedBlack' | 'ok' | 'none';

export function nextMark(m: Mark): Mark {
  return m === 'unknown' ? 'black' : (m === 'black' ? 'white' : 'unknown');
}

export function checkWin(marks: Mark[], solutionBlack: boolean[], K: number) {
  let markedBlack = 0;
  for (let i = 0; i < marks.length; i++) {
    const isMarkedBlack = marks[i] === 'black';
    if (isMarkedBlack) markedBlack++;
    if (isMarkedBlack !== solutionBlack[i]) return false; // match exact
  }
  return markedBlack === K;
}

export function getVerifyFlag(mark: Mark, isBlackSolution: boolean, verifyMode: boolean): VerifyFlag {
  if (!verifyMode) return 'none';
  if (mark === 'black' && !isBlackSolution) return 'wrongBlack';
  if (mark !== 'black' && isBlackSolution) return 'missedBlack';
  return 'ok';
}