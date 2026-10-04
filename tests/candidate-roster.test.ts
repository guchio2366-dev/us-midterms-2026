import { describe, expect, it } from 'vitest';
import previousRun from '../docs/observation/runs/daily-20260929.json';
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
  it('adds the fourth officially listed NC candidate without claiming certification or a D/R caucus', () => {
    const nc=elections.find(e=>e.seatId==='NC-2')!;
    expect(nc.candidates.map(c=>c.candidateId)).toEqual(['cand-nc-shannon-bray','cand-nc-roy-cooper','cand-nc-michael-whatley','cand-nc-michael-dublin']);
    expect(nc.candidates.filter(c=>c.ballotStage==='general-ballot')).toHaveLength(4);
    expect(nc.candidates.filter(c=>c.ballotStage==='write-in')).toHaveLength(0);
    expect(nc.candidates.find(c=>c.candidateId==='cand-nc-michael-dublin')).toMatchObject({name:'Michael Dublin',party:'other',partyLabel:'GRE',status:'confirmed',ballotStage:'general-ballot',caucusIntent:'unconfirmed',sourceIds:['cand-nc-general-20260930']});
    expect(nc.candidates.find(c=>c.candidateId==='cand-nc-shannon-bray')).toMatchObject({name:'Shannon W. Bray',personId:'person-shannon-bray',caucusIntent:'unconfirmed'});
    expect(sources.find(s=>s.sourceId==='cand-nc-general-20260930')).toMatchObject({publishedAt:null,updatedAt:'2026-09-21T12:32',retrievedAt:'2026-09-30',contentVerifiedAt:'2026-09-30'});
    expect(candidateRosterNoteMarkup('NC-2')).toContain('掲載確認を州認証済みとは扱いません');
    expect(candidateRosterNoteMarkup('NC-2')).toContain('届出日は6月15日');
    expect(profiles.find(p=>p.stateFips==='37')!.electionMeaning.text).toContain('州公式本選候補一覧に4人の掲載を確認');
  });

  it('separates the four Alaska printed candidates from two certified write-ins and both Sullivan identities', () => {
    const ak=elections.find(e=>e.seatId==='AK-2')!;
    expect(ak.candidates.filter(c=>c.ballotStage==='general-ballot').map(c=>c.candidateId)).toEqual(['cand-ak-gerald-l-heikes','cand-ak-mary-peltola','cand-ak-dan-s-sullivan','cand-ak-daniel-j-sullivan-jr']);
    expect(ak.candidates.filter(c=>c.ballotStage==='write-in').map(c=>c.candidateId)).toEqual(['cand-ak-sidney-sid-hill','cand-ak-heather-mcelwain']);
    expect(ak.candidates.find(c=>c.candidateId==='cand-ak-sidney-sid-hill')).toMatchObject({name:'Sidney “Sid” Hill',party:'unknown',partyLabel:'Undeclared',status:'confirmed',ballotStage:'write-in',caucusIntent:'unconfirmed'});
    expect(ak.candidates.find(c=>c.candidateId==='cand-ak-heather-mcelwain')).toMatchObject({name:'Heather McElwain',party:'other',partyLabel:'Registered Libertarian',status:'confirmed',ballotStage:'write-in',caucusIntent:'unconfirmed'});
    const incumbent=ak.candidates.find(c=>c.candidateId==='cand-ak-dan-s-sullivan')!;
    const otherSullivan=ak.candidates.find(c=>c.candidateId==='cand-ak-daniel-j-sullivan-jr')!;
    expect(incumbent.name).toBe('Dan S. Sullivan');
    expect(otherSullivan.name).toBe('Daniel J. Sullivan Jr.');
    expect(incumbent.personId).not.toBe(otherSullivan.personId);
    expect(sources.find(s=>s.sourceId==='ak-doe-2026-general-candidates-20260930')).toMatchObject({publishedAt:null,updatedAt:'2026-09-25T08:16',retrievedAt:'2026-09-30',contentVerifiedAt:'2026-09-30'});
    expect(sources.find(s=>s.sourceId==='ak-doe-2026-general-candidates')?.updatedAt).toBe('2026-09-02');
    const options=candidateChoiceOptionsMarkup(ak,'baseline');
    expect(options).toContain('Sidney “Sid” Hill（Undeclared・記名投票候補）');
    expect(options).toContain('Heather McElwain（Registered Libertarian・記名投票候補）');
    expect(profiles.find(p=>p.stateFips==='02')!.electionMeaning.text).toContain('印刷候補4人・認証済み記名投票候補2人を確認');
  });

  it('keeps all previous NC and AK candidate choices and Senate totals when loading old shares', () => {
    const additions=new Set(['cand-nc-michael-dublin','cand-ak-sidney-sid-hill','cand-ak-heather-mcelwain']);
    const previousElections=elections.map(e=>({...e,candidates:e.candidates.filter(c=>!additions.has(c.candidateId))}));
    const baseline=createLegacySenateBaseline(seats);
    for(const [seatId,candidateIds] of [
      ['NC-2',['cand-nc-shannon-bray','cand-nc-roy-cooper','cand-nc-michael-whatley']],
      ['AK-2',['cand-ak-gerald-l-heikes','cand-ak-mary-peltola','cand-ak-dan-s-sullivan','cand-ak-daniel-j-sullivan-jr']],
    ] as const) for(const candidateId of candidateIds) {
      const state=createScenarioState(baseline);
      const election=previousElections.find(e=>e.seatId===seatId)!;
      state.senate[seatId]={kind:'candidate',electionId:election.electionId,candidateId};
      const loaded=decodeScenario(encodeScenario(state,previousElections),seats,elections,houseDistricts,baseline,baseline);
      expect(loaded.state.senate[seatId]).toEqual(state.senate[seatId]);
      expect(loaded.state.senateBaseline).toEqual(state.senateBaseline);
      expect(countScenarioSenate(loaded.state,seats,elections)).toEqual(countScenarioSenate(state,seats,previousElections));
    }
  });

  it('counts the new GRE and write-in choices as unconfirmed caucuses through share encoding', () => {
    const baseline=createLegacySenateBaseline(seats);
    const baselineState=createScenarioState(baseline);
    const initialCounts=countScenarioSenate(baselineState,seats,elections);
    for(const candidateId of ['cand-ak-sidney-sid-hill','cand-ak-heather-mcelwain']) {
      const state=createScenarioState(baseline);
      state.senate['NC-2']={kind:'candidate',electionId:'2026-NC-2-regular',candidateId:'cand-nc-michael-dublin'};
      state.senate['AK-2']={kind:'candidate',electionId:'2026-AK-2-regular',candidateId};
      const loaded=decodeScenario(encodeScenario(state),seats,elections,houseDistricts,baseline,baseline);
      expect(loaded.state.senate).toEqual(state.senate);
      const counts=countScenarioSenate(loaded.state,seats,elections);
      expect(counts).toEqual({...initialCounts,Republican:initialCounts.Republican-2,unconfirmed:initialCounts.unconfirmed+2});
    }
  });

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

  it('keeps the prior timing discrepancy in its run and shows the new verified completion time', () => {
    expect(previousRun.timingIntegrity).toBe('inconsistent');
    expect(previousRun.completedAt).toBe('2026-09-29T00:20:00Z');
    expect(observationData.monitor.lastCompletedAt).toBe('2026-10-04T00:30:08Z');
    expect(monitoringStatus(observationData,new Date('2026-10-02T01:00:00Z'))).not.toContain('確認時刻の記録に不整合');
    expect(monitoringStatus(observationData,new Date('2026-10-02T01:00:00Z'))).toContain('一部の情報源を未確認');
    expect(monitoringMarkup(new Date('2026-10-02T01:00:00Z'))).not.toContain('実時刻は未確認');
    expect(monitoringMarkup(new Date('2026-10-02T01:00:00Z'))).toContain('公表済み結果、確認済み予定、部分確認を分けて記録した');
  });
});
