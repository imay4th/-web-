import type { GameState, NpcDifficulty } from '@yacht/shared';
import { createNpcStrategy } from '@yacht/shared';
import type { NpcStrategy } from '@yacht/shared';
import type { GameEngine } from './engine.js';

export class NpcController {
  private strategy: NpcStrategy;
  private difficulty: NpcDifficulty;

  constructor(difficulty: NpcDifficulty) {
    this.difficulty = difficulty;
    this.strategy = createNpcStrategy(difficulty);
  }

  getDifficulty(): NpcDifficulty {
    return this.difficulty;
  }

  /**
   * NPCのターンを自動実行
   * 適度な遅延を入れて人間らしく見せる
   */
  async executeTurn(
    engine: GameEngine,
    npcPlayerId: string,
    onStateUpdate: (state: GameState) => void,
  ): Promise<void> {
    let rollCount = 0;

    // 最初のロール
    await this.delay(800, 1500);
    engine.roll(npcPlayerId);
    rollCount = 1;
    onStateUpdate(engine.getState());

    // ロール2, 3
    while (rollCount < 3) {
      const state = engine.getState();
      const diceValues = state.dice.map((d) => d.value);
      const scoreCard = state.scoreCards[npcPlayerId];

      const decision = this.strategy.decide(diceValues, rollCount, scoreCard);

      if (decision.type === 'score' && decision.category) {
        // 早期スコア記録
        await this.delay(500, 1000);
        engine.score(npcPlayerId, decision.category);
        onStateUpdate(engine.getState());
        return;
      }

      if (decision.type === 'keep' && decision.keepMask) {
        // キープ設定
        await this.delay(300, 600);
        const currentDice = engine.getState().dice;
        for (let i = 0; i < 5; i++) {
          const shouldKeep = decision.keepMask[i];
          if (shouldKeep !== currentDice[i].kept) {
            engine.toggleKeep(npcPlayerId, i);
          }
        }
        onStateUpdate(engine.getState());

        // リロール
        await this.delay(600, 1200);
        engine.roll(npcPlayerId);
        rollCount++;
        onStateUpdate(engine.getState());
      }
    }

    // 3投目後: スコア記録
    const finalState = engine.getState();
    const finalDice = finalState.dice.map((d) => d.value);
    const finalScoreCard = finalState.scoreCards[npcPlayerId];
    const finalDecision = this.strategy.decide(finalDice, 3, finalScoreCard);

    await this.delay(500, 1000);
    engine.score(npcPlayerId, finalDecision.category!);
    onStateUpdate(engine.getState());
  }

  private delay(min: number, max: number): Promise<void> {
    const ms = min + Math.random() * (max - min);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
