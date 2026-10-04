const unresearchedPolicyMarkup="<p class=\"pw-meta\" data-policy-coverage>この州の候補者別の政策材料は未収録です。共通の政策と制度条件を確認できます。</p>";
import { policyVersionLabel } from './policy-version-labels';
import { sectionIntroductions } from '../data/section-introductions';
import type { Candidate, Election, PowerRule, Seat, Source, State } from '../data/model';
import type { EvidenceRef } from '../data/research-model';
import type { CandidatePolicyRecord, PolicyAction, PolicyPrototypeData, PolicyRef, PolicySpec, PolicyThemeId } from '../data/policy-prototype-model';
import { candidatePolicyKnowledge, comparePolicyScenarios, describePolicyScenario, policyKey } from '../policy-prototype-logic';
import { candidateForChoice, countScenarioSenate, scenarioChoiceLabel, type SavedScenario, type ScenarioState, type SenateChoice } from '../scenario/model';
import { reasonChoiceIsCurrent, REASONING_LIMITS, type AssumptionAssessment, type CommonAssumptionChoice, type FactorRole, type RaceReasoning } from '../scenario/reasoning';
import type { PolicyReadingContext } from '../news-policy-context';

export interface PolicyWorkbenchOptions {
  data:PolicyPrototypeData;
  state:ScenarioState;
  seats:Seat[];
  elections:Election[];
  powerRules:PowerRule[];
  sources:Source[];
  evidence:EvidenceRef[];
  states?:State[];
  themeId?:PolicyThemeId|null;
  electionId?:string;
  policyRef?:PolicyRef|null;
  /** Transient material being read; never persisted by the workbench. */
  readingContext?:PolicyReadingContext|null;
  savedScenarios?:SavedScenario[];
  comparison?:{leftId:string|null;rightId:string|null};
}
export interface PolicyActionContext {
  data:PolicyPrototypeData;
  elections:Election[];
  /** Required when accepting saved comparison IDs. */
  savedScenarios?:SavedScenario[];
  /** The current state is required to validate race assumption references. */
  state?:ScenarioState;
}
export type PolicyWorkbenchIntent =
  | {type:'choose-theme';themeId:PolicyThemeId}
  | {type:'choose-election';electionId:string}
  | {type:'choose-policy';policyRef:PolicyRef}
  | {type:'set-common-assumption';choice:CommonAssumptionChoice}
  | {type:'apply-reasoned-choice';electionId:string;choice:SenateChoice;reason:Omit<RaceReasoning,'choiceAtAssessment'>}
  | {type:'choose-comparison';side:'left'|'right';savedScenarioId:string|null};

