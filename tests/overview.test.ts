import { describe, expect, it } from 'vitest';
import { introductionMarkup, nationalOverviewMarkup, compactOverviewSegments } from '../src/ui/overview';
import { introductionContent } from '../src/data/content';
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
    for (const sentence of introductionContent.issueOverview) {
      for (const part of sentence) expect(html).toContain(part.text);
    }
    expect(html).toContain('id="open-civics"');
    expect(html).toContain('id="open-issues"');
    expect(html.match(/<dt>/g)).toHaveLength(3);
    expect(html.match(/<details class="opening-details">/g)).toHaveLength(2);
    expect(html).not.toMatch(/<details[^>]*\bopen(?:\s|>)/);
  });

  it('uses three equally normalized, aligned 100-seat charts', () => {
    const html = nationalOverviewMarkup();
    const tracks = [...html.matchAll(/<div class="seat-composition-track"[^>]*>(.*?)<div class="seat-composition-legend"/gs)];
    expect(tracks).toHaveLength(3);
    const widths = tracks.map(track => [...track[1].matchAll(/style="width:([\d.]+)%"/g)].map(match => Number(match[1])));
    expect(widths).toEqual([[34,12,6,17,31],[34,17,18,31],[34,15,20,31]]);
    for (const row of widths) expect(row.reduce((sum,n) => sum+n,0)).toBe(100);
    expect(html).toContain('style="left:51%"');
    expect(html).toContain('style="left:49%"');
  });

  it('shows the date, uncertainty and tie caveat before the optional method', () => {
    const visible = nationalOverviewMarkup().split('<details class="consensus-method')[0];
    expect(visible).toContain(RATING_SNAPSHOT_AS_OF);
    expect(visible).toContain('未配分 6：接戦 3・評価分裂 3');
    expect(visible).toContain('当選確率や最終結果ではない');
    expect(visible).toContain('下2本は必要な配分の例');
    expect(visible).toContain('非改選 34 ＋ 今回必要 17');
    expect(visible).toContain('非改選 31 ＋ 今回必要 20');
    expect(visible).toContain('共和は今回19議席で計50');
    expect(visible).toContain('副大統領の決裁票');
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
