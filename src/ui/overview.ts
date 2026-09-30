import { elections, seats, sources, states, vicePresident } from '../data/data';
import { introductionContent, approvedIntroduction } from '../data/content';
import { houseSnapshot } from '../data/house';
import { RATING_METHOD_VERSION, RATING_SNAPSHOT_AS_OF, ratingSnapshotObservations } from '../data/rating-snapshot';
import { currentCaucusCounts, uniqueElectionSeatIds } from '../logic';
import { aggregateRatingConsensus, ratingConsensusCounts, type RatingConsensusCategory } from '../rating-consensus';
import { escapeHtml } from './research';
import { seatBarMarkup, type SeatBarSegment } from './seat-bars';
import { senateBreakdown, senateMajorityPath } from './senate-bars';
import { briefingElections } from './briefing';

const breakdown = senateBreakdown(seats, elections);
const consensus = aggregateRatingConsensus(uniqueElectionSeatIds(elections), ratingSnapshotObservations);
const totals = ratingConsensusCounts(consensus);
const featuredStates = briefingElections(elections,seats,states,consensus).length;
const sourceById = new Map(sources.map(source => [source.sourceId, source]));

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

export function introductionMarkup() {
  const counts = currentCaucusCounts(seats);
  const regular = uniqueElectionSeatIds(elections.filter(election => election.type === 'regular')).length;
  const special = uniqueElectionSeatIds(elections.filter(election => election.type === 'special')).length;
  const institution = approvedIntroduction.institution(seats.length,breakdown.contested,houseSnapshot.total,regular,special,states.length);
  return `<section id="overview" class="introduction section-block" aria-labelledby="overview-heading">
    <div class="overview-grid">
      <div class="opening-context">
      <section class="opening-card intro-purpose-card" aria-labelledby="site-purpose-heading"><h2 id="site-purpose-heading">このサイトについて</h2><p>${escapeHtml(approvedIntroduction.purpose)}</p><p>このサイトにおける目標は以下の３つです。</p><ol class="intro-goals">${approvedIntroduction.goals.map(goal=>`<li>${escapeHtml(goal)}</li>`).join('')}</ol></section>
      <section class="opening-card intro-overview-card" aria-labelledby="overview-heading">
        <p class="kicker">OVERVIEW</p><h2 id="overview-heading">米国中間選挙の概説</h2>
        ${paragraphs(institution.slice(0,2))}
        <table class="opening-seats"><caption class="visually-hidden">現在の議席と今回の改選範囲</caption>
          <thead><tr><th scope="col">議院</th><th scope="col">現在の議席</th><th scope="col">今回の改選</th></tr></thead>
          <tbody>
            <tr><th scope="row">上院<small>全${seats.length}</small></th><td><span class="opening-dem">民主 ${counts.Democratic}</span><span class="opening-rep">共和 ${counts.Republican}</span></td><td><b>${breakdown.contested}</b> 議席<small>通常${regular}＋特別${special}</small></td></tr>
            <tr><th scope="row">下院<small>全${houseSnapshot.total}</small></th><td><span class="opening-dem">民主 ${houseSnapshot.Democratic}</span><span class="opening-rep">共和 ${houseSnapshot.Republican}</span></td><td><b>${houseSnapshot.total}</b> 議席<small>全議席を改選</small></td></tr>
          </tbody>
        </table>
        <p class="opening-footnote">上院は会派別。下院は独立${houseSnapshot.Independent}・空席${houseSnapshot.vacant}を含む。</p>
        <details class="opening-details"><summary>制度・出典を読む</summary><div>
          ${paragraphs(institution.slice(2))}
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
  const name = party === 'Democratic' ? '民主' : '共和';
  return `<section class="comparison-row"><div class="comparison-heading"><h3>${name}が51議席に届く配分</h3><span>今回 <b>${path.required}</b> / ${breakdown.contested}</span></div>
    ${seatBarMarkup(compactOverviewSegments(path.segments),seats.length,'必要配分の例。濃色は今回獲得が必要な議席。残りは獲得先を決めていない議席',path.target)}
    <p class="path-equation">非改選 ${breakdown.fixed[party]} ＋ 今回必要 ${path.required} ＝ <strong>51議席</strong></p></section>`;
}

export function nationalOverviewMarkup() {
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
  const senateIntro = [
    `上院は、人口にかかわらず各州２人、合計${seats.length}人で構成されます。今回改選されない議席を出発点に、改選される議席が全体の議席配分に与える影響を確認できます。`,
    `非改選議席は、民主党側${breakdown.fixed.Democratic}議席、共和党側${breakdown.fixed.Republican}議席です。${majority}議席の過半数まで、それぞれ民主党側${majority-breakdown.fixed.Democratic}議席、共和党側${majority-breakdown.fixed.Republican}議席が必要です。民主党側には、民主党会派に参加する無所属議員も含みます。`,
    '各州の情勢については、選挙を分析するSabato’s Crystal BallとInside Electionsの２機関が、世論調査などをもとに、どちらの党が優勢かを評価しています。このサイトでは、両機関が同じ党についてLikely（優勢）以上と評価する議席を、その党側へ暫定的に配分します。',
    `この改選分を非改選議席に加えると、民主党側${breakdown.fixed.Democratic+totals.D}議席、共和党側${breakdown.fixed.Republican+totals.R}議席になります。残る${unresolved}議席は、少なくとも一方の評価がLean（やや優勢）・Tilt（わずかに優勢）の場合や、接戦・評価の不一致などにより、どちらの党にも配分していない議席です。これが『未配分』であり、注目州として詳しく取り上げます。配分済みの議席も当選が確定したものではありません。`,
  ];
  const vpControl = vicePresident.verificationStatus === 'confirmed' && vicePresident.party === 'R'
    ? `なお、上院の採決が${seats.length/2}対${seats.length/2}の場合、副大統領が決裁票を投じることができます。現在の副大統領は共和党の${vicePresident.name === 'JD Vance' ? 'バンス' : vicePresident.name}氏のため、共和党側は今回${Math.max(0,seats.length/2-breakdown.fixed.Republican)}議席を得て${seats.length/2}議席でも多数派として運営することが可能です。`
    : '副大統領の氏名・党派は未確認です。';
  return `<section id="national-overview" class="national-overview national-card opening-card" aria-labelledby="national-overview-heading">
    <div class="opening-national-heading"><div><p class="kicker">SENATE OUTLOOK</p><h2 id="national-overview-heading">上院の情勢と51議席への配分</h2></div><span class="opening-total">全${seats.length}議席</span></div>
    <div class="approved-senate-intro">${paragraphs(senateIntro)}</div>
    <p class="opening-asof">情勢評価の暫定配分 <span>集計基準 ${RATING_SNAPSHOT_AS_OF}</span></p>
    <div class="provisional-totals" aria-label="情勢評価による暫定配分">
      <div class="provisional-d"><span>民主</span><b>${breakdown.fixed.Democratic+totals.D}</b></div>
      <div class="provisional-u"><span>未配分</span><b>${unresolved}</b></div>
      <div class="provisional-r"><span>共和</span><b>${breakdown.fixed.Republican+totals.R}</b></div>
    </div>
    <p class="national-type">3本とも全100議席。両端の薄色は非改選、中央${breakdown.contested}議席が今回の改選。</p>
    <div class="senate-comparison">
      <section class="comparison-row"><div class="comparison-heading"><h3>情勢評価による暫定配分</h3></div>${seatBarMarkup(compactOverviewSegments(provisional),seats.length,'2機関の情勢評価を集計した暫定配分')}<p class="path-equation">未配分 ${unresolved}：弱い優勢 ${totals.lean}・接戦 ${totals.tossup}・評価分裂 ${totals.split}${totals.missing ? `・評価不足 ${totals.missing}` : ''}</p></section>
      ${pathMarkup('Democratic')}${pathMarkup('Republican')}
    </div>
    <div class="comparison-legend" aria-label="グラフの凡例"><span><i class="fixed-d"></i><i class="fixed-r"></i>薄色：非改選</span><span><i class="consensus-d"></i><i class="consensus-r"></i>濃色：今回改選</span><span><i class="consensus-unresolved"></i>未配分</span><span><i class="goal-other"></i>残り・配分未指定</span></div>

    <p class="national-conditions">${vpControl} <a href="#powers">採決条件を確認</a></p>
    <p class="opening-source-links">${ratingConfirmationMarkup()}（評価の変更日ではなく確認日）</p>
    <details class="consensus-method opening-details"><summary>配分の考え方・出典</summary><div><p>SabatoとInside Electionsで最後に確認できた評価を機械的に統合した暫定配分である。2機関が同じ党方向で、両方ともLikely／Safe／Solidの場合だけ党派側へ置く。一方でもLean／Tilt、接戦、方向不一致、資料不足なら未配分とする。下の2本は51議席に届く配分例である。</p><p>集計基準日 ${RATING_SNAPSHOT_AS_OF}／方式 ${RATING_METHOD_VERSION}。全${breakdown.contested}選挙の2機関の記録を収録。評価の強さは平均しない。Inside Electionsは9月30日に全件を再照合し評価値は変更なし。Sabato全表の確認日は9月24日のまま。取得できた補助記事の確認日とは区別する。資料ごとの確認日は内訳を参照。</p><p>副大統領に関する確認日：${escapeHtml(vicePresident.verifiedAt ?? '未確認')}。</p>${ratingDetailsMarkup()}<p class="opening-source-links">${sourceLinks(['sabato-senate-2026','inside-senate-ratings-2026'])}</p></div></details>
    <div class="majority-bridge"><h3>${breakdown.fixed.Democratic+totals.D < 51 && breakdown.fixed.Republican+totals.R < 51 ? '上院の過半数は、まだ見通せない。' : '過半数の行方を、州ごとに読む。'}</h3><p>現在の統合評価では${breakdown.fixed.Democratic+totals.D < 51 && breakdown.fixed.Republican+totals.R < 51 ? '両党とも51議席に届かず、' : ''}${unresolved}議席が未配分。未配分の州と追加の注目州を合わせ、<a href="#updates">${featuredStates}州で何が争われているか</a>を見ていく。</p><small>優勢とされた議席も当選確定ではない。</small></div>
  </section>`;
}

