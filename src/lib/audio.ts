type ToneOptions = {
  frequency: number;
  endFrequency?: number;
  type?: OscillatorType;
  duration?: number;
  volume?: number;
  delay?: number;
};

const MUSIC_NOTES = [220, 261.63, 329.63, 392, 329.63, 261.63] as const;

/**
 * Tiny synthesized sound engine built on the Web Audio API. No audio assets
 * are needed, and every method is a no-op during SSR or when sound is off.
 */
class AudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private lastTickAt = 0;
  private soundEnabled = true;
  private musicWanted = false;

  configure(options: { soundEnabled: boolean; musicEnabled: boolean }): void {
    this.soundEnabled = options.soundEnabled;
    this.musicWanted = options.musicEnabled;

    if (typeof window === "undefined") return;

    if (this.musicWanted) {
      this.unlock();
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  unlock(): void {
    if (typeof window === "undefined") return;
    const context = this.ensureContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume().then(() => {
        if (this.musicWanted) this.startMusic();
      });
    } else if (this.musicWanted) {
      this.startMusic();
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    try {
      if (!this.context) {
        const AudioContextClass =
          window.AudioContext ??
          (
            window as Window &
              typeof globalThis & {
                webkitAudioContext?: typeof AudioContext;
              }
          ).webkitAudioContext;

        if (!AudioContextClass) return null;

        this.context = new AudioContextClass();
        this.master = this.context.createGain();
        this.master.gain.value = 0.85;
        this.master.connect(this.context.destination);
      }

      return this.context;
    } catch {
      return null;
    }
  }

  private tone({
    frequency,
    endFrequency,
    type = "sine",
    duration = 0.12,
    volume = 0.05,
    delay = 0,
  }: ToneOptions): void {
    if (!this.soundEnabled) return;
    const context = this.ensureContext();
    const master = this.master;
    if (!context || !master) return;

    try {
      const startAt = context.currentTime + delay;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(
        Math.max(20, frequency),
        startAt,
      );
      if (endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(20, endFrequency),
          startAt + duration,
        );
      }

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, volume),
        startAt + Math.min(0.02, duration / 4),
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + duration,
      );

      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.03);
    } catch {
      // Audio is a progressive enhancement.
    }
  }

  spinStart(): void {
    this.tone({
      frequency: 180,
      endFrequency: 420,
      type: "triangle",
      duration: 0.34,
      volume: 0.035,
    });
    this.tone({
      frequency: 95,
      endFrequency: 180,
      type: "sine",
      duration: 0.4,
      volume: 0.03,
    });
  }

  tick(): void {
    if (!this.soundEnabled) return;
    const now = Date.now();
    if (now - this.lastTickAt < 34) return;
    this.lastTickAt = now;
    this.tone({
      frequency: 780,
      endFrequency: 540,
      type: "square",
      duration: 0.028,
      volume: 0.012,
    });
  }

  reveal(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      this.tone({
        frequency,
        type: "triangle",
        duration: 0.28,
        volume: 0.045,
        delay: index * 0.085,
      });
    });
    this.tone({
      frequency: 130,
      endFrequency: 65,
      type: "sine",
      duration: 0.55,
      volume: 0.06,
      delay: 0.05,
    });
  }

  accept(): void {
    this.tone({
      frequency: 523.25,
      type: "triangle",
      duration: 0.12,
      volume: 0.04,
    });
    this.tone({
      frequency: 783.99,
      type: "triangle",
      duration: 0.2,
      volume: 0.04,
      delay: 0.1,
    });
  }

  skip(): void {
    this.tone({
      frequency: 392,
      endFrequency: 261.63,
      type: "sine",
      duration: 0.24,
      volume: 0.035,
    });
  }

  private startMusic(): void {
    if (!this.musicWanted || this.musicTimer) return;
    const context = this.ensureContext();
    if (!context || context.state !== "running") return;

    if (!this.musicGain) {
      this.musicGain = context.createGain();
      this.musicGain.gain.value = 0.045;
      this.musicGain.connect(this.master ?? context.destination);
    }

    let step = 0;
    const playStep = () => {
      if (!this.musicWanted || !this.context || !this.musicGain) return;
      const frequency =
        MUSIC_NOTES[step % MUSIC_NOTES.length] ?? MUSIC_NOTES[0];
      const now = this.context.currentTime;

      try {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = step % 4 === 0 ? "sine" : "triangle";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
        oscillator.connect(gain);
        gain.connect(this.musicGain);
        oscillator.start(now);
        oscillator.stop(now + 1.25);
      } catch {
        // Keep the music loop resilient.
      }

      step += 1;
    };

    playStep();
    this.musicTimer = setInterval(playStep, 640);
  }

  private stopMusic(): void {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audio = new AudioEngine();
