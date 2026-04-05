// 紛らわしい文字（0, O, 1, I, L）を除外した英数字セット
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const ROOM_ID_LENGTH = 4;

/**
 * 使用中IDと重複しないユニークなルームIDを生成する
 */
export function generateRoomId(existingIds: Set<string>): string {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let id = '';
    for (let i = 0; i < ROOM_ID_LENGTH; i++) {
      id += CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    if (!existingIds.has(id)) {
      return id;
    }
  }

  throw new Error('ルームIDの生成に失敗しました。空きIDがありません。');
}
