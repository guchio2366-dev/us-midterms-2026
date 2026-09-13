import raw from './observation.json';
import type { ObservationDataset } from './observation-model';

// The checked-in JSON is also the scheduled editor's input. Reference and
// publication invariants are exercised by observation.test.ts before Pages builds.
export const observationData = raw as ObservationDataset;
export const observationSources = observationData.sources;
export const observationEvidenceRefs = observationData.evidenceRefs;
export const raceObservations = observationData.races.filter(r=>r.status==='published');
export const observationFor = (electionId: string) => raceObservations.find(r=>r.electionId===electionId);
