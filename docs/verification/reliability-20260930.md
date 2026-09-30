# 10月4日公開に向けた信頼性確認（2026-09-30）

対象main: `e77169b8403e9522a015dc1744559f092babf4d7`。独立したソースアーカイブで作業し、既存checkoutや別サイトには変更していない。

## 候補者の訂正根拠と限界

- DE: [州選挙当局の本選名簿](https://elections.delaware.gov/candidates/candidatelist/genl_fcddt_2026.html)でChris Coons（D）、Michael Katz（R）のQualifiedを9月30日に確認。原本更新表示は9月29日19:56。[公式記名候補一覧](https://elections.delaware.gov/candidates/candidatelist/genl_wcddt_2026.html)でWilliam McVay、John Shulli、Travis Jack Stevensを確認。新規2人の党派は一覧に記載がないため不明。Shulliの共和党表記は以前の公式資料を保持し、両出典を明示。
- RI: [州務長官の候補検索](https://vote.sos.ri.gov/Candidates/CandidateSearchSummary?Election=18239&OfficeType=620)でJohn Francis Reed、Raymond T McKayのOn Election Ballot: Y、およびBurbridge/MunozのNを9月30日に確認。独立候補全員の再検証は未完了。Michael Bahryは9月9日資料を保持して本選掲載再確認待ちとし、撤回とは断定しない。
- DE/RIを予備選結果待ちから本選段階へ訂正。以前の予備選候補は現在名簿から区別し、新規選択を無効化。候補者IDと保存・共有案の復元は保持。
- OH/NH: 候補者資料は9月9日時点。9月29日確認で原本を取得できず、NHは9月30日の[本選PDF](https://mm.nh.gov/files/uploads/sos/docs/2026-ge-candidate-list.pdf)も取得不可。本文で資料時点と再照合未完了を明示し、調査状態をpartialへ変更。取得できない世論調査原票は従来どおり非掲載。

## 観測時刻

9月29日の実行記録は完了00:20 UTCに対して情報源確認00:22〜00:24 UTCを記載している。元の実行ログで時刻を回復できないため、原記録の時刻を変更せず`timingIntegrity: inconsistent`と理由を本文・実行記録に追加。新しい日次観測を実施したとは扱わない。外部日次自動化の稼働状態は未確認。

## スクロールと検証

関連ニュースから州詳細への遷移で、固定議席ヘッダーが見出しを約15px覆う問題（親側Chrome、1180×757、TX→9/28ニュース→OH）に対応。遷移時に実際のsticky/fixedヘッダーの高さとtopからscroll-marginを計算する。レイアウトは変更しない。

変更前の公開版について親側クラウドChromeで8州、Ohio Brown選択・議席変化、Undo/現案reset、2案保存比較/開く、共有URL別タブ復元を確認済み。最新baseline resetは確認ダイアログcancelで未検証。変更後の実ブラウザ検証はこのローカル環境では未実施（利用可能な実ブラウザ操作ツールなし）。公開後に親側で再確認する。

変更後にスクロール計算を含む149テスト（13ファイル）とTypeScript/Vite本番ビルドが成功。ビルドの大きいJSチャンク警告は既存課題。
