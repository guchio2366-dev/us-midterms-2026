import { elections, seats, sources, states, vicePresident } from '../data/data';
import { introductionContent, approvedIntroduction } from '../data/content';
import { houseSnapshot } from '../data/house';
import { RATING_METHOD_VERSION, RATING_SNAPSHOT_AS_OF, ratingSnapshotObservations } from '../data/rating-snapshot';
import { currentCaucusCounts, uniqueElectionSeatIds } from '../logic';
import { aggregateRatingConsensus, ratingConsensusCounts, type RatingConsensusCategory } from '../rating-consensus';
import { escapeHtml } from './research';
import { seatBarMarkup, type SeatBarSegment } from './seat-bars';
import { senateBreakdown, senateCompositionSegments, senateMajorityPath } from './senate-bars';
import { readerCompositionSourcesMarkup } from './reader-context';
import { briefingElections, featuredAllocationCoverage } from './briefing';
import { approvedAllocationParagraphs, approvedInstitutionParagraphs, renderApprovedAbout, renderApprovedParagraphs, type ReaderCopyFacts } from './approved-reader-copy';

const breakdown = senateBreakdown(seats, elections);
const consensus = aggregateRatingConsensus(uniqueElectionSeatIds(elections), ratingSnapshotObservations);
const totals = ratingConsensusCounts(consensus);
const sourceById = new Map(sources.map(source => [source.sourceId, source]));

export function featuredAllocationSummary() {
  return featuredAllocationCoverage(briefingElections(elections,seats,states,consensus),seats,consensus);
}

function sourceLinks(ids: readonly string[]) {
  return ids.flatMap(id => {
    const source = sourceById.get(id);
    return source ? [`<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>`] : [];
  }).join('／');
}

const paragraphs = (texts:readonly string[]) => texts.map(text=>`<p>${escapeHtml(text)}</p>`).join('');

export function ratingConfirmationMarkup() {
  return ['sabato','inside'].map(id=>{
    const entries=ratingSnapshotObservations.filter(item=>item.organizationId===id);
    const dates=[...new Set(entries.map(item=>item.currentConfirmedAt).filter(Boolean))].sort();
    const name=id==='sabato' ? 'Sabato’s Crystal Ball' : 'Inside Elections';
    return `${name}：${dates.length ? dates.join('／')+'確認' : '未確認'}`;
  }).join('／');
}

export function currentReaderCopyFacts():ReaderCopyFacts {
  const dates=(organizationId:string)=>[...new Set(ratingSnapshotObservations.filter(item=>item.organizationId===organizationId).map(item=>item.currentConfirmedAt).filter(Boolean))].sort();
  return {
    senateTotal:seats.length,contested:breakdown.contested,houseTotal:houseSnapshot.total,
    regular:uniqueElectionSeatIds(elections.filter(election=>election.type==='regular')).length,
    special:uniqueElectionSeatIds(elections.filter(election=>election.type==='special')).length,stateCount:states.length,
    fixedDemocratic:breakdown.fixed.Democratic,fixedRepublican:breakdown.fixed.Republican,
    allocatedDemocratic:totals.D,allocatedRepublican:totals.R,
    unallocated:totals.lean+totals.tossup+totals.split+totals.missing,
    ratingAsOf:RATING_SNAPSHOT_AS_OF,sabatoConfirmedAt:dates('sabato'),insideConfirmedAt:dates('inside'),
    electionDate:elections[0].date,vicePresident,
  };
}

export function introductionMarkup() {
  const institution = approvedInstitutionParagraphs(currentReaderCopyFacts());
  return `<section id="overview" class="introduction section-block" aria-labelledby="overview-heading">
    <div class="overview-grid">
      <div class="opening-context">
      <section class="opening-card intro-purpose-card" aria-labelledby="site-purpose-heading"><h2 id="site-purpose-heading">このサイトについて</h2>${renderApprovedAbout()}</section>
      <section class="opening-card intro-overview-card" aria-labelledby="overview-heading">
        <p class="kicker">OVERVIEW</p><h2 id="overview-heading">米国中間選挙の概説</h2>
        ${renderApprovedParagraphs(institution,'institution')}
        <p class="reader-house-snapshot">下院の現在構成：<span class="opening-dem">民主 ${houseSnapshot.Democratic}</span>・<span class="opening-rep">共和 ${houseSnapshot.Republican}</span>・独立${houseSnapshot.Independent}・空席${houseSnapshot.vacant}。</p>
        ${readerCompositionSourcesMarkup('house')}
        <details class="opening-details"><summary>制度の出典と補足を読む</summary><div>
          <button id="open-civics" class="opening-text-button" type="button">Class制度・特別選挙を詳しく読む</button>
          <p class="opening-source-links">${sourceLinks(introductionContent.institutionSourceIds)}</p>
        </div></details>
      </section>
      <section class="opening-card intro-issues-card" aria-labelledby="intro-issues-heading">
        <p class="kicker">ISSUES</p><h2 id="intro-issues-heading">選挙を見る主な論点</h2>
        ${paragraphs(approvedIntroduction.issues)}
        <details class="opening-details"><summary>出典・詳しい論点を読む</summary><div>
          <p class="opening-source-links">${sourceLinks(introductionContent.issueSourceIds)}</p>
          <button id="open-issues" class="opening-text-button" type="button">既存の8つの論点を詳しく読む</button>
        </div></details>
      </section>
      </div>
      <div id="national-overview-slot"></div>
    </div>
  </section>`;
}

