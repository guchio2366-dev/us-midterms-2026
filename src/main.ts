import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';
import './style.css';
import { APP_VERSION,DATA_AS_OF,elections,events,profiles,seats,sources,states,vicePresident } from './data/data';
import { issueCategories,powerRules } from './data/civics';
import { candidateResearchNotes,guideContent,issueReports,newsEditorialNote,newsItems,raceResearchNotes } from './data/content';
import { houseDistricts,houseSnapshot } from './data/house';
import { soybeanTrade,stateContexts } from './data/state-context';
import type { Caucus, Election, HouseDistrict, Rating, Seat, State } from './data/model';
import { baselineCaucus,currentCaucusCounts,houseMajorityText,houseRatingOutcome,majorityText,simulatedCounts,simulatedHouseCounts,uniqueElectionSeatIds,type Assumptions,type HouseAssumptions } from './logic';

type Mode = 'current'|'rating';
type SimulatorMode = 'target'|'rating'|'current';
let mode: Mode = 'rating';
let simulatorMode: SimulatorMode = 'rating';
let competitive = false;
let selected: State|null = null;
let assumptions: Assumptions = {};
let returnFocus: {kind:'map'|'search';value:string;element?:HTMLElement}|null = null;
let selectedHouseDistrict: HouseDistrict|null = null;
let houseAssumptions: HouseAssumptions = {};
let activeIssueId = 'trade-industry';
let soySort: 'production'|'competitive'|'margin' = 'production';
let newsPage = 0;
let targetActionId = 'ordinary-law';
let targetParty: 'Democratic'|'Republican' = 'Republican';
let overlayKind: 'guide'|'issues'|'news'|null = null;
let overlayNewsId: string|null = null;
let overlayReturnFocus: HTMLElement|null = null;
let overlayReturnScrollY = 0;
let overviewSection: HTMLElement|null = null;
let issuesSection: HTMLElement|null = null;
const NEWS_PAGE_SIZE = 10;
const POWER_DISCLOSURE_KEY = 'us-midterms-2026:power-disclosure:v1';
const stateByFips = new Map(states.map(state => [state.fips,state]));
const seatById = new Map(seats.map(seat => [seat.seatId,seat]));
const profileByFips = new Map(profiles.map(profile => [profile.stateFips,profile]));
const contextByFips = new Map(stateContexts.map(context => [context.stateFips,context]));
const sourceById = new Map(sources.map(source => [source.sourceId,source]));
const houseByCombo = new Map(houseDistricts.map(district => [`${district.stateFips}${district.districtId.endsWith('-AL') ? '00' : String(district.district).padStart(2,'0')}`,district]));
const electionByState = (state: State) => elections.filter(election => seatById.get(election.seatId)?.stateFips === state.fips);
const targetSeatIds = uniqueElectionSeatIds(elections);
const fixedSeatCounts = currentCaucusCounts(seats.filter(seat => !targetSeatIds.includes(seat.seatId)));
const republicanTargetForMajority = Math.max(0,51 - fixedSeatCounts.Republican);
const democraticTargetForMajority = Math.max(0,51 - fixedSeatCounts.Democratic);
const regularCount = elections.filter(election => election.type === 'regular').length;
const specialCount = elections.filter(election => election.type === 'special').length;
const confirmedSeatCount = seats.filter(seat => seat.verificationStatus === 'confirmed' && seat.verifiedAt).length;
const confirmedElectionCount = elections.filter(election => election.verificationStatus === 'confirmed' && election.verifiedAt).length;
const baselineComplete = confirmedSeatCount === seats.length && confirmedElectionCount === elections.length;
const hasRatings = elections.some(election => election.rating.category !== 'unavailable');
const candidateCount = elections.reduce((sum,election) => sum + election.candidates.length,0);
const topSoyContexts = stateContexts.filter(context => context.soybeanRank2026 !== null && context.soybeanRank2026 <= 10);
const topSoyTrumpStates = topSoyContexts.filter(context => context.presidentialWinner2024 === 'R').length;
const topSoySenateRaces = topSoyContexts.filter(context => electionByState(states.find(state => state.fips === context.stateFips)! ).length).length;
const topSoyCompetitiveRaces = topSoyContexts.filter(context => electionByState(states.find(state => state.fips === context.stateFips)! ).some(election => ['Toss Up','Lean D','Lean R'].includes(election.rating.category))).length;
const partyLabel = {D:'民主党',R:'共和党',I:'無所属',other:'その他',vacant:'空席',unknown:'未確認'};
const caucusLabel: Record<Caucus,string> = {Democratic:'民主党会派',Republican:'共和党会派',none:'会派非所属',unconfirmed:'会派未確認',vacant:'空席'};
const ratingColors: Record<Rating,string> = {'Solid D':'#174f9e','Likely D':'#4d80bd','Lean D':'#93b7dc','Toss Up':'#8a8178','Lean R':'#e59a9a','Likely R':'#cf5a5a','Solid R':'#a5262e',unavailable:'#d9d8d4'};
const powerVoteSpecs: Record<string,{house:number|null;senate:number|null;houseLabel:string;senateLabel:string}> = {
  'ordinary-law': {house:218,senate:51,houseLabel:'218 / 435',senateLabel:'51 / 100（50＋副大統領も可）'},
  appropriations: {house:218,senate:51,houseLabel:'218 / 435',senateLabel:'51 / 100（50＋副大統領も可）'},
  oversight: {house:218,senate:51,houseLabel:'多数派 218',senateLabel:'多数派 51'},
  nominations: {house:null,senate:51,houseLabel:'関与なし',senateLabel:'51 / 100'},
  treaties: {house:null,senate:67,houseLabel:'関与なし',senateLabel:'67 / 100'},
  impeachment: {house:218,senate:67,houseLabel:'218 / 435',senateLabel:'67 / 100'},
  'veto-override': {house:290,senate:67,houseLabel:'290 / 435',senateLabel:'67 / 100'},
  reconciliation: {house:218,senate:51,houseLabel:'218 / 435',senateLabel:'51 / 100'},
};
function powerVoteBars(rule: typeof powerRules[number]) {
  const spec = powerVoteSpecs[rule.powerId] ?? {house:null,senate:null,houseLabel:'要確認',senateLabel:'要確認'};
  const bar = (label:string,votes:number|null,text:string) => `<div class="power-vote"><div><span>${label}</span><b>${text}</b></div><div class="power-vote-track" aria-hidden="true"><i style="width:${votes === null ? 0 : Math.round(votes / 435 * 100)}%"></i></div></div>`;
  const senateBar = (label:string,votes:number|null,text:string) => `<div class="power-vote"><div><span>${label}</span><b>${text}</b></div><div class="power-vote-track senate-track" aria-hidden="true"><i style="width:${votes === null ? 0 : votes}%"></i></div></div>`;
  return `<div class="power-vote-bars">${bar('下院',spec.house,spec.houseLabel)}${senateBar('上院',spec.senate,spec.senateLabel)}</div><small class="power-nominal">${rule.nominalSeats}／${rule.threshold}</small>`;
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header class="mast">
  <div class="eyebrow">2026 UNITED STATES MIDTERMS</div><h1>中間選挙で<br>変わる権力</h1>
  <p class="dek">上院35議席と下院435議席の行方を、トランプ大統領への議会の制約、争点、地域経済までつないで読み解きます。</p>
  <nav class="jump-nav" aria-label="ページ内メニュー"><a href="#overview">全体像</a><a href="#senate">上院</a><a href="#powers">権限</a><a href="#issues">争点</a><a href="#house">下院</a></nav>
  <div class="dateline"><span>データ基準日 ${DATA_AS_OF}</span><span>上院 通常${regularCount}＋特別${specialCount}</span><span>下院 全435</span><span>候補者 ${candidateCount}人</span><span>版 ${APP_VERSION}</span><button id="reload-app" class="reload-app" type="button">最新版を再読み込み</button></div>
</header>
<main>
  <div class="data-caution ${baselineComplete ? 'verified' : ''}" role="note"><strong>${baselineComplete ? '基礎データを確認済み' : '基礎情報に未確認項目があります'}</strong><span>上院100議席、2026年35選挙、候補者、統一情勢評価、50州の人口・産業・2024年結果を収録。デラウェアは予備選前、ロードアイランドは9月9日の開票確定前として区別しています。</span></div>

  <section id="overview" class="overview section-block" aria-labelledby="overview-heading">
    <div class="section-heading"><div><p class="kicker">THE CONTROL MAP</p><h2 id="overview-heading">何議席が動き、何が変わるか</h2></div><p>まず改選議席の規模を確認し、その後に多数派を取った院が何を動かせるかを見ます。</p></div>
    <div class="fact-grid">
      <article><span>上院の可変部分</span><strong>35</strong><p>通常33＋特別2。全100議席のうち65議席は今回の選挙では動きません。</p></article>
      <article><span>下院の可変部分</span><strong>435</strong><p>全議席が2年ごとに改選。通常の全員在席時、多数派は218です。</p></article>
    </div>
    <div class="majority-scenarios">
      <article><p class="kicker">上院の例</p><h3>共和党が過半数を維持する場合</h3><p>上院多数党として委員長・議題・指名承認の主導権を持ち、民主党が単独で進める法案や人事を止めやすくなります。改選されない31議席を前提に、35議席のうち<strong>${republicanTargetForMajority}議席以上</strong>を共和党会派が得ると、51議席に届きます。</p></article>
      <article><p class="kicker">上院の例</p><h3>民主党が過半数を取る場合</h3><p>民主党会派が議題・委員会・指名承認を握り、政権の法案や人事に条件を付けられます。改選されない34議席を前提に、35議席のうち<strong>${democraticTargetForMajority}議席以上</strong>を民主党会派が得る必要があります。</p></article>
    </div>
    <div class="constraint-grid">
      <article><b>下院だけ反対党</b><p>法案と歳出を止め、委員会調査を主導し、過半数で弾劾訴追できます。単独では上院の指名承認や大統領罷免はできません。</p></article>
      <article><b>上院だけ反対党</b><p>指名承認、議題、委員会調査を握り、法案を止められます。条約は3分の2、弾劾有罪は出席議員の3分の2です。</p></article>
      <article><b>両院とも反対党</b><p>立法・予算・監督の制約が強まります。既存法に基づく行政権限は残り、拒否権突破にはさらに大きい超党派票が要ります。</p></article>
    </div>
  </section>

  <section id="senate" class="summary" aria-labelledby="current-heading"><div><p class="kicker">現在の上院会派構成</p><h2 id="current-heading">100議席の内訳</h2></div><div id="current-counts" class="counts"></div></section>
  <section class="workspace" aria-label="上院州別地図と詳細">
    <div class="map-column">
      <div class="controls" aria-label="地図表示設定"><div class="segmented"><button data-mode="current">投票前の議席</button><button data-mode="rating" class="active">選挙情勢</button></div><label class="switch"><input id="competitive" type="checkbox" ${hasRatings?'':'disabled'}><span>激戦のみ強調</span></label></div>
      ${hasRatings?'':'<p class="control-note" id="competitive-note">情勢評価が未取得のため、激戦強調は利用できません。</p>'}
      <div class="search-wrap"><label for="state-search">州を検索・選択</label><select id="state-search"><option value="">50州から選ぶ</option>${states.map(state => `<option value="${state.fips}">${state.nameJa} / ${state.nameEn} (${state.abbr})</option>`).join('')}</select></div>
      <div class="map-head"><div><p class="kicker">SENATE MAP</p><h2 id="map-heading">2026年の上院選挙</h2></div><p id="mode-note">色は対象議席の現保有党。州全体の支持傾向や勝敗予測ではありません。</p></div>
      <div id="map" class="map" aria-label="米国50州地図"></div><div id="legend" class="legend"></div>
      <p class="map-note">州の面積は議席数を表しません。アラスカとハワイは投影上、位置・縮尺が調整されています。★は特別選挙です。</p>
    </div>
    <aside id="detail" class="detail" aria-live="polite"><div class="empty-detail"><span>STATE BRIEFING</span><h2>州を選択してください</h2><p>地図または検索から、選挙の有無を問わず全50州の情報へ移動できます。</p></div></aside>
  </section>
  <section class="sim" aria-labelledby="sim-heading">
    <div class="sim-title"><div><p class="kicker">多数派への道</p><h2 id="sim-heading">議席シミュレーション</h2><p>通常${regularCount}件・特別${specialCount}件の一意な${targetSeatIds.length}議席について、当選者が参加すると仮定する会派を指定します。</p></div><button id="reset">初期状態へ戻す</button></div>
    <div class="warning">初期値は現保有会派を維持する仮定です。選挙予測・勝率ではありません。</div>
    <details class="vp-sources"><summary>副大統領と決裁票の出典</summary>${refs(vicePresident.sourceIds)}</details>
    <div id="sim-result"></div><details><summary>全${targetSeatIds.length}対象議席の仮定を変更</summary><div id="seat-controls" class="seat-controls"></div></details>
  </section>

  <section id="powers" class="section-block powers" aria-labelledby="powers-heading">
    <div class="section-heading"><div><p class="kicker">CHECKS ON THE PRESIDENT</p><h2 id="powers-heading">議会の権限と必要票</h2></div><p>「多数派を取る」だけで実行できることと、60票・3分の2を要することを分けます。</p></div>
    <div class="table-scroll"><table class="power-table"><thead><tr><th>権限</th><th>下院</th><th>上院</th><th>票数の目安</th><th>トランプ政権への作用</th></tr></thead><tbody>${powerRules.map(rule => `<tr><th>${rule.action}</th><td>${rule.house}</td><td>${rule.senate}</td><td><b>${rule.nominalSeats}</b><small>${rule.threshold}</small></td><td>${rule.presidentialConstraint}</td></tr>`).join('')}</tbody></table></div>
    <details class="source-panel"><summary>権限・票数の出典</summary>${refs([...new Set(powerRules.flatMap(rule => rule.sourceIds))])}</details>
  </section>

  <section id="issues" class="section-block issues" aria-labelledby="issues-heading">
    <div class="section-heading"><div><p class="kicker">ISSUE LENS</p><h2 id="issues-heading">8つの論点から選挙を見る</h2></div><p>各話題を一次分類へ一つだけ置き、権限・指標を別軸で結びます。</p></div>
    <div id="issue-tabs" class="issue-tabs" role="tablist" aria-label="論点を選択">${issueCategories.map(issue => `<button type="button" role="tab" data-issue="${issue.issueId}" aria-selected="${issue.issueId === activeIssueId}">${issue.label}</button>`).join('')}</div>
    <div id="issue-detail" class="issue-detail"></div>
    <article class="soy-case" aria-labelledby="soy-heading">
      <div class="soy-head"><div><p class="kicker">CASE STUDY</p><h3 id="soy-heading">大豆 × 中国 × 上院選</h3><p>生産量は政策評価への「曝露」を示します。投票理由そのものとは扱いません。</p></div><div class="soy-metric"><strong>${(soybeanTrade.chinaMetricTons/1_000_000).toFixed(1)}百万t</strong><span>中国向け輸出<br>${soybeanTrade.period}</span><b>${soybeanTrade.yearOverYearPercent}% 前年同期比</b></div></div>
      <div class="soy-findings"><article><strong>${topSoyTrumpStates} / 10州</strong><span>大豆生産上位州でTrumpが2024年勝利</span></article><article><strong>${topSoySenateRaces}州</strong><span>上位10州のうち2026年上院選あり</span></article><article><strong>${topSoyCompetitiveRaces}州</strong><span>そのうちToss Up / Lean（OH・IA）</span></article><p>対中強硬姿勢への支持が強かった農業州ほど、輸出減の影響にもさらされます。現時点で直ちに政権への反発とは読めず、特にオハイオとアイオワで、候補者が関税の長期的な交渉効果と短期的な農家損失をどう説明するかが検証点です。</p></div>
      <div class="soy-controls"><label for="soy-sort">州の並べ替え</label><select id="soy-sort"><option value="production">大豆生産量</option><option value="competitive">上院選の接戦度</option><option value="margin">2024年大統領選の僅差順</option></select></div>
      <div id="soy-table"></div>
      <p class="interpretation-note">読み方：中国はなお米国大豆輸出の${soybeanTrade.chinaSharePercent}%を占めますが、数量は前年同期から${Math.abs(soybeanTrade.yearOverYearPercent)}%減りました。生産上位州で上院選がある場合、候補者が関税・市場開放・農家支援をどう評価するかを候補者発言と併せて確認する入口になります。</p>
      <details class="source-panel"><summary>大豆・貿易データの出典</summary>${refs(soybeanTrade.sourceIds)}</details>
    </article>
  </section>

  <section id="house" class="section-block house" aria-labelledby="house-heading">
    <div class="section-heading"><div><p class="kicker">HOUSE: ALL 435 SEATS</p><h2 id="house-heading">下院選挙区と多数派</h2></div><p>現議会の構成と2026年選挙の情勢は別のスナップショットです。</p></div>
    <div class="house-summary">
      <article><span>現議会 ${houseSnapshot.asOf}</span><strong><i class="blue">${houseSnapshot.Democratic} D</i> / <i class="red">${houseSnapshot.Republican} R</i></strong><small>無所属${houseSnapshot.Independent}・空席${houseSnapshot.vacant}</small></article>
      <article><span>2026年改選</span><strong>435 / 435</strong><small>多数派の基準は218</small></article>
      <article><span>情勢評価</span><strong>${houseDistricts.filter(district => district.rating === 'Toss Up').length} Toss Up</strong><small>全435区を同一の合意分類で表示</small></article>
    </div>
    <div class="house-workspace">
      <div>
        <div class="house-search"><label for="house-state-search">州</label><select id="house-state-search"><option value="">州を選ぶ</option>${states.map(state => `<option value="${state.fips}">${state.nameJa} (${state.abbr})</option>`).join('')}</select><label for="house-district-search">選挙区</label><select id="house-district-search" disabled><option value="">先に州を選ぶ</option></select></div>
        <div id="house-map" class="map house-map" aria-label="2026年連邦下院435選挙区地図"></div>
        <div class="legend">${(['Solid D','Likely D','Lean D','Toss Up','Lean R','Likely R','Solid R'] as Rating[]).map(item => `<span><i style="background:${ratingColors[item]}"></i>${item}</span>`).join('')}</div>
        <p class="map-note">2026年用区割りの9月9日取得スナップショットです。中間期の区割り訴訟が続く州では境界が変わる可能性があります。州・選挙区セレクトからも全435区へ移動できます。</p>
      </div>
      <aside id="house-detail" class="house-detail" aria-live="polite"><p class="kicker">DISTRICT BRIEFING</p><h3>選挙区を選択</h3><p>地図またはセレクトから情勢と仮定を確認できます。</p></aside>
    </div>
    <div class="house-sim"><div class="sim-title"><div><p class="kicker">HOUSE CONTROL</p><h3>下院シミュレーション</h3><p>合意情勢を初期値にし、Solid以外の選挙区を変更できます。Toss Upは未確定から始まります。</p></div><button id="house-reset" type="button">初期状態へ戻す</button></div><div id="house-sim-result"></div><details><summary>Solid以外の選挙区を変更</summary><div id="house-controls" class="seat-controls house-controls"></div></details></div>
    <details class="source-panel"><summary>下院データ・区割りの出典</summary>${refs(['house-clerk-roster','house-consensus-2026','house-boundaries-2026','ncsl-redistricting-2026'])}</details>
  </section>

  <section class="method"><p class="kicker">READING THE DATA</p><h2>表示の読み方</h2><div class="method-grid"><article><b>事実・評価・仮定を分離</b><p>現職と公式統計は事実、情勢分類は評価機関の判断、シミュレーションは利用者の仮定として表示します。</p></article><article><b>時点の違いを表示</b><p>候補者は9月9日、上院情勢は8月26日、下院合意情勢は8月31日のスナップショットです。</p></article><article><b>地域指標は因果を示さない</b><p>人口、産業、大豆生産、過去の得票は政策への曝露や背景です。それだけで投票理由を断定しません。</p></article></div><details class="source-panel"><summary>全データソース（${sources.length}件）</summary>${refs(sources.map(source => source.sourceId))}</details></section>
</main><footer>静的データ版 ${APP_VERSION}。表示ごとに資料名、対象期間、取得日、内容確認日を記録しています。</footer>`;

function enhanceLayout() {
  const main = document.querySelector<HTMLElement>('main');
  if (!main || document.querySelector('#news')) return;
  const caution = main.querySelector<HTMLElement>('.data-caution');
  const overview = main.querySelector<HTMLElement>('#overview');
  const powers = main.querySelector<HTMLElement>('#powers');
  const senate = main.querySelector<HTMLElement>('#senate');
  const workspace = main.querySelector<HTMLElement>('.workspace');
  const sim = main.querySelector<HTMLElement>('.sim');
  const issues = main.querySelector<HTMLElement>('#issues');
  const house = main.querySelector<HTMLElement>('#house');
  const method = main.querySelector<HTMLElement>('.method');
  overviewSection = overview;
  issuesSection = issues;

  const nav = document.querySelector<HTMLElement>('.jump-nav');
  if (nav) {
    nav.innerHTML = '<a href="#news">ニュース</a><a href="#powers">議席と権限</a><a href="#simulator">シミュレーション</a><a href="#sources">出典</a>';
  }
  const mast = document.querySelector<HTMLElement>('.mast');
  if (mast && !document.querySelector('#open-guide')) {
    const links = document.createElement('div');
    links.className = 'quick-links';
    links.setAttribute('aria-label', '解説パネル');
    links.innerHTML = '<button id="open-guide" class="quick-link" type="button">初めて開いた方へ</button><button id="open-issues" class="quick-link" type="button">8つの論点から選挙を見る</button>';
    mast.insertBefore(links, mast.querySelector('.dateline'));
  }

  const news = document.createElement('section');
  news.id = 'news';
  news.className = 'section-block news-section';
  news.setAttribute('aria-labelledby', 'news-heading');
  news.innerHTML = '<div class="section-heading"><div><p class="kicker">NEWS & EVENTS</p><h2 id="news-heading">選挙を動かしうるニュース</h2></div><p>カードをタップすると、概略・考えうる影響・出典を主画面上のパネルで確認できます。枠内は独立してスクロールします。</p></div><p class="news-editorial-note"></p><div class="news-frame"><div id="news-list" class="news-list" tabindex="0" aria-label="ニュース一覧"></div><div id="news-scrollbar" class="custom-scrollbar" role="scrollbar" aria-controls="news-list" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><span class="scroll-thumb"></span></div></div><div class="news-pagination"><span id="news-page-status" aria-live="polite"></span><div><button id="news-prev" type="button">前の10件</button><button id="news-next" type="button">次の10件</button></div></div>';
  const newsNote = news.querySelector<HTMLElement>('.news-editorial-note');
  if (newsNote) newsNote.textContent = newsEditorialNote;
  if (caution) main.insertBefore(news, caution.nextSibling);
  else main.insertBefore(news, main.firstChild);

  if (powers) {
    const heading = powers.querySelector<HTMLElement>('.section-heading');
    const disclosure = document.createElement('details');
    disclosure.id = 'power-disclosure';
    disclosure.open = true;
    try {
      disclosure.open = localStorage.getItem(POWER_DISCLOSURE_KEY) !== 'closed';
    } catch {
      disclosure.open = true;
    }
    const summary = document.createElement('summary');
    summary.className = 'section-summary';
    summary.innerHTML = '<div class="summary-main">' + (heading?.innerHTML ?? '<p class="kicker">CHECKS ON THE PRESIDENT</p><h2 id="powers-heading">議会の権限と必要票</h2>') + '</div><span class="summary-hint">タイトルをタップして開閉</span>';
    disclosure.append(summary);
    heading?.remove();
    while (powers.firstChild) disclosure.append(powers.firstChild);
    powers.append(disclosure);
    disclosure.addEventListener('toggle', () => {
      try {
        localStorage.setItem(POWER_DISCLOSURE_KEY, disclosure.open ? 'open' : 'closed');
      } catch {
        // Private browsing can reject localStorage; the open state still works for this visit.
      }
    });
    const table = powers.querySelector<HTMLTableElement>('.power-table');
    if (table) {
      [...(table.tBodies[0]?.rows ?? [])].forEach((row, index) => {
        const rule = powerRules[index];
        const voteCell = row.cells[3];
        if (rule && voteCell && voteCell.dataset.visualized !== 'true') {
          voteCell.dataset.visualized = 'true';
          voteCell.innerHTML = powerVoteBars(rule);
        }
      });
    }
    if (table && !table.dataset.actionsAdded) {
      table.dataset.actionsAdded = 'true';
      const header = table.tHead?.rows[0];
      if (header) {
        const cell = document.createElement('th');
        cell.textContent = '逆算';
        header.append(cell);
      }
      [...(table.tBodies[0]?.rows ?? [])].forEach((row, index) => {
        const rule = powerRules[index];
        if (!rule) return;
        const cell = document.createElement('td');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'power-target-button';
        button.dataset.powerTarget = rule.powerId;
        button.textContent = '条件を確認';
        cell.append(button);
        row.append(cell);
      });
    }
    main.insertBefore(powers, news.nextSibling);
  }

  if (sim) {
    sim.id = 'simulator';
    sim.setAttribute('aria-labelledby', 'sim-heading');
    const simTitle = sim.querySelector<HTMLElement>('.sim-title');
    const tabs = document.createElement('div');
    tabs.className = 'sim-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'シミュレーション表示');
    tabs.innerHTML = '<button type="button" role="tab" data-sim-mode="target" aria-selected="false">権限から逆算</button><span class="sim-tabs-note">選挙情勢／投票前の議席構成は、地図直上の切替で表示します。</span>';
    const targetPanel = document.createElement('div');
    targetPanel.id = 'target-sim-panel';
    targetPanel.className = 'target-sim-panel';
    targetPanel.hidden = true;
    if (simTitle) {
      simTitle.after(tabs);
      tabs.after(targetPanel);
    } else {
      sim.prepend(targetPanel);
      targetPanel.before(tabs);
    }
    const holderButton = sim.querySelector<HTMLButtonElement>('[data-mode="holder"]');
    if (holderButton) {
      holderButton.dataset.mode = 'current';
      holderButton.textContent = '投票前の議席';
    }
    const ratingButton = sim.querySelector<HTMLButtonElement>('[data-mode="rating"]');
    if (ratingButton) {
      ratingButton.textContent = '選挙情勢';
      ratingButton.classList.add('active');
    }
    if (senate && !sim.contains(senate)) {
      const warning = sim.querySelector('.warning');
      sim.insertBefore(senate, warning ?? null);
    }
    if (workspace && !sim.contains(workspace)) {
      const warning = sim.querySelector('.warning');
      sim.insertBefore(workspace, warning ?? null);
    }
    const movedHolderButton = sim.querySelector<HTMLButtonElement>('[data-mode="holder"]');
    if (movedHolderButton) {
      movedHolderButton.dataset.mode = 'current';
      movedHolderButton.textContent = '投票前の議席';
    }
    const movedRatingButton = sim.querySelector<HTMLButtonElement>('[data-mode="rating"]');
    if (movedRatingButton) movedRatingButton.textContent = '選挙情勢';
    if (house && !sim.contains(house)) {
      const houseReference = document.createElement('details');
      houseReference.id = 'house-reference';
      houseReference.className = 'reference-block';
      const houseSummary = document.createElement('summary');
      houseSummary.textContent = '下院435議席の地図と補助シミュレーション';
      houseReference.append(houseSummary, house);
      sim.append(houseReference);
    }
    main.insertBefore(sim, powers?.nextSibling ?? news.nextSibling);
  }
  if (overview) overview.remove();
  if (issues) issues.remove();
  if (method) {
    method.id = 'sources';
    method.classList.add('section-block');
  }

  const overlay = document.createElement('div');
  overlay.id = 'overlay-root';
  overlay.className = 'overlay-root';
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<div class="overlay-backdrop" data-overlay-close></div><section class="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="overlay-heading"><header class="overlay-header"><div><p id="overlay-kicker" class="kicker">PANEL</p><h2 id="overlay-heading">解説</h2></div><button id="overlay-close" class="close overlay-close" type="button" aria-label="パネルを閉じる">×</button></header><div class="overlay-body"><div id="overlay-content" class="overlay-content" tabindex="0"></div><div id="overlay-scrollbar" class="custom-scrollbar" role="scrollbar" aria-controls="overlay-content" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><span class="scroll-thumb"></span></div></div></section>';
  document.body.append(overlay);
  document.querySelector<HTMLElement>('[data-overlay-close]')?.addEventListener('click', () => closeOverlay());
  document.querySelector<HTMLButtonElement>('#overlay-close')?.addEventListener('click', () => closeOverlay());
  document.querySelector<HTMLButtonElement>('#open-guide')?.addEventListener('click', () => openOverlay('guide'));
  document.querySelector<HTMLButtonElement>('#open-issues')?.addEventListener('click', () => openOverlay('issues'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlayKind) closeOverlay();
  });
  document.querySelector<HTMLButtonElement>('#news-prev')?.addEventListener('click', () => {
    newsPage = Math.max(0, newsPage - 1);
    renderNewsList();
  });
  document.querySelector<HTMLButtonElement>('#news-next')?.addEventListener('click', () => {
    newsPage += 1;
    renderNewsList();
  });
}

const NEWS_KIND_LABEL: Record<string, string> = {
  policy: '政策',
  speech: '発言',
  protest: '社会行動',
  election: '選挙',
  economy: '経済',
  'data-update': 'データ更新',
};

function setupScrollIndicator(scrollId: string, trackId: string) {
  const scroll = document.querySelector<HTMLElement>('#' + scrollId);
  const track = document.querySelector<HTMLElement>('#' + trackId);
  const thumb = track?.querySelector<HTMLElement>('.scroll-thumb');
  if (!scroll || !track || !thumb) return;
  const sync = () => {
    const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
    const ratio = scroll.scrollHeight ? Math.min(1, scroll.clientHeight / scroll.scrollHeight) : 1;
    track.hidden = ratio >= 0.999;
    thumb.style.height = Math.max(24, Math.round(track.clientHeight * ratio)) + 'px';
    const available = Math.max(0, track.clientHeight - thumb.offsetHeight);
    thumb.style.transform = 'translateY(' + (max ? Math.round(available * scroll.scrollTop / max) : 0) + 'px)';
    track.setAttribute('aria-valuenow', String(max ? Math.round(scroll.scrollTop / max * 100) : 0));
  };
  if (track.dataset.bound !== 'true') {
    track.dataset.bound = 'true';
    scroll.addEventListener('scroll', sync, {passive: true});
    track.addEventListener('pointerdown', event => {
      const rect = track.getBoundingClientRect();
      const point = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      scroll.scrollTop = (scroll.scrollHeight - scroll.clientHeight) * point;
    });
    track.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') scroll.scrollTop = 0;
      else if (event.key === 'End') scroll.scrollTop = scroll.scrollHeight;
      else scroll.scrollTop += event.key.includes('Down') ? scroll.clientHeight : -scroll.clientHeight;
    });
    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(scroll);
  }
  sync();
}

function renderNewsList() {
  const list = document.querySelector<HTMLElement>('#news-list');
  const status = document.querySelector<HTMLElement>('#news-page-status');
  const previous = document.querySelector<HTMLButtonElement>('#news-prev');
  const next = document.querySelector<HTMLButtonElement>('#news-next');
  if (!list || !status || !previous || !next) return;
  const pageCount = Math.max(1, Math.ceil(newsItems.length / NEWS_PAGE_SIZE));
  newsPage = Math.min(Math.max(0, newsPage), pageCount - 1);
  const start = newsPage * NEWS_PAGE_SIZE;
  const pageItems = newsItems.slice(start, start + NEWS_PAGE_SIZE);
  list.innerHTML = '';
  list.scrollTop = 0;
  if (!pageItems.length) {
    const empty = document.createElement('p');
    empty.className = 'news-empty';
    empty.textContent = '表示できるニュースがありません。';
    list.append(empty);
  }
  pageItems.forEach(item => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'news-card';
    card.dataset.newsId = item.newsId;
    card.setAttribute('aria-label', item.headline + 'の詳細を開く');
    const meta = document.createElement('span');
    meta.className = 'news-meta';
    meta.textContent = (NEWS_KIND_LABEL[item.kind] ?? 'ニュース') + ' · ' + item.eventDate + (item.location.label ? ' · ' + item.location.label : '');
    const headline = document.createElement('strong');
    headline.textContent = item.headline;
    const summary = document.createElement('span');
    summary.className = 'news-summary';
    summary.textContent = item.summary;
    card.append(meta, headline, summary);
    card.addEventListener('click', () => openOverlay('news', item.newsId));
    list.append(card);
  });
  status.textContent = newsItems.length ? (newsPage + 1) + ' / ' + pageCount + 'ページ · ' + (start + 1) + '–' + Math.min(start + pageItems.length, newsItems.length) + '件' : '0件';
  previous.disabled = newsPage === 0;
  next.disabled = newsPage >= pageCount - 1;
  setupScrollIndicator('news-list', 'news-scrollbar');
}

function renderNewsDetail(newsId: string) {
  const content = document.querySelector<HTMLElement>('#overlay-content');
  const item = newsItems.find(entry => entry.newsId === newsId);
  if (!content || !item) return;
  content.innerHTML = '';
  const article = document.createElement('article');
  article.className = 'news-detail';
  const meta = document.createElement('p');
  meta.className = 'news-meta';
  meta.textContent = (NEWS_KIND_LABEL[item.kind] ?? 'ニュース') + ' · 発生日 ' + item.eventDate + ' · 公開日 ' + item.publishedAt;
  const title = document.createElement('h3');
  title.textContent = item.headline;
  const summary = document.createElement('p');
  summary.className = 'news-long-text';
  summary.textContent = item.summary;
  const impactHeading = document.createElement('h4');
  impactHeading.textContent = '考えうる影響';
  const impact = document.createElement('p');
  impact.className = 'news-long-text';
  impact.textContent = item.possibleImpact;
  article.append(meta, title, summary, impactHeading, impact);
  if (item.location.mapMode !== 'none') {
    const mapSection = document.createElement('section');
    mapSection.className = 'news-mini-section';
    const mapTitle = document.createElement('h4');
    mapTitle.textContent = item.location.mapMode === 'points' ? '発生地点' : '関連州（☆は州の代表位置）';
    const mapHost = document.createElement('div');
    mapHost.id = 'news-mini-map';
    mapHost.className = 'news-mini-map';
    mapSection.append(mapTitle, mapHost);
    article.append(mapSection);
  }
  if (item.issueIds.length) {
    const issueNav = document.createElement('div');
    issueNav.className = 'news-issue-links';
    const issueLabel = document.createElement('b');
    issueLabel.textContent = '関連する論点';
    issueNav.append(issueLabel);
    item.issueIds.forEach(issueId => {
      const issue = issueCategories.find(entry => entry.issueId === issueId);
      if (!issue) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = issue.label;
      button.addEventListener('click', () => {
        activeIssueId = issueId;
        openOverlay('issues');
      });
      issueNav.append(button);
    });
    article.append(issueNav);
  }
  const sourceDetails = document.createElement('details');
  sourceDetails.className = 'source-panel';
  sourceDetails.open = true;
  sourceDetails.innerHTML = '<summary>出典</summary>' + refs(item.sourceIds);
  article.append(sourceDetails);
  content.append(article);
  renderNewsMiniMap(item);
  setupScrollIndicator('overlay-content', 'overlay-scrollbar');
}

function renderNewsMiniMap(item: typeof newsItems[number]) {
  const host = document.querySelector<HTMLElement>('#news-mini-map');
  if (!host) return;
  host.innerHTML = '';
  if (!geoFeatures.length) {
    host.textContent = '州境データを読み込み中です。';
    return;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 975 610');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'ニュースに関連する地域の小地図');
  const projection = geoAlbersUsa().scale(1275).translate([487.5, 305]);
  const path = geoPath(projection);
  const statesInNews = new Set(item.location.stateFips ?? []);
  geoFeatures.forEach(featureItem => {
    const fips = String(featureItem.id).padStart(2, '0');
    const statePath = document.createElementNS(svg.namespaceURI, 'path');
    statePath.setAttribute('d', path(featureItem) || '');
    statePath.setAttribute('class', statesInNews.has(fips) ? 'news-region' : 'news-region-muted');
    svg.append(statePath);
    if (item.location.mapMode === 'region' && statesInNews.has(fips) && !(item.location.points ?? []).length) {
      const [x, y] = path.centroid(featureItem);
      const marker = document.createElementNS(svg.namespaceURI, 'text');
      marker.textContent = '☆';
      marker.setAttribute('x', String(x));
      marker.setAttribute('y', String(y));
      marker.setAttribute('class', 'news-star');
      marker.setAttribute('aria-label', (stateByFips.get(fips)?.nameJa ?? '関連州') + 'の代表位置（地点未特定）');
      svg.append(marker);
    }
  });
  (item.location.points ?? []).forEach(point => {
    const projected = projection([point.longitude, point.latitude]);
    if (!projected) return;
    const marker = document.createElementNS(svg.namespaceURI, 'text');
    marker.textContent = '☆';
    marker.setAttribute('x', String(projected[0]));
    marker.setAttribute('y', String(projected[1]));
    marker.setAttribute('class', 'news-star');
    marker.setAttribute('aria-label', point.label);
    svg.append(marker);
  });
  host.append(svg);
  if (item.location.label) {
    const label = document.createElement('p');
    label.className = 'news-map-label';
    label.textContent = item.location.label;
    host.append(label);
  }
}

function renderGuidePanel() {
  const content = document.querySelector<HTMLElement>('#overlay-content');
  if (!content) return;
  content.innerHTML = '';
  const intro = document.createElement('p');
  intro.className = 'guide-intro';
  intro.textContent = guideContent.intro;
  content.append(intro);
  guideContent.sections.forEach(section => {
    const article = document.createElement('article');
    article.className = 'guide-section';
    const heading = document.createElement('h3');
    heading.textContent = section.title;
    const body = document.createElement('p');
    body.textContent = section.body;
    article.append(heading, body);
    content.append(article);
  });
  if (overviewSection) {
    const heading = document.createElement('h3');
    heading.className = 'guide-existing-heading';
    heading.textContent = '基礎知識の詳細';
    content.append(heading, overviewSection);
  }
  setupScrollIndicator('overlay-content', 'overlay-scrollbar');
}

function renderIssueReportNotice() {
  const detail = document.querySelector<HTMLElement>('#issue-detail');
  if (!detail) return;
  detail.parentElement?.querySelector('.issue-report-notice')?.remove();
  const report = issueReports[activeIssueId];
  if (!report) return;
  const notice = document.createElement('p');
  notice.className = 'issue-report-notice pending';
  notice.textContent = report.note;
  detail.before(notice);
}

function bindIssueTabs() {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-issue]')];
  buttons.forEach((button, index) => {
    button.onclick = () => {
      activeIssueId = button.dataset.issue ?? activeIssueId;
      renderIssueDetail();
      renderIssueReportNotice();
      bindIssuePowerLinks();
    };
    button.onkeydown = event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[nextIndex].click();
      buttons[nextIndex].focus();
    };
  });
}

function bindIssuePowerLinks() {
  document.querySelectorAll<HTMLAnchorElement>('#issue-detail a[href="#powers"]').forEach(link => {
    link.onclick = event => {
      event.preventDefault();
      closeOverlay();
      setSimulatorMode('target');
      document.querySelector('#simulator')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    };
  });
}

function renderIssuesPanel() {
  const content = document.querySelector<HTMLElement>('#overlay-content');
  if (!content) return;
  content.innerHTML = '';
  if (issuesSection) content.append(issuesSection);
  renderIssueDetail();
  renderSoyTable();
  renderIssueReportNotice();
  bindIssueTabs();
  bindIssuePowerLinks();
  const soySortSelect = document.querySelector<HTMLSelectElement>('#soy-sort');
  if (soySortSelect) soySortSelect.onchange = event => {
    soySort = (event.target as HTMLSelectElement).value as typeof soySort;
    renderSoyTable();
  };
  setupScrollIndicator('overlay-content', 'overlay-scrollbar');
}

function openOverlay(kind: 'guide'|'issues'|'news', newsId?: string) {
  const root = document.querySelector<HTMLElement>('#overlay-root');
  const content = document.querySelector<HTMLElement>('#overlay-content');
  const heading = document.querySelector<HTMLElement>('#overlay-heading');
  const kicker = document.querySelector<HTMLElement>('#overlay-kicker');
  const close = document.querySelector<HTMLButtonElement>('#overlay-close');
  if (!root || !content || !heading || !kicker) return;
  if (!overlayKind) {
    overlayReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    overlayReturnScrollY = window.scrollY;
  }
  overlayKind = kind;
  overlayNewsId = newsId ?? null;
  root.hidden = false;
  root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
  if (kind === 'guide') {
    kicker.textContent = 'FIRST VISIT';
    heading.textContent = '初めて開いた方へ';
    renderGuidePanel();
  } else if (kind === 'issues') {
    kicker.textContent = 'ISSUE LENS';
    heading.textContent = '8つの論点から選挙を見る';
    renderIssuesPanel();
  } else {
    kicker.textContent = 'NEWS DETAIL';
    heading.textContent = 'ニュースの詳細';
    if (newsId) renderNewsDetail(newsId);
  }
  close?.focus();
}

function closeOverlay() {
  const root = document.querySelector<HTMLElement>('#overlay-root');
  if (!root || !overlayKind) return;
  root.hidden = true;
  root.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overlay-open');
  overlayKind = null;
  overlayNewsId = null;
  window.scrollTo({top: overlayReturnScrollY, behavior: 'auto'});
  if (overlayReturnFocus?.isConnected) overlayReturnFocus.focus();
  overlayReturnFocus = null;
}

function renderTargetSim() {
  const host = document.querySelector<HTMLElement>('#target-sim-panel');
  if (!host) return;
  host.hidden = simulatorMode !== 'target';
  if (simulatorMode !== 'target') return;
  const rule = powerRules.find(item => item.powerId === targetActionId) ?? powerRules[0];
  host.innerHTML = '<div class="target-grid"><div class="target-controls"><p class="kicker">REVERSE PATH</p><h3>権限から必要な議席を確認</h3><p>行使したい権限と党を選ぶと、制度上の必要票と現在の議席を並べます。</p></div><div class="target-rule"></div></div>';
  const controls = host.querySelector<HTMLElement>('.target-controls');
  const ruleHost = host.querySelector<HTMLElement>('.target-rule');
  if (!controls || !ruleHost || !rule) return;
  const actionLabel = document.createElement('label');
  actionLabel.className = 'target-field';
  actionLabel.textContent = '権限';
  const actionSelect = document.createElement('select');
  actionSelect.id = 'target-power';
  powerRules.forEach(item => {
    const option = document.createElement('option');
    option.value = item.powerId;
    option.textContent = item.action;
    option.selected = item.powerId === targetActionId;
    actionSelect.append(option);
  });
  actionSelect.onchange = () => {
    targetActionId = actionSelect.value;
    renderTargetSim();
  };
  actionLabel.append(actionSelect);
  const partyLabelElement = document.createElement('label');
  partyLabelElement.className = 'target-field';
  partyLabelElement.textContent = '想定する党';
  const partySelect = document.createElement('select');
  partySelect.id = 'target-party';
  [['Democratic', '民主党会派'], ['Republican', '共和党会派']].forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.selected = value === targetParty;
    partySelect.append(option);
  });
  partySelect.onchange = () => {
    targetParty = partySelect.value as typeof targetParty;
    renderTargetSim();
  };
  partyLabelElement.append(partySelect);
  controls.append(actionLabel, partyLabelElement);
  const current = currentCaucusCounts(seats);
  const currentLine = document.createElement('p');
  currentLine.className = 'target-current';
  currentLine.textContent = '現在の会派：民主党 ' + current.Democratic + '／共和党 ' + current.Republican + '。想定党：' + (targetParty === 'Democratic' ? '民主党会派' : '共和党会派') + '。';
  const ruleHeading = document.createElement('h3');
  ruleHeading.textContent = rule.action;
  const ruleText = document.createElement('p');
  ruleText.className = 'target-rule-text';
  ruleText.textContent = '下院：' + rule.house + '／上院：' + rule.senate;
  const threshold = document.createElement('p');
  threshold.className = 'target-threshold';
  threshold.textContent = '必要票の目安：' + rule.nominalSeats + '。' + rule.threshold;
  const pending = document.createElement('p');
  pending.className = 'issue-report-notice pending';
  pending.textContent = '自動的な州の組合せ、境界州の論点、当選確率は研究中です。検証済みの因果係数が揃うまで、未確認の経路を結果として表示しません。';
  const manual = document.createElement('button');
  manual.type = 'button';
  manual.className = 'target-manual-button';
  manual.textContent = '手動の議席仮定を開く';
  manual.onclick = () => {
    const details = document.querySelector<HTMLDetailsElement>('#seat-controls')?.closest('details');
    if (details) details.open = true;
    document.querySelector('#seat-controls')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };
  ruleHost.append(currentLine, ruleHeading, ruleText, threshold, pending, manual);
}

function setSimulatorMode(next: SimulatorMode) {
  simulatorMode = next;
  mode = next === 'current' ? 'current' : 'rating';
  if (next === 'current') competitive = false;
  document.querySelectorAll<HTMLButtonElement>('[data-sim-mode]').forEach(button => {
    const active = button.dataset.simMode === next;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
  const competitiveInput = document.querySelector<HTMLInputElement>('#competitive');
  if (competitiveInput) {
    competitiveInput.disabled = mode === 'current' || !hasRatings;
    competitiveInput.checked = competitive;
  }
  const note = document.querySelector<HTMLElement>('#mode-note');
  if (note) note.textContent = mode === 'current' ? '色は投票前の現職会派です。選挙情勢や当選確率ではありません。' : '色は評価機関による2026年8月26日の情勢分類です。勝率や確定結果ではありません。';
  const heading = document.querySelector<HTMLElement>('#map-heading');
  if (heading) heading.textContent = mode === 'current' ? '投票前の上院議席構成' : '2026年の上院選挙情勢';
  renderTargetSim();
  renderMap();
}

function holderFor(state: State) {
  const stateElections = electionByState(state);
  if (!stateElections.length) return 'none';
  const parties = [...new Set(stateElections.map(election => { const seat = seatById.get(election.seatId)!; return seat.verificationStatus === 'confirmed' && seat.verifiedAt ? seat.party : 'unknown'; }))];
  return parties.length === 1 ? parties[0] : 'mixed';
}
function caucusForState(state: State): Caucus|'mixed'|'none' {
  const stateSeats = seats.filter(seat => seat.stateFips === state.fips);
  if (!stateSeats.length) return 'none';
  const caucuses = [...new Set(stateSeats.map(seat => seat.caucus))];
  return caucuses.length === 1 ? caucuses[0] : 'mixed';
}
function ratingFor(state: State): Rating|'none'|'mixed' {
  const stateElections = electionByState(state);
  if (!stateElections.length) return 'none';
  const ratings = [...new Set(stateElections.map(election => election.rating.category))];
  return ratings.length === 1 ? ratings[0] : 'mixed';
}
function isCompetitive(state: State) { return electionByState(state).some(election => ['Toss Up','Lean D','Lean R'].includes(election.rating.category)); }
function fill(state: State) {
  if (mode === 'current') return ({Democratic:'#2166ac',Republican:'#b52b35',none:'#ececea',mixed:'#725f4c',vacant:'#f2c14e',unconfirmed:'#b8b7b3'} as Record<string,string>)[caucusForState(state)];
  const rating = ratingFor(state);
  return rating === 'none' ? '#ececea' : rating === 'mixed' ? '#725f4c' : ratingColors[rating];
}
function renderCounts() {
  const counts = currentCaucusCounts(seats);
  const unresolved = counts.none + counts.unconfirmed + counts.vacant;
  document.querySelector('#current-counts')!.innerHTML = `<div class="count dem"><strong>${counts.Democratic}</strong><span>民主党会派</span></div><div class="bar" aria-hidden="true"><i style="width:${counts.Democratic}%"></i><i style="width:${counts.Republican}%"></i></div><div class="count rep"><strong>${counts.Republican}</strong><span>共和党会派</span></div>${unresolved ? `<div class="count"><strong>${unresolved}</strong><span>その他・未確認・空席</span></div>` : ''}`;
}

let geoFeatures: Feature<Geometry>[] = [];
async function initMap() {
  const topology = await fetch(`${import.meta.env.BASE_URL}data/states-10m.json`).then(response => response.json()) as Topology;
  const collection = feature(topology,topology.objects.states) as unknown as FeatureCollection;
  geoFeatures = collection.features.filter(item => stateByFips.has(String(item.id).padStart(2,'0')));
  renderMap();
  if (overlayKind === 'news' && overlayNewsId) renderNewsMiniMap(newsItems.find(item => item.newsId === overlayNewsId)!);
}
function renderMap() {
  const host = document.querySelector('#map')!;
  host.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 975 610'); svg.setAttribute('role','group'); svg.setAttribute('aria-label','州境地図。州検索でも同じ情報を選べます');
  const path = geoPath(geoAlbersUsa().scale(1275).translate([487.5,305]));
  geoFeatures.forEach(item => {
    const fips = String(item.id).padStart(2,'0');
    const state = stateByFips.get(fips)!;
    const hasSpecial = electionByState(state).some(election => election.type === 'special');
    const statePath = document.createElementNS(svg.namespaceURI,'path');
    statePath.setAttribute('d',path(item) || ''); statePath.setAttribute('fill',fill(state));
    statePath.setAttribute('data-state-fips',fips);
    statePath.setAttribute('class',`${selected?.fips === fips ? 'selected ' : ''}${competitive && mode === 'rating' && !isCompetitive(state) ? 'muted' : ''}`);
    statePath.setAttribute('tabindex','0'); statePath.setAttribute('role','button');
    statePath.setAttribute('aria-label',`${state.nameJa}、${electionByState(state).length ? '2026年選挙あり' : '2026年選挙なし'}${hasSpecial ? '、特別選挙あり' : ''}`);
    statePath.addEventListener('click',event => selectState(state,event.currentTarget as HTMLElement));
    statePath.addEventListener('keydown',event => { const key = (event as KeyboardEvent).key; if (key === 'Enter' || key === ' ') { event.preventDefault(); selectState(state,event.currentTarget as HTMLElement); } });
    const title = document.createElementNS(svg.namespaceURI,'title'); title.textContent = `${state.nameJa} (${state.abbr})${hasSpecial ? '・特別選挙あり' : ''}`; statePath.append(title); svg.append(statePath);
    if (hasSpecial) {
      const [x,y] = path.centroid(item);
      const star = document.createElementNS(svg.namespaceURI,'text'); star.textContent = '★'; star.setAttribute('x',String(x)); star.setAttribute('y',String(y)); star.setAttribute('class','special-star'); star.setAttribute('aria-hidden','true'); svg.append(star);
    }
  });
  host.append(svg);
  const heading = document.querySelector<HTMLElement>('#map-heading');
  if (heading) heading.textContent = mode === 'current' ? '投票前の上院議席構成' : '2026年の上院選挙情勢';
  const note = document.querySelector<HTMLElement>('#mode-note');
  if (note) note.textContent = mode === 'current' ? '色は投票前の現職会派です。選挙情勢や当選確率ではありません。' : '色は評価機関による2026年8月26日の情勢分類です。勝率や確定結果ではありません。';
  renderLegend();
}
function renderLegend() {
  const items = mode === 'current'
    ? [['#2166ac','民主党会派'],['#b52b35','共和党会派'],['#725f4c','州内で会派が分かれる'],['#b8b7b3','未確認'],['transparent','★ 特別選挙']]
    : [['#174f9e','Solid D'],['#93b7dc','Lean D'],['#8a8178','Toss Up'],['#e59a9a','Lean R'],['#a5262e','Solid R'],['#d9d8d4','未取得'],['#ececea','選挙なし'],['transparent','★ 特別選挙']];
  document.querySelector('#legend')!.innerHTML = items.map(([color,label]) => `<span>${label.startsWith('★') ? '<b aria-hidden="true">★</b>' : `<i style="background:${color}"></i>`}${label}</span>`).join('');
}
function refs(ids: string[]) {
  const list = [...new Set(ids)].map(id => sourceById.get(id)).filter(Boolean);
  return list.length ? `<ol>${list.map(source => `<li><a href="${source!.url}" target="_blank" rel="noreferrer">${source!.title}</a> — ${source!.publisher}<br><small>対象：${source!.referencePeriod}${source!.publishedAt ? `／公開：${source!.publishedAt}` : ''}${source!.updatedAt ? `／資料更新：${source!.updatedAt}` : ''}／取得：${source!.retrievedAt ?? '未取得'}／内容確認：${source!.contentVerifiedAt ?? '未完了'}</small></li>`).join('')}</ol>` : '<p>この項目に紐づく出典は未登録です。</p>';
}
const evidenceLabels: Record<string,string> = {incumbent:'現職氏名',party:'党籍',caucus:'会派',vacant:'空席の有無',senateClass:'Class',termStart:'任期の開始・就任規定',termEnd:'任期の終了',seatId:'対象議席',type:'通常／特別の区分',date:'投票日',name:'氏名'};
function attributeRefs(attributes: Partial<Record<string,string[]>>) {
  return `<details class="attribute-evidence"><summary>確認項目と出典</summary><ul>${Object.entries(attributes).map(([field,ids]) => `<li><b>${evidenceLabels[field] ?? field}</b>：${(ids ?? []).map(id => { const source = sourceById.get(id); return source ? `<a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>` : '出典未登録'; }).join('、')}</li>`).join('')}</ul></details>`;
}

function twoPartyShares(context: typeof stateContexts[number]) {
  const margin = Math.max(0, context.presidentialMargin2024 ?? 0);
  const winnerShare = Math.min(100, (100 + margin) / 2);
  return context.presidentialWinner2024 === 'R'
    ? {D:100 - winnerShare,R:winnerShare}
    : {D:winnerShare,R:100 - winnerShare};
}

function presidentialShareMarkup(context: typeof stateContexts[number]) {
  const shares = twoPartyShares(context);
  return `<div class="presidential-share" role="img" aria-label="2024年大統領選の二大政党票。民主党${shares.D.toFixed(1)}%、共和党${shares.R.toFixed(1)}%"><div class="share-labels"><span class="share-d">民主党 ${shares.D.toFixed(1)}%</span><span class="share-r">共和党 ${shares.R.toFixed(1)}%</span></div><div class="share-track"><i class="share-d" style="width:${shares.D.toFixed(1)}%"></i><i class="share-r" style="width:${shares.R.toFixed(1)}%"></i></div><small>2024年大統領選・二大候補票を100%に正規化</small></div>`;
}

function stateMetricsMarkup(context: typeof stateContexts[number], stateElections: Election[]) {
  const populationChange = `${context.populationChange2020to2025 >= 0 ? '+' : ''}${context.populationChange2020to2025.toFixed(1)}%`;
  const raceText = stateElections.length ? stateElections.map(election => `${election.type === 'special' ? '特別' : '通常'}・${election.rating.category}`).join('／') : '上院選なし';
  const soybean = context.soybeanProduction2026 === null ? '掲載なし' : `${context.soybeanProduction2026.toLocaleString('en-US')}千bu（全米${context.soybeanRank2026}位）`;
  return `<div class="state-metrics"><table><tbody><tr><th>2025年人口</th><td>${context.population2025.toLocaleString('en-US')}人</td></tr><tr><th>人口変化（2020→2025）</th><td>${populationChange}</td></tr><tr><th>民間GDP最大部門</th><td>${context.topPrivateIndustry2025}（民間GDPの${context.topPrivateIndustryShare2025.toFixed(1)}%）</td></tr><tr><th>大豆生産予測</th><td>${soybean}</td></tr><tr><th>2026年上院選</th><td>${raceText}</td></tr></tbody></table></div>`;
}

function candidateResearchMarkup(candidate: Election['candidates'][number]) {
  const note = candidateResearchNotes[candidate.name];
  if (!note || note.status === 'preparing') return '<small class="candidate-note-pending">特徴的な発言・注視する政策・忌避する政策：調査中</small>';
  const list = (label:string, values:string[]) => values.length ? `<div><b>${label}</b><ul>${values.map(value => `<li>${value}</li>`).join('')}</ul></div>` : '';
  return `<div class="candidate-research">${list('特徴的な発言',note.notableStatements)}${list('注視する政策',note.focusPolicies)}${list('忌避する政策',note.avoidPolicies)}${refs(note.sourceIds)}</div>`;
}

function raceResearchMarkup(election: Election) {
  const note = raceResearchNotes[election.seatId];
  if (election.rating.category !== 'Toss Up') return `<p class="race-relevance">${election.electionRelevance}</p>`;
  if (note?.status === 'available') return `<div class="tossup-research"><b>均衡度</b><p>${note.balance}</p><b>主な論点</b><ul>${note.keyIssues.map(issue => `<li>${issue}</li>`).join('')}</ul><p>${note.note}</p>${refs(note.sourceIds)}</div>`;
  return `<div class="tossup-research pending"><b>Toss Upの読み方</b><p>${election.electionRelevance}</p><p>票の均衡度、州内の主要論点、候補者発言の影響を分解した資料分析は調査中です。検証済みのレポートをここへ差し替えます。</p></div>`;
}

function seatCard(seat: Seat, stateElections: Election[]) {
  const specialElection = stateElections.find(election => election.seatId === seat.seatId && election.type === 'special');
  const specialText = specialElection ? `<span class="special-term">特別選挙：任期途中の欠員を補充。残任期終了は${seat.termEnd ?? '未確認'}、当選者の具体的な就任日は確定後に更新します。</span>` : '';
  return `<div class="seat"><b>${seat.incumbent ?? (seat.vacant ? '空席' : '現職氏名未確認')} · ${seat.seatId}</b><span>Class ${seat.senateClass}／党籍：${partyLabel[seat.party]}／会派：${caucusLabel[seat.caucus]}</span>${specialText}<span>空席：${seat.vacant ? 'はい' : 'いいえ'}／確認状態：${seat.verificationStatus === 'confirmed' ? `確認済み（${seat.verifiedAt}）` : '一次資料再確認待ち'}</span>${attributeRefs(seat.attributeSourceIds)}</div>`;
}
function electionCard(election: Election) {
  const seat = seatById.get(election.seatId)!;
  const contestLabel = election.contestStatus === 'general-ballot' ? '本選候補' : election.contestStatus === 'primary-pending' ? `予備選候補（${election.primaryDate}予定）` : `予備選候補（${election.primaryDate}・結果確認中）`;
  return `<div class="election-card ${election.type}"><b>${election.type === 'special' ? '★ 特別選挙' : '通常選挙'} · Class ${seat.senateClass}</b><span>投票日：${election.date}</span>${election.type === 'special' ? `<small>${election.termStartRule ?? '任期途中の欠員を州法に基づき補充します。'}</small>` : ''}<div class="rating-badge"><span>${election.rating.category}</span><small>${election.rating.organization}・${election.rating.ratedAt}</small></div>${raceResearchMarkup(election)}<div class="candidate-block"><strong>${contestLabel} ${election.candidates.length}人</strong><ul>${election.candidates.map(candidate => `<li><i class="party-dot party-${candidate.party}"></i><span><b>${candidate.name}</b><small>${candidate.partyLabel}${candidate.ballotStage === 'write-in' ? '・記名候補' : ''}</small></span>${candidateResearchMarkup(candidate)}</li>`).join('')}</ul></div><span>候補者確認：${election.candidateResearchStatus === 'complete' ? '本選掲載を確認済み' : '予備選確定待ち'}／情勢取得 ${election.rating.retrievedAt}</span>${attributeRefs(election.attributeSourceIds)}</div>`;
}
function selectState(state: State, trigger?: HTMLElement) {
  selected = state;
  if (trigger) returnFocus = trigger.id === 'state-search'
    ? {kind:'search',value:'state-search'}
    : trigger.dataset.stateFips ? {kind:'map',value:state.fips} : {kind:'search',value:'source-control',element:trigger};
  renderMap();
  const stateElections = electionByState(state); const profile = profileByFips.get(state.fips)!; const stateSeats = seats.filter(seat => seat.stateFips === state.fips);
  const ids = [...profile.politicalBase.sourceIds,...profile.industryAndIssues.sourceIds,...profile.historicalTrajectory.sourceIds,...profile.electionMeaning.sourceIds,...stateSeats.flatMap(seat => seat.sourceIds),...stateElections.flatMap(election => election.sourceIds)];
  const timeline = events.filter(event => profile.eventIds.includes(event.eventId) && !event.eventId.startsWith('population-'));
  document.querySelector('#detail')!.innerHTML = `<button class="close" aria-label="州詳細を閉じる">×</button><p class="kicker">STATE BRIEFING</p><h2>${state.nameJa}</h2><p class="en">${state.nameEn} · ${state.abbr}</p><div class="status">州解説：${profile.contentStatus} · 基準日 ${profile.asOf}</div><section class="brief"><h3>州の要約</h3>${presidentialShareMarkup(contextByFips.get(state.fips)!)}${stateMetricsMarkup(contextByFips.get(state.fips)!,stateElections)}</section><section class="forecast-brief"><h3>投票予測の理由</h3>${stateElections.length ? `<p class="forecast-summary">${profile.electionMeaning.text}</p>${stateElections.map(election => `<article><b>${election.rating.category} · ${election.rating.organization ?? '情勢評価'}</b>${raceResearchMarkup(election)}</article>`).join('')}` : '<p>2026年の上院選はありません。下院は州内の全選挙区が改選されます。</p>'}</section><details open><summary>確認できる変化</summary>${timeline.map(event => `<article class="timeline-item"><time>${event.period}</time><b>${event.title}</b><p>${event.eventText}</p>${event.localEffect ? `<small>${event.localEffect}</small>` : ''}</article>`).join('')}</details><details open><summary>現職・議席情報</summary>${stateSeats.map(seat => seatCard(seat,stateElections)).join('')}</details><details><summary>出典・情報時点</summary>${refs(ids)}</details>`;
  document.querySelector<HTMLButtonElement>('#detail .close')!.onclick = () => {
    const focusTarget = returnFocus;
    selected = null; renderMap();
    document.querySelector<HTMLSelectElement>('#state-search')!.value = '';
    document.querySelector('#detail')!.innerHTML = '<div class="empty-detail"><span>STATE BRIEFING</span><h2>州を選択してください</h2><p>地図または検索から全50州の情報へ移動できます。</p></div>';
    if (focusTarget?.element?.isConnected) focusTarget.element.focus();
    else if (focusTarget?.kind === 'search') document.querySelector<HTMLElement>('#state-search')?.focus();
    else if (focusTarget?.kind === 'map') document.querySelector<HTMLElement>(`[data-state-fips="${focusTarget.value}"]`)?.focus();
  };
  if (window.innerWidth < 800) document.querySelector('#detail')!.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}
function electionLabelForSeat(seatId: string) {
  return elections.filter(election => election.seatId === seatId).map(election => election.type === 'special' ? '特別' : '通常').join('・');
}
function renderSim() {
  const activeSeatId = (document.activeElement as HTMLElement | null)?.dataset.seat;
  const counts = simulatedCounts(seats,elections,assumptions);
  const changed = Object.entries(assumptions).filter(([id,value]) => baselineCaucus(seatById.get(id)!) !== value);
  const unresolved = counts.none + counts.unconfirmed + counts.vacant;
  document.querySelector('#sim-result')!.innerHTML = `<div class="projected"><div><strong>${counts.Democratic}</strong><span>民主党会派</span></div><div><strong>${counts.Republican}</strong><span>共和党会派</span></div><div class="majority"><b>${majorityText(counts,vicePresident)}</b><small>2027-01-03時点の仮定。副大統領は${vicePresident.name}（${partyLabel[vicePresident.party]}）が引き続き在職し、所属党側へ決裁票を投じると仮定しています。現職情報は${vicePresident.verificationStatus === 'confirmed' ? `${vicePresident.verifiedAt}確認済み` : '一次資料再確認待ち'}。${unresolved ? `／その他・未確認・空席 ${unresolved}` : ''}</small></div></div><p class="changes">変更：${changed.length ? changed.map(([id,value]) => `${id} → ${caucusLabel[value]}`).join('、') : 'なし'}</p>`;
  document.querySelector('#seat-controls')!.innerHTML = targetSeatIds.map(seatId => { const seat = seatById.get(seatId)!; const state = stateByFips.get(seat.stateFips)!; const value = assumptions[seatId] ?? baselineCaucus(seat); return `<label><span>${state.nameJa}<small>${seatId} · ${electionLabelForSeat(seatId)} · 現${partyLabel[seat.party]}</small></span><select data-seat="${seatId}"><option value="Democratic" ${value === 'Democratic' ? 'selected' : ''}>民主党会派</option><option value="Republican" ${value === 'Republican' ? 'selected' : ''}>共和党会派</option><option value="none" ${value === 'none' ? 'selected' : ''}>会派非所属</option><option value="unconfirmed" ${value === 'unconfirmed' ? 'selected' : ''}>会派未確認</option></select></label>`; }).join('');
  document.querySelectorAll<HTMLSelectElement>('[data-seat]').forEach(element => element.onchange = () => { assumptions[element.dataset.seat!] = element.value as Caucus; renderSim(); });
  if (activeSeatId) document.querySelector<HTMLElement>(`[data-seat="${activeSeatId}"]`)?.focus();
}

function renderIssueDetail() {
  const issue = issueCategories.find(item => item.issueId === activeIssueId)!;
  const relatedPowers = issue.relatedPowerIds.map(id => powerRules.find(rule => rule.powerId === id)).filter(Boolean);
  document.querySelector('#issue-detail')!.innerHTML = `<article class="issue-card"><div><p class="kicker">${issue.label}</p><h3>${issue.voterQuestion}</h3><p>${issue.scope}</p></div><dl><div><dt>大統領が動かせるもの</dt><dd>${issue.presidentialLevers}</dd></div><div><dt>議会が制約できるもの</dt><dd>${issue.congressionalChecks}</dd></div></dl><div class="issue-evidence"><b>追う指標</b><ul>${issue.indicatorLabels.map(label => `<li>${label}</li>`).join('')}</ul><b>つながる権限</b><ul>${relatedPowers.map(rule => `<li><a href="#powers">${rule!.action}</a></li>`).join('')}</ul></div>${refs(issue.sourceIds)}</article>`;
  document.querySelectorAll<HTMLButtonElement>('[data-issue]').forEach(button => {
    const active = button.dataset.issue === activeIssueId;
    button.setAttribute('aria-selected',String(active));
    button.tabIndex = active ? 0 : -1;
  });
}

const ratingOrder: Record<Rating,number> = {'Toss Up':0,'Lean D':1,'Lean R':1,'Likely D':2,'Likely R':2,'Solid D':3,'Solid R':3,unavailable:4};
function renderSoyTable() {
  const soybeanStates = topSoyContexts;
  const sorted = [...soybeanStates].sort((left,right) => {
    if (soySort === 'production') return left.soybeanRank2026! - right.soybeanRank2026!;
    if (soySort === 'margin') return (left.presidentialMargin2024 ?? 100) - (right.presidentialMargin2024 ?? 100);
    const leftRace = electionByState(stateByFips.get(left.stateFips)!)[0];
    const rightRace = electionByState(stateByFips.get(right.stateFips)!)[0];
    return (leftRace ? ratingOrder[leftRace.rating.category] : 5) - (rightRace ? ratingOrder[rightRace.rating.category] : 5) || left.soybeanRank2026! - right.soybeanRank2026!;
  });
  const maxProduction = Math.max(...soybeanStates.map(context => context.soybeanProduction2026 ?? 0));
  document.querySelector('#soy-table')!.innerHTML = `<div class="table-scroll"><table class="soy-table"><thead><tr><th>州</th><th>2026年生産予測</th><th>2024大統領選</th><th>2026上院選</th><th>政策評価を見る入口</th></tr></thead><tbody>${sorted.map(context => {
    const state = stateByFips.get(context.stateFips)!;
    const race = electionByState(state)[0];
    const winner = context.presidentialWinner2024 === 'R' ? 'Trump R' : 'Harris D';
    return `<tr><th><button type="button" data-soy-state="${state.fips}">${state.nameJa}<small>${state.abbr}・全米${context.soybeanRank2026}位</small></button></th><td><b>${context.soybeanProduction2026!.toLocaleString('en-US')}千bu</b><span class="soy-bar"><i style="width:${Math.round(context.soybeanProduction2026! / maxProduction * 100)}%"></i></span></td><td>${winner}<small>${context.presidentialMargin2024!.toFixed(1)}pt差</small></td><td>${race ? `<span class="rating-pill rating-${race.rating.category.replaceAll(' ','-')}">${race.rating.category}</span><small>${race.contestStatus === 'general-ballot' ? '本選候補確定' : '予備選確定待ち'}</small>` : '<span>上院選なし</span><small>下院は全区改選</small>'}</td><td>${race ? '関税・輸出市場・農家支援への候補者の立場を州詳細から確認' : '下院候補・農業団体の発言と、地域別価格・所得を追加確認'}</td></tr>`;
  }).join('')}</tbody></table></div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-soy-state]').forEach(button => button.onclick = () => {
    const state = stateByFips.get(button.dataset.soyState!);
    if (!state) return;
    document.querySelector<HTMLSelectElement>('#state-search')!.value = state.fips;
    selectState(state,button);
    document.querySelector('#senate')!.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
}

