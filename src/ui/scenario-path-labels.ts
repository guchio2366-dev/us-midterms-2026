import type { SenatePath } from '../scenario/paths';
/** Neutral calculation categories summarize unallocated seats, including weak or split ratings. */
export function scenarioPathDifficultyLabel(path:Pick<SenatePath,'difficulty'>):string {
  const entries=Object.entries(path.difficulty);
  return entries.length?entries.map(([rating,count])=>`${rating==='Toss Up'?'未配分':rating} ${count}議席`).join('／'):'追加獲得なし';
}
