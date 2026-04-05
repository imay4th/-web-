import { useState } from 'react';
import { useAudio } from '../../audio/useAudio';
import { AudioPanel } from '../AudioPanel/AudioPanel';
import styles from './AudioToggleButton.module.css';

export function AudioToggleButton() {
  const audio = useAudio();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={() => setShowPanel((p) => !p)}
        aria-label={audio.muted ? '音声ON' : '音声OFF'}
      >
        {audio.muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
      </button>
      {showPanel && <AudioPanel onClose={() => setShowPanel(false)} />}
    </>
  );
}