export function ratingCategoryLabel(category: RatingConsensusCategory) {
  const labels = {D:'D側へ暫定配分',R:'R側へ暫定配分',lean:'弱い優勢・未配分',tossup:'Toss Up',split:'評価分裂',missing:'評価不足'};
  return labels[category];
}

function ratingDetailsMarkup() {
  const rows = consensus.map(result => {
    const election = elections.find(item => item.seatId === result.seatId)!;
    const seat = seats.find(item => item.seatId === result.seatId)!;
    const state = states.find(item => item.fips === seat.stateFips);
    return `<tr><th scope="row">${escapeHtml(state?.nameJa ?? result.seatId)}${election.type === 'special' ? '（特別）' : ''}</th><td>${ratingCategoryLabel(result.category)}</td>${result.observations.map(item => `<td>${escapeHtml(item.ratingRaw)}<small>${escapeHtml(item.currentConfirmedAt)}確認</small></td>`).join('')}</tr>`;
  }).join('');
  return `<details class="consensus-details"><summary>${breakdown.contested}選挙の評価内訳を見る</summary><div class="consensus-table-wrap"><table><thead><tr><th scope="col">選挙</th><th scope="col">集計</th><th scope="col">Sabato</th><th scope="col">Inside Elections</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
}

/** Compact labels retain exact widths; full descriptions stay in the chart's accessible name. */
export function compactOverviewSegments(segments: SeatBarSegment[]): SeatBarSegment[] {
  return segments.map(segment => ({...segment, shortLabel: segment.count >= 3 ? String(segment.count) : ''}));
}

function pathMarkup(party: 'Democratic'|'Republican') {
  const path = senateMajorityPath(breakdown, party);
  if (path.status !== 'ready') return `<p class="missing">${escapeHtml(path.reason)}</p>`;
  const name = party === 'Democratic' ? '民主党側' : '共和党側';
  return `<section class="comparison-row majority-path" data-majority-party="${party}"><div class="comparison-heading"><h4>${name}が51議席</h4><span>今回必要 <b>${path.required}</b> / ${breakdown.contested}</span></div>
    ${seatBarMarkup(compactOverviewSegments(path.segments),seats.length,'必要配分の例。濃色は今回獲得が必要な議席。残りは獲得先を決めていない議席',path.target)}
    <p class="path-equation">非改選 ${breakdown.fixed[party]} ＋ 今回必要 ${path.required} ＝ <strong>51議席</strong></p></section>`;
}

export function nationalOverviewMarkup() {
  const current = currentCaucusCounts(seats);
  const unresolved = totals.lean + totals.tossup + totals.split + totals.missing;
  const provisional: SeatBarSegment[] = [
    {count:breakdown.fixed.Democratic,label:`非改選・民主党会派 ${breakdown.fixed.Democratic}`,className:'fixed-d'},
    {count:totals.D,label:`改選・D側優勢 ${totals.D}`,className:'consensus-d'},
    {count:totals.lean+totals.tossup+totals.split,label:`未配分 ${totals.lean+totals.tossup+totals.split}（弱い優勢 ${totals.lean}・Toss Up ${totals.tossup}・評価分裂 ${totals.split}）`,className:'consensus-unresolved'},
    {count:totals.missing,label:`評価不足 ${totals.missing}`,className:'consensus-missing'},
    {count:totals.R,label:`改選・R側優勢 ${totals.R}`,className:'consensus-r'},
    {count:breakdown.fixed.Republican,label:`非改選・共和党会派 ${breakdown.fixed.Republican}`,className:'fixed-r'},
  ];
  const majority = Math.floor(seats.length / 2)+1;
  const senateIntro = approvedAllocationParagraphs(currentReaderCopyFacts());
  return `<section id="national-overview" class="national-overview national-card opening-card" aria-labelledby="national-overview-heading">
    <div class="opening-national-heading"><div><p class="kicker">SENATE OUTLOOK</p><h2 id="national-overview-heading">上院の情勢と51議席への配分</h2></div><span class="opening-total">全${seats.length}議席</span></div>
    <div class="reader-allocation-layout"><div class="approved-senate-intro">${renderApprovedParagraphs(senateIntro,'allocation')}</div>
    <aside class="reader-allocation-charts" aria-label="現在の議席、51議席への条件、情勢による暫定配分">
    <p class="national-type">4本とも全${seats.length}議席。薄色は非改選、濃色は今回の改選。</p>
    <div class="senate-comparison">
      <section class="comparison-row current-seat-composition"><div class="comparison-heading"><h3>現在の議席（改選・非改選）</h3><span>今回改選 ${breakdown.contested}</span></div>
        <p>現在の会派構成。選挙後の予測ではありません。</p>
        <div class="current-seat-totals"><p><span class="opening-dem">民主党側 <b>${current.Democratic}</b></span><small>非改選 ${breakdown.fixed.Democratic} ＋ 改選 ${breakdown.currentContested.Democratic}</small></p><p><span class="opening-rep">共和党側 <b>${current.Republican}</b></span><small>非改選 ${breakdown.fixed.Republican} ＋ 改選 ${breakdown.currentContested.Republican}</small></p></div>
        ${seatBarMarkup(compactOverviewSegments(senateCompositionSegments(breakdown)),seats.length,'現在の会派構成。現在の議員を改選対象と非改選に分けた図で、選挙後の予測ではない',undefined,{start:seats.length-breakdown.contested-breakdown.fixed.Republican,count:breakdown.contested,label:`今回改選 ${breakdown.contested}`})}
        ${readerCompositionSourcesMarkup('senate')}
      </section>
      <section class="majority-conditions" aria-labelledby="majority-conditions-heading"><h3 id="majority-conditions-heading">51議席に届く配分の例</h3><div class="majority-paths">${pathMarkup('Democratic')}${pathMarkup('Republican')}</div><p class="majority-example-note">灰色は改選議席のうち獲得先が未指定の部分。情勢の予測ではありません。</p></section>
      <section class="comparison-row provisional-allocation"><div class="comparison-heading"><h3>情勢評価による暫定配分</h3><span>集計基準 ${RATING_SNAPSHOT_AS_OF}</span></div>
        <div class="provisional-totals" aria-label="情勢評価による暫定配分"><div class="provisional-d"><span>民主</span><b>${breakdown.fixed.Democratic+totals.D}</b></div><div class="provisional-u"><span>未配分</span><b>${unresolved}</b></div><div class="provisional-r"><span>共和</span><b>${breakdown.fixed.Republican+totals.R}</b></div></div>
        ${seatBarMarkup(compactOverviewSegments(provisional),seats.length,'2機関の情勢評価を集計した暫定配分。現在議席や当選確定の数ではない')}<p class="path-equation">未配分 ${unresolved}：弱い優勢 ${totals.lean}・接戦 ${totals.tossup}・評価分裂 ${totals.split}${totals.missing ? `・評価不足 ${totals.missing}` : ''}</p>
      </section>
    </div>
    <div class="comparison-legend" aria-label="グラフの凡例"><span><i class="fixed-d"></i><i class="fixed-r"></i>薄色：非改選</span><span><i class="consensus-d"></i><i class="consensus-r"></i>濃色：今回改選</span><span><i class="consensus-unresolved"></i>未配分</span><span><i class="goal-other"></i>残り・配分未指定</span></div>

    </aside></div>
    <p class="national-conditions"><a href="#powers">採決条件を確認</a></p>
    <p class="opening-source-links">${ratingConfirmationMarkup()}（評価の変更日ではなく確認日）</p>
    <details class="consensus-method opening-details"><summary>配分の考え方・出典</summary><div><p>SabatoとInside Electionsで最後に確認できた評価を機械的に統合した暫定配分である。2機関が同じ党方向で、両方ともLikely／Safe／Solidの場合だけ党派側へ置く。一方でもLean／Tilt、接戦、方向不一致、資料不足なら未配分とする。民主党側・共和党側の2本は、51議席に届く配分例である。</p><p>集計基準日 ${RATING_SNAPSHOT_AS_OF}／方式 ${RATING_METHOD_VERSION}。全${breakdown.contested}選挙の2機関の記録を収録。評価の強さは平均しない。Inside Electionsは10月1日に全件を再照合し、7州の変更を反映した。Sabato全表の確認日は9月24日のまま。資料ごとの確認日は内訳を参照。</p><p>副大統領に関する確認日：${escapeHtml(vicePresident.verifiedAt ?? '未確認')}。</p>${ratingDetailsMarkup()}<p class="opening-source-links">${sourceLinks(['sabato-senate-2026','inside-senate-ratings-2026'])}</p></div></details>
    <div class="majority-bridge"><h3>${breakdown.fixed.Democratic+totals.D < 51 && breakdown.fixed.Republican+totals.R < 51 ? '上院の過半数は、まだ見通せない。' : '過半数の行方を、州ごとに読む。'}</h3><p>現在の統合評価では${breakdown.fixed.Democratic+totals.D < 51 && breakdown.fixed.Republican+totals.R < 51 ? '両党とも51議席に届かず、' : ''}${unresolved}議席が未配分。${featuredAllocationSummary().corresponds ? '未配分に対応する' : '注目する'}<a href="#updates">${featuredAllocationSummary().stateCount}州で何が争われているか</a>を見ていく。</p><small>優勢とされた議席も当選確定ではない。</small></div>
  </section>`;
}
