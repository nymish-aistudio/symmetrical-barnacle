/** A synthesised room tone. Opt-in only. Deeper in the building, the tone gets warmer and more mechanical. */
class Drone {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private mech: GainNode | null = null;
  on = false;

  private build() {
    const ctx = new AudioContext();
    const master = ctx.createGain(); master.gain.value = 0;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 420; filter.Q.value = 0.7;
    filter.connect(master); master.connect(ctx.destination);

    const tone = (type: OscillatorType, f: number, g: number, detune = 0) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune;
      const gn = ctx.createGain(); gn.gain.value = g; o.connect(gn); gn.connect(filter); o.start(); return gn;
    };
    tone('sine', 55, 0.5); tone('sine', 82.4, 0.22, 4); tone('triangle', 110, 0.08, -3);

    // slow breathing on the filter
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain(); lfoG.gain.value = 90; lfo.connect(lfoG); lfoG.connect(filter.frequency); lfo.start();

    // brown noise, the air of a large room
    const len = ctx.sampleRate * 3; const buf = ctx.createBuffer(1, len, ctx.sampleRate); const d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 300;
    const ng = ctx.createGain(); ng.gain.value = 0.35; noise.connect(nf); nf.connect(ng); ng.connect(filter); noise.start();

    // a machine somewhere below: a pulsing low hum, silent at the surface
    const m = ctx.createOscillator(); m.type = 'sawtooth'; m.frequency.value = 36.7;
    const mf = ctx.createBiquadFilter(); mf.type = 'lowpass'; mf.frequency.value = 160;
    const mech = ctx.createGain(); mech.gain.value = 0;
    const pulse = ctx.createOscillator(); pulse.frequency.value = 1.7; const pg = ctx.createGain(); pg.gain.value = 0.5;
    const pOff = ctx.createConstantSource(); pOff.offset.value = 0.5;
    const pMul = ctx.createGain(); pMul.gain.value = 0; pulse.connect(pg); pg.connect(pMul.gain); pOff.connect(pMul.gain);
    m.connect(mf); mf.connect(pMul); pMul.connect(mech); mech.connect(filter); m.start(); pulse.start(); pOff.start();

    this.ctx = ctx; this.master = master; this.filter = filter; this.mech = mech;
  }

  async start() {
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    if (ctx.state === 'suspended') await ctx.resume();
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(0.16, ctx.currentTime, 0.6);
    this.on = true;
  }
  stop() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
    this.on = false;
    setTimeout(() => { if (!this.on) ctx.suspend(); }, 1500);
  }
  /** depth 0 = surface, 1 = the sheet */
  setDepth(d: number) {
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    this.filter!.frequency.setTargetAtTime(300 + d * 800, t, 0.4);
    const mech = Math.max(0, Math.min(1, (d - 0.45) / 0.35)) * 0.3;
    this.mech!.gain.setTargetAtTime(mech, t, 0.5);
  }
}
export const drone = new Drone();
