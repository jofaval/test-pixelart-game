/** Small opt-in procedural soundscape: no downloads and no audio-only clues. */
export class Soundscape {
  private context: AudioContext | null = null;
  private timer: number | null = null;
  private phrase = 0;
  private water: AudioBufferSourceNode | null = null;

  setEnabled(enabled: boolean): void {
    if (!enabled) {
      if (this.timer !== null) window.clearInterval(this.timer);
      this.timer = null;
      void this.context?.suspend().catch(() => {});
      return;
    }
    try {
      this.context ??= new AudioContext();
      if (!this.water) {
        const buffer = this.context.createBuffer(1, this.context.sampleRate * 3, this.context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        this.water = this.context.createBufferSource();
        this.water.buffer = buffer;
        this.water.loop = true;
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 620;
        const gain = this.context.createGain();
        gain.gain.value = 0.025;
        this.water.connect(filter).connect(gain).connect(this.context.destination);
        this.water.start();
      }
      void this.context.resume().catch(() => {});
      if (this.timer === null) {
        this.chime();
        this.timer = window.setInterval(() => this.chime(), 3200);
      }
    } catch {
      // Audio can be unavailable; exploration never depends on it.
    }
  }

  private chime(): void {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const tones = [220, 330, 293.66, 440, 261.63, 330];
    for (let i = 0; i < 3; i++) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = tones[(this.phrase + i) % tones.length] * (i === 2 ? 2 : 1);
      const start = now + i * 0.42;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.018, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 2.1);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 2.2);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
    this.phrase++;
  }
}
