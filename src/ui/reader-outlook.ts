import { elections, seats, sources } from '../data/data';
import { observationData } from '../data/observation';
import type { ObservationDataset, ObservationEvent, ObservationUpdate } from '../data/observation-model';
import { RATING_SNAPSHOT_AS_OF, ratingSnapshotObservations } from '../data/rating-snapshot';
import { uniqueElectionSeatIds } from '../logic';
import { buildUpcomingFeed } from '../news-feed';
import { eventStatus, publishedUpdates } from '../observation-logic';
import { aggregateRatingConsensus, ratingConsensusCounts } from '../rating-consensus';
import { escapeHtml as esc } from './research';
import { senateBreakdown } from './senate-bars';

const baseline = senateBreakdown(seats, elections);
const ratingCounts = ratingConsensusCounts(aggregateRatingConsensus(uniqueElectionSeatIds(elections), ratingSnapshotObservations));

/** Read-only editorial material: neither saved choices nor the reader's working scenario are inputs. */
export function readerOutlookMaterials(data: ObservationDataset, now: Date) {
  const upcoming = buildUpcomingFeed(data, now).filter(item => !item.history && item.statusLabel === '日程確定').slice(0, 3);
  return {
    updates: publishedUpdates(data).slice(0, 3),
    upcoming: upcoming.flatMap(item => {
      const event = data.events.find(candidate => candidate.eventId === item.sourceId);
      return event ? [event] : [];
    }),
    pending: data.events.filter(event => event.publicationStatus === 'published' && event.status === 'scheduled' && eventStatus(event, now) === '予定日経過・結果確認待ち'),
  };
}

function evidenceMarkup(ids: readonly string[], data: ObservationDataset) {
  const items = ids.flatMap(id => {
    const ref = data.evidenceRefs.find(item => item.evidenceId === id);
    const source = ref && data.sources.find(item => item.sourceId === ref.sourceId);
    if (!ref || !source) return [];
    const name = /^https:\/\//.test(source.url)
      ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`
      : esc(source.title);
    return [`<li>${name}<small>${esc(source.publisher)}／${source.publishedAt ? `公表 ${esc(source.publishedAt)}` : '公表日未記載'}／内容確認 ${esc(ref.checkedAt)}</small><p>${esc(ref.locator || '根拠箇所の特定は未収録')}</p></li>`];
  });
  return items.length
    ? `<details class="reader-outlook-evidence"><summary>出典と根拠箇所</summary><ul>${items.join('')}</ul></details>`
    : '<p class="reader-outlook-limit">この項目の根拠箇所は未収録です。</p>';
}

function updateMarkup(update: ObservationUpdate, data: ObservationDataset) {
  return `<article class="reader-outlook-card" data-reader-outlook-update>
    <p class="reader-outlook-date">出来事 <time datetime="${esc(update.eventDate)}">${esc(update.eventDate)}</time>／解説更新 ${esc(update.updatedAt)}</p>
    <h4>${esc(update.title)}</h4>
    <p class="reader-outlook-meaning"><b>見通しへの意味</b>${esc(update.meaning)}</p>
    <details class="reader-outlook-detail"><summary>確認できた事実と、まだ分からないこと</summary><p><b>確認した事実</b>${esc(update.happened)}</p><p><b>未確認・解釈の限界</b>${esc(update.uncertainty || '未確認事項の記載はありません。')}</p>${evidenceMarkup(update.evidenceIds, data)}</details>
    <button type="button" data-reader-feed="update:${esc(update.updateId)}">ニュースと州への影響を詳しく読む</button>
  </article>`;
}

function eventMarkup(event: ObservationEvent, data: ObservationDataset) {
  return `<article class="reader-outlook-card" data-reader-outlook-event>
    <p class="reader-outlook-date">現地予定 <time datetime="${esc(event.date!)}">${esc(event.date!)}</time>${event.time ? ` ${esc(event.time)}` : '・時刻未定'}／日程確認 ${esc(event.checkedAt)}</p>
    <h4>${esc(event.title)}</h4>
    ${event.relevance.map(item => `<p><b>注目する理由</b>${esc(item.why)}</p><p class="reader-outlook-watch"><b>判断を更新するために見る点</b>${esc(item.watch)}</p>`).join('')}
    <details class="reader-outlook-detail"><summary>時刻・出典を確認</summary><p>時刻の基準：${esc(event.timezone)}。予定の実施結果は未確認です。</p>${evidenceMarkup(event.evidenceIds, data)}</details>
    <button type="button" data-reader-feed="event:${esc(event.eventId)}">予定の詳細と関連州を読む</button>
  </article>`;
}

function ratingSourcesMarkup() {
  return ['sabato', 'inside'].map(organizationId => {
    const entries = ratingSnapshotObservations.filter(item => item.organizationId === organizationId);
    const dates = [...new Set(entries.map(item => item.currentConfirmedAt).filter(Boolean))].sort();
    const name = organizationId === 'sabato' ? 'Sabato’s Crystal Ball' : 'Inside Elections';
    const source = sources.find(item => item.sourceId === entries[0]?.sourceId);
    const label = source && /^https:\/\//.test(source.url) ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${name}</a>` : name;
    return `${label}：${dates.length ? dates.map(esc).join('／') + '確認' : '未確認'}`;
  }).join('／');
}

