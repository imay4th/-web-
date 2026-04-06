# ヨット 開発ロードマップ

最終更新: 2026-04-06 (13)

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

## Phase 10: 音声システム改善 + UI/ロジックバグ修正

### 10.1 スマホ版ダイス表示崩れ修正 [S] — ✅ 完了
- `.die`に`display: flex`追加（button要素内height:100%問題解決）
- `.dieGrid`を`height: 100%`→`aspect-ratio: 1`に変更（iOS Safariフォールバック）
- モバイルメディアクエリに`aspect-ratio: 1`を明示追加（640px以下・374px以下）

### 10.2 BGMデフォルトOFF [S] — ✅ 完了
- `audio-manager.ts`の`_muted`初期値を`true`に変更

### 10.3 BGMボタン全画面化 [M] — ✅ 完了
- `AudioToggleButton`コンポーネント新規作成（`position: fixed`で全画面表示）
- App.tsxにAudioToggleButton配置（全画面で利用可能）
- Game.tsxからmuteBtnとstopBgm()を削除

### 10.4 音量設定ポップアップ [M] — ✅ 完了
- `audio-manager.ts`にseVolume/bgmVolumeのgetter/setter追加
- `useAudio.ts`にvolume state追加
- `AudioPanel`コンポーネント新規作成（BGMオン/オフ + BGM音量 + SE音量スライダー）
- AudioToggleButtonクリックでパネル表示/非表示

### 10.5 役名表示ズレ修正 [S] — ✅ 完了
- scoreCard変更時に`justRolled`をfalseにリセットするuseEffect追加
- スコア記録後にHandAnnounceが再表示されるバグを修正

---

## Phase 11: UI/UXバグ修正 + 再接続基盤

### 11.1 スマホ版ルームID入力修正 [S] — ✅ 完了
- IME compositionガードを全削除（composingRef永久ブロック問題の根本修正）
- `inputMode="text"` 追加でIME抑制
- 単純な正規表現フィルタのみのシンプルな方式に変更

### 11.2 スコアカテゴリ選択フィードバック改善 [S] — ✅ 完了
- pending状態の背景を強化（opacity 0.2→0.35）+ 左ボーダー + パルスアニメーション追加
- 確定フラッシュ延長（0.6s→1.5s）、スコア出現延長（0.4s→0.8s）
- スマホ版「確定」ボタンのサイズ拡大（padding/font-size最低値確保）

### 11.3 キープダイスのゴースト表示 + 新規キープ強調 [M] — ✅ 完了
- ロールエリアを全5スロット固定化。キープ移動後もゴースト（透過+点滅）が元の位置に残る
- キープエリアの新規追加ダイスに黄色枠（ターン変更時にクリア）
- `ghostSlot` でレイアウトシフト防止、`prefers-reduced-motion` 対応

### 11.4 5番目ダイスの単独バウンス修正 [S] — ✅ 完了
- `animationDelay` の計算を `originalIndex` → `displayIndex`（ロールエリア内の表示順）に変更
- ロールエリアに残るダイス数に関わらず均等な遅延タイミングに

### 11.5 画面ロック時の再接続基盤（NPC + 対人戦） [L] — ✅ 完了
- **サーバー**: グレースピリオド（NPC:5分、対人:2分）導入。disconnect時に即座にルーム削除せずタイマーで猶予
- **サーバー**: `game:rejoin` イベント追加。socketId・scoreCardsキー・playerRoomMap を新IDに更新
- **サーバー**: `game:resume-npc` イベント追加。NPCターンの再実行トリガー
- **サーバー**: `room-manager.ts` に `rejoinRoom()` メソッド追加
- **サーバー**: `pingTimeout` を20s→60sに延長
- **クライアント**: `visibilitychange` リスナーで画面復帰を検知→自動再接続→`game:rejoin`
- **クライアント**: NPC対戦時は「再開する」オーバーレイ、対人戦は自動再接続
- **クライアント**: `game:session-expired` でロビーに自動戻し

---

## Phase 12: 最適戦略NPC（動的計画法）

### 12.1 DPソルバー設計 [M] — ✅ 完了（設計のみ）
- 後ろ向き帰納法（backward induction）による完全最適戦略を設計
- 状態空間: (カテゴリbitmask: 4096通り) × (上段小計: 64通り) = 262,144状態
- 期待値推移表 V[bitmask][upperSub] を事前計算し、ExpertStrategyに適用する方針
- 計算最適化戦略: 枝刈りではなく構造的最適化（ダイスインデックス化、スコア事前計算、ロール分布配列化）
- 詳細プラン: `.claude/plans/playful-wiggling-shell.md`

