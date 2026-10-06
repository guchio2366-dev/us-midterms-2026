import { describe, expect, it } from 'vitest';
import { elections } from '../src/data/data';
import { policyPrototype } from '../src/data/policy-prototype';
import { renderReaderCandidateSummary } from '../src/ui/reader-candidate-summary';
import { readerCandidateExplanations } from '../src/data/reader-candidate-explanations';

const election=(id:string)=>elections.find(item=>item.electionId===id)!;
const visible=(markup:string)=>markup.replace(/<[^>]*>/g,'');
function card(markup:string,candidateId:string):string {
  const start=markup.indexOf(`<article class="reader-candidate-card" data-reader-candidate="${candidateId}"`);
  return start<0?'':markup.slice(start,markup.indexOf('</article>',start)+10);
}

describe('state candidate summaries use existing public materials',()=>{
  it.each(policyPrototype.focusElectionIds)('shows two current candidates without mutating %s or its materials',id=>{
    const current=election(id),before=JSON.stringify({current,policyPrototype});
    const markup=renderReaderCandidateSummary(current);
    const ids=[...markup.matchAll(/data-reader-candidate="([^"]+)"/g)].map(match=>match[1]);
    expect(ids).toHaveLength(2);
    expect(current.candidates.find(candidate=>candidate.candidateId===ids[0])?.party).toBe('R');
    expect(markup).toContain('reader-candidate-grid');
    expect(markup).toContain(`data-reader-policy-election="${id}"`);
    for(const candidateId of ids){
      expect(current.candidates.some(candidate=>candidate.candidateId===candidateId&&candidate.ballotStage!=='primary-ballot')).toBe(true);
      const candidateCard=card(markup,candidateId);
      const candidate=current.candidates.find(candidate=>candidate.candidateId===candidateId)!;
      expect(candidateCard).toContain(`data-reader-party="${candidate.party}"`);
      if(candidate.party==='D')expect(candidateCard).toContain('民主党');
      if(candidate.party==='R')expect(candidateCard).toContain('共和党');
      expect([...candidateCard.matchAll(/data-reader-policy-record=/g)].length).toBeLessThanOrEqual(2);
    }
    expect(JSON.stringify({current,policyPrototype})).toBe(before);
    const text=visible(markup);
    for(const policy of policyPrototype.policies)expect(text).not.toContain(policy.versionId);
    expect(text).not.toContain('ev-prototype-');
    expect(text).not.toContain('既存EvidenceRef');
  });

  it('keeps Collins conditional design and whole-package opposition as different policies and dates',()=>{
    const markup=renderReaderCandidateSummary(election('2026-ME-2-regular'));
    const collins=card(markup,'cand-me-susan-m-collins');
    expect(collins).toContain('条件付き支持：例外を設けたMedicaid就労要件');
    expect(collins).toContain('幼い子を養育する人、介護者、就学中の人を除外。');
    expect(collins).toContain('反対：H.R.1全体の上院通過版への票');
    expect(collins).toContain('過去の立場 2025-07-01');
    expect(collins).toContain('法案全体の上院最終採決で反対。');
    expect(collins).toContain('資料公表');
    const jackson=card(markup,'cand-me-troy-d-jackson');
    expect(jackson).toContain('医療アクセスと薬価');
    expect(jackson).toContain('候補者資料の方針');
    expect(jackson).toContain('未確認：将来のMedicaid資金削減への対応');
    expect(jackson).not.toContain('反対：将来のMedicaid資金削減');
  });

  it('shows differing Michigan policies without treating Medicaid as Medicare for All',()=>{
    const markup=renderReaderCandidateSummary(election('2026-MI-2-regular'));
    const elsayed=card(markup,'cand-mi-abdul-el-sayed');
    const rogers=card(markup,'cand-mi-mike-rogers');
    expect(elsayed).toContain('支持：Medicare for All');
    expect(elsayed).toContain('反対：広範で一律的な対カナダ関税');
    expect(elsayed).not.toContain('支持：将来のMedicaid資金削減');
    expect(rogers).toContain('条件付き支持：対象を絞った関税');
    expect(rogers).toContain('関税を一律に通用する解決策とすること');
    expect(rogers).not.toContain('支持：Medicare for All');
    expect(rogers).not.toContain('行動日 2026-08-29');
    expect(rogers).toContain('公表年・行動年');
    const rogersAction=policyPrototype.candidateRecords.find(record=>record.recordId==='position-rogers-targeted')!.actions[0];
    expect(rogersAction.actionDate).toBeNull();
    expect(rogersAction.datePrecision).toBe('unknown');
  });

  it('does not turn Sununu missing ACA stance into opposition to Pappas proposal',()=>{
    const markup=renderReaderCandidateSummary(election('2026-NH-2-regular'));
    const pappas=card(markup,'cand-nh-chris-pappas');
    const sununu=card(markup,'cand-nh-john-e-sununu');
    expect(pappas).toContain('支持：ACA保険料税額控除の恒久化');
    expect(pappas).toContain('公約資料時点 2026-02-17');
    expect(sununu).toContain('支持：希望する人へのHSA利用拡大');
    expect(sununu).toContain('未確認：ACA強化補助を2028年まで延長する');
    expect(sununu).not.toContain('反対：ACA');
  });

  it('labels unconfirmed records separately from verified opposition',()=>{
    const markup=renderReaderCandidateSummary(election('2026-ME-2-regular'));
    const jackson=card(markup,'cand-me-troy-d-jackson');
    expect(jackson).toContain('<h5>確認待ちの政策</h5>');
    expect(jackson).toContain('未確認：将来のMedicaid資金削減への対応');
    expect(jackson).not.toContain('<h5>慎重・反対の立場</h5>');
    const collins=card(markup,'cand-me-susan-m-collins');
    expect(collins).toContain('<h5>慎重・反対の立場</h5>');
    expect(collins).toContain('反対：H.R.1全体の上院通過版への票');
    expect(collins).not.toContain('<h5>確認待ちの政策</h5>');
  });

  it('keeps the Marshall consent request and objection in the detailed record without claiming passage',()=>{
    const markup=renderReaderCandidateSummary(election('2026-KS-2-regular'));
    const marshall=card(markup,'cand-ks-roger-marshall');
    expect(marshall).toContain('支持：受診前の実際の医療価格開示');
    expect(marshall).toContain('価格開示法案全体を進める全会一致同意を求めたが異議で停止。可決や成立ではない。');
    expect(marshall).toContain('法案全体');
    expect(marshall).toContain('行動日 2026-09-23');
    expect(marshall).not.toContain('成立済み');
  });

  it.each(['2026-NE-2-regular'])('does not invent policy records or research dates in %s',id=>{
    const markup=renderReaderCandidateSummary(election(id));
    expect(markup.match(/候補者別の政策材料は未収録。/g)).toHaveLength(2);
    expect(markup).not.toContain('data-reader-policy-record');
    expect(markup).not.toContain('資料公表');
    expect(markup).not.toContain('公約資料時点');
    expect(markup).not.toContain('内容確認 2026-10-04');
  });

  it.each(readerCandidateExplanations)('keeps every supplied paragraph in the candidate explanation: $candidateId',entry=>{
    const markup=card(renderReaderCandidateSummary(election(entry.electionId)),entry.candidateId);
    expect(markup).toContain(`data-candidate-context="${entry.candidateId}"`);
    expect(markup).toContain(`政策説明の内容確認 ${entry.checkedAt}`);
    for(const section of entry.sections){
      expect(markup).toContain(section.heading);
      for(const paragraph of section.paragraphs){
        const escaped=paragraph.text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
        expect(markup).toContain(`<p class="reader-candidate-context-paragraph">${escaped}</p>`);
      }
    }
    expect(markup).not.toContain('出典未接続');
    expect(markup).not.toContain('根拠の該当箇所は未接続。');
  });

  it('adds Minnesota campaign context without inventing versioned policy records',()=>{
    const markup=renderReaderCandidateSummary(election('2026-MN-2-regular'));
    expect(markup.match(/data-candidate-context=/g)).toHaveLength(2);
    expect(markup).not.toContain('候補者別の政策材料は未収録。');
    expect(markup).not.toContain('data-reader-policy-record');
  });

  it('preserves the actual Nebraska independent party label without guessing a caucus',()=>{
    const current=election('2026-NE-2-regular'),markup=renderReaderCandidateSummary(current);
    const osborn=current.candidates.find(candidate=>candidate.candidateId==='cand-ne-dan-osborn')!;
    expect(card(markup,osborn.candidateId)).toContain(osborn.partyLabel);
    expect(markup).toContain('Pete Ricketts');
    expect(markup).not.toContain('Mike Marvin');
    expect(markup).not.toContain('民主党会派');
    expect(markup).not.toContain('共和党会派');
    expect([...markup.matchAll(/data-reader-party="([^"]+)"/g)].map(match=>match[1])).toEqual(['R','I']);
  });

  it('identifies the actual Alaska senator rather than the similarly named other candidate',()=>{
    const markup=renderReaderCandidateSummary(election('2026-AK-2-regular'));
    expect(markup).toContain('data-reader-candidate="cand-ak-dan-s-sullivan"');
    expect(markup).toContain('data-reader-candidate="cand-ak-mary-peltola"');
    expect(markup).not.toContain('data-reader-candidate="cand-ak-daniel-j-sullivan-jr"');
    expect(markup).not.toContain('data-reader-candidate="cand-ak-sidney-sid-hill"');
  });

  it('escapes candidate labels and keeps lookup IDs out of the visible content',()=>{
    const current=structuredClone(election('2026-MI-2-regular'));
    current.candidates.find(candidate=>candidate.party==='D')!.name='<img src=x onerror=alert(1)>';
    current.candidates.find(candidate=>candidate.party==='D')!.partyLabel='<svg onload=alert(2)>';
    const markup=renderReaderCandidateSummary(current);
    expect(markup).not.toContain('<img src=x');
    expect(markup).not.toContain('<svg onload=');
    expect(markup).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(markup).toContain('&lt;svg onload=alert(2)&gt;');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(visible(markup)).not.toContain('position-elsayed-');
    expect(visible(markup)).not.toContain('cand-mi-');
  });
});
