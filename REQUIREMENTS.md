# ヨット 要件定義書

最終更新: 2026-04-06

## 1. プロダクト概要

「ヨット」（Yahtzee系ダイスゲーム）をオンラインで友人と対戦できるWebアプリケーション。スマホ中心のモバイルファーストUI。

## 2. ターゲットユーザー

- **主要ターゲット**: 自分と友人（プライベート利用）
- **デバイス**: スマートフォン（モバイルファースト）、PC対応
- **言語**: 日本語

## 3. 技術スタック

| 技術 | バージョン | 役割 |
|------|-----------|------|
| React | 18.3 | フロントエンドUI |
| TypeScript | 5.7 | 型安全 |
| Vite | 6.x | フロントエンドビルド |
| Node.js | 22.x | バックエンドランタイム |
| Express | 4.21 | HTTPサーバー |
| Socket.io | 4.8 | リアルタイム通信 |
| CSS Modules | - | スコープ付きスタイリング |
| Vitest | 3.x | ユニットテスト |
| npm workspaces | - | モノレポ管理 |

## 4. 実装済みの機能一覧

### 4.1 ルーム管理
- [x] ルーム作成（4文字英数字ID、自動生成）
- [x] ルーム参加（ID入力）
- [x] ルーム退出
- [x] 満員チェック（最大6人）
- [x] ホスト自動引き継ぎ

### 4.2 ゲームプレイ
- [x] ダイスロール（最大3回/ターン）
- [x] ダイスキープ/リリース
- [x] 12カテゴリへのスコア記録
- [x] 仮スコアプレビュー表示
- [x] ターン自動進行
- [x] ゲーム終了判定
- [x] ランキング表示

### 4.3 UI/UX
- [x] ニックネーム入力（ローカルストレージ保存）
- [x] ルームIDコピー機能
- [x] ゲーム風テーマ（フェルト調背景）
- [x] ダイスCSS描画（ドットパターン）
- [x] ロールアニメーション
- [x] キープ中ダイスのゴールド枠ハイライト
- [x] モバイルファーストレイアウト
- [x] BGMオン/オフ切替（全画面対応）
- [x] BGM・SE音量設定ポップアップ
- [x] モバイルダイス表示最適化（aspect-ratio対応）

### 4.4 通信
- [x] Socket.ioリアルタイム通信
- [x] サーバー権威型ゲームロジック
- [x] 自動再接続設定
- [x] プレイヤー切断検出

## 5. 既知の問題・バグ

| ID | 内容 | 重要度 | ステータス |
|----|------|--------|-----------|
| — | 現在既知の問題なし | — | — |

## 6. MVP後に追加予定の機能

### 6.1 高優先度（次期対応）
- [ ] ゲーム内チャット機能
- [ ] 成績・ランキング記録（永続化）

### 6.2 中優先度
- [ ] 再接続時のゲーム状態復元
- [ ] 不在プレイヤーのターンタイムアウト
- [ ] サウンドエフェクト
- [ ] ダイスロール振動フィードバック

### 6.3 低優先度（将来）
- [ ] AI対戦モード
- [ ] 複数ルーム一覧表示
- [ ] 戦績統計ダッシュボード

## 7. ファイル構成（主要ファイル）

```
packages/
├── shared/src/
│   ├── types/          # game.ts, room.ts, socket-events.ts
│   ├── constants/      # game.ts, categories.ts
│   └── scoring/        # calculator.ts + テスト
├── server/src/
│   ├── index.ts        # Express + Socket.io起動
│   ├── game/           # engine.ts, dice.ts, room-manager.ts
│   ├── socket/         # handler.ts, room-handler.ts, game-handler.ts
│   └── utils/          # id-generator.ts
└── client/src/
    ├── App.tsx          # 画面遷移管理
    ├── socket.ts        # Socket.ioクライアント
    ├── hooks/           # useSocket.ts, useGame.ts
    ├── pages/           # Home, Lobby, WaitingRoom, Game
    └── components/      # DiceArea, ScoreCard, PlayerList, GameStatus, ResultModal
```