const html=(value:unknown)=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const assessmentLabels:Record<AssumptionAssessment,string>={adopt:'採用',reject:'採用しない',hold:'保留'};
const roleLabels:Record<FactorRole,string>={'counterweight':'共通前提を打ち消す材料','candidate-case':'候補者を選ぶ材料','background':'州の背景','uncertain':'判断を保留する材料'};
const stanceLabels={support:'支持',conditional:'条件付き',oppose:'反対',unknown:'未確認'} as const;
const actionLabels:Record<PolicyAction['kind'],string>={'stated-priority':'重点方針',introduced:'提出',cosponsored:'共同提案',vote:'採決',statement:'声明','requested-action':'要請'};
const routeLabels={'ordinary-law':'通常法案',reconciliation:'財政調整',oversight:'調査・監督'} as const;
const checked=(value:boolean)=>value?' checked':'';
const selected=(value:boolean)=>value?' selected':'';
const list=(items:string[])=>items.length?`<ul>${items.map(item=>`<li>${html(item)}</li>`).join('')}</ul>`:'';
function safeUrl(raw:string):string|null {
  try { const url=new URL(raw); return ['https:','http:'].includes(url.protocol)?url.href:null; } catch { return null; }
}
function sourceLinks(ids:string[],sources:Source[]):string {
  return [...new Set(ids)].map(id=>{
    const source=sources.find(s=>s.sourceId===id);
    if(!source)return '<span class="pw-missing">出典未接続</span>';
    const url=safeUrl(source.url);
    return url?`<a href="${html(url)}" target="_blank" rel="noopener noreferrer">${html(source.publisher)}：${html(source.title)}</a>`:`<span>${html(source.publisher)}：${html(source.title)}</span>`;
  }).join(' / ');
}
function readingSources(ids:string[],sources:Source[]):string {
  return `<ul class="pw-reading-sources">${[...new Set(ids)].map(id=>{
    const source=sources.find(item=>item.sourceId===id);
    if(!source)return '<li class="pw-missing">出典未接続</li>';
    return `<li>${sourceLinks([id],sources)}<small>原資料公表 ${html(source.publishedAt??'日付未確認')}${source.updatedAt?` · 原資料更新 ${html(source.updatedAt)}`:''} · 内容確認 ${html(source.contentVerifiedAt??'日付未確認')}</small>${source.referencePeriod?`<small>資料の対象：${html(source.referencePeriod)}</small>`:''}</li>`;
  }).join('')}</ul>`;
}
function evidenceEntries(options:Pick<PolicyWorkbenchOptions,'data'|'evidence'>) {
  return new Map([...options.evidence,...options.data.additionalEvidence].map(e=>[e.evidenceId,e]));
}
function readerEvidenceLocator(entry:EvidenceRef):string {
  if(entry.evidenceId==='ev-prototype-collins-medicaid-work')return '2025年7月1日声明の、就労可能な成人への就労要件と、子育て・介護・就学の例外についての説明。';
  if(entry.evidenceId==='ev-prototype-collins-medicaid-funding')return '2025年7月1日声明の、将来のMedicaid資金削減と受診機会・地方病院への影響についての説明。';
  return /既存EvidenceRef|ev-prototype-/.test(entry.locator)?'原文の具体的な箇所は未特定。':entry.locator;
}
function evidenceList(ids:string[],options:Pick<PolicyWorkbenchOptions,'data'|'sources'|'evidence'>):string {
  const entries=evidenceEntries(options);
  return `<ul class="pw-evidence-list">${[...new Set(ids)].map(id=>{
    const entry=entries.get(id);
    return entry?`<li>${sourceLinks([entry.sourceId],options.sources)}<small>${html(readerEvidenceLocator(entry))} · 確認 ${html(entry.checkedAt)}</small></li>`:`<li class="pw-missing">根拠の出典・箇所は未接続</li>`;
  }).join('')}</ul>`;
}
function evidenceControls(ids:string[],selectedIds:string[],options:Pick<PolicyWorkbenchOptions,'data'|'sources'|'evidence'>,availableIds?:Set<string>):string {
  if(!ids.length)return '<p class="pw-empty">選べる公開根拠は未収録。</p>';
  const entries=evidenceEntries(options);
  return `<div class="pw-evidence-controls">${[...new Set(ids)].map(id=>{
    const entry=entries.get(id),source=options.sources.find(s=>s.sourceId===entry?.sourceId);
    const available=!availableIds||availableIds.has(id);
    return `<div${available?'':' hidden'}><label><input type="checkbox" name="evidenceId" value="${html(id)}"${checked(available&&selectedIds.includes(id))}${available?'':' disabled'}><span>${html(source?.publisher??'根拠')}：${html(entry?readerEvidenceLocator(entry):'該当箇所は未収録')}<small>確認 ${html(entry?.checkedAt??'未接続')}</small></span></label>${entry?sourceLinks([entry.sourceId],options.sources):''}</div>`;
  }).join('')}</div>`;
}
function electionLabel(election:Election,options:{seats:Seat[];states?:State[]}):string {
  const seat=options.seats.find(s=>s.seatId===election.seatId),state=options.states?.find(s=>s.fips===seat?.stateFips);
  const name=state?.nameJa??election.electionId.split('-')[1]??election.electionId;
  return `${name}${election.type==='special'?'（特別）':''}`;
}
function choiceText(choice:SenateChoice|null|undefined,election:Election):string {
  if(!choice)return '基準の配分';
  if(choice.kind==='caucus')return `会派のみ：${choice.caucus==='Democratic'?'民主党側':choice.caucus==='Republican'?'共和党側':choice.caucus}`;
  return scenarioChoiceLabel(choice,election);
}
function countsMarkup(state:ScenarioState,seats:Seat[],elections:Election[]):string {
  const counts=countScenarioSenate(state,seats,elections),other=counts.none+counts.unconfirmed+counts.vacant;
  return `<div class="pw-seat-counts" aria-label="上院の議席配分"><span>民主党側 <b>${counts.Democratic}</b></span><span>共和党側 <b>${counts.Republican}</b></span><span>未配分 <b>${counts.unassigned}</b></span>${other?`<span>その他・未確認・空席 <b>${other}</b></span>`:''}</div>`;
}
function assumptionMarkup(options:PolicyWorkbenchOptions,themeId:PolicyThemeId):string {
  const assumptions=options.data.assumptions.filter(a=>a.themeId===themeId);
  const widest=Math.max(0,...assumptions.map(a=>a.electionIds.length));
  return assumptions.filter(a=>a.electionIds.length===widest||options.state.reasoning?.commonAssumptions.some(c=>c.assumptionId===a.assumptionId)).sort((a,b)=>b.electionIds.length-a.electionIds.length).map(a=>{
    const current=options.state.reasoning?.commonAssumptions.find(c=>c.assumptionId===a.assumptionId);
    return `<form class="pw-assumption" data-policy-action="set-common-assumption"><input type="hidden" name="assumptionId" value="${html(a.assumptionId)}"><h4>${html(a.label)}</h4><p>${html(a.description)}</p><div class="pw-form-row"><label>この案の共通前提<select name="assessment">${(['hold','adopt','reject'] as const).map(value=>`<option value="${value}"${selected(value===(current?.assessment??'hold'))}>${assessmentLabels[value]}</option>`).join('')}</select></label><button type="submit">前提を記録</button><span class="pw-status">${current?`記録済み：${assessmentLabels[current.assessment]}`:'未記録'}</span></div><details><summary>採用した公開根拠を選ぶ</summary>${evidenceControls(a.evidenceIds,current?.evidenceIds??[],options)}</details></form>`;
  }).join('')||'<p class="pw-empty">このテーマの共通前提は未収録。</p>';
}
function readingContextMarkup(options:PolicyWorkbenchOptions):string {
  const context=options.readingContext;
  if(!context)return '';
  const theme=options.data.themes.find(item=>item.themeId===context.themeId);
  const elections=context.electionIds.map(id=>options.elections.find(item=>item.electionId===id)).filter((item):item is Election=>!!item);
  const url=context.url?safeUrl(context.url):null;
  const policyRef=options.policyRef===undefined?context.policyRef:options.policyRef;
  const policyCoverage=context.selectedElectionId&&!options.data.candidateRecords.some(record=>record.electionId===context.selectedElectionId)?unresearchedPolicyMarkup:'';
  return `<article class="pw-context pw-reading-context" data-policy-reading-context><p class="pw-reading-label">${context.kind==='state'?'選択した州の材料':context.kind==='event'?'いま読んでいる予定':'いま読んでいるニュース・更新'}</p><h4>${html(context.title)}</h4>${policyCoverage}<p>${html(context.summary)}</p><p class="pw-meta">${context.kind==='event'?'予定':'出来事'} ${html(context.eventDate??'日付未確認')} · 原資料公表 ${html(context.sourcePublicationDates.join(' / ')||'日付未確認')} · ${context.kind==='event'?'予定確認':'資料確認（最新）'} ${html(context.checkedAt??'日付未確認')}${context.publishedAt?` · サイト掲載 ${html(context.publishedAt)}`:''}${context.updatedAt?` · サイト更新 ${html(context.updatedAt)}`:''}</p>${elections.length?`<p class="pw-context-races">関連州：${elections.map(election=>html(electionLabel(election,options))).join(' / ')}${theme?` · 論点：${html(theme.label)}`:''}</p>`:theme?`<p class="pw-context-races">論点：${html(theme.label)}</p>`:''}${!policyRef?'<p class="pw-reading-hint" data-policy-unselected>比較する政策版は未選択です。テーマと政策版を選んでください。</p>':''}${context.kind!=='state'||context.fact||context.limit||context.sourceIds.length||context.evidenceIds.length?`<details><summary>この材料の事実・読み方・出典</summary>${context.fact?`<p><b>確認した更新</b>：${html(context.fact)}</p>`:''}${context.limit?`<p><b>読み方・限界</b>：${html(context.limit)}</p>`:''}${context.sourceIds.length?readingSources(context.sourceIds,options.sources):url?`<p><a href="${html(url)}" target="_blank" rel="noopener noreferrer">元の資料を読む</a></p>`:'<p class="pw-meta">出典は未接続。</p>'}${context.evidenceIds.length?evidenceList(context.evidenceIds,options):''}</details>`:''}${context.feedKey?'<button type="button" class="pw-reading-return" data-policy-reading-return>元のニュース・予定に戻る</button>':''}</article>`;
}
function contextMarkup(options:PolicyWorkbenchOptions,themeId:PolicyThemeId|null,includeReading=true):string {
  const reading=options.readingContext;
  const selectedElection=options.electionId??reading?.selectedElectionId;
  const links=options.data.contextLinks.filter(link=>themeId?link.themeId===themeId:!!reading?.contextLinkIds.includes(link.linkId));
  const priority=(link:typeof links[number])=>reading?.contextLinkIds.includes(link.linkId)?0:link.electionLinks.some(ref=>ref.electionId===selectedElection)?link.scope==='state'?1:2:3;
  links.sort((left,right)=>priority(left)-priority(right));
  const markup=(link:typeof links[number])=>`<article class="pw-context"><h4>${html(link.title)}</h4><p>${html(link.description)}</p><p class="pw-meta">出来事 ${html(link.eventDate??'日付未確認')} · 公開 ${html(link.publishedAt??'日付未確認')} · 確認 ${html(link.checkedAt)}</p><p class="pw-context-races">${link.electionLinks.map(ref=>{
    const election=options.elections.find(e=>e.electionId===ref.electionId);
    if(!election)return '';
    return `${html(electionLabel(election,options))}：${ref.candidateIds.map(id=>html(election.candidates.find(c=>c.candidateId===id)?.name??'候補者未接続')).join('・')}${ref.relation==='comparison-context'?'（比較の背景）':''}`;
  }).filter(Boolean).join(' / ')}</p><details><summary>記事・候補者資料と該当箇所</summary><p>${sourceLinks(link.sourceIds,options.sources)}</p>${evidenceList(link.evidenceIds,options)}${list(link.unknowns)}</details></article>`;
  const current=includeReading?readingContextMarkup(options):'';
  if(!links.length)return `${current}${themeId?'<p class="pw-empty">関連する政策資料は未収録。</p>':''}`;
  const first=reading&&priority(links[0])===3?'':markup(links[0]);
  const more=first?links.slice(1):links;
  return `${current}${first}${more.length?`<details class="pw-more-context"><summary>その他の関連資料（${more.length}件）</summary>${more.map(markup).join('')}</details>`:''}`;
}
function savedReasonMarkup(state:ScenarioState,election:Election,data:PolicyPrototypeData,compact=false):string {
  const reason=state.reasoning?.races[election.electionId];
  if(!reason)return '<p class="pw-meta">理由は未記録。</p>';
  const current=reasonChoiceIsCurrent(state,election);
  const commonSnapshot=reason.commonAtAssessment;
  return `<div class="pw-saved-reason"><p class="pw-status${current===false?' pw-stale':''}">${current===false?'以前の選択・前提の理由・再確認が必要':current===null?'保存時の前提は未確認':reason.assessment==='hold'?'判断を保留した理由':'現在の選択に対応する理由'}</p>${current===false?`<p class="pw-meta">理由を記録した選択：${html(choiceText(reason.choiceAtAssessment,election))}</p>`:''}${compact?'<details><summary>記録済みの理由</summary>':''}<ul>${reason.assumptionIds.map(id=>{
    const a=data.assumptions.find(a=>a.assumptionId===id),assessment=commonSnapshot?.find(c=>c.assumptionId===id)?.assessment;
    return `<li>${html(a?.label??id)}（${assessment?assessmentLabels[assessment]:'記録時の判断は未確認'}）</li>`;
  }).join('')}${reason.factors.map(ref=>`<li>${html(data.factors.find(f=>f.factorId===ref.factorId)?.label??ref.factorId)}：${html(roleLabels[ref.role])}</li>`).join('')}</ul>${compact?'</details>':''}</div>`;
}
function raceMarkup(options:PolicyWorkbenchOptions,election:Election):string {
  const policyCoverage=options.data.candidateRecords.some(record=>record.electionId===election.electionId)?'':unresearchedPolicyMarkup;
  const {data,state}=options,reason=state.reasoning?.races[election.electionId],actual=state.senate[election.seatId];
  const factors=data.factors.filter(f=>f.electionId===election.electionId);
  const common=(state.reasoning?.commonAssumptions??[]).filter(c=>data.assumptions.some(a=>a.assumptionId===c.assumptionId&&a.electionIds.includes(election.electionId)));
  const allowedEvidence=[...new Set([
    ...common.flatMap(c=>data.assumptions.find(a=>a.assumptionId===c.assumptionId)?.evidenceIds??[]),
    ...factors.flatMap(f=>f.evidenceIds),
    ...data.candidateRecords.filter(r=>r.electionId===election.electionId).flatMap(r=>[...r.stanceEvidenceIds,...r.actions.flatMap(a=>a.evidenceIds)]),
    ...data.contextLinks.filter(l=>l.electionLinks.some(e=>e.electionId===election.electionId)).flatMap(l=>l.evidenceIds),
  ])];
  const actualCandidate=actual?.kind==='candidate'?actual.candidateId:actual?.kind==='unassigned'?'hold':'';
  const selectedAssumptions=reason?.assumptionIds??common.filter(c=>c.assessment==='adopt').map(c=>c.assumptionId);
  const availableEvidence=raceEvidenceIds(data,election.electionId,selectedAssumptions,reason?.factors??[]);
  return `<form class="pw-race-form" data-policy-action="apply-reasoned-choice"><input type="hidden" name="electionId" value="${html(election.electionId)}"><h4>${html(electionLabel(election,options))}の条件付き選択</h4><p class="pw-meta">現在：${html(choiceText(actual,election))}</p>${savedReasonMarkup(state,election,data,true)}${policyCoverage}<label class="pw-field">この条件なら選ぶ候補者<select name="candidateId" required><option value=""${selected(actualCandidate==='')}>候補者か保留を選ぶ</option><option value="hold"${selected(actualCandidate==='hold')}>判断を保留・未配分にする</option>${election.candidates.filter(c=>c.ballotStage!=='primary-ballot').map(candidate=>`<option value="${html(candidate.candidateId)}"${selected(actualCandidate===candidate.candidateId)}>${html(candidate.name)}（${html(candidate.partyLabel)}${candidate.status==='unconfirmed'?'・名簿確認待ち':''}${candidate.ballotStage==='write-in'?'・記名候補':''}）</option>`).join('')}</select></label><details class="pw-reason-editor"><summary>前提・州の材料・根拠を記録する</summary><fieldset><legend>この州に使う共通前提</legend>${common.length?common.map(c=>`<label class="pw-check"><input type="checkbox" name="assumptionId" value="${html(c.assumptionId)}"${checked(reason?reason.assumptionIds.includes(c.assumptionId):c.assessment==='adopt')}>${html(data.assumptions.find(a=>a.assumptionId===c.assumptionId)?.label)}（${assessmentLabels[c.assessment]}）</label>`).join(''):'<p class="pw-empty">対応する共通前提を上で記録すると選べます。</p>'}</fieldset><fieldset><legend>州・候補者の材料をどう評価するか</legend>${factors.length?factors.map(f=>`<div class="pw-factor"><label>${html(f.label)}<select name="factor:${html(f.factorId)}"><option value="">使わない</option>${(Object.keys(roleLabels) as FactorRole[]).map(role=>`<option value="${role}"${selected(reason?.factors.some(ref=>ref.factorId===f.factorId&&ref.role===role)??false)}>${roleLabels[role]}</option>`).join('')}</select></label><p>${html(f.description)}</p><details><summary>根拠と未確認事項</summary>${evidenceList(f.evidenceIds,options)}${list(f.unknowns)}</details></div>`).join(''):'<p class="pw-empty">理由に使う候補者別の政策材料は未収録。候補者の選択と保留は記録できます。</p>'}</fieldset><details class="pw-race-evidence"><summary>理由に使う公開根拠を選ぶ（${REASONING_LIMITS.evidence}件まで）</summary><p class="pw-meta">根拠欄は、選んだ前提・材料に連動します。</p>${evidenceControls(allowedEvidence,reason?.evidenceIds??[],options,availableEvidence)}</details></details><details class="pw-private"><summary>個人メモ（このブラウザの保存のみ・共有URL対象外）</summary><label class="pw-field">個人メモ<textarea name="privateNote" maxlength="${REASONING_LIMITS.privateNote}" rows="3">${html(reason?.privateNote??'')}</textarea></label></details><button type="submit" class="pw-primary">選択と理由をこの案へ反映</button><p data-policy-validation role="status" aria-live="polite" hidden></p></form>`;
}
function raceSummaryMarkup(options:PolicyWorkbenchOptions):string {
  const elections=options.elections.filter(e=>options.data.focusElectionIds.includes(e.electionId));
  return `<ul class="pw-race-summary">${elections.map(election=>{
    const choice=options.state.senate[election.seatId],current=reasonChoiceIsCurrent(options.state,election);
    return `<li><button type="button" data-policy-action="choose-election" data-election-id="${html(election.electionId)}">${html(electionLabel(election,options))}</button><span>${html(choiceText(choice,election))}</span><small${current===false?' class="pw-stale"':''}>${current===false?'理由が以前の選択・前提のまま':current===true?'理由あり':options.state.reasoning?.races[election.electionId]?'保存時の前提は未確認':'理由未記録'}</small></li>`;
  }).join('')}</ul>`;
}
function actionsMarkup(record:CandidatePolicyRecord,data:PolicyPrototypeData,options:Pick<PolicyWorkbenchOptions,'data'|'sources'|'evidence'>):string {
  if(!record.actions.length)return '<p class="pw-empty">行動の記録は未収録。</p>';
  return `<ol class="pw-actions">${record.actions.map(action=>{
    const target=action.targetPolicyRef?data.policies.find(p=>policyKey(p)===policyKey(action.targetPolicyRef!)):null;
    const locator=action.locator.startsWith('既存EvidenceRef ')?action.evidenceIds.map(id=>evidenceEntries(options).get(id)).filter((entry):entry is EvidenceRef=>!!entry).map(readerEvidenceLocator).join('／')||'原文の具体的な箇所は未特定。':action.locator;
    return `<li><b>${html(actionLabels[action.kind])}${action.kind==='vote'?`（${action.vote==='yea'?'賛成':'反対'}）`:''}</b><span class="pw-scope">${action.scope==='exact-policy'?'この政策版':action.scope==='whole-measure'?'法案全体':'関連論点'}</span><p>${html(action.text)}</p>${target?`<p class="pw-meta">行動の対象：${html(target.title)} · ${html(policyVersionLabel(target))}</p>`:''}<p class="pw-meta">行動日 ${html(action.actionDate??'不明')} · 確認日 ${html(action.checkedAt)}</p><p class="pw-meta">箇所：${html(locator)}</p>${evidenceList(action.evidenceIds,options)}</li>`;
  }).join('')}</ol>`;
}
function candidateStanceMarkup(knowledge:ReturnType<typeof candidatePolicyKnowledge>):string {
  if(knowledge.status==='unresearched')return '<p class="pw-status">未確認 <span class="pw-scope">この政策版は未調査</span></p><p class="pw-meta">行動の記録：未調査</p>';
  const record=knowledge.record;
  return `<p class="pw-status"><span class="pw-stance pw-stance-${html(record.stance)}">${stanceLabels[record.stance]??'未確認'}</span><span class="pw-scope">${record.stancePeriod==='historical'?'過去の立場':record.stancePeriod==='campaign-as-of'?'公約資料時点':'立場未確認'} ${html(record.stanceAsOf??'')}</span></p><p class="pw-meta">確認日 ${html(record.checkedAt)} · 重点 ${record.explicitlyPrioritized===true?'明示':record.explicitlyPrioritized===false?'なし（記録）':'未確認'}</p>${record.conditions.length?`<div class="pw-conditions"><b>支持する条件</b>${list(record.conditions)}</div>`:''}`;
}
function candidateEvidenceMarkup(record:CandidatePolicyRecord,options:Pick<PolicyWorkbenchOptions,'data'|'sources'|'evidence'>):string {
  return `<details><summary>立場の根拠・行動の記録</summary>${record.stanceEvidenceIds.length?`<b>この政策版への立場の根拠</b>${evidenceList(record.stanceEvidenceIds,options)}`:'<p class="pw-meta">この政策版への立場の根拠は未確認。</p>'}<h5>行動の記録</h5>${actionsMarkup(record,options.data,options)}${list(record.unknowns)}</details>`;
}
function candidateRecordMarkup(knowledge:ReturnType<typeof candidatePolicyKnowledge>,options:Pick<PolicyWorkbenchOptions,'data'|'sources'|'evidence'>):string {
  return candidateStanceMarkup(knowledge)+(knowledge.status==='recorded'?candidateEvidenceMarkup(knowledge.record,options):'');
}
function candidateIdentityMarkup(candidate:Candidate):string {
  return `<b>${html(candidate.name)}</b><p class="pw-meta">${html(candidate.partyLabel)}${candidate.ballotStage==='write-in'?' · 記名候補':''}${candidate.status==='unconfirmed'?' · 本選名簿確認待ち':''}</p>`;
}
function candidateActionsOverview(knowledge:ReturnType<typeof candidatePolicyKnowledge>):string {
  if(knowledge.status==='unresearched')return '<p class="pw-meta">行動の記録：未調査</p>';
  if(!knowledge.record.actions.length)return '<p class="pw-meta">行動の記録は未収録。</p>';
  return `<ul class="pw-action-overview">${knowledge.record.actions.map(action=>`<li><b>${html(actionLabels[action.kind])}${action.kind==='vote'?`（${action.vote==='yea'?'賛成':'反対'}）`:''}</b><span class="pw-scope">${action.scope==='exact-policy'?'この政策版':action.scope==='whole-measure'?'法案全体':'関連論点'}</span><small>行動日 ${html(action.actionDate??'不明')} · 確認日 ${html(action.checkedAt)}</small></li>`).join('')}</ul>`;
}
/** Reading candidates does not require, create, or change an assumed winner. */
function candidatePolicyReadingMarkup(options:PolicyWorkbenchOptions,election:Election,policy:PolicySpec):string {
  const candidates=election.candidates.filter(candidate=>candidate.ballotStage!=='primary-ballot');
  const printed=candidates.filter(candidate=>candidate.ballotStage!=='write-in');
  const writeIns=candidates.filter(candidate=>candidate.ballotStage==='write-in');
  const archived=election.candidates.filter(candidate=>candidate.ballotStage==='primary-ballot');
  const recorded=candidates.filter(candidate=>candidatePolicyKnowledge(options.data,candidate.candidateId,policy).status==='recorded').length;
  const rows=(items:Candidate[])=>items.map(candidate=>{
    const knowledge=candidatePolicyKnowledge(options.data,candidate.candidateId,policy);
    return `<tr data-policy-candidate="${html(candidate.candidateId)}"><th scope="row">${candidateIdentityMarkup(candidate)}<details><summary>候補者名簿・資料</summary><p class="pw-meta">${sourceLinks(candidate.sourceIds,options.sources)}</p></details></th><td>${candidateStanceMarkup(knowledge)}</td><td>${candidateActionsOverview(knowledge)}${knowledge.status==='recorded'?candidateEvidenceMarkup(knowledge.record,options):''}</td></tr>`;
  }).join('');
  const table=(items:Candidate[],caption:string)=>`<div class="pw-reader-table-wrap"><table class="pw-reader-table"><caption>${html(caption)}</caption><thead><tr><th scope="col">候補者</th><th scope="col">この政策版への立場・条件</th><th scope="col">確認した行動と根拠</th></tr></thead><tbody>${rows(items)}</tbody></table></div>`;
  return `<div class="pw-policy-reading" data-policy-candidate-reading><h3>${html(electionLabel(election,options))}の候補者と政策記録</h3><p class="pw-meta" data-policy-research-coverage>この政策版の記録 ${recorded}人 · 未調査 ${candidates.length-recorded}人。未調査は賛成・反対や関心の低さを示しません。</p>${!options.data.candidateRecords.some(record=>record.electionId===election.electionId)?unresearchedPolicyMarkup:''}${printed.length?table(printed,`${electionLabel(election,options)}：本選の印刷候補として収録した候補者`):'<p class="pw-empty">本選の印刷候補の情報は未収録。</p>'}${writeIns.length?`<details class="pw-write-in-candidates"><summary>記名候補（${writeIns.length}人・政策記録も確認する）</summary>${table(writeIns,`${electionLabel(election,options)}：記名候補として収録した候補者`)}</details>`:''}${archived.length?`<details class="pw-archived-candidates"><summary>予備選時点の候補者（${archived.length}人・本選の比較から区別）</summary>${table(archived,`${electionLabel(election,options)}：予備選時点の候補者`)}</details>`:''}</div>`;
}
function policyAssessmentMarkup(options:PolicyWorkbenchOptions,policy:PolicySpec):string {
  const report=describePolicyScenario(options.data,policy,options.state,options.seats,options.elections,options.powerRules);
  const stanceCounts={support:0,conditional:0,oppose:0,unknown:0};
  report.candidateRows.forEach(row=>stanceCounts[row.knowledge.status==='recorded'?row.knowledge.record.stance:'unknown']++);
  const unassessed=report.coverage.totalSeats-report.coverage.selectedCandidateSeats.length;
  const candidateAssessment=report.candidateRows.length?`<div class="pw-coverage"><p><b>選択した候補者 ${report.candidateRows.length}人</b>：支持 ${stanceCounts.support} · 条件付き ${stanceCounts.conditional} · 反対 ${stanceCounts.oppose} · 未確認 ${stanceCounts.unknown}</p><p>候補者未評価 ${unassessed} / ${report.coverage.totalSeats}議席（基準の配分・非改選 ${report.coverage.heldOrBaselineSeatsWithoutCandidateAssessment.length}、会派のみ ${report.coverage.caucusOnlySeats.length}、未配分 ${report.coverage.unassignedSeats.length}）</p><p>この政策版の記録 ${report.researchCoverage.candidateIdsWithRecords.length}候補 · 選択候補の未調査 ${report.researchCoverage.unresearchedSelectedCandidateIds.length}人</p><p class="pw-meta">候補者資料の立場。全${report.coverage.totalSeats}議席の賛成票数・将来の採決予測は未評価。</p></div><details class="pw-records-detail"><summary>選択候補者の立場と行動（${report.candidateRows.length}人）</summary><div class="pw-candidate-records">${report.candidateRows.length?report.candidateRows.map(row=>{
    const election=options.elections.find(e=>e.electionId===row.electionId)!,candidate=election.candidates.find(c=>c.candidateId===row.candidateId)!;
    return `<article><h4>${html(electionLabel(election,options))}：${html(candidate.name)}</h4>${row.reasonCurrent===false?'<p class="pw-stale">以前の選択・前提の理由・再確認が必要</p>':''}${candidateRecordMarkup(row.knowledge,options)}<p class="pw-meta">候補者名簿・資料：${sourceLinks(candidate.sourceIds,options.sources)}</p></article>`;
  }).join(''):'<p class="pw-empty">候補者を選ぶと、この政策版の立場と行動を表示します。</p>'}</div></details>`:'<p class="pw-empty" data-policy-empty-state>上の欄で当選を仮定する候補者を選ぶと、その政策への立場と行動を確認できます。</p>';
  return candidateAssessment;
}
function policyDefinitionMarkup(options:PolicyWorkbenchOptions,policy:PolicySpec):string {
  return `<div class="pw-policy-definition"><h4>${html(policy.title)}</h4><p>${html(policy.definition)}</p><p class="pw-meta">${html(policyVersionLabel(policy))} · 対象時点 ${html(policy.scopeDate??'日付を特定せず')} · ${policy.specification==='identified-measure'?'採決対象を特定':'設計の一部を収録'}</p><details><summary>政策の定義と出典</summary>${evidenceList(policy.evidenceIds,options)}${list(policy.unknowns)}</details></div>`;
}
function policyInstitutionsMarkup(options:PolicyWorkbenchOptions,policy:PolicySpec):string {
  const report=describePolicyScenario(options.data,policy,options.state,options.seats,options.elections,options.powerRules);
  return `<div class="pw-institution-reading"><h3>政策を実現する条件</h3><p class="section-intro" data-section-intro="conditions">${html(sectionIntroductions.conditions)}</p><div class="pw-institution-summary" data-policy-institution-summary>${report.institutionalRoutes.map(route=>`<article><h4>${routeLabels[route.route]}</h4><p><b>下院：</b>${html(route.house)}<br><b>上院：</b>${html(route.senate)}</p><p><b>必要条件：</b>${html(route.threshold)}</p><p><b>大統領との関係：</b>${html(route.presidentialConstraint)}</p></article>`).join('')}</div><details class="pw-institutions"><summary>成立・調査に必要な制度条件 <span class="pw-scope">未判定</span></summary><div class="pw-route-grid">${report.institutionalRoutes.map(route=>`<article><h4>${routeLabels[route.route]}</h4><dl><div><dt>下院</dt><dd>${html(route.house)}</dd></div><div><dt>上院</dt><dd>${html(route.senate)}</dd></div><div><dt>必要条件</dt><dd>${html(route.threshold)}</dd></div><div><dt>大統領との関係</dt><dd>${html(route.presidentialConstraint)}</dd></div></dl>${list(route.conditions)}<p class="pw-meta">${sourceLinks(route.sourceIds,options.sources)}</p></article>`).join('')}</div></details></div>`;
}

