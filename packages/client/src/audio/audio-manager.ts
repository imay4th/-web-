type SoundName = 'diceRoll' | 'diceKeep' | 'scoreWrite' | 'yachtFanfare' | 'bonusAchieved' | 'gameEnd' | 'handAnnounce';

const SE_FILES: Record<SoundName, string> = {
  diceRoll: '/sounds/dice-roll.mp3',
  diceKeep: '/sounds/dice-keep.mp3',
  scoreWrite: '/sounds/score-write.mp3',
  yachtFanfare: '/sounds/yacht-fanfare.mp3',
  bonusAchieved: '/sounds/bonus.mp3',
  gameEnd: '/sounds/game-end.mp3',
  handAnnounce: '/sounds/hand-announce.mp3',
};

class AudioManager {
  private bgm: HTMLAudioElement | null = null;
  private bgmEndedHandler: (() => void) | null = null;
  private audioCtx: AudioContext | null = null;
  private seBufferCache = new Map<string, AudioBuffer>();
  private _muted = true;
  private _seVolume = 0.5;
  private _bgmVolume = 0.3;
  private initialized = false;

  /** ユーザーインタラクション時に呼ぶ（iOS Safari対応） */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    const saved = localStorage.getItem('yacht_audio_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this._muted = settings.muted ?? false;
        this._seVolume = settings.seVolume ?? 0.5;
        this._bgmVolume = settings.bgmVolume ?? 0.3;
      } catch { /* ignore */ }
    }
    // Web Audio API コンテキスト生成
    this.audioCtx = new AudioContext();
    // SEファイルをプリロード（AudioBuffer）
    for (const [, path] of Object.entries(SE_FILES)) {
      this.loadSE(path);
    }
  }

  /** SEファイルをAudioBufferとしてロード */
  private async loadSE(path: string): Promise<void> {
    if (!this.audioCtx || this.seBufferCache.has(path)) return;
    try {
      const res = await fetch(path);
      const arrayBuf = await res.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuf);
      this.seBufferCache.set(path, audioBuffer);
    } catch {
      // ロード失敗は無視（再生時にフォールバック）
    }
  }

  get seVolume(): number { return this._seVolume; }
  get bgmVolume(): number { return this._bgmVolume; }

  setSeVolume(volume: number): void {
    this._seVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setBgmVolume(volume: number): void {
    this._bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      this.bgm.volume = this._bgmVolume;
    }
    this.saveSettings();
  }

  get muted(): boolean { return this._muted; }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.bgm) {
      this.bgm.muted = muted;
    }
    this.saveSettings();
  }

  private saveSettings(): void {
    localStorage.setItem('yacht_audio_settings', JSON.stringify({
      muted: this._muted,
      seVolume: this._seVolume,
      bgmVolume: this._bgmVolume,
    }));
  }

  /** SE再生（Web Audio API経由でBGMと干渉しない） */
  play(name: SoundName): void {
    if (this._muted) return;
    const path = SE_FILES[name];
    if (!path) return;

    // AudioContext が suspended の場合は resume
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume().catch(() => { /* ignore */ });
    }

    const buffer = this.seBufferCache.get(path);
    if (buffer && this.audioCtx) {
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      const gainNode = this.audioCtx.createGain();
      gainNode.gain.value = this._seVolume;
      source.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      source.start(0);
    }
  }

  /** BGM開始 */
  startBgm(): void {
    if (this.bgm) return;
    this.bgm = new Audio('/sounds/BGM/ボードの上の静かな午後①.mp3');
    this.bgm.loop = true;
    this.bgm.volume = this._bgmVolume;
    this.bgm.muted = this._muted;

    // loopプロパティのフォールバック: endedイベントで手動ループ
    this.bgmEndedHandler = () => {
      if (this.bgm) {
        this.bgm.currentTime = 0;
        this.bgm.play().catch(() => { /* ignore */ });
      }
    };
    this.bgm.addEventListener('ended', this.bgmEndedHandler);

    // play失敗時にリトライ（最大3回、1秒間隔）
    const tryPlay = (retries: number) => {
      if (!this.bgm) return;
      this.bgm.play().catch((e) => {
        console.warn('BGM再生失敗:', e);
        if (retries > 0 && this.bgm) {
          setTimeout(() => tryPlay(retries - 1), 1000);
        }
      });
    };
    tryPlay(3);
  }

  /** BGM停止 */
  stopBgm(): void {
    if (this.bgm) {
      if (this.bgmEndedHandler) {
        this.bgm.removeEventListener('ended', this.bgmEndedHandler);
        this.bgmEndedHandler = null;
      }
      this.bgm.pause();
      this.bgm.currentTime = 0;
      this.bgm = null;
    }
  }
}

export const audioManager = new AudioManager();
