import { describe, expect, it } from 'vitest';
import { elections, profiles, seats, sources } from '../src/data/data';
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
  it('verifies the seven Ohio IDs while separating eligibility, party and document dates', () => {
    const oh=elections.find(e=>e.seatId==='OH-3')!;
    expect(oh.candidateResearchStatus).toBe('complete');
    expect(oh.candidates.map(c=>c.candidateId)).toEqual(['cand-oh-sherrod-brown','cand-oh-jon-husted','cand-oh-greg-levy','cand-oh-william-b-redpath','cand-oh-stephen-faris','cand-oh-anthony-holliman','cand-oh-timothy-telymonde']);
    expect(oh.candidates.find(c=>c.candidateId==='cand-oh-greg-levy')?.partyLabel).toBe('Other-party candidate');
    for(const c of oh.candidates.filter(c=>c.ballotStage==='write-in')) {
      expect(c).toMatchObject({status:'confirmed',party:'unknown',partyLabel:'党籍未確認',caucusIntent:'unconfirmed'});
      expect(c.sourceIds).toContain('oh-cuyahoga-candidates-20260917');
    }
    expect(sources.find(s=>s.sourceId==='oh-sos-directive-2026-45')).toMatchObject({publishedAt:'2026-08-25',retrievedAt:'2026-09-30',contentVerifiedAt:'2026-09-30'});
    const html=observationCandidateIntroMarkup(observationFor(oh.electionId)!,oh.candidates,null);
    expect(html).toContain('印刷候補4人');
    expect(html).toContain('党派は記載がないため未確認');
    expect(html).not.toContain('再照合は未完了');
    const summary=profiles.find(p=>p.stateFips==='39')!;
    expect(summary.electionMeaning.text).toContain('印刷候補4人・宣言済み書き込み候補3人を確認');
    expect(summary.electionMeaning.sourceIds).toContain('oh-sos-directive-2026-45');
    expect(elections.find(e=>e.seatId==='NH-2')?.candidateResearchStatus).toBe('partial');
    expect(elections.find(e=>e.seatId==='RI-2')?.candidates.find(c=>c.candidateId==='cand-ri-michael-bahry')?.status).toBe('unconfirmed');
  });
  it('keeps the lower state summaries consistent with current and pending candidates', () => {
    const de=profiles.find(profile=>profile.stateFips==='10')!;
    expect(de.electionMeaning.text).toContain('印刷候補2人・宣言済み書き込み候補3人を確認');
    expect(de.electionMeaning.text).toContain('以前の予備選候補3人は履歴');
    expect(de.electionMeaning.sourceIds).toContain('cand-de-general-20260930');
    const ri=profiles.find(profile=>profile.stateFips==='44')!;
    expect(ri.electionMeaning.text).toContain('印刷候補2人');
    expect(ri.electionMeaning.text).toContain('本選掲載の再確認待ち1人');
    expect(ri.electionMeaning.text).toContain('以前の予備選候補2人は履歴');
    expect(ri.electionMeaning.sourceIds).toContain('cand-ri-ballot-20260930');
    for(const fips of ['33']) expect(profiles.find(profile=>profile.stateFips===fips)!.electionMeaning.text).toContain('最新名簿の再照合は一部未完了');
  });
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

  it('marks Rhode Island independent-candidate coverage and NH roster checks partial', () => {
    const ri = elections.find(e=>e.seatId==='RI-2')!;
    expect(ri.candidates.find(c=>c.candidateId==='cand-ri-michael-bahry')?.status).toBe('unconfirmed');
    expect(candidateChoiceOptionsMarkup(ri,'baseline')).toContain('本選掲載の再確認待ち');
    for(const seatId of ['NH-2']) {
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