/** Self-contained markup. Scenario mutation and persistence remain with the caller. */
export function renderPolicyWorkbench(options:PolicyWorkbenchOptions):string {
  const {data}=options;
  const requestedTheme=options.themeId===undefined?options.readingContext?.themeId:options.themeId;
  const theme=data.themes.find(t=>t.themeId===requestedTheme)??(!options.readingContext?data.themes[0]:undefined);
  if(!data.themes.length)return '<section class="policy-workbench"><p>政策テーマは未収録。</p></section>';
  const focusElections=options.elections.filter(e=>data.focusElectionIds.includes(e.electionId));
  const election=focusElections.find(e=>e.electionId===(options.electionId??options.readingContext?.selectedElectionId))??focusElections[0];
  const policies=theme?data.policies.filter(p=>p.themeId===theme.themeId):[];
  const requestedPolicy=options.policyRef===undefined?options.readingContext?.policyRef:options.policyRef;
  const policy=policies.find(p=>requestedPolicy&&policyKey(p)===policyKey(requestedPolicy))??(!options.readingContext&&options.policyRef!==null?policies[0]:undefined);
  const saved=options.savedScenarios??[],left=saved.find(s=>s.id===options.comparison?.leftId),right=saved.find(s=>s.id===options.comparison?.rightId);
  return `<section class="policy-workbench section-block" id="policy-workbench" aria-labelledby="policy-workbench-heading">
    <div class="section-heading"><div><p class="kicker">候補者の政策記録</p><h2 id="policy-workbench-heading">政策への立場と行動を読む</h2></div></div>
    <div class="pw-reader-controls">
      <div class="pw-theme-buttons" role="group" aria-label="政策テーマ">${data.themes.map(t=>`<button type="button" data-policy-action="choose-theme" data-theme-id="${html(t.themeId)}" aria-pressed="${t.themeId===theme?.themeId}">${html(t.label)}</button>`).join('')}</div>
      <label class="pw-field">州<select data-policy-action="choose-election">${focusElections.map(e=>`<option value="${html(e.electionId)}"${selected(e.electionId===election?.electionId)}>${html(electionLabel(e,options))}</option>`).join('')}</select></label>
      <label class="pw-field pw-policy-picker">政策と版<select data-policy-action="choose-policy">${options.readingContext||!policy?`<option value=""${selected(!policy)}>比較する政策版を選ぶ</option>`:''}${policies.map(p=>`<option value="${html(policyKey(p))}"${selected(p===policy)}>${html(p.title)} — ${html(policyVersionLabel(p))}</option>`).join('')}</select></label>
    </div>
    ${options.readingContext?readingContextMarkup(options):''}
    ${policy?`${policyDefinitionMarkup(options,policy)}${election?candidatePolicyReadingMarkup(options,election,policy):'<p class="pw-empty">対象選挙は未収録。</p>'}${policyInstitutionsMarkup(options,policy)}`:'<p class="pw-empty" data-policy-unselected>比較する政策版を選ぶと、候補者の立場と行動、実現に必要な制度条件を確認できます。</p>'}
    <details class="pw-reader-context" data-policy-disclosure="context"><summary>関連する全国・州の資料を読む</summary><p class="section-intro" data-section-intro="context">${html(sectionIntroductions.context)}</p>${contextMarkup({...options,electionId:election?.electionId},theme?.themeId??null,false)}</details>
    <details class="pw-optional-workbench" data-policy-disclosure="scenario"><summary>自分の前提と当落の理由を記録・比較する（任意）</summary>
      <div class="pw-step"><h3>この案に置く共通前提</h3><p class="section-intro" data-section-intro="assumption">${html(sectionIntroductions.assumption)}</p>${theme?assumptionMarkup(options,theme.themeId):'<p class="pw-empty">テーマを選ぶと、比較する共通前提を確認できます。</p>'}<p class="pw-meta">利用者の仮定。支持率や当選確率への換算はしない。</p></div>
      <div class="pw-choice-grid"><div class="pw-step"><h3>この州の候補者と当落の理由を記録する</h3><p class="section-intro" data-section-intro="choice">${html(sectionIntroductions.choice)}</p>${election?raceMarkup(options,election):'<p class="pw-empty">対象選挙は未収録。</p>'}</div><aside class="pw-scenario-summary"><h3>現在の案</h3><p class="section-intro" data-section-intro="counts">${html(sectionIntroductions.counts)}</p>${countsMarkup(options.state,options.seats,options.elections)}<details class="pw-state-choices" data-policy-disclosure="state-choices"><summary>州ごとの選択と理由（${focusElections.length}州）</summary>${raceSummaryMarkup(options)}</details><a href="#scenario-manager">案の保存・共有へ</a><p class="pw-meta">理由の公開IDと選んだ根拠を共有。個人メモは共有URLに含まれない。</p></aside></div>
      ${policy?`<div class="pw-step pw-policy-step"><h3>この案で選んだ候補者の政策記録</h3>${policyAssessmentMarkup(options,policy)}</div>`:''}
      <div class="pw-comparison"><h3>保存した2案の理由を比べる</h3><p class="section-intro" data-section-intro="reasoningComparison">${html(sectionIntroductions.reasoningComparison)}</p><div class="pw-comparison-pickers">${(['left','right'] as const).map(side=>`<label>${side==='left'?'左の案':'右の案'}<select data-policy-action="choose-comparison" data-side="${side}"><option value="">保存案を選ぶ</option>${saved.map(item=>`<option value="${html(item.id)}"${selected(item.id===options.comparison?.[`${side}Id`])}>${html(item.name)}</option>`).join('')}</select></label>`).join('')}</div>${left&&right?renderPolicyReasoningComparison(left,right,{data,seats:options.seats,elections:options.elections,states:options.states,policyRef:policy,sources:options.sources,evidence:options.evidence}):'<p class="pw-empty">案を保存し、左右で選ぶと、議席・共通前提・州ごとの理由の違いを表示します。</p>'}</div>
    </details>
  </section>`;
}

