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
    expect(html).toContain('内訳未掲載</span> <b>7%</b>');
    expect(html).toContain('<b>48%</b>');expect(html).toContain('<b>45%</b>');
    expect(html).not.toContain('未定 <b>7%</b>');
  });
  it('labels ranking rounds and leaner allocations without averaging or silently changing their basis',()=>{
    const ak=briefingPollsMarkup(polls,'2026-AK-2-regular');
    expect(ak).toContain('最終RCVラウンド');expect(ak).toContain('第1選択');
    expect(ak).toContain('内訳未掲載</span> <b>5%</b>');
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
    expect(html).toContain('日付・対象・質問は調査ごとに異なります（平均なし）');
    expect(html).toContain('詳しい方法・設問は候補者説明の後');
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
    const visible=html.replace(/<[^>]+>/g,'');
    expect(visible).toContain('投票予定・上院回答737人');
    expect(visible).toContain('調査全体設計効果調整 ±4.0pt');
    const quantus=polls.find(poll=>poll.pollId==='poll-ak-quantus-2026-09-first')!;
    expect(briefingPollMarkup(quantus)).toContain('調査全体の設計効果調整済み誤差 ±4.0ポイント（候補差は約±8ポイント）');
  });
  it('does not fabricate summary polls for uncovered elections or display unpublished records',()=>{
    const draft={...polls[0],pollId:'draft-only',electionId:'empty',status:'draft' as const};
    const html=briefingHeadlinePollsMarkup([...polls,draft],'empty');
    expect(html).toContain('確認済みの調査結果は、まだ収録していません');
    expect(html).not.toContain('briefing-poll-track');
    expect(html).not.toContain('0%');
  });
  it('keeps Republican left and Democratic right in both headline and detail bars and major-candidate labels',()=>{
    const poll=polls.find(poll=>poll.pollId==='poll-ak-quantus-2026-09-first')!;
    for(const markup of [briefingHeadlinePollsMarkup([poll],poll.electionId),briefingPollMarkup(poll)]) {
      const track=markup.match(/<div class="briefing-poll-track"[^>]*>(.*?)<\/div>/s)![1];
      const segmentClasses=[...track.matchAll(/class="briefing-poll-([^"]+)"/g)].map(match=>match[1]);
      expect(segmentClasses).toEqual(['r','third','undecided','unreported','d']);
      const widths=[...track.matchAll(/width:([\d.]+)%/g)].map(match=>Number(match[1]));
      expect(widths).toEqual([46.1,2.9,5,0.5,45.5]);
      expect(widths.reduce((sum,width)=>sum+width,0)).toBeCloseTo(100);
      const major=markup.match(/<ul class="briefing-poll-labels briefing-poll-major-labels"[^>]*>(.*?)<\/ul>/s)![1];
      expect([...major.matchAll(/data-poll-party="([^"]+)"/g)].map(match=>match[1])).toEqual(['R','D']);
      expect(major).toContain('Sullivan（現職）（共和党）');
      expect(major).toContain('Mary Peltola（民主党）');
      expect(major).not.toContain('その他2候補');
      const other=markup.match(/<ul class="briefing-poll-labels briefing-poll-other-labels"[^>]*>(.*?)<\/ul>/s)![1];
      expect(other).toContain('その他2候補');
      expect(other).toContain('<span>未定</span> <b>5%</b>');
      expect(other).toContain('<span>内訳未掲載</span> <b>0.5%</b>');
    }
  });
  it('does not move an independent or another candidate into a major party or change their recorded percentage',()=>{
    const poll={...polls[0],results:[
      {label:'Democratic candidate',party:'D' as const,value:40,category:'candidate' as const},
      {label:'Independent candidate',party:'I' as const,value:6,category:'other-candidate' as const},
      {label:'Republican candidate',party:'R' as const,value:42,category:'candidate' as const},
      {label:'Fourth candidate',party:'other' as const,value:3,category:'other-candidate' as const},
      {label:'未定',value:5,category:'undecided' as const},
      {label:'投票しない',value:1,category:'not-voting' as const},
    ],residualTreatment:'unreported' as const};
    const html=briefingHeadlinePollsMarkup([poll],poll.electionId);
    const major=html.match(/<ul class="briefing-poll-labels briefing-poll-major-labels"[^>]*>(.*?)<\/ul>/s)![1];
    const other=html.match(/<ul class="briefing-poll-labels briefing-poll-other-labels"[^>]*>(.*?)<\/ul>/s)![1];
    expect(major).not.toContain('Independent candidate');
    expect(major).not.toContain('Fourth candidate');
    expect(other).toContain('Independent candidate（無所属）</span> <b>6%</b>');
    expect(other).toContain('Fourth candidate</span> <b>3%</b>');
    expect(other).toContain('内訳未掲載</span> <b>3%</b>');
    expect(other).toContain('投票しない</span> <b>1%</b>');
    expect(html).toContain('briefing-poll-independent');
    expect(html).toContain('briefing-poll-third');
    expect(html).toContain('briefing-poll-not-voting');
  });
  it('can pair a future Republican/independent poll without recategorizing the independent as a Democrat',()=>{
    const electionId='2026-NE-2-regular';
    expect(briefingPollStudies(polls,electionId)).toEqual([]);
    // Synthetic rendering fixture only; no Nebraska poll is added to published data.
    const poll={...polls[0],pollId:'fixture-ne-r-i-only',electionId,residualTreatment:'unreported' as const,results:[
      {label:'Dan Osborn',candidateId:'cand-ne-dan-osborn',party:'I' as const,value:43,category:'candidate' as const},
      {label:'Pete Ricketts',candidateId:'cand-ne-pete-ricketts',party:'R' as const,value:46,category:'candidate' as const},
      {label:'未定',value:7,category:'undecided' as const},
    ]};
    const before=JSON.stringify(poll);
    for(const html of [briefingHeadlinePollsMarkup([poll],electionId),briefingPollMarkup(poll)]) {
      const major=html.match(/<ul class="briefing-poll-labels briefing-poll-major-labels"[^>]*>(.*?)<\/ul>/s)![1];
      expect([...major.matchAll(/data-poll-party="([^"]+)"/g)].map(match=>match[1])).toEqual(['R','I']);
      expect([...major.matchAll(/data-poll-position="([^"]+)"/g)].map(match=>match[1])).toEqual(['left','right']);
      expect(major).toContain('Pete Ricketts（共和党）</span> <b>46%</b>');
      expect(major).toContain('Dan Osborn（無所属）</span> <b>43%</b>');
      expect(major).not.toContain('民主党');
      const track=html.match(/<div class="briefing-poll-track"[^>]*>(.*?)<\/div>/s)![1];
      expect([...track.matchAll(/class="briefing-poll-([^"]+)"/g)].map(match=>match[1])).toEqual(['r','undecided','unreported','independent']);
      const widths=[...track.matchAll(/width:([\d.]+)%/g)].map(match=>Number(match[1]));
      expect(widths).toHaveLength(4);
      [46,7,4,43].forEach((expected,index)=>expect(widths[index]).toBeCloseTo(expected));
      const other=html.match(/<ul class="briefing-poll-labels briefing-poll-other-labels"[^>]*>(.*?)<\/ul>/s)![1];
      expect(other).toContain('未定</span> <b>7%</b>');
      expect(other).toContain('内訳未掲載</span> <b>4%</b>');
      expect(other).not.toContain('Dan Osborn');
    }
    expect(JSON.stringify(poll)).toBe(before);
  });
  it('retains detailed methods, exact questions, notes and the same value order after compacting',()=>{
    for(const electionId of [...new Set(polls.map(poll=>poll.electionId))]) {
      for(const study of briefingPollStudies(polls,electionId).slice(0,2)) {
        const poll=study[0];
        const compact=briefingHeadlinePollsMarkup([poll],electionId);
        const detail=briefingPollMarkup(poll);
        const values=(markup:string)=>[...markup.matchAll(/<b>([\d.]+)%<\/b>/g)].map(match=>match[1]);
        expect(values(compact)).toEqual(values(detail));
        const escaped=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
        expect(detail).toContain(escaped(poll.method));
        expect(detail).toContain(escaped(poll.question));
        for(const note of poll.notes) expect(detail).toContain(escaped(note));
      }
    }
  });
});
