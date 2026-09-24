'use strict';

// 全程式合成音效與音樂(不需任何音檔)
const Sound = (() => {
  let ac = null, master, musicG, sfxG, noiseBuf;
  const loops = {};
  let track = null, step = 0, nextT = 0, timer = null, musicName = '';

  const vol = () => Save.data;
  const vg = v => (v <= 0 ? 0 : Math.pow(v / 5, 1.6));
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- 樂理小工具 ----------
  const PC = { C: 0, 'C#': 1, Db: 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
  function chord(name) {
    const m = /^([A-G][b#]?)(m?)$/.exec(name);
    let base = 48 + PC[m[1]];
    if (base < 50) base += 12;
    return m[2] ? [base, base + 3, base + 7] : [base, base + 4, base + 7];
  }
  const chords = s => s.split(' ').map(chord);
  const N = -1;

  // 八分音符旋律 → 十六分音符格式 [音高, 長度]
  function fromEighths(arr) {
    const out = new Array(128).fill(null);
    arr.forEach((m, i) => { if (m > 0) out[i * 2] = [m, 2]; });
    return out;
  }

  // 依和弦進行自動作曲:強拍用和弦音、弱拍級進,前 4 小節動機在 5~6 小節重現,結尾回到主音
  function genLead(o) {
    const r = rng(o.seed), cs = chords(o.chords);
    const scale = o.mode === 'min' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
    const tonic = 60 + o.key, pool = [];
    for (let oct = 0; oct < 3; oct++) scale.forEach(d => { const n = tonic + d + 12 * oct; if (n <= tonic + 21) pool.push(n); });
    const T = [
      [[0, 3], [3, 1], [4, 2], [6, 2], [8, 3], [11, 1], [12, 2], [14, 2]],
      [[0, 2], [2, 2], [4, 4], [8, 2], [10, 2], [12, 4]],
      [[0, 1], [1, 1], [2, 2], [4, 2], [6, 1], [7, 1], [8, 4], [12, 2], [14, 1], [15, 1]],
      [[0, 3], [3, 3], [6, 2], [8, 3], [11, 3], [14, 2]],
      [[0, 2], [2, 1], [3, 1], [4, 2], [6, 2], [8, 2], [10, 1], [11, 1], [12, 2], [14, 2]]
    ];
    const bars = [];
    let prev = tonic + 7, prevPrev = 0;
    for (let b = 0; b < 8; b++) {
      if (b === 4 || b === 5) { bars.push(bars[b - 4]); continue; }
      const tpl = b === 7 ? [[0, 2], [2, 2], [4, 4], [8, 8]] : T[(r() * T.length) | 0];
      const pcs = cs[b].map(n => n % 12), notes = [];
      tpl.forEach(([st, len], k) => {
        let cand = (st % 4 === 0) ? pool.filter(n => pcs.includes(n % 12)) : pool;
        if (!cand.length) cand = pool;
        let best = null, bd = 1e9;
        for (const n of cand) {
          const d = Math.abs(n - prev) + r() * 3 + (n === prev && n === prevPrev ? 6 : 0);
          if (d < bd) { bd = d; best = n; }
        }
        if (b === 7 && k === tpl.length - 1) best = pool.filter(n => (n - tonic) % 12 === 0).sort((a, c) => Math.abs(a - prev) - Math.abs(c - prev))[0];
        if (b === 3 && k === tpl.length - 1) best = pool.filter(n => (n - tonic) % 12 === 7).sort((a, c) => Math.abs(a - prev) - Math.abs(c - prev))[0] || best;
        notes.push([st, best, len]); prevPrev = prev; prev = best;
      });
      bars.push(notes);
    }
    const out = new Array(128).fill(null);
    bars.forEach((notes, b) => notes.forEach(([st, m, len]) => { out[b * 16 + st] = [m, len]; }));
    return out;
  }
  const gen = (o, bpm, style) => ({ bpm, chords: chords(o.chords), lead: genLead(o), style });

  const TRACKS = {
    menu: gen({ key: 0, mode: 'min', chords: 'Cm Ab Eb Bb Cm Ab Bb G', seed: 91 }, 176, { arp: '16', bass: 'pump', drums: 'disco', bell: 1, brass: 1, shaker: 1, sparkle: 1 }),
    c1s1: {
      bpm: 156, chords: chords('F G Em Am F G C C'),
      lead: fromEighths([
        81, 79, 77, 79, 81, 84, 81, 79, 79, 77, 74, 77, 79, 83, 79, 77,
        76, 79, 83, 79, 76, 79, 83, 86, 72, 76, 81, 76, 72, 76, 81, 84,
        81, 84, 86, 84, 81, 79, 77, 79, 79, 83, 86, 83, 79, 74, 79, 83,
        84, N, 84, 79, 76, 79, 84, N, 84, 83, 81, 79, 77, 76, 74, 72]),
      style: { arp: '16', bass: 'sync', drums: 'bounce', bell: 1, brass: 1, shaker: 1, sparkle: 1 }
    },
    c1s2: {
      bpm: 134, chords: chords('Am F C G Am F G E'),
      lead: fromEighths([
        76, N, 81, N, 84, N, 81, 76, 77, N, 81, N, 84, N, 81, 77,
        79, N, 84, N, 79, 76, 79, N, 74, N, 79, N, 83, N, 79, 74,
        76, 81, 84, 81, 76, 81, 84, 86, 84, 81, 77, 81, 84, 81, 77, 72,
        83, 79, 74, 79, 83, 86, 83, 79, 80, 83, 86, 83, 80, 76, 80, N]),
      style: { arp: '8', pad: 1, bass: 'walk', drums: 'rock', bell: 1, sparkle: 1 }
    },
    c1s3: {
      bpm: 162, chords: chords('Em C D Bm Em C D B'),
      lead: fromEighths([
        79, N, 83, N, 86, 83, 79, N, 79, N, 84, N, 79, 76, 79, 84,
        78, N, 81, N, 86, 81, 78, N, 78, N, 83, N, 86, 83, 78, 74,
        76, 79, 83, 79, 76, 79, 83, 86, 84, 88, 84, 79, 84, 88, 84, 79,
        81, 78, 81, 86, 81, 78, 74, 78, 83, N, 83, N, 86, 83, 78, 83]),
      style: { arp: '16', pad: 1, bass: 'pump', drums: 'disco', bell: 1, sparkle: 1 }
    },
    c2s1: gen({ key: 7, mode: 'maj', chords: 'G D Em C G D C D', seed: 11 }, 148, { arp: '8', bass: 'walk', drums: 'disco', bell: 1, shaker: 1, sparkle: 1 }),
    c2s2: gen({ key: 2, mode: 'min', chords: 'Dm Bb F C Dm Bb Gm A', seed: 23 }, 126, { arp: '8', pad: 1, bass: 'walk', drums: 'rock', bell: 1, sparkle: 1 }),
    c2s3: gen({ key: 11, mode: 'min', chords: 'Bm G D A Bm G A F#', seed: 37 }, 164, { arp: '16', pad: 1, bass: 'pump', drums: 'disco', bell: 1, brass: 1, sparkle: 1 }),
    c3s1: gen({ key: 0, mode: 'maj', chords: 'C Am F G C Am Dm G', seed: 41 }, 144, { arp: '16', bass: 'pump', drums: 'rock', bell: 1, brass: 1, shaker: 1 }),
    c3s2: gen({ key: 3, mode: 'maj', chords: 'Eb Cm Ab Bb Eb Cm Fm Bb', seed: 53 }, 122, { arp: '8', pad: 1, bass: 'sync', drums: 'bounce', bell: 1, sparkle: 1 }),
    c3s3: gen({ key: 9, mode: 'maj', chords: 'A F#m D E A F#m D E', seed: 67 }, 168, { arp: '16', pad: 1, bass: 'sync', drums: 'disco', bell: 1, brass: 1, shaker: 1, sparkle: 1 })
  };

  const BASS = {
    pump: { 0: 0, 2: 12, 4: 0, 6: 12, 8: 0, 10: 12, 12: 0, 14: 12 },
    walk: { 0: 0, 4: 7, 8: 0, 10: 12, 12: 7, 14: 5 },
    sync: { 0: 0, 3: 0, 6: 7, 8: 0, 10: 12, 12: 0, 14: 7 }
  };
  const DRUMS = {
    rock: { k: [0, 8, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12], o: [14] },
    disco: { k: [0, 4, 8, 12], s: [4, 12], h: [], o: [2, 6, 10, 14] },
    bounce: { k: [0, 6, 8, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], o: [] }
  };

  // ---------- 初始化 / 音量 ----------
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

  // ---------- 樂器 ----------
  const M = () => musicG;
  const iLead = (f, t, d) => { tone('square', f, t, d, 0.085, M(), { lp: 4200 }); tone('square', f * 1.006, t, d, 0.05, M(), { lp: 4200 }); };
  const iBell = (f, t, d, v) => { tone('sine', f, t, d, v, M(), { a: 0.003 }); tone('sine', f * 2.76, t, d * 0.4, v * 0.35, M()); tone('sine', f * 5.4, t, d * 0.15, v * 0.15, M()); };
  const iPluck = (f, t, v) => tone('triangle', f, t, 0.17, v, M(), { a: 0.002 });
  const iPad = (notes, t, d) => notes.forEach(n => { tone('triangle', mtof(n), t, d, 0.05, M(), { a: 0.15, lp: 1400 }); tone('sine', mtof(n + 12), t, d, 0.025, M(), { a: 0.2 }); });
  const iBrass = (notes, t, d) => notes.forEach(n => { tone('sawtooth', mtof(n), t, d, 0.05, M(), { lp: 2300, a: 0.012 }); tone('sawtooth', mtof(n) * 1.007, t, d, 0.035, M(), { lp: 2300, a: 0.012 }); });
  const kick = t => tone('sine', 150, t, 0.16, 0.5, M(), { to: 45 });
  const snare = (t, v) => { noise(t, 0.11, v || 0.22, M(), { f: 1800, type: 'bandpass' }); tone('triangle', 190, t, 0.07, 0.12, M(), { to: 120 }); };
  const hat = (t, open) => noise(t, open ? 0.14 : 0.035, open ? 0.09 : 0.07, M(), { f: 7500 });

  function playStep(s, t) {
    const tr = track, st = tr.style, i = s % 16, bar = Math.floor(s / 16) % 8, ch = tr.chords[bar];
    const e = 60 / tr.bpm / 4;
    const L = tr.lead[s % 128];
    if (L) {
      iLead(mtof(L[0]), t, L[1] * e * 0.92);
      if (st.bell) iBell(mtof(L[0] + 12), t, L[1] * e, 0.04);
    }
    if (st.arp === '16') iPluck(mtof(ch[[0, 1, 2, 1, 2, 1, 0, 1][i % 8]] + 12), t, 0.05);
    else if (st.arp === '8' && i % 2 === 0) iPluck(mtof(ch[[0, 1, 2, 1][(i / 2) % 4]] + 12), t, 0.06);
    if (st.pad && i === 0) iPad(ch, t, e * 15);

    let root = ch[0] - 12; if (root < 40) root += 12;
    const bo = BASS[st.bass || 'pump'][i];
    if (bo !== undefined) {
      tone('sawtooth', mtof(root + bo), t, e * 1.9, 0.13, M(), { lp: 650 });
      tone('sine', mtof(root + bo - 12 < 28 ? root + bo : root + bo - 12), t, e * 1.9, 0.12, M());
    }

    const D = DRUMS[st.drums || 'rock'];
    if (D.k.includes(i)) kick(t);
    if (D.s.includes(i)) snare(t);
    if (D.h.includes(i)) hat(t, false);
    if (D.o.includes(i)) hat(t, true);
    if (st.shaker && i % 2 === 1) noise(t, 0.03, 0.05, M(), { f: 9500 });
    if (bar === 7 && i >= 12) snare(t, 0.1 + (i - 12) * 0.05);
    if (bar === 0 && i === 0) noise(t, 0.6, 0.12, M(), { f: 5000 });
    if (st.brass && (i === 6 || i === 14) && bar % 2 === 1) iBrass(ch, t, e * 1.6);
    if (st.sparkle && bar % 4 === 3 && i >= 12) iBell(mtof(ch[i - 12 < 3 ? i - 12 : 2] + 24), t, e * 3, 0.05);
  }

  function tick() {
    if (!track || !ac) return;
    while (nextT < ac.currentTime + 0.2) {
      playStep(step, nextT);
      nextT += 60 / track.bpm / 4;
      step = (step + 1) % 128;
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
      if (name !== 'over') { tone('triangle', mtof(m - 12), t + d, 0.3, 0.12, musicG); iBell(mtof(m + 12), t + d, 0.4, 0.06); }
    });
  }

  // ---------- 持續音(引擎 / 甩尾 / 越野) ----------
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
    loops.burn = mkNoise('highpass', 3200, 0.7);
    const so = ac.createOscillator(); so.type = 'sawtooth'; so.frequency.value = 900;
    const lfo = ac.createOscillator(); lfo.frequency.value = 11;
    const lg = ac.createGain(); lg.gain.value = 70;
    lfo.connect(lg); lg.connect(so.frequency);
    const sf = ac.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1500; sf.Q.value = 5;
    const sg = ac.createGain(); sg.gain.value = 0;
    so.connect(sf); sf.connect(sg); sg.connect(sfxG);
    so.start(); lfo.start();
    loops.sqO = so; loops.sqG = sg;
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
    loops.eg.gain.setTargetAtTime(o.on ? 0.03 + pct * 0.025 : 0, t, k);
    loops.squeal.gain.setTargetAtTime(o.drift ? 0.3 : 0, t, 0.04);
    loops.burn.gain.setTargetAtTime(o.drift ? 0.06 + pct * 0.08 : 0, t, 0.05);
    loops.sqO.frequency.setTargetAtTime(780 + pct * 700, t, 0.08);
    loops.sqG.gain.setTargetAtTime(o.drift ? 0.07 + pct * 0.08 : 0, t, 0.04);
    loops.rumble.gain.setTargetAtTime(o.off ? 0.4 : (o.on ? 0.03 * pct : 0), t, k);
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
      case 'mud':
        noise(t, 0.5, 0.45, null, { f: 900, to: 150, type: 'lowpass' });
        tone('sine', 120, t, 0.4, 0.4, null, { to: 50 }); break;
      case 'bounce':
        tone('sine', 220, t, 0.45, 0.35, null, { to: 700 });
        tone('triangle', 440, t + 0.1, 0.4, 0.2, null, { to: 1200 }); break;
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
      case 'cheer':
        for (let i = 0; i < 12; i++) noise(t + i * 0.13 + Math.random() * 0.05, 0.55, 0.14, null, { f: 700 + Math.random() * 1000, type: 'bandpass', q: 1.1 });
        tone('sawtooth', 380, t, 0.45, 0.1, null, { to: 720, lp: 2400 }); tone('sawtooth', 480, t + 0.06, 0.45, 0.09, null, { to: 900, lp: 2400 });
        tone('sawtooth', 300, t + 0.2, 0.4, 0.08, null, { to: 640, lp: 2200 });
        for (let k = 0; k < 18; k++) noise(t + 0.6 + k * 0.1 + Math.random() * 0.05, 0.05, 0.22, null, { f: 2600, type: 'bandpass', q: 0.8 });
        [523, 659, 784, 1047].forEach((f, i) => tone('square', f, t + i * 0.1, 0.35, 0.1)); break;
      case 'firework':
        tone('sine', 500, t, 0.45, 0.09, null, { to: 1800 });
        noise(t + 0.45, 0.55, 0.35, null, { f: 3200, to: 300, type: 'lowpass' });
        tone('sine', 120, t + 0.45, 0.3, 0.3, null, { to: 45 });
        for (let k = 0; k < 4; k++) tone('triangle', 1400 + Math.random() * 1500, t + 0.5 + k * 0.07, 0.15, 0.05);
        break;
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
