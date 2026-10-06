import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import type { Election, Seat, State } from '../data/model';
import type { RatingConsensusSeat } from '../rating-consensus';
import { escapeHtml as esc } from './research';

/** All unallocated races; previously requested Iowa and North Carolina remain included. */
export function briefingElections(elections: Election[], seats: Seat[], states: State[], consensus: RatingConsensusSeat[]) {
  const unresolved = new Set(consensus.filter(item => ['lean','tossup','split','missing'].includes(item.category)).map(item => item.seatId));
  unresolved.add('IA-2');
  unresolved.add('NC-2');
  const stateBySeat = new Map(seats.map(seat => [seat.seatId, states.find(state => state.fips === seat.stateFips)]));
  return elections.filter(election => unresolved.has(election.seatId)).sort((a,b) =>
    (stateBySeat.get(a.seatId)?.nameEn ?? '').localeCompare(stateBySeat.get(b.seatId)?.nameEn ?? '') || a.electionId.localeCompare(b.electionId));
}

/** Compare seats, not just counts: featured coverage can outlive an unresolved rating. */
export function featuredAllocationCoverage(featured: Election[], seats: Seat[], consensus: RatingConsensusSeat[]) {
  const unallocated = new Set(consensus.filter(item => ['lean','tossup','split','missing'].includes(item.category)).map(item => item.seatId));
  const featuredSeats = new Set(featured.map(item => item.seatId));
  const stateCount = new Set(seats.filter(seat => featuredSeats.has(seat.seatId)).map(seat => seat.stateFips)).size;
  const matched = [...featuredSeats].filter(id => unallocated.has(id)).length;
  const corresponds = matched === unallocated.size && matched === featuredSeats.size;
  const description = corresponds
    ? `ここで取り上げる${stateCount}州は、現在の暫定配分で未配分となっている${unallocated.size}議席に対応します。各州の情勢と候補者を読み、過半数への条件を考えます。`
    : `ここで取り上げる${stateCount}州には、現在の未配分${unallocated.size}議席のうち${matched}議席が含まれます。注目州の範囲と未配分の範囲を区別して、情勢と候補者を読みます。`;
  return { stateCount, unallocatedCount: unallocated.size, matched, corresponds, description };
}

export function locatorMapMarkup(features: Feature<Geometry>[], state: State) {
  if (!features.length) return '<p class="locator-loading">位置図を読み込み中</p>';
  const path = geoPath(geoAlbersUsa().scale(1275).translate([487.5,305]));
  return `<svg viewBox="0 0 975 610" role="img" aria-label="${esc(state.nameJa)}の位置。色は選択州のみ"><title>${esc(state.nameJa)}の位置</title>${features.map(item => {
    const selected = String(item.id).padStart(2,'0') === state.fips;
    return `<path d="${esc(path(item) ?? '')}" class="locator-state${selected ? ' locator-selected' : ''}"${selected ? ` data-locator-selected="${esc(state.fips)}"` : ''}></path>`;
  }).join('')}</svg>`;
}