### 12.2 DPソルバー実装 [L] — ✅ 完了
- `packages/shared/src/ai/optimal-solver.ts` — DPソルバー本体（事前計算テーブル + 後ろ向き帰納法）
- `packages/shared/scripts/generate-table.ts` — テーブル生成CLIスクリプト
- `packages/shared/src/ai/optimal-table-loader.ts` — テーブル読み込み
- 計算時間: 8.2秒（構造的最適化後）、テーブルサイズ: 2MB、最適期待値: 190.01点

### 12.3 ExpertStrategy改修 + サーバー統合 [M] — ✅ 完了
- ExpertStrategy: テーブル参照型decideOptimal + ヒューリスティック型decideHeuristicの2系統化（フォールバック付き）
- createNpcStrategy: `optimalTable?: Float64Array` 第2引数追加（後方互換）
- サーバー伝播: index.ts(テーブル読み込み) → handler.ts → game-handler.ts → NpcController

### 12.4 テスト + 検証 [M] — ✅ 完了
- ソルバー単体テスト7件（ベースケース、期待値範囲、単調性、ボーナス反映）
- シリアライズテスト4件（ラウンドトリップ、サイズ、異常入力）
- Strategy統合テスト7件（テーブルあり/なし、各rollCount、カテゴリ選択）
- ビルド成功、テスト93件全パス（計算8秒 + テスト11秒）

---

## Phase 13: テーマ選択機能

### 13.1 テーマ基盤 + UI [L] — ✅ 完了
- 背景(4種) × ダイス(4種) × アクセント(4種) の3軸独立選択
- CSS変数差し替え方式（`document.documentElement.style.setProperty()`）
- theme-manager.ts シングルトン + useTheme.ts フック（AudioManager踏襲）
- ThemeButton + ThemePanel UI（AudioToggleButton/AudioPanel踏襲）
- ダイスのハードコードCSS値をCSS変数化（DiceArea.module.css, ScoreCard.module.css）
- localStorage永続化（キー: `yacht_theme`）

---

## Phase 14: 音量調節修正 + IME修正

### 14.1 音量調節機能修正 [S] — ✅ 完了
- BGM音量スライダーでauto-unmute（ミュート中でもスライダー操作で自動解除）
- SEプレビュー音追加（300msデバウンス付き、diceKeep音でフィードバック）
- 音量ラベルに現在値%表示（「BGM音量 70%」）
- スライダーtouchターゲット拡大（4px→8px）+ touch-action: pan-x

### 14.2 スマホIME二重入力修正 [S] — ✅ 完了
- compositionRefガードを復活（Phase 11.1退行バグの修正）
- onBlur安全リセット追加（永久ブロック問題対策）
- Lobby.tsx: handleCompositionStart / handleCompositionEnd / handleBlur追加

---

## Phase 15: iOS対応修正 + スコア確定ポップアップ

### 15.1 iOS BGM音量修正 [S] — ✅ 完了
- `HTMLAudioElement.volume` が iOS Safari で無視される問題を修正
- `MediaElementSourceNode` → `GainNode` → `destination` 経由で音量制御（iOS対応）
- `bgmGainNode` フィールド追加、`setBgmVolume()`・`startBgm()`・`stopBgm()` 修正

### 15.2 ルームID入力修正 [S] — ✅ 完了
- iOS で英字入力でも `compositionstart` が発火し `composingRef` が永久ブロックになる問題を修正
- composition ガードを完全削除、`onChange` の正規表現フィルタのみに

### 15.3 TurnBanner ゲーム終了後表示修正 [S] — ✅ 完了
- ゲーム終了後（ResultModal表示中）「あなたの番です」が出る問題を修正
- `Game.tsx` で `{!rankings && <TurnBanner .../>}` に変更

### 15.4 スコア確定ポップアップ [M] — ✅ 完了
- `game:scored` イベント時にプレイヤー名・役名・点数を2.5秒表示
- `ScoreAnnounce` コンポーネント新規作成（HandAnnounce パターン流用、z-index: 999）
- `useGame.ts` に `lastScoredEvent` state 追加
- `Game.tsx` に表示ロジック + useEffect 追加

---

## Phase 16: ルームID入力 iOS二重入力バグの根本修正

### 16.1 iOS二重入力バグ根本修正 [S] — ✅ 完了
- `autoCapitalize="characters"` → `autoCapitalize="off"` に変更（iOS OS側composition二重発火の根本原因除去）
- `autoCorrect="off"` / `spellCheck={false}` 追加（iOS予測変換・スペルチェックによる追加イベント防止）
- CSS `text-transform: uppercase` を削除（JS `toUpperCase()` に一元化、三重変換解消）
- compositionガードのON/OFF振り子（Phase 9.6→11.1→14.2→15.2）を脱却した根本修正

---

## Phase 17: 画像ダイステーマ基盤 + エヴァ初号機

