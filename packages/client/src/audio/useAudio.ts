import { useState, useCallback } from 'react';
import { audioManager } from './audio-manager';

export function useAudio() {
  const [muted, setMutedState] = useState(audioManager.muted);

  const init = useCallback(() => {
    audioManager.init();
    setMutedState(audioManager.muted);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !audioManager.muted;
    audioManager.setMuted(newMuted);
    setMutedState(newMuted);
  }, []);

  const play = useCallback((name: Parameters<typeof audioManager.play>[0]) => {
    audioManager.play(name);
  }, []);

  const startBgm = useCallback(() => {
    audioManager.startBgm();
  }, []);

  const stopBgm = useCallback(() => {
    audioManager.stopBgm();
  }, []);

  return { muted, init, toggleMute, play, startBgm, stopBgm };
}
