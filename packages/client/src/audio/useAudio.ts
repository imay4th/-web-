import { useState, useCallback } from 'react';
import { audioManager } from './audio-manager';

export function useAudio() {
  const [muted, setMutedState] = useState(audioManager.muted);
  const [seVolume, setSeVolumeState] = useState(audioManager.seVolume);
  const [bgmVolume, setBgmVolumeState] = useState(audioManager.bgmVolume);

  const init = useCallback(() => {
    audioManager.init();
    setMutedState(audioManager.muted);
    setSeVolumeState(audioManager.seVolume);
    setBgmVolumeState(audioManager.bgmVolume);
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

  const setSeVolume = useCallback((v: number) => {
    audioManager.setSeVolume(v);
    setSeVolumeState(audioManager.seVolume);
  }, []);

  const setBgmVolume = useCallback((v: number) => {
    audioManager.setBgmVolume(v);
    setBgmVolumeState(audioManager.bgmVolume);
    setMutedState(audioManager.muted);  // auto-unmute反映
  }, []);

  const playPreview = useCallback((name: Parameters<typeof audioManager.play>[0]) => {
    audioManager.playPreview(name);
  }, []);

  return { muted, seVolume, bgmVolume, init, toggleMute, play, startBgm, stopBgm, setSeVolume, setBgmVolume, playPreview };
}
