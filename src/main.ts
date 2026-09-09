import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';
import './style.css';
import { APP_VERSION,DATA_AS_OF,elections,events,profiles,seats,sources,states,vicePresident } from './data/data';
import type { Caucus, Election, Rating, Seat, State } from './data/model';
import { baselineCaucus,currentCaucusCounts,majorityText,simulatedCounts,uniqueElectionSeatIds,type Assumptions } from './logic';

type Mode = 'holder'|'rating';
let mode: Mode = 'holder';
let competitive = false;
let selected: State|null = null;
let assumptions: Assumptions = {};
let returnFocus: HTMLElement|null = null;
const stateByFips = new Map(states.map(state => [state.fips,state]));
const seatById = new Map(seats.map(seat => [seat.seatId,seat]));
const profileByFips = new Map(profiles.map(profile => [profile.stateFips,profile]));
const sourceById = new Map(sources.map(source => [source.sourceId,source]));
const electionByState = (state: State) => elections.filter(election => seatById.get(election.seatId)?.stateFips === state.fips);
const targetSeatIds = uniqueElectionSeatIds(elections);
const regularCount = elections.filter(election => election.type === 'regular').length;
const specialCount = elections.filter(election => election.type === 'special').length;
const confirmedSeatCount = seats.filter(seat => seat.verificationStatus === 'confirmed' && seat.verifiedAt).length;
const confirmedElectionCount = elections.filter(election => election.verificationStatus === 'confirmed' && election.verifiedAt).length;
const baselineComplete = confirmedSeatCount === seats.length && confirmedElectionCount === elections.length;
const hasRatings = elections.some(election => election.rating.category !== 'unavailable');
const partyLabel = {D:'民主党',R:'共和党',I:'無所属',other:'その他',vacant:'空席',unknown:'未確認'};
const caucusLabel: Record<Caucus,string> = {Democratic:'民主党会派',Republican:'共和党会派',none:'会派非所属',unconfirmed:'会派未確認',vacant:'空席'};
const ratingColors: Record<Rating,string> = {'Solid D':'#174f9e','Likely D':'#4d80bd','Lean D':'#93b7dc','Toss Up':'#8a8178','Lean R':'#e59a9a','Likely R':'#cf5a5a','Solid R':'#a5262e',unavailable:'#d9d8d4'};

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header class="mast">
  <div class="eyebrow">2026 UNITED STATES SENATE</div><h1>上院の行方</h1>
  <p class="dek">改選議席の現在地から、州の背景、多数派への道まで。予測ではなく、確認済みデータと未確認項目を分けて示します。</p>
  <div class="dateline"><span>データ基準日 ${DATA_AS_OF}</span><span>通常 ${regularCount}件</span><span>特別 ${specialCount}件</span><span>対象 ${targetSeatIds.length}議席</span><span>版 ${APP_VERSION}</span><button id="reload-app" class="reload-app" type="button">最新版を再読み込み</button></div>
</header>
<main>
  <div class="data-caution ${baselineComplete ? 'verified' : ''}" role="note"><strong>${baselineComplete ? '議席の基礎情報を一次資料で確認済み' : '基礎情報に未確認項目があります'}</strong><span>現職・党籍・会派・空席・議席任期：${confirmedSeatCount}/${seats.length}議席。選挙区分・日程・任期の規定：${confirmedElectionCount}/${elections.length}選挙。確認日と出典は州詳細で確認できます。候補者・情勢評価・州解説は準備中です。</span></div>
  <section class="summary" aria-labelledby="current-heading"><div><p class="kicker">現在の会派構成</p><h2 id="current-heading">100議席の内訳</h2></div><div id="current-counts" class="counts"></div></section>
  <section class="workspace">
    <div class="map-column">
      <div class="controls" aria-label="地図表示設定"><div class="segmented"><button data-mode="holder" class="active">現保有党</button><button data-mode="rating">選挙情勢</button></div><label class="switch"><input id="competitive" type="checkbox" ${hasRatings?'':'disabled'}><span>激戦のみ強調</span></label></div>
      ${hasRatings?'':'<p class="control-note" id="competitive-note">情勢評価が全件未取得のため、激戦強調は利用できません。</p>'}
      <div class="search-wrap"><label for="state-search">州を検索・選択</label><select id="state-search"><option value="">50州から選ぶ</option>${states.map(state => `<option value="${state.fips}">${state.nameJa} / ${state.nameEn} (${state.abbr})</option>`).join('')}</select></div>
      <div class="map-head"><div><p class="kicker">INTERACTIVE MAP</p><h2 id="map-heading">2026年の選挙対象州</h2></div><p id="mode-note">色は対象議席の現保有党。州全体の支持傾向や勝敗予測ではありません。</p></div>
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
  <section class="method"><p class="kicker">READING THE DATA</p><h2>表示の読み方</h2><div class="method-grid"><article><b>保有党と情勢は別</b><p>初期表示は現保有党、情勢表示は評価機関の分類です。未取得を安全・接戦に置き換えません。</p></article><article><b>通常と特別を区別</b><p>通常選挙と残任期を補う特別選挙を別レコードで管理し、対象議席は一意に集計します。</p></article><article><b>シミュレーションは仮定</b><p>非改選65議席と対象35議席の仮定を合算します。単純多数決の目安で、政策の成立を予測するものではありません。</p></article></div></section>
