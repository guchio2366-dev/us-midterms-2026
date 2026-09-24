import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';
import './style.css';
import './ui/observation.css';
import './ui/overview.css';
import './ui/briefing.css';
import { briefingElections, locatorMapMarkup } from './ui/briefing';
import { briefingPollsMarkup } from './ui/briefing-polls';
import { texasPollContextMarkup } from './ui/texas-poll-context';
import { introductionMarkup, nationalOverviewMarkup, ratingCategoryLabel } from './ui/overview';
import { APP_VERSION,DATA_AS_OF,elections,events,profiles,seats,sources,states,vicePresident } from './data/data';
import { issueCategories,powerRules } from './data/civics';
import { powerTargets } from './data/power-targets';
import { introductionContent,introductionDetails } from './data/content';
import { houseDistricts,houseSnapshot } from './data/house';
import { newsItems } from './data/news';
import { candidateBriefs,historicalResults,issueReports,polls,raceBriefs,ratingObservations,rollCalls } from './data/research';
import { soybeanTrade,stateContexts } from './data/state-context';
import type { Caucus, Election, HouseDistrict, Rating, Seat, State } from './data/model';
import { baselineCaucus,currentCaucusCounts,houseMajorityText,houseRatingOutcome,majorityText,simulatedHouseCounts,uniqueElectionSeatIds,type HouseAssumptions } from './logic';
import { getCandidateBrief,getFeaturedCandidates,getPublishedNews,getPublishedNewsById,getPublishedNewsForElection,getPublishedNewsForIssue,getPublishedPolls,getRaceBrief,getRatingComparisons,isPublic,twoPartyResultShares } from './research-logic';
import { candidateBriefMarkup,escapeHtml,issueReportMarkup,pollsMarkup,raceBriefMarkup,ratingsMarkup,rollCallMarkup } from './ui/research';
import { cloneScenario, cloneSenateBaseline, countScenarioSenate, createScenarioState, houseAssumptionsFromScenario, scenarioChoiceLabel, scenarioOutcomeForSeat, touchScenario, type SavedScenario, type ScenarioState, type SenateOutcome, type SenateOutcomeCounts } from './scenario/model';
import { createSavedScenario, decodeScenario, encodeScenario, loadDraft, loadSavedScenarios, persistSavedScenarios, saveDraft, SAVED_SCENARIO_LIMIT } from './scenario/storage';
import { generateSenatePaths, type SenatePath } from './scenario/paths';
import { createLegacySenateBaseline, createRatingSenateBaseline } from './scenario/baseline';
import { seatBarMarkup, type SeatBarSegment } from './ui/seat-bars';
import { senateBreakdown, senateCompositionSegments, senateMajorityPath } from './ui/senate-bars';
import { bindDisclosurePreference, setupPageNavigation } from './ui/navigation';
import { RATING_METHOD_VERSION,RATING_SNAPSHOT_AS_OF,RATING_SNAPSHOT_ID,ratingSnapshotObservations } from './data/rating-snapshot';
import { aggregateRatingConsensus,consensusDisplayRating,ratingConsensusCounts,type RatingConsensusCategory } from './rating-consensus';
import { observationData, observationFor } from './data/observation';
import { eventInstant, eventStatus, monitoringStatus } from './observation-logic';
import { observationAnchor, observationBriefingParts, observationLeadMarkup, observationCandidateIntroMarkup, observationDecisionMarkup, observationComparisonMarkup, observationUpdatesMarkup, monitoringMarkup, bindObservationJumps, jumpToObservation } from './ui/observation';
import { buildRecentFeed, buildUpcomingFeed, feedItemByKey, filterFeed, legacyObservationFeedKey, linkedUpdatesForNews, resolveFeedKey, type NewsFeedItem, type NewsFeedKey, type NewsFeedTab } from './news-feed';

type Mode = 'current'|'rating';
let mode: Mode = 'rating';
let targetPanelOpen = false;
let competitive = false;
let selected: State|null = null;
let scenarioState: ScenarioState;
let previousScenarioState: ScenarioState|null = null;
let assumptions: Record<string,SenateOutcome> = {};
let returnFocus: {kind:'map'|'search';value:string;element?:HTMLElement}|null = null;
let selectedHouseDistrict: HouseDistrict|null = null;
let houseAssumptions: HouseAssumptions = {};
let compareStateFips: string[] = [];
let savedScenarios: SavedScenario[] = [];
let comparedScenarioIds: string[] = [];
let scenarioNotices: string[] = [];
let scenarioSaveTimer: number|null = null;
let scenarioStorageFailed = false;
let openedFromShare = false;
let sharedScenarioPending = false;
let activeIssueId = 'trade-industry';
let soySort: 'production'|'competitive'|'margin' = 'production';
let newsTab: NewsFeedTab = 'recent';
let newsRaceFilter: string|null = null;
let activeFocusElectionId: string|null = null;
let geoFeatures: Feature<Geometry>[] = [];
let scenarioLastChange = 'まだ議席の変更はありません。';
const newsPages: Record<NewsFeedTab,number> = {recent:0,upcoming:0};
const newsScrollTops: Record<NewsFeedTab,number> = {recent:0,upcoming:0};
let targetActionId = 'ordinary-pass';
let targetParty: 'Democratic'|'Republican' = 'Republican';
let targetPreviewPathId: string|null = null;
type OverlayKind = 'issues'|'news'|'civics';
let overlayKind: OverlayKind|null = null;
let overlayNewsId: string|null = null;
let overlayReturnFocus: HTMLElement|null = null;
let overlayReturnScrollY = 0;
let overlayHistory: {kind:OverlayKind;newsId:string|null;scrollTop:number}[] = [];
type NewsReturnState = {feedKey:NewsFeedKey;articleScrollTop:number;tab:NewsFeedTab;raceFilter:string|null;newsPage:number;listScrollTop:number};
let stateReturnNews: NewsReturnState|null = null;
let overlayOriginNewsId: string|null = null;
let issuesSection: HTMLElement|null = null;
const NEWS_PAGE_SIZE = 10;
const POWER_DISCLOSURE_KEY = 'us-midterms-2026:power-disclosure:v1';
const stateByFips = new Map(states.map(state => [state.fips,state]));
const seatById = new Map(seats.map(seat => [seat.seatId,seat]));
const profileByFips = new Map(profiles.map(profile => [profile.stateFips,profile]));
const contextByFips = new Map(stateContexts.map(context => [context.stateFips,context]));
const presidentialResultByFips = new Map(historicalResults.filter(result => result.status === 'published' && result.office === 'president').map(result => [result.stateFips,result]));
const sourceById = new Map(sources.map(source => [source.sourceId,source]));
const candidateById = new Map(elections.flatMap(election => election.candidates).map(candidate => [candidate.candidateId,candidate]));
const publishedNewsItems = getPublishedNews(newsItems);
const recentNewsFeed = buildRecentFeed(newsItems,observationData);
const latestContentDate = ['2026-09-13',...issueReports.filter(item=>item.status==='published').map(item=>item.updatedAt),...observationData.races.filter(item=>item.status==='published').map(item=>item.updatedAt)].sort().at(-1)!;
const houseByCombo = new Map(houseDistricts.map(district => [`${district.stateFips}${district.districtId.endsWith('-AL') ? '00' : String(district.district).padStart(2,'0')}`,district]));
const electionByState = (state: State) => elections.filter(election => seatById.get(election.seatId)?.stateFips === state.fips);
const targetSeatIds = uniqueElectionSeatIds(elections);
const senateBaseline = senateBreakdown(seats,elections);
const ratingConsensus = aggregateRatingConsensus([...new Set(elections.map(election => election.seatId))],ratingSnapshotObservations);
const ratingConsensusTotals = ratingConsensusCounts(ratingConsensus);
const ratingConsensusBySeat = new Map(ratingConsensus.map(result => [result.seatId,result]));
const displayRatings = new Map(ratingConsensus.map(result => [result.seatId,consensusDisplayRating(result)]));
const consensusTossupLabel = 'Toss Up（評価分裂を含む）';
const consensusMapNote = `2機関の統合評価（${RATING_SNAPSHOT_AS_OF}集計）。Toss Up ${ratingConsensusTotals.tossup+ratingConsensusTotals.split}議席は評価分裂を含み、冒頭の未配分と一致。勝率ではない。`;
function displayRatingFor(election: Election): Rating { return displayRatings.get(election.seatId) ?? 'unavailable'; }
function displayRatingLabel(election: Election): string {
  const category = ratingConsensusBySeat.get(election.seatId)?.category;
  if (category === 'tossup') return '接戦（Toss Up）';
  if (category === 'split') return '評価が分かれる';
  if (category === 'missing') return '評価不足';
  return displayRatingFor(election);
}
const focusElections = briefingElections(elections,seats,states,ratingConsensus);
activeFocusElectionId = focusElections[0]?.electionId ?? null;
function consensusEvidenceMarkup(election: Election): string {
  const result = ratingConsensusBySeat.get(election.seatId);
  if (!result) return '統合評価の資料不足';
  return result.observations.map(item => `${escapeHtml(item.organizationLabel)}：${escapeHtml(item.ratingRaw)}（${escapeHtml(item.currentConfirmedAt)}確認）`).join('／');
}
const currentScenarioBaseline = createRatingSenateBaseline({seats,elections,consensus:ratingConsensus,snapshotId:RATING_SNAPSHOT_ID,asOf:RATING_SNAPSHOT_AS_OF,methodVersion:RATING_METHOD_VERSION,seatDataVersion:DATA_AS_OF});
const legacyScenarioBaseline = createLegacySenateBaseline(seats);
scenarioState = createScenarioState(currentScenarioBaseline);
const fixedSeatCounts = senateBaseline.fixed;
const republicanTargetForMajority = Math.max(0,51 - fixedSeatCounts.Republican);
const democraticTargetForMajority = Math.max(0,51 - fixedSeatCounts.Democratic);
const regularCount = uniqueElectionSeatIds(elections.filter(election => election.type === 'regular')).length;
const specialCount = uniqueElectionSeatIds(elections.filter(election => election.type === 'special')).length;
const confirmedSeatCount = seats.filter(seat => seat.verificationStatus === 'confirmed' && seat.verifiedAt).length;
const confirmedElectionCount = elections.filter(election => election.verificationStatus === 'confirmed' && election.verifiedAt).length;
const baselineComplete = confirmedSeatCount === seats.length && confirmedElectionCount === elections.length;
const hasRatings = elections.some(election => displayRatingFor(election) !== 'unavailable');
const candidateCount = elections.reduce((sum,election) => sum + election.candidates.length,0);
const topSoyContexts = stateContexts.filter(context => context.soybeanRank2026 !== null && context.soybeanRank2026 <= 10);
const topSoyTrumpStates = topSoyContexts.filter(context => context.presidentialWinner2024 === 'R').length;
const topSoySenateRaces = topSoyContexts.filter(context => electionByState(states.find(state => state.fips === context.stateFips)! ).length).length;
const topSoyCompetitiveRaces = topSoyContexts.filter(context => electionByState(states.find(state => state.fips === context.stateFips)! ).some(election => ['Toss Up','Lean D','Lean R'].includes(displayRatingFor(election)))).length;
const partyLabel = {D:'民主党',R:'共和党',I:'無所属',other:'その他',vacant:'空席',unknown:'未確認'};
const caucusLabel: Record<SenateOutcome,string> = {Democratic:'民主党会派',Republican:'共和党会派',none:'会派非所属',unconfirmed:'会派未確認',vacant:'空席',unassigned:'未配分'};
const outcomeLabel = caucusLabel;

function syncScenarioInputs() {
  assumptions = Object.fromEntries(elections.map(election => [election.seatId,scenarioOutcomeForSeat(scenarioState,election.seatId,election)]));
  houseAssumptions = houseAssumptionsFromScenario(scenarioState);
}

function initializeScenario() {
  try {
    const shared = new URL(window.location.href).searchParams.get('s');
    if (shared) {
      const loaded = decodeScenario(shared,seats,elections,houseDistricts,currentScenarioBaseline,legacyScenarioBaseline);
      scenarioState = loaded.state;
      scenarioNotices.push(...loaded.notices,'共有された仮定を表示しています。編集すると、このブラウザの作業案として保存されます。');
      openedFromShare = true;
      sharedScenarioPending = true;
    } else {
      const draft = loadDraft(window.localStorage,seats,elections,houseDistricts,currentScenarioBaseline,legacyScenarioBaseline);
      if (draft) {
        scenarioState = draft.state;
        scenarioNotices.push(...draft.notices);
      }
    }
    const saved = loadSavedScenarios(window.localStorage,seats,elections,houseDistricts,currentScenarioBaseline,legacyScenarioBaseline);
    savedScenarios = saved.items;
    scenarioNotices.push(...saved.notices);
  } catch {
    scenarioNotices.push('保存領域を利用できないため、今回の表示内で操作を続けます。');
    scenarioStorageFailed = true;
  }
  if (scenarioState.target && powerTargets.some(target => target.targetId === scenarioState.target!.targetId)) {
    targetActionId = scenarioState.target.targetId;
    targetParty = scenarioState.target.caucus;
  }
  syncScenarioInputs();
}

initializeScenario();
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

function senateSeatCompositionMarkup(counts: SenateOutcomeCounts) {
  const contested = {...counts};
  for (const key of Object.keys(fixedSeatCounts) as Caucus[]) contested[key] -= fixedSeatCounts[key];
  const segments = senateCompositionSegments(senateBaseline,contested);
  return `<div class="seat-composition-block"><div class="seat-composition-title"><b>あなたの仮定・上院${seats.length}議席</b><span>薄色＝非改選／濃色＝今回改選</span></div>${seatBarMarkup(segments,seats.length,'利用者の仮定による議席配分',undefined,senateContestedRange())}</div>`;
}

function senateContestedRange() {
  return {start:seats.length - targetSeatIds.length - fixedSeatCounts.Republican,count:targetSeatIds.length,label:`今回改選 ${targetSeatIds.length}`};
}


function focusClassification(election: Election) {
  const category = ratingConsensusBySeat.get(election.seatId)?.category ?? 'missing';
  if (category === 'tossup') return {label:'接戦（Toss Up）',className:'focus-tossup'};
  if (category === 'split') return {label:'評価が分かれる',className:'focus-split'};
  if (category === 'missing') return {label:'評価不足',className:'focus-missing'};
  return {label:category === 'D' ? '民主党寄り' : '共和党寄り',className:'focus-lean'};
}

function researchBriefingParts(election: Election) {
  const brief = getRaceBrief(raceBriefs,election.electionId);
  const seat = seatById.get(election.seatId)!;
  const direction = ratingConsensusBySeat.get(election.seatId)?.category;
  const outlook = direction === 'D' ? '民主党寄り' : direction === 'R' ? '共和党寄り' : '優勢側を判断しにくい状態';
  const context = `現在この議席を持つ会派は${caucusLabel[seat.caucus]}。収録した機関の統合評価は${outlook}で、議席を守れるか、相手側が奪うかが上院の過半数争いに関わる。優勢という評価も当選確定を意味しない。`;
  const majorCandidates = election.candidates.filter(candidate => candidate.party === 'D' || candidate.party === 'R');
  const candidates = `<section class="observation-candidate-intro" aria-label="主要候補"><div>${majorCandidates.map(candidate => `<article><i class="party-dot party-${escapeHtml(candidate.party)}" aria-hidden="true"></i><p><b>${escapeHtml(candidate.name)}</b><small>${escapeHtml(candidate.partyLabel)}</small></p></article>`).join('')}</div></section>`;
  const lead = brief
    ? `<div class="briefing-week"><small>州別調査 · 更新 <time datetime="${escapeHtml(brief.updatedAt)}">${escapeHtml(brief.updatedAt)}</time></small><h4>${escapeHtml(brief.headline)}</h4><p>${escapeHtml(brief.summary)}</p></div><p class="briefing-takeaway"><b>主な論点</b>${brief.keyIssues.map(escapeHtml).join('／')}</p>`
    : `<div class="briefing-week"><small>選挙の基本情報</small><h4>この選挙を見るポイント</h4><p>${escapeHtml(context)}</p><p class="briefing-coverage-note">週次の詳しい解説は未収録。候補者と情勢評価を掲載しています。確認済みの関連記事がある場合は、ニュース欄に表示します。</p></div>`;
  const details = brief
    ? `<details class="briefing-details"><summary>州別調査・根拠を、この欄で読む</summary><div class="briefing-expanded">${raceBriefMarkup(brief)}${refs(brief.sourceIds)}</div></details>`
    : `<details class="briefing-details"><summary>候補者・選挙情報の根拠を読む</summary>${refs(election.sourceIds)}</details>`;
  return {lead:candidates + lead,details};
}

function focusSummaryMarkup(election: Election) {
  const seat = seatById.get(election.seatId)!;
  const state = stateByFips.get(seat.stateFips)!;
  const observation = observationFor(election.electionId);
  const classification = focusClassification(election);
  const body = observation
    ? observationBriefingParts(observation,election.candidates,seat.incumbent)
    : researchBriefingParts(election);
  return `<div class="focus-summary-heading"><div><p class="kicker">${escapeHtml(state.nameEn.toUpperCase())}</p><h3>${escapeHtml(state.nameJa)}${election.type === 'special' ? '・特別選挙' : ''}</h3></div><span class="focus-status ${classification.className}">${escapeHtml(classification.label)}</span></div>
    <div class="briefing-columns"><div class="briefing-analysis">${body.lead}${texasPollContextMarkup(election.electionId)}</div><div class="briefing-poll-column">${briefingPollsMarkup(polls,election.electionId)}<details class="briefing-ratings"><summary>Sabato・Inside Electionsの原評価と確認日</summary><p>${consensusEvidenceMarkup(election)}</p>${refs(ratingConsensusBySeat.get(election.seatId)?.observations.map(item=>item.sourceId) ?? [])}</details></div></div>${body.details}`;
}

function focusLocatorContent(election: Election) {
  const state = stateByFips.get(seatById.get(election.seatId)!.stateFips)!;
  return `<div id="focus-locator-map">${locatorMapMarkup(geoFeatures,state)}</div><figcaption><b>${escapeHtml(state.nameJa)}の位置</b><span>着色は選択州</span><small>アラスカ・ハワイは位置と縮尺を調整。</small></figcaption>`;
}

