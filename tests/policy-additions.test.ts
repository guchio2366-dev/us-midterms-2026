import { describe, expect, it } from 'vitest';
import { elections, sources } from '../src/data/data';
import { issueCategories, powerRules } from '../src/data/civics';
import { evidenceRefs } from '../src/data/research-sources';
import { newsItems } from '../src/data/news';
import { observationData } from '../src/data/observation';
import { rollCalls } from '../src/data/research';
import { policyPrototype } from '../src/data/policy-prototype';
import {
  policyAdditions, policyAdditionRefs as refs, policyAdditionSources,
  policyAdditionRecords, policyAdditionPolicies, policyAdditionContexts,
} from '../src/data/policy-additions';
import type { CandidatePolicyRecord, PolicyPrototypeData, PolicyRef } from '../src/data/policy-prototype-model';
import { candidatePolicyKnowledge, linkedPolicyContexts, policyKey, validatePolicyPrototype } from '../src/policy-prototype-logic';

// Before integration this exercises the proposed merge; after integration it checks the exported production data.
const integrated = policyAdditionPolicies.every(p => policyPrototype.policies.some(old => policyKey(old) === policyKey(p)));
const data: PolicyPrototypeData = integrated ? policyPrototype : {
  ...policyPrototype, focusElectionIds: policyAdditions.focusElectionIds,
  policies: [...policyPrototype.policies, ...policyAdditions.policies],
  candidateRecords: [...policyPrototype.candidateRecords, ...policyAdditions.candidateRecords],
  contextLinks: [...policyPrototype.contextLinks, ...policyAdditions.contextLinks],
  assumptions: [...policyPrototype.assumptions, ...policyAdditions.assumptions],
  factors: [...policyPrototype.factors, ...policyAdditions.factors],
  additionalEvidence: [...policyPrototype.additionalEvidence, ...policyAdditions.additionalEvidence],
  sourceReviews: [...policyPrototype.sourceReviews, ...policyAdditions.sourceReviews],
};
const deps = {
  elections, sources: [...sources, ...observationData.sources, ...policyAdditionSources],
  evidence: [...evidenceRefs, ...observationData.evidenceRefs], news: newsItems,
  updates: observationData.updates, rollCalls, issueIds: issueCategories.map(i => i.issueId), powerRules,
};
const recorded = (candidateId: string, ref: PolicyRef): CandidatePolicyRecord => {
  const knowledge = candidatePolicyKnowledge(data, candidateId, ref);
  expect(knowledge.status).toBe('recorded');
  if (knowledge.status !== 'recorded') throw new Error('Expected an evidence-backed record');
  return knowledge.record;
};

