# ヨット 開発ロードマップ

最終更新: 2026-04-04

## ⚠️ 進捗管理ルール

**各タスク完了時に必ず以下を更新すること:**
1. タスクのステータスを ✅ に変更
2. 「進捗ログ」セクションに日付・完了内容・発見した問題を記録
3. 「次のTodo」セクションを更新
4. 新たなバグを発見した場合は REQUIREMENTS.md の「既知の問題」に追記

**セッション開始時に必ず以下を確認すること:**
1. このファイルの「進捗ログ」で前回どこまで完了したか確認
2. 「次のTodo」セクションで今回着手すべきタスクを確認
3. REQUIREMENTS.md の「既知の問題」で未修正バグを確認

---

## Phase 0: 初期セットアップ

### 0.1 プロジェクト初期化 [S] — ✅ 完了
- npm workspaces モノレポ構成（shared/server/client）
- TypeScript + ESLint + Prettier設定
- Git初期化

---

## Phase 1: 共有型定義・スコア計算

### 1.1 型定義・定数 [S] — ✅ 完了
- GameState, Player, Die, ScoreCard, Room等の型
- Socket.ioイベント型（ServerToClientEvents, ClientToServerEvents）
- ゲーム定数（MAX_PLAYERS, MIN_PLAYERS, MAX_ROLLS等）
- カテゴリ定義（12カテゴリ）

### 1.2 スコア計算ロジック [M] — ✅ 完了
- calculateScore, calculatePossibleScores, calculateTotalScore
- ユニットテスト40件全パス

---

## Phase 2: サーバー基盤

### 2.1 Express + Socket.io [M] — ✅ 完了
- Express + http + Socket.io起動（CORS対応）
- 静的ファイル配信 + SPAフォールバック
- ルームID生成（4文字、紛らわしい文字除外）
- RoomManagerクラス（インメモリ管理）
- ルーム関連Socket.ioイベントハンドラ

---

## Phase 3: ゲームエンジン

### 3.1 サーバー権威型ゲームエンジン [L] — ✅ 完了
- GameEngineクラス（初期化、ロール、キープ、スコア記録、ターン遷移、終了判定）
- サーバー権威ダイスロール（crypto.randomInt）
- ゲーム関連Socket.ioイベントハンドラ
- バリデーション（権限チェック、ターンチェック等）

---

## Phase 4: フロントエンド基盤

### 4.1 画面コンポーネント [M] — ✅ 完了
- Home（ニックネーム入力）、Lobby（ルーム作成/参加）、WaitingRoom（待機室）
- 画面遷移（状態ベース、Router不使用）
- ゲーム風テーマCSS（フェルト調背景）

### 4.2 Socket.io通信 [M] — ✅ 完了
- Socket.ioクライアント初期化（型付き）
- useSocket / useGame カスタムフック
- 全Socket.ioイベントのリスナー登録

---

## Phase 5: ゲーム画面UI

### 5.1 ゲームコンポーネント [L] — ✅ 完了
- DiceArea（ダイス表示、CSS描画、キープ切替、ロールアニメーション）
- ScoreCard（全カテゴリ表示、仮スコアプレビュー、記録機能）
- PlayerList（ターンハイライト、合計スコア）
- GameStatus（ラウンド/ターン/ロール回数表示）
- ResultModal（ランキング表示、もう一度遊ぶ/ロビーに戻る）

---

## Phase 6: 統合テスト・UX改善

### 6.1 バグ修正 [S] — ✅ 完了
- useGame.ts: callback応答パターンの修正（room:create/join）
- useGame.ts: turnPhase判定ロジック修正（MAX_ROLLS基準）
- server/index.ts: 静的ファイルパスの修正

---

## Phase 7: デプロイ

### 7.1 デプロイ準備 [M] — ✅ 完了
- render.yaml作成
- ビルドスクリプト整備
- ROADMAP.md / REQUIREMENTS.md作成

---

## 依存関係グラフ

```
Phase 0 → Phase 1 → Phase 2 + Phase 4.1（並列）
Phase 2 → Phase 3
Phase 3 + Phase 4.1 → Phase 4.2 + Phase 5（並列）
Phase 5 → Phase 6 → Phase 7
```

## 時間不足の場合の削減順序

1. チャット機能（MVP後）
2. ランキング/成績記録（MVP後）
3. ロールアニメーション — ゲームプレイに影響なし

---

## 進捗ログ

| 日付 | 完了タスク | メモ・発見した問題 |
|------|-----------|-------------------|
| 2026-04-04 | Phase 0〜7 | MVP全機能実装完了。useGame.tsのcallback応答パターンバグ、turnPhase判定バグ、静的ファイルパスバグの3件を発見・修正 |
| 2026-04-04 | ngrokオンラインテスト | ngrokトンネリングでオンライン動作確認成功 |

---

## 次のTodo

- [x] ブラウザで実際の対戦テスト（ngrokで確認済み）
- [ ] Renderにデプロイ（恒久的な公開URL）
- [ ] チャット機能（将来）
- [ ] 成績・ランキング機能（将来）

---

## 検証方法

各フェーズ完了時に:
1. ビルド成功確認（`npm run build`）
2. テスト全パス確認（`npm test`）
3. ローカルサーバー起動 → ブラウザ2つ開いて対戦フロー確認
