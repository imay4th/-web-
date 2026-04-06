import { useState, useCallback, useEffect } from 'react';
import { themeManager } from './theme-manager';
import type { ThemeSelection } from './theme-types';

export function useTheme() {
  const [selection, setSelectionState] = useState<ThemeSelection>(themeManager.selection);

  useEffect(() => {
    return themeManager.subscribe(() => {
      setSelectionState(themeManager.selection);
    });
  }, []);

  const setBackground = useCallback((id: string) => {
    themeManager.setBackground(id);
  }, []);

  const setDice = useCallback((id: string) => {
    themeManager.setDice(id);
  }, []);

  const setAccent = useCallback((id: string) => {
    themeManager.setAccent(id);
  }, []);

  return { selection, setBackground, setDice, setAccent };
}