function renderFocusLocator() {
  const election = focusElections.find(item => item.electionId === activeFocusElectionId);
  const host = document.querySelector<HTMLElement>('#focus-locator');
  if (host && election) host.innerHTML = focusLocatorContent(election);
}

function focusUpdatesMarkup() {
  const active = focusElections.find(election => election.electionId === activeFocusElectionId) ?? focusElections[0];
  const leaningCount = focusElections.filter(election => ['D','R'].includes(ratingConsensusBySeat.get(election.seatId)?.category ?? '')).length;
  return `<article class="updates-card focus-card"><div class="focus-card-heading"><div><p class="kicker">RACES TO WATCH</p><h3>過半数の行方を左右する${focusElections.length}州</h3></div><span>接戦${ratingConsensusTotals.tossup}州・評価が分かれる${ratingConsensusTotals.split}州${ratingConsensusTotals.missing ? `・評価不足${ratingConsensusTotals.missing}州` : ''}${leaningCount ? `・優勢側のある${leaningCount}州` : ''}</span></div><details class="tossup-explainer"><summary>この${focusElections.length}州を取り上げる理由</summary><p>冒頭の統合評価で未配分となった州に、アイオワとノースカロライナを加えて読む。接戦（Toss Up）は2機関とも優勢側を判断しにくい選挙、評価が分かれる州は機関間で方向が一致しない選挙。評価不足も未配分に含む。優勢側のある州も併せて追い、接戦州の結果と合わせて過半数への道筋を読む。優勢とされた州も当選確定ではない。</p></details><div class="focus-selector"><figure id="focus-locator" class="briefing-locator">${active ? focusLocatorContent(active) : ''}</figure><div class="focus-tabs" role="tablist" aria-label="過半数の行方を左右する州を切り替える">${focusElections.map(election => {
    const state = stateByFips.get(seatById.get(election.seatId)!.stateFips)!;
    const selected = election.electionId === active?.electionId;
    const classification = focusClassification(election);
    return `<button id="focus-tab-${escapeHtml(election.electionId)}" type="button" role="tab" aria-selected="${selected}" aria-controls="focus-race-panel" tabindex="${selected ? 0 : -1}" class="${classification.className}" data-focus-election="${escapeHtml(election.electionId)}">${escapeHtml(state.nameJa)}${election.type === 'special' ? ' ★' : ''}<span>${escapeHtml(classification.label)}</span></button>`;
  }).join('')}</div></div><div id="focus-race-panel" class="focus-summary" role="tabpanel" aria-live="polite" ${active ? `aria-labelledby="focus-tab-${escapeHtml(active.electionId)}"` : ''}>${active ? focusSummaryMarkup(active) : '<p>対象の選挙はありません。</p>'}</div></article>`;
}

function renderFocusSummary(focus=true,syncFeed=true) {
  const active = focusElections.find(election => election.electionId === activeFocusElectionId) ?? focusElections[0];
  const panel = document.querySelector<HTMLElement>('#focus-race-panel');
  if (!active || !panel) return;
  activeFocusElectionId = active.electionId;
  document.querySelectorAll<HTMLButtonElement>('[data-focus-election]').forEach(button => {
    const selected = button.dataset.focusElection === active.electionId;
    button.setAttribute('aria-selected',String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby',`focus-tab-${active.electionId}`);
  panel.innerHTML = focusSummaryMarkup(active);
  renderFocusLocator();
  if (syncFeed) {
    newsRaceFilter=active.electionId;
    newsPages.recent=newsPages.upcoming=0;
    newsScrollTops.recent=newsScrollTops.upcoming=0;
    renderNewsList();
    updateNewsViewUrl();
  }
  if (focus) document.querySelector<HTMLButtonElement>(`[data-focus-election="${active.electionId}"]`)?.focus();
}

function bindFocusTabs() {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-focus-election]')];
  buttons.forEach((button,index) => {
    button.addEventListener('click',() => {
      activeFocusElectionId = button.dataset.focusElection ?? activeFocusElectionId;
      renderFocusSummary(false);
    });
    button.addEventListener('keydown',event => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
      activeFocusElectionId = buttons[nextIndex].dataset.focusElection ?? activeFocusElectionId;
      renderFocusSummary();
    });
  });
  renderFocusSummary(false,false);
}
function powerCardsMarkup() {
  return powerRules.map(rule => {
    const target = powerTargets.find(item => item.powerId === rule.powerId);
    return `<article id="power-card-${rule.powerId}" class="power-card"><h3>${rule.action}</h3><p>${rule.explanation}</p><dl><div><dt>下院</dt><dd>${rule.house}</dd></div><div><dt>上院</dt><dd>${rule.senate}</dd></div></dl>${powerVoteBars(rule)}<p class="power-effect"><b>政権への作用</b>${rule.presidentialConstraint}</p>${target ? `<button type="button" class="power-target-button" data-power-target="${target.targetId}">この条件から逆算</button>` : ''}</article>`;
  }).join('');
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header class="mast">
  <div class="mast-inner"><div><div class="eyebrow">U.S. MIDTERMS</div><h1>米国中間選挙 2026</h1></div><div class="mast-election"><span>投開票日・米国現地</span><time datetime="2026-11-03">2026.11.03</time></div></div>
</header>
<main>
  <nav class="jump-nav" aria-label="ページ内メニュー"><a href="#overview">概説・全国情勢</a><a href="#updates">直近の更新</a><a href="#powers">議席と権限</a><a href="#simulator">地図・シミュレーション</a><a href="#sources">出典</a></nav>
  ${introductionMarkup()}
  <div class="dateline"><span>サイト内容更新 ${escapeHtml(latestContentDate)}</span><span>上院 通常${regularCount}＋特別${specialCount}</span><span>下院 全435</span><span>候補者 ${candidateCount}人</span><span>版 ${APP_VERSION}</span><button id="reload-app" class="reload-app" type="button">最新版を再読み込み</button></div>
  <div class="data-caution ${baselineComplete ? 'verified' : ''}" role="note"><strong>${baselineComplete ? '収録範囲' : '基礎情報に未確認項目があります'}</strong><span>上院100議席、2026年35選挙、候補者、統一情勢評価、50州の人口・産業・2024年結果を収録。デラウェアは予備選前、ロードアイランドは9月9日の開票確定前として区別しています。</span></div>
  <span id="senate" class="legacy-anchor" aria-hidden="true"></span>
  <section class="workspace" aria-label="上院州別地図と詳細">
    <div class="map-column">
      <div class="controls" aria-label="地図表示設定"><div class="segmented" role="group" aria-label="地図の表示内容"><button data-mode="current" aria-pressed="false">投票前の議席</button><button data-mode="rating" class="active" aria-pressed="true">選挙情勢</button></div><label class="switch"><input id="competitive" type="checkbox" ${hasRatings?'':'disabled'}><span>激戦のみ強調</span></label></div>
      ${hasRatings?'':'<p class="control-note" id="competitive-note">情勢評価が未取得のため、激戦強調は利用できません。</p>'}
      <div class="search-wrap"><label for="state-search">州を検索・選択</label><select id="state-search"><option value="">50州から選ぶ</option>${states.map(state => `<option value="${state.fips}">${state.nameJa} / ${state.nameEn} (${state.abbr})</option>`).join('')}</select></div>
      <div class="map-head"><div><p class="kicker">SENATE MAP</p><h2 id="map-heading">2026年の上院選挙</h2></div><p id="mode-note">色は対象議席の現保有党。州全体の支持傾向や勝敗予測ではありません。</p></div>
      <div id="map" class="map" aria-label="米国50州地図"></div><div id="legend" class="legend"></div>
      <p class="map-note">州の面積は議席数を表しません。アラスカとハワイは投影上、位置・縮尺が調整されています。★は特別選挙です。</p>
      <details class="map-reading-guide"><summary>地図とシミュレーションの読み方</summary><p>「選挙情勢」は評価機関の分類、「投票前の議席」は現職会派を示します。州を選ぶと候補者と根拠を確認でき、当選者・会派の選択は下の議席集計に仮定として反映されます。灰色のToss Upは評価分裂を含み、冒頭の未配分と同じ議席です。党派の方向は2機関の一致、Solid／Likely／LeanはSabatoの分類を使用します。色は当選確率ではありません。</p><p>サイトの編集日、地図の評価日、州別調査の実施期間・公表日は別の時点です。各表示に付いた日付と、末尾の<a href="#sources">出典・更新情報</a>を確認してください。</p></details>
    </div>
    <aside id="detail" class="detail" aria-live="polite"><div class="empty-detail"><span>STATE BRIEFING</span><h2>州を選択してください</h2><p>地図または検索から、選挙の有無を問わず全50州の情報へ移動できます。</p></div></aside>
  </section>
  <section class="sim" aria-labelledby="sim-heading">
    <div class="sim-title"><div><p class="kicker">多数派への道</p><h2 id="sim-heading">議席シミュレーション</h2><p>通常${regularCount}件・特別${specialCount}件の今回改選する${targetSeatIds.length}議席について、当選者または参加会派を仮定します。</p></div><div class="sim-reset-actions"><button id="reset">この案の初期値へ戻す</button><button id="senate-latest-reset" type="button">最新の暫定配分で始め直す</button></div></div>
    <div class="warning">情勢評価の暫定配分から始めます。接戦や評価が分かれる議席は未配分です。選挙予測・勝率ではありません。</div>
    <details class="vp-sources"><summary>副大統領と決裁票の出典</summary>${refs(vicePresident.sourceIds)}</details>
    <div id="scenario-notices" class="scenario-notices" aria-live="polite"></div>
    <div id="sim-result"></div>
    <div id="scenario-sticky" class="scenario-sticky" aria-live="polite" aria-label="操作中の上院議席仮定"></div>
    <section id="scenario-manager" class="scenario-manager" aria-label="仮定の保存と共有"></section>
    <section id="state-compare" class="state-compare" aria-label="州の比較"></section>
    <details><summary>今回改選する全${targetSeatIds.length}議席の仮定を変更</summary><div id="seat-controls" class="seat-controls"></div></details>
  </section>

  <section id="powers" class="section-block powers" aria-labelledby="powers-heading">
    <div class="section-heading"><div><p class="kicker">CHECKS ON THE PRESIDENT</p><h2 id="powers-heading">議会の権限と必要票</h2></div></div>
    <div class="table-scroll"><table class="power-table"><thead><tr><th>権限</th><th>制度の基本</th><th>下院</th><th>上院</th><th>票数の目安</th><th>トランプ政権への作用</th></tr></thead><tbody>${powerRules.map(rule => `<tr id="power-${rule.powerId}" data-power-id="${rule.powerId}"><th>${rule.action}</th><td class="power-explanation">${rule.explanation}</td><td>${rule.house}</td><td>${rule.senate}</td><td class="power-vote-cell"><b>${rule.nominalSeats}</b><small>${rule.threshold}</small></td><td>${rule.presidentialConstraint}</td></tr>`).join('')}</tbody></table></div>
    <details class="source-panel"><summary>権限・票数の出典</summary>${refs([...new Set(powerRules.flatMap(rule => rule.sourceIds))])}</details>
  </section>

  <section id="issues" class="section-block issues" aria-label="8つの論点から選挙を見る">
    <p class="issue-panel-guide">論点を選び、候補者の違い、州の事例、次に確認する点を読む。</p>
    <div id="issue-tabs" class="issue-tabs" role="tablist" aria-label="論点を選択">${issueCategories.map(issue => `<button id="issue-tab-${issue.issueId}" type="button" role="tab" data-issue="${issue.issueId}" aria-controls="issue-detail" aria-selected="${issue.issueId === activeIssueId}">${issue.label}</button>`).join('')}</div>
    <div id="issue-detail" class="issue-detail" role="tabpanel" aria-labelledby="issue-tab-${activeIssueId}"></div>
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

  <section class="method"><p class="kicker">SOURCES & UPDATES</p><h2>出典と更新</h2><div class="method-grid"><article><b>事実・評価・仮定を分離</b><p>現職と公式統計は事実、情勢分類は評価機関の判断、シミュレーションは利用者の仮定として表示します。</p></article><article><b>資料ごとの時点を表示</b><p>サイト全体の更新日、地図の評価日、州別調査とニュースの対象期間を分けて記録します。</p></article><article><b>地域指標の読み方</b><p>人口、産業、過去の得票は政策の影響を考える材料です。州詳細では候補者の違いと併せて確認できます。</p></article></div><details class="source-panel"><summary>全データソース（${sources.length}件）</summary>${refs(sources.map(source => source.sourceId))}</details></section>
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
  issuesSection = issues;

  const nav = document.querySelector<HTMLElement>('.jump-nav');
  if (nav) {
    nav.innerHTML = '<a href="#overview">概説・全国情勢</a><a href="#updates">直近の更新</a><a href="#powers">議席と権限</a><a href="#simulator">地図・シミュレーション</a><a href="#sources">出典</a>';
  }

  const news = document.createElement('section');
  news.id = 'news';
  news.className = 'section-block news-section';
  news.setAttribute('aria-labelledby', 'news-heading');
  news.innerHTML = '<div class="section-heading"><div><p class="kicker">NEWS & EVENTS</p><h3 id="news-heading">ニュース・今後の予定</h3></div></div><div class="news-scope" role="group" aria-label="ニュースの対象"><button type="button" data-news-scope="state" aria-pressed="true">この州</button><button type="button" data-news-scope="all" aria-pressed="false">全国</button></div><p class="news-editorial-note">左の州選択に連動。記事を開くと背景と根拠を読める。</p><div class="news-tabs" role="tablist" aria-label="ニュースと予定を切り替える"><button id="news-tab-recent" type="button" role="tab" aria-selected="true" aria-controls="news-feed-panel" data-news-tab="recent">最近のニュース</button><button id="news-tab-upcoming" type="button" role="tab" aria-selected="false" aria-controls="news-feed-panel" data-news-tab="upcoming" tabindex="-1">今後の予定</button></div><div id="news-race-filter" class="news-race-filter" hidden><span></span></div><p class="news-scroll-hint">枠内をスクロールして続きを読む</p><div id="news-feed-panel" role="tabpanel" aria-labelledby="news-tab-recent"><div class="news-frame"><div id="news-list" class="news-list" tabindex="0" aria-label="最近のニュース一覧"></div><div id="news-scrollbar" class="custom-scrollbar" role="scrollbar" aria-label="ニュース一覧のスクロール位置" aria-controls="news-list" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><span class="scroll-thumb"></span></div></div><div class="news-pagination"><span id="news-page-status" aria-live="polite"></span><div><button id="news-prev" type="button">前の10件</button><button id="news-next" type="button">次の10件</button></div></div></div><div data-observation-monitor></div>';
  const newsMonitor=news.querySelector<HTMLElement>('[data-observation-monitor]');
  if(newsMonitor) newsMonitor.innerHTML=monitoringMarkup();
  const nationalOverview = document.createElement('div');
  nationalOverview.innerHTML = nationalOverviewMarkup();
  const nationalOverviewSection = nationalOverview.firstElementChild as HTMLElement|null;
  if (nationalOverviewSection) {
    const slot = overview?.querySelector<HTMLElement>('#national-overview-slot');
    if (slot) slot.replaceWith(nationalOverviewSection);
    else overview?.append(nationalOverviewSection);
  }
  const updates = document.createElement('section');
  updates.id = 'updates';
  updates.className = 'updates section-block';
  updates.setAttribute('aria-labelledby','updates-heading');
  updates.innerHTML = '<div class="section-heading"><div><p class="kicker">LATEST BRIEFING</p><h2 id="updates-heading">直近の更新</h2></div><p>州を選び、今週の論点と関連ニュースから選挙の行方を読む。</p></div><div class="updates-grid"></div>';
  const updatesGrid = updates.querySelector<HTMLElement>('.updates-grid')!;
  const focus = document.createElement('div');
  focus.innerHTML = focusUpdatesMarkup();
  if (focus.firstElementChild) updatesGrid.append(focus.firstElementChild);
  updatesGrid.append(news);
  updates.insertAdjacentHTML('beforeend','<a class="briefing-simulation-link" href="#simulator">議席配分をシミュレーションする →</a>');
  if (overview) overview.after(updates);
  else if (nav) nav.after(updates);
  else main.prepend(updates);

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
    bindDisclosurePreference(disclosure,POWER_DISCLOSURE_KEY);
    const table = powers.querySelector<HTMLTableElement>('.power-table');
    if (table) {
      [...(table.tBodies[0]?.rows ?? [])].forEach(row => {
        const rule = powerRules.find(item => item.powerId === row.dataset.powerId);
        const voteCell = row.querySelector<HTMLTableCellElement>('.power-vote-cell');
        if (rule && voteCell && voteCell.dataset.visualized !== 'true') {
          voteCell.dataset.visualized = 'true';
          voteCell.innerHTML = powerVoteBars(rule);
        }
      });
    }
    if (!powers.querySelector('.power-cards')) {
      const cards = document.createElement('div');
      cards.className = 'power-cards';
      cards.innerHTML = powerCardsMarkup();
      const sourcePanel = powers.querySelector('.source-panel');
      sourcePanel?.before(cards);
    }
    if (table && !table.dataset.actionsAdded) {
      table.dataset.actionsAdded = 'true';
      const header = table.tHead?.rows[0];
      if (header) {
        const cell = document.createElement('th');
        cell.textContent = '逆算';
        header.append(cell);
      }
      [...(table.tBodies[0]?.rows ?? [])].forEach(row => {
        const rule = powerRules.find(item => item.powerId === row.dataset.powerId);
        if (!rule) return;
        const cell = document.createElement('td');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'power-target-button';
        button.dataset.powerTarget = powerTargets.find(target => target.powerId === rule.powerId)?.targetId ?? rule.powerId;
        button.textContent = '条件を確認';
        cell.append(button);
        row.append(cell);
      });
    }
    const disclosureBody = powers.querySelector<HTMLDetailsElement>('#power-disclosure');
    if (disclosureBody && !disclosureBody.querySelector('.power-rollcall-example')) {
      const examples = rollCalls.filter(item => isPublic(item.status));
      if (examples.length) {
        const section = document.createElement('section');
        section.className = 'power-rollcall-example';
        section.innerHTML = '<div class="power-example-heading"><p class="kicker">SEATS ≠ POLICY VOTES</p><h3>多数派と個別政策の票は分けて読む</h3><p>同じ党の議員が常に同じ票を投じるとは限りません。実際の採決を、将来の確定票ではなく制度を読む例として表示します。</p></div><div class="power-rollcall-grid">' + examples.map(rollCallMarkup).join('') + '</div>' + refs(examples.flatMap(example => example.sourceIds));
        const sourcePanel = disclosureBody.querySelector('.source-panel');
        disclosureBody.insertBefore(section,sourcePanel ?? null);
      }
    }
    if (disclosureBody && !disclosureBody.querySelector('.power-overview')) {
      const overviewCards = document.createElement('div');
      overviewCards.className = 'power-overview';
      overviewCards.innerHTML = '<article><b>法律・予算</b><p>両院で可決し、大統領の署名または拒否権の覆しで成立する。歳出は下院と上院の合意が必要。</p></article><article><b>人事</b><p>上院が閣僚・裁判官などの指名を承認する。下院は承認投票に加わらない。</p></article><article><b>調査・監督</b><p>委員会の公聴会、資料要求、予算審査を通じて政権を検証する。</p></article>';
      const details = document.createElement('details');
      details.className = 'power-detail-list';
      details.innerHTML = `<summary>8項目の詳しい条件・採決例・出典を読む</summary>`;
      [...disclosureBody.children].filter(child => child !== summary).forEach(child => details.append(child));
      disclosureBody.append(overviewCards,details);
    }
    updates.after(powers);
  }

  if (sim) {
    sim.id = 'simulator';
    sim.setAttribute('aria-labelledby', 'sim-heading');
    const simTitle = sim.querySelector<HTMLElement>('.sim-title');
    const tabs = document.createElement('div');
    tabs.className = 'sim-tabs';
    tabs.setAttribute('aria-label', '権限から逆算する操作');
    tabs.innerHTML = '<button type="button" data-target-toggle aria-expanded="false" aria-controls="target-sim-panel">権限から逆算を開く</button><span class="sim-tabs-note">必要議席に届く複数の組合せを確認できます。組合せは当選確率を示すものではありません。</span>';
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
    const scenarioSticky = sim.querySelector<HTMLElement>('#scenario-sticky');
    if (scenarioSticky && workspace) sim.insertBefore(scenarioSticky,workspace);
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
    main.insertBefore(sim, powers?.nextSibling ?? updates.nextSibling);
  }
  if (issues) issues.remove();
  if (method) {
    method.id = 'sources';
    method.classList.add('section-block');
    const dateline = document.querySelector<HTMLElement>('.dateline');
    if (dateline) method.prepend(dateline);
    if (caution) method.insertBefore(caution,method.querySelector('.method-grid'));
  }

  bindFocusTabs();
  document.querySelector<HTMLButtonElement>('[data-all-races]')?.addEventListener('click',() => {
    document.querySelector('#simulator')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
  document.querySelectorAll<HTMLButtonElement>('[data-overview-news]').forEach(button => button.addEventListener('click',() => {
    const newsId = button.dataset.overviewNews;
    if (newsId) openFeedItem(`news:${newsId}`);
  }));

  const overlay = document.createElement('div');
  overlay.id = 'overlay-root';
  overlay.className = 'overlay-root';
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<div class="overlay-backdrop" data-overlay-close></div><section class="overlay-panel" role="dialog" aria-modal="true" aria-labelledby="overlay-heading"><header class="overlay-header"><button id="overlay-back" class="overlay-back" type="button" hidden>← 戻る</button><div class="overlay-title"><p id="overlay-kicker" class="kicker">PANEL</p><h2 id="overlay-heading">解説</h2></div><button id="overlay-close" class="close overlay-close" type="button" aria-label="パネルを閉じる">×</button></header><div class="overlay-body"><div id="overlay-content" class="overlay-content" tabindex="0"></div><div id="overlay-scrollbar" class="custom-scrollbar" role="scrollbar" aria-label="解説パネルのスクロール位置" aria-controls="overlay-content" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><span class="scroll-thumb"></span></div></div></section>';
  document.body.append(overlay);
  document.querySelector<HTMLElement>('[data-overlay-close]')?.addEventListener('click', () => closeOverlay());
  document.querySelector<HTMLButtonElement>('#overlay-close')?.addEventListener('click', () => closeOverlay());
  document.querySelector<HTMLButtonElement>('#overlay-back')?.addEventListener('click', () => navigateOverlayBack());
  document.querySelector<HTMLButtonElement>('#open-issues')?.addEventListener('click', () => openOverlay('issues'));
  document.querySelector<HTMLButtonElement>('#open-civics')?.addEventListener('click', () => openOverlay('civics'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlayKind) closeOverlay();
    if (event.key !== 'Tab' || !overlayKind) return;
    const panel = document.querySelector<HTMLElement>('.overlay-panel');
    const focusable = panel ? [...panel.querySelectorAll<HTMLElement>('button:not([disabled]):not([hidden]),a[href],select,input,[tabindex]:not([tabindex="-1"])')].filter(item => !item.hidden && item.getClientRects().length > 0) : [];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.querySelector<HTMLButtonElement>('#news-prev')?.addEventListener('click', () => {
    newsScrollTops[newsTab]=0;
    newsPages[newsTab] = Math.max(0, newsPages[newsTab] - 1);
    renderNewsList();
  });
  document.querySelector<HTMLButtonElement>('#news-next')?.addEventListener('click', () => {
    newsScrollTops[newsTab]=0;
    newsPages[newsTab] += 1;
    renderNewsList();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-news-tab]').forEach(button=>button.addEventListener('click',()=>setNewsTab(button.dataset.newsTab as NewsFeedTab)));
  document.querySelector<HTMLElement>('.news-tabs')?.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const tab:NewsFeedTab=event.key==='Home' ? 'recent' : event.key==='End' ? 'upcoming' : newsTab==='recent' ? 'upcoming' : 'recent';
    setNewsTab(tab);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-news-scope]').forEach(button=>button.addEventListener('click',()=>{
    newsRaceFilter=button.dataset.newsScope==='state' ? activeFocusElectionId : null;
    newsPages.recent=newsPages.upcoming=0;
    newsScrollTops.recent=newsScrollTops.upcoming=0;
    renderNewsList();
    updateNewsViewUrl();
  }));
  setupWorkspaceHeightSync();
}

