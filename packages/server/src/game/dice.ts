import { randomInt } from 'crypto';
import type { Die } from '@yacht/shared';
import { DICE_COUNT } from '@yacht/shared';

/**
 * キープされていないダイスのみ再ロールする
 */
export function rollDice(currentDice: Die[], fixedValues?: number[]): Die[] {
  return currentDice.map((die, index) =>
    die.kept
      ? die
      : { value: fixedValues?.[index] ?? randomInt(1, 7), kept: false },
  );
}

/**
 * 初期ダイスを生成する（5個、全てランダム値・未キープ）
 */
export function createInitialDice(): Die[] {
  return Array.from({ length: DICE_COUNT }, () => ({
    value: randomInt(1, 7),
    kept: false,
  }));
}
