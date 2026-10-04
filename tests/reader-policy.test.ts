import { describe, expect, it } from 'vitest';
import { elections, seats, sources, states } from '../src/data/data';
import { powerRules } from '../src/data/civics';
import { observationData } from '../src/data/observation';
import { policyPrototype, policyRefs } from '../src/data/policy-prototype';
import { evidenceRefs } from '../src/data/research-sources';
import { createLegacySenateBaseline } from '../src/scenario/baseline';
import { createScenarioState } from '../src/scenario/model';
import { applyReasonedChoice } from '../src/scenario/reasoning';
import { renderPolicyWorkbench, type PolicyWorkbenchOptions } from '../src/ui/policy-workbench';

const options=():PolicyWorkbenchOptions=>({
  data:policyPrototype,state:createScenarioState(createLegacySenateBaseline(seats)),seats,elections,powerRules,
  sources:[...sources,...observationData.sources],evidence:[...evidenceRefs,...observationData.evidenceRefs],states,
});
const reading=(markup:string)=>markup.split('<details class="pw-optional-workbench"')[0];
const candidateRow=(markup:string,candidateId:string)=>{
  const start=markup.indexOf(`<tr data-policy-candidate="${candidateId}">`);
  return start<0?'':markup.slice(start,markup.indexOf('</tr>',start)+5);
};
const visible=(markup:string)=>markup.replace(/<[^>]*>/g,'');
const escaped=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
function detailsBlock(markup:string,className:string):string {
  const start=markup.indexOf(`<details class="${className}">`);
  if(start<0)return '';
  let depth=0;
  for(const match of markup.slice(start).matchAll(/<details\b[^>]*>|<\/details>/g)){
    depth+=match[0].startsWith('</')?-1:1;
    if(depth===0)return markup.slice(start,start+match.index!+match[0].length);
  }
  throw new Error(`Unclosed details: ${className}`);
}

