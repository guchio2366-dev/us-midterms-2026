# 2026年米国中間選挙 — 中間選挙で変わる権力

[公開サイト](https://guchio2366-dev.github.io/us-midterms-2026/)は、仕組みと多数派への条件から注目州・候補者を読み、見通しを考える静的Webアプリである。TypeScript・Vite・D3・TopoJSONを使用する。

**新しい担当は [CURRENT_STATE.md](CURRENT_STATE.md) を最初に読む。** 現在の実装、確認したコミット、公開結果、未完了事項、設計書の対応表をそこへ集約する。本書は構成と開発方法を案内する。
[Notion：開発・運用の引継ぎ](https://app.notion.com/p/3da340138e7381549fe6c596bc794a62?pvs=204)

## 画面と機能

| 領域 | 役割 |
| --- | --- |
| 冒頭 | このサイトの目的と4段階の読む順序を知る |
| 01 中間選挙の仕組み | 改選範囲・上下院の役割と、政権評価・候補者選び・推薦の違いを読む |
| 02 議会の議席配分 | 全国50州の地図を直接操作し、現在の構成と多数派への条件を完全な説明とともに確認する。当落の仮定・保存比較共有は任意で開く |
| 03 注目州の情勢と候補者 | 注目州の調査・候補者・予定を読み、続いて全国50州の地図と州の説明、主な論点を読む。政策比較の詳細を文脈内で開く |
| 04 今後の見通し | 現在の材料から言えることと不確実性、次に確認する情報をまとめる |

PCは左の固定目次、狭い画面は上部の目次で移動する。説明を読むだけでは保存案や議席の仮定を変更しない。旧セクションhashとニュース・州・共有URLの入口も維持する。[本文・地図の保持と検証](docs/verification/restore-approved-reading-20261006.md)。

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
