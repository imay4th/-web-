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
