# 2026年米国中間選挙 — 中間選挙で変わる権力

[公開サイト](https://guchio2366-dev.github.io/us-midterms-2026/)は、争点・候補者の判断材料から議席配分を仮定し、議会権限への影響まで確認する静的Webアプリである。TypeScript・Vite・D3・TopoJSONを使用する。

**新しい担当は [CURRENT_STATE.md](CURRENT_STATE.md) を最初に読む。** 現在の実装、確認したコミット、公開結果、未完了事項、設計書の対応表をそこへ集約する。本書は構成と開発方法を案内する。
[Notion：開発・運用の引継ぎ](https://app.notion.com/p/3da340138e7381549fe6c596bc794a62?pvs=204)

## 画面と機能

| 領域 | 役割 |
| --- | --- |
| 冒頭 | 選挙日、改選範囲、現在の議席、主な論点と制度を理解する |
| 概説・全国情勢 | PCでは左に現在議席の表と論点、右に上院の暫定配分と51議席への配分例を表示する。狭い画面では縦に並ぶ |
| 直近の更新 | 未配分の接戦州と追加の注目州を切り替え、機関別の評価割合・欄内の解説・小さな位置図と、州に連動するニュース・今後の予定を読む。全国ニュースへも切替可能 |
| ニュース・今後の予定 | 最近の記事・分析更新と、次の予定をタブで切り替える。関連州・論点・根拠を読む |
| 地図・州詳細 | 上院の州地図、下院の選挙区、地域背景、候補者、調査・評価・接戦州の判断材料を読む |
| 議席シミュレーション | 統合評価の暫定配分から候補者・会派を選び、未配分も残せる。保存・比較・共有に対応 |
| 議席と権限 | 必要票を確認し、上院の複数経路を提示する。経路は条件を満たす配分例で、当選確率ではない |

上院の地図と暫定配分は、SabatoとInside Electionsの評価方向を共通の集計処理で扱う。候補者の公約、世論調査、編集上の解釈、利用者の仮定を、外部評価や確定結果と混同しない。資料の日付と収録範囲は項目ごとに確認する。

## 開発・検証・公開

```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

`npm run build` はTypeScript検査と本番ビルドを行う。テストはデータ・参照整合性・純粋ロジックが中心で、件数は実行結果を正とする。ブラウザE2Eや実機確認を自動テストの成功から推定しない。

[Pages workflow](.github/workflows/deploy-pages.yml)はmain更新時に依存関係の導入、テスト、ビルド、配備を行う。`vite.config.ts` のbaseは `/us-midterms-2026/`。配備対象はworkflowが生成した `dist/` であり、同梱distの時刻だけで公開状態を判断しない。公開内容を変更した場合は対象コミットのActionsと公開内容を確認する。

## データ・コードの参照先

| 用途 | ファイル |
| --- | --- |
| 上院議席・候補者・州背景・出典 | [data.ts](src/data/data.ts)、[senate-races.ts](src/data/senate-races.ts)、[state-context.ts](src/data/state-context.ts) |
| 下院の選挙区・情勢 | [house.ts](src/data/house.ts)、[地図データ](public/data/) |
| 統合評価・基準スナップショット | [rating-snapshot.ts](src/data/rating-snapshot.ts)、[rating-consensus.ts](src/rating-consensus.ts)、[baseline.ts](src/scenario/baseline.ts) |
| 調査・候補者解説・8論点 | [research.ts](src/data/research.ts)、[research-focus.ts](src/data/research-focus.ts)、[research-model.ts](src/data/research-model.ts) |
| 記事と公開フィード | [news.ts](src/data/news.ts)、[news-feed.ts](src/news-feed.ts) |
| 接戦州比較・予定・確認記録 | [observation.json](src/data/observation.json)、[observation-model.ts](src/data/observation-model.ts)、[observation-logic.ts](src/observation-logic.ts) |
| 議会権限・仮定・保存・経路 | [civics.ts](src/data/civics.ts)、[scenario/](src/scenario/) |
| 画面と表示部品 | [main.ts](src/main.ts)、[style.css](src/style.css)、[ui/](src/ui/) |

研究第一波の6州と、後から追加した接戦州観測の6州は対象が異なる。対応と収録件数は [現在の状態](CURRENT_STATE.md) を参照する。

## 調査データの更新

1. 原文を確認し、Sourceに資料の発行者、URL、公開日、対象期間、取得日、内容確認日を記録する。
2. EvidenceRefに表・設問・段落などの根拠箇所を残し、事実・当事者の主張・解釈を分ける。
3. 既存のelectionId・candidateIdを保ち、関連する調査・候補者・ニュースの参照を検証する。同一調査の集計段階はstudyIdで束ね、RV/LVや順位選択投票の段階を混ぜない。
4. 照合と検証を経てpublishedにする。draft・reviewedを公開扱いにしない。ニュースと分析更新の重複は明示的なnewsIdで接続し、似た見出しだけで統合しない。
5. 日次確認・予定結果・失敗の記録と公開手順は [定点観測の更新手順](docs/observation/README.md) に従う。

確認だけで分析更新日を進めない。記事の変更で保存された議席基準や利用者の仮定を上書きしない。異なる調査の差をそのまま支持移動や勝率と扱わない。

## 文書の使い分け

- [CURRENT_STATE.md](CURRENT_STATE.md)：現状・未完了事項・確認したコードと配備・設計書への入口。
- [定点観測の更新手順](docs/observation/README.md)：現在の調査運用。日次の結果は [runs/](docs/observation/runs/)。
- [RESEARCH_AND_METHOD.md](RESEARCH_AND_METHOD.md)：研究第一波の方式と当時の収録記録。後続変更は冒頭の案内から確認。
- [CURRENT_STATE_20260909.md](CURRENT_STATE_20260909.md)、[TASK_01_RESULT.md](TASK_01_RESULT.md)、[DATA_VERIFICATION.md](DATA_VERIFICATION.md)：過去の監査・工程完了記録。
- [AGENTS.md](AGENTS.md)：担当者が現状を確認し、変更時に引継ぎを更新するための規則。

文書の最終更新日だけで情報の正しさを判断せず、対象コミット・調査実行・出典の対象時点を照合する。
