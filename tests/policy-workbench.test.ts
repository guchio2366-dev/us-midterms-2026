import { describe, expect, it } from 'vitest';
import { elections, seats, sources, states } from '../src/data/data';
import { powerRules } from '../src/data/civics';
import { evidenceRefs } from '../src/data/research-sources';
import { observationData } from '../src/data/observation';
import { policyPrototype, policyRefs } from '../src/data/policy-prototype';
import { createLegacySenateBaseline } from '../src/scenario/baseline';
import { createScenarioState, type SavedScenario, type ScenarioState } from '../src/scenario/model';
import { applyReasonedChoice, REASONING_LIMITS, setCommonAssumption } from '../src/scenario/reasoning';
import { createPolicyExampleScenarios } from '../src/scenario/policy-examples';
import { parsePolicyIntent, renderPolicyReasoningComparison, renderPolicyWorkbench, type PolicyWorkbenchOptions } from '../src/ui/policy-workbench';

const baseline=createLegacySenateBaseline(seats);
const fresh=()=>createScenarioState(baseline);
const examples=()=>createPolicyExampleScenarios(baseline,elections);
const me=elections.find(e=>e.electionId==='2026-ME-2-regular')!;
const mi=elections.find(e=>e.electionId==='2026-MI-2-regular')!;
const oh=elections.find(e=>e.electionId==='2026-OH-3-special')!;
const allSources=[...sources,...observationData.sources];
const allEvidence=[...evidenceRefs,...observationData.evidenceRefs];
const options=(state:ScenarioState=fresh()):PolicyWorkbenchOptions=>({data:policyPrototype,state,seats,elections,powerRules,sources:allSources,evidence:allEvidence,states});
const saved=(id:string,state:ScenarioState):SavedScenario=>({id,name:`案 ${id}`,state,savedAt:'2026-09-30T12:00:00Z'});
const fields=(values:Record<string,string|string[]>)=>{
  const params=new URLSearchParams();
  for(const [key,value]of Object.entries(values))for(const item of Array.isArray(value)?value:[value])params.append(key,item);
  return params;
};
const context=(state:ScenarioState=fresh())=>({data:policyPrototype,elections,state});
const healthAssumption='assume-medical-access-concern';

