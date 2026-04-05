# Phase 9: UI/UXバグ修正 — 修正内容詳細

実施日: 2026-04-06
ステータス: 実装完了・Playwright検証済み（再修正が必要な箇所があれば本ファイルを参照して着手）

---

## Fix 1: BGM永続再生

**症状**: 役成立演出（HandAnnounce/YachtCelebration）が消えた後にBGMが止まる

**原因**: `useAudio()` フックの cleanup useEffect で `audioManager.stopBgm()` を呼んでいた。HandAnnounce（2.5秒後）やYachtCelebration（4秒後）がアンマウントされるたびに、各コンポーネント内の `useAudio()` の cleanup が発動しBGMが停止されていた。

**修正内容**:
- `packages/client/src/audio/useAudio.ts`: cleanup useEffect（旧30-35行）を削除。未使用になった `useEffect` の import も削除。
- `packages/client/src/pages/Game.tsx`: Gameコンポーネントのアンマウント時にのみBGM停止する useEffect を追加（76-81行）。

---

## Fix 2: 役名表示ロジック修正（+ Fix 6 統合）

**症状**: 同じ役が2回目以降表示されない。また、Player AがヨットをスコアしてからPlayer Bがヨットを出しても演出が出ない。

**原因（2つ）**:
1. `Game.tsx:123` で `scoreCard={gameState.scoreCards[playerId]}` と**閲覧者**のscoreCardを渡していた。Player Aの画面では常にPlayer AのscoreCardで判定するため、Player Aがスコア済みのカテゴリはPlayer Bのターンでも「スコア済み」と判定されて演出が出なかった。
2. `detectedHand` の useEffect 依存配列に `rollCount` がなく、同一内容のオブジェクトが返された場合に再発火しない可能性があった。

**修正内容**:
- `packages/client/src/pages/Game.tsx:130`: scoreCard propを現在のプレイヤーのものに変更:
  ```
  scoreCard={gameState.scoreCards[currentPlayer?.id ?? playerId]}
  ```
- `packages/client/src/components/DiceArea/DiceArea.tsx:154`: HandAnnounce表示の useEffect 依存配列に `rollCount` を追加:
  ```
  }, [detectedHand, rollCount]);
  ```

**備考**: Fix 6（役成立履歴のプレイヤー別管理）は同根の問題のためこの修正で統合解決。ヨット演出（`isYacht` 判定、109-116行）も同じ `scoreCard` prop を参照しているため自動的に修正される。

---

## Fix 3: ダイスロールアニメーション確実化

**症状**: 2投目・3投目でダイスが動くアニメーションが入らないことがある。

**原因**: ロールアニメーション中（700ms以内）に次のロールが来た場合、`rolling` state が `true` のまま変わらず、CSSアニメーションクラス `.dieRolling` が再付与されないためアニメーションがリプレイされない。

**修正内容**:
- `packages/client/src/components/DiceArea/DiceArea.tsx`:
  - `rollAnimKey` state（カウンター）を追加（39行）:
    ```
    const [rollAnimKey, setRollAnimKey] = useState(0);
    ```
  - roll effect 内で毎回インクリメント（61行）:
    ```
    setRollAnimKey(k => k + 1);
    ```
  - キープエリアの Die の key（197行）:
    ```
    key={`kept-${entry.originalIndex}-${rollAnimKey}`}
    ```
  - ロールエリアの Die の key（238行）:
    ```
    key={`${originalIndex}-${rollAnimKey}`}
    ```
  - これにより各ロールでDOMが再生成され、CSSアニメーションが確実にリスタートされる。

---

## Fix 4: キープ選択時の不要アニメーション削除

**症状**: ロールエリアからキープエリアにダイスを移す際、指定したダイスに回転のような視覚効果が出る。

**原因**: `.die` セレクタに `transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)` があり、キープ切替時の border-color, box-shadow 等のスタイル変更がすべてアニメーションされていた。

**修正内容**:
- `packages/client/src/components/DiceArea/DiceArea.module.css:95`:
  ```
  変更前: transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  変更後: transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
  ```
  hover時の `transform: translateY(-4px)` アニメーションは維持しつつ、キープ時の border/box-shadow 変更は即座に反映。

---

## Fix 5: PlayerList均等幅 + 名前全表示

