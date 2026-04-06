export interface BackgroundTheme {
  id: string;
  name: string;
  vars: Record<string, string>;
  bodyBackground: string;
}

export interface DiceTheme {
  id: string;
  name: string;
  vars: Record<string, string>;
  /** 画像ダイスのベースパス。例: '/dice/eva01' → 1.png〜6.png を参照 */
  imagePath?: string;
}

export interface AccentTheme {
  id: string;
  name: string;
  vars: Record<string, string>;
}

export interface ThemeSelection {
  backgroundId: string;
  diceId: string;
  accentId: string;
}
