import { describe, expect, it } from 'vitest';
import { polls, raceBriefs } from '../src/data/research';
import { observationData } from '../src/data/observation';
import { sources } from '../src/data/data';
import { evidenceRefs } from '../src/data/research-sources';
import { briefingLenses } from '../src/data/briefing-lenses';
import { briefingEvidenceMarkup, briefingComparisonPollsMarkup, briefingPollStudies } from '../src/ui/briefing-polls';

const byId = (id: string) => polls.find(poll => poll.pollId === id)!;
const renderedIds = (html: string) => [...html.matchAll(/data-poll-id="([^"]+)"/g)].map(match => match[1]);

describe('HPU and Fox primary-source poll synchronization', () => {
  it('publishes HPU only for the verified likely-voter population with a credibility interval', () => {
    const poll = byId('poll-nc-hpu-2026-09-lv');
    expect(poll).toMatchObject({ electionId:'2026-NC-2-regular',fieldStart:'2026-09-06',fieldEnd:'2026-09-16',population:'LV',sampleSize:706,resultStage:'base',status:'published' });
    expect(poll.results.map(result => [result.candidateId ?? result.category,result.value])).toEqual([
      ['cand-nc-roy-cooper',50],['cand-nc-michael-whatley',42],['other-candidate',3],['undecided',5],
    ]);
    expect(poll.method).toContain('非確率');
    expect(poll.method).toContain('5〜7点');
    expect(poll.precisionLabel).toContain('credibility interval ±3.9');
    expect(poll.precisionLabel).toContain('通常の標本誤差ではない');
    expect(poll.sourceIds).toEqual(['obs-hpu-nc-20260924']);
  });

  it('groups Fox LV and RV as one study and preserves leaners and suppressed categories', () => {
    const lv = byId('poll-mi-fox-2026-09-lv');
    const rv = byId('poll-mi-fox-2026-09-rv');
    expect(lv.studyId).toBe(rv.studyId);
    expect(lv).toMatchObject({ population:'LV',sampleSize:1028,fieldStart:'2026-09-24',fieldEnd:'2026-09-28',precisionLabel:'標本誤差 ±3ポイント（LV）' });
    expect(rv).toMatchObject({ population:'RV',sampleSize:1203,precisionLabel:'標本誤差 ±2.5ポイント（RV）' });
    expect(lv.results.map(result => result.value)).toEqual([50,49,1]);
    expect(rv.results.map(result => result.value)).toEqual([51,48,1]);
    for (const poll of [lv,rv]) {
      expect(poll).toMatchObject({ electionId:'2026-MI-2-regular',resultStage:'cumulative-with-leaners',completeness:'partial',residualTreatment:'rounding',status:'published' });
      expect(poll.results.map(result => result.candidateId).filter(Boolean)).toEqual(['cand-mi-abdul-el-sayed','cand-mi-mike-rogers']);
      expect(poll.notes.join(' ')).toContain('0.5%未満');
      expect(poll.notes.join(' ')).toContain('追質問前');
      expect(poll.results.some(result => result.category === 'other' || result.category === 'not-voting')).toBe(false);
    }
    const foxStudy = briefingPollStudies(polls,'2026-MI-2-regular').filter(study => study[0].studyId === lv.studyId);
    expect(foxStudy).toHaveLength(1);
    expect(foxStudy[0].map(poll => poll.pollId)).toEqual([lv.pollId,rv.pollId]);
  });

  it.each([
    ['2026-NC-2-regular',['poll-nc-hpu-2026-09-lv']],
    ['2026-MI-2-regular',['poll-mi-fox-2026-09-lv','poll-mi-fox-2026-09-rv']],
  ])('pairs the updated %s interpretation with its polls exactly once', (electionId, ids) => {
    const html = briefingEvidenceMarkup(polls,electionId);
    expect(renderedIds(html)).toEqual(ids);
    const combinedIds = renderedIds(html + briefingComparisonPollsMarkup(polls,electionId));
    expect(new Set(combinedIds).size).toBe(combinedIds.length);
    const lens = briefingLenses.find(item => item.electionId === electionId)!;
    expect(lens.nextData).toContain('後続');
    const brief = raceBriefs.find(item => item.electionId === electionId)!;
    expect(brief.pollIds).toEqual(expect.arrayContaining(ids));
    for (const id of ids) {
      const poll = byId(id);
      for (const evidenceId of poll.evidenceIds) {
        const ref = evidenceRefs.find(item => item.evidenceId === evidenceId)!;
        expect(ref.checkedAt).toBe('2026-10-01');
        expect(poll.sourceIds).toContain(ref.sourceId);
        expect(ref.locator).toBeTruthy();
      }
    }
  });

  it('preserves publication dates separately from the current check and leaves AARP as recorded news', () => {
    expect(sources.find(source => source.sourceId === 'obs-hpu-nc-20260924')).toMatchObject({ publishedAt:'2026-09-24',contentVerifiedAt:'2026-10-01' });
    expect(sources.find(source => source.sourceId === 'obs-fox-mi-20260930')).toMatchObject({ publishedAt:'2026-09-30',contentVerifiedAt:'2026-10-01' });
    expect(polls.some(poll => poll.sourceIds.includes('obs-aarp-nc-20260928'))).toBe(false);
    expect(sources.find(source => source.sourceId === 'obs-aarp-nc-20260928')).toMatchObject({ publishedAt:'2026-09-28',contentVerifiedAt:'2026-09-29' });
    const aarpNews = observationData.updates.find(update => update.evidenceIds.includes('ev-obs-aarp-nc-20260928'));
    expect(aarpNews).toMatchObject({ status:'published',eventDate:'2026-09-28',updatedAt:'2026-09-29' });
    expect(sources.find(source => source.sourceId === 'obs-aarp-nc-20260928')!.referencePeriod).toContain('1,115');
    expect(aarpNews!.happened).toContain('53%');
  });
});