function setupWorkspaceHeightSync() {
  const workspace = document.querySelector<HTMLElement>('.workspace');
  const mapColumn = workspace?.querySelector<HTMLElement>('.map-column');
  if (!workspace || !mapColumn || workspace.dataset.heightSync === 'true') return;
  workspace.dataset.heightSync = 'true';
  const split = matchMedia('(min-width: 960px) and (orientation: landscape) and (min-height: 600px)');
  const sync = () => {
    if (!split.matches) {
      workspace.style.removeProperty('--map-column-height');
      return;
    }
    workspace.style.setProperty('--map-column-height',`${Math.ceil(mapColumn.getBoundingClientRect().height)}px`);
  };
  const observer = new ResizeObserver(() => requestAnimationFrame(sync));
  observer.observe(mapColumn);
  split.addEventListener('change',sync);
  window.addEventListener('load',sync,{once:true});
  requestAnimationFrame(sync);
}

const NEWS_KIND_LABEL: Record<string, string> = {
  policy: '政策',
  speech: '発言',
  protest: '社会行動',
  election: '選挙',
  economy: '経済',
  'data-update': 'データ更新',
};
const POLICY_STAGE_LABEL: Record<string,string> = {
  statement:'発言',proposal:'提案',filed:'提出','passed-one-chamber':'一方の院を通過',
  enacted:'成立',implemented:'施行','effect-observed':'効果を観測','court-action':'司法判断・停止','not-applicable':'該当なし',
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
    const updateFromPointer = (event: PointerEvent) => {
      const rect = track.getBoundingClientRect();
      const point = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      scroll.scrollTop = (scroll.scrollHeight - scroll.clientHeight) * point;
    };
    track.addEventListener('pointerdown', event => {
      track.setPointerCapture(event.pointerId);
      updateFromPointer(event);
    });
    track.addEventListener('pointermove', event => { if (track.hasPointerCapture(event.pointerId)) updateFromPointer(event); });
    track.addEventListener('pointerup', event => { if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId); });
    track.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') scroll.scrollTop = 0;
      else if (event.key === 'End') scroll.scrollTop = scroll.scrollHeight;
      else scroll.scrollTop += event.key.includes('Down') ? scroll.clientHeight : -scroll.clientHeight;
    });
    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(scroll);
    if ('MutationObserver' in window) new MutationObserver(sync).observe(scroll,{subtree:true,childList:true,attributes:true});
    scroll.addEventListener('toggle',sync,true);
  }
  sync();
}

function activeNewsFeed(now=new Date()): NewsFeedItem[] {
  const items=newsTab==='recent' ? recentNewsFeed : buildUpcomingFeed(observationData,now);
  return filterFeed(items,newsRaceFilter);
}

function newsFilterLabel(electionId:string): string {
  const election=elections.find(item=>item.electionId===electionId);
  const state=election ? stateByFips.get(seatById.get(election.seatId)!.stateFips) : undefined;
  return state ? `${state.nameJa}に関係する${newsTab==='recent' ? 'ニュース' : '予定'}` : '対象を絞り込み中';
}

function updateNewsViewUrl(replace=true) {
  const url=new URL(window.location.href);
  if(newsTab==='recent') url.searchParams.delete('newsTab'); else url.searchParams.set('newsTab',newsTab);
  if(newsRaceFilter) url.searchParams.set('newsRace',newsRaceFilter); else url.searchParams.delete('newsRace');
  if(newsRaceFilter) url.searchParams.delete('newsScope'); else url.searchParams.set('newsScope','all');
  if(activeFocusElectionId) url.searchParams.set('briefRace',activeFocusElectionId);
  if(replace) window.history.replaceState(null,'',url); else window.history.pushState(null,'',url);
}

function setNewsTab(tab:NewsFeedTab,options:{focus?:boolean;updateUrl?:boolean}={}) {
  const currentList=document.querySelector<HTMLElement>('#news-list');
  if(currentList) newsScrollTops[newsTab]=currentList.scrollTop;
  newsTab=tab;
  renderNewsList();
  if(options.updateUrl!==false) updateNewsViewUrl();
  if(options.focus!==false) document.querySelector<HTMLButtonElement>(`[data-news-tab="${tab}"]`)?.focus();
}

function showNewsFeed(tab:NewsFeedTab,electionId:string|null) {
  newsRaceFilter=electionId && elections.some(item=>item.electionId===electionId) ? electionId : null;
  if (focusElections.some(item=>item.electionId===newsRaceFilter)) {
    activeFocusElectionId=newsRaceFilter;
    renderFocusSummary(false,false);
  }
  newsPages[tab]=0;
  newsScrollTops[tab]=0;
  setNewsTab(tab,{focus:false,updateUrl:false});
  setNewsItemUrl(null,'replace');
  updateNewsViewUrl();
  const news=document.querySelector<HTMLElement>('#news');
  news?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'});
  requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>(`[data-news-tab="${tab}"]`)?.focus({preventScroll:true}));
}

function renderNewsList() {
  const list = document.querySelector<HTMLElement>('#news-list');
  const status = document.querySelector<HTMLElement>('#news-page-status');
  const previous = document.querySelector<HTMLButtonElement>('#news-prev');
  const next = document.querySelector<HTMLButtonElement>('#news-next');
  if (!list || !status || !previous || !next) return;
  document.querySelectorAll<HTMLButtonElement>('[data-news-tab]').forEach(button=>{
    const active=button.dataset.newsTab===newsTab;
    button.setAttribute('aria-selected',String(active));
    button.tabIndex=active ? 0 : -1;
  });
  const panel=document.querySelector<HTMLElement>('#news-feed-panel');
  if(panel) panel.setAttribute('aria-labelledby',`news-tab-${newsTab}`);
  list.setAttribute('aria-label',newsTab==='recent' ? '最近のニュース一覧' : '今後の予定一覧');
  const filter=document.querySelector<HTMLElement>('#news-race-filter');
  if(filter){
    filter.hidden=!newsRaceFilter;
    const label=filter.querySelector('span');
    if(label && newsRaceFilter) label.textContent=newsFilterLabel(newsRaceFilter);
  }
  const filterElection=elections.find(item=>item.electionId===newsRaceFilter);
  const filterState=filterElection ? stateByFips.get(seatById.get(filterElection.seatId)!.stateFips) : undefined;
  const newsHeading=document.querySelector<HTMLElement>('#news-heading');
  if(newsHeading) newsHeading.textContent=`${filterState?.nameJa ?? '全国'}の${newsTab==='recent' ? 'ニュース' : '今後の予定'}`;
  document.querySelectorAll<HTMLButtonElement>('[data-news-scope]').forEach(button=>{
    button.setAttribute('aria-pressed',String(button.dataset.newsScope===(newsRaceFilter ? 'state' : 'all')));
  });
  const feedItems=activeNewsFeed();
  const pageCount = Math.max(1, Math.ceil(feedItems.length / NEWS_PAGE_SIZE));
  newsPages[newsTab] = Math.min(Math.max(0, newsPages[newsTab]), pageCount - 1);
  const start = newsPages[newsTab] * NEWS_PAGE_SIZE;
  const pageItems = feedItems.slice(start, start + NEWS_PAGE_SIZE);
  list.innerHTML = '';
  if (!pageItems.length) {
    const empty = document.createElement('p');
    empty.className = 'news-empty';
    empty.textContent = newsTab==='recent' ? '表示できるニュースがありません。' : '表示できる予定がありません。';
    list.append(empty);
  }
  let historyHost:HTMLElement|null=null;
  pageItems.forEach(item => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `news-card feed-${item.sourceKind}${item.history ? ' feed-history' : ''}`;
    card.dataset.feedKey = item.key;
    const meta = document.createElement('span');
    meta.className = 'news-meta';
    meta.id = `news-meta-${item.sourceKind}-${item.sourceId}`;
    const source= item.sourceKind==='news' ? publishedNewsItems.find(entry=>entry.newsId===item.sourceId) : undefined;
    const typeLabel=item.sourceKind==='news' ? (NEWS_KIND_LABEL[source?.kind ?? ''] ?? 'ニュース') : item.sourceKind==='update' ? '選挙分析' : '予定';
    meta.textContent = `${item.sourceKind === 'event' ? item.dateLabel : `${typeLabel} · ${item.dateLabel}`}${item.statusLabel ? ` · ${item.statusLabel}` : ''}${source?.location.label ? ` · ${source.location.label}` : ''}`;
    const headline = document.createElement('strong');
    headline.id = `news-headline-${item.sourceKind}-${item.sourceId}`;
    headline.textContent = item.title;
    const summary = document.createElement('span');
    summary.className = 'news-summary';
    summary.id = `news-summary-${item.sourceKind}-${item.sourceId}`;
    summary.textContent = item.summary;
    card.setAttribute('aria-labelledby', headline.id);
    card.setAttribute('aria-describedby', `${meta.id} ${summary.id}`);
    card.append(meta, headline, summary);
    card.addEventListener('click', () => openFeedItem(item.key));
    if(item.history){
      if(!historyHost){
        const history=document.createElement('details');
        history.className='news-event-history';
        const summary=document.createElement('summary');
        const historyCount=feedItems.filter(entry=>entry.history).length;
        summary.textContent=`結果確認・日程変更・過去の予定（${historyCount}件）`;
        historyHost=document.createElement('div');
        history.append(summary,historyHost);
        list.append(history);
      }
      historyHost.append(card);
    } else list.append(card);
  });
  status.textContent = feedItems.length ? (newsPages[newsTab] + 1) + ' / ' + pageCount + 'ページ · ' + (start + 1) + '–' + Math.min(start + pageItems.length, feedItems.length) + '件' : '0件';
  previous.textContent=newsTab==='recent' ? '前の10件' : '前の予定';
  next.textContent=newsTab==='recent' ? '次の10件' : '次の予定';
  previous.disabled = newsPages[newsTab] === 0;
  next.disabled = newsPages[newsTab] >= pageCount - 1;
  requestAnimationFrame(()=>{ list.scrollTop=newsScrollTops[newsTab]; });
  setupScrollIndicator('news-list', 'news-scrollbar');
}

function captureNewsReturn(feedKey: NewsFeedKey): NewsReturnState {
  const content = document.querySelector<HTMLElement>('#overlay-content');
  const stored = [...overlayHistory].reverse().find(entry => entry.kind === 'news' && entry.newsId === feedKey);
  const articleScrollTop = overlayKind === 'news' && overlayNewsId === feedKey ? (content?.scrollTop ?? 0) : (stored?.scrollTop ?? 0);
  return {feedKey,articleScrollTop,tab:newsTab,raceFilter:newsRaceFilter,newsPage:newsPages[newsTab],listScrollTop:document.querySelector<HTMLElement>('#news-list')?.scrollTop ?? 0};
}

function restoreNewsReturn(state: NewsReturnState) {
  newsTab=state.tab;
  newsRaceFilter=state.raceFilter;
  newsPages[state.tab] = state.newsPage;
  newsScrollTops[state.tab]=state.listScrollTop;
  renderNewsList();
  const list = document.querySelector<HTMLElement>('#news-list');
  if (list) list.scrollTop = state.listScrollTop;
  openFeedItem(state.feedKey,{history:'push'});
  requestAnimationFrame(() => {
    const content = document.querySelector<HTMLElement>('#overlay-content');
    if (content) content.scrollTop = state.articleScrollTop;
  });
}

function setNewsItemUrl(feedKey:NewsFeedKey|null,mode:'push'|'replace'|'none') {
  if(mode==='none') return;
  const url=new URL(window.location.href);
  if(newsTab==='recent') url.searchParams.delete('newsTab'); else url.searchParams.set('newsTab',newsTab);
  if(newsRaceFilter) url.searchParams.set('newsRace',newsRaceFilter); else url.searchParams.delete('newsRace');
  if(feedKey) url.searchParams.set('newsItem',feedKey); else url.searchParams.delete('newsItem');
  window.history[mode==='push' ? 'pushState' : 'replaceState'](null,'',url);
}

