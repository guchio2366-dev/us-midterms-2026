import { describe, expect, it } from 'vitest';
import { elections, seats, sources, states } from '../src/data/data';
import { powerRules } from '../src/data/civics';
import { newsItems } from '../src/data/news';
import { observationData } from '../src/data/observation';
import { evidenceRefs } from '../src/data/research-sources';
import { policyPrototype, policyRefs } from '../src/data/policy-prototype';
import { createLegacySenateBaseline } from '../src/scenario/baseline';
import { createScenarioState, type SavedScenario } from '../src/scenario/model';
import { createPolicyExampleScenarios } from '../src/scenario/policy-examples';
import { resolvePolicyReadingContext, type PolicyReadingContext } from '../src/news-policy-context';
import { renderPolicyWorkbench, type PolicyWorkbenchOptions } from '../src/ui/policy-workbench';

const nc='2026-NC-2-regular';
const allSources=[...sources,...observationData.sources],allEvidence=[...evidenceRefs,...observationData.evidenceRefs];
const baseline=createLegacySenateBaseline(seats);
const options=():PolicyWorkbenchOptions=>({data:policyPrototype,state:createScenarioState(baseline),seats,elections,powerRules,sources:allSources,evidence:allEvidence,states});
function unknownReading():PolicyReadingContext {
  const item={...structuredClone(newsItems[0]),newsId:'reading-nc',headline:'ノースカロライナの新しい材料',summary:'選択したニュースの事実',whatChanged:'今回確認した事実',possibleImpact:'当落への影響は未確認',issueIds:[],sourceIds:[],evidenceIds:[],relatedElectionIds:[nc],status:'published' as const};
  return resolvePolicyReadingContext({source:{kind:'news',item},data:policyPrototype,elections,seats,states,sources:allSources,evidence:allEvidence,selectedElectionId:'2026-ME-2-regular'})!;
}
const visible=(markup:string)=>markup.replace(/<[^>]*>/g,'');

