import type { ThemeSelection } from './theme-types';
import { backgroundThemes, diceThemes, accentThemes } from './theme-presets';

const STORAGE_KEY = 'yacht_theme';
const DEFAULT_SELECTION: ThemeSelection = { backgroundId: 'mahogany', diceId: 'classic', accentId: 'gold' };

class ThemeManager {
  private _selection: ThemeSelection = { ...DEFAULT_SELECTION };
  private initialized = false;
  private listeners = new Set<() => void>();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  get selection(): ThemeSelection { return { ...this._selection }; }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const s = JSON.parse(saved) as Partial<ThemeSelection>;
        // 存在するIDのみ採用
        if (backgroundThemes.some(t => t.id === s.backgroundId)) this._selection.backgroundId = s.backgroundId!;
        if (diceThemes.some(t => t.id === s.diceId)) this._selection.diceId = s.diceId!;
        if (accentThemes.some(t => t.id === s.accentId)) this._selection.accentId = s.accentId!;
      } catch { /* ignore */ }
    }
    this.applyTheme();
  }

  setBackground(id: string): void {
    if (!backgroundThemes.some(t => t.id === id)) return;
    this._selection.backgroundId = id;
    this.applyTheme();
    this.save();
    this.notify();
  }

  setDice(id: string): void {
    if (!diceThemes.some(t => t.id === id)) return;
    this._selection.diceId = id;
    this.applyTheme();
    this.save();
    this.notify();
  }

  setAccent(id: string): void {
    if (!accentThemes.some(t => t.id === id)) return;
    this._selection.accentId = id;
    this.applyTheme();
    this.save();
    this.notify();
  }

  private applyTheme(): void {
    const bg = backgroundThemes.find(t => t.id === this._selection.backgroundId)!;
    const dice = diceThemes.find(t => t.id === this._selection.diceId)!;
    const accent = accentThemes.find(t => t.id === this._selection.accentId)!;

    // CSS変数を:rootに適用
    const root = document.documentElement;
    for (const theme of [bg.vars, dice.vars, accent.vars]) {
      for (const [key, value] of Object.entries(theme)) {
        root.style.setProperty(key, value);
      }
    }

    // body背景は独自に設定
    document.body.style.background = bg.bodyBackground;
    document.body.style.backgroundAttachment = 'fixed';
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._selection));
  }
}

export const themeManager = new ThemeManager();