function openFeedItem(rawKey:string,options:{history?:'push'|'replace'|'none'}={}) {
  const feedKey=resolveFeedKey(rawKey,newsItems,observationData);
  if(!feedKey) return false;
  const targetTab:NewsFeedTab=feedKey.startsWith('event:') ? 'upcoming' : 'recent';
  if(newsTab!==targetTab){newsTab=targetTab;renderNewsList();}
  const historyMode=options.history ?? 'push';
  openOverlay('news',feedKey,{recordHistory:historyMode!=='none'});
  setNewsItemUrl(feedKey,historyMode);
  return true;
}

function observationSourceIds(evidenceIds:string[]):string[] {
  const evidenceById=new Map(observationData.evidenceRefs.map(item=>[item.evidenceId,item]));
  return [...new Set(evidenceIds.map(id=>evidenceById.get(id)?.sourceId).filter((id):id is string=>Boolean(id)))];
}

function appendFeedStateLinks(article:HTMLElement,feedKey:NewsFeedKey,electionIds:string[]) {
  const entries=[...new Set(electionIds)].map(id=>{
    const election=elections.find(item=>item.electionId===id);
    const state=election ? stateByFips.get(seatById.get(election.seatId)!.stateFips) : undefined;
    return state ? {state,electionId:id} : null;
  }).filter((entry):entry is {state:State;electionId:string}=>Boolean(entry));
  if(!entries.length) return;
  const stateNav=document.createElement('div');
  stateNav.className='news-state-links';
  const label=document.createElement('b');
  label.textContent='関連州を詳しく見る';
  stateNav.append(label);
  entries.forEach(({state})=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=state.nameJa;
    button.addEventListener('click',()=>{
      stateReturnNews=captureNewsReturn(feedKey);
      setNewsItemUrl(null,'replace');
      closeOverlay();
      document.querySelector<HTMLSelectElement>('#state-search')!.value=state.fips;
      selectState(state);
      document.querySelector('#detail')?.scrollIntoView({behavior:'instant',block:'start'});
    });
    stateNav.append(button);
  });
  article.append(stateNav);
}

function renderUpdateDetail(updateId:string) {
  const content=document.querySelector<HTMLElement>('#overlay-content');
  const update=observationData.updates.find(item=>item.updateId===updateId && item.status==='published');
  if(!content || !update) return;
  const article=document.createElement('article');
  article.className='news-detail observation-feed-detail';
  article.innerHTML=`<p class="news-meta">選挙分析 · 出来事 ${escapeHtml(update.eventDate)} · サイト更新 ${escapeHtml(update.updatedAt)}</p><h3>${escapeHtml(update.title)}</h3><h4>確認できたこと</h4><p class="news-long-text">${escapeHtml(update.happened)}</p><h4>判断材料の変化</h4><p class="news-long-text">${escapeHtml(update.meaning)}</p><p class="observation-feed-limit"><b>まだ分からないこと</b>${escapeHtml(update.uncertainty)}</p>`;
  if(update.eventId){
    const eventKey=resolveFeedKey(`event:${update.eventId}`,newsItems,observationData);
    if(eventKey){
      const button=document.createElement('button');button.type='button';button.className='news-cross-link';button.textContent='元の予定を見る';
      button.addEventListener('click',()=>openFeedItem(eventKey));article.append(button);
    }
  }
  appendFeedStateLinks(article,`update:${update.updateId}`,update.electionIds);
  const sourceIds=observationSourceIds(update.evidenceIds);
  if(sourceIds.length){const source=document.createElement('details');source.className='source-panel';source.open=true;source.innerHTML='<summary>出典</summary>'+refs(sourceIds);article.append(source);}
  content.replaceChildren(article);
  setupScrollIndicator('overlay-content','overlay-scrollbar');
}

function formatEventTime(event:typeof observationData.events[number]):string {
  if(!event.time) return event.date ? '時刻未確認' : '日程未定';
  const zone:Record<string,string>={'America/New_York':'米東部時間','America/Chicago':'米中部時間','America/Denver':'米山岳部時間','America/Los_Angeles':'米太平洋時間','America/Anchorage':'アラスカ時間'};
  const instant=eventInstant(event);
  const jst=instant ? new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(instant) : null;
  return `${event.time} ${zone[event.timezone] ?? event.timezone}${jst ? `／日本時間 ${jst}` : ''}`;
}

function renderEventDetail(eventId:string) {
  const content=document.querySelector<HTMLElement>('#overlay-content');
  const event=observationData.events.find(item=>item.eventId===eventId && item.publicationStatus==='published');
  if(!content || !event) return;
  const article=document.createElement('article');
  article.className='news-detail observation-feed-detail';
  const date=event.date ? `予定 ${escapeHtml(event.date)} · ${escapeHtml(formatEventTime(event))}` : '日程未定';
  article.innerHTML=`<p class="news-meta">予定 · ${date} · ${escapeHtml(eventStatus(event))}</p><h3>${escapeHtml(event.title)}</h3><p class="observation-feed-limit">予定日時を過ぎても、原資料で実施を確認するまでは結果確認待ちとして扱います。</p>`;
  const relevance=document.createElement('section');
  relevance.className='event-relevance';
  const heading=document.createElement('h4');heading.textContent='関連州で見る点';relevance.append(heading);
  event.relevance.forEach(item=>{
    const election=elections.find(entry=>entry.electionId===item.electionId);
    const state=election ? stateByFips.get(seatById.get(election.seatId)!.stateFips) : undefined;
    const row=document.createElement('article');
    row.innerHTML=`<h5>${escapeHtml(state?.nameJa ?? item.electionId)}</h5><p>${escapeHtml(item.why)}</p><p><b>確認する点：</b>${escapeHtml(item.watch)}</p>`;
    relevance.append(row);
  });
  article.append(relevance);
  if(event.dateHistory.length){
    const history=document.createElement('details');history.innerHTML=`<summary>日程変更の記録</summary>${event.dateHistory.map(item=>`<p><time>${escapeHtml(item.date)}</time> ${escapeHtml(item.reason)}</p>`).join('')}`;article.append(history);
  }
  if(event.resultUpdateId){
    const resultKey=resolveFeedKey(`update:${event.resultUpdateId}`,newsItems,observationData);
    if(resultKey){const button=document.createElement('button');button.type='button';button.className='news-cross-link';button.textContent='結果と判断材料の変化を読む';button.addEventListener('click',()=>openFeedItem(resultKey));article.append(button);}
  }
  appendFeedStateLinks(article,`event:${event.eventId}`,event.relevance.map(item=>item.electionId));
  const sourceIds=observationSourceIds([...event.evidenceIds,...event.dateHistory.flatMap(item=>item.evidenceIds)]);
  if(sourceIds.length){const source=document.createElement('details');source.className='source-panel';source.open=true;source.innerHTML='<summary>出典</summary>'+refs(sourceIds);article.append(source);}
  content.replaceChildren(article);
  setupScrollIndicator('overlay-content','overlay-scrollbar');
}

function renderFeedDetail(feedKey:NewsFeedKey) {
  const item=feedItemByKey(feedKey,newsItems,observationData);
  if(!item){
    const content=document.querySelector<HTMLElement>('#overlay-content');
    if(content) content.innerHTML='<p class="news-empty">この記事または予定は現在公開されていません。</p>';
    return;
  }
  if(item.sourceKind==='news') renderNewsDetail(item.sourceId);
  else if(item.sourceKind==='update') renderUpdateDetail(item.sourceId);
  else renderEventDetail(item.sourceId);
}

