import type {
  GameState,
  Player,
  Category,
  ScoreCard,
  Die,
  RankingEntry,
} from '@yacht/shared';
import {
  MAX_ROLLS,
  TOTAL_CATEGORIES,
  DICE_COUNT,
  calculateScore,
  calculateTotalScore,
} from '@yacht/shared';
import { createInitialDice, rollDice } from './dice.js';

/** 全カテゴリを列挙（空ScoreCard生成用） */
const ALL_CATEGORIES: Category[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
  'fullHouse',
  'fourOfAKind',
  'littleStraight',
  'bigStraight',
  'choice',
  'yacht',
];

/**
 * Fisher-Yates シャッフル（配列のコピーを返す）
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 空のスコアカードを生成する
 */
function createEmptyScoreCard(): ScoreCard {
  const scoreCard = {} as ScoreCard;
  for (const category of ALL_CATEGORIES) {
    scoreCard[category] = null;
  }
  return scoreCard;
}

/**
 * サーバー権威型のゲームエンジン
 * すべてのゲームロジックをサーバー側で管理する
 */
export class GameEngine {
  private state: GameState;

  constructor(roomId: string, players: Player[]) {
    // プレイヤー順をシャッフル
    const shuffledPlayers = shuffle(players);

    // 各プレイヤーのスコアカードを初期化
    const scoreCards: Record<string, ScoreCard> = {};
    for (const player of shuffledPlayers) {
      scoreCards[player.id] = createEmptyScoreCard();
    }

    // 初期ダイス（まだ振ってない状態: value=1, kept=false）
    const initialDice: Die[] = Array.from({ length: DICE_COUNT }, () => ({
      value: 1,
      kept: false,
    }));

    this.state = {
      roomId,
      phase: 'PLAYING',
      players: shuffledPlayers,
      currentPlayerIndex: 0,
      turnPhase: 'ROLLING',
      rollCount: 0,
      dice: initialDice,
      scoreCards,
      round: 1,
      totalRounds: TOTAL_CATEGORIES,
    };
  }

  /**
   * 現在のゲーム状態を返す（読み取り専用のコピーではなく参照を返す）
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * ダイスを振る
   * @returns 振った結果のダイス配列
   */
  roll(playerId: string, fixedValues?: number[]): Die[] {
    // バリデーション
    if (this.state.phase !== 'PLAYING') {
      throw 'ゲームが進行中ではありません。';
    }

    if (this.getCurrentPlayerId() !== playerId) {
      throw 'あなたのターンではありません。';
    }

    if (this.state.rollCount >= MAX_ROLLS) {
      throw 'これ以上振ることはできません。';
    }

    // 最初のロール時は全ダイスをリセット
    if (this.state.rollCount === 0) {
      this.state.dice = this.state.dice.map((die) => ({
        ...die,
        kept: false,
      }));
    }

    // ロールカウントをインクリメント
    this.state.rollCount++;

    // ダイスを振る
    this.state.dice = rollDice(this.state.dice, fixedValues);

    // 最大ロール数に達したらスコアリングフェーズに移行
    if (this.state.rollCount >= MAX_ROLLS) {
      this.state.turnPhase = 'SCORING';
    } else {
      this.state.turnPhase = 'ROLLING';
    }

    return this.state.dice;
  }

  /**
   * ダイスのキープ状態をトグルする
   */
  toggleKeep(playerId: string, dieIndex: number): void {
    // バリデーション
    if (this.state.phase !== 'PLAYING') {
      throw 'ゲームが進行中ではありません。';
    }

    if (this.getCurrentPlayerId() !== playerId) {
      throw 'あなたのターンではありません。';
    }

    if (this.state.rollCount < 1) {
      throw '最低1回はダイスを振ってからキープしてください。';
    }

    if (dieIndex < 0 || dieIndex >= DICE_COUNT) {
      throw `ダイスのインデックスは0~${DICE_COUNT - 1}の範囲で指定してください。`;
    }

    // トグル
    this.state.dice[dieIndex].kept = !this.state.dice[dieIndex].kept;
  }

  /**
   * スコアを記録してターンを進める
   * @returns 記録されたスコア
   */
  score(playerId: string, category: Category): number {
    // バリデーション
    if (this.state.phase !== 'PLAYING') {
      throw 'ゲームが進行中ではありません。';
    }

    if (this.getCurrentPlayerId() !== playerId) {
      throw 'あなたのターンではありません。';
    }

    if (this.state.rollCount < 1) {
      throw '最低1回はダイスを振ってからスコアを記録してください。';
    }

    const scoreCard = this.state.scoreCards[playerId];
    if (scoreCard[category] !== null) {
      throw 'そのカテゴリは既に記録されています。';
    }

    // スコア計算
    const diceValues = this.state.dice.map((d) => d.value);
    const calculatedScore = calculateScore(diceValues, category);

    // スコアカードに記録
    scoreCard[category] = calculatedScore;

    // 次のターンに遷移
    this.nextTurn();

    return calculatedScore;
  }

  /**
   * 次のターンに遷移する
   */
  private nextTurn(): void {
    // ダイスをリセット
    this.state.dice = Array.from({ length: DICE_COUNT }, () => ({
      value: 1,
      kept: false,
    }));

    // ロールカウントをリセット
    this.state.rollCount = 0;

    // ターンフェーズをリセット
    this.state.turnPhase = 'ROLLING';

    // 次のプレイヤーへ
    const nextIndex = this.state.currentPlayerIndex + 1;

    if (nextIndex >= this.state.players.length) {
      // 全員が1巡した
      this.state.currentPlayerIndex = 0;
      this.state.round++;

      // 全ラウンド終了チェック
      if (this.state.round > this.state.totalRounds) {
        this.state.phase = 'FINISHED';
      }
    } else {
      this.state.currentPlayerIndex = nextIndex;
    }
  }

  /**
   * ゲームが終了しているかどうか
   */
  isFinished(): boolean {
    return this.state.phase === 'FINISHED';
  }

  /**
   * ランキングを計算する
   */
  getRankings(): RankingEntry[] {
    // 各プレイヤーの合計スコアを算出
    const entries: RankingEntry[] = this.state.players.map((player) => ({
      playerId: player.id,
      nickname: player.nickname,
      totalScore: calculateTotalScore(this.state.scoreCards[player.id]),
      rank: 0, // 後で設定
    }));

    // スコア降順でソート
    entries.sort((a, b) => b.totalScore - a.totalScore);

    // 順位を付ける（同点は同順位）
    let currentRank = 1;
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].totalScore < entries[i - 1].totalScore) {
        currentRank = i + 1;
      }
      entries[i].rank = currentRank;
    }

    return entries;
  }

  /**
   * 現在のターンのプレイヤーIDを返す
   */
  getCurrentPlayerId(): string {
    return this.state.players[this.state.currentPlayerIndex].id;
  }
}