describe('policy workbench rendering',()=>{
  it('provides theme, source, assumption, state, policy version and save routes',()=>{
    const markup=renderPolicyWorkbench(options());
    expect(markup).toContain('data-theme-id="healthcare" aria-pressed="true"');
    expect(markup).toContain('data-theme-id="tariffs" aria-pressed="false"');
    expect(markup).toContain('data-policy-action="set-common-assumption"');
    expect(markup).toContain('data-policy-action="apply-reasoned-choice"');
    expect(markup).toContain('data-policy-action="choose-policy"');
    expect(markup).toContain(policyRefs.hr1.versionId);
    expect(markup).toContain('https://');
    expect(markup).toContain('上の欄で当選を仮定する候補者を選ぶと、その政策への立場と行動を確認できます。');
    expect(markup).not.toContain('選択した候補者 0人');
    expect(markup).not.toContain('候補者未評価 100 / 100議席');
    expect(markup).toContain('共有URLに含まれない');
  });
  it('switches context and policy choices together for tariffs',()=>{
    const markup=renderPolicyWorkbench({...options(),themeId:'tariffs'});
    expect(markup).toContain('同じ対カナダ関税でメーン・ミシガンの対応を比べる');
    expect(markup).toContain(policyRefs.canadaEmergency.versionId);
    expect(markup).not.toContain('<h4>全国の財政法案と医療をめぐる過去の採決</h4>');
  });
  it('separates conditional policy support from broader package votes and their dates',()=>{
    const state=fresh();
    state.senate[me.seatId]={kind:'candidate',electionId:me.electionId,candidateId:'cand-me-susan-m-collins'};
    state.senate[oh.seatId]={kind:'candidate',electionId:oh.electionId,candidateId:'cand-oh-jon-husted'};
    const markup=renderPolicyWorkbench({...options(state),electionId:me.electionId,policyRef:policyRefs.medicaidWork});
    expect(markup).toContain('選択した候補者 2人');
    expect(markup).toContain('条件付き 1 · 反対 0 · 未確認 1');
    expect(markup).toContain('支持する条件');
    expect(markup).toContain('幼い子を養育する人');
    expect(markup).toContain('法案全体');
    expect(markup).toContain('行動の対象：H.R.1全体');
    expect(markup).toContain('行動日 2025-07-01 · 確認日 2026-09-30');
    expect(markup).toContain('この政策版への立場の根拠は未確認。');
  });
  it('labels missing research and separates 100-seat coverage from candidate position counts',()=>{
    const state=fresh();
    state.senate[mi.seatId]={kind:'candidate',electionId:mi.electionId,candidateId:'cand-mi-mike-rogers'};
    state.senate[me.seatId]={kind:'caucus',electionId:me.electionId,caucus:'Republican'};
    state.senate[oh.seatId]={kind:'unassigned',electionId:oh.electionId};
    const markup=renderPolicyWorkbench({...options(state),policyRef:policyRefs.medicaidFunding});
    expect(markup).toContain('選択した候補者 1人');
    expect(markup).toContain('支持 0 · 条件付き 0 · 反対 0 · 未確認 1');
    expect(markup).toContain('候補者未評価 99 / 100議席');
    expect(markup).toContain('会派のみ 1、未配分 1');
    expect(markup).toContain('この政策版は未調査');
    expect(markup).toContain('全100議席の賛成票数・将来の採決予測は未評価');
    expect(markup).toContain('成立・調査に必要な制度条件');
    expect(markup).toContain('未判定');
    expect(markup).toContain('同一文面');
    expect(markup).toContain('バー ドルール'.replace(' ',''));
    expect(markup).not.toContain('成立可能');
  });
  it('marks a saved reason stale after the selected winner changes',()=>{
    const state=examples()[0].state;
    state.senate[me.seatId]={kind:'candidate',electionId:me.electionId,candidateId:'cand-me-troy-d-jackson'};
    const markup=renderPolicyWorkbench({...options(state),electionId:me.electionId});
    expect(markup).toContain('以前の選択・前提の理由・再確認が必要');
    expect(markup).toContain('理由を記録した選択：Susan M. Collins');
    expect(markup).toContain('理由が以前の選択・前提のまま');
  });
  it('marks changed common premises stale and preserves the assessment used by the saved reason',()=>{
    const state=setCommonAssumption(examples()[0].state,{assumptionId:healthAssumption,assessment:'reject',evidenceIds:[]});
    const markup=renderPolicyWorkbench({...options(state),electionId:me.electionId});
    const label=policyPrototype.assumptions.find(a=>a.assumptionId===healthAssumption)!.label;
    expect(markup).toContain('以前の選択・前提の理由・再確認が必要');
    expect(markup).toContain(`${label}（採用）`);
    expect(markup).toContain('記録済み：採用しない');
  });
  it('does not claim old reasons without premise snapshots match current premises',()=>{
    const state=examples()[0].state;
    delete state.reasoning!.races[me.electionId].commonAtAssessment;
    const markup=renderPolicyWorkbench({...options(state),electionId:me.electionId});
    expect(markup).toContain('保存時の前提は未確認');
    expect(markup).toContain('記録時の判断は未確認');
  });
  it('starts with the broadest current assumption and keeps legacy assumptions visible for saved reasons',()=>{
    const freshMarkup=renderPolicyWorkbench(options());
    const broad=policyPrototype.assumptions.filter(a=>a.themeId==='healthcare').sort((a,b)=>b.electionIds.length-a.electionIds.length)[0];
    expect(freshMarkup).toContain(`<input type="hidden" name="assumptionId" value="${broad.assumptionId}">`);
    expect(freshMarkup).not.toContain(`<input type="hidden" name="assumptionId" value="${healthAssumption}">`);
    const savedMarkup=renderPolicyWorkbench(options(examples()[0].state));
    expect(savedMarkup).toContain(`<input type="hidden" name="assumptionId" value="${healthAssumption}">`);
  });
  it('escapes all supplied content and blocks executable source URLs',()=>{
    const opts=options(examples()[0].state);
    opts.data=structuredClone(policyPrototype);
    opts.sources=structuredClone(allSources);
    opts.elections=structuredClone(elections);
    opts.electionId=me.electionId;
    opts.data.contextLinks[0].title='<img src=x onerror=alert(1)>';
    opts.data.policies[0].definition='</p><script>alert(2)</script>';
    opts.elections.find(e=>e.electionId===me.electionId)!.candidates[0].name='" onfocus="alert(3)';
    opts.state.reasoning!.races[me.electionId].privateNote='</textarea><script>alert(4)</script>';
    const source=opts.sources.find(s=>s.sourceId===opts.data.contextLinks[0].sourceIds[0])!;
    source.url='javascript:alert(5)';
    source.title='<svg onload=alert(6)>';
    const markup=renderPolicyWorkbench(opts);
    expect(markup).not.toContain('<script>');
    expect(markup).not.toContain('<img src=x');
    expect(markup).not.toContain('<svg onload=');
    expect(markup).not.toContain('href="javascript:');
    expect(markup).not.toContain('" onfocus="alert(3)');
    expect(markup).toContain('&lt;/textarea&gt;&lt;script&gt;alert(4)&lt;/script&gt;');
    expect(markup).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
  it('compares public reasons, seats and policy records while omitting private note contents',()=>{
    const [a,b]=examples();
    a.state.reasoning!.races[me.electionId].privateNote='LEFT SECRET';
    b.state.reasoning!.races[me.electionId].privateNote='RIGHT SECRET';
    a.state.reasoning!.privateNote='PRIVATE SCENARIO SECRET';
    const markup=renderPolicyReasoningComparison(saved('A',a.state),saved('B',b.state),{data:policyPrototype,seats,elections,states,policyRef:policyRefs.medicaidFunding});
    expect(markup).toContain('Susan M. Collins');
    expect(markup).toContain('Troy D. Jackson');
    expect(markup).toContain('Collinsの反対票');
    expect(markup).toContain('Jacksonの医療改革');
    expect(markup).toContain('共通前提に違いはありません。');
    expect(markup).toContain('個人メモの変更あり');
    expect(markup).not.toContain('LEFT SECRET');
    expect(markup).not.toContain('RIGHT SECRET');
    expect(markup).not.toContain('PRIVATE SCENARIO SECRET');
    expect(markup).toContain('未確認');
  });
});

describe('policy workbench action parsing',()=>{
  it('allow-lists theme, election, exact policy version and saved comparison IDs',()=>{
    expect(parsePolicyIntent('choose-theme',fields({value:'tariffs'}),context())).toEqual({type:'choose-theme',themeId:'tariffs'});
    expect(parsePolicyIntent('choose-theme',fields({value:'taxes'}),context())).toBeNull();
    expect(parsePolicyIntent('choose-election',fields({value:me.electionId}),context())).toEqual({type:'choose-election',electionId:me.electionId});
    expect(parsePolicyIntent('choose-election',fields({value:'2026-CA-2-regular'}),context())).toBeNull();
    expect(parsePolicyIntent('choose-policy',fields({value:`${policyRefs.hr1.policyId}@${policyRefs.hr1.versionId}`}),context())).toEqual({type:'choose-policy',policyRef:policyRefs.hr1});
    expect(parsePolicyIntent('choose-policy',fields({value:`${policyRefs.hr1.policyId}@fake-version`}),context())).toBeNull();
    const ctx={...context(),savedScenarios:[saved('A',fresh())]};
    expect(parsePolicyIntent('choose-comparison',fields({value:'A',side:'left'}),ctx)).toEqual({type:'choose-comparison',side:'left',savedScenarioId:'A'});
    expect(parsePolicyIntent('choose-comparison',fields({value:'',side:'right'}),ctx)).toEqual({type:'choose-comparison',side:'right',savedScenarioId:null});
    expect(parsePolicyIntent('choose-comparison',fields({value:'B',side:'left'}),ctx)).toBeNull();
  });
  it('creates a common assumption intent only with that assumption’s public evidence',()=>{
    const valid=fields({assumptionId:healthAssumption,assessment:'adopt',evidenceId:['ev-elsayed-priorities','ev-elsayed-priorities']});
    expect(parsePolicyIntent('set-common-assumption',valid,context())).toEqual({type:'set-common-assumption',choice:{assumptionId:healthAssumption,assessment:'adopt',evidenceIds:['ev-elsayed-priorities']}});
    valid.set('assessment','predict');
    expect(parsePolicyIntent('set-common-assumption',valid,context())).toBeNull();
    valid.set('assessment','hold');valid.set('evidenceId','ev-rogers-tariffs');
    expect(parsePolicyIntent('set-common-assumption',valid,context())).toBeNull();
  });
  it('produces an intent that the real reason engine accepts, without mutating the input',()=>{
    const state=setCommonAssumption(fresh(),{assumptionId:healthAssumption,assessment:'adopt',evidenceIds:[]});
    const before=JSON.stringify(state);
    const intent=parsePolicyIntent('apply-reasoned-choice',fields({electionId:me.electionId,candidateId:'cand-me-susan-m-collins',assumptionId:healthAssumption,'factor:factor-me-collins-medical-record':'counterweight',evidenceId:'ev-hr1-rollcall',privateNote:'Local only'}),context(state));
    expect(intent?.type).toBe('apply-reasoned-choice');
    if(intent?.type!=='apply-reasoned-choice')throw new Error('Expected race intent');
    const next=applyReasonedChoice(state,me,intent.choice,intent.reason);
    expect(next.senate[me.seatId]).toEqual(intent.choice);
    expect(next.reasoning!.races[me.electionId].privateNote).toBe('Local only');
    expect(next.reasoning!.races[me.electionId].factors[0].role).toBe('counterweight');
    expect(JSON.stringify(state)).toBe(before);
  });
  it('preserves hold as an unassigned seat rather than an implicit winner',()=>{
    const intent=parsePolicyIntent('apply-reasoned-choice',fields({electionId:me.electionId,candidateId:'hold'}),context());
    expect(intent).toEqual({type:'apply-reasoned-choice',electionId:me.electionId,choice:{kind:'unassigned',electionId:me.electionId},reason:{assessment:'hold',assumptionIds:[],factors:[],evidenceIds:[]}});
  });
  it.each(['wrong-candidate','unsaved-assumption','wrong-evidence','prototype-role','overlong-note','too-many-evidence'])('rejects %s data before scenario mutation',kind=>{
    const values=fields({electionId:me.electionId,candidateId:'cand-me-susan-m-collins'});
    if(kind==='wrong-candidate')values.set('candidateId','cand-mi-mike-rogers');
    if(kind==='unsaved-assumption')values.set('assumptionId',healthAssumption);
    if(kind==='wrong-evidence')values.set('evidenceId','ev-rogers-tariffs');
    if(kind==='prototype-role')values.set('factor:factor-me-collins-medical-record','toString');
    if(kind==='overlong-note')values.set('privateNote','x'.repeat(REASONING_LIMITS.privateNote+1));
    if(kind==='too-many-evidence')for(let i=0;i<=REASONING_LIMITS.evidence;i++)values.append('evidenceId','ev-hr1-rollcall');
    expect(parsePolicyIntent('apply-reasoned-choice',values,context())).toBeNull();
  });
});

it('renders readable versions and original source locators without losing internal selector keys',()=>{
  const state=applyReasonedChoice(fresh(),me,{kind:'candidate',electionId:me.electionId,candidateId:'cand-me-susan-m-collins'},{assessment:'conditional',assumptionIds:[],factors:[],evidenceIds:[]},elections);
  const markup=renderPolicyWorkbench({...options(state),policyRef:policyRefs.medicaidWork});
  const visible=markup.replace(/<[^>]*>/g,'');
  expect(markup).toContain(policyRefs.medicaidWork.versionId);
  for(const p of policyPrototype.policies)expect(visible).not.toContain(p.versionId);
  expect(visible).not.toContain('既存EvidenceRef');
  expect(visible).not.toContain('ev-prototype-');
  expect(visible).toContain('就労要件と、子育て・介護・就学の例外についての説明');
  expect(visible).toContain('選択した候補者 1人');
  expect(visible).toContain('候補者未評価 99 / 100議席');
});