function renderNewsDetail(newsId: string) {
  const content = document.querySelector<HTMLElement>('#overlay-content');
  const item = getPublishedNewsById(newsItems,newsId);
  if (!content) return;
  if (!item) {
    content.innerHTML = '<p class="news-empty">この記事は現在公開されていません。</p>';
    setupScrollIndicator('overlay-content','overlay-scrollbar');
    return;
  }
  content.innerHTML = '';
  const article = document.createElement('article');
  article.className = 'news-detail';
  const itemSources = item.sourceIds.map(sourceId => sourceById.get(sourceId)).filter(Boolean);
  const sourcePublicationDates = [...new Set(itemSources.map(source => source!.publishedAt).filter((value): value is string => Boolean(value)))];
  const referencePeriods = [...new Set(itemSources.map(source => source!.referencePeriod).filter(Boolean))];
  const meta = document.createElement('p');
  meta.className = 'news-meta';
  meta.textContent = (NEWS_KIND_LABEL[item.kind] ?? 'ニュース') + ' · 発生日 ' + (item.eventDate ?? '未特定') + ' · サイト更新 ' + item.updatedAt;
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
  const editorial = document.createElement('dl');
  editorial.className = 'news-editorial-details';
  editorial.innerHTML = `<div><dt>調査・対象期間</dt><dd></dd></div><div><dt>原資料の公表日</dt><dd></dd></div><div><dt>サイト掲載・更新</dt><dd></dd></div><div><dt>地図への反映</dt><dd></dd></div><div><dt>政策段階</dt><dd>${POLICY_STAGE_LABEL[item.policyStage] ?? item.policyStage}</dd></div><div><dt>掲載理由</dt><dd></dd></div><div><dt>前回からの変化</dt><dd></dd></div>`;
  const editorialValues = editorial.querySelectorAll('dd');
  if (editorialValues[0]) editorialValues[0].textContent = referencePeriods.slice(0,2).join('／') || '個別の対象期間は出典欄で確認';
  if (editorialValues[1]) editorialValues[1].textContent = sourcePublicationDates.join('／') || '原資料に明示なし';
  if (editorialValues[2]) editorialValues[2].textContent = `掲載 ${item.publishedAt}／更新 ${item.updatedAt}`;
  if (editorialValues[3]) editorialValues[3].textContent = '未反映。ニュースだけで地図の情勢分類は自動変更しません。';
  if (editorialValues[5]) editorialValues[5].textContent = item.selectionReason;
  if (editorialValues[6]) editorialValues[6].textContent = item.whatChanged;
  article.append(meta, title, summary, impactHeading, impact, editorial);
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
  const relatedCandidates = item.relatedCandidateIds.map(candidateId => candidateById.get(candidateId)).filter(Boolean);
  if (relatedCandidates.length) {
    const candidateList = document.createElement('div');
    candidateList.className = 'news-candidate-links';
    const label = document.createElement('b');
    label.textContent = '関連候補';
    const values = document.createElement('span');
    values.textContent = relatedCandidates.map(candidate => `${candidate!.name}（${candidate!.partyLabel}）`).join('、');
    candidateList.append(label,values);
    article.append(candidateList);
  }
  const linkedUpdates=linkedUpdatesForNews(item.newsId,observationData);
  if(linkedUpdates.length){
    const analysis=document.createElement('section');
    analysis.className='news-linked-analysis';
    analysis.innerHTML='<h4>判断材料への反映</h4>'+linkedUpdates.map(update=>`<article><h5>${escapeHtml(update.title)}</h5><p>${escapeHtml(update.meaning)}</p><p class="observation-feed-limit"><b>まだ分からないこと</b>${escapeHtml(update.uncertainty)}</p></article>`).join('');
    article.append(analysis);
  }
  appendFeedStateLinks(article,`news:${item.newsId}`,[...item.relatedElectionIds,...linkedUpdates.flatMap(update=>update.electionIds)]);
  const sourceDetails = document.createElement('details');
  sourceDetails.className = 'source-panel';
  sourceDetails.open = true;
  sourceDetails.innerHTML = '<summary>出典</summary>' + refs([...new Set([...item.sourceIds,...linkedUpdates.flatMap(update=>observationSourceIds(update.evidenceIds))])]);
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

function renderIssueReportNotice() {
  const detail = document.querySelector<HTMLElement>('#issue-detail');
  if (!detail) return;
  detail.querySelector('.issue-report-wrap')?.remove();
  const report = issueReports.find(item => item.issueId === activeIssueId && isPublic(item.status));
  if (!report) return;
  const relatedNews = getPublishedNewsForIssue(newsItems,activeIssueId).slice(0,5);
  const wrapper = document.createElement('section');
  wrapper.className = 'issue-report-wrap';
  const relatedNewsMarkup = relatedNews.length ? `<section class="issue-related-news"><h4>関連ニュース</h4>${relatedNews.map(item => `<button type="button" data-issue-news="${escapeHtml(item.newsId)}"><time>${escapeHtml(item.eventDate ?? item.publishedAt)}</time><span>${escapeHtml(item.headline)}</span></button>`).join('')}</section>` : '';
  wrapper.innerHTML = issueReportMarkup(report) + relatedNewsMarkup + refs(report.sourceIds);
  detail.append(wrapper);
  wrapper.querySelectorAll<HTMLButtonElement>('[data-research-state]').forEach(button => {
    button.onclick = () => {
      const state = stateByFips.get(button.dataset.researchState ?? '');
      if (!state) return;
      const origin=resolveFeedKey(overlayOriginNewsId,newsItems,observationData);
      stateReturnNews = origin ? captureNewsReturn(origin) : null;
      closeOverlay();
      document.querySelector<HTMLSelectElement>('#state-search')!.value = state.fips;
      selectState(state);
      document.querySelector('#senate')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    };
  });
  wrapper.querySelectorAll<HTMLButtonElement>('[data-issue-news]').forEach(button => button.addEventListener('click',() => {
    const newsId = button.dataset.issueNews;
    if (newsId) openFeedItem(`news:${newsId}`);
  }));
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
      const disclosure = document.querySelector<HTMLDetailsElement>('#power-disclosure');
      if (disclosure) disclosure.open = true;
      const powerDetails = document.querySelector<HTMLDetailsElement>('.power-detail-list');
      if (powerDetails) powerDetails.open = true;
      const target = link.dataset.powerLink ? document.querySelector(matchMedia('(max-width: 800px)').matches ? `#power-card-${link.dataset.powerLink}` : `#power-${link.dataset.powerLink}`) : null;
      (target ?? document.querySelector('#powers'))?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'});
    };
  });
  document.querySelectorAll<HTMLButtonElement>('#issue-detail [data-issue-power-target]').forEach(button => {
    button.onclick = () => {
      targetActionId = powerTargets.find(target => target.powerId === button.dataset.issuePowerTarget)?.targetId ?? targetActionId;
      closeOverlay();
      setTargetPanel(true);
      updateScenario(draft => { draft.target = {targetId:targetActionId,caucus:targetParty}; });
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

function renderCivicsPanel() {
  const content = document.querySelector<HTMLElement>('#overlay-content');
  if (!content) return;
  const specialTerms = elections.filter(election => election.type === 'special').map(election => {
    const state = stateByFips.get(seatById.get(election.seatId)!.stateFips)!;
    return `<p><b>${state.nameJa}</b>：残任期は${escapeHtml(election.termEnd)}まで。${escapeHtml(election.termStartRule ?? `任期開始は${escapeHtml(election.termStart ?? '未確定')}。`)}</p>`;
  }).join('');
  const sourceIds = [...introductionContent.institutionSourceIds,...elections.filter(election => election.type === 'special').flatMap(election => election.sourceIds)];
  content.innerHTML = `<div class="civics-panel-content">${introductionDetails.map(section => `<article><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.body)}</p></article>`).join('')}<article><h3>特別選挙の残任期と就任</h3>${specialTerms}</article><details class="civics-sources"><summary>出典・確認日を開く</summary>${refs(sourceIds)}</details></div>`;
  setupScrollIndicator('overlay-content','overlay-scrollbar');
}

function openOverlay(kind: OverlayKind, newsId?: string, options:{recordHistory?:boolean}={}) {
  const root = document.querySelector<HTMLElement>('#overlay-root');
  const content = document.querySelector<HTMLElement>('#overlay-content');
  const close = document.querySelector<HTMLButtonElement>('#overlay-close');
  if (!root || !content) return;
  if (!overlayKind) {
    overlayHistory = [];
    overlayReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    overlayReturnScrollY = window.scrollY;
    overlayOriginNewsId = kind === 'news' ? (newsId ?? null) : null;
  } else if (options.recordHistory!==false && (overlayKind !== kind || overlayNewsId !== (newsId ?? null))) {
    overlayHistory.push({kind:overlayKind,newsId:overlayNewsId,scrollTop:content.scrollTop});
  }
  overlayKind = kind;
  overlayNewsId = newsId ?? null;
  root.dataset.kind = kind;
  root.hidden = false;
  root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
  const app = document.querySelector<HTMLElement>('#app');
  if (app) app.inert = true;
  document.querySelector<HTMLElement>('.skip')?.setAttribute('inert','');
  renderActiveOverlay();
  close?.focus();
}

function renderActiveOverlay() {
  const content = document.querySelector<HTMLElement>('#overlay-content');
  const heading = document.querySelector<HTMLElement>('#overlay-heading');
  const kicker = document.querySelector<HTMLElement>('#overlay-kicker');
  const back = document.querySelector<HTMLButtonElement>('#overlay-back');
  if (!content || !heading || !kicker || !overlayKind) return;
  content.scrollTop = 0;
  if (overlayKind === 'issues') {
    kicker.textContent = 'ISSUE LENS';
    heading.textContent = '8つの論点から選挙を見る';
    renderIssuesPanel();
  } else if (overlayKind === 'news') {
    const isEvent=overlayNewsId?.startsWith('event:');
    kicker.textContent = isEvent ? 'UPCOMING EVENT' : 'NEWS DETAIL';
    heading.textContent = isEvent ? '今後の予定' : 'ニュースの詳細';
    const feedKey=resolveFeedKey(overlayNewsId,newsItems,observationData);
    if (feedKey) renderFeedDetail(feedKey);
  } else {
    kicker.textContent = 'CIVICS GUIDE';
    heading.textContent = 'Class制度と特別選挙';
    renderCivicsPanel();
  }
  if (back) back.hidden = overlayHistory.length === 0;
}

function navigateOverlayBack() {
  const previous = overlayHistory.pop();
  if (!previous) return;
  overlayKind = previous.kind;
  overlayNewsId = previous.newsId;
  const root = document.querySelector<HTMLElement>('#overlay-root');
  if (root) root.dataset.kind = previous.kind;
  renderActiveOverlay();
  if(previous.kind==='news'){
    const key=resolveFeedKey(previous.newsId,newsItems,observationData);
    if(key) setNewsItemUrl(key,'replace');
  } else setNewsItemUrl(null,'replace');
  requestAnimationFrame(() => {
    const content = document.querySelector<HTMLElement>('#overlay-content');
    if (content) content.scrollTop = previous.scrollTop;
    const back = document.querySelector<HTMLButtonElement>('#overlay-back');
    if (back?.hidden) document.querySelector<HTMLButtonElement>('#overlay-close')?.focus();
  });
}

function closeOverlay() {
  const root = document.querySelector<HTMLElement>('#overlay-root');
  if (!root || !overlayKind) return;
  if(new URL(window.location.href).searchParams.has('newsItem')) setNewsItemUrl(null,'replace');
  root.hidden = true;
  root.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overlay-open');
  const app = document.querySelector<HTMLElement>('#app');
  if (app) app.inert = false;
  document.querySelector<HTMLElement>('.skip')?.removeAttribute('inert');
  overlayKind = null;
  overlayNewsId = null;
  overlayHistory = [];
  const back = document.querySelector<HTMLButtonElement>('#overlay-back');
  if (back) back.hidden = true;
  window.scrollTo({top: overlayReturnScrollY, behavior: 'auto'});
  if (overlayReturnFocus?.isConnected) overlayReturnFocus.focus();
  overlayReturnFocus = null;
  overlayOriginNewsId = null;
  delete root.dataset.kind;
}

function addScenarioNotice(message: string) {
  scenarioNotices = [...scenarioNotices.slice(-3),message];
  renderScenarioNotices();
}

function renderScenarioNotices() {
  const host = document.querySelector<HTMLElement>('#scenario-notices');
  if (!host) return;
  host.innerHTML = scenarioNotices.length
    ? scenarioNotices.map(message => `<p>${escapeHtml(message)}</p>`).join('')
    : `<p class="saved-ok">${scenarioStorageFailed ? 'この表示内で操作中' : 'このブラウザに自動保存'}</p>`;
}

function scheduleScenarioSave() {
  if (scenarioStorageFailed || sharedScenarioPending) return;
  if (scenarioSaveTimer !== null) window.clearTimeout(scenarioSaveTimer);
  scenarioSaveTimer = window.setTimeout(() => {
    scenarioSaveTimer = null;
    const result = saveDraft(window.localStorage,scenarioState);
    if (!result.ok && result.message) {
      scenarioStorageFailed = true;
      addScenarioNotice(result.message);
    } else renderScenarioNotices();
  },250);
}

function otherScenarioSeats(counts: SenateOutcomeCounts) {
  return counts.none + counts.unconfirmed + counts.vacant;
}

function scenarioChangeText(label: string, before: SenateOutcomeCounts, after: SenateOutcomeCounts) {
  const changes = [
    ['民主',after.Democratic-before.Democratic],
    ['共和',after.Republican-before.Republican],
    ['未配分',after.unassigned-before.unassigned],
    ['その他',otherScenarioSeats(after)-otherScenarioSeats(before)],
  ].filter(([,value]) => value !== 0).map(([name,value]) => `${name}${Number(value) > 0 ? '+' : ''}${value}`);
  return `${label}。${changes.length ? changes.join('、') : '議席数の変化なし'}`;
}

function updateScenario(mutator: (draft: ScenarioState) => void, options: {refreshState?:boolean;focusSelector?:string;changeLabel?:string} = {}) {
  const beforeCounts = scenarioCounts(scenarioState);
  previousScenarioState = cloneScenario(scenarioState);
  const draft = cloneScenario(scenarioState);
  mutator(draft);
  scenarioState = touchScenario(draft);
  sharedScenarioPending = false;
  openedFromShare = false;
  syncScenarioInputs();
  const afterCounts = scenarioCounts(scenarioState);
  if (options.changeLabel || JSON.stringify(beforeCounts) !== JSON.stringify(afterCounts)) {
    scenarioLastChange = scenarioChangeText(options.changeLabel ?? '上院の仮定を更新',beforeCounts,afterCounts);
  }
  scheduleScenarioSave();
  renderSim();
  renderHouseSim();
  renderTargetSim();
  renderScenarioManager();
  renderStateCompare();
  if (options.refreshState && selected) selectState(selected,undefined,{focus:false,scroll:false,preserveReturn:true});
  if (options.focusSelector) requestAnimationFrame(() => document.querySelector<HTMLElement>(options.focusSelector!)?.focus());
}

function setSenateChoice(seatId: string, encoded: string) {
  const election = elections.find(item => item.seatId === seatId);
  if (!election) return;
  const state = stateByFips.get(seatById.get(seatId)!.stateFips)!;
  const choiceText = encoded === 'baseline' ? '初期配分へ戻す'
    : encoded === 'unassigned' ? '未配分へ変更'
    : encoded.startsWith('candidate:') ? `${election.candidates.find(candidate => candidate.candidateId === encoded.slice('candidate:'.length))?.name ?? '候補者'}を選択`
    : `${caucusLabel[encoded.slice('caucus:'.length) as SenateOutcome] ?? '会派'}へ配分`;
  updateScenario(draft => {
    if (encoded === 'baseline') delete draft.senate[seatId];
    else if (encoded === 'unassigned') draft.senate[seatId] = {kind:'unassigned',electionId:election.electionId};
    else if (encoded.startsWith('candidate:')) {
      const candidateId = encoded.slice('candidate:'.length);
      if (election.candidates.some(candidate => candidate.candidateId === candidateId)) draft.senate[seatId] = {kind:'candidate',electionId:election.electionId,candidateId};
    } else if (encoded.startsWith('caucus:')) {
      const caucus = encoded.slice('caucus:'.length) as Caucus;
      if (caucus in caucusLabel) draft.senate[seatId] = {kind:'caucus',electionId:election.electionId,caucus};
    }
    draft.unlockedSeatIds = draft.unlockedSeatIds.filter(id => id !== seatId);
  },{refreshState:true,focusSelector:`[data-senate-choice="${seatId}"]`,changeLabel:`${state.nameJa}を${choiceText}`});
}

function currentScenarioChoiceValue(election: Election) {
  const choice = scenarioState.senate[election.seatId];
  if (!choice) return 'baseline';
  if (choice.kind === 'unassigned') return 'unassigned';
  return choice.kind === 'candidate' ? `candidate:${choice.candidateId}` : `caucus:${choice.caucus}`;
}

function senateChoiceOptions(election: Election) {
  const value = currentScenarioChoiceValue(election);
  const baseline = scenarioState.senateBaseline.outcomes[election.seatId] ?? 'unassigned';
  const category = ratingConsensus.find(item => item.seatId === election.seatId)?.category ?? 'missing';
  const reason = baseline === 'unassigned' ? `（${ratingCategoryLabel(category)}）` : '';
  const candidateOptions = election.candidates.map(candidate => {
    const stage = candidate.ballotStage === 'write-in' ? '・記名投票候補' : candidate.ballotStage === 'primary-ballot' ? '・予備選段階' : '';
    return `<option value="candidate:${escapeHtml(candidate.candidateId)}" ${value === `candidate:${candidate.candidateId}` ? 'selected' : ''}>${escapeHtml(candidate.name)}（${escapeHtml(candidate.partyLabel)}${stage}）</option>`;
  }).join('');
  return `<option value="baseline" ${value === 'baseline' ? 'selected' : ''}>初期値：${outcomeLabel[baseline]}${reason}</option><option value="unassigned" ${value === 'unassigned' ? 'selected' : ''}>未配分にする</option><optgroup label="候補者が当選"><!-- official roster order -->${candidateOptions}</optgroup><optgroup label="会派のみ指定"><option value="caucus:Democratic" ${value === 'caucus:Democratic' ? 'selected' : ''}>民主党会派</option><option value="caucus:Republican" ${value === 'caucus:Republican' ? 'selected' : ''}>共和党会派</option><option value="caucus:none" ${value === 'caucus:none' ? 'selected' : ''}>会派非所属</option><option value="caucus:unconfirmed" ${value === 'caucus:unconfirmed' ? 'selected' : ''}>会派未確認</option></optgroup>`;
}

function bindSenateChoiceControls(root: ParentNode = document) {
  root.querySelectorAll<HTMLSelectElement>('[data-senate-choice]').forEach(element => element.onchange = () => setSenateChoice(element.dataset.senateChoice!,element.value));
  root.querySelectorAll<HTMLButtonElement>('[data-candidate-choice]').forEach(button => button.onclick = () => setSenateChoice(button.dataset.seat!,`candidate:${button.dataset.candidateChoice}`));
}

function scenarioCounts(state: ScenarioState) {
  return countScenarioSenate(state,seats,elections);
}

function undoScenario() {
  if (!previousScenarioState) return;
  const beforeCounts = scenarioCounts(scenarioState);
  const restore = cloneScenario(previousScenarioState);
  previousScenarioState = cloneScenario(scenarioState);
  scenarioState = touchScenario(restore);
  syncScenarioInputs();
  scenarioLastChange = scenarioChangeText('直前の変更を取り消し',beforeCounts,scenarioCounts(scenarioState));
  scheduleScenarioSave();
  renderSim(); renderHouseSim(); renderTargetSim(); renderScenarioManager(); renderStateCompare();
  if (selected) selectState(selected,undefined,{focus:false,scroll:false,preserveReturn:true});
}

function renderScenarioManager() {
  const host = document.querySelector<HTMLElement>('#scenario-manager');
  if (!host) return;
  const selectedForCompare = new Set(comparedScenarioIds);
  const compared = savedScenarios.filter(item => selectedForCompare.has(item.id));
  const compareMarkup = compared.length >= 2 ? `<div class="saved-comparison"><h4>保存案の比較</h4>${compared.map(item => { const senateCounts = scenarioCounts(item.state); const houseCounts = simulatedHouseCounts(houseDistricts,item.state.house); return `<article><b>${escapeHtml(item.name)}</b><span>上院 D${senateCounts.Democratic} / R${senateCounts.Republican} / 未配分${senateCounts.unassigned}</span><span>下院 D${houseCounts.Democratic} / R${houseCounts.Republican} / 未確定${houseCounts.unconfirmed}</span><small>${item.state.senateBaseline.kind === 'rating-consensus' ? `暫定配分 ${item.state.senateBaseline.asOf}` : `現保有基準 ${item.state.senateBaseline.asOf}`}／明示した上院仮定 ${Object.keys(item.state.senate).length}件</small></article>`; }).join('')}</div>` : '';
  host.innerHTML = `<div class="scenario-manager-head"><div><p class="kicker">SAVE & COMPARE</p><h3>仮定を保存・比較する</h3><p>自動保存はこのブラウザ内です。名前付き保存は最大${SAVED_SCENARIO_LIMIT}件、比較は3件までです。</p></div><div class="scenario-actions"><button type="button" data-undo-scenario ${previousScenarioState ? '' : 'disabled'}>直前に戻す</button><button type="button" data-share-scenario>URLを共有</button></div></div>
    ${sharedScenarioPending ? '<div class="shared-pending"><b>共有された案を確認中</b><span>既存の作業案はまだ上書きしていません。</span><button type="button" data-accept-shared>この案を作業案にする</button></div>' : ''}
    <div class="scenario-save-row"><label>案の名前<input id="scenario-name" maxlength="40" placeholder="例：民主党51議席案"></label><button type="button" data-save-scenario ${savedScenarios.length >= SAVED_SCENARIO_LIMIT ? 'disabled' : ''}>別の案として保存</button></div>
    <div class="saved-list">${savedScenarios.length ? savedScenarios.map(item => `<article><label class="compare-check"><input type="checkbox" data-compare-scenario="${escapeHtml(item.id)}" ${selectedForCompare.has(item.id) ? 'checked' : ''}><span>比較</span></label><div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.savedAt.slice(0,16).replace('T',' '))}／基準版 ${escapeHtml(item.state.baselineVersion)}</small></div><button type="button" data-load-scenario="${escapeHtml(item.id)}">開く</button><button type="button" data-delete-scenario="${escapeHtml(item.id)}">削除</button></article>`).join('') : '<p>名前付きの保存案はまだありません。</p>'}</div>${compareMarkup}<p id="scenario-action-status" class="scenario-action-status" aria-live="polite"></p>`;
  host.querySelector<HTMLButtonElement>('[data-undo-scenario]')?.addEventListener('click',undoScenario);
  host.querySelector<HTMLButtonElement>('[data-accept-shared]')?.addEventListener('click',() => {
    sharedScenarioPending = false;
    openedFromShare = false;
    scheduleScenarioSave();
    renderScenarioManager();
    addScenarioNotice('共有された案をこのブラウザの作業案にしました。');
  });
  host.querySelector<HTMLButtonElement>('[data-save-scenario]')?.addEventListener('click',() => {
    if (savedScenarios.length >= SAVED_SCENARIO_LIMIT) return;
    const name = host.querySelector<HTMLInputElement>('#scenario-name')?.value ?? '';
    savedScenarios = [...savedScenarios,createSavedScenario(name,scenarioState)];
    const result = persistSavedScenarios(window.localStorage,savedScenarios);
    if (!result.ok && result.message) addScenarioNotice(result.message);
    renderScenarioManager();
  });
  host.querySelectorAll<HTMLButtonElement>('[data-load-scenario]').forEach(button => button.addEventListener('click',() => {
    const saved = savedScenarios.find(item => item.id === button.dataset.loadScenario);
    if (!saved) return;
    const beforeCounts = scenarioCounts(scenarioState);
    previousScenarioState = cloneScenario(scenarioState);
    scenarioState = touchScenario(cloneScenario(saved.state));
    scenarioLastChange = scenarioChangeText(`保存案「${saved.name}」を開く`,beforeCounts,scenarioCounts(scenarioState));
    sharedScenarioPending = false;
    syncScenarioInputs(); scheduleScenarioSave();
    renderSim(); renderHouseSim(); renderTargetSim(); renderScenarioManager(); renderStateCompare();
    if (selected) selectState(selected,undefined,{focus:false,scroll:false,preserveReturn:true});
    addScenarioNotice(`保存案「${saved.name}」を開きました。`);
  }));
  host.querySelectorAll<HTMLButtonElement>('[data-delete-scenario]').forEach(button => button.addEventListener('click',() => {
    savedScenarios = savedScenarios.filter(item => item.id !== button.dataset.deleteScenario);
    comparedScenarioIds = comparedScenarioIds.filter(id => id !== button.dataset.deleteScenario);
    const result = persistSavedScenarios(window.localStorage,savedScenarios);
    if (!result.ok && result.message) addScenarioNotice(result.message);
    renderScenarioManager();
  }));
  host.querySelectorAll<HTMLInputElement>('[data-compare-scenario]').forEach(input => input.addEventListener('change',() => {
    const id = input.dataset.compareScenario!;
    if (input.checked && comparedScenarioIds.length < 3) comparedScenarioIds = [...comparedScenarioIds,id];
    else if (!input.checked) comparedScenarioIds = comparedScenarioIds.filter(value => value !== id);
    else addScenarioNotice('同時に比較できる保存案は3件までです。');
    renderScenarioManager();
  }));
  host.querySelector<HTMLButtonElement>('[data-share-scenario]')?.addEventListener('click',async () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('refresh');
    url.searchParams.set('s',encodeScenario(scenarioState));
    const selectedElection=selected ? electionByState(selected)[0] : undefined;
    if (selectedElection) url.searchParams.set('race',selectedElection.electionId);
    const status = host.querySelector<HTMLElement>('#scenario-action-status')!;
    if (url.toString().length > 8192) {
      status.textContent = '共有URLが長すぎます。仮定を減らしてから再度お試しください。';
      return;
    }
    try {
      await navigator.clipboard.writeText(url.toString());
      status.textContent = '共有URLをコピーしました。';
    } catch {
      status.innerHTML = `<label>共有URL<input readonly value="${escapeHtml(url.toString())}"></label>`;
      status.querySelector<HTMLInputElement>('input')?.select();
    }
  });
}

function renderStateCompare() {
  const host = document.querySelector<HTMLElement>('#state-compare');
  if (!host) return;
  const selectedStates = compareStateFips.map(fips => stateByFips.get(fips)).filter((state): state is State => Boolean(state));
  host.innerHTML = `<div class="state-compare-head"><div><p class="kicker">COMPARE RACES</p><h3>州・候補者を比較</h3><p>州詳細の「比較に追加」から2〜3州を並べます。異なる調査の数字は平均しません。</p></div>${selectedStates.length ? '<button type="button" data-clear-state-compare>比較をクリア</button>' : ''}</div>${selectedStates.length ? `<div class="state-compare-grid">${selectedStates.map(state => {
    const stateElections = electionByState(state);
    const election = stateElections[0];
    if (!election) return `<article><button type="button" data-remove-compare="${state.fips}">×</button><h4>${state.nameJa}</h4><p>2026年の上院選はありません。</p></article>`;
    const brief = getRaceBrief(raceBriefs,election.electionId);
    const featured = getFeaturedCandidates(election.candidates,null,new Set(candidateBriefs.map(item => item.candidateId))).slice(0,3);
    return `<article><button type="button" class="compare-remove" data-remove-compare="${state.fips}" aria-label="${state.nameJa}を比較から外す">×</button><h4>${state.nameJa}</h4><div class="rating-badge"><span>${displayRatingLabel(election)}</span><small>2機関の統合評価・${RATING_SNAPSHOT_AS_OF}集計</small></div><p>${escapeHtml(observationFor(election.electionId)?.featuredSummary ?? brief?.summary ?? election.electionRelevance)}</p><dl><div><dt>主要候補</dt><dd>${featured.map(candidate => escapeHtml(candidate.name)).join('／')}</dd></div><div><dt>主な論点</dt><dd>${brief ? brief.keyIssues.slice(0,3).map(escapeHtml).join('／') : '詳細資料を確認中'}</dd></div></dl><label>この候補が当選すると仮定<select data-senate-choice="${election.seatId}">${senateChoiceOptions(election)}</select></label></article>`;
  }).join('')}</div>` : '<p class="compare-empty">比較する州はまだ選ばれていません。</p>'}`;
  host.querySelector<HTMLButtonElement>('[data-clear-state-compare]')?.addEventListener('click',() => { compareStateFips = []; renderStateCompare(); });
  host.querySelectorAll<HTMLButtonElement>('[data-remove-compare]').forEach(button => button.addEventListener('click',() => { compareStateFips = compareStateFips.filter(fips => fips !== button.dataset.removeCompare); renderStateCompare(); }));
  bindSenateChoiceControls(host);
}

