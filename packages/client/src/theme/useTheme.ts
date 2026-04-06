import { useState, useCallback } from 'react';
import { themeManager } from './theme-manager';
import type { ThemeSelection } from './theme-types';

export function useTheme() {
  const [selection, setSelectionState] = useState<ThemeSelection>(themeManager.selection);

  const setBackground = useCallback((id: string) => {
    themeManager.setBackground(id);
    setSelectionState(themeManager.selection);
  }, []);

  const setDice = useCallback((id: string) => {
    themeManager.setDice(id);
    setSelectionState(themeManager.selection);
  }, []);

  const setAccent = useCallback((id: string) => {
    themeManager.setAccent(id);
    setSelectionState(themeManager.selection);
  }, []);

  return { selection, setBackground, setDice, setAccent };
}