### 17.1 画像ダイステーマ基盤 + eva01 追加 [M] — ✅ 完了
- `DiceTheme` 型に `imagePath?: string` を追加（画像テーマの判定フィールド）
- `Die.tsx` に `diceThemeId` prop 追加、`imagePath` がある場合は `<img>` 描画に分岐
- `DiceArea.tsx` で `useTheme()` → `selection.diceId` を取得し、Die 全3カ所に渡す
- `.dieImageMode` CSS で background/border/padding を透過化、キープグローは box-shadow で維持
- `ThemePanel` のプレビューも `<img>` に分岐
- `packages/client/public/dice/eva01/1.png` 〜 `6.png` を配置
- 将来の追加: `public/dice/<id>/` に配置 + `theme-presets.ts` に1エントリのみで完結

### 17.2 画像ダイスのバグ修正3件 [S] — ✅ 完了
- **テーマ切替が効かない**: ThemeManager に subscribe/notify パターン追加。`useTheme()` が全コンポーネントで同期更新されるよう修正
- **ダイスが枠より小さい**: `.dieImage` に `transform: scale(1.15)` 適用、PNG内余白を切り取り。画像モード時ダイスサイズ拡大（PC:76px、スマホ:52px、小型:44px）
- **黄色い枠**: `.die.dieImageMode.dieNewlyKept` 追加、`!important` box-shadow をアクセントグローに統一

### 17.3 追加ダイステーマ3種 [S] — ✅ 完了
- エヴァ零号機（旧劇）`eva00_blue`、エヴァ零号機（新劇）`eva00_yellow`、エヴァ弐号機 `eva02` を追加
- `packages/design/dice/` から `packages/client/public/dice/` に画像コピー＋リネーム（1.png〜6.png）
- `theme-presets.ts` に3エントリ追加（`imagePath` 方式、既存パターン踏襲）

---

## Phase 18: テストモードアクセス制限

### 18.1 テストモードボタン表示条件追加 [S] — ✅ 完了
- `Game.tsx` に `nickname` prop 追加、`nickname.toLowerCase() === 'dev'` のときのみボタン表示
- `App.tsx` から `game.nickname` を `Game` コンポーネントに渡す
- ユーザー名「Dev」「dev」以外ではテストモードボタンが完全に非表示