function targetDifficultyLabel(path: SenatePath) {
  const entries = Object.entries(path.difficulty);
  return entries.length ? entries.map(([rating,count]) => `${rating} ${count}議席`).join('／') : '追加獲得なし';
}

function renderTargetSim() {
  const host = document.querySelector<HTMLElement>('#target-sim-panel');
  if (!host) return;
  host.hidden = !targetPanelOpen;
  if (!targetPanelOpen) return;
  const target = powerTargets.find(item => item.targetId === targetActionId) ?? powerTargets[0];
  const rule = powerRules.find(item => item.powerId === target.powerId)!;
  const senatePaths = generateSenatePaths({seats,elections,scenario:scenarioState,caucus:targetParty,threshold:target.senateThreshold,limit:3,ratings:displayRatings});
  const houseCounts = simulatedHouseCounts(houseDistricts,houseAssumptions);
  const targetHouseCount = targetParty === 'Democratic' ? houseCounts.Democratic : houseCounts.Republican;
  const houseShortage = target.houseThreshold === null ? null : Math.max(0,target.houseThreshold - targetHouseCount);
  const caucusText = targetParty === 'Democratic' ? '民主党会派' : '共和党会派';
  const pathStatus = senatePaths.status === 'no-senate-condition'
    ? '<p class="path-status neutral">この手続には上院の数値条件がありません。下院の条件を確認してください。</p>'
    : senatePaths.status === 'already-reached'
      ? `<p class="path-status reached">現在の仮定で、上院${senatePaths.targetSeats}議席の目安を満たしています。追加の州を選ぶ必要はありません。</p>`
      : senatePaths.status === 'locked-impossible'
        ? '<p class="path-status blocked">現在固定している仮定のままでは到達できません。固定を解除すると別の経路を検討できます。</p><button type="button" data-unlock-path>手動仮定を経路候補に含める</button>'
        : senatePaths.status === 'election-impossible'
          ? '<p class="path-status blocked">非改選議席と今回の上院選だけでは到達できません。他会派からの賛成票が必要です。</p>'
          : `<p class="path-status">現在の仮定から上院であと<strong>${senatePaths.shortage}議席</strong>。非改選${senatePaths.fixedSeats}議席と合わせ、今回35議席のうち${senatePaths.requiredContestedSeats}議席が必要です。</p>`;
  const pathsMarkup = senatePaths.paths.length ? `<div class="path-list"><h4>目標へ届く経路例</h4><p>採用中の情勢分類を使った例です。同じ分類内は勝ちやすさ順ではありません。勝率は計算していません。</p>${senatePaths.paths.map((path,index) => {
    const added = path.addedSeatIds.map(seatId => {
      const election = elections.find(item => item.seatId === seatId)!;
      const state = stateByFips.get(seatById.get(seatId)!.stateFips)!;
      const brief = getRaceBrief(raceBriefs,election.electionId);
      return `<li><button type="button" data-path-state="${state.fips}"><b>${state.nameJa}</b><span>${displayRatingLabel(election)}</span></button>${brief ? `<small>${escapeHtml(brief.balance)}</small>` : '<small>州別の詳しい根拠は確認中</small>'}</li>`;
    }).join('');
    return `<article class="path-card ${targetPreviewPathId === path.pathId ? 'previewing' : ''}"><header><span>経路例 ${index + 1}</span><b>${targetDifficultyLabel(path)}</b></header><ul>${added}</ul><p>この例では、上記の追加議席に加え、現在${caucusText}として数えている接戦議席の維持を前提にします。</p><button type="button" data-preview-path="${path.pathId}" aria-pressed="${targetPreviewPathId === path.pathId}">この経路をプレビュー</button></article>`;
  }).join('')}</div>` : '';
  const previewPath = senatePaths.paths.find(path => path.pathId === targetPreviewPathId) ?? null;
  const previewMarkup = previewPath ? `<section class="path-preview" tabindex="-1"><p class="kicker">PREVIEW</p><h4>適用前の確認</h4><p>${previewPath.addedSeatIds.map(seatId => stateByFips.get(seatById.get(seatId)!.stateFips)!.nameJa).join('、')}を${caucusText}として仮定します。適用後は直前に戻せます。</p><div><button type="button" data-confirm-path="${previewPath.pathId}">この経路を適用</button><button type="button" data-cancel-path>取り消す</button></div></section>` : '';
  const senateLine = target.senateThreshold === null ? '上院：数値条件なし' : `上院：全員が選出・出席する例では${target.senateThreshold}議席`;
  const houseLine = target.houseThreshold === null ? '下院：この手続の数値条件なし' : `下院：全員が投票する例では${target.houseThreshold}議席。現在の仮定は${targetHouseCount}、${houseShortage ? `あと${houseShortage}` : '目安を満たす'}`;
  host.innerHTML = `<div class="target-grid"><div class="target-controls"><p class="kicker">REVERSE PATH</p><h3>権限から必要な議席を逆算</h3><p>制度上の目安と、現在操作中の仮定をつなげます。</p><label class="target-field">手続<select id="target-power">${powerTargets.map(item => `<option value="${item.targetId}" ${item.targetId === target.targetId ? 'selected' : ''}>${item.label}</option>`).join('')}</select></label><label class="target-field">想定する会派<select id="target-party"><option value="Democratic" ${targetParty === 'Democratic' ? 'selected' : ''}>民主党会派</option><option value="Republican" ${targetParty === 'Republican' ? 'selected' : ''}>共和党会派</option></select></label></div><div class="target-rule"><h3>${target.label}</h3><p>${target.requirement}</p><div class="target-thresholds"><p>${senateLine}</p><p>${houseLine}</p></div><p class="target-caution">${target.caution}</p>${pathStatus}${pathsMarkup}${previewMarkup}<p class="target-scope">上院の経路のみ自動生成します。議席は個別議員の賛成票や権限行使の成功を保証しません。</p><button type="button" class="target-manual-button">全35議席の手動仮定を開く</button></div></div>`;
  host.querySelector<HTMLSelectElement>('#target-power')!.onchange = event => {
    targetActionId = (event.target as HTMLSelectElement).value;
    targetPreviewPathId = null;
    updateScenario(draft => { draft.target = {targetId:targetActionId,caucus:targetParty}; });
  };
  host.querySelector<HTMLSelectElement>('#target-party')!.onchange = event => {
    targetParty = (event.target as HTMLSelectElement).value as typeof targetParty;
    targetPreviewPathId = null;
    updateScenario(draft => { draft.target = {targetId:targetActionId,caucus:targetParty}; });
  };
  host.querySelector<HTMLButtonElement>('[data-unlock-path]')?.addEventListener('click',() => updateScenario(draft => {
    draft.unlockedSeatIds = Object.keys(draft.senate);
  }));
  host.querySelectorAll<HTMLButtonElement>('[data-path-state]').forEach(button => button.addEventListener('click',() => {
    const state = stateByFips.get(button.dataset.pathState ?? '');
    if (!state) return;
    document.querySelector<HTMLSelectElement>('#state-search')!.value = state.fips;
    selectState(state,button);
  }));
  host.querySelectorAll<HTMLButtonElement>('[data-preview-path]').forEach(button => button.addEventListener('click',() => {
    targetPreviewPathId = button.dataset.previewPath ?? null;
    renderTargetSim();
    document.querySelector<HTMLElement>('.path-preview')?.focus({preventScroll:true});
  }));
  host.querySelector<HTMLButtonElement>('[data-cancel-path]')?.addEventListener('click',() => {
    targetPreviewPathId = null;
    renderTargetSim();
  });
  host.querySelector<HTMLButtonElement>('[data-confirm-path]')?.addEventListener('click',event => {
    const path = senatePaths.paths.find(item => item.pathId === (event.currentTarget as HTMLButtonElement).dataset.confirmPath);
    if (!path) return;
    const preview = path.addedSeatIds.map(seatId => stateByFips.get(seatById.get(seatId)!.stateFips)!.nameJa).join('、');
    targetPreviewPathId = null;
    updateScenario(draft => {
      for (const seatId of path.addedSeatIds) {
        const election = elections.find(item => item.seatId === seatId)!;
        draft.senate[seatId] = {kind:'caucus',electionId:election.electionId,caucus:targetParty};
        draft.unlockedSeatIds = draft.unlockedSeatIds.filter(id => id !== seatId);
      }
    },{refreshState:true});
    addScenarioNotice(`経路例を適用しました：${preview}`);
  });
  host.querySelector<HTMLButtonElement>('.target-manual-button')!.onclick = () => {
    const details = document.querySelector<HTMLDetailsElement>('#seat-controls')?.closest('details');
    if (details) details.open = true;
    document.querySelector('#seat-controls')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  };
  const sourceIds = new Set(rule.sourceIds);
  if (!host.querySelector('.target-sources')) {
    const sourcesElement = document.createElement('details');
    sourcesElement.className = 'target-sources source-panel';
    sourcesElement.innerHTML = `<summary>この条件の制度上の出典</summary>${refs([...sourceIds])}`;
    host.querySelector('.target-rule')?.append(sourcesElement);
  }
}

function setTargetPanel(open: boolean) {
  targetPanelOpen = open;
  document.querySelectorAll<HTMLButtonElement>('[data-target-toggle]').forEach(button => {
    button.classList.toggle('active',open);
    button.setAttribute('aria-expanded',String(open));
    button.textContent = open ? '権限から逆算を閉じる' : '権限から逆算を開く';
  });
  renderTargetSim();
}

function setMapMode(next: Mode) {
  mode = next;
  if (next === 'current') competitive = false;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mode === mode)));
  const competitiveInput = document.querySelector<HTMLInputElement>('#competitive');
  if (competitiveInput) {
    competitiveInput.disabled = mode === 'current' || !hasRatings;
    competitiveInput.checked = competitive;
  }
  const note = document.querySelector<HTMLElement>('#mode-note');
  if (note) note.textContent = mode === 'current' ? `色は投票前の現職会派（${DATA_AS_OF}確認）。選挙情勢や当選確率ではない。` : consensusMapNote;
  const heading = document.querySelector<HTMLElement>('#map-heading');
  if (heading) heading.textContent = mode === 'current' ? '投票前の上院議席構成' : '2026年の上院選挙情勢';
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
  const ratings = [...new Set(stateElections.map(election => displayRatingFor(election)))];
  return ratings.length === 1 ? ratings[0] : 'mixed';
}
function isCompetitive(state: State) { return electionByState(state).some(election => ['Toss Up','Lean D','Lean R'].includes(displayRatingFor(election))); }
function fill(state: State) {
  if (mode === 'current') return ({Democratic:'#2166ac',Republican:'#b52b35',none:'#ececea',mixed:'#725f4c',vacant:'#f2c14e',unconfirmed:'#b8b7b3'} as Record<string,string>)[caucusForState(state)];
  const rating = ratingFor(state);
  return rating === 'none' ? '#ececea' : rating === 'mixed' ? '#725f4c' : ratingColors[rating];
}
function renderCounts() {
  const counts = currentCaucusCounts(seats);
  const unresolved = counts.none + counts.unconfirmed + counts.vacant;
  const host = document.querySelector<HTMLElement>('#current-counts');
  if (host) host.innerHTML = `<div class="count dem"><strong>${counts.Democratic}</strong><span>民主党会派</span></div><div class="bar" aria-hidden="true"><i style="width:${counts.Democratic}%"></i><i style="width:${counts.Republican}%"></i></div><div class="count rep"><strong>${counts.Republican}</strong><span>共和党会派</span></div>${unresolved ? `<div class="count"><strong>${unresolved}</strong><span>その他・未確認・空席</span></div>` : ''}`;
}

async function initMap() {
  const topology = await fetch(`${import.meta.env.BASE_URL}data/states-10m.json`).then(response => response.json()) as Topology;
  const collection = feature(topology,topology.objects.states) as unknown as FeatureCollection;
  geoFeatures = collection.features.filter(item => stateByFips.has(String(item.id).padStart(2,'0')));
  renderMap();
  renderFocusLocator();
  if (overlayKind === 'news' && overlayNewsId) {
    const feedKey=resolveFeedKey(overlayNewsId,newsItems,observationData);
    const activeNews = feedKey?.startsWith('news:') ? publishedNewsItems.find(item => item.newsId === feedKey.slice(5)) : undefined;
    if (activeNews) renderNewsMiniMap(activeNews);
  }
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
    const currentValue = caucusForState(state);
    const mapValue = mode === 'rating'
      ? `統合評価 ${ratingFor(state) === 'none' ? '選挙なし' : ratingFor(state) === 'mixed' ? '複数議席で分類が異なる' : ratingFor(state) === 'Toss Up' ? consensusTossupLabel : ratingFor(state)}`
      : `投票前の会派 ${currentValue === 'mixed' ? '州内で異なる' : currentValue === 'none' ? '情報なし' : caucusLabel[currentValue]}`;
    statePath.setAttribute('aria-label',`${state.nameJa}、${mapValue}、${electionByState(state).length ? '2026年選挙あり' : '2026年選挙なし'}${hasSpecial ? '、特別選挙あり' : ''}${selected?.fips === fips ? '、選択中' : ''}`);
    statePath.setAttribute('aria-pressed',String(selected?.fips === fips));
    statePath.addEventListener('click',event => selectState(state,event.currentTarget as HTMLElement));
    statePath.addEventListener('keydown',event => { const key = (event as KeyboardEvent).key; if (key === 'Enter' || key === ' ') { event.preventDefault(); selectState(state,event.currentTarget as HTMLElement); } });
    const title = document.createElementNS(svg.namespaceURI,'title'); title.textContent = `${state.nameJa} (${state.abbr})・${mapValue}${hasSpecial ? '・特別選挙あり' : ''}`; statePath.append(title); svg.append(statePath);
    if (hasSpecial) {
      const [x,y] = path.centroid(item);
      const star = document.createElementNS(svg.namespaceURI,'text'); star.textContent = '★'; star.setAttribute('x',String(x)); star.setAttribute('y',String(y)); star.setAttribute('class','special-star'); star.setAttribute('aria-hidden','true'); svg.append(star);
    }
  });
  host.append(svg);
  const heading = document.querySelector<HTMLElement>('#map-heading');
  if (heading) heading.textContent = mode === 'current' ? '投票前の上院議席構成' : '2026年の上院選挙情勢';
  const note = document.querySelector<HTMLElement>('#mode-note');
  if (note) note.textContent = mode === 'current' ? `色は投票前の現職会派（${DATA_AS_OF}確認）。選挙情勢や当選確率ではない。` : consensusMapNote;
  renderLegend();
}
function renderLegend() {
  const items = mode === 'current'
    ? [['#2166ac','民主党会派'],['#b52b35','共和党会派'],['#725f4c','州内で会派が分かれる'],['#b8b7b3','未確認'],['transparent','★ 特別選挙']]
    : [['#174f9e','Solid D'],['#4d80bd','Likely D'],['#93b7dc','Lean D'],['#8a8178',consensusTossupLabel],['#e59a9a','Lean R'],['#cf5a5a','Likely R'],['#a5262e','Solid R'],['#d9d8d4','未取得'],['#ececea','選挙なし'],['transparent','★ 特別選挙']];
  const annotation = mode === 'current' ? '' : '<div class="rating-annotation"><b>情勢分類の読み方</b><span><strong>Solid</strong>＝ほぼ安全、<strong>Likely</strong>＝優勢、<strong>Lean</strong>＝やや優勢、<strong>Toss Up</strong>＝接戦・評価分裂。方向は2機関の一致、濃淡はSabatoの分類。世論調査の平均や勝率ではありません。</span></div>';
  document.querySelector('#legend')!.innerHTML = items.map(([color,label]) => `<span>${label.startsWith('★') ? '<b aria-hidden="true">★</b>' : `<i style="background:${color}"></i>`}${label}</span>`).join('') + annotation;
}
function refs(ids: string[]) {
  const list = [...new Set(ids)].map(id => sourceById.get(id)).filter(Boolean);
  return list.length ? `<ol>${list.map(source => `<li><a href="${source!.url}" target="_blank" rel="noreferrer">${source!.title}</a> — ${source!.publisher}<br><small>対象：${source!.referencePeriod}${source!.publishedAt ? `／公開：${source!.publishedAt}` : ''}${source!.updatedAt ? `／資料更新：${source!.updatedAt}` : ''}／取得：${source!.retrievedAt ?? '未取得'}／内容確認：${source!.contentVerifiedAt ?? '未完了'}</small></li>`).join('')}</ol>` : '<p>この項目に紐づく出典は未登録です。</p>';
}
const evidenceLabels: Record<string,string> = {incumbent:'現職氏名',party:'党籍',caucus:'会派',vacant:'空席の有無',senateClass:'Class',termStart:'任期の開始・就任規定',termEnd:'任期の終了',seatId:'対象議席',type:'通常／特別の区分',date:'投票日',name:'氏名'};
function attributeRefs(attributes: Partial<Record<string,string[]>>) {
  return `<details class="attribute-evidence"><summary>確認項目と出典</summary><ul>${Object.entries(attributes).map(([field,ids]) => `<li><b>${evidenceLabels[field] ?? field}</b>：${(ids ?? []).map(id => { const source = sourceById.get(id); return source ? `<a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a>` : '出典未登録'; }).join('、')}</li>`).join('')}</ul></details>`;
}

function presidentialShareMarkup(context: typeof stateContexts[number]) {
  const result = presidentialResultByFips.get(context.stateFips);
  const shares = result ? twoPartyResultShares(result) ?? context.presidentialTwoPartyShares2024 : context.presidentialTwoPartyShares2024;
  const votes = result ? `<span>（Harris ${result.candidates.find(candidate => candidate.party === 'D')!.votes.toLocaleString('ja-JP')}票／Trump ${result.candidates.find(candidate => candidate.party === 'R')!.votes.toLocaleString('ja-JP')}票）</span>` : '';
  return `<div class="presidential-share" role="img" aria-label="2024年大統領選の二大政党票。民主党${shares.D.toFixed(1)}%、共和党${shares.R.toFixed(1)}%"><div class="share-labels"><span class="share-d">民主党 ${shares.D.toFixed(1)}%</span><span class="share-r">共和党 ${shares.R.toFixed(1)}%</span></div><div class="share-track"><i class="share-d" style="width:${shares.D.toFixed(1)}%"></i><i class="share-r" style="width:${shares.R.toFixed(1)}%"></i></div><small>2024年大統領選・FEC確定票の二大候補を100%に正規化 ${votes}</small></div>`;
}