type HouseGeoProperties = {STATEFP:string;DIST:string;GEOID:string|number;election:string};
let houseGeoFeatures: Feature<Geometry,HouseGeoProperties>[] = [];
const houseDistrictLabel = (district: HouseDistrict) => {
  const state = stateByFips.get(district.stateFips)!;
  return `${state.nameJa} ${district.districtId.endsWith('-AL') ? '全州区' : `第${district.district}区`}`;
};
function renderHouseDistrictOptions(stateFips: string, selectedId = '') {
  const select = document.querySelector<HTMLSelectElement>('#house-district-search')!;
  const districts = houseDistricts.filter(district => district.stateFips === stateFips).sort((a,b) => a.district - b.district);
  select.disabled = !districts.length;
  select.innerHTML = districts.length ? `<option value="">選挙区を選ぶ</option>${districts.map(district => `<option value="${district.districtId}" ${district.districtId === selectedId ? 'selected' : ''}>${district.districtId.endsWith('-AL') ? '全州区' : `第${district.district}区`} · ${district.rating}</option>`).join('')}` : '<option value="">先に州を選ぶ</option>';
}
function renderHouseMap() {
  const host = document.querySelector('#house-map')!;
  host.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 975 610');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','2026年の連邦下院選挙区情勢地図。州と選挙区のセレクトでも全435区を選べます');
  const path = geoPath(geoAlbersUsa().scale(1275).translate([487.5,305]));
  for (const item of houseGeoFeatures) {
    const district = houseByCombo.get(String(item.properties.GEOID).padStart(4,'0'));
    if (!district) continue;
    const districtPath = document.createElementNS(svg.namespaceURI,'path');
    districtPath.setAttribute('d',path(item) || '');
    districtPath.setAttribute('fill',ratingColors[district.rating]);
    districtPath.setAttribute('class',selectedHouseDistrict?.districtId === district.districtId ? 'selected' : '');
    districtPath.setAttribute('data-house-district',district.districtId);
    districtPath.setAttribute('aria-label',`${houseDistrictLabel(district)}、${district.rating}`);
    districtPath.addEventListener('click',() => selectHouseDistrict(district));
    const title = document.createElementNS(svg.namespaceURI,'title');
    title.textContent = `${houseDistrictLabel(district)}・${district.rating}`;
    districtPath.append(title);
    svg.append(districtPath);
  }
  host.append(svg);
}
async function initHouseMap() {
  const topology = await fetch(`${import.meta.env.BASE_URL}data/house-2026-topo.json`).then(response => {
    if (!response.ok) throw new Error(`House map ${response.status}`);
    return response.json();
  }) as Topology;
  const collection = feature(topology,topology.objects.districts) as unknown as FeatureCollection<Geometry,HouseGeoProperties>;
  houseGeoFeatures = collection.features.filter(item => item.properties.election === '2026' && houseByCombo.has(String(item.properties.GEOID).padStart(4,'0')));
  renderHouseMap();
}
function renderHouseDetail() {
  const host = document.querySelector('#house-detail')!;
  if (!selectedHouseDistrict) {
    host.innerHTML = '<p class="kicker">DISTRICT BRIEFING</p><h3>選挙区を選択</h3><p>地図またはセレクトから情勢と仮定を確認できます。</p>';
    return;
  }
  const district = selectedHouseDistrict;
  const outcome = houseAssumptions[district.districtId] ?? houseRatingOutcome(district);
  const referenceParty = district.currentParty === 'unknown' ? '未設定' : partyLabel[district.currentParty];
  host.innerHTML = `<p class="kicker">DISTRICT BRIEFING</p><h3>${houseDistrictLabel(district)}</h3><div class="rating-badge"><span>${district.rating}</span><small>合意情勢・2026-08-31</small></div><dl><div><dt>評価表の参照現職</dt><dd>${district.incumbent ?? '未設定（新設区・空席等を含む）'}</dd></div><div><dt>参照党派</dt><dd>${referenceParty}</dd></div></dl><label class="district-assumption">この区の仮定<select data-house-detail-assumption><option value="Democratic" ${outcome === 'Democratic' ? 'selected' : ''}>民主党</option><option value="Republican" ${outcome === 'Republican' ? 'selected' : ''}>共和党</option><option value="unconfirmed" ${outcome === 'unconfirmed' ? 'selected' : ''}>未確定</option></select></label><p class="missing">現職欄は情勢表の参照ラベルです。公式の現議会総数とは時点・区割りが異なるため、現在の議席構成には使いません。</p>${refs(district.sourceIds)}`;
  document.querySelector<HTMLSelectElement>('[data-house-detail-assumption]')!.onchange = event => {
    houseAssumptions[district.districtId] = (event.target as HTMLSelectElement).value as HouseAssumptions[string];
    renderHouseSim();
    renderHouseDetail();
  };
}
function selectHouseDistrict(district: HouseDistrict) {
  selectedHouseDistrict = district;
  document.querySelector<HTMLSelectElement>('#house-state-search')!.value = district.stateFips;
  renderHouseDistrictOptions(district.stateFips,district.districtId);
  renderHouseMap();
  renderHouseDetail();
  if (window.innerWidth < 800) document.querySelector('#house-detail')!.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}
