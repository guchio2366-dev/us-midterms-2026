import { senateRaceDetails } from './senate-races';

export type RatingOrganization = 'sabato'|'inside';

export interface RatingSnapshotObservation {
  seatId: string;
  organizationId: RatingOrganization;
  organizationLabel: string;
  ratingRaw: string;
  currentConfirmedAt: string;
  sourceId: string;
}

const insideRatings: Record<string,string> = {
  'AK-2':'Toss-up','KS-2':'Likely R','OH-3':'Toss-up','NH-2':'Toss-up','NC-2':'Lean D',
  'GA-2':'Lean D','TX-2':'Tilt R','IA-2':'Tilt R','SC-2':'Likely R','MT-2':'Solid R',
  'OK-2':'Solid R','NE-2':'Lean R','WY-2':'Solid R','MN-2':'Lean D','ME-2':'Toss-up',
  'MI-2':'Tilt D','AL-2':'Solid R','IL-2':'Solid D','KY-2':'Solid R','FL-3':'Solid R',
  'DE-2':'Solid D','AR-2':'Solid R','CO-2':'Solid D','ID-2':'Solid R','LA-2':'Solid R',
  'MA-2':'Solid D','MS-2':'Solid R','NJ-2':'Solid D','NM-2':'Solid D','OR-2':'Solid D',
  'RI-2':'Solid D','SD-2':'Solid R','TN-2':'Solid R','VA-2':'Solid D','WV-2':'Solid R',
};

export const RATING_SNAPSHOT_ID = 'senate-ratings-2026-10-01-strong-agreement-v2';
export const RATING_SNAPSHOT_AS_OF = '2026-10-01';
export const RATING_METHOD_VERSION = 'unanimous-likely-or-stronger-v2';

export const ratingSnapshotObservations: RatingSnapshotObservation[] = [
  ...senateRaceDetails.map(race => ({
    seatId: race.seatId,
    organizationId: 'sabato' as const,
    organizationLabel: "Sabato's Crystal Ball",
    ratingRaw: race.ratingRaw,
    currentConfirmedAt: '2026-09-24',
    sourceId: 'sabato-senate-2026',
  })),
  ...Object.entries(insideRatings).map(([seatId,ratingRaw]) => ({
    seatId,
    organizationId: 'inside' as const,
    organizationLabel: 'Inside Elections',
    ratingRaw,
    currentConfirmedAt: '2026-10-01',
    sourceId: 'inside-senate-ratings-2026',
  })),
];