### 18.2 ダイステーマ名修正 + パネルレイアウト修正 [S] — ✅ 完了
- エヴァ系ダイス名を短縮: EVA01 / EVA00 / EVA00-Re / EVA02 に変更
- ThemePanel CSSのダイス名重なり修正: `white-space: nowrap` → `normal`、`flex-shrink: 0` + `word-break: break-word` + `text-align: center` で折り返し表示

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
| 2026-04-06 | Phase 10: 音声改善+バグ修正5件 | ダイスCSS修正(display:flex+aspect-ratio)、BGMデフォルトOFF、BGMボタン全画面化(AudioToggleButton)、音量設定ポップアップ(AudioPanel)、役名表示ズレ修正(scoreCard変更時justRolledリセット)。ビルド+テスト75件全パス |
| 2026-04-06 | Phase 11: UI/UXバグ修正+再接続基盤 | ルームID入力修正(composition削除)、スコア選択フィードバック改善(pending強化+アニメ延長)、ダイスゴースト表示+新規キープ黄色枠、5番目ダイス単独バウンス修正(displayIndex)、再接続基盤(グレースピリオド+rejoin+visibilitychange+resumeオーバーレイ)。ビルド+テスト75件全パス |
| 2026-04-06 | Phase 12.1: 最適戦略NPC設計 | 後ろ向き帰納法DPによる完全最適戦略を設計。状態空間262K、テーブル2MB。枝刈り不可（0点記録が最適になるケースあり）→構造的最適化（配列ベース化で22分→2分）の方針決定。詳細プラン作成済み。コード変更なし |
| 2026-04-06 | Phase 13.1: テーマ選択機能設計 | 背景×ダイス×アクセント3軸独立選択。CSS変数差し替え方式。デザイン作成ツール検討→Claude Code+ブラウザプレビューで十分と判断（AIDesigner/画像生成AIは統合コスト高）。詳細プラン作成済み。コード変更なし |
| 2026-04-06 | Phase 13.1: テーマ選択機能実装 | テーマ基盤(theme-types/presets/manager/useTheme) + UI(ThemeButton/ThemePanel) 新規8ファイル作成。DiceArea/ScoreCard/theme.cssのハードコード値をCSS変数化。main.tsxにthemeManager.init()、App.tsxにThemeButton追加。ビルド+テスト75件全パス |
| 2026-04-06 | Phase 12.2: DPソルバー実装 | optimal-solver.ts(後ろ向き帰納法DP、252ダイスインデックス+462キープタプル+疎ロール分布)、generate-table.ts(CLIスクリプト)、optimal-table-loader.ts(キャッシュ付きローダー)。計算8.2秒、テーブル2MB、最適期待値190.01点。ビルド+テスト75件全パス |
| 2026-04-06 | Phase 12.3: ExpertStrategy改修+サーバー統合 | ExpertStrategyをdecideOptimal/decideHeuristicの2系統化。createNpcStrategyにoptionalTable引数追加。サーバー: index.ts→handler.ts→game-handler.ts→NpcControllerへテーブル伝播。テーブル未生成時はヒューリスティックにフォールバック。ビルド+テスト75件全パス |
| 2026-04-06 | Phase 12.4: テスト+検証 | ソルバー単体テスト7件(基底ケース,期待値範囲,単調性,ボーナス反映)+シリアライズ4件+Strategy統合7件=18件追加。ビルド成功、テスト93件全パス |
| 2026-04-06 | Phase 14: 音量修正+IME修正 | BGM音量auto-unmute(ミュート中スライダー操作で自動解除)、SEプレビュー音(300msデバウンス)、音量ラベル%表示、スライダーtouchターゲット拡大。スマホIME二重入力修正(compositionRefガード復活+onBlur安全リセット)。ビルド+テスト93件全パス |
| 2026-04-06 | Phase 15: iOS修正3件+スコア確定ポップアップ | BGM音量GainNode化(iOS Safari対応)、ルームID入力composition完全削除(iOS永久ブロック修正)、TurnBannerゲーム終了後非表示修正、ScoreAnnounceコンポーネント新規(役名・点数・プレイヤー名2.5秒表示)。ビルド+テスト93件全パス |
| 2026-04-06 | Phase 16: ルームID入力iOS二重入力バグ根本修正 | autoCapitalize="characters"→"off"(iOS OS側composition二重発火の根本原因除去)、autoCorrect="off"+spellCheck={false}追加、CSS text-transform:uppercase削除(toUpperCase()に一元化)。Phase 9.6〜15.2の振り子を脱却。ビルド+テスト93件全パス |
| 2026-04-06 | Phase 17: 画像ダイステーマ基盤+eva01追加 | DiceTheme型にimagePath追加、Die.tsx分岐描画、DiceArea.tsxでuseTheme連携、CSS dieImageMode追加、ThemePanel画像プレビュー対応。eva01（初号機イラスト調）を追加。将来の追加は2ステップで完結。ビルド成功 |
| 2026-04-06 | Phase 17.2: 画像ダイスバグ修正3件 | テーマ切替不可→ThemeManagerにsubscribe/notifyパターン追加。ダイス小さい→scale(1.15)+サイズ拡大(76/52/44px)。黄色枠→dieImageMode.dieNewlyKeptで!important box-shadow統一。ビルド成功 |
| 2026-04-06 | Phase 17.3: 追加ダイステーマ3種 | eva00_blue(零号機旧劇)、eva00_yellow(零号機新劇)、eva02(弐号機)を追加。画像コピー+theme-presets.ts 3エントリ追加。ビルド成功 |
| 2026-04-06 | Phase 18.1: テストモードアクセス制限 | テストモードボタンをnickname「Dev」「dev」限定表示に変更。Game.tsxにnickname prop追加、App.tsxから渡す。ビルド成功 |
| 2026-04-06 | Phase 18.2: ダイステーマ名+パネル修正 | エヴァ系ダイス名をEVA01/EVA00/EVA00-Re/EVA02に短縮。ThemePanelのoptionName重なりをCSS修正（white-space:normal+flex-shrink:0+word-break）。ビルド成功 |

---

## 次のTodo

- [x] ブラウザで手動テスト（Phase 11 + NPC対戦確認 + 最適戦略NPC動作確認）
- [x] Renderにデプロイ（恒久的な公開URL）
- [x] 音量調節機能修正（auto-unmute + SEプレビュー）
- [x] スマホIME二重入力修正
- [x] iOS BGM音量修正（GainNode化）
- [x] ルームID入力iOS修正（composition完全削除）
- [x] TurnBannerゲーム終了後表示修正
- [x] スコア確定ポップアップ（ScoreAnnounce新規）
- [x] ルームID入力iOS二重入力バグ根本修正（autoCapitalize/autoCorrect/text-transform三重変換解消）
- [x] 画像ダイステーマ基盤 + エヴァ初号機（eva01）追加
- [x] 追加ダイステーマ3種（eva00_blue、eva00_yellow、eva02）
- [ ] チャット機能（将来）
- [ ] 成績・ランキング機能（将来）
- [ ] サーバー側testDiceValuesバリデーション（将来 — 現状はクライアント側UI制御のみ）

---

## 検証方法

各フェーズ完了時に:
1. ビルド成功確認（`npm run build`）
2. テスト全パス確認（`npm test`）
3. ローカルサーバー起動 → ブラウザ2つ開いて対戦フロー確認