**症状**: プレイヤー枠の横幅がバラバラ。長い名前が「さいきょう...」のように省略される。

**原因**: `.player` が `min-width: 64px` + `flex-shrink: 0` の固定幅。`.name` が `max-width: 72px` + `text-overflow: ellipsis` で省略表示。

**修正内容**:
- `packages/client/src/components/PlayerList/PlayerList.module.css`:
  - `.player`（19-35行）: `min-width: 64px` と `flex-shrink: 0` を削除、`flex: 1 1 0` と `min-width: 0` を追加。
  - `.name`（59-68行）:
    - `font-size: 0.6875rem` → `0.5625rem`（9px）に縮小
    - `white-space: nowrap` → `normal`
    - `text-overflow: ellipsis` 削除
    - `max-width: 72px` 削除
    - `word-break: break-all`, `line-height: 1.3`, `max-height: 2.6em` を追加（2行まで表示）

---

## Fix 6: 役成立履歴のプレイヤー別管理

Fix 2 に統合。scoreCard を現在のプレイヤーのものに変更することで解決。詳細は Fix 2 を参照。

---

## Fix 7: ルームID入力のIME対応

**症状**: スマホで日本語キーボードからルームIDを入力すると、バックスペースが効かない・同じ文字が2-3文字入力される。コピペや英語キーボードでは正常。

**原因**:
1. `inputMode="latin"` は非標準値（正式な値は none/text/decimal/numeric/tel/search/email/url）。ブラウザによって予測不能な挙動。
2. compositionイベント未対応。日本語IME変換中にも onChange が発火し、`toUpperCase()` が変換中の文字に作用して不具合が発生。

**修正内容**:
- `packages/client/src/pages/Lobby.tsx`:
  - `useRef` を import に追加（1行）
  - `composingRef` を追加（14行）:
    ```typescript
    const composingRef = useRef(false);
    ```
  - `handleRoomIdChange` を追加（16-20行）: composing中は state 更新をスキップ、非英数字をフィルタリング
  - `handleCompositionStart` / `handleCompositionEnd` を追加（22-30行）
  - input要素（67-78行）: `onChange` をハンドラに変更、`onCompositionStart`/`onCompositionEnd` 追加、`inputMode="latin"` を削除

---

## Fix 8: 参加ボタンのはみ出し修正

**症状**: 「ルームに参加」の「参加」ボタンがカード枠の右側にはみ出す。

**原因**: `.joinForm` に `width: 100%` がなく、`.roomIdInput` の `flex: 1` と `.joinBtn` の `min-width: 72px` + padding がカード幅を超過する場合があった。

**修正内容**:
- `packages/client/src/pages/Lobby.module.css`:
  - `.joinForm`（148-152行）: `width: 100%` を追加
  - `.roomIdInput`（154-172行）: `min-width: 0` を追加
  - `.joinBtn`（188-204行）: `min-width: 72px` を削除、`flex-shrink: 0` を追加

---

## 変更ファイル一覧

| ファイル | 修正Fix |
|---------|---------|
| `packages/client/src/audio/useAudio.ts` | Fix 1 |
| `packages/client/src/pages/Game.tsx` | Fix 1, Fix 2/6 |
| `packages/client/src/components/DiceArea/DiceArea.tsx` | Fix 2, Fix 3 |
| `packages/client/src/components/DiceArea/DiceArea.module.css` | Fix 4 |
| `packages/client/src/components/PlayerList/PlayerList.module.css` | Fix 5 |
| `packages/client/src/pages/Lobby.tsx` | Fix 7 |
| `packages/client/src/pages/Lobby.module.css` | Fix 8 |

## 検証結果

- ビルド: `npm run build` 成功
- テスト: `npm test` 75件全パス
- Playwright視覚検証: 16/16 通過
  - Lobby: 参加ボタンがカード内に収まっている、inputMode="latin"削除済み、英数字入力正常
  - PlayerList: 均等幅（差0.0px）、text-overflow: ellipsis削除済み
  - ダイスアニメーション: 1投目5個・2投目4個・3投目4個の全てで dieRolling クラス付与確認
  - transition-property: transform のみ（all なし）
  - HandAnnounce: 同じフルハウスが1投目・2投目とも表示される
