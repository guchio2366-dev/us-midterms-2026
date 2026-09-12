import { describe,expect,it } from 'vitest';
import { elections,seats } from '../src/data/data';
import { houseDistricts } from '../src/data/house';
import { simulatedCounts } from '../src/logic';
import {
  createScenarioState,
  normalizeScenario,
  senateAssumptionsFromScenario,
  type ScenarioState,
} from '../src/scenario/model';
import { generateSenatePaths } from '../src/scenario/paths';
import { decodeScenario,encodeScenario,loadDraft,saveDraft } from '../src/scenario/storage';

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
  it('keeps a current candidate choice and resolves its caucus',() => {
    const election = firstElectionWithBothCaucuses();
    const candidate = election.candidates.find(item => item.caucusIntent === 'Democratic')!;
    const raw = createScenarioState();
    raw.senate[election.seatId] = {kind:'candidate',electionId:election.electionId,candidateId:candidate.candidateId};

    const loaded = normalizeScenario(raw,seats,elections,houseDistricts);

    expect(loaded.notices).toEqual([]);
    expect(senateAssumptionsFromScenario(loaded.state,elections)[election.seatId]).toBe('Democratic');
  });

  it('drops a candidate removed from the current official roster',() => {
    const election = elections[0];
    const raw = createScenarioState();
    raw.senate[election.seatId] = {kind:'candidate',electionId:election.electionId,candidateId:'removed-candidate'};

    const loaded = normalizeScenario(raw,seats,elections,houseDistricts);

    expect(loaded.state.senate[election.seatId]).toBeUndefined();
    expect(loaded.notices.join(' ')).toContain('再選択');
  });

  it('round-trips a scenario through a share URL payload',() => {
    const election = firstElectionWithBothCaucuses();
    const state = createScenarioState();
    state.senate[election.seatId] = {kind:'caucus',electionId:election.electionId,caucus:'Republican'};
    state.house[houseDistricts[0].districtId] = 'Democratic';
    state.target = {targetId:'ordinary-pass',caucus:'Republican'};

    const loaded = decodeScenario(encodeScenario(state),seats,elections,houseDistricts);

    expect(loaded.state.senate).toEqual(state.senate);
    expect(loaded.state.house).toEqual(state.house);
    expect(loaded.state.target).toEqual(state.target);
  });

  it('recovers safely from a corrupt browser draft',() => {
    const storage = new MemoryStorage() as unknown as Storage;
    storage.setItem('us-midterms-2026:scenario-draft:v1','{broken');

    const loaded = loadDraft(storage,seats,elections,houseDistricts)!;

    expect(loaded.state.senate).toEqual({});
    expect(loaded.notices.join(' ')).toContain('初期状態');
    expect(saveDraft(storage,createScenarioState()).ok).toBe(true);
  });

  it('candidate choices feed the same Senate total used by the simulator',() => {
    const election = firstElectionWithBothCaucuses();
    const state = createScenarioState();
    const democratic = election.candidates.find(candidate => candidate.caucusIntent === 'Democratic')!;
    state.senate[election.seatId] = {kind:'candidate',electionId:election.electionId,candidateId:democratic.candidateId};

    const counts = simulatedCounts(seats,elections,senateAssumptionsFromScenario(state,elections));

    expect(counts.Democratic + counts.Republican + counts.none + counts.unconfirmed + counts.vacant).toBe(100);
    expect(senateAssumptionsFromScenario(state,elections)[election.seatId]).toBe('Democratic');
  });
});

describe('reverse Senate paths',() => {
  it('shows at least one route to 51 seats without inventing probabilities',() => {
    const result = generateSenatePaths({seats,elections,scenario:createScenarioState(),caucus:'Democratic',threshold:51,limit:3});

    expect(result.status).toBe('reached');
    expect(result.shortage).toBeGreaterThan(0);
    expect(result.paths).toHaveLength(3);
    expect(result.paths[0].addedSeatIds).toHaveLength(result.shortage);
  });

  it('respects explicit choices until the user unlocks them',() => {
    const state = createScenarioState();
    for (const election of elections) state.senate[election.seatId] = {kind:'caucus',electionId:election.electionId,caucus:'Republican'};

    const locked = generateSenatePaths({seats,elections,scenario:state,caucus:'Democratic',threshold:51});
    expect(locked.status).toBe('locked-impossible');

    state.unlockedSeatIds = elections.map(election => election.seatId);
    const unlocked = generateSenatePaths({seats,elections,scenario:state,caucus:'Democratic',threshold:51});
    expect(unlocked.status).toBe('reached');
  });

  it('distinguishes a target that this election cannot reach',() => {
    const result = generateSenatePaths({seats,elections,scenario:createScenarioState(),caucus:'Democratic',threshold:70});
    expect(result.status).toBe('election-impossible');
    expect(result.paths).toEqual([]);
  });
});
