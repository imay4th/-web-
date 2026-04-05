import type { Category } from '../types/game.js';

export interface CategoryDefinition {
  id: Category;
  name: string;
  description: string;
}

export const CATEGORIES: readonly CategoryDefinition[] = [
  // 上段（数字カテゴリ）
  { id: 'ones', name: 'エース', description: '1の目の合計' },
  { id: 'twos', name: 'デュース', description: '2の目の合計' },
  { id: 'threes', name: 'トレイ', description: '3の目の合計' },
  { id: 'fours', name: 'フォー', description: '4の目の合計' },
  { id: 'fives', name: 'ファイブ', description: '5の目の合計' },
  { id: 'sixes', name: 'シックス', description: '6の目の合計' },

  // 下段（役カテゴリ）
  { id: 'choice', name: 'チョイス', description: '全ダイスの合計' },
  {
    id: 'fourOfAKind',
    name: 'フォーダイス',
    description: '同じ目4個以上でその目×4',
  },
  {
    id: 'fullHouse',
    name: 'フルハウス',
    description: '同じ目3個＋別の同じ目2個で全ダイスの合計',
  },
  {
    id: 'littleStraight',
    name: 'S.ストレート',
    description: '4つ連続する数字で15点',
  },
  {
    id: 'bigStraight',
    name: 'B.ストレート',
    description: '5つ連続する数字で30点',
  },
  { id: 'yacht', name: 'ヨット', description: '5個全て同じ目で50点' },
] as const;