describe('read policies before assuming election winners',()=>{
  it('shows candidate positions and institutional conditions before any optional scenario form',()=>{
    const opts=options(),before=JSON.stringify(opts.state);
    const markup=renderPolicyWorkbench({...opts,electionId:'2026-ME-2-regular',policyRef:policyRefs.medicaidWork});
    const reader=reading(markup);
    expect(reader).toContain('data-policy-candidate-reading');
    expect(reader).toContain('Susan M. Collins');
    expect(reader).toContain('条件付き');
    expect(reader).toContain('幼い子を養育する人、介護者、就学中の人を除外。');
    expect(reader).toContain('政策を実現する条件');
    expect(reader).toContain('大統領との関係');
    expect(reader).not.toContain('<form');
    expect(reader).not.toContain('name="candidateId"');
    expect(reader).not.toContain('選択した候補者 0人');
    expect(markup).toContain('<details class="pw-optional-workbench" data-policy-disclosure="scenario">');
    expect(markup).toContain('data-policy-action="set-common-assumption"');
    expect(markup).toContain('data-policy-action="apply-reasoned-choice"');
    expect(JSON.stringify(opts.state)).toBe(before);
  });

  it('keeps separate chamber and presidential conditions visible before the closed scenario form',()=>{
    const opts=options();
    const markup=renderPolicyWorkbench({...opts,electionId:'2026-ME-2-regular',policyRef:policyRefs.medicaidWork});
    const summaryStart=markup.indexOf('<div class="pw-institution-summary" data-policy-institution-summary>');
    expect(summaryStart).toBeGreaterThan(0);
    const earlierDetails=[...markup.slice(0,summaryStart).matchAll(/<details\b[^>]*>|<\/details>/g)];
    expect(earlierDetails.reduce((depth,match)=>depth+(match[0].startsWith('</')?-1:1),0)).toBe(0);
    const fullDetails=detailsBlock(markup,'pw-institutions');
    const summary=markup.slice(summaryStart,markup.indexOf('<details class="pw-institutions">',summaryStart));
    for(const powerId of ['ordinary-law','reconciliation','oversight']){
      const rule=powerRules.find(item=>item.powerId===powerId)!;
      expect(summary).toContain(`<b>下院：</b>${escaped(rule.house)}`);
      expect(summary).toContain(`<b>上院：</b>${escaped(rule.senate)}`);
      expect(summary).toContain(`<b>必要条件：</b>${escaped(rule.threshold)}`);
      expect(summary).toContain(`<b>大統領との関係：</b>${escaped(rule.presidentialConstraint)}`);
      for(const sourceId of rule.sourceIds){
        const source=opts.sources.find(item=>item.sourceId===sourceId)!;
        expect(fullDetails).toContain(`href="${escaped(source.url)}"`);
      }
    }
    expect(fullDetails).toContain('上院の討論終結と最終可決を別々に確認する。');
    expect(fullDetails).toContain('予算決議・財政調整の適格性・バードルールを別途確認する。');
    expect(fullDetails).toContain('調査行動は法案成立や行政措置の変更を意味しない。');
    expect(markup.indexOf(fullDetails)+fullDetails.length).toBeLessThan(markup.indexOf('<details class="pw-optional-workbench"'));
    expect(markup).toContain('<details class="pw-optional-workbench" data-policy-disclosure="scenario">');
    expect(markup).not.toMatch(/<details[^>]*data-policy-disclosure="scenario"[^>]*\bopen\b/);
  });

  it('folds write-ins apart from printed and archived candidates without dropping their records or research coverage',()=>{
    const opts=options();
    opts.elections=structuredClone(elections);
    const election=opts.elections.find(item=>item.electionId==='2026-ME-2-regular')!;
    // Independent display fixture: retain existing records while exercising both folded groups.
    const collins=election.candidates.find(item=>item.candidateId==='cand-me-susan-m-collins')!;
    const jackson=election.candidates.find(item=>item.candidateId==='cand-me-troy-d-jackson')!;
    const printed=election.candidates.find(item=>item.ballotStage==='write-in')!;
    collins.ballotStage='write-in';jackson.ballotStage='primary-ballot';printed.ballotStage='general-ballot';
    const before=JSON.stringify({election,state:opts.state});
    const markup=reading(renderPolicyWorkbench({...opts,electionId:election.electionId,policyRef:policyRefs.medicaidFunding}));
    const writeIns=detailsBlock(markup,'pw-write-in-candidates');
    const archived=detailsBlock(markup,'pw-archived-candidates');
    const unfolded=markup.replace(writeIns,'').replace(archived,'');
    expect(writeIns).toContain(`data-policy-candidate="${collins.candidateId}"`);
    expect(candidateRow(writeIns,collins.candidateId)).toContain('pw-stance-oppose');
    expect(candidateRow(writeIns,collins.candidateId)).toContain('将来のMedicaid資金削減と地方医療への悪影響を反対理由に説明。');
    expect(writeIns).not.toContain(`data-policy-candidate="${printed.candidateId}"`);
    expect(writeIns).not.toContain(`data-policy-candidate="${jackson.candidateId}"`);
    expect(unfolded).toContain(`data-policy-candidate="${printed.candidateId}"`);
    expect(unfolded).not.toContain(`data-policy-candidate="${collins.candidateId}"`);
    expect(archived).toContain(`data-policy-candidate="${jackson.candidateId}"`);
    expect(candidateRow(archived,jackson.candidateId)).toContain('pw-stance-unknown');
    expect(candidateRow(archived,jackson.candidateId)).toContain('候補者資料に医療アクセスと薬価を掲げる。特定の資金削減版への立場は未確認。');
    const currentCount=election.candidates.filter(candidate=>candidate.ballotStage!=='primary-ballot').length;
    expect(unfolded).toContain(`この政策版の記録 1人 · 未調査 ${currentCount-1}人`);
    expect(writeIns).not.toMatch(/^<details[^>]*\bopen\b/);
    expect(archived).not.toMatch(/^<details[^>]*\bopen\b/);
    expect(JSON.stringify({election,state:opts.state})).toBe(before);
  });

  it('retains every policy record and action while hiding internal evidence locators in reader and optional views',()=>{
    for(const record of policyPrototype.candidateRecords){
      const opts=options(),election=elections.find(item=>item.electionId===record.electionId)!;
      const policy=policyPrototype.policies.find(item=>item.policyId===record.policyId&&item.versionId===record.versionId)!;
      opts.state=applyReasonedChoice(opts.state,election,{kind:'candidate',electionId:election.electionId,candidateId:record.candidateId},
        {assessment:'conditional',assumptionIds:[],factors:[],evidenceIds:[]},elections);
      const markup=renderPolicyWorkbench({...opts,electionId:election.electionId,themeId:policy.themeId,policyRef:policy});
      const row=candidateRow(reading(markup),record.candidateId);
      expect(row,record.recordId).toContain(`pw-stance-${record.stance}`);
      for(const condition of record.conditions)expect(row,record.recordId).toContain(escaped(condition));
      for(const unknown of record.unknowns)expect(row,record.recordId).toContain(escaped(unknown));
      for(const action of record.actions){
        expect(row,action.actionId).toContain(escaped(action.text));
        expect(row,action.actionId).toContain(`行動日 ${action.actionDate??'不明'}`);
        expect(row,action.actionId).toContain(`確認日 ${action.checkedAt}`);
        expect(markup.split('<details class="pw-optional-workbench"')[1],action.actionId).toContain(escaped(action.text));
      }
      const text=visible(markup);
      expect(text,record.recordId).not.toContain('既存EvidenceRef');
      expect(text,record.recordId).not.toContain('ev-prototype-');
    }
  });

  it.each(policyPrototype.focusElectionIds)('includes every current candidate and separates archived candidates in %s',electionId=>{
    const opts=options(),election=elections.find(item=>item.electionId===electionId)!;
    const markup=reading(renderPolicyWorkbench({...opts,electionId,policyRef:policyRefs.hr1}));
    const archivedStart=markup.indexOf('<details class="pw-archived-candidates">');
    const current=archivedStart<0?markup:markup.slice(0,archivedStart);
    const archived=archivedStart<0?'':markup.slice(archivedStart);
    const currentIds=[...current.matchAll(/<tr data-policy-candidate="([^"]+)">/g)].map(match=>match[1]);
    expect(currentIds).toEqual(election.candidates.filter(candidate=>candidate.ballotStage!=='primary-ballot').map(candidate=>candidate.candidateId));
    for(const candidate of election.candidates.filter(candidate=>candidate.ballotStage==='primary-ballot')){
      expect(current).not.toContain(`data-policy-candidate="${candidate.candidateId}"`);
      expect(archived).toContain(`data-policy-candidate="${candidate.candidateId}"`);
      expect(archived).toContain('予備選時点');
    }
    for(const candidate of election.candidates.filter(candidate=>candidate.ballotStage==='write-in'))expect(candidateRow(current,candidate.candidateId)).toContain('記名候補');
    for(const candidate of election.candidates.filter(candidate=>candidate.status==='unconfirmed'&&candidate.ballotStage!=='primary-ballot'))expect(candidateRow(current,candidate.candidateId)).toContain('本選名簿確認待ち');
  });

  it('preserves an unknown individual stance despite a recorded whole-package yea vote',()=>{
    const markup=reading(renderPolicyWorkbench({...options(),electionId:'2026-OH-3-special',policyRef:policyRefs.medicaidWork}));
    const husted=candidateRow(markup,'cand-oh-jon-husted');
    expect(husted).toContain('pw-stance-unknown');
    expect(husted).toContain('採決（賛成）');
    expect(husted).toContain('法案全体');
    expect(husted).toContain('H.R.1全体への賛成は個別の就労要件版への支持に換算しない。');
    expect(husted).not.toContain('pw-stance-support');
    expect(husted).not.toContain('この政策版は未調査');
    expect(candidateRow(markup,'cand-oh-sherrod-brown')).toContain('この政策版は未調査');
  });

  it('does not carry Medicare for All support into another Medicaid policy version',()=>{
    const opts={...options(),electionId:'2026-MI-2-regular'};
    const medicare=candidateRow(reading(renderPolicyWorkbench({...opts,policyRef:policyRefs.medicareAll})),'cand-mi-abdul-el-sayed');
    const medicaid=candidateRow(reading(renderPolicyWorkbench({...opts,policyRef:policyRefs.medicaidFunding})),'cand-mi-abdul-el-sayed');
    expect(medicare).toContain('pw-stance-support');
    expect(medicare).toContain('重点 明示');
    expect(medicaid).toContain('pw-stance-unknown');
    expect(medicaid).toContain('関連論点');
    expect(medicaid).not.toContain('pw-stance-support');
  });

  it.each(['2026-MN-2-regular','2026-NE-2-regular'])('keeps all %s policies explicitly unresearched',electionId=>{
    for(const policy of policyPrototype.policies){
      const markup=reading(renderPolicyWorkbench({...options(),electionId,themeId:policy.themeId,policyRef:policy}));
      const election=elections.find(item=>item.electionId===electionId)!;
      expect(markup).toContain('この州の候補者別の政策材料は未収録です。');
      expect(markup).toContain('この政策版の記録 0人');
      for(const candidate of election.candidates.filter(candidate=>candidate.ballotStage!=='primary-ballot')){
        const row=candidateRow(markup,candidate.candidateId);
        expect(row).toContain('この政策版は未調査');
        expect(row).toContain('行動の記録：未調査');
        expect(row).not.toContain('pw-stance-support');
        expect(row).not.toContain('pw-stance-oppose');
      }
    }
  });

  it('does not expose private notes or internal policy IDs in the reading presentation',()=>{
    const opts=options();
    const election=elections.find(item=>item.electionId==='2026-ME-2-regular')!;
    opts.state=applyReasonedChoice(opts.state,election,{kind:'candidate',electionId:election.electionId,candidateId:'cand-me-susan-m-collins'},
      {assessment:'conditional',assumptionIds:[],factors:[],evidenceIds:[],privateNote:'LOCAL RACE NOTE'},elections);
    opts.state.reasoning!.privateNote='LOCAL PERSONAL NOTE';
    const before=JSON.stringify(opts.state);
    const markup=renderPolicyWorkbench({...opts,electionId:election.electionId,policyRef:policyRefs.medicaidWork});
    const text=visible(reading(markup));
    expect(text).not.toContain('LOCAL PERSONAL NOTE');
    expect(text).not.toContain('LOCAL RACE NOTE');
    expect(markup.split('<details class="pw-optional-workbench"')[1]).toContain('LOCAL RACE NOTE</textarea>');
    expect(JSON.stringify(opts.state)).toBe(before);
    for(const policy of policyPrototype.policies)expect(text).not.toContain(policy.versionId);
    expect(text).not.toContain('ev-prototype-');
    expect(text).not.toContain('既存EvidenceRef');
    expect(markup).toContain(`value="${policyRefs.medicaidWork.policyId}@${policyRefs.medicaidWork.versionId}" selected`);
  });

  it('escapes candidate and action text and keeps exact source links separate from display data',()=>{
    const opts=options();
    opts.elections=structuredClone(elections);opts.data=structuredClone(policyPrototype);
    opts.elections.find(item=>item.electionId==='2026-ME-2-regular')!.candidates.find(item=>item.candidateId==='cand-me-susan-m-collins')!.name='<img src=x onerror=alert(1)>';
    const record=opts.data.candidateRecords.find(item=>item.candidateId==='cand-me-susan-m-collins'&&item.policyId===policyRefs.medicaidWork.policyId)!;
    record.actions[0].text='<script>alert(2)</script>';record.conditions=['<svg onload=alert(3)>'];
    const markup=reading(renderPolicyWorkbench({...opts,electionId:'2026-ME-2-regular',policyRef:policyRefs.medicaidWork}));
    expect(markup).not.toContain('<img src=x');expect(markup).not.toContain('<script>');expect(markup).not.toContain('<svg onload=');
    expect(markup).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(markup).toContain('&lt;script&gt;alert(2)&lt;/script&gt;');
    expect(markup).toContain('&lt;svg onload=alert(3)&gt;');
    expect(markup).toContain('rel="noopener noreferrer"');
  });
});
