import { describe, expect, it } from 'vitest';
import { observationData } from '../src/data/observation';
import type { ObservationDataset, ObservationEvent, ObservationUpdate } from '../src/data/observation-model';
import { RATING_SNAPSHOT_AS_OF } from '../src/data/rating-snapshot';
import { readerOutlookMaterials, renderReaderOutlook } from '../src/ui/reader-outlook';

const now = new Date('2026-10-04T11:00:00Z');
const empty = (): ObservationDataset => ({ ...observationData, events: [], updates: [], sources: [], evidenceRefs: [] });
const event = (eventId: string, date: string, overrides: Partial<ObservationEvent> = {}): ObservationEvent => ({
  eventId, title: `予定 ${eventId}`, publicationStatus: 'published', date, time: '12:00', timezone: 'America/New_York', status: 'scheduled', dateHistory: [], checkedAt: '2026-10-02', evidenceIds: [], relevance: [{ electionId: '2026-ME-2-regular', why: '医療への回答を同じ場で比較する。', watch: '発言と後日の有権者評価を分ける。', materialIds: [] }], resultUpdateId: null, ...overrides,
});
const update = (updateId: string, eventDate: string, overrides: Partial<ObservationUpdate> = {}): ObservationUpdate => ({
  updateId, status: 'published', electionIds: ['2026-ME-2-regular'], eventId: null, newsId: null, eventDate, updatedAt: '2026-10-04', title: `更新 ${updateId}`, happened: '確認した発言。', meaning: '候補者の説明を比べる。', uncertainty: '支持への効果は未確認。', evidenceIds: [], ...overrides,
});

describe('reader outlook uses current evidence without turning choices into forecasts', () => {
  it('shows current rating baseline, classified unallocated seats, and separate confirmation dates', () => {
    const html = renderReaderOutlook(now, empty());
    expect(html).toContain('民主党側43議席、共和党側45議席、未配分12議席');
    expect(html).toContain('弱い優勢6・接戦3・評価分裂3');
    expect(html).toContain('利用者が保存した当落案とは別の現在評価');
    expect(html).toContain(`集計基準 ${RATING_SNAPSHOT_AS_OF}`);
    expect(html).toContain('2026-09-24確認');
    expect(html).toContain('2026-10-02確認');
    expect(html).toContain('評価の変更日ではなく確認日');
    expect(html).not.toMatch(/data-(?:choice|policy-choice|save-scenario|reset)/);
    expect(html).not.toContain('勝率');
  });

  it('keeps publication, freshness and update routes independent of publication-array order', () => {
    const data = empty();
    data.updates = [update('old', '2026-09-20'), update('draft-new', '2026-10-04', { status: 'draft' }), update('middle', '2026-10-01'), update('latest', '2026-10-03'), update('reviewed', '2026-10-04', { status: 'reviewed' }), update('second', '2026-10-02')];
    const before = JSON.stringify(data);
    expect(readerOutlookMaterials(data, now).updates.map(item => item.updateId)).toEqual(['latest', 'second', 'middle']);
    const html = renderReaderOutlook(now, data);
    expect(html).toContain('data-reader-feed="update:latest"');
    expect(html).not.toContain('更新 draft-new');
    expect(html).not.toContain('更新 reviewed');
    expect(html).not.toContain('更新 old');
    expect(JSON.stringify(data)).toBe(before);
  });

  it('separates future confirmed dates from elapsed, completed, cancelled and undated events', () => {
    const data = empty();
    data.events = [event('past', '2026-10-03'), event('first', '2026-10-05'), event('second', '2026-10-06'), event('third', '2026-10-07'), event('fourth', '2026-10-08'), event('cancelled', '2026-10-04', { status: 'cancelled' }), event('completed', '2026-10-04', { status: 'completed' }), event('draft', '2026-10-04', { publicationStatus: 'draft' }), event('undated', '', { date: null })];
    const materials = readerOutlookMaterials(data, now);
    expect(materials.upcoming.map(item => item.eventId)).toEqual(['first', 'second', 'third']);
    expect(materials.pending.map(item => item.eventId)).toEqual(['past']);
    const html = renderReaderOutlook(now, data);
    expect(html).toContain('結果の確認を待っている予定が1件');
    expect(html).toContain('予定の実施結果は未確認');
    expect(html).not.toContain('data-reader-feed="event:past"');
    expect(html).not.toContain('data-reader-feed="event:cancelled"');
    expect(data.events.find(item => item.eventId === 'past')?.status).toBe('scheduled');
  });

  it('preserves facts, interpretation, limitations and source dates instead of exposing evidence IDs', () => {
    const data = empty();
    data.updates = [update('one', '2026-10-03', { evidenceIds: ['private-evidence-key'] })];
    data.sources = [{ sourceId: 'private-source-key', title: '公式原文', publisher: '州政府', url: 'https://example.org/original', publishedAt: '2026-09-28', referencePeriod: '2026年', retrievedAt: '2026-10-04', contentVerifiedAt: '2026-10-04', electionIds: [], category: 'official', cadence: 'daily', method: '原文', alternativeUrl: null, checkStatus: 'checked', lastSuccessAt: '2026-10-04T00:00:00Z' }];
    data.evidenceRefs = [{ evidenceId: 'private-evidence-key', sourceId: 'private-source-key', locator: '医療に関する本人回答の段落', checkedAt: '2026-10-04', kind: 'observed' }];
    const html = renderReaderOutlook(now, data);
    for (const text of ['確認した事実', '確認した発言。', '見通しへの意味', '候補者の説明を比べる。', '支持への効果は未確認。', '公表 2026-09-28', '内容確認 2026-10-04', '医療に関する本人回答の段落']) expect(html).toContain(text);
    expect(html).not.toContain('private-evidence-key');
    expect(html).not.toContain('private-source-key');
  });

  it('escapes editorial text and marks missing locators without inventing a page or citation', () => {
    const data = empty();
    data.updates = [update('escaped', '2026-10-03', { title: '<script>bad</script>', evidenceIds: ['missing'] })];
    const html = renderReaderOutlook(now, data);
    expect(html).toContain('&lt;script&gt;bad&lt;/script&gt;');
    expect(html).not.toContain('<script>bad</script>');
    expect(html).toContain('この項目の根拠箇所は未収録');
    expect(html).not.toContain('p.');
    expect(renderReaderOutlook(now, empty())).toContain('公開済みの分析更新は未収録');
    expect(renderReaderOutlook(now, empty())).toContain('日程を確認できた今後の予定は未収録');
  });
});
