import { describe, expect, it } from 'vitest';
import { elections, seats } from '../src/data/data';
import { houseDistricts } from '../src/data/house';
import { candidateRosterNotes, isArchivedCandidate } from '../src/candidate-roster';
import { candidateChoiceOptionsMarkup, candidateRosterNoteMarkup } from '../src/ui/candidate-roster';
import { observationCandidateIntroMarkup, monitoringMarkup } from '../src/ui/observation';
import { observationData, observationFor } from '../src/data/observation';
import { monitoringStatus } from '../src/observation-logic';
import { createLegacySenateBaseline } from '../src/scenario/baseline';
import { createScenarioState, countScenarioSenate } from '../src/scenario/model';
import { encodeScenario, decodeScenario } from '../src/scenario/storage';

describe('candidate roster verification and saved assumptions', () => {
  it('separates Delaware printed, declared write-in and previous primary candidates', () => {
    const election = elections.find(e=>e.seatId==='DE-2')!;
    expect(election.candidates.filter(c=>c.ballotStage==='general-ballot').map(c=>c.name)).toEqual(['Chris Coons','Michael Katz']);
    expect(election.candidates.filter(c=>c.ballotStage==='write-in').map(c=>c.name)).toEqual(['William McVay','John Shulli','Travis Jack Stevens']);
    const old = election.candidates.find(c=>c.candidateId==='cand-de-jeff-appelhans')!;
    expect(isArchivedCandidate(old,election)).toBe(true);
    expect(candidateChoiceOptionsMarkup(election,`candidate:${old.candidateId}`)).toContain(`value="candidate:${old.candidateId}" selected disabled`);
  });

  it('retains a saved old-primary candidate through share encoding with the same seat totals', () => {
    const baseline = createLegacySenateBaseline(seats);
    const state = createScenarioState(baseline);
    state.senate['RI-2']={kind:'candidate',electionId:'2026-RI-2-regular',candidateId:'cand-ri-connor-burbridge'};
    const loaded = decodeScenario(encodeScenario(state),seats,elections,houseDistricts,baseline,baseline);
    expect(loaded.state.senate['RI-2']).toEqual(state.senate['RI-2']);
    expect(countScenarioSenate(loaded.state,seats,elections)).toEqual(countScenarioSenate(state,seats,elections));
  });

  it('marks Rhode Island independent-candidate coverage and OH/NH roster checks partial', () => {
    const ri = elections.find(e=>e.seatId==='RI-2')!;
    expect(ri.candidates.find(c=>c.candidateId==='cand-ri-michael-bahry')?.status).toBe('unconfirmed');
    expect(candidateChoiceOptionsMarkup(ri,'baseline')).toContain('本選掲載の再確認待ち');
    for(const seatId of ['OH-3','NH-2']) {
      const election=elections.find(e=>e.seatId===seatId)!;
      expect(election.candidateResearchStatus).toBe('partial');
      const html=observationCandidateIntroMarkup(observationFor(election.electionId)!,election.candidates,null);
      expect(html).toContain('2026年9月9日時点');
      expect(html).toContain('未完了');
    }
    expect(candidateRosterNoteMarkup('RI-2')).toContain(candidateRosterNotes['RI-2']);
  });

  it('discloses inconsistent recorded times without inventing a new completion time', () => {
    expect(observationData.monitor.lastCompletedAt).toBe('2026-09-29T00:20:00Z');
    expect(monitoringStatus(observationData,new Date('2026-09-30T13:00:00Z'))).toContain('確認時刻の記録に不整合');
    expect(monitoringStatus(observationData,new Date('2026-09-30T13:00:00Z'))).toContain('確認が遅れています');
    expect(monitoringMarkup()).toContain('実時刻は未確認');
    expect(monitoringMarkup()).toContain('元の時刻を保持');
  });
});
