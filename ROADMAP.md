# ヨット 開発ロードマップ

最終更新: 2026-04-06 (2)

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

## Phase 8: UI改善 "Royal Table"

### 8.1 テーマ基盤更新 [S] — ✅ 完了
- CSS変数全面更新（ダークマホガニー背景、ゴールドアクセント）
- グラスモーフィズム（backdrop-filter）導入
- Google Fonts (Noto Sans JP) 追加
- CSS木目テクスチャ背景

### 8.2 プレゲーム画面改善 [M] — ✅ 完了
- Home: タイトルゴールドグラデーション、ダイス浮遊アニメーション、装飾ライン追加
- Lobby: 区切り線1本化、NPCボタンをセカンダリに、ボタンサイズ統一
- NpcSelect: 難易度カードに色分け左ボーダー・アイコン追加
- WaitingRoom: ルームID/アバターのゴールド化

### 8.3 ゲーム画面改善 [M] — ✅ 完了
- ダイスに立体的質感（グラデーション+多層シャドウ）
- キープ時ゴールドグロー演出
- スコアシート ヘッダー/合計行のダーク化
- PlayerList/GameStatusのダーク背景適応
- ResultModalのゴールド演出

### 8.4 アニメーション・演出強化 [M] — ✅ 完了
- 画面遷移アニメーション（pageEnter/cardEnter）
- ボタンシマー効果（hover時の光の流れ）
- TurnBanner/HandAnnounceのゴールドグラデーション化
- ダイスキープバウンスアニメーション
- prefers-reduced-motion対応

---

## Phase 9: UI/UXバグ修正

### 9.1 BGM永続再生 [S] — ✅ 完了
- useAudioフックのcleanupからstopBgm()を削除（HandAnnounce等のアンマウント時にBGM停止される問題を修正）
- Game.tsxのアンマウント時にのみBGM停止するよう変更

### 9.2 役名表示ロジック修正 [M] — ✅ 完了
- DiceAreaに渡すscoreCardを閲覧者→現在のプレイヤーのものに変更
- HandAnnounce表示のuseEffect依存にrollCountを追加（同一役の連続検出対応）
- プレイヤー別の役成立履歴を正しく管理

### 9.3 ダイスアニメーション確実化 [S] — ✅ 完了
- rollAnimKeyカウンターを導入し、各ロールでDOMを再生成
- 2投目・3投目でも確実にCSSアニメーションがリスタートされるよう修正

### 9.4 キープ選択時の不要アニメーション削除 [S] — ✅ 完了
- .dieのtransition: allをtransition: transformに限定
- キープ切替時のborder/box-shadow変更が即座に反映されるよう修正

### 9.5 PlayerList均等幅・名前全表示 [S] — ✅ 完了
- flex: 1 1 0で均等幅化、text-overflow: ellipsis削除
- フォントサイズ縮小＋折り返し表示で長い名前に対応

### 9.6 ルームID入力IME対応 [M] — ✅ 完了
- compositionイベントハンドラ追加（日本語IME入力時の文字重複・バックスペース問題修正）
- 非標準inputMode="latin"を削除、非英数字フィルタリング追加

### 9.7 参加ボタンはみ出し修正 [S] — ✅ 完了
- joinFormにwidth: 100%追加、roomIdInputにmin-width: 0追加
- joinBtnのmin-width削除、flex-shrink: 0追加

### 9.8 Phase 9 再修正（ブラウザテストで発見） [M] — ✅ 完了
- **Fix A: BGM初期化をApp.tsxに移動** — audio.init()+startBgm()をGame.tsx→App.tsxに移動。どの画面でも初回クリック/タッチでBGM開始
- **Fix B: 役成立演出の表示修復** — useAudio()が毎レンダーで新オブジェクトを返すためuseEffect依存配列のaudioが不安定→700msタイマーがクリアされる問題。audioRefパターンで解決
- **Fix C: キープ操作時の不要ダイス回転修正** — ロールエリアのdiceRowを常に2行固定化（動的追加/削除によるDOM再マウント防止）
- ビルド成功、テスト75件全パス。ブラウザ手動テスト（31パターン）未実施

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
| 2026-04-05 | Phase 8: UI改善 "Royal Table" | テーマ基盤→プレゲーム画面→ゲーム画面→アニメーションの4段階で全面改善。ビルド・テスト全パス |
| 2026-04-06 | Phase 9: UI/UXバグ修正（7件） | BGM永続再生、役名表示ロジック、ダイスアニメーション、キープアニメ削除、PlayerList均等幅、ルームID IME対応、参加ボタンはみ出し修正。Playwright視覚検証16/16パス |
| 2026-04-06 | Phase 9.8: 再修正3件 | Fix A: BGM初期化をApp.tsxに移動。Fix B: useAudio()の不安定参照によるuseEffectタイマークリア問題をaudioRefで解決。Fix C: ロールエリアdiceRow常時2行化。ビルド+テスト全パス |

---

## 次のTodo

- [x] ブラウザで実際の対戦テスト（ngrokで確認済み）
- [x] UI改善 "Royal Table"（Phase 8完了）
- [x] UI/UXバグ修正7件（Phase 9完了、Playwright検証済み）
- [x] Phase 9 再修正3件（9.8完了、ビルド+テスト全パス）
- [ ] ブラウザで再修正後の手動テスト（31パターン: BGM/演出/キープアニメ）
- [ ] 未コミット変更のコミット（Phase 8 + Phase 9 + 9.8）
- [ ] Renderにデプロイ（恒久的な公開URL）
- [ ] チャット機能（将来）
- [ ] 成績・ランキング機能（将来）

---

## 検証方法

各フェーズ完了時に:
1. ビルド成功確認（`npm run build`）
2. テスト全パス確認（`npm test`）
3. ローカルサーバー起動 → ブラウザ2つ開いて対戦フロー確認