function stateMetricsMarkup(context: typeof stateContexts[number], stateElections: Election[]) {
  const populationChange = `${context.populationChange2020to2025 >= 0 ? '+' : ''}${context.populationChange2020to2025.toFixed(1)}%`;
  const raceText = stateElections.length ? stateElections.map(election => `${election.type === 'special' ? '特別' : '通常'}・${displayRatingFor(election)}`).join('／') : '上院選なし';
  const isNotableSoy = stateElections.length > 0 && context.soybeanProduction2026 !== null && context.soybeanRank2026 !== null && context.soybeanRank2026 <= 10;
  const notableRow = isNotableSoy
    ? `<tr><th>特筆すべき指標</th><td>${context.soybeanProduction2026!.toLocaleString('en-US')}千bu（全米${context.soybeanRank2026}位）<small class="metric-note">bu＝ブッシェル。千buは1,000ブッシェル単位です。</small></td></tr>`
    : '';
  return `<div class="state-metrics"><table><tbody><tr><th>2025年人口</th><td>${context.population2025.toLocaleString('en-US')}人</td></tr><tr><th>人口変化（2020→2025）</th><td>${populationChange}</td></tr><tr><th>民間GDP最大部門</th><td>${context.topPrivateIndustry2025}（民間GDPの${context.topPrivateIndustryShare2025.toFixed(1)}%）</td></tr>${notableRow}<tr><th>2026年上院選</th><td>${raceText}</td></tr></tbody></table></div>`;
}

function candidateResearchMarkup(candidate: Election['candidates'][number]) {
  const brief = getCandidateBrief(candidateBriefs,candidate.candidateId);
  return brief ? candidateBriefMarkup(brief) + refs(brief.sourceIds) : '';
}

const candidateNameKey = (value: string|null) => (value ?? '')
  .toLowerCase()
  .replace(/\b(jr|sr|ii|iii|iv)\b\.?/g,'')
  .split(/[^a-z]+/)
  .filter(token => token.length > 1)
  .join('-');

function candidateCardMarkup(candidate: Election['candidates'][number], seat: Seat, election: Election) {
  const brief = getCandidateBrief(candidateBriefs,candidate.candidateId);
  const incumbent = candidateNameKey(candidate.name) === candidateNameKey(seat.incumbent);
  const currentChoice = scenarioState.senate[seat.seatId];
  const selectedCandidate = currentChoice?.kind === 'candidate' && currentChoice.candidateId === candidate.candidateId;
  const shortPolicy = brief ? `<p class="candidate-short">${escapeHtml(brief.summary)}</p>${brief.currentPositions[0] ? `<small class="candidate-position"><b>注視する立場：</b>${escapeHtml(brief.currentPositions[0])}</small>` : ''}${brief.opposedPolicies[0] ? `<small class="candidate-position opposed"><b>明確に反対：</b>${escapeHtml(brief.opposedPolicies[0])}</small>` : ''}` : '';
  const research = brief
    ? `<details class="candidate-details"><summary>政策・実績・相違点を見る</summary>${candidateResearchMarkup(candidate)}</details>`
    : '<small class="candidate-research-pending">政策資料は確認後に追加します。</small>';
  const stage = candidate.ballotStage === 'write-in' ? '・記名投票候補' : candidate.ballotStage === 'primary-ballot' ? '・予備選段階' : '';
  return `<article class="candidate-card ${selectedCandidate ? 'selected-candidate' : ''}"><header><i class="party-dot party-${candidate.party}"></i><span><b>${escapeHtml(candidate.name)}</b><small>${escapeHtml(candidate.partyLabel)}${stage}</small></span>${incumbent ? '<em class="incumbent-badge">現職</em>' : ''}</header>${shortPolicy}<button type="button" class="candidate-choice-button" data-candidate-choice="${candidate.candidateId}" data-seat="${seat.seatId}" data-election="${election.electionId}" aria-pressed="${selectedCandidate}">${selectedCandidate ? '当選する仮定に選択中' : 'この候補が当選すると仮定'}</button>${research}</article>`;
}

function relatedNewsMarkup(election: Election) {
  const related = getPublishedNewsForElection(newsItems,election.electionId).slice(0,4);
  if (!related.length) return '';
  return `<section class="state-related-news"><h4>関連ニュース</h4>${related.map(item => `<button type="button" data-related-news="${escapeHtml(item.newsId)}"><time>${escapeHtml(item.eventDate ?? item.publishedAt)}</time><span>${escapeHtml(item.headline)}</span></button>`).join('')}</section>`;
}

function raceResearchMarkup(election: Election) {
  const brief = getRaceBrief(raceBriefs,election.electionId);
  if (!brief) return `<p class="race-relevance">${election.electionRelevance}</p>`;
  const electionPolls = getPublishedPolls(polls,election.electionId);
  const comparisons = getRatingComparisons(ratingObservations,election.electionId);
  const links = brief.relatedIssueIds.length ? `<nav class="race-research-links" aria-label="関連する論点">${brief.relatedIssueIds.map(issueId => {
    const issue = issueCategories.find(item => item.issueId === issueId);
    return issue ? `<button type="button" data-race-issue="${issueId}">${issue.label}</button>` : '';
  }).join('')}</nav>` : '';
  return raceBriefMarkup(brief) + pollsMarkup(electionPolls) + ratingsMarkup(comparisons) + links + refs(brief.sourceIds);
}

function raceLeadMarkup(election: Election) {
  const brief = getRaceBrief(raceBriefs,election.electionId);
  if (!brief) return `<div class="race-lead"><p>${escapeHtml(election.electionRelevance)}</p><small>詳しい州別調査は確認後に追加します。</small></div>`;
  return `<div class="race-lead"><h4>${escapeHtml(brief.headline)}</h4><p>${escapeHtml(brief.summary)}</p><div><b>均衡度</b><span>${escapeHtml(brief.balance)}</span></div><div><b>主な論点</b><span>${brief.keyIssues.slice(0,3).map(escapeHtml).join('／')}</span></div><small>州別調査 更新 ${escapeHtml(brief.updatedAt)}</small></div>`;
}

function seatCard(seat: Seat, stateElections: Election[]) {
  const specialElection = stateElections.find(election => election.seatId === seat.seatId && election.type === 'special');
  const year = (date: string|null) => date ? date.slice(0,4) : '未確認';
  const specialText = specialElection ? `<span class="special-term">特別選挙：任期途中の欠員を補充。残任期終了は${year(seat.termEnd)}年、当選者の具体的な就任日は確定後に更新します。</span>` : '';
  const termText = `<span>議席の現行任期：${year(seat.termStart)}〜${year(seat.termEnd)}年</span>`;
  return `<div class="seat"><b>${seat.incumbent ?? (seat.vacant ? '空席' : '現職氏名未確認')} · ${seat.seatId}</b><span>Class ${seat.senateClass}／党籍：${partyLabel[seat.party]}／会派：${caucusLabel[seat.caucus]}</span>${termText}${specialText}<span>空席：${seat.vacant ? 'はい' : 'いいえ'}／確認状態：${seat.verificationStatus === 'confirmed' ? `確認済み（${seat.verifiedAt}）` : '一次資料再確認待ち'}</span>${attributeRefs(seat.attributeSourceIds)}</div>`;
}
function electionCard(election: Election) {
  const seat = seatById.get(election.seatId)!;
  const contestLabel = election.contestStatus === 'general-ballot' ? '本選候補' : election.contestStatus === 'primary-pending' ? `予備選候補（${election.primaryDate}予定）` : `予備選候補（${election.primaryDate}・結果確認中）`;
  const printed = election.candidates.filter(candidate => candidate.ballotStage !== 'write-in');
  const writeIns = election.candidates.filter(candidate => candidate.ballotStage === 'write-in');
  const researched = printed.filter(candidate => getCandidateBrief(candidateBriefs,candidate.candidateId));
  const incumbentCandidate = printed.find(candidate => candidateNameKey(candidate.name) === candidateNameKey(seat.incumbent));
  const featured = getFeaturedCandidates(
    printed,
    incumbentCandidate?.candidateId ?? null,
    new Set(researched.map(candidate => candidate.candidateId)),
  );
  const otherPrinted = printed.filter(candidate => !featured.includes(candidate));
  const incumbentOnBallot = printed.some(candidate => candidateNameKey(candidate.name) === candidateNameKey(seat.incumbent));
  const openSeat = election.contestStatus === 'general-ballot' && seat.incumbent && !incumbentOnBallot
    ? `<p class="open-seat-note">現在の議席保持者 ${escapeHtml(seat.incumbent)} は本選候補ではありません。</p>` : '';
  const otherPrintedMarkup = otherPrinted.length ? `<details class="candidate-more"><summary>その他の投票用紙掲載候補 ${otherPrinted.length}人</summary><div class="candidate-list">${otherPrinted.map(candidate => candidateCardMarkup(candidate,seat,election)).join('')}</div></details>` : '';
  const writeInMarkup = writeIns.length ? `<details class="candidate-more"><summary>記名投票候補 ${writeIns.length}人</summary><p class="writein-note">候補者名を投票用紙へ書いて投票する候補です。</p><div class="candidate-list">${writeIns.map(candidate => candidateCardMarkup(candidate,seat,election)).join('')}</div></details>` : '';
  const choice = scenarioState.senate[election.seatId];
  const choiceLabel = choice ? scenarioChoiceLabel(choice,election) : `初期値：${outcomeLabel[scenarioState.senateBaseline.outcomes[election.seatId] ?? 'unassigned']}`;
  const outcome = assumptions[election.seatId] ?? scenarioOutcomeForSeat(scenarioState,election.seatId,election);
  const observation = observationFor(election.electionId);
  if (observation) return `<article class="election-card ${election.type} observation-host"><header class="election-card-head"><b>${election.type==='special' ? '★ 特別選挙' : '通常選挙'} · Class ${seat.senateClass}</b><span>投票日 ${election.date}</span></header>${openSeat}<div class="rating-badge"><span>${displayRatingLabel(election)}</span><small>2機関の統合評価・${RATING_SNAPSHOT_AS_OF}集計</small></div><p class="observation-current"><b>自分の仮定：</b>${escapeHtml(choiceLabel)} → ${caucusLabel[outcome]}</p><div class="observation-body">${observationCandidateIntroMarkup(observation,election.candidates,seat.incumbent)}${observationLeadMarkup(observation)}${observationDecisionMarkup(observation)}<section id="${observationAnchor(election.electionId,'choice')}" tabindex="-1" class="election-assumption observation-choice"><h4>当選者を仮定する</h4><p>まだ決められなければ「未配分」のままにできる。</p><label>この選挙の当選仮定<select data-senate-choice="${election.seatId}">${senateChoiceOptions(election)}</select></label><small>「初期配分へ戻す」は、この保存案の基準に戻す操作。</small></section>${observationComparisonMarkup(observation,election.candidates)}<details class="observation-candidate-files"><summary>${contestLabel}の全候補・政策資料</summary><div class="candidate-list">${featured.map(candidate=>candidateCardMarkup(candidate,seat,election)).join('')}</div>${otherPrintedMarkup}${writeInMarkup}</details>${observationUpdatesMarkup(observation)}${relatedNewsMarkup(election)}<details class="race-full"><summary>世論調査・評価比較・原資料</summary><p class="rating-evidence">${consensusEvidenceMarkup(election)}</p>${raceResearchMarkup(election)}${attributeRefs(election.attributeSourceIds)}</details><div data-observation-monitor>${monitoringMarkup()}</div></div></article>`;
  return `<article class="election-card ${election.type}"><header class="election-card-head"><b>${election.type === 'special' ? '★ 特別選挙' : '通常選挙'} · Class ${seat.senateClass}</b><span>投票日 ${election.date}</span></header>${election.type === 'special' ? `<p class="special-term">${election.termStartRule ?? '任期途中の欠員を州法に基づき補充します。'}</p>` : ''}${openSeat}<div class="rating-badge"><span>${displayRatingLabel(election)}</span><small>2機関の統合評価・${RATING_SNAPSHOT_AS_OF}集計</small></div><p class="rating-evidence">${consensusEvidenceMarkup(election)}</p>${raceLeadMarkup(election)}<section class="candidate-block"><h4>${contestLabel}：投票用紙に載る候補${printed.length}人${writeIns.length ? `・記名投票候補${writeIns.length}人` : ''}</h4><div class="candidate-list">${featured.map(candidate => candidateCardMarkup(candidate,seat,election)).join('')}</div>${otherPrintedMarkup}${writeInMarkup}</section><section class="election-assumption"><label>この候補が当選すると仮定<select data-senate-choice="${election.seatId}">${senateChoiceOptions(election)}</select></label><p><b>現在の入力：</b>${escapeHtml(choiceLabel)} → ${caucusLabel[outcome]}</p></section>${relatedNewsMarkup(election)}<details class="race-full"><summary>調査・世論調査・評価比較・出典を開く</summary>${raceResearchMarkup(election)}<small class="election-verification">候補者名簿：${election.contestStatus === 'general-ballot' ? '本選掲載を確認済み' : '予備選確定待ち'}／情勢取得 ${election.rating.retrievedAt}</small>${attributeRefs(election.attributeSourceIds)}</details></article>`;
}

function compactCopy(value: string, limit = 190) {
  const normalized = value.replace(/\s+/g,' ').trim();
  return normalized.length > limit ? `${normalized.slice(0,limit).replace(/[、,\s]+$/,'')}…` : normalized;
}

