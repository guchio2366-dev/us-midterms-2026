import type { Candidate, Election, Source } from '../data/model';
import type { CandidateBrief, EvidenceRef } from '../data/research-model';
import type { CandidatePolicyRecord } from '../data/policy-prototype-model';
import { sources } from '../data/data';
import { candidateBriefs } from '../data/research';
import { evidenceRefs } from '../data/research-sources';
import { observationData } from '../data/observation';
import { policyPrototype } from '../data/policy-prototype';
import { policyKey } from '../policy-prototype-logic';
import { policyVersionLabel } from './policy-version-labels';

const html=(value:unknown)=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const sourceById=new Map([...sources,...observationData.sources].map(source=>[source.sourceId,source]));
const evidenceById=new Map<string,EvidenceRef>([...evidenceRefs,...observationData.evidenceRefs,...policyPrototype.additionalEvidence].map(evidence=>[evidence.evidenceId,evidence]));
const policyByKey=new Map(policyPrototype.policies.map(policy=>[policyKey(policy),policy]));
const stanceLabels={support:'支持',conditional:'条件付き支持',oppose:'反対',unknown:'未確認'} as const;
const actionLabels={
  'stated-priority':'重点方針',introduced:'提出',cosponsored:'共同提案',vote:'採決',statement:'声明','requested-action':'要請',
} as const;
// An editorial display pair drawn from the current roster; this does not assign a party or caucus.
const specifiedDisplayPairs:Record<string,string[]>={
  '2026-AK-2-regular':['cand-ak-dan-s-sullivan','cand-ak-mary-peltola'],
  '2026-NE-2-regular':['cand-ne-dan-osborn','cand-ne-pete-ricketts'],
};

