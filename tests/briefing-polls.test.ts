import { describe, expect, it } from 'vitest';
import { polls } from '../src/data/research';
import { briefingPollStudies, briefingPollMarkup, briefingPollsMarkup, briefingHeadlinePollsMarkup } from '../src/ui/briefing-polls';

describe('briefing poll bars',()=>{
  it('compares separate studies without using two populations from the same survey as two polls',()=>{
    const studies=briefingPollStudies(polls,'2026-IA-2-regular');
    expect(studies[0].map(p=>p.pollId)).toEqual(['poll-ia-marist-2026-09']);
    expect(studies[1].map(p=>p.pollId)).toEqual(['poll-ia-yougov-2026-09','poll-ia-yougov-2026-09-loose-lv','poll-ia-yougov-2026-09-strict-lv']);
    expect(studies[2][0].pollId).toBe('poll-ia-emerson-2026-09');
    const html=briefingPollsMarkup(polls,'2026-IA-2-regular');
    expect(html).toContain('同じ調査の別集計（2件）');
    expect(html).toContain('それ以前の2調査を見る');
    expect(html).not.toContain('機関を等しく集計');
  });
  it('keeps published candidate shares, undecided shares, dates, samples, precision and source links',()=>{
    const poll=polls.find(p=>p.pollId==='poll-ia-yougov-2026-09')!;
    const html=briefingPollMarkup(poll);
    for (const result of poll.results) {expect(html).toContain(result.label);expect(html).toContain(`<b>${result.value}%</b>`);}
    expect(html).toContain('公表値の合計101%（丸め）');
    expect(html).toContain(poll.fieldStart);expect(html).toContain(poll.fieldEnd);
    expect(html).toContain('スポンサー：明記なし');
    expect(html).toContain('2,169人');expect(html).toContain('登録有権者');
    expect(html).toContain('href="https://');
    expect(html).toContain(poll.precisionLabel!);
    const widths=[...html.matchAll(/width:([\d.]+)%/g)].map(m=>Number(m[1]));
    expect(widths.reduce((s,n)=>s+n,0)).toBeCloseTo(100);
  });
  it('shows unreported answers separately instead of allocating them to candidates or labeling them undecided',()=>{
    const poll=polls.find(p=>p.pollId==='poll-me-cnn-ssrs-2026-09')!;
    const html=briefingPollMarkup(poll);
    expect(html).toContain('内訳未掲載 <b>7%</b>');
    expect(html).toContain('<b>48%</b>');expect(html).toContain('<b>45%</b>');
    expect(html).not.toContain('未定 <b>7%</b>');
  });
  it('labels ranking rounds and leaner allocations without averaging or silently changing their basis',()=>{
    const ak=briefingPollsMarkup(polls,'2026-AK-2-regular');
    expect(ak).toContain('最終RCVラウンド');expect(ak).toContain('第1選択');
    expect(ak).toContain('内訳未掲載 <b>5%</b>');
    const tx=briefingPollStudies(polls,'2026-TX-2-regular');
    const overton=tx.find(study=>study.some(p=>p.pollId==='poll-tx-overton-2026-08-base'))!;
    expect(overton.map(p=>p.resultStage)).toEqual(['base','cumulative-with-leaners']);
    expect(briefingPollMarkup(overton[0])).toContain('<b>43.4%</b>');
    expect(briefingPollMarkup(overton[1])).toContain('未定者のleaner回答を割当後');
    const fox=tx.find(study=>study.some(p=>p.pollId==='poll-tx-fox-2026-09-lv'))!;
    expect(fox.map(p=>p.pollId)).toEqual(['poll-tx-fox-2026-09-lv','poll-tx-fox-2026-09-rv']);
  });
  it('omits unpublished and other-state records and handles the lack of a recorded poll honestly',()=>{
    const draft={...polls[0],pollId:'draft-only',electionId:'empty',status:'draft' as const};
    expect(briefingPollStudies([...polls,draft],'empty')).toEqual([]);
    const nh=briefingPollsMarkup(polls,'2026-NH-2-regular');
    expect(nh).toContain('poll-nh-rasmussen-2026-10');
    expect(nh).toContain('Chris Pappas');
    expect(nh).not.toContain('<b>0%</b>');
  });
  it('puts separate, dated studies near the state title while leaving questions and sources in the full display',()=>{
    const electionId='2026-TX-2-regular';
    const studies=briefingPollStudies(polls,electionId);
    const html=briefingHeadlinePollsMarkup(polls,electionId);
    expect([...html.matchAll(/data-summary-poll-id="([^"]+)"/g)].map(match=>match[1])).toEqual(studies.slice(0,2).map(study=>study[0].pollId));
    expect(html).toContain('民主党');
    expect(html).toContain('共和党');
    expect(html).toContain('日付・対象・質問が異なり、平均していません');
    expect(html).toContain('情勢評価・当選確率とは別の実測値');
    for (const study of studies.slice(0,2)) {
      const poll=study[0];
      expect(html).toContain(poll.fieldStart);
      expect(html).toContain(poll.fieldEnd);
      expect(html).toContain(poll.populationLabel);
      expect(html).toContain(poll.conditionLabel!);
      expect(html).toContain(poll.precisionLabel!);
      expect(html).not.toContain(poll.question);
      for(const result of poll.results) {
        expect(html).toContain(result.label);
        expect(html).toContain(`<b>${result.value}%</b>`);
      }
    }
    expect(html).not.toContain('data-summary-poll-id="poll-tx-fox-2026-09-rv"');
    expect(html).toContain('合計101%（丸め）');
  });
  it('keeps the Alaska first-choice and final-round labels, third candidates, undecided and unreported answers distinct',()=>{
    const html=briefingHeadlinePollsMarkup(polls,'2026-AK-2-regular');
    expect(html).toContain('第1順位');
    expect(html).toContain('最終RCVラウンド');
    expect(html).toContain('<span>その他2候補</span> <b>2.9%</b>');
    expect(html).toContain('<span>未定</span> <b>5%</b>');
    expect(html).toContain('<span>内訳未掲載</span> <b>0.5%</b>');
    expect(html).not.toContain('<span>未定</span> <b>5.5%</b>');
  });
  it('does not fabricate summary polls for uncovered elections or display unpublished records',()=>{
    const draft={...polls[0],pollId:'draft-only',electionId:'empty',status:'draft' as const};
    const html=briefingHeadlinePollsMarkup([...polls,draft],'empty');
    expect(html).toContain('確認済みの調査結果は、まだ収録していません');
    expect(html).not.toContain('briefing-poll-track');
    expect(html).not.toContain('0%');
  });
});
