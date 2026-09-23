import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import type { Election, Seat, State } from '../data/model';
import type { RatingConsensusSeat } from '../rating-consensus';
import { escapeHtml as esc } from './research';

/** Match the unallocated seats in the national overview, including missing evidence. */
export function briefingElections(elections: Election[], seats: Seat[], states: State[], consensus: RatingConsensusSeat[]) {
  const unresolved = new Set(consensus.filter(item => ['tossup','split','missing'].includes(item.category)).map(item => item.seatId));
  const stateBySeat = new Map(seats.map(seat => [seat.seatId, states.find(state => state.fips === seat.stateFips)]));
  return elections.filter(election => unresolved.has(election.seatId)).sort((a,b) =>
    (stateBySeat.get(a.seatId)?.nameEn ?? '').localeCompare(stateBySeat.get(b.seatId)?.nameEn ?? '') || a.electionId.localeCompare(b.electionId));
}

export function locatorMapMarkup(features: Feature<Geometry>[], state: State) {
  if (!features.length) return '<p class="locator-loading">位置図を読み込み中</p>';
  const path = geoPath(geoAlbersUsa().scale(1275).translate([487.5,305]));
  return `<svg viewBox="0 0 975 610" role="img" aria-label="${esc(state.nameJa)}の位置。色は選択州のみ"><title>${esc(state.nameJa)}の位置</title>${features.map(item => {
    const selected = String(item.id).padStart(2,'0') === state.fips;
    return `<path d="${esc(path(item) ?? '')}" class="locator-state${selected ? ' locator-selected' : ''}"${selected ? ` data-locator-selected="${esc(state.fips)}"` : ''}></path>`;
  }).join('')}</svg>`;
}
