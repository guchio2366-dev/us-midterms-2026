import type { Election } from '../data/model';
import { candidateRosterNotes, candidateStageLabel, isArchivedCandidate } from '../candidate-roster';
import { escapeHtml as esc } from './research';

export function candidateRosterNoteMarkup(seatId: string): string {
  const note = candidateRosterNotes[seatId];
  return note ? `<p class="election-verification"><b>候補者名簿の確認状況：</b>${esc(note)}</p>` : '';
}

export function candidateChoiceOptionsMarkup(election: Election, value: string): string {
  return election.candidates.map(candidate => {
    const stage = candidateStageLabel(candidate,election);
    const selected = value === `candidate:${candidate.candidateId}`;
    return `<option value="candidate:${esc(candidate.candidateId)}"${selected ? ' selected' : ''}${isArchivedCandidate(candidate,election) ? ' disabled' : ''}>${esc(candidate.name)}（${esc(candidate.partyLabel)}${stage ? `・${esc(stage)}` : ''}）</option>`;
  }).join('');
}