function selectState(state: State, trigger?: HTMLElement, options: {focus?:boolean;scroll?:boolean;preserveReturn?:boolean} = {}) {
  const detail = document.querySelector<HTMLElement>('#detail')!;
  const sameState = selected?.fips === state.fips;
  const previousScrollTop = sameState ? (detail.querySelector<HTMLElement>('#state-detail-scroll')?.scrollTop ?? 0) : 0;
  const openDetailIndexes = sameState ? new Set([...detail.querySelectorAll<HTMLDetailsElement>('details')].flatMap((item,index) => item.open ? [index] : [])) : new Set<number>();
  selected = state;
  const viewUrl=new URL(window.location.href);
  const firstElection=electionByState(state)[0];
  if (firstElection) viewUrl.searchParams.set('race',firstElection.electionId);
  else viewUrl.searchParams.delete('race');
  if (!sameState) viewUrl.searchParams.delete('observation');
  window.history.replaceState(null,'',viewUrl);
  if (!options.preserveReturn) {
    if (trigger && !trigger.dataset.fromNews && !trigger.dataset.returnNews) stateReturnNews = null;
    if (!trigger) returnFocus = {kind:'search',value:'state-search'};
    else returnFocus = trigger.id === 'state-search'
      ? {kind:'search',value:'state-search'}
      : trigger.dataset.stateFips ? {kind:'map',value:state.fips} : {kind:'search',value:'source-control',element:trigger};
  }
  renderMap();
  const stateElections = electionByState(state); const profile = profileByFips.get(state.fips)!; const stateSeats = seats.filter(seat => seat.stateFips === state.fips); const context = contextByFips.get(state.fips)!;
  const ids = [...profile.politicalBase.sourceIds,...profile.industryAndIssues.sourceIds,...profile.historicalTrajectory.sourceIds,...profile.electionMeaning.sourceIds,...stateSeats.flatMap(seat => seat.sourceIds),...stateElections.flatMap(election => election.sourceIds)];
  const timeline = events.filter(event => profile.eventIds.includes(event.eventId) && !event.eventId.startsWith('population-') && !event.eventId.startsWith('presidential-'));
  const returnNews = stateReturnNews && feedItemByKey(stateReturnNews.feedKey,newsItems,observationData) ? `<button type="button" class="return-news" data-return-news="${escapeHtml(stateReturnNews.feedKey)}">← ニュース・予定に戻る</button>` : '';
  const inCompare = compareStateFips.includes(state.fips);
  const background = `<section class="state-background"><h3>産業・人口と政策の接点</h3><p>${escapeHtml(compactCopy(profile.industryAndIssues.text))}</p><p>${escapeHtml(compactCopy(profile.electionMeaning.text))}</p></section>`;
  detail.innerHTML = `<header class="state-detail-header"><div><p class="kicker">STATE BRIEFING</p><h2 id="state-detail-heading" tabindex="-1">${state.nameJa}</h2><p class="en">${state.nameEn} · ${state.abbr}</p></div><button class="close" aria-label="州詳細を閉じる">×</button></header><div id="state-detail-scroll" class="state-detail-scroll" tabindex="0">${returnNews}<div class="state-heading-row"><span class="status">州解説 ${profile.contentStatus}／説明の基準 ${profile.asOf}</span><button type="button" data-compare-state="${state.fips}" aria-pressed="${inCompare}">${inCompare ? '比較から外す' : '比較に追加'}</button></div><section class="forecast-brief"><h3>上院選の結論・候補者・争点</h3>${stateElections.length ? stateElections.map(electionCard).join('') : '<p>2026年の上院選はありません。下院は州内の全選挙区が改選されます。</p>'}</section><section class="brief"><h3>州の要約</h3>${presidentialShareMarkup(context)}${stateMetricsMarkup(context,stateElections)}${background}</section><details><summary>確認できる変化</summary><div class="state-change-baseline"><h4>2024年大統領選（比較の起点）</h4>${presidentialShareMarkup(context)}</div>${timeline.map(event => `<article class="timeline-item"><time>${event.period}</time><b>${event.title}</b><p>${event.eventText}</p>${event.localEffect ? `<small>${event.localEffect}</small>` : ''}</article>`).join('')}</details><details><summary>現職・議席情報</summary>${stateSeats.map(seat => seatCard(seat,stateElections)).join('')}</details><details><summary>出典・情報時点</summary>${refs(ids)}</details></div>`;
  if (openDetailIndexes.size) {
    detail.querySelectorAll<HTMLDetailsElement>('details').forEach((item,index) => {
      if (openDetailIndexes.has(index)) item.open = true;
    });
  }
  bindSenateChoiceControls(detail);
  bindObservationJumps(detail);
  detail.querySelectorAll<HTMLButtonElement>('[data-observation-feed]').forEach(button=>button.addEventListener('click',()=>{
    showNewsFeed(button.dataset.observationFeed as NewsFeedTab,button.dataset.observationRace ?? null);
  }));
  detail.querySelectorAll<HTMLButtonElement>('[data-observation-feed-item]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.observationFeedItem;
    if(key) openFeedItem(key);
  }));
  detail.querySelector<HTMLButtonElement>('[data-compare-state]')?.addEventListener('click',() => {
    if (inCompare) compareStateFips = compareStateFips.filter(fips => fips !== state.fips);
    else if (compareStateFips.length < 3) compareStateFips = [...compareStateFips,state.fips];
    else addScenarioNotice('比較できる州は3州までです。');
    renderStateCompare();
    selectState(state,undefined,{focus:false,scroll:false,preserveReturn:true});
  });
  document.querySelectorAll<HTMLButtonElement>('#detail [data-race-issue]').forEach(button => button.onclick = () => {
    activeIssueId = button.dataset.raceIssue ?? activeIssueId;
    openOverlay('issues');
  });
  document.querySelector<HTMLButtonElement>('#detail [data-return-news]')?.addEventListener('click',event => {
    const feedKey = (event.currentTarget as HTMLButtonElement).dataset.returnNews;
    if (feedKey && stateReturnNews?.feedKey === feedKey) restoreNewsReturn(stateReturnNews);
  });
  document.querySelectorAll<HTMLButtonElement>('#detail [data-related-news]').forEach(button => button.addEventListener('click',() => {
    const newsId = button.dataset.relatedNews;
    if (newsId) openFeedItem(`news:${newsId}`);
  }));
  document.querySelector<HTMLButtonElement>('#detail .close')!.onclick = () => {
    const focusTarget = returnFocus;
    selected = null; stateReturnNews = null; renderMap();
    const url=new URL(window.location.href);
    url.searchParams.delete('race'); url.searchParams.delete('observation');
    window.history.replaceState(null,'',url);
    document.querySelector<HTMLSelectElement>('#state-search')!.value = '';
    document.querySelector('#detail')!.innerHTML = '<div class="empty-detail"><span>STATE BRIEFING</span><h2>州を選択してください</h2><p>地図または検索から全50州の情報へ移動できます。</p></div>';
    if (focusTarget?.element?.isConnected) focusTarget.element.focus();
    else if (focusTarget?.kind === 'search') document.querySelector<HTMLElement>('#state-search')?.focus();
    else if (focusTarget?.kind === 'map') document.querySelector<HTMLElement>(`[data-state-fips="${focusTarget.value}"]`)?.focus();
  };
  if (options.focus !== false) document.querySelector<HTMLElement>('#state-detail-heading')?.focus({preventScroll:true});
  requestAnimationFrame(() => {
    const scroller = detail.querySelector<HTMLElement>('#state-detail-scroll');
    if (scroller) scroller.scrollTop = sameState ? previousScrollTop : 0;
  });
  const splitLayout = matchMedia('(min-width: 960px) and (orientation: landscape) and (min-height: 600px)').matches;
  if (options.scroll !== false && !splitLayout) detail.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
}
function electionLabelForSeat(seatId: string) {
  return elections.filter(election => election.seatId === seatId).map(election => election.type === 'special' ? '特別' : '通常').join('・');
}
function renderSim() {
  const activeSeatId = (document.activeElement as HTMLElement | null)?.dataset.senateChoice;
  const counts = scenarioCounts(scenarioState);
  const explicit = Object.entries(scenarioState.senate);
  const unresolved = counts.none + counts.unconfirmed + counts.vacant + counts.unassigned;
  const explicitLabels = explicit.map(([seatId,choice]) => {
    const election = elections.find(item => item.seatId === seatId)!;
    const outcome = assumptions[seatId] ?? scenarioOutcomeForSeat(scenarioState,seatId,election);
    return `${seatId} → ${scenarioChoiceLabel(choice,election)}（${outcomeLabel[outcome]}）`;
  });
  const baselineText = scenarioState.senateBaseline.kind === 'rating-consensus' ? `暫定配分 ${scenarioState.senateBaseline.asOf}` : `現保有会派基準 ${scenarioState.senateBaseline.asOf}`;
  document.querySelector('#sim-result')!.innerHTML = `${senateSeatCompositionMarkup(counts)}<div class="projected"><div><strong>${counts.Democratic}</strong><span>民主党会派</span></div><div><strong>${counts.unassigned}</strong><span>未配分</span></div><div><strong>${counts.Republican}</strong><span>共和党会派</span></div><div class="majority"><b>${majorityText(counts,vicePresident)}</b><small>あなたが置いた2027年議会発足時の仮定です。副大統領は${vicePresident.name}（${partyLabel[vicePresident.party]}）が引き続き在職し、所属党側へ決裁票を投じる条件です。${unresolved ? `／未配分・その他 ${unresolved}` : ''}</small></div></div><p class="scenario-baseline-note">初期基準：${escapeHtml(baselineText)}／利用者の指定：${explicit.length}議席</p><p class="changes">明示した仮定：${explicitLabels.length ? explicitLabels.map(escapeHtml).join('、') : 'なし（この案の初期基準を表示）'}</p>`;
  const sticky = document.querySelector<HTMLElement>('#scenario-sticky');
  if (sticky) {
    const other = otherScenarioSeats(counts);
    const total = counts.Democratic + counts.Republican + counts.unassigned + other;
    sticky.innerHTML = `<div class="scenario-sticky-heading"><span>あなたの仮定</span><small>上院 合計${total}</small></div><div class="scenario-sticky-counts"><b class="scenario-d">民主 ${counts.Democratic}</b><b class="scenario-u">未配分 ${counts.unassigned}</b>${other ? `<b class="scenario-o">その他 ${other}</b>` : ''}<b class="scenario-r">共和 ${counts.Republican}</b></div><div class="scenario-mini-track" aria-hidden="true"><i class="scenario-d" style="width:${counts.Democratic}%"></i><i class="scenario-u" style="width:${counts.unassigned}%"></i>${other ? `<i class="scenario-o" style="width:${other}%"></i>` : ''}<i class="scenario-r" style="width:${counts.Republican}%"></i></div><p>${escapeHtml(scenarioLastChange)}</p><button type="button" data-sticky-undo ${previousScenarioState ? '' : 'disabled'}>直前に戻す</button>`;
    sticky.querySelector<HTMLButtonElement>('[data-sticky-undo]')?.addEventListener('click',undoScenario);
  }
  document.querySelector('#seat-controls')!.innerHTML = targetSeatIds.map(seatId => {
    const seat = seatById.get(seatId)!;
    const state = stateByFips.get(seat.stateFips)!;
    const election = elections.find(item => item.seatId === seatId)!;
    return `<div class="observation-seat-control"><label><span>${state.nameJa}<small>${seatId} · ${electionLabelForSeat(seatId)} · 現${partyLabel[seat.party]}</small></span><select data-senate-choice="${seatId}">${senateChoiceOptions(election)}</select></label><button type="button" data-seat-material="${state.fips}" aria-label="${state.nameJa}の判断材料を読む">${observationFor(election.electionId) ? '判断材料を読む' : '候補者・調査を読む'}</button></div>`;
  }).join('');
  bindSenateChoiceControls(document.querySelector('#seat-controls')!);
  document.querySelectorAll<HTMLButtonElement>('[data-seat-material]').forEach(button=>button.addEventListener('click',()=>{
    const state=stateByFips.get(button.dataset.seatMaterial!)!;
    document.querySelector<HTMLSelectElement>('#state-search')!.value=state.fips;
    selectState(state,button);
    document.querySelector('#detail')?.scrollIntoView({behavior:'instant',block:'start'});
  }));
  if (activeSeatId) document.querySelector<HTMLElement>(`#seat-controls [data-senate-choice="${activeSeatId}"]`)?.focus();
}

function renderIssueDetail() {
  const issue = issueCategories.find(item => item.issueId === activeIssueId)!;
  const relatedPowers = issue.relatedPowerIds.map(id => powerRules.find(rule => rule.powerId === id)).filter(Boolean);
  const detail = document.querySelector<HTMLElement>('#issue-detail')!;
  detail.setAttribute('aria-labelledby',`issue-tab-${activeIssueId}`);
  detail.innerHTML = `<article class="issue-card"><div><p class="kicker">${issue.label}</p><h3>${issue.voterQuestion}</h3><p>${issue.scope}</p></div><dl><div><dt>大統領が動かせるもの</dt><dd>${issue.presidentialLevers}</dd></div><div><dt>議会が制約できるもの</dt><dd>${issue.congressionalChecks}</dd></div></dl><div class="issue-evidence"><b>追う指標</b><ul>${issue.indicatorLabels.map(label => `<li>${label}</li>`).join('')}</ul><b>つながる権限</b><ul>${relatedPowers.map(rule => `<li><a href="#powers" data-power-link="${rule!.powerId}">${rule!.action}を読む</a><button type="button" data-issue-power-target="${rule!.powerId}">逆算する</button></li>`).join('')}</ul></div>${refs(issue.sourceIds)}</article>`;
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
    return (leftRace ? ratingOrder[displayRatingFor(leftRace)] : 5) - (rightRace ? ratingOrder[displayRatingFor(rightRace)] : 5) || left.soybeanRank2026! - right.soybeanRank2026!;
  });
  const maxProduction = Math.max(...soybeanStates.map(context => context.soybeanProduction2026 ?? 0));
  document.querySelector('#soy-table')!.innerHTML = `<div class="table-scroll"><table class="soy-table"><thead><tr><th>州</th><th>2026年生産予測</th><th>2024大統領選</th><th>2026上院選</th><th>政策評価を見る入口</th></tr></thead><tbody>${sorted.map(context => {
    const state = stateByFips.get(context.stateFips)!;
    const race = electionByState(state)[0];
    const winner = context.presidentialWinner2024 === 'R' ? 'Trump R' : 'Harris D';
    return `<tr><th><button type="button" data-soy-state="${state.fips}">${state.nameJa}<small>${state.abbr}・全米${context.soybeanRank2026}位</small></button></th><td><b>${context.soybeanProduction2026!.toLocaleString('en-US')}千bu</b><span class="soy-bar"><i style="width:${Math.round(context.soybeanProduction2026! / maxProduction * 100)}%"></i></span></td><td>${winner}<small>${context.presidentialMargin2024!.toFixed(1)}pt差</small></td><td>${race ? `<span class="rating-pill rating-${displayRatingFor(race).replaceAll(' ','-')}">${displayRatingFor(race)}</span><small>${race.contestStatus === 'general-ballot' ? '本選候補確定' : '予備選確定待ち'}</small>` : '<span>上院選なし</span><small>下院は全区改選</small>'}</td><td>${race ? '関税・輸出市場・農家支援への候補者の立場を州詳細から確認' : '下院候補・農業団体の発言と、地域別価格・所得を追加確認'}</td></tr>`;
  }).join('')}</tbody></table></div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-soy-state]').forEach(button => button.onclick = () => {
    const state = stateByFips.get(button.dataset.soyState!);
    if (!state) return;
    if (overlayKind) {
      const origin=resolveFeedKey(overlayOriginNewsId,newsItems,observationData);
      stateReturnNews = origin ? captureNewsReturn(origin) : null;
      closeOverlay();
    }
    document.querySelector<HTMLSelectElement>('#state-search')!.value = state.fips;
    selectState(state);
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
    const value = (event.target as HTMLSelectElement).value as HouseAssumptions[string];
    updateScenario(draft => { draft.house[district.districtId] = value; });
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
    const districtId = element.dataset.houseSeat!;
    updateScenario(draft => { draft.house[districtId] = element.value as HouseAssumptions[string]; });
    if (selectedHouseDistrict?.districtId === element.dataset.houseSeat) renderHouseDetail();
  });
  if (activeDistrictId) document.querySelector<HTMLElement>(`[data-house-seat="${activeDistrictId}"]`)?.focus();
}

enhanceLayout();
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button => button.onclick = () => {
  const next = button.dataset.mode as 'current'|'rating';
  setMapMode(next);
});
document.querySelectorAll<HTMLButtonElement>('[data-target-toggle]').forEach(button => button.onclick = () => setTargetPanel(!targetPanelOpen));
document.querySelectorAll<HTMLButtonElement>('[data-power-target]').forEach(button => button.onclick = () => {
  targetActionId = button.dataset.powerTarget ?? targetActionId;
  setTargetPanel(true);
  updateScenario(draft => { draft.target = {targetId:targetActionId,caucus:targetParty}; });
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
  updateScenario(draft => { draft.senate = {}; draft.unlockedSeatIds = []; },{refreshState:true,changeLabel:'上院をこの案の初期配分へ戻す'});
};
document.querySelector<HTMLButtonElement>('#senate-latest-reset')!.onclick = () => {
  const changed = scenarioState.senateBaseline.snapshotId !== currentScenarioBaseline.snapshotId || Object.keys(scenarioState.senate).length > 0;
  if (!changed) { addScenarioNotice('すでに最新の暫定配分です。'); return; }
  if (!window.confirm(`上院の指定${Object.keys(scenarioState.senate).length}議席を消し、${currentScenarioBaseline.asOf}の暫定配分から始め直します。下院と名前付き保存案は維持します。`)) return;
  updateScenario(draft => {
    draft.senateBaseline = cloneSenateBaseline(currentScenarioBaseline);
    draft.senate = {};
    draft.unlockedSeatIds = [];
  },{refreshState:true,changeLabel:'上院を最新の暫定配分へ戻す'});
  addScenarioNotice(`${currentScenarioBaseline.asOf}の暫定配分から始め直しました。`);
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
  updateScenario(draft => { draft.house = {}; });
  renderHouseDetail();
};
document.querySelector<HTMLButtonElement>('#reload-app')!.onclick = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('refresh',Date.now().toString());
  window.location.replace(url.toString());
};
const initialNewsView=new URL(window.location.href).searchParams;
newsTab=initialNewsView.get('newsTab')==='upcoming' ? 'upcoming' : 'recent';
const initialNewsRace=initialNewsView.get('newsRace');
const initialBriefRace=initialNewsView.get('briefRace') ?? initialNewsRace;
if(focusElections.some(item=>item.electionId===initialBriefRace)) activeFocusElectionId=initialBriefRace;
newsRaceFilter=initialNewsRace && elections.some(item=>item.electionId===initialNewsRace) ? initialNewsRace : initialNewsView.get('newsScope')==='all' ? null : activeFocusElectionId;
renderFocusSummary(false,false);
renderCounts();
renderNewsList();
renderSim();
renderHouseSim();
renderScenarioManager();
renderStateCompare();
renderScenarioNotices();
setMapMode('rating');
setupPageNavigation(fromHistory => {
  if(fromHistory) overlayHistory=[];
  openOverlay('issues',undefined,{recordHistory:!fromHistory});
},closeOverlay);
window.addEventListener('popstate',()=>{
  const view=new URL(window.location.href).searchParams;
  newsTab=view.get('newsTab')==='upcoming' ? 'upcoming' : 'recent';
  const race=view.get('newsRace');
  const briefRace=view.get('briefRace') ?? race;
  if(focusElections.some(item=>item.electionId===briefRace)) activeFocusElectionId=briefRace;
  newsRaceFilter=race && elections.some(item=>item.electionId===race) ? race : view.get('newsScope')==='all' ? null : activeFocusElectionId;
  renderFocusSummary(false,false);
  renderNewsList();
  const key=resolveFeedKey(view.get('newsItem'),newsItems,observationData);
  if(key) openFeedItem(key,{history:'none'});
  else if(overlayKind==='news' && location.hash==='#issues'){
    overlayHistory=[];
    openOverlay('issues',undefined,{recordHistory:false});
  }
  else if(overlayKind==='news') closeOverlay();
});
initMap().catch(() => { document.querySelector('#map')!.innerHTML = '<p class="error">同梱された州境データを読み込めませんでした。ローカル開発サーバーまたはプレビューで開いてください。</p>'; });
initHouseMap().catch(() => { document.querySelector('#house-map')!.innerHTML = '<p class="error">同梱された下院選挙区データを読み込めませんでした。</p>'; });

// Deep links carry only a reading position; initialization of the scenario above
// continues to own saved baselines, pending shares and all seat choices.
const observationView=new URL(window.location.href).searchParams;
const linkedElection=elections.find(e=>e.electionId===observationView.get('race'));
const linkedObservation=observationView.get('observation');
const linkedFeed=resolveFeedKey(observationView.get('newsItem'),newsItems,observationData);
const legacyFeed=linkedElection ? legacyObservationFeedKey(linkedElection.electionId,linkedObservation,newsItems,observationData) : null;
if (linkedElection) {
  const state=stateByFips.get(seatById.get(linkedElection.seatId)!.stateFips)!;
  document.querySelector<HTMLSelectElement>('#state-search')!.value=state.fips;
  selectState(state);
  document.querySelector('#detail')?.scrollIntoView({behavior:'instant',block:'start'});
  if (linkedObservation && !legacyFeed) requestAnimationFrame(()=>jumpToObservation(observationAnchor(linkedElection.electionId,linkedObservation)));
} else if (observationView.has('race')) {
  document.querySelector('#national-overview')?.scrollIntoView({behavior:'auto'});
}
if(linkedFeed || legacyFeed){
  const key=linkedFeed ?? legacyFeed!;
  if(legacyFeed && !linkedFeed){
    const url=new URL(window.location.href);
    url.searchParams.set('newsItem',key);
    url.searchParams.set('newsTab',key.startsWith('event:') ? 'upcoming' : 'recent');
    url.searchParams.delete('observation');
    window.history.replaceState(null,'',url);
  }
  openFeedItem(key,{history:'none'});
} else if(observationView.has('newsItem')) {
  const url=new URL(window.location.href);url.searchParams.delete('newsItem');window.history.replaceState(null,'',url);
}
function refreshObservationStatus() {
  document.querySelectorAll<HTMLElement>('[data-observation-status]').forEach(label=>{
    const value=monitoringStatus(observationData).join('／');
    if(label.textContent!==value) label.textContent=value;
  });
}
setInterval(refreshObservationStatus,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshObservationStatus();});
