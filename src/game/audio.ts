/* Крошечный WebAudio-синтезатор: без файлов, всё генерируется на лету. */

type OscType = OscillatorType;

class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;

  ensure() {
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      const len = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  private tone(freq: number, dur: number, type: OscType, vol: number, slideTo?: number, delay = 0) {
    if (this.muted || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, vol: number, freq: number, q = 1, delay = 0) {
    if (this.muted || !this.ctx || !this.master || !this.noiseBuf) return;
    const t0 = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  mow() {
    this.noise(0.07, 0.16, 2600, 0.8);
    this.tone(220, 0.06, "triangle", 0.05, 160);
  }

  kill() {
    this.noise(0.18, 0.3, 900, 0.7);
    this.tone(320, 0.22, "sawtooth", 0.14, 70);
    this.tone(640, 0.14, "square", 0.07, 180, 0.03);
  }

  hurt() {
    this.tone(140, 0.16, "sawtooth", 0.16, 60);
    this.noise(0.1, 0.12, 400, 0.8);
  }

  thorn() {
    this.tone(180, 0.12, "square", 0.1, 90);
  }

  level() {
    this.tone(420, 0.12, "triangle", 0.16);
    this.tone(560, 0.12, "triangle", 0.16, undefined, 0.09);
    this.tone(840, 0.2, "triangle", 0.18, undefined, 0.18);
  }

  coin() {
    this.tone(920, 0.08, "square", 0.08);
    this.tone(1380, 0.14, "square", 0.08, undefined, 0.07);
  }

  ui() {
    this.tone(520, 0.06, "triangle", 0.08);
  }

  death() {
    this.tone(300, 0.5, "sawtooth", 0.16, 50);
    this.noise(0.4, 0.2, 300, 0.6, 0.05);
  }
}

export const sfx = new Sfx();
