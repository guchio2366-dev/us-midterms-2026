import { describe, expect, it } from 'vitest';
import { polls } from '../src/data/research';
import { briefingPollStudies, briefingPollMarkup, briefingPollsMarkup } from '../src/ui/briefing-polls';

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
    expect(tx[1].map(p=>p.resultStage)).toEqual(['base','cumulative-with-leaners']);
    expect(briefingPollMarkup(tx[1][0])).toContain('<b>43.4%</b>');
    expect(briefingPollMarkup(tx[1][1])).toContain('未定者のleaner回答を割当後');
  });
  it('omits unpublished and other-state records and handles the lack of a recorded poll honestly',()=>{
    const draft={...polls[0],pollId:'draft-only',electionId:'empty',status:'draft' as const};
    expect(briefingPollStudies([...polls,draft],'empty')).toEqual([]);
    for(const id of ['2026-NH-2-regular','2026-NC-2-regular']) {
      const html=briefingPollsMarkup(polls,id);
      expect(html).toContain('まだ収録していません');
      expect(html).not.toContain('briefing-poll-track');
      expect(html).not.toContain('0%');
    }
  });
});
