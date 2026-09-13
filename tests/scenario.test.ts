import { describe,expect,it } from 'vitest';
import { elections,seats } from '../src/data/data';
import { houseDistricts } from '../src/data/house';
import {
  countScenarioSenate,
  createScenarioState,
  normalizeScenario,
  type ScenarioState,
} from '../src/scenario/model';
import { createLegacySenateBaseline,createRatingSenateBaseline } from '../src/scenario/baseline';
import { generateSenatePaths } from '../src/scenario/paths';
import { decodeScenario,encodeScenario,loadDraft,loadSavedScenarios,persistSavedScenarios,saveDraft,LEGACY_SAVED_STORAGE_KEY,SAVED_STORAGE_KEY } from '../src/scenario/storage';
import { aggregateRatingConsensus,consensusDisplayRating } from '../src/rating-consensus';
import { RATING_METHOD_VERSION,RATING_SNAPSHOT_AS_OF,RATING_SNAPSHOT_ID,ratingSnapshotObservations } from '../src/data/rating-snapshot';

const consensus = aggregateRatingConsensus(elections.map(election => election.seatId),ratingSnapshotObservations);
const currentBaseline = createRatingSenateBaseline({seats,elections,consensus,snapshotId:RATING_SNAPSHOT_ID,asOf:RATING_SNAPSHOT_AS_OF,methodVersion:RATING_METHOD_VERSION,seatDataVersion:'test'});
const legacyBaseline = createLegacySenateBaseline(seats);
const freshScenario = () => createScenarioState(currentBaseline);

class MemoryStorage {
  private values = new Map<string,string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string,value: string) { this.values.set(key,value); }
}

function firstElectionWithBothCaucuses() {
  const election = elections.find(item => {
    const caucuses = new Set(item.candidates.map(candidate => candidate.caucusIntent));
    return caucuses.has('Democratic') && caucuses.has('Republican');
  });
  if (!election) throw new Error('Expected an election with both major caucuses');
  return election;
}

describe('shared scenario state',() => {
  it('starts a new scenario from the rating consensus with six seats unassigned',() => {
    const counts = countScenarioSenate(freshScenario(),seats,elections);
    expect(counts).toEqual({Democratic:46,Republican:48,none:0,unconfirmed:0,vacant:0,unassigned:6});
  });

  it('keeps a current candidate choice and resolves its caucus',() => {
    const election = firstElectionWithBothCaucuses();
    const candidate = election.candidates.find(item => item.caucusIntent === 'Democratic')!;
    const raw = freshScenario();
    raw.senate[election.seatId] = {kind:'candidate',electionId:election.electionId,candidateId:candidate.candidateId};

    const loaded = normalizeScenario(raw,seats,elections,houseDistricts,currentBaseline,legacyBaseline);

    expect(loaded.notices).toEqual([]);
    expect(loaded.state.senate[election.seatId]?.kind).toBe('candidate');
  });

  it('drops a candidate removed from the current official roster',() => {
    const election = elections[0];
    const raw = freshScenario();
    raw.senate[election.seatId] = {kind:'candidate',electionId:election.electionId,candidateId:'removed-candidate'};

    const loaded = normalizeScenario(raw,seats,elections,houseDistricts,currentBaseline,legacyBaseline);

    expect(loaded.state.senate[election.seatId]).toBeUndefined();
    expect(loaded.notices.join(' ')).toContain('再選択');
  });

  it('round-trips a scenario through a share URL payload',() => {
    const election = firstElectionWithBothCaucuses();
    const state = freshScenario();
    state.senate[election.seatId] = {kind:'caucus',electionId:election.electionId,caucus:'Republican'};
    state.house[houseDistricts[0].districtId] = 'Democratic';
    state.target = {targetId:'ordinary-pass',caucus:'Republican'};

    const loaded = decodeScenario(encodeScenario(state),seats,elections,houseDistricts,currentBaseline,legacyBaseline);

    expect(loaded.state.senate).toEqual(state.senate);
    expect(loaded.state.house).toEqual(state.house);
    expect(loaded.state.target).toEqual(state.target);
    expect(loaded.state.senateBaseline).toEqual(state.senateBaseline);
  });

  it('keeps the saved baseline when the current rating snapshot changes',() => {
    const state = freshScenario();
    const changedBaseline = structuredClone(currentBaseline);
    changedBaseline.snapshotId = 'later-snapshot';
    changedBaseline.outcomes['MI-2'] = 'Republican';
    const loaded = decodeScenario(encodeScenario(state),seats,elections,houseDistricts,changedBaseline,legacyBaseline);
    expect(countScenarioSenate(loaded.state,seats,elections)).toEqual({Democratic:46,Republican:48,none:0,unconfirmed:0,vacant:0,unassigned:6});
    expect(loaded.staleBaseline).toBe(true);
  });

  it('migrates a version-one scenario without changing its 47 to 53 baseline',() => {
    const legacyRaw = {schemaVersion:1,baselineVersion:'research03-2026-09-12',senate:{},house:{},target:null,unlockedSeatIds:[],updatedAt:''};
    const loaded = normalizeScenario(legacyRaw,seats,elections,houseDistricts,currentBaseline,legacyBaseline);
    expect(countScenarioSenate(loaded.state,seats,elections)).toEqual({Democratic:47,Republican:53,none:0,unconfirmed:0,vacant:0,unassigned:0});
    expect(loaded.state.senateBaseline.kind).toBe('legacy-holdings');
  });

  it('lets an unassigned seat move to either party and return to its baseline',() => {
    const state = freshScenario();
    const election = elections.find(item => currentBaseline.outcomes[item.seatId] === 'unassigned')!;
    state.senate[election.seatId] = {kind:'caucus',electionId:election.electionId,caucus:'Democratic'};
    expect(countScenarioSenate(state,seats,elections)).toMatchObject({Democratic:47,Republican:48,unassigned:5});
    state.senate[election.seatId] = {kind:'caucus',electionId:election.electionId,caucus:'Republican'};
    expect(countScenarioSenate(state,seats,elections)).toMatchObject({Democratic:46,Republican:49,unassigned:5});
    delete state.senate[election.seatId];
    expect(countScenarioSenate(state,seats,elections)).toMatchObject({Democratic:46,Republican:48,unassigned:6});
  });

  it('recovers safely from a corrupt browser draft',() => {
    const storage = new MemoryStorage() as unknown as Storage;
    storage.setItem('us-midterms-2026:scenario-draft:v1','{broken');

    const loaded = loadDraft(storage,seats,elections,houseDistricts,currentBaseline,legacyBaseline)!;

    expect(loaded.state.senate).toEqual({});
    expect(loaded.notices.join(' ')).toContain('暫定配分');
    expect(saveDraft(storage,freshScenario()).ok).toBe(true);
  });

  it('does not resurrect legacy named scenarios after a valid empty v2 list is saved',() => {
    const storage = new MemoryStorage() as unknown as Storage;
    storage.setItem(LEGACY_SAVED_STORAGE_KEY,JSON.stringify([{id:'old',name:'旧案',savedAt:'2026-09-12',state:{schemaVersion:1,baselineVersion:'research03-2026-09-12',senate:{},house:{},target:null,unlockedSeatIds:[],updatedAt:''}}]));
    expect(loadSavedScenarios(storage,seats,elections,houseDistricts,currentBaseline,legacyBaseline).items).toHaveLength(1);
    expect(persistSavedScenarios(storage,[]).ok).toBe(true);
    expect(storage.getItem(SAVED_STORAGE_KEY)).toBe('[]');
    expect(loadSavedScenarios(storage,seats,elections,houseDistricts,currentBaseline,legacyBaseline).items).toHaveLength(0);
  });

  it('candidate choices feed the same Senate total used by the simulator',() => {
    const election = firstElectionWithBothCaucuses();
    const state = freshScenario();
    const democratic = election.candidates.find(candidate => candidate.caucusIntent === 'Democratic')!;
    state.senate[election.seatId] = {kind:'candidate',electionId:election.electionId,candidateId:democratic.candidateId};

    const counts = countScenarioSenate(state,seats,elections);

    expect(counts.Democratic + counts.Republican + counts.none + counts.unconfirmed + counts.vacant + counts.unassigned).toBe(100);
    expect(countScenarioSenate(state,seats,elections).Democratic).toBe(counts.Democratic);
  });
});

