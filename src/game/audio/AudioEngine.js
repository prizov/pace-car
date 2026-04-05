// ── Web Audio helper ────────────────────────────────────────
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.engineNode = null;
    this.gainNode = null;
    this._speed = 0;
  }
  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.06;
      this.gainNode.connect(this.ctx.destination);
      this.engineNode = this.ctx.createOscillator();
      this.engineNode.type = 'sawtooth';
      this.engineNode.frequency.value = 80;
      this.engineNode.connect(this.gainNode);
      this.engineNode.start();
    } catch(e) {}
  }
  setSpeed(normalised) { // 0–1
    if (!this.ctx) return;
    this._speed = normalised;
    const freq = 80 + normalised * 220;
    this.engineNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
  }
  playHit(heavy=false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.ctx.destination);
    osc.type = 'square';
    osc.frequency.value = heavy ? 60 : 120;
    g.gain.setValueAtTime(heavy ? 0.3 : 0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (heavy ? 0.4 : 0.2));
    osc.start(); osc.stop(this.ctx.currentTime + 0.4);
  }
  playTurbo() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.2, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.start(); osc.stop(this.ctx.currentTime + 0.5);
  }
  playExplosion() {
    if (!this.ctx) return;
    const bufLen = this.ctx.sampleRate * 0.8;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random()*2-1) * Math.pow(1 - i/bufLen, 2);
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    src.buffer = buf; g.gain.value = 0.5;
    src.connect(g); g.connect(this.ctx.destination);
    src.start();
  }
  playTransform() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0.18, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);
    osc.start(); osc.stop(this.ctx.currentTime + 0.55);
  }
  playMissile() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.22);
    g.gain.setValueAtTime(0.13, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
    osc.start(); osc.stop(this.ctx.currentTime + 0.28);
  }
  playCatPounce() {
    if (!this.ctx) return;
    // Angry yowl: fast pitch sweep up then down
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.45);
    g.gain.setValueAtTime(0.2, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);
    osc.start(); osc.stop(this.ctx.currentTime + 0.55);
  }
  playCatLand() {
    if (!this.ctx) return;
    // Heavy thud + short hiss
    const bufLen = this.ctx.sampleRate * 0.25;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.2);
    const src = this.ctx.createBufferSource();
    const gn = this.ctx.createGain(); gn.gain.value = 0.5;
    src.buffer = buf; src.connect(gn); gn.connect(this.ctx.destination);
    src.start();
  }
  playTankShot() {
    if (!this.ctx) return;
    // Deep boom: noise burst + low thud
    const bufLen = this.ctx.sampleRate * 0.35;
    const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.4);
    const src = this.ctx.createBufferSource();
    const gn = this.ctx.createGain();
    gn.gain.value = 0.6;
    src.buffer = buf; src.connect(gn); gn.connect(this.ctx.destination);
    src.start();
    // Low pitched thud
    const osc = this.ctx.createOscillator();
    const go = this.ctx.createGain();
    osc.connect(go); go.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);
    go.gain.setValueAtTime(0.4, this.ctx.currentTime);
    go.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    osc.start(); osc.stop(this.ctx.currentTime + 0.35);
  }
}
