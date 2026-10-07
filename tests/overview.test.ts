import { describe, expect, it } from 'vitest';
import { introductionMarkup, nationalOverviewMarkup, compactOverviewSegments } from '../src/ui/overview';
import { approvedIntroduction } from '../src/data/content';
import { RATING_SNAPSHOT_AS_OF } from '../src/data/rating-snapshot';
import approvedCopy from '../src/data/approved-reader-copy.json';

describe('PC opening overview contract', () => {
  it('keeps the unique House snapshot in the introduction without the duplicate seat table', () => {
    const html = introductionMarkup();
    expect(html).not.toContain('現在の議席と今回の改選範囲');
    expect(html).not.toContain('class="opening-seats"');
    expect(html).toContain('民主 214');
    expect(html).toContain('共和 218');
    expect(html).toContain('35議席');
    expect(html).toContain('435議席');
    expect(html).toContain('独立1・空席2');
    expect(html).not.toContain('seat-composition-track');
    expect(html).not.toContain('id="intro-disclosure"');
  });

  it('retains full introductory copy, issue explanations and existing overlay entry points', () => {
    const html = introductionMarkup();
    for (const text of approvedIntroduction.issues) expect(html).toContain(text);
    expect(html).toContain(approvedCopy.sections['このサイトについて'][0].text);
    expect(html).toContain('上院が下院より上位にあるわけではなく');
    expect(html).toContain('現在は州知事が任命した後任議員が務めており');
    expect(html).toContain('Class IIに属する33議席');
    expect(html).toContain('id="open-civics"');
    expect(html).toContain('id="open-issues"');
    expect(html).not.toContain('常時自動更新');
  });

  it('shows current composition, the two majority conditions and then the provisional outlook on one 100-seat scale', () => {
    const html = nationalOverviewMarkup();
    const tracks = [...html.matchAll(/<div class="seat-composition-track"[^>]*>(.*?)<div class="seat-composition-legend"/gs)];
    expect(tracks).toHaveLength(4);
    const widths = tracks.map(track => [...track[1].matchAll(/style="width:([\d.]+)%"/g)].map(match => Number(match[1])));
    expect(widths).toEqual([[34,13,22,31],[34,17,18,31],[34,15,20,31],[34,9,12,14,31]]);
    for (const row of widths) expect(row.reduce((sum,n) => sum+n,0)).toBe(100);
    expect(html).toContain('style="left:51%"');
    expect(html).toContain('style="left:49%"');
    expect(html).toContain('現在の議員を改選対象と非改選に分けた図で、選挙後の予測ではない');
    expect(html).toContain('民主党側 <b>47</b>');
    expect(html).toContain('共和党側 <b>53</b>');
    expect(html.indexOf('current-seat-composition')).toBeLessThan(html.indexOf('majority-conditions'));
    expect(html.indexOf('majority-conditions')).toBeLessThan(html.indexOf('provisional-allocation'));
  });

  it('shows the date, uncertainty and tie caveat before the optional method', () => {
    const visible = nationalOverviewMarkup().split('<details class="consensus-method')[0];
    expect(visible).toContain(RATING_SNAPSHOT_AS_OF);
    expect(visible).toContain('未配分 12：弱い優勢 6・接戦 2・評価分裂 4');
    expect(visible).toContain('当選が確定した議席数や、当選確率を計算した結果ではありません');
    expect(visible).toContain('民主党側43議席、共和党側45議席');
    expect(visible).toContain('残る12議席');
    expect(visible).toContain('Sabato’s Crystal Ball：2026-10-07確認');
    expect(visible).toContain('Inside Elections：2026-10-02確認');
    expect(visible).toContain('非改選 34 ＋ 今回必要 17');
    expect(visible).toContain('非改選 31 ＋ 今回必要 20');
    expect(visible).toContain('共和党側は今回19議席を獲得して合計50議席となった場合でも');
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
    expect(html.match(/role="img" aria-label=/g)).toHaveLength(4);
    expect(html).toContain('非改選・民主党会派 34');
    expect(html).toContain('非改選・共和党会派 31');
  });
});