function renderHouseSim() {
  const activeDistrictId = (document.activeElement as HTMLElement | null)?.dataset.houseSeat;
  const counts = simulatedHouseCounts(houseDistricts,houseAssumptions);
  const adjustable = houseDistricts.filter(district => !district.rating.startsWith('Solid'));
  const changes = Object.entries(houseAssumptions).filter(([districtId,outcome]) => houseRatingOutcome(houseDistricts.find(district => district.districtId === districtId)!) !== outcome);
  document.querySelector('#house-sim-result')!.innerHTML = `<div class="projected house-projected"><div><strong>${counts.Democratic}</strong><span>民主党</span></div><div><strong>${counts.Republican}</strong><span>共和党</span></div><div><strong>${counts.unconfirmed}</strong><span>未確定</span></div><div class="majority"><b>${houseMajorityText(counts)}</b><small>情勢分類を議席結果へ機械的に置き換えた仮定です。勝率ではありません。</small></div></div><p class="changes">初期分類から変更：${changes.length ? changes.map(([id,value]) => `${id} → ${value === 'Democratic' ? '民主党' : value === 'Republican' ? '共和党' : '未確定'}`).join('、') : 'なし'}</p>`;
  document.querySelector('#house-controls')!.innerHTML = adjustable.map(district => {
    const value = houseAssumptions[district.districtId] ?? houseRatingOutcome(district);
    return `<label><span>${houseDistrictLabel(district)}<small>${district.rating}</small></span><select data-house-seat="${district.districtId}"><option value="Democratic" ${value === 'Democratic' ? 'selected' : ''}>民主党</option><option value="Republican" ${value === 'Republican' ? 'selected' : ''}>共和党</option><option value="unconfirmed" ${value === 'unconfirmed' ? 'selected' : ''}>未確定</option></select></label>`;
  }).join('');
  document.querySelectorAll<HTMLSelectElement>('[data-house-seat]').forEach(element => element.onchange = () => {
    houseAssumptions[element.dataset.houseSeat!] = element.value as HouseAssumptions[string];
    renderHouseSim();
    if (selectedHouseDistrict?.districtId === element.dataset.houseSeat) renderHouseDetail();
  });
  if (activeDistrictId) document.querySelector<HTMLElement>(`[data-house-seat="${activeDistrictId}"]`)?.focus();
}