function sourceLink(source:Source):string {
  let url:string|null=null;
  try {const parsed=new URL(source.url);if(['https:','http:'].includes(parsed.protocol))url=parsed.href;} catch { /* Invalid source URLs stay plain text. */ }
  const label=`${source.publisher}：${source.title}`;
  return `${url?`<a href="${html(url)}" target="_blank" rel="noopener noreferrer">${html(label)}</a>`:html(label)}<small>資料公表 ${html(source.publishedAt??'日付未確認')}${source.updatedAt?` · 資料更新 ${html(source.updatedAt)}`:''} · 内容確認 ${html(source.contentVerifiedAt??'日付未確認')}</small>${source.referencePeriod?`<small>資料の対象：${html(source.referencePeriod)}</small>`:''}`;
}
function readerLocator(entry:EvidenceRef):string {
  if(entry.evidenceId==='ev-prototype-collins-medicaid-work')return '2025年7月1日声明の、就労要件と養育・介護・就学の例外についての説明。';
  if(entry.evidenceId==='ev-prototype-collins-medicaid-funding')return '2025年7月1日声明の、将来のMedicaid資金削減と地方医療への影響についての説明。';
  return /既存EvidenceRef|ev-prototype-/.test(entry.locator)?'原文の具体的な箇所は未特定。':entry.locator;
}
function sourceDetails(sourceIds:string[],evidenceIds:string[]):string {
  return `<ul class="reader-candidate-sources">${[...new Set(sourceIds)].map(id=>{
    const source=sourceById.get(id);
    return source?`<li>${sourceLink(source)}</li>`:'<li>出典未接続</li>';
  }).join('')}</ul>${evidenceIds.length?`<ul class="reader-candidate-evidence">${[...new Set(evidenceIds)].map(id=>{
    const entry=evidenceById.get(id);
    return entry?`<li>${html(readerLocator(entry))}<small>該当箇所確認 ${html(entry.checkedAt)}</small></li>`:'<li>根拠の該当箇所は未接続。</li>';
  }).join('')}</ul>`:''}`;
}
function briefFor(candidate:Candidate):CandidateBrief|undefined {
  return candidateBriefs.find(brief=>brief.candidateId===candidate.candidateId&&brief.status==='published'&&brief.sourceIds.length&&brief.evidenceIds.length);
}
function recordsFor(candidate:Candidate,election:Election):CandidatePolicyRecord[] {
  return policyPrototype.candidateRecords.filter(record=>record.candidateId===candidate.candidateId&&record.electionId===election.electionId&&policyByKey.has(policyKey(record)));
}
function policySummary(record:CandidatePolicyRecord):string {
  const policy=policyByKey.get(policyKey(record))!;
  const exactAction=record.actions.find(action=>action.scope==='exact-policy')??record.actions[0];
  return `<div class="reader-candidate-policy" data-reader-policy-record="${html(record.recordId)}"><p><b>${stanceLabels[record.stance]}：${html(policy.title)}</b></p><small>${html(policyVersionLabel(policy))} · ${record.stancePeriod==='historical'?'過去の立場':record.stancePeriod==='campaign-as-of'?'公約資料時点':'立場未確認'} ${html(record.stanceAsOf??'')} · 確認 ${html(record.checkedAt)}</small>${record.conditions.length?`<p class="reader-candidate-condition">条件：${record.conditions.map(html).join('／')}</p>`:''}${exactAction?`<p>${html(exactAction.text)}${exactAction.scope!=='exact-policy'?`<small>${exactAction.scope==='whole-measure'?'法案全体の記録':'関連論点の記録'}。この政策版への賛否とは区別。</small>`:''}</p>`:''}</div>`;
}
function recordDetails(record:CandidatePolicyRecord):string {
  const policy=policyByKey.get(policyKey(record))!;
  return `<section class="reader-candidate-record-details"><h5>${html(policy.title)}：行動の記録</h5><ul>${record.actions.map(action=>`<li><b>${actionLabels[action.kind]}${action.kind==='vote'?`（${action.vote==='yea'?'賛成':'反対'}）`:''}</b> · ${action.scope==='exact-policy'?'この政策版':action.scope==='whole-measure'?'法案全体':'関連論点'}<p>${html(action.text)}</p><small>行動日 ${html(action.actionDate??'不明')} · 確認日 ${html(action.checkedAt)}</small>${action.targetPolicyRef?`<small>対象：${html(policyByKey.get(policyKey(action.targetPolicyRef))?.title??'政策の記録は未接続')}</small>`:''}</li>`).join('')}</ul>${record.unknowns.length?`<p>${record.unknowns.map(html).join('／')}</p>`:''}</section>`;
}
function candidateCard(candidate:Candidate,election:Election):string {
  const brief=briefFor(candidate),records=recordsFor(candidate,election);
  const forward=records.find(record=>(record.stance==='support'||record.stance==='conditional')&&record.stancePeriod==='campaign-as-of')
    ??records.find(record=>record.stance==='conditional'&&policyByKey.get(policyKey(record))?.kind==='described-design');
  const opposition=records.find(record=>record.stance==='oppose');
  const unknown=records.find(record=>record.stance==='unknown');
  const briefForward=brief?.currentPositions.find(position=>/医療|関税|通商|保険|VA/.test(position))??brief?.currentPositions[0];
  const briefOpposition=brief?.opposedPolicies.find(position=>!/未確認|記載のない/.test(position));
  const scrutiny=opposition??(!briefOpposition?unknown:undefined);
  const scrutinyHeading=scrutiny?.stance==='unknown'?'確認待ちの政策':'慎重・反対の立場';
  const usedRecords=[forward,scrutiny].filter((record):record is CandidatePolicyRecord=>!!record);
  const sourceIds=[...(brief?.sourceIds??[]),...usedRecords.flatMap(record=>record.actions.flatMap(action=>action.sourceIds))];
  const evidenceIds=[...(brief?.evidenceIds??[]),...usedRecords.flatMap(record=>[...record.stanceEvidenceIds,...record.actions.flatMap(action=>action.evidenceIds)])];
  const hasMaterials=!!brief||records.length>0;
  return `<article class="reader-candidate-card" data-reader-candidate="${html(candidate.candidateId)}"><header><h4>${html(candidate.name)}</h4><p>${html(candidate.partyLabel)}${candidate.status==='unconfirmed'?' · 本選名簿確認待ち':''}${candidate.ballotStage==='write-in'?' · 記名候補':''}</p></header>${hasMaterials?`<div class="reader-candidate-direction"><h5>進めたい政策・支持する設計</h5>${forward?policySummary(forward):briefForward?`<p>${html(briefForward)}</p><small>候補者資料の方針 · 解説更新 ${html(brief!.updatedAt)}</small>`:'<p>具体的な公約・支持する設計は未収録。</p>'}</div><div class="reader-candidate-direction"><h5>${scrutinyHeading}</h5>${scrutiny?policySummary(scrutiny):briefOpposition?`<p>${html(briefOpposition)}</p><small>候補者資料の立場 · 解説更新 ${html(brief!.updatedAt)}</small>`:'<p>具体的な政策への慎重・反対の立場は未確認。</p>'}</div><details><summary>この要約の記録・条件・出典</summary>${sourceDetails(sourceIds,evidenceIds)}${usedRecords.map(recordDetails).join('')}</details>`:'<p class="reader-candidate-missing">候補者別の政策材料は未収録。</p>'}</article>`;
}
/** A reading summary only: neither election outcomes nor saved scenarios are accepted or changed. */
export function renderReaderCandidateSummary(election:Election):string {
  const current=election.candidates.filter(candidate=>candidate.ballotStage!=='primary-ballot');
  const pair=specifiedDisplayPairs[election.electionId];
  const candidates=(pair?pair.map(id=>current.find(candidate=>candidate.candidateId===id)).filter((candidate):candidate is Candidate=>!!candidate):current.filter(candidate=>candidate.party==='D'||candidate.party==='R')).slice(0,2);
  if(!candidates.length)return '<section class="reader-candidate-summary"><h4>候補者の政策と記録</h4><p>主要候補の政策材料は未収録。</p></section>';
  return `<section class="reader-candidate-summary" aria-label="主要候補の政策と記録"><div class="reader-candidate-grid">${candidates.map(candidate=>candidateCard(candidate,election)).join('')}</div><button type="button" class="reader-candidate-policy-link" data-reader-policy-election="${html(election.electionId)}">この州の政策版・行動の記録を詳しく読む →</button></section>`;
}
