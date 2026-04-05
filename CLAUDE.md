# ヨット - プロジェクトガイド

## 開発ワークフロー
- 開発開始・再開: `/dev` で前回の続きから再開
- プロジェクト管理: ROADMAP.md / REQUIREMENTS.md で進捗を追跡

## コマンド

| コマンド | 説明 |
|---------|------|
| `npm run build` | 全パッケージビルド（shared→client→server） |
| `npm run dev:server` | サーバー開発モード（tsx watch） |
| `npm run dev:client` | クライアント開発モード（Vite HMR） |
| `npm test` | sharedパッケージのユニットテスト |
| `npm run lint` | ESLintチェック |

## アーキテクチャ
- npm workspaces モノレポ（shared / server / client）
- サーバー権威型: ゲームロジックはすべてサーバー側（GameEngine）
- リアルタイム通信: Socket.io（型付き）
- 画面遷移: React状態ベース（Router不使用）
- スタイリング: CSS Modules + CSS変数

## 本番起動
```bash
npm run build && node packages/server/dist/index.js
```

## オンラインテスト（ngrok）

1. ターミナル1でサーバー起動:
```bash
npm run build && node packages/server/dist/index.js
```

2. ターミナル2（別ウィンドウ）でngrok起動:
```bash
ngrok http 3000
```

3. 表示された `https://xxxx-xxx-xxx.ngrok-free.app` のURLをブラウザやスマホで開く。URLを共有すればオンライン対戦可能。