enhanceLayout();
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.onclick = () => {
  const next = button.dataset.mode as 'current'|'rating';
  setSimulatorMode(next);
});
document.querySelectorAll<HTMLButtonElement>('[data-sim-mode]').forEach(button => button.onclick = () => {
  const next = button.dataset.simMode as SimulatorMode;
  setSimulatorMode(next);
});
document.querySelectorAll<HTMLButtonElement>('[data-power-target]').forEach(button => button.onclick = () => {
  targetActionId = button.dataset.powerTarget ?? targetActionId;
  setSimulatorMode('target');
  document.querySelector('#simulator')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
});
document.querySelector<HTMLInputElement>('#competitive')!.onchange = event => {
  competitive = (event.target as HTMLInputElement).checked;
  renderMap();
};
document.querySelector<HTMLSelectElement>('#state-search')!.onchange = event => {
  const state = stateByFips.get((event.target as HTMLSelectElement).value);
  if (state) selectState(state,event.target as HTMLElement);
};
document.querySelector<HTMLButtonElement>('#reset')!.onclick = () => {
  assumptions = {};
  renderSim();
};
document.querySelector<HTMLSelectElement>('#house-state-search')!.onchange = event => {
  selectedHouseDistrict = null;
  renderHouseDistrictOptions((event.target as HTMLSelectElement).value);
  renderHouseMap();
  renderHouseDetail();
};
document.querySelector<HTMLSelectElement>('#house-district-search')!.onchange = event => {
  const district = houseDistricts.find(item => item.districtId === (event.target as HTMLSelectElement).value);
  if (district) selectHouseDistrict(district);
};
document.querySelector<HTMLButtonElement>('#house-reset')!.onclick = () => {
  houseAssumptions = {};
  renderHouseSim();
  renderHouseDetail();
};
document.querySelector<HTMLButtonElement>('#reload-app')!.onclick = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('refresh',Date.now().toString());
  window.location.replace(url.toString());
};
renderCounts();
renderNewsList();
renderSim();
renderHouseSim();
setSimulatorMode('rating');
initMap().catch(() => { document.querySelector('#map')!.innerHTML = '<p class="error">同梱された州境データを読み込めませんでした。ローカル開発サーバーまたはプレビューで開いてください。</p>'; });
initHouseMap().catch(() => { document.querySelector('#house-map')!.innerHTML = '<p class="error">同梱された下院選挙区データを読み込めませんでした。</p>'; });