/** Content for stage 04 (stable legacy anchor reader-06). Heading belongs to reader-layout.ts. */
export function renderReaderOutlook(now = new Date(), data: ObservationDataset = observationData) {
  const materials = readerOutlookMaterials(data, now);
  const Democratic = baseline.fixed.Democratic + ratingCounts.D;
  const Republican = baseline.fixed.Republican + ratingCounts.R;
  const unassigned = ratingCounts.lean + ratingCounts.tossup + ratingCounts.split + ratingCounts.missing;
  const majority = Math.floor(seats.length / 2) + 1;
  const assessment = Democratic < majority && Republican < majority
    ? `どちらも${majority}議席には届いていません。`
    : `${Democratic >= majority ? '民主党側' : '共和党側'}が${majority}議席以上へ暫定配分されています。`;
  return `<div class="reader-outlook">
    <article class="reader-outlook-summary">
      <h3>現在の上院の見通し</h3>
      <p>現在の情勢評価による暫定配分は、民主党側${Democratic}議席、共和党側${Republican}議席、未配分${unassigned}議席です。${assessment}</p>
      <p>未配分は、弱い優勢${ratingCounts.lean}・接戦${ratingCounts.tossup}・評価分裂${ratingCounts.split}${ratingCounts.missing ? `・評価不足${ratingCounts.missing}` : ''}。配分済みも当選確定ではなく、利用者が保存した当落案とは別の現在評価です。</p>
      <p class="reader-outlook-date">集計基準 ${esc(RATING_SNAPSHOT_AS_OF)}／${ratingSourcesMarkup()}（評価の変更日ではなく確認日）</p>
      <a href="#national-overview">議席配分と多数派への条件を確認</a>
    </article>
    <div class="reader-outlook-materials"><h3>直近の材料から何が読めるか</h3><div class="reader-outlook-grid">${materials.updates.length ? materials.updates.map(update => updateMarkup(update, data)).join('') : '<p>公開済みの分析更新は未収録です。</p>'}</div></div>
    <div class="reader-outlook-next"><h3>次に見通しを更新する確認点</h3><div class="reader-outlook-grid">${materials.upcoming.length ? materials.upcoming.map(event => eventMarkup(event, data)).join('') : '<p>日程を確認できた今後の予定は未収録です。</p>'}</div>${materials.pending.length ? `<p class="reader-outlook-limit">予定日が過ぎ、結果の確認を待っている予定が${materials.pending.length}件あります。</p>` : ''}</div>
  </div>`;
}