describe('policy workbench reading handoff',()=>{
  it('shows the selected news first and requires an explicit theme and policy',()=>{
    const readingContext=unknownReading();
    const markup=renderPolicyWorkbench({...options(),readingContext,themeId:null,policyRef:null});
    expect(markup).toContain('data-policy-reading-context');
    expect(markup).toContain('いま読んでいるニュース・更新');
    expect(markup).toContain('ノースカロライナの新しい材料');
    expect(markup).toContain('確認した更新</b>：今回確認した事実');
    expect(markup).toContain('読み方・限界</b>：当落への影響は未確認');
    expect(markup).toContain('比較する政策版は未選択です');
    expect(markup).toContain('<option value="" selected>比較する政策版を選ぶ</option>');
    expect(markup).toContain(`<option value="${nc}" selected>`);
    expect(markup).toContain('data-policy-reading-return');
    expect(markup).not.toContain('aria-pressed="true"');
    expect(markup).not.toContain('data-policy-action="set-common-assumption"');
    expect(markup).not.toContain('pw-policy-definition');
    expect(markup).not.toContain('<h4>将来のMedicaid資金削減への対応</h4>');
  });
  it('prioritizes the selected state’s material ahead of national background once a theme is chosen',()=>{
    const readingContext=resolvePolicyReadingContext({source:{kind:'state',electionId:nc,summary:'この州の直近材料'},data:policyPrototype,elections,seats,states})!;
    const markup=renderPolicyWorkbench({...options(),readingContext,themeId:'healthcare',policyRef:null});
    const stateLink=policyPrototype.contextLinks.find(link=>link.linkId==='context-nc-health-record-and-plan')!;
    const national=policyPrototype.contextLinks.find(link=>link.linkId==='context-hr1-healthcare')!;
    expect(markup.indexOf('この州の直近材料')).toBeLessThan(markup.indexOf(stateLink.title));
    expect(markup.indexOf(stateLink.title)).toBeLessThan(markup.indexOf(national.title));
    expect(markup).toContain('<details class="pw-more-context">');
    expect(markup).not.toContain('<details class="pw-more-context" open');
    expect(markup).toContain('比較する政策版は未選択です');
  });
  it('renders known dates, sources and an explicitly linked Georgia policy without showing internal IDs',()=>{
    const item=newsItems.find(item=>item.newsId==='news-ga-ossoff-health-20260918')!;
    const readingContext=resolvePolicyReadingContext({source:{kind:'news',item},data:policyPrototype,elections,seats,states,sources:allSources,evidence:allEvidence})!;
    const markup=renderPolicyWorkbench({...options(),readingContext});
    const text=visible(markup);
    expect(markup.indexOf(item.headline)).toBeLessThan(markup.indexOf('全国の財政法案と医療をめぐる過去の採決'));
    expect(text).toContain('出来事 2026-09-18 · 原資料公表 2026-09-18 · 資料確認（最新） 2026-09-30');
    expect(text).toContain('サイト掲載 2026-09-18');
    expect(text).toContain(allSources.find(source=>source.sourceId===item.sourceIds[0])!.publisher);
    expect(text).toContain('原資料公表 2026-09-18 · 内容確認 2026-09-30');
    expect(markup).toContain('pw-policy-definition');
    expect(text).not.toContain(readingContext.policyRef!.versionId);
    expect(text).not.toContain(readingContext.feedKey!);
    expect(text).not.toContain(item.evidenceIds[0]);
  });
  it('keeps the material while an explicit policy choice drives the same saved-scenario comparison',()=>{
    const opts=options(),readingContext=unknownReading();
    const examples=createPolicyExampleScenarios(baseline,elections);
    const saved:SavedScenario[]=examples.map((example,index)=>({id:String(index),name:`案 ${index}`,state:example.state,savedAt:'2026-09-30T12:00:00Z'}));
    const before=JSON.stringify({state:opts.state,saved,readingContext});
    const markup=renderPolicyWorkbench({...opts,readingContext,themeId:'healthcare',policyRef:policyRefs.medicaidFunding,savedScenarios:saved,comparison:{leftId:'0',rightId:'1'}});
    expect(markup).toContain('ノースカロライナの新しい材料');
    expect(markup).toContain(`<option value="${policyRefs.medicaidFunding.policyId}@${policyRefs.medicaidFunding.versionId}" selected>`);
    expect(markup).toContain('この政策版での選択候補者');
    expect(markup).toContain('Susan M. Collins');
    expect(markup).toContain('Troy D. Jackson');
    expect(markup).not.toContain('比較する政策版は未選択です');
    expect(JSON.stringify({state:opts.state,saved,readingContext})).toBe(before);
  });
  it('preserves saved choices, reasons and local notes while rendering new material',()=>{
    const opts=options();
    opts.state=createPolicyExampleScenarios(baseline,elections)[0].state;
    opts.state.reasoning!.races['2026-ME-2-regular'].privateNote='ブラウザ内の個人メモ';
    const before=JSON.stringify(opts.state);
    const markup=renderPolicyWorkbench({...opts,readingContext:unknownReading(),electionId:'2026-ME-2-regular',themeId:null,policyRef:null});
    expect(markup).toContain('現在：Susan M. Collins');
    expect(markup).toContain('現在の選択に対応する理由');
    expect(markup).toContain('ブラウザ内の個人メモ');
    expect(JSON.stringify(opts.state)).toBe(before);
  });
  it('escapes reading content and excludes executable URLs',()=>{
    const readingContext=unknownReading();
    readingContext.title='<img src=x onerror=alert(1)>';
    readingContext.summary='</p><script>alert(2)</script>';
    readingContext.fact='<svg onload=alert(3)>';
    readingContext.url='javascript:alert(4)';
    const markup=renderPolicyWorkbench({...options(),readingContext,themeId:null,policyRef:null});
    expect(markup).not.toContain('<script>');
    expect(markup).not.toContain('<img src=x');
    expect(markup).not.toContain('<svg onload=');
    expect(markup).not.toContain('href="javascript:');
    expect(markup).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
  it('keeps planned dates distinct from past events and does not invent a publication date',()=>{
    const item=observationData.events.find(item=>item.publicationStatus==='published'&&item.date&&item.relevance.some(ref=>policyPrototype.focusElectionIds.includes(ref.electionId)))!;
    const readingContext=resolvePolicyReadingContext({source:{kind:'event',item},data:policyPrototype,elections,seats,states,sources:allSources,evidence:allEvidence})!;
    const markup=renderPolicyWorkbench({...options(),readingContext,themeId:null,policyRef:null});
    expect(markup).toContain('いま読んでいる予定');
    expect(markup).toContain(`予定 ${item.date}`);
    expect(markup).not.toContain(`出来事 ${item.date}`);
    expect(markup).not.toContain('サイト掲載');
    expect(readingContext.publishedAt).toBeNull();
    expect(readingContext.checkedAt).toBe(item.checkedAt);
  });
});