describe('ten-state additive policy evidence', () => {
  it('resolves every policy version, candidate, source, evidence and existing news/platform reference', () => {
    expect(validatePolicyPrototype(data, deps)).toEqual([]);
    expect(new Set(policyAdditionPolicies.map(policyKey)).size).toBe(policyAdditionPolicies.length);
    expect(new Set(policyAdditionRecords.map(r => r.recordId)).size).toBe(policyAdditionRecords.length);
    expect(new Set(policyAdditionSources.map(s => s.sourceId)).size).toBe(policyAdditionSources.length);
    const researchedElectionIds = [
      '2026-AK-2-regular', '2026-ME-2-regular', '2026-MI-2-regular', '2026-NH-2-regular',
      '2026-OH-3-special', '2026-TX-2-regular', '2026-IA-2-regular', '2026-NC-2-regular',
      '2026-GA-2-regular', '2026-KS-2-regular',
    ];
    expect(new Set(data.focusElectionIds)).toEqual(new Set([...researchedElectionIds, '2026-MN-2-regular', '2026-NE-2-regular']));
    for (const electionId of researchedElectionIds) {
      for (const themeId of ['healthcare', 'tariffs']) {
        expect(data.factors.some(f => f.electionId === electionId && f.themeId === themeId)).toBe(true);
      }
    }
  });

  it('keeps five ACA terms and a procedural vote in separate policy versions', () => {
    const designs = [refs.acaSullivan, refs.acaHouse2028, refs.acaPermanent, refs.acaCooper, refs.acaHamilton];
    expect(new Set(designs.map(r => r.policyId)).size).toBe(1);
    expect(new Set(designs.map(policyKey)).size).toBe(5);
    expect(designs.every(r => policyKey(r) !== policyKey(refs.acaProceed))).toBe(true);
    const sullivan = recorded('cand-ak-dan-s-sullivan', refs.acaSullivan);
    expect(sullivan.stance).toBe('conditional');
    expect(sullivan.conditions).toHaveLength(3);
    expect(sullivan.stancePeriod).toBe('historical');
    expect(sullivan.stanceAsOf).toBe('2025-12-11');
    expect(sullivan.actions.every(a => a.kind !== 'vote')).toBe(true);
  });

  it('limits roll 644 to historical cloture on a motion to proceed, for each named candidate', () => {
    const votes = [
      ['cand-ak-dan-s-sullivan', 'yea'], ['cand-me-susan-m-collins', 'yea'], ['cand-ga-jon-ossoff', 'yea'],
      ['cand-oh-jon-husted', 'nay'], ['cand-ks-roger-marshall', 'nay'],
    ] as const;
    for (const [cid, vote] of votes) {
      const r = recorded(cid, refs.acaProceed);
      expect(r.stancePeriod).toBe('historical');
      expect(r.stanceAsOf).toBe('2025-12-11');
      expect(r.actions[0].vote).toBe(vote);
      expect(r.actions[0].text).toContain('最終法案票ではない');
      expect(r.explicitlyPrioritized).toBeNull();
    }
    expect(candidatePolicyKnowledge(data, 'cand-ak-daniel-j-sullivan-jr', refs.acaProceed))
      .toEqual({ status: 'unresearched', stance: 'unknown', explicitlyPrioritized: null });
    expect(candidatePolicyKnowledge(data, 'cand-ks-roger-marshall', refs.acaSullivan).status).toBe('unresearched');
  });

  it('preserves the exact HR1834 House vote without borrowing a stance for another extension term', () => {
    expect(recorded('cand-nh-chris-pappas', refs.acaHouse2028).actions[0].vote).toBe('yea');
    const collins = recorded('cand-ga-mike-collins', refs.acaHouse2028);
    expect(collins.actions[0].vote).toBe('nay');
    expect(collins.stanceAsOf).toBe('2026-01-08');
    expect(recorded('cand-nh-chris-pappas', refs.acaPermanent).actions[0].kind).toBe('stated-priority');
    expect(candidatePolicyKnowledge(data, 'cand-ga-mike-collins', refs.acaPermanent).status).toBe('unresearched');
    const sununu = recorded('cand-nh-john-e-sununu', refs.acaHouse2028);
    expect(sununu.stance).toBe('unknown');
    expect(sununu.stanceEvidenceIds).toEqual([]);
    expect(sununu.explicitlyPrioritized).toBeNull();
    expect(sununu.actions[0].scope).toBe('topic-only');
  });

  it('does not let HSA topic evidence become support for the exact ACA House bill', () => {
    const broken = structuredClone(data);
    const r = broken.candidateRecords.find(r => r.recordId === 'position-sununu-hr1834-unconfirmed')!;
    r.stance = 'support'; r.stancePeriod = 'campaign-as-of'; r.stanceAsOf = '2026-01-20';
    r.stanceEvidenceIds = ['ev-policy-sununu-hsa'];
    expect(validatePolicyPrototype(broken, deps)).toContain(
      `${r.recordId}: stance lacks exact-policy evidence; whole-measure/topic evidence cannot substitute`,
    );
  });

  it('separates emergency-termination measures, targeted tariff proposals and missing positions', () => {
    expect(new Set([refs.globalEmergency, refs.canadaHouse, refs.constructionTariffs, refs.farmTariffs, refs.reciprocalTariffs, refs.tariffApproval].map(policyKey)).size).toBe(6);
    expect(recorded('cand-ak-dan-s-sullivan', refs.globalEmergency).actions[0].vote).toBe('nay');
    expect(recorded('cand-nh-chris-pappas', refs.canadaHouse).actions[0].vote).toBe('yea');
    expect(recorded('cand-nh-john-e-sununu', refs.constructionTariffs).actions[0].kind).toBe('statement');
    expect(candidatePolicyKnowledge(data, 'cand-nh-john-e-sununu', refs.canadaHouse).status).toBe('unresearched');
    expect(candidatePolicyKnowledge(data, 'cand-ak-mary-peltola', refs.globalEmergency).status).toBe('unresearched');
    expect(candidatePolicyKnowledge(data, 'cand-nc-michael-whatley', refs.farmTariffs))
      .toEqual({ status: 'unresearched', stance: 'unknown', explicitlyPrioritized: null });
    expect(recorded('cand-ks-roger-marshall', refs.reciprocalTariffs).stanceAsOf).toBe('2025-02-13');
  });

  it('keeps publication dates, page updates, action dates and check dates distinct', () => {
    const source = (id: string) => policyAdditionSources.find(s => s.sourceId === id)!;
    const hsa = recorded('cand-nh-john-e-sununu', refs.hsaExpansion);
    expect(hsa.actions[0].actionDate).toBe('2026-01-20');
    expect(source('policy-sununu-health').publishedAt).toBe('2026-02-03');
    const building = recorded('cand-nh-john-e-sununu', refs.constructionTariffs);
    expect(building.actions[0].actionDate).toBe('2026-08-27');
    expect(source('policy-sununu-nhpr').publishedAt).toBe('2026-08-28');
    const cooper = recorded('cand-nc-roy-cooper', refs.acaCooper);
    expect(cooper.actions[0].actionDate).toBe('2026-03-09');
    expect(source('policy-cooper-health').publishedAt).toBeNull();
    expect(source('policy-cooper-health').updatedAt).toBe('2026-09-05');
    expect(source('policy-cooper-health-plan').publishedAt).toBe('2026-03-09');
    for (const id of ['policy-senate-roll644', 'policy-senate-roll600', 'policy-house-roll11', 'policy-house-roll65', 'policy-hr1834-eh', 'policy-hjres72-eh']) {
      expect(source(id).publishedAt).toBeNull();
      expect(source(id).contentVerifiedAt).toBe('2026-09-30');
    }
    expect(policyAdditionContexts.find(c => c.linkId === 'context-nh-tariff-scopes')?.eventDate).toBeNull();
    expect(policyAdditionContexts.find(c => c.linkId === 'context-house-aca-2028')?.eventDate).toBeNull();
  });

  it('retains unknown action dates and leaves unchecked PDFs and prior platform checks explicit', () => {
    for (const r of [refs.vaStaff, refs.vaRecords, refs.vaMentalHealth, refs.peltolaHealthCuts]) {
      const record = recorded('cand-ak-mary-peltola', r);
      expect(record.actions[0].actionDate).toBeNull();
      expect(record.actions[0].datePrecision).toBe('unknown');
    }
    for (const r of [refs.acaHamilton, refs.tariffApproval, refs.ruralHospitals]) {
      const record = recorded('cand-ks-adam-hamilton', r);
      expect(record.actions[0].actionDate).toBeNull();
      expect(record.actions[0].sourceIds).toEqual(['ten-ks-hamilton-platform']);
    }
    expect(policyAdditionSources.some(s => s.sourceId === 'ten-ks-hamilton-platform')).toBe(false);
    expect(policyAdditions.sourceReviews.some(s => s.sourceId === 'ten-ks-hamilton-platform')).toBe(false);
    expect(candidatePolicyKnowledge(data, 'cand-ak-mary-peltola', refs.acaHouse2028).status).toBe('unresearched');
  });

  it('records a governor signature as reported executive action and a consent request without inventing votes', () => {
    const cooper = recorded('cand-nc-roy-cooper', refs.ncMedicaid);
    expect(cooper.stancePeriod).toBe('historical');
    expect(cooper.actions[0].actionDate).toBe('2023-03-27');
    expect(cooper.actions[0].kind).toBe('statement');
    expect(cooper.actions[0].vote).toBeNull();
    expect(cooper.actions[0].text).toContain('知事');
    expect(data.policies.find(p => policyKey(p) === policyKey(refs.ncMedicaid))?.routes).toEqual([]);
    const marshall = recorded('cand-ks-roger-marshall', refs.upfrontPrices);
    const statement = marshall.actions.find(a => a.kind === 'statement')!;
    expect(statement.scope).toBe('exact-policy');
    const request = marshall.actions.find(a => a.kind === 'requested-action')!;
    expect(request.vote).toBeNull();
    expect(request.scope).toBe('whole-measure');
    expect(request.targetPolicyRef).toEqual(refs.priceConsentRequest);
    expect(request.text).toContain('異議で停止');
    expect(request.text).toContain('可決や成立ではない');
    expect(marshall.explicitlyPrioritized).toBeNull();
  });

  it('links the original GA/KS news without making patient stories a poll or a proposal an enacted policy', () => {
    const ga = linkedPolicyContexts(data, { feedKind: 'news', feedId: 'news-ga-ossoff-health-20260918' });
    expect(ga.some(c => c.policyRefs.some(r => policyKey(r) === policyKey(refs.priorAuthorization)))).toBe(true);
    expect(ga[0].description).toContain('無作為調査');
    const ks = linkedPolicyContexts(data, { feedKind: 'news', feedId: 'news-ks-marshall-health-20260923' });
    expect(ks[0].description).toContain('異議で停止');
    expect(ks[0].unknowns.join(' ')).toContain('Hamiltonの発表日ではない');
    const whatley = candidatePolicyKnowledge(data, 'cand-nc-michael-whatley', refs.acaCooper);
    expect(whatley).toEqual({ status: 'unresearched', stance: 'unknown', explicitlyPrioritized: null });
  });
});