</main><footer>制作データは静的に同梱。確認済みの範囲・確認日・出典は各州詳細に表示します。</footer>`;

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
  return `<div class="election-card ${election.type}"><b>${election.type === 'special' ? '★ 特別選挙' : '通常選挙'} · Class ${seat.senateClass}</b><span>投票日：${election.date}</span><span>対象任期：${election.termStartLabel}〜${election.termEnd}</span>${election.termStartRule ? `<small>${election.termStartRule}</small>` : ''}<span>選挙の基礎情報：${election.verificationStatus === 'confirmed' ? `確認済み（${election.verifiedAt}）` : '一次資料再確認待ち'}</span><span>候補者：${election.candidateResearchStatus === 'not-started' ? '調査未着手' : '調査中'}</span><span>情勢評価：${election.rating.category === 'unavailable' ? '未取得' : election.rating.category}</span>${attributeRefs(election.attributeSourceIds)}</div>`;
}
function selectState(state: State, trigger?: HTMLElement) {
  selected = state; if (trigger) returnFocus = trigger; renderMap();
  const stateElections = electionByState(state); const profile = profileByFips.get(state.fips)!; const stateSeats = seats.filter(seat => seat.stateFips === state.fips);
  const ids = [...profile.politicalBase.sourceIds,...profile.industryAndIssues.sourceIds,...profile.historicalTrajectory.sourceIds,...profile.electionMeaning.sourceIds,...stateSeats.flatMap(seat => seat.sourceIds),...stateElections.flatMap(election => election.sourceIds)];
  const timeline = events.filter(event => profile.eventIds.includes(event.eventId));
  document.querySelector('#detail')!.innerHTML = `<button class="close" aria-label="州詳細を閉じる">×</button><p class="kicker">STATE BRIEFING</p><h2>${state.nameJa}</h2><p class="en">${state.nameEn} · ${state.abbr}</p><div class="status pending">州解説：${profile.contentStatus} · 基準日 ${profile.asOf}</div><div class="race-summary">${stateElections.length ? stateElections.map(electionCard).join('') : '<strong>2026年の対象選挙なし</strong>'}</div><section class="brief"><h3>州の要約</h3><p>${profile.politicalBase.text}</p><p>${profile.industryAndIssues.text}</p><p>${profile.historicalTrajectory.text}</p><p>${profile.electionMeaning.text}</p></section><details open><summary>これまでの主な変化</summary>${timeline.length ? timeline.map(event => `<article><time>${event.period}</time><b>${event.title}</b><p>${event.eventText}</p></article>`).join('') : '<p class="missing">確認済み年表は0件です。州固有の出来事と政治的変化の照合が未完了であるため、件数を埋めていません。</p>'}</details><details open><summary>現職・議席情報</summary><p class="missing">議席の6年任期を表示しています。途中就任した現職本人の在職開始日とは異なります。</p>${stateSeats.map(seatCard).join('')}</details><details><summary>出典・情報時点</summary>${refs(ids)}</details>`;
  document.querySelector<HTMLButtonElement>('.close')!.onclick = () => { selected = null; renderMap(); document.querySelector('#detail')!.innerHTML = '<div class="empty-detail"><span>STATE BRIEFING</span><h2>州を選択してください</h2><p>地図または検索から全50州の情報へ移動できます。</p></div>'; returnFocus?.focus(); };
  if (window.innerWidth < 800) document.querySelector('#detail')!.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}
function electionLabelForSeat(seatId: string) {
  return elections.filter(election => election.seatId === seatId).map(election => election.type === 'special' ? '特別' : '通常').join('・');
}
function renderSim() {
  const counts = simulatedCounts(seats,elections,assumptions);
  const changed = Object.entries(assumptions).filter(([id,value]) => baselineCaucus(seatById.get(id)!) !== value);
  const unresolved = counts.none + counts.unconfirmed + counts.vacant;
  document.querySelector('#sim-result')!.innerHTML = `<div class="projected"><div><strong>${counts.Democratic}</strong><span>民主党会派</span></div><div><strong>${counts.Republican}</strong><span>共和党会派</span></div><div class="majority"><b>${majorityText(counts,vicePresident)}</b><small>2027-01-03時点の仮定。副大統領は${vicePresident.name}（${partyLabel[vicePresident.party]}）が引き続き在職し、所属党側へ決裁票を投じると仮定しています。現職情報は${vicePresident.verificationStatus === 'confirmed' ? `${vicePresident.verifiedAt}確認済み` : '一次資料再確認待ち'}。${unresolved ? `／その他・未確認・空席 ${unresolved}` : ''}</small></div></div><p class="changes">変更：${changed.length ? changed.map(([id,value]) => `${id} → ${caucusLabel[value]}`).join('、') : 'なし'}</p>`;
  document.querySelector('#seat-controls')!.innerHTML = targetSeatIds.map(seatId => { const seat = seatById.get(seatId)!; const state = stateByFips.get(seat.stateFips)!; const value = assumptions[seatId] ?? baselineCaucus(seat); return `<label><span>${state.nameJa}<small>${seatId} · ${electionLabelForSeat(seatId)} · 現${partyLabel[seat.party]}</small></span><select data-seat="${seatId}"><option value="Democratic" ${value === 'Democratic' ? 'selected' : ''}>民主党会派</option><option value="Republican" ${value === 'Republican' ? 'selected' : ''}>共和党会派</option><option value="none" ${value === 'none' ? 'selected' : ''}>会派非所属</option><option value="unconfirmed" ${value === 'unconfirmed' ? 'selected' : ''}>会派未確認</option></select></label>`; }).join('');
  document.querySelectorAll<HTMLSelectElement>('[data-seat]').forEach(element => element.onchange = () => { assumptions[element.dataset.seat!] = element.value as Caucus; renderSim(); });
}

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.onclick = () => { mode = button.dataset.mode as Mode; document.querySelectorAll('[data-mode]').forEach(item => item.classList.toggle('active',item === button)); document.querySelector('#mode-note')!.textContent = mode === 'holder' ? '色は対象議席の現保有党。州全体の支持傾向や勝敗予測ではありません。' : '色は統一評価機関の分類。現時点では評価未取得を明示しています。'; renderMap(); });
document.querySelector<HTMLInputElement>('#competitive')!.onchange = event => { competitive = (event.target as HTMLInputElement).checked; renderMap(); };
document.querySelector<HTMLSelectElement>('#state-search')!.onchange = event => { const state = stateByFips.get((event.target as HTMLSelectElement).value); if (state) selectState(state,event.target as HTMLElement); };
document.querySelector<HTMLButtonElement>('#reset')!.onclick = () => { assumptions = {}; renderSim(); };
document.querySelector<HTMLButtonElement>('#reload-app')!.onclick = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('refresh',Date.now().toString());
  window.location.replace(url.toString());
};
renderCounts(); renderSim(); initMap().catch(() => { document.querySelector('#map')!.innerHTML = '<p class="error">同梱された州境データを読み込めませんでした。ローカル開発サーバーまたはプレビューで開いてください。</p>'; });