export interface PolicyComparisonOptions {data:PolicyPrototypeData;seats:Seat[];elections:Election[];states?:State[];policyRef?:PolicyRef|null;sources?:Source[];evidence?:EvidenceRef[]}
function comparisonReason(state:ScenarioState,election:Election,options:PolicyComparisonOptions):string {
  const reason=state.reasoning?.races[election.electionId];
  const linkedEvidence=reason?[...new Set([
    ...reason.evidenceIds,
    ...reason.factors.flatMap(ref=>options.data.factors.find(f=>f.factorId===ref.factorId)?.evidenceIds??[]),
    ...reason.assumptionIds.flatMap(id=>reason.commonAtAssessment?.find(c=>c.assumptionId===id)?.evidenceIds??[]),
  ])]:[];
  return `<p><b>${html(choiceText(state.senate[election.seatId],election))}</b></p>${savedReasonMarkup(state,election,options.data)}${linkedEvidence.length?`<details><summary>理由に結び付く公開資料</summary>${options.sources&&options.evidence?evidenceList(linkedEvidence,{data:options.data,sources:options.sources,evidence:options.evidence}):`<p class="pw-meta">${linkedEvidence.map(html).join(' / ')}</p>`}</details>`:''}`;
}
/** Private note contents are deliberately omitted from all comparison output. */
export function renderPolicyReasoningComparison(left:SavedScenario,right:SavedScenario,options:PolicyComparisonOptions):string {
  const comparison=comparePolicyScenarios(left.state,right.state,options.seats,options.elections);
  const changed=new Set([...comparison.choiceChanges.map(c=>c.electionId),...comparison.reasoning.raceChanges.map(c=>c.electionId)]);
  const changedAssumptions=new Set(comparison.reasoning.commonChanges.map(c=>c.assumptionId));
  for(const state of [left.state,right.state])for(const [electionId,reason]of Object.entries(state.reasoning?.races??{})) {
    if(reason.assumptionIds.some(id=>changedAssumptions.has(id)))changed.add(electionId);
  }
  const privateChanges=comparison.reasoning.privateNoteChanged||comparison.reasoning.raceChanges.some(c=>c.privateNoteChanged);
  return `<div class="pw-comparison-result"><div class="pw-comparison-totals"><article><h4>${html(left.name)}</h4>${countsMarkup(left.state,options.seats,options.elections)}</article><article><h4>${html(right.name)}</h4>${countsMarkup(right.state,options.seats,options.elections)}</article></div><h4>共通前提の違い</h4>${comparison.reasoning.commonChanges.length?`<ul>${comparison.reasoning.commonChanges.map(c=>`<li><b>${html(options.data.assumptions.find(a=>a.assumptionId===c.assumptionId)?.label??c.assumptionId)}</b>：左 ${c.left?assessmentLabels[c.left.assessment]:'未記録'} → 右 ${c.right?assessmentLabels[c.right.assessment]:'未記録'}${JSON.stringify(c.left?.evidenceIds)!==JSON.stringify(c.right?.evidenceIds)?'<span class="pw-scope">公開根拠の選択も異なる</span>':''}</li>`).join('')}</ul>`:'<p class="pw-meta">共通前提に違いはありません。</p>'}<h4>候補者と理由の違い</h4>${changed.size?[...changed].map(id=>{
    const election=options.elections.find(e=>e.electionId===id);
    if(!election)return '';
    return `<article class="pw-race-comparison"><h5>${html(electionLabel(election,options))}</h5><div><section aria-label="${html(left.name)}の理由">${comparisonReason(left.state,election,options)}</section><section aria-label="${html(right.name)}の理由">${comparisonReason(right.state,election,options)}</section></div></article>`;
  }).join(''):'<p class="pw-meta">候補者と州ごとの理由に違いはありません。</p>'}${options.policyRef?`<h4>この政策版での選択候補者</h4><div class="pw-policy-comparison">${[left,right].map(item=>`<section><h5>${html(item.name)}</h5><ul>${options.elections.flatMap(e=>{
    const choice=item.state.senate[e.seatId],candidate=choice?candidateForChoice(choice,e):null;
    if(!candidate)return [];
    const knowledge=candidatePolicyKnowledge(options.data,candidate.candidateId,options.policyRef!);
    return [`<li>${html(electionLabel(e,options))}：${html(candidate.name)} — ${knowledge.status==='recorded'?stanceLabels[knowledge.record.stance]:'未確認（未調査）'}</li>`];
  }).join('')}</ul></section>`).join('')}</div>`:''}${privateChanges?'<p class="pw-meta">個人メモの変更あり（本文は比較・共有に表示しません）。</p>':''}</div>`;
}

