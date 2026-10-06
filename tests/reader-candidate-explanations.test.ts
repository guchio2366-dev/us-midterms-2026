import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { elections, sources } from '../src/data/data';
import { candidateBriefs } from '../src/data/research';
import type { EvidenceRef } from '../src/data/research-model';
import { evidenceRefs } from '../src/data/research-sources';
import { policyPrototype, policyRefs } from '../src/data/policy-prototype';
import {
  readerCandidateComparisons,
  readerCandidateExplanationEvidence,
  readerCandidateExplanationSources,
  readerCandidateExplanations,
} from '../src/data/reader-candidate-explanations';

const maineId = '2026-ME-2-regular';
const collinsId = 'cand-me-susan-m-collins';
const jacksonId = 'cand-me-troy-d-jackson';
const sourceById = new Map([...sources, ...readerCandidateExplanationSources].map(source => [source.sourceId, source]));
const evidenceById = new Map<string, EvidenceRef>([...evidenceRefs, ...policyPrototype.additionalEvidence, ...readerCandidateExplanationEvidence].map(evidence => [evidence.evidenceId, evidence]));

describe('candidate explanations supplied after primary-source review', () => {
  it('keeps all twelve supplied states and twenty-four candidate explanations complete', () => {
    expect(readerCandidateExplanations).toHaveLength(24);
    expect(new Set(readerCandidateExplanations.map(item => item.electionId))).toEqual(new Set([
      maineId, '2026-AK-2-regular', '2026-NC-2-regular', '2026-MN-2-regular',
      '2026-MI-2-regular', '2026-IA-2-regular', '2026-OH-3-special',
      '2026-NE-2-regular', '2026-NH-2-regular',
      '2026-TX-2-regular', '2026-GA-2-regular', '2026-KS-2-regular',
    ]));
    expect(readerCandidateExplanations.flatMap(item => item.sections.flatMap(section => section.paragraphs))).toHaveLength(83);
    for (const [electionId, count, expectedHash] of [
      ['2026-AK-2-regular', 8, '5268db9b7b02eaac31d0e26cd06dbd8f6956095f50f107e74986a5140dc6b629'],
      ['2026-NC-2-regular', 6, '5a4ca12b87f17fd9c74b303893cc9d39eebd6fce186a48620b30b1516cc392a3'],
      ['2026-MN-2-regular', 6, '84ffb36e2127a6a53b6a891cec032269e63c3089b2aaf5883cbbce20b61f04e9'],
      ['2026-MI-2-regular', 7, '8c75e4b3da1e441ddf076fc963d578813e6b350d90403af95a5ad3c3e19f33bd'],
      ['2026-IA-2-regular', 8, '25c2fa8f7754d9707d786224c074a6a723a3188bbd37c614268a226bdbdbc04d'],
      ['2026-OH-3-special', 7, '9efacb66e7f985b853f614f09837f18bdc507de6e142b6652c8b8a945e251ab9'],
      ['2026-NE-2-regular', 6, '758aad29362cf272ed4f16c35e9ead6622a262f9d76d6bddf1d420a95fb0a105'],
      ['2026-NH-2-regular', 7, '44c787b8f492452bf4c2b7d95ab1bc6425bed1204f064c5ca7a860b5c96ad945'],
      ['2026-TX-2-regular', 7, '671ad8de238ea750866b084b281f1693e3ffffab9be5187eef257a914011cf60'],
      ['2026-GA-2-regular', 7, 'cb6cb3412bcc3e2439ee7256a12af2a982858599dc7b071efe38769b3bbe92ae'],
      ['2026-KS-2-regular', 7, 'e7a8435f2146977eecd8e42618c40a293abf9dc841d291cc96540642cbafc534'],
    ] as const) {
      const paragraphs = readerCandidateExplanations.filter(item => item.electionId === electionId)
        .flatMap(item => item.sections.flatMap(section => section.paragraphs));
      expect(paragraphs, electionId).toHaveLength(count);
      expect(createHash('sha256').update(paragraphs.map(paragraph => paragraph.text).join('\n\n')).digest('hex'), electionId).toBe(expectedHash);
    }
  });

  it('preserves the complete approved Maine paragraphs and comparison, without shortening the scope caveats', () => {
    const maine = readerCandidateExplanations.filter(item => item.electionId === maineId);
    expect(maine.map(item => item.candidateId)).toEqual([collinsId, jacksonId]);
    expect(maine.flatMap(item => item.sections.map(section => section.heading))).toEqual([
      '医療の受診機会を守りながら、給付条件は見直す',
      'カナダとの取引を守るため、広範な関税に異議',
      '医療保障と働く人の交渉力を広げる',
      '住宅費と政治制度にも企業の影響を問う',
    ]);
    const paragraphs = maine.flatMap(item => item.sections.flatMap(section => section.paragraphs));
    expect(paragraphs).toHaveLength(7);
    const comparisons = readerCandidateComparisons.filter(item => item.electionId === maineId);
    expect(comparisons).toHaveLength(1);
    // A verbatim-copy contract: this hash includes all eight supplied paragraphs,
    // joined by blank lines, and excludes only the editorial [M1, ...] markers.
    expect(createHash('sha256').update([...paragraphs, ...comparisons].map(paragraph => paragraph.text).join('\n\n')).digest('hex'))
      .toBe('730ce528e1f1995e949032432efb2ca74c295a6350e1b6be9176be026237b4a1');
  });

  it('resolves every candidate, election and paragraph source/evidence reference', () => {
    const keys = readerCandidateExplanations.map(item => `${item.electionId}:${item.candidateId}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(readerCandidateExplanationSources.map(item => item.sourceId)).size).toBe(readerCandidateExplanationSources.length);
    expect(new Set(readerCandidateExplanationEvidence.map(item => item.evidenceId)).size).toBe(readerCandidateExplanationEvidence.length);
    for (const explanation of readerCandidateExplanations) {
      const election = elections.find(item => item.electionId === explanation.electionId);
      expect(election, explanation.electionId).toBeDefined();
      expect(election!.candidates.some(candidate => candidate.candidateId === explanation.candidateId), explanation.candidateId).toBe(true);
      expect(explanation.checkedAt).toBe('2026-10-06');
      expect(explanation.sections.length).toBeGreaterThan(0);
    }
    const paragraphs = [
      ...readerCandidateExplanations.flatMap(item => item.sections.flatMap(section => section.paragraphs)),
      ...readerCandidateComparisons,
    ];
    for (const paragraph of paragraphs) {
      expect(paragraph.text.trim().length).toBeGreaterThan(0);
      expect(paragraph.sourceIds.length).toBeGreaterThan(0);
      expect(paragraph.evidenceIds.length).toBeGreaterThan(0);
      for (const sourceId of paragraph.sourceIds) {
        const source = sourceById.get(sourceId);
        expect(source, sourceId).toBeDefined();
        expect(new URL(source!.url).protocol).toBe('https:');
        expect(paragraph.evidenceIds.some(evidenceId => evidenceById.get(evidenceId)?.sourceId === sourceId), `${sourceId}: paragraph source has a checked locator`).toBe(true);
      }
      for (const evidenceId of paragraph.evidenceIds) {
        const evidence = evidenceById.get(evidenceId);
        expect(evidence, evidenceId).toBeDefined();
        expect(paragraph.sourceIds, evidenceId).toContain(evidence!.sourceId);
        expect(evidence!.locator.trim().length, evidenceId).toBeGreaterThan(0);
      }
    }
  });

  it('preserves all eight Maine primary links and original publication dates separately from the new check date', () => {
    const expectedSources = [
      ['collins-reconciliation-statement-2025', 'https://www.collins.senate.gov/newsroom/senator-collins-statement-on-the-senate-reconciliation-bill', '2025-07-01'],
      ['senate-rollcall-119-372', 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00372.htm', '2025-07-01'],
      ['candidate-collins-track-record-20261006', 'https://susancollins.com/track-record/', null],
      ['senate-rollcall-119-160', 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1191/vote_119_1_00160.htm', '2025-04-02'],
      ['collins-canada-negotiations-20260822', 'https://www.collins.senate.gov/newsroom/senator-collins-statement-on-the-breakdown-of-us-canada-trade-negotiations', '2026-08-22'],
      ['jackson-priorities-2026', 'https://www.jacksonformaine.com/priorities', null],
      ['candidate-jackson-about-20261006', 'https://www.jacksonformaine.com/about', null],
      ['jackson-blueberry-ridge-20260917', 'https://www.jacksonformaine.com/news/jackson-stands-with-residents-protesting-out-of-state-private-equity-firms-increasing-costs', '2026-09-17'],
    ] as const;
    for (const [sourceId, url, publishedAt] of expectedSources) {
      expect(sourceById.get(sourceId), sourceId).toMatchObject({ url, publishedAt, contentVerifiedAt: '2026-10-06' });
    }
    expect(sourceById.get('jackson-priorities-2026')!.referencePeriod).toContain('2026-09-11');
    expect(evidenceById.get('ev-jackson-priorities')!.note).toContain('退役軍人の具体策は今回未再確認');
    expect(candidateBriefs.find(item => item.candidateId === jacksonId)!.updatedAt).toBe('2026-09-11');
  });

  it('keeps shared House-source rechecks unique without changing the originals’ publication dates or policy records', () => {
    for (const sourceId of ['policy-house-roll11', 'policy-hr1834-eh', 'policy-house-roll65', 'policy-hjres72-eh']) {
      const base = sources.find(source => source.sourceId === sourceId)!;
      const updated = readerCandidateExplanationSources.filter(source => source.sourceId === sourceId);
      expect(updated, sourceId).toHaveLength(1);
      expect(updated[0], sourceId).toMatchObject({ url: base.url, publishedAt: base.publishedAt, contentVerifiedAt: '2026-10-06' });
    }
    const sununu = policyPrototype.candidateRecords.find(record => record.recordId === 'position-sununu-hr1834-unconfirmed')!;
    expect(sununu).toMatchObject({ stance: 'unknown', stancePeriod: 'unknown', stanceAsOf: null, stanceEvidenceIds: [] });
    expect(policyPrototype.candidateRecords.filter(record => record.electionId === '2026-NE-2-regular')).toHaveLength(0);
  });

  it('does not turn Jackson’s current Medicare for All pledge into a different Medicaid or El-Sayed policy stance', () => {
    const medicaid = policyPrototype.candidateRecords.find(item => item.recordId === 'position-jackson-medicaid-funding');
    expect(medicaid).toMatchObject({
      candidateId: jacksonId,
      stance: 'unknown',
      stancePeriod: 'unknown',
      stanceAsOf: null,
      stanceEvidenceIds: [],
      policyId: policyRefs.medicaidFunding.policyId,
      versionId: policyRefs.medicaidFunding.versionId,
    });
    expect(policyPrototype.candidateRecords.some(item => item.candidateId === jacksonId && item.policyId === policyRefs.medicareAll.policyId && item.versionId === policyRefs.medicareAll.versionId)).toBe(false);
    for (const [recordId, stance, stanceAsOf] of [
      ['position-collins-hr1', 'oppose', '2025-07-01'],
      ['position-collins-medicaid-funding', 'oppose', '2025-07-01'],
      ['position-collins-medicaid-work', 'conditional', '2025-07-01'],
      ['position-collins-canada-emergency', 'support', '2025-04-02'],
    ]) {
      expect(policyPrototype.candidateRecords.find(item => item.recordId === recordId)).toMatchObject({ stance, stanceAsOf });
    }
  });
});
