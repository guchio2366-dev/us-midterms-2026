import type { Source } from './model';
import type { EvidenceRef, PublicationStatus } from './research-model';

export interface ObservationSource extends Source {
  electionIds: string[];
  category: 'official' | 'candidate' | 'poll' | 'rating' | 'reporting' | 'calendar';
  cadence: 'daily' | 'weekly';
  method: string;
  alternativeUrl: string | null;
  checkStatus: 'checked' | 'unavailable' | 'not-checked';
  lastSuccessAt: string | null;
}
export interface ObservationMaterial {
  materialId: string;
  title: string;
  fact: string;
  meaning: string;
  limit: string;
  evidenceIds: string[];
}
export interface ComparisonCell {
  candidateId: string;
  kind: 'observed' | 'claim' | 'interpretation' | 'pending';
  text: string;
  evidenceIds: string[];
}
export interface RaceObservation {
  electionId: string;
  status: PublicationStatus;
  updatedAt: string;
  headline: string;
  featuredSummary: string;
  lead: string;
  uncertainty: string;
  evidenceIds: string[];
  materials: ObservationMaterial[];
  comparison: { key: string; label: string; cells: ComparisonCell[] }[];
  watchItems: { watchId: string; title: string; what: string; how: string }[];
}
export interface ObservationEvent {
  eventId: string;
  title: string;
  publicationStatus: PublicationStatus;
  date: string | null;
  time: string | null;
  timezone: string;
  // A date passing never changes the recorded status to completed.
  status: 'scheduled' | 'postponed' | 'cancelled' | 'completed';
  dateHistory: { date: string; reason: string; evidenceIds: string[] }[];
  checkedAt: string;
  evidenceIds: string[];
  relevance: { electionId: string; why: string; watch: string; materialIds: string[] }[];
  resultUpdateId: string | null;
}
export interface ObservationUpdate {
  editorialType?: 'event' | 'analysis';
  publishedAt?: string;
  updateId: string;
  status: PublicationStatus;
  electionIds: string[];
  eventId: string | null;
  newsId: string | null;
  eventDate: string;
  updatedAt: string;
  title: string;
  happened: string;
  meaning: string;
  uncertainty: string;
  evidenceIds: string[];
}
export interface ObservationRun {
  runId: string;
  startedAt: string;
  completedAt: string | null;
  outcome: 'changed' | 'unchanged' | 'partial' | 'failed' | 'reviewing';
  checkedSourceIds: string[];
  pendingSourceIds: string[];
  note: string;
}
export interface ObservationDataset {
  schemaVersion: number;
  revision: string;
  monitor: {
    state: 'not-connected' | 'scheduled';
    timezone: string;
    dailyAt: string;
    weeklyReview: string;
    scheduledAt: string | null;
    firstScheduledFor: string | null;
    lastCompletedAt: string | null;
    latestRun: ObservationRun;
  };
  sources: ObservationSource[];
  evidenceRefs: EvidenceRef[];
  races: RaceObservation[];
  events: ObservationEvent[];
  updates: ObservationUpdate[];
}