/** FormData and URLSearchParams both satisfy this interface; no DOM needed to test parsing. */
export interface PolicyActionValues {get(name:string):unknown;getAll(name:string):unknown[]}
const field=(values:PolicyActionValues,name:string)=>{const value=values.get(name);return typeof value==='string'?value:null;};
function raceEvidenceIds(data:PolicyPrototypeData,electionId:string,assumptionIds:string[],factors:RaceReasoning['factors']):Set<string> {
  return new Set([
    ...assumptionIds.flatMap(id=>data.assumptions.find(a=>a.assumptionId===id)?.evidenceIds??[]),
    ...factors.flatMap(f=>data.factors.find(candidate=>candidate.factorId===f.factorId)?.evidenceIds??[]),
    ...data.candidateRecords.filter(r=>r.electionId===electionId).flatMap(r=>[...r.stanceEvidenceIds,...r.actions.flatMap(a=>a.evidenceIds)]),
    ...data.contextLinks.filter(l=>l.electionLinks.some(e=>e.electionId===electionId)).flatMap(l=>l.evidenceIds),
  ]);
}
function ids(values:PolicyActionValues,name:string,allowed:Set<string>,limit:number):string[]|null {
  const entries=values.getAll(name);
  if(entries.length>limit||entries.some(v=>typeof v!=='string'||!allowed.has(v)))return null;
  return [...new Set(entries as string[])].sort();
}
/** Reject malformed or out-of-scope IDs before callers mutate a scenario. */
export function parsePolicyIntent(action:string,values:PolicyActionValues,context:PolicyActionContext):PolicyWorkbenchIntent|null {
  const {data}=context;
  if(action==='choose-theme') {
    const themeId=field(values,'value');
    return data.themes.some(t=>t.themeId===themeId)?{type:action,themeId:themeId as PolicyThemeId}:null;
  }
  if(action==='choose-election') {
    const electionId=field(values,'value');
    return electionId&&data.focusElectionIds.includes(electionId)&&context.elections.some(e=>e.electionId===electionId)?{type:action,electionId}:null;
  }
  if(action==='choose-policy') {
    const policy=data.policies.find(p=>policyKey(p)===field(values,'value'));
    return policy?{type:action,policyRef:{policyId:policy.policyId,versionId:policy.versionId}}:null;
  }
  if(action==='choose-comparison') {
    const side=field(values,'side'),savedScenarioId=field(values,'value');
    if(side!=='left'&&side!=='right'||savedScenarioId===null)return null;
    return savedScenarioId===''||context.savedScenarios?.some(s=>s.id===savedScenarioId)?{type:action,side,savedScenarioId:savedScenarioId||null}:null;
  }
  if(action==='set-common-assumption') {
    const assumption=data.assumptions.find(a=>a.assumptionId===field(values,'assumptionId')),assessment=field(values,'assessment');
    if(!assumption||!['adopt','reject','hold'].includes(assessment??''))return null;
    const evidenceIds=ids(values,'evidenceId',new Set(assumption.evidenceIds),REASONING_LIMITS.evidence);
    return evidenceIds?{type:action,choice:{assumptionId:assumption.assumptionId,assessment:assessment as AssumptionAssessment,evidenceIds}}:null;
  }
  if(action!=='apply-reasoned-choice')return null;
  const electionId=field(values,'electionId'),election=context.elections.find(e=>e.electionId===electionId),candidateId=field(values,'candidateId');
  if(!election||!data.focusElectionIds.includes(election.electionId)||!candidateId)return null;
  if(candidateId!=='hold'&&!election.candidates.some(c=>c.candidateId===candidateId&&c.ballotStage!=='primary-ballot'))return null;
  const common=context.state?.reasoning?.commonAssumptions??[];
  const assumptionIds=ids(values,'assumptionId',new Set(common.filter(c=>data.assumptions.some(a=>a.assumptionId===c.assumptionId&&a.electionIds.includes(election.electionId))).map(c=>c.assumptionId)),REASONING_LIMITS.common);
  if(!assumptionIds)return null;
  const factors:RaceReasoning['factors']=[];
  for(const factor of data.factors.filter(f=>f.electionId===election.electionId)) {
    const role=field(values,`factor:${factor.factorId}`);
    if(!role)continue;
    if(!Object.hasOwn(roleLabels,role))return null;
    factors.push({factorId:factor.factorId,role:role as FactorRole});
  }
  if(factors.length>REASONING_LIMITS.factors)return null;
  const allowedEvidence=raceEvidenceIds(data,election.electionId,assumptionIds,factors);
  const evidenceIds=ids(values,'evidenceId',allowedEvidence,REASONING_LIMITS.evidence),privateNote=field(values,'privateNote')??'';
  if(!evidenceIds||privateNote.length>REASONING_LIMITS.privateNote)return null;
  const choice:SenateChoice=candidateId==='hold'?{kind:'unassigned',electionId:election.electionId}:{kind:'candidate',electionId:election.electionId,candidateId};
  return {type:action,electionId:election.electionId,choice,reason:{assessment:candidateId==='hold'?'hold':'conditional',assumptionIds,factors,evidenceIds,...(privateNote?{privateNote}:{})}};
}

