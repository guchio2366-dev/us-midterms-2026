import type { Candidate, Election } from './data/model';

/** Keep old IDs available for saved assumptions, outside the current roster. */
export function isArchivedCandidate(candidate: Candidate, election: Election): boolean {
  return election.contestStatus === 'general-ballot' && candidate.ballotStage === 'primary-ballot';
}

export const candidateRosterNotes: Readonly<Record<string,string>> = {
  'GA-2':'主要2党の候補者を公式予備選結果で照合しました。一般選挙の全掲載候補の照合は未完了です。9月30日に州公式資格ページで確認した情報によるとAllen BuckleyはDISQUALIFIEDのため、投票用紙候補には追加していません。予備選の得票を本選支持率と扱いません。',
  'KS-2':'9月30日にSedgwick郡の2026年General一覧でHamilton・Marshallを照合しました。郡一覧の主要2候補と州全体の完全名簿は区別します。David Grahamは党候補ページに掲載がありますが州本選の認証資格は未確認のため、投票用紙候補として追加していません。',
  'DE-2': '2026年9月30日に州選挙当局の本選名簿でCoons・Katzの掲載、別の公式一覧で記名投票候補3人を確認しました。名簿の更新日は9月29日です。以前の予備選候補は履歴として区別しています。',
  'RI-2': '2026年9月30日に州務長官の候補者表でReed・McKayの本選掲載（On Election Ballot: Y）を確認しました。独立候補Michael Bahryは9月9日時点の資料を保持し、今回の本選掲載は再確認待ちです。未確認は立候補の撤回を意味しません。',
  'OH-3': '2026年9月30日に州務長官の8月25日付Directive 2026-45と公式サンプル投票用紙で印刷候補4人を確認しました。同指令4ページとCuyahoga郡選挙管理委員会の9月17日付一覧でも記名投票候補3人を確認しました。記名候補3人の党派は記載がないため未確認です。確認は各資料の記載時点を対象とし、その後の変更を保証するものではありません。9月29日の観測記録は当時の取得不能を示す履歴です。',
  'NH-2': '候補者資料は2026年9月9日時点です。9月29日の定点観測に続き、9月30日も州務長官の本選名簿PDFを取得できず、全候補・党籍・掲載資格の最新の再照合は未完了です。',
};

export function candidateStageLabel(candidate: Candidate, election: Election): string {
  if (isArchivedCandidate(candidate,election)) return '以前の予備選資料・現在の本選名簿には掲載なし';
  if (candidate.status === 'unconfirmed') return '本選掲載の再確認待ち';
  return candidate.ballotStage === 'write-in' ? '記名投票候補'
    : candidate.ballotStage === 'primary-ballot' ? '予備選段階' : '';
}
