'use strict';

// 全程式合成音效與音樂(不需任何音檔)
const Sound = (() => {
  let ac = null, master, musicG, sfxG, noiseBuf;
  const loops = {};
  let track = null, step = 0, nextT = 0, timer = null, musicName = '';

  const vol = () => Save.data;
  const vg = v => (v <= 0 ? 0 : Math.pow(v / 5, 1.6));

  const CH = {
    C: [60, 64, 67], G: [55, 59, 62], Am: [57, 60, 64], F: [53, 57, 60], Em: [52, 55, 59],
    D: [50, 54, 57], Bm: [59, 62, 66], B: [59, 63, 66], E: [52, 56, 59]
  };
  const chords = s => s.split(' ').map(n => CH[n]);
  const N = -1;

  const TRACKS = {
    menu: {
      bpm: 132,
      chords: chords('C G Am F C G F G'),
      lead: [
        76, 79, 84, 79, 76, 79, 74, 72,  71, 74, 79, 74, 71, 74, 79, N,
        72, 76, 81, 76, 72, 76, 81, 79,  77, 81, 84, 81, 77, 81, 79, 77,
        76, 79, 84, 79, 88, 84, 79, 76,  79, 83, 86, 83, 79, 83, 86, N,
        77, 81, 84, 81, 79, 77, 76, 74,  71, 74, 79, 83, 86, N, 84, N],
      lead2: 'square'
    },
    s1: {
      bpm: 156,
      chords: chords('F G Em Am F G C C'),
      lead: [
        81, 79, 77, 79, 81, 84, 81, 79,  79, 77, 74, 77, 79, 83, 79, 77,
        76, 79, 83, 79, 76, 79, 83, 86,  72, 76, 81, 76, 72, 76, 81, 84,
        81, 84, 86, 84, 81, 79, 77, 79,  79, 83, 86, 83, 79, 74, 79, 83,
        84, N, 84, 79, 76, 79, 84, N,    84, 83, 81, 79, 77, 76, 74, 72]
    },
    s2: {
      bpm: 134,
      chords: chords('Am F C G Am F G E'),
      lead: [
        76, N, 81, N, 84, N, 81, 76,  77, N, 81, N, 84, N, 81, 77,
        79, N, 84, N, 79, 76, 79, N,  74, N, 79, N, 83, N, 79, 74,
        76, 81, 84, 81, 76, 81, 84, 86,  84, 81, 77, 81, 84, 81, 77, 72,
        83, 79, 74, 79, 83, 86, 83, 79,  80, 83, 86, 83, 80, 76, 80, N]
    },
    s3: {
      bpm: 162,
      chords: chords('Em C D Bm Em C D B'),
      lead: [
        79, N, 83, N, 86, 83, 79, N,  79, N, 84, N, 79, 76, 79, 84,
        78, N, 81, N, 86, 81, 78, N,  78, N, 83, N, 86, 83, 78, 74,
        76, 79, 83, 79, 76, 79, 83, 86,  84, 88, 84, 79, 84, 88, 84, 79,
        81, 78, 81, 86, 81, 78, 74, 78,  83, N, 83, N, 86, 83, 78, 83]
    }
  };

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    musicG = ac.createGain(); musicG.connect(master);
    sfxG = ac.createGain(); sfxG.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyVol();
    startLoops();
    if (musicName) { const n = musicName; musicName = ''; music(n); }
  }

  function applyVol() {
    if (!ac) return;
    musicG.gain.setTargetAtTime(vg(vol().music) * 0.5, ac.currentTime, 0.02);
    sfxG.gain.setTargetAtTime(vg(vol().sfx) * 0.85, ac.currentTime, 0.02);
  }

  function tone(type, f, t, dur, v, dest, o = {}) {
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + (o.a || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    let out = g;
    if (o.lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; g.connect(f2); out = f2; }
    out.connect(dest || sfxG);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(t, dur, v, dest, o = {}) {
    const src = ac.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = o.rate || 1;
    const f = ac.createBiquadFilter();
    f.type = o.type || 'highpass'; f.frequency.setValueAtTime(o.f || 6000, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 0.7;
    const g = ac.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || sfxG);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }

  function playStep(s, t) {
    const tr = track, bar = Math.floor(s / 8), i = s % 8, ch = tr.chords[bar % tr.chords.length];
    const e = 60 / tr.bpm / 2;
    const m = tr.lead[s];
    if (m > 0) tone('square', mtof(m), t, e * 0.9, 0.11, musicG, { lp: 4200 });
    const arp = [0, 1, 2, 1, 0, 1, 2, 1][i];
    tone('triangle', mtof(ch[arp] + 12), t, e * 0.8, 0.09, musicG);
    let root = ch[0] - 12; if (root < 40) root += 12;
    tone('sawtooth', mtof(i % 2 ? root + 12 : root), t, e * 0.85, 0.13, musicG, { lp: 700 });
    if (i === 0 || i === 4) { tone('sine', 150, t, 0.16, 0.5, musicG, { to: 45 }); }
    if (i === 2 || i === 6) noise(t, 0.1, 0.22, musicG, { f: 1800, type: 'bandpass' });
    noise(t, 0.035, i % 2 ? 0.1 : 0.06, musicG, { f: 7000 });
  }

  function tick() {
    if (!track || !ac) return;
    while (nextT < ac.currentTime + 0.18) {
      playStep(step, nextT);
      nextT += 60 / track.bpm / 2;
      step = (step + 1) % 64;
    }
  }

  function music(name) {
    if (name === musicName && track) return;
    musicName = name;
    if (!ac) return;
    stopMusic(true);
    if (!TRACKS[name]) return;
    track = TRACKS[name]; step = 0; nextT = ac.currentTime + 0.08;
    timer = setInterval(tick, 30);
  }

  function stopMusic(keepName) {
    if (timer) clearInterval(timer);
    timer = null; track = null;
    if (!keepName) musicName = '';
  }

  function jingle(name) {
    if (!ac) return;
    stopMusic();
    const t = ac.currentTime + 0.05;
    const seq = {
      clear: [[72, 0], [76, 0.14], [79, 0.28], [84, 0.42], [79, 0.62], [84, 0.76], [88, 0.9], [91, 1.15]],
      over: [[71, 0], [69, 0.3], [67, 0.6], [64, 0.9], [60, 1.4]],
      rank: [[76, 0], [79, 0.12], [84, 0.24], [88, 0.36]]
    }[name] || [];
    seq.forEach(([m, d]) => {
      tone(name === 'over' ? 'triangle' : 'square', mtof(m), t + d, name === 'over' ? 0.4 : 0.3, 0.16, musicG, { lp: 3500 });
      if (name !== 'over') tone('triangle', mtof(m - 12), t + d, 0.3, 0.12, musicG);
    });
  }

  function startLoops() {
    const mkNoise = (type, f, q) => {
      const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 1;
      const g = ac.createGain(); g.gain.value = 0;
      src.connect(fl); fl.connect(g); g.connect(sfxG); src.start();
      return g;
    };
    const eg = ac.createGain(); eg.gain.value = 0;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    const o1 = ac.createOscillator(); o1.type = 'sawtooth';
    const o2 = ac.createOscillator(); o2.type = 'square';
    o1.connect(lp); o2.connect(lp); lp.connect(eg); eg.connect(sfxG);
    o1.start(); o2.start();
    loops.o1 = o1; loops.o2 = o2; loops.eg = eg; loops.lp = lp;
    loops.squeal = mkNoise('bandpass', 1900, 9);
    loops.rumble = mkNoise('lowpass', 260, 1);
    loops.wind = mkNoise('highpass', 1500, 0.5);
  }

  function setLoops(o) {
    if (!ac || !loops.eg) return;
    const t = ac.currentTime, k = 0.06;
    const pct = o.pct || 0;
    const gear = pct * 3.4;
    const f = 62 + (gear % 1) * 95 + Math.floor(gear) * 18 + (o.boost ? 40 : 0);
    loops.o1.frequency.setTargetAtTime(f, t, k);
    loops.o2.frequency.setTargetAtTime(f * 0.5, t, k);
    loops.lp.frequency.setTargetAtTime(500 + pct * 1300, t, k);
    loops.eg.gain.setTargetAtTime(o.on ? 0.09 + pct * 0.06 : 0, t, k);
    loops.squeal.gain.setTargetAtTime(o.drift ? 0.16 : 0, t, k);
    loops.rumble.gain.setTargetAtTime(o.off ? 0.55 : (o.on ? 0.05 * pct : 0), t, k);
    loops.wind.gain.setTargetAtTime(o.on ? 0.02 + (o.boost ? 0.1 : pct * 0.04) : 0, t, k);
  }

  function play(name) {
    if (!ac || vol().sfx === 0) return;
    const t = ac.currentTime;
    switch (name) {
      case 'select': tone('square', 880, t, 0.06, 0.12, null, { lp: 4000 }); break;
      case 'confirm':
        tone('square', 660, t, 0.08, 0.14); tone('square', 990, t + 0.07, 0.14, 0.14); break;
      case 'back': tone('square', 700, t, 0.07, 0.12, null, { to: 420 }); break;
      case 'coin':
        tone('square', 988, t, 0.07, 0.13); tone('square', 1319, t + 0.06, 0.16, 0.13); break;
      case 'nitroGet':
        [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, t + i * 0.05, 0.14, 0.2)); break;
      case 'nitro':
        noise(t, 0.9, 0.5, null, { f: 500, to: 5000, type: 'bandpass', q: 1.5 });
        tone('sawtooth', 90, t, 0.8, 0.22, null, { to: 360, lp: 900 }); break;
      case 'crash':
        noise(t, 0.6, 0.7, null, { f: 1500, to: 200, type: 'lowpass' });
        tone('sine', 160, t, 0.5, 0.6, null, { to: 40 });
        tone('square', 300, t + 0.05, 0.3, 0.12, null, { to: 80 }); break;
      case 'slip':
        tone('sine', 900, t, 0.8, 0.14, null, { to: 300 });
        noise(t, 0.7, 0.3, null, { f: 2400, type: 'bandpass', q: 6 }); break;
      case 'bump':
        tone('sine', 130, t, 0.25, 0.55, null, { to: 45 });
        noise(t, 0.15, 0.3, null, { f: 800, type: 'lowpass' }); break;
      case 'checkpoint':
        [659, 784, 988, 1319].forEach((f, i) => tone('square', f, t + i * 0.09, 0.22, 0.15));
        tone('triangle', 330, t, 0.5, 0.2); break;
      case 'beep': tone('square', 440, t, 0.14, 0.15); break;
      case 'go': tone('square', 880, t, 0.5, 0.17); tone('square', 1320, t, 0.5, 0.1); break;
      case 'tick': tone('square', 1200, t, 0.05, 0.12); break;
      case 'drift': noise(t, 0.2, 0.15, null, { f: 2000, type: 'bandpass', q: 5 }); break;
    }
  }

  return {
    init, play, music, stopMusic, jingle, setLoops, applyVol,
    get ready() { return !!ac; },
    setVol(kind, v) { Save.data[kind] = clamp(v, 0, 5); Save.store(); applyVol(); },
    suspend() { if (ac && ac.state === 'running') ac.suspend(); },
    resume() { if (ac && ac.state === 'suspended') ac.resume(); }
  };
})();