/** Keep public evidence choices aligned with the selected assumptions and materials. */
export function refreshPolicyEvidenceControls(target:Element,context:PolicyActionContext):void {
  const form=target.closest<HTMLFormElement>('form[data-policy-action="apply-reasoned-choice"]');
  if(!form)return;
  const values=new FormData(form),electionId=field(values,'electionId');
  if(!electionId)return;
  const assumptionIds=values.getAll('assumptionId').filter((id):id is string=>typeof id==='string');
  const factors:RaceReasoning['factors']=context.data.factors.filter(f=>f.electionId===electionId).flatMap(f=>{
    const role=field(values,`factor:${f.factorId}`);
    return role&&Object.hasOwn(roleLabels,role)?[{factorId:f.factorId,role:role as FactorRole}]:[];
  });
  const available=raceEvidenceIds(context.data,electionId,assumptionIds,factors);
  form.querySelectorAll<HTMLInputElement>('.pw-evidence-controls input[name="evidenceId"]').forEach(input=>{
    const enabled=available.has(input.value);
    input.disabled=!enabled;
    if(!enabled)input.checked=false;
    const row=input.closest<HTMLElement>('.pw-evidence-controls>div');
    if(row)row.hidden=!enabled;
  });
}

/** Delegate submit for forms, click for theme/state buttons, and change for selects. */
export function readPolicyAction(target:Element,context:PolicyActionContext):PolicyWorkbenchIntent|null {
  const node=target.closest<HTMLElement>('[data-policy-action]');
  if(!node)return null;
  const action=node.dataset.policyAction;
  if(!action)return null;
  if(node instanceof HTMLFormElement) {
    refreshPolicyEvidenceControls(target,context);
    if(target!==node)return null;
    const intent=parsePolicyIntent(action,new FormData(node),context);
    const status=node.querySelector<HTMLElement>('[data-policy-validation]');
    if(status){status.hidden=!!intent;status.textContent=intent?'':`入力を確認してください。公開根拠は選んだ前提・材料に対応するものだけ、個人メモは${REASONING_LIMITS.privateNote}字以内です。`;}
    return intent;
  }
  const values=new URLSearchParams();
  values.set('value',node instanceof HTMLSelectElement?node.value:node.dataset.themeId??node.dataset.electionId??'');
  if(node.dataset.side)values.set('side',node.dataset.side);
  return parsePolicyIntent(action,values,context);
}
