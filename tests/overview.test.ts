import { describe, expect, it } from 'vitest';
import { introductionMarkup, nationalOverviewMarkup, compactOverviewSegments } from '../src/ui/overview';
import { approvedIntroduction } from '../src/data/content';
import { RATING_SNAPSHOT_AS_OF } from '../src/data/rating-snapshot';

describe('PC opening overview contract', () => {
  it('keeps current seats and election scope together without duplicate charts', () => {
    const html = introductionMarkup();
    expect(html).toContain('現在の議席と今回の改選範囲');
    expect(html).toContain('民主 47');
    expect(html).toContain('共和 53');
    expect(html).toContain('民主 214');
    expect(html).toContain('共和 218');
    expect(html).toContain('<b>35</b>');
    expect(html).toContain('<b>435</b>');
    expect(html).toContain('通常33＋特別2');
    expect(html).toContain('独立1・空席2');
    expect(html).not.toContain('seat-composition-track');
    expect(html).not.toContain('id="intro-disclosure"');
  });

  it('retains full introductory copy, issue explanations and existing overlay entry points', () => {
    const html = introductionMarkup();
    for (const text of approvedIntroduction.issues) expect(html).toContain(text);
    for (const goal of approvedIntroduction.goals) expect(html).toContain(goal);
    expect(html).toContain(approvedIntroduction.purpose);
    expect(html).toContain('上院が下院に優越するわけではなく');
    expect(html).toContain('現在は任命された後任議員が務めており');
    expect(html).toContain('Class IIの33議席');
    expect(html).toContain('id="open-civics"');
    expect(html).toContain('id="open-issues"');
    expect(html).not.toContain('常時自動更新');
  });

  it('uses three equally normalized, aligned 100-seat charts', () => {
    const html = nationalOverviewMarkup();
    const tracks = [...html.matchAll(/<div class="seat-composition-track"[^>]*>(.*?)<div class="seat-composition-legend"/gs)];
    expect(tracks).toHaveLength(3);
    const widths = tracks.map(track => [...track[1].matchAll(/style="width:([\d.]+)%"/g)].map(match => Number(match[1])));
    expect(widths).toEqual([[34,10,10,15,31],[34,17,18,31],[34,15,20,31]]);
    for (const row of widths) expect(row.reduce((sum,n) => sum+n,0)).toBe(100);
    expect(html).toContain('style="left:51%"');
    expect(html).toContain('style="left:49%"');
  });

  it('shows the date, uncertainty and tie caveat before the optional method', () => {
    const visible = nationalOverviewMarkup().split('<details class="consensus-method')[0];
    expect(visible).toContain(RATING_SNAPSHOT_AS_OF);
    expect(visible).toContain('未配分 10：弱い優勢 3・接戦 2・評価分裂 5');
    expect(visible).toContain('配分済みの議席も当選が確定したものではありません');
    expect(visible).toContain('民主党側44議席、共和党側46議席');
    expect(visible).toContain('残る10議席');
    expect(visible).toContain('Sabato’s Crystal Ball：2026-09-24確認');
    expect(visible).toContain('Inside Elections：2026-09-30確認');
    expect(visible).toContain('非改選 34 ＋ 今回必要 17');
    expect(visible).toContain('非改選 31 ＋ 今回必要 20');
    expect(visible).toContain('共和党側は今回19議席を得て50議席でも多数派として運営することが可能');
    expect(visible).toContain('副大統領が決裁票');
  });

  it('keeps all 35 source rows with special elections and confirmed dates', () => {
    const html = nationalOverviewMarkup();
    expect(html.match(/<tr><th scope="row">/g)).toHaveLength(35);
    expect(html).toContain('フロリダ（特別）');
    expect(html).toContain('オハイオ（特別）');
    expect(html).toContain('Sabato');
    expect(html).toContain('Inside Elections');
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('NaN');
  });

  it('does not change original counts or hide the 6-seat label', () => {
    const segments = [{count:6,label:'接戦・評価分裂 6',shortLabel:'元のラベル',className:'consensus-unresolved'}];
    expect(compactOverviewSegments(segments)[0]).toEqual({...segments[0],shortLabel:'6'});
    expect(segments[0].shortLabel).toBe('元のラベル');
    expect(compactOverviewSegments([{count:1,label:'評価不足 1',className:'consensus-missing'}])[0].shortLabel).toBe('');
  });

  it('keeps accessible chart descriptions and unique section identifiers', () => {
    const html = introductionMarkup() + nationalOverviewMarkup();
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html.match(/role="img" aria-label=/g)).toHaveLength(3);
    expect(html).toContain('非改選・民主党会派 34');
    expect(html).toContain('非改選・共和党会派 31');
  });
});