describe('reverse Senate paths',() => {
  it('uses the map consensus for route rankings and labels without changing saved state',() => {
    const state = freshScenario();
    const before = JSON.stringify(state);
    const ratings = new Map(consensus.map(result => [result.seatId,consensusDisplayRating(result)]));
    for (const caucus of ['Democratic','Republican'] as const) {
      const result = generateSenatePaths({seats,elections,scenario:state,caucus,threshold:51,ratings,limit:3});
      expect(result.status).toBe('reached');
      expect(result.paths).toHaveLength(3);
      for (const path of result.paths) {
        expect(path.addedSeatIds.every(seatId => ratings.get(seatId) === 'Toss Up')).toBe(true);
        expect(path.races.every(race => race.rating === ratings.get(race.seatId))).toBe(true);
      }
    }
    expect(JSON.stringify(state)).toBe(before);
  });

  it('shows at least one route to 51 seats without inventing probabilities',() => {
    const result = generateSenatePaths({seats,elections,scenario:freshScenario(),caucus:'Democratic',threshold:51,limit:3});

    expect(result.status).toBe('reached');
    expect(result.shortage).toBe(5);
    expect(result.paths).toHaveLength(3);
    expect(result.paths[0].addedSeatIds).toHaveLength(result.shortage);
  });

  it('starts the Republican path three seats short without locking automatic ratings',() => {
    const result = generateSenatePaths({seats,elections,scenario:freshScenario(),caucus:'Republican',threshold:51,limit:3});
    expect(result.status).toBe('reached');
    expect(result.shortage).toBe(3);
    expect(result.paths[0].addedSeatIds).toHaveLength(3);
  });

  it('respects explicit choices until the user unlocks them',() => {
    const state = freshScenario();
    for (const election of elections) state.senate[election.seatId] = {kind:'caucus',electionId:election.electionId,caucus:'Republican'};

    const locked = generateSenatePaths({seats,elections,scenario:state,caucus:'Democratic',threshold:51});
    expect(locked.status).toBe('locked-impossible');

    state.unlockedSeatIds = elections.map(election => election.seatId);
    const unlocked = generateSenatePaths({seats,elections,scenario:state,caucus:'Democratic',threshold:51});
    expect(unlocked.status).toBe('reached');
  });

  it('distinguishes a target that this election cannot reach',() => {
    const result = generateSenatePaths({seats,elections,scenario:freshScenario(),caucus:'Democratic',threshold:70});
    expect(result.status).toBe('election-impossible');
    expect(result.paths).toEqual([]);
  });
});
