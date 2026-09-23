import { geoAlbersUsa, geoPath } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import type { Election, Seat, State } from '../data/model';
import type { RatingConsensusSeat } from '../rating-consensus';
import { escapeHtml as esc } from './research';

/** Unallocated seats plus the two explicitly requested races; allocation is unchanged. */
export function briefingElections(elections: Election[], seats: Seat[], states: State[], consensus: RatingConsensusSeat[]) {
  const unresolved = new Set(consensus.filter(item => ['tossup','split','missing'].includes(item.category)).map(item => item.seatId));
  unresolved.add('IA-2');
  unresolved.add('NC-2');
  const stateBySeat = new Map(seats.map(seat => [seat.seatId, states.find(state => state.fips === seat.stateFips)]));
  return elections.filter(election => unresolved.has(election.seatId)).sort((a,b) =>
    (stateBySeat.get(a.seatId)?.nameEn ?? '').localeCompare(stateBySeat.get(b.seatId)?.nameEn ?? '') || a.electionId.localeCompare(b.electionId));
}

/** Count each organization's published direction, including unknowns in the denominator. */
export function ratingShareSegments(result: RatingConsensusSeat | undefined) {
  const observations = result?.observations ?? [];
  return ([['D','民主党寄り'],['T','接戦'],['R','共和党寄り'],['unknown','判定不能']] as const).map(([key,label]) => {
    const count = observations.filter(item => (item.direction ?? 'unknown') === key).length;
    return {key,label,count,total:observations.length,percent:observations.length ? count / observations.length * 100 : 0};
  });
}

export function ratingShareMarkup(result: RatingConsensusSeat | undefined) {
  const segments = ratingShareSegments(result);
  const total = segments[0].total;
  if (!total) return '<section class="briefing-rating-share"><h4>情勢評価の割合</h4><p>収録した機関別評価がないため、割合は表示できません。</p></section>';
  const percentage = (value:number) => Number(value.toFixed(1));
  const populated = segments.filter(item => item.count);
  return `<section class="briefing-rating-share" aria-label="情勢評価の割合"><div class="rating-share-heading"><h4>情勢評価の割合</h4><span>収録${total}機関 · 各機関を等しく集計</span></div>
    <div class="rating-share-track" aria-hidden="true">${populated.map(item => `<span class="rating-share-${item.key}" style="width:${item.percent}%"></span>`).join('')}</div>
    <ul class="rating-share-labels">${populated.map(item => `<li><i class="rating-share-${item.key}" aria-hidden="true"></i>${item.label} <b>${percentage(item.percent)}%</b><span>（${item.count}/${total}機関）</span></li>`).join('')}</ul>
    <small>勝率・得票率ではなく、評価方向の内訳。${total < 2 ? '統合評価に必要な2機関分がそろっていません。' : '原評価の強さと確認日は下記を参照。'}</small></section>`;
}

export function locatorMapMarkup(features: Feature<Geometry>[], state: State) {
  if (!features.length) return '<p class="locator-loading">位置図を読み込み中</p>';
  const path = geoPath(geoAlbersUsa().scale(1275).translate([487.5,305]));
  return `<svg viewBox="0 0 975 610" role="img" aria-label="${esc(state.nameJa)}の位置。色は選択州のみ"><title>${esc(state.nameJa)}の位置</title>${features.map(item => {
    const selected = String(item.id).padStart(2,'0') === state.fips;
    return `<path d="${esc(path(item) ?? '')}" class="locator-state${selected ? ' locator-selected' : ''}"${selected ? ` data-locator-selected="${esc(state.fips)}"` : ''}></path>`;
  }).join('')}</svg>`;
}
