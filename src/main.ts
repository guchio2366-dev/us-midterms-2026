import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';
import './style.css';
import { APP_VERSION,DATA_AS_OF,elections,events,profiles,seats,sources,states,vicePresident } from './data/data';
import { issueCategories,powerRules } from './data/civics';
import { houseDistricts,houseSnapshot } from './data/house';
import { soybeanTrade,stateContexts } from './data/state-context';
import type { Caucus, Election, HouseDistrict, Rating, Seat, State } from './data/model';
import { baselineCaucus,currentCaucusCounts,houseMajorityText,houseRatingOutcome,majorityText,simulatedCounts,simulatedHouseCounts,uniqueElectionSeatIds,type Assumptions,type HouseAssumptions } from './logic';

type Mode = 'holder'|'rating';
let mode: Mode = 'holder';
let competitive = false;
let selected: State|null = null;
let assumptions: Assumptions = {};
let returnFocus: {kind:'map'|'search';value:string;element?:HTMLElement}|null = null;
let selectedHouseDistrict: HouseDistrict|null = null;
let houseAssumptions: HouseAssumptions = {};
let activeIssueId = 'trade-industry';
let soySort: 'production'|'competitive'|'margin' = 'production';
const stateByFips = new Map(states.map(state => [state.fips,state]));
const seatById = new Map(seats.map(seat => [seat.seatId,seat]));
const profileByFips = new Map(profiles.map(profile => [profile.stateFips,profile]));
const contextByFips = new Map(stateContexts.map(context => [context.stateFips,context]));
const sourceById = new Map(sources.map(source => [source.sourceId,source]));
const houseByCombo = new Map(houseDistricts.map(district => [`${district.stateFips}${district.districtId.endsWith('-AL') ? '00' : String(district.district).padStart(2,'0')}`,district]));
const electionByState = (state: State) => elections.filter(election => seatById.get(election.seatId)?.stateFips === state.fips);
const targetSeatIds = uniqueElectionSeatIds(elections);
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
    <div class="section-heading"><div><p class="kicker">THE CONTROL MAP</p><h2 id="overview-heading">何議席が動き、何が変わるか</h2></div><p>議席の多数派と、個別の権限に必要な票数は別です。</p></div>
    <div class="fact-grid">
      <article><span>上院の可変部分</span><strong>35</strong><p>通常33＋特別2。全100議席のうち65議席は今回の選挙では動きません。</p></article>
      <article><span>下院の可変部分</span><strong>435</strong><p>全議席が2年ごとに改選。通常の全員在席時、多数派は218です。</p></article>
      <article><span>上院の運営多数派</span><strong>51</strong><p>50対50なら副大統領の決裁票。通常法案の討論終結は原則60です。</p></article>
      <article><span>拒否権を覆す目安</span><strong>290＋67</strong><p>全員出席なら下院290、上院67。両院それぞれ3分の2が必要です。</p></article>
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
      <div class="controls" aria-label="地図表示設定"><div class="segmented"><button data-mode="holder" class="active">現保有党</button><button data-mode="rating">選挙情勢</button></div><label class="switch"><input id="competitive" type="checkbox" ${hasRatings?'':'disabled'}><span>激戦のみ強調</span></label></div>
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

