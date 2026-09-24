import type { Source } from './model';
import type { EvidenceRef } from './research-model';

/** One historical survey, two ballot questions; these are not independent polls. */
export const texasPollContext = {
  electionId: '2026-TX-2-regular',
  checkedAt: '2026-09-24',
  fieldStart: '2024-10-18',
  fieldEnd: '2024-10-21',
  sampleSize: 815,
  president: { label: '大統領選', pollR: 53, pollD: 46, votesR: 6393597, votesD: 4835250, totalValidVotes: 11388674 },
  senate: { label: '上院選', pollR: 48, pollD: 47, votesR: 5990741, votesD: 5031249, totalValidVotes: 11291854 },
};

export const texasPollContextSources: Source[] = [
  {
    sourceId: 'poll-emerson-tx-october-2024-context',
    title: 'October 2024 Texas Poll: Trump 53%, Harris 46%',
    publisher: 'Emerson College Polling',
    url: 'https://emersoncollegepolling.com/october-2024-texas-poll-trump-53-harris-46/',
    publishedAt: null,
    referencePeriod: '2024-10-18〜10-21、投票予定者815人。同一調査の大統領選・上院選',
    retrievedAt: texasPollContext.checkedAt,
    contentVerifiedAt: texasPollContext.checkedAt,
  },
  {
    sourceId: 'tx-sos-2024-results-ucsb-context',
    title: '2024 General Election — Texas official results (UCSB archive)',
    publisher: 'Texas Secretary of State（UCSB保存資料）',
    url: 'https://www.presidency.ucsb.edu/sites/default/files/election-maps/2024/2024_tx.pdf',
    publishedAt: null,
    referencePeriod: '2024-11-05総選挙、2024-11-26更新の州公式結果画面を保存したPDF',
    retrievedAt: texasPollContext.checkedAt,
    contentVerifiedAt: texasPollContext.checkedAt,
  },
];

export const texasPollContextEvidence: EvidenceRef[] = [
  { evidenceId: 'ev-tx-2024-poll-context', sourceId: texasPollContextSources[0].sourceId,
    locator: '大統領Trump53／Harris46、上院Cruz48／Allred47。10/18〜21、LV815、MMS・固定電話IVR・CINTオンラインパネル。',
    checkedAt: texasPollContext.checkedAt, kind: 'observed' },
  { evidenceId: 'ev-tx-2024-results-context', sourceId: texasPollContextSources[1].sourceId,
    locator: 'PDF 2ページ：大統領R6,393,597／D4,835,250／全有効票11,388,674。上院R5,990,741／D5,031,249／全有効票11,291,854。候補間差は各選挙の全有効票で算出。',
    checkedAt: texasPollContext.checkedAt, kind: 'observed' },
];