function holderFor(state: State) {
  const stateElections = electionByState(state);
  if (!stateElections.length) return 'none';
  const parties = [...new Set(stateElections.map(election => { const seat = seatById.get(election.seatId)!; return seat.verificationStatus === 'confirmed' && seat.verifiedAt ? seat.party : 'unknown'; }))];
  return parties.length === 1 ? parties[0] : 'mixed';
}
function ratingFor(state: State): Rating|'none'|'mixed' {
  const stateElections = electionByState(state);
  if (!stateElections.length) return 'none';
  const ratings = [...new Set(stateElections.map(election => election.rating.category))];
  return ratings.length === 1 ? ratings[0] : 'mixed';
}
function isCompetitive(state: State) { return electionByState(state).some(election => ['Toss Up','Lean D','Lean R'].includes(election.rating.category)); }
function fill(state: State) {
  if (mode === 'holder') return ({D:'#2166ac',R:'#b52b35',I:'#7b5b97',other:'#736a62',vacant:'#f2c14e',unknown:'#b8b7b3',none:'#ececea',mixed:'#725f4c'} as Record<string,string>)[holderFor(state)];
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
    statePath.setAttribute('class',`${selected?.fips === fips ? 'selected ' : ''}${competitive && !isCompetitive(state) ? 'muted' : ''}`);
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
  host.append(svg); renderLegend();
}
function renderLegend() {
  const items = mode === 'holder'
    ? [['#2166ac','民主党保有'],['#b52b35','共和党保有'],['#7b5b97','無所属'],['#ececea','選挙なし'],['#b8b7b3','未確認'],['transparent','★ 特別選挙']]
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
function seatCard(seat: Seat) {
  return `<div class="seat"><b>${seat.incumbent ?? (seat.vacant ? '空席' : '現職氏名未確認')} · ${seat.seatId}</b><span>Class ${seat.senateClass}／党籍：${partyLabel[seat.party]}／会派：${caucusLabel[seat.caucus]}</span><span>議席の6年任期：${seat.termStart ?? '開始日未確認'}〜${seat.termEnd ?? '終了日未確認'}</span><span>空席：${seat.vacant ? 'はい' : 'いいえ'}／確認状態：${seat.verificationStatus === 'confirmed' ? `確認済み（${seat.verifiedAt}）` : '一次資料再確認待ち'}</span>${attributeRefs(seat.attributeSourceIds)}</div>`;
}
function electionCard(election: Election) {
  const seat = seatById.get(election.seatId)!;
  const contestLabel = election.contestStatus === 'general-ballot' ? '本選候補' : election.contestStatus === 'primary-pending' ? `予備選候補（${election.primaryDate}予定）` : `予備選候補（${election.primaryDate}・結果確認中）`;
  return `<div class="election-card ${election.type}"><b>${election.type === 'special' ? '★ 特別選挙' : '通常選挙'} · Class ${seat.senateClass}</b><span>投票日：${election.date}</span><span>対象任期：${election.termStartLabel}〜${election.termEnd}</span>${election.termStartRule ? `<small>${election.termStartRule}</small>` : ''}<div class="rating-badge"><span>${election.rating.category}</span><small>${election.rating.organization}・${election.rating.ratedAt}</small></div><p class="race-relevance">${election.electionRelevance}</p><div class="candidate-block"><strong>${contestLabel} ${election.candidates.length}人</strong><ul>${election.candidates.map(candidate => `<li><i class="party-dot party-${candidate.party}"></i><span><b>${candidate.name}</b><small>${candidate.partyLabel}${candidate.ballotStage === 'write-in' ? '・記名候補' : ''}</small></span></li>`).join('')}</ul></div><span>候補者確認：${election.candidateResearchStatus === 'complete' ? '本選掲載を確認済み' : '予備選確定待ち'}／情勢取得 ${election.rating.retrievedAt}</span>${attributeRefs(election.attributeSourceIds)}</div>`;
}
function selectState(state: State, trigger?: HTMLElement) {
  selected = state;
  if (trigger) returnFocus = trigger.id === 'state-search'
    ? {kind:'search',value:'state-search'}
    : trigger.dataset.stateFips ? {kind:'map',value:state.fips} : {kind:'search',value:'source-control',element:trigger};
  renderMap();
  const stateElections = electionByState(state); const profile = profileByFips.get(state.fips)!; const stateSeats = seats.filter(seat => seat.stateFips === state.fips);
  const ids = [...profile.politicalBase.sourceIds,...profile.industryAndIssues.sourceIds,...profile.historicalTrajectory.sourceIds,...profile.electionMeaning.sourceIds,...stateSeats.flatMap(seat => seat.sourceIds),...stateElections.flatMap(election => election.sourceIds)];
  const timeline = events.filter(event => profile.eventIds.includes(event.eventId));
  document.querySelector('#detail')!.innerHTML = `<button class="close" aria-label="州詳細を閉じる">×</button><p class="kicker">STATE BRIEFING</p><h2>${state.nameJa}</h2><p class="en">${state.nameEn} · ${state.abbr}</p><div class="status">州解説：${profile.contentStatus} · 基準日 ${profile.asOf}</div><div class="race-summary">${stateElections.length ? stateElections.map(electionCard).join('') : '<strong>2026年の上院選挙なし（下院は全区改選）</strong>'}</div><section class="brief"><h3>州の要約</h3><p>${profile.politicalBase.text}</p><p>${profile.industryAndIssues.text}</p><p>${profile.historicalTrajectory.text}</p><p>${profile.electionMeaning.text}</p></section><details open><summary>確認できる変化</summary>${timeline.map(event => `<article class="timeline-item"><time>${event.period}</time><b>${event.title}</b><p>${event.eventText}</p>${event.localEffect ? `<small>${event.localEffect}</small>` : ''}<em>${event.causalInterpretation.text}</em></article>`).join('')}</details><details open><summary>現職・議席情報</summary><p class="missing">議席の6年任期を表示しています。途中就任した現職本人の在職開始日とは異なります。</p>${stateSeats.map(seatCard).join('')}</details><details><summary>出典・情報時点</summary>${refs(ids)}</details>`;
  document.querySelector<HTMLButtonElement>('.close')!.onclick = () => {
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

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.onclick = () => { mode = button.dataset.mode as Mode; document.querySelectorAll('[data-mode]').forEach(item => item.classList.toggle('active',item === button)); document.querySelector('#mode-note')!.textContent = mode === 'holder' ? '色は対象議席の現保有党。州全体の支持傾向や勝敗予測ではありません。' : "色はSabato's Crystal Ballの2026年8月26日評価です。勝率や確定結果ではありません。"; renderMap(); });
document.querySelector<HTMLInputElement>('#competitive')!.onchange = event => { competitive = (event.target as HTMLInputElement).checked; renderMap(); };
document.querySelector<HTMLSelectElement>('#state-search')!.onchange = event => { const state = stateByFips.get((event.target as HTMLSelectElement).value); if (state) selectState(state,event.target as HTMLElement); };
document.querySelector<HTMLButtonElement>('#reset')!.onclick = () => { assumptions = {}; renderSim(); };
document.querySelectorAll<HTMLButtonElement>('[data-issue]').forEach((button,index,buttons) => {
  button.onclick = () => { activeIssueId = button.dataset.issue!; renderIssueDetail(); };
  button.onkeydown = event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[nextIndex].click(); buttons[nextIndex].focus();
  };
});
document.querySelector<HTMLSelectElement>('#soy-sort')!.onchange = event => { soySort = (event.target as HTMLSelectElement).value as typeof soySort; renderSoyTable(); };
document.querySelector<HTMLSelectElement>('#house-state-search')!.onchange = event => {
  selectedHouseDistrict = null;
  renderHouseDistrictOptions((event.target as HTMLSelectElement).value);
  renderHouseMap(); renderHouseDetail();
};
document.querySelector<HTMLSelectElement>('#house-district-search')!.onchange = event => {
  const district = houseDistricts.find(item => item.districtId === (event.target as HTMLSelectElement).value);
  if (district) selectHouseDistrict(district);
};
document.querySelector<HTMLButtonElement>('#house-reset')!.onclick = () => { houseAssumptions = {}; renderHouseSim(); renderHouseDetail(); };
document.querySelector<HTMLButtonElement>('#reload-app')!.onclick = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('refresh',Date.now().toString());
  window.location.replace(url.toString());
};
renderCounts(); renderSim(); renderIssueDetail(); renderSoyTable(); renderHouseSim();
initMap().catch(() => { document.querySelector('#map')!.innerHTML = '<p class="error">同梱された州境データを読み込めませんでした。ローカル開発サーバーまたはプレビューで開いてください。</p>'; });
initHouseMap().catch(() => { document.querySelector('#house-map')!.innerHTML = '<p class="error">同梱された下院選挙区データを読み込めませんでした。</p>'; });
