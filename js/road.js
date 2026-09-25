'use strict';

// 偽 3D 賽道:建構(賽道 / 物件 / 敵車)與繪製
const Road = (() => {
  const L = CFG.segLen, RH = CFG.roadHalf;
  const LANES = [-0.75, -0.25, 0.25, 0.75];
  const FOG = 5;

  function findSeg(t, z) { return t.segs[Math.floor(z / L) % t.N]; }

  function newSeg(t, i, y1, y2, curve, theme) {
    const s = {
      index: i, curve, theme, color: Math.floor(i / CFG.rumble) % 2,
      p1: { world: { y: y1, z: i * L }, camera: {}, screen: {} },
      p2: { world: { y: y2, z: (i + 1) * L }, camera: {}, screen: {} },
      sprites: [], cars: [], gate: null, fog: 1, clip: 0
    };
    t.segs.push(s);
    return s;
  }

  // ---------- 賽道建構 ----------
  function makeBuilder(t) {
    let lastY = 0, theme = 0, lastC = 0;
    const add = (curve, y) => { newSeg(t, t.segs.length, lastY, y, curve, theme); lastY = y; lastC = curve; };
    // 從目前的彎度平順過渡到 toCurve(可連續串接成漸緊彎 / 蛇形彎),hill 為這段的高低差
    const seg = (len, toCurve, hill) => {
      len = Math.max(1, Math.round(len)); hill = hill || 0;
      const c0 = lastC, y0 = lastY, y1 = y0 + hill * L;
      for (let n = 0; n < len; n++) add(lerp(c0, toCurve, (1 - Math.cos((n + 1) / len * Math.PI)) / 2), easeInOut(y0, y1, (n + 1) / len));
    };
    const road = (enter, hold, leave, curve, hill) => {
      enter = Math.max(1, Math.round(enter)); hold = Math.max(0, Math.round(hold)); leave = Math.max(1, Math.round(leave));
      const y0 = lastY, y1 = y0 + hill * L, total = enter + hold + leave;
      for (let n = 0; n < enter; n++) add(easeIn(0, curve, n / enter), easeInOut(y0, y1, n / total));
      for (let n = 0; n < hold; n++) add(curve, easeInOut(y0, y1, (enter + n) / total));
      for (let n = 0; n < leave; n++) add(easeInOut(curve, 0, n / leave), easeInOut(y0, y1, (enter + hold + n) / total));
    };
    return { road, seg, get lastY() { return lastY; }, setTheme(v) { theme = v; }, count: () => t.segs.length };
  }

  function buildGame(course, variant) {
    const t = { segs: [], cars: [], cps: [], secStart: [], warn: [], kind: 'game' };
    const b = makeBuilder(t);
    const rand = rng((course.seed ^ (variant || 0)) >>> 0);
    const hillOf = () => ((b.lastY > 1800 ? -1 : b.lastY < -1800 ? 1 : (rand() < 0.5 ? -1 : 1))) * (3 + ((rand() * 9) | 0));

    b.setTheme(course.themes[0]);
    b.road(10, 30, 10, 0, 0);
    for (let s = 0; s < 3; s++) {
      b.setTheme(course.themes[s]);
      t.secStart.push(t.segs.length);
      const start = t.segs.length, target = (FAST ? CFG.sections : (course.sections || CFG.sections))[s];
      if (s > 0) b.road(20, 30, 20, 0, 0);
      let tunnels = 0, lastTunnelEnd = -9999, lastHard = false;
      const mix = course.mix, hairW = 4 * course.hair * (1 + 0.4 * s);
      const table = [['straight', mix.straight], ['gentle', mix.gentle], ['medium', mix.medium], ['bigL', mix.bigL], ['hair', hairW],
        ['sweep', mix.sweep], ['chicane', mix.chicane * (1 + 0.25 * s)], ['trap', mix.trap * (1 + 0.3 * s)], ['crest', mix.crest * (1 + 0.2 * s)],
        ['esses', mix.esses], ['hills', mix.hills], ['tunnel', mix.tunnel]];
      const total = table.reduce((a, e) => a + e[1], 0);
      const HARD = { bigL: 1, hair: 1, trap: 1, crest: 1, chicane: 1 };
      while (t.segs.length - start < target - 100) {
        const dir = rand() < 0.5 ? -1 : 1, n = 40 + ((rand() * 60) | 0);
        const warn = c => { t.warn.push({ idx: t.segs.length, dir: Math.sign(c) }); };
        if (rand() < 0.3) b.road(6, 8 + rand() * 40, 6, 0, 0);   // 隨機的喘息直線,讓彎道的間隔不固定
        let pick = rand() * total, kind = table[0][0];
        for (const e of table) { if (pick < e[1]) { kind = e[0]; break; } pick -= e[1]; }
        if (kind === 'tunnel' && (tunnels >= 2 || t.segs.length - lastTunnelEnd < 450 || t.segs.length - start < 250 || t.segs.length - start + 300 > target - 100)) kind = 'sweep';
        if (HARD[kind] && lastHard && rand() < 0.65) kind = rand() < 0.5 ? 'gentle' : 'medium';   // 避免連續好幾個難彎擠在一起
        lastHard = !!HARD[kind];
        if (kind === 'tunnel') {
          // 隧道:一段暗色封閉路段(平直或微彎),入口出口有門框
          tunnels++;
          const c = rand() < 0.5 ? 0 : dir * (2 + rand() * 1.2);
          b.seg(18, c * 0.5);
          const a = t.segs.length;
          b.seg(course.tunnel * (0.9 + rand() * 0.2), c);
          const sty = (rand() * 3) | 0;   // 三種隧道外觀隨機擇一
          for (let i = a; i < t.segs.length; i++) { t.segs[i].tunnel = true; t.segs[i].tStyle = sty; }
          t.segs[a].tIn = true; t.segs[t.segs.length - 1].tOut = true;
          b.seg(20, 0);
          lastTunnelEnd = t.segs.length;
          continue;
        }
        if (kind === 'straight') b.road(n * 0.3, n * 0.4, n * 0.3, 0, rand() < 0.6 ? hillOf() : 0);
        else if (kind === 'gentle') b.road(n * 0.3, n * 0.5, n * 0.3, dir * (2.2 + rand() * 1.2), rand() < 0.5 ? hillOf() : 0);
        else if (kind === 'medium') b.road(14, 26 + rand() * 16, 14, dir * (4.4 + rand()), rand() < 0.4 ? hillOf() : 0);
        else if (kind === 'bigL') { const c = dir * (6.3 + rand() * 0.8); warn(c); b.road(12, 30 + rand() * 14, 12, c, 0); b.road(15, 25, 15, 0, 0); }
        else if (kind === 'hair') { warn(dir); b.road(12, 30 + rand() * 14, 12, dir * 8.4, 0); b.road(15, 25, 15, 0, 0); }
        else if (kind === 'sweep') {
          // 長彎道:一路持續的大弧線,可帶緩坡
          const c = dir * (2.6 + rand()), len = 110 + rand() * 90;
          b.seg(30, c); b.seg(len, c, rand() < 0.4 ? hillOf() * 0.5 : 0); b.seg(30, 0);
        } else if (kind === 'chicane') {
          // 蛇形連續彎:3~5 個左右交替的短彎
          warn(dir);
          const cnt = 3 + ((rand() * 3) | 0);
          for (let i = 0; i < cnt; i++) { const c = (i % 2 ? -dir : dir) * (3.8 + rand()); b.seg(12, c); b.seg(8 + rand() * 8, c); }
          b.seg(16, 0);
        } else if (kind === 'trap') {
          // 漸緊彎:入口緩、越轉越急
          warn(dir);
          b.seg(26, dir * 2.2); b.seg(26, dir * 3.6); b.seg(24, dir * 5.4); b.seg(20, dir * 7.6); b.seg(24, dir * 7.6); b.seg(26, 0);
        } else if (kind === 'crest') {
          // 坡頂盲彎:爬到坡頂才看見後面的彎
          const h = 8 + ((rand() * 4) | 0);
          warn(dir);
          b.seg(38, 0, h); b.seg(12, dir * (4.5 + rand() * 1.5), -h * 0.55); b.seg(26, dir * 6.5, -h * 0.45); b.seg(22, 0);
        } else if (kind === 'esses') { b.road(15, 25, 15, dir * 4.2, 0); b.road(15, 25, 15, -dir * 4.2, 0); }
        else { const h = 8 + ((rand() * 8) | 0); b.road(20, 30, 20, 0, h); b.road(20, 30, 20, 0, -h); }
      }
      b.road(25, 30, 25, 0, -b.lastY / L);
      b.road(10, 50, 10, 0, 0);
      t.cps.push(t.segs.length);
    }
    b.setTheme(course.themes[2]);
    for (let i = 0; i < 4; i++) b.road(20, 40, 20, 0, 0);

    t.N = t.segs.length; t.length = t.N * L;
    t.goalZ = t.cps[2] * L;
    t.segs[10].gate = 'start';
    t.cps.forEach((c, i) => { t.segs[c].gate = i === 2 ? 'goal' : 'cp'; });
    decorate(t, rand, true, course);
    spawnCars(t, rand, course);
    return t;
  }

  function buildDemo() {
    const t = { segs: [], cars: [], cps: [], secStart: [0], kind: 'demo' };
    const b = makeBuilder(t);
    b.setTheme(0);
    b.road(30, 60, 30, 0, 4); b.road(30, 40, 30, 2.4, -4); b.road(30, 60, 30, 0, 3);
    b.road(30, 40, 30, -2.6, -3); b.road(30, 60, 30, 0, 0);
    b.road(30, 20, 30, 0, 0);
    t.N = t.segs.length; t.length = t.N * L;
    decorate(t, rng(77), false);
    return t;
  }

  // ---------- 物件 ----------
  const SC = [
    { trees: ['sakura', 'treeRound', 'sakura'], bush: ['bush', 'bushFlower'], prop: ['lantern', 'lantern'], sign: true, animal: ['rabbit'] },
    { trees: ['palm', 'palmB', 'palm', 'pine'], bush: ['bushDry'], prop: ['umbrella', 'surfboards', 'lifebuoy'], sign: true, animal: ['crab'] },
    { trees: ['ginkgo', 'pineNight', 'treeNight', 'ginkgo'], bush: ['bushNight'], prop: ['redLantern', 'stall', 'torii', 'lantern'], animal: ['fox'] },
    { trees: ['snowPine', 'snowPineB', 'bareSnow'], bush: ['snowBush'], prop: ['snowman', 'sled', 'igloo'], animal: ['penguin'] },
    { trees: ['snowPineD', 'iceSpire', 'bareSnowD', 'snowPineD'], bush: ['snowBush', 'iceCluster'], prop: ['igloo', 'iceCluster', 'snowman'], animal: ['penguin'] },
    { trees: ['snowPineN', 'xmasTree', 'snowPineN', 'xmasTree'], bush: ['snowBush'], prop: ['giftBox', 'lampPost', 'snowman'], animal: ['rabbit'] },
    { trees: ['lollipopA', 'lollipopB', 'cottonPink', 'cottonBlue', 'lollipopC'], bush: ['gumdropA'], prop: ['cupcake', 'candyCane'], animal: ['gummy'] },
    { trees: ['lollipopD', 'chocoTree', 'chocoTree', 'candyCane'], bush: ['gumdropB'], prop: ['iceCream', 'cookie', 'donut'], animal: ['gummy'] },
    { trees: ['lollipopN', 'lollipopN2', 'lightPole', 'candyCane'], bush: ['gumdropN'], prop: ['popcorn', 'balloon', 'cupcake'], animal: ['gummy'] }
  ];
  const PROPW = { lantern: 420, signBoard: 900, umbrella: 800, redLantern: 420, snowman: 520, igloo: 900, cupcake: 600, candyCane: 420, donut: 800, balloon: 380, surfboards: 620, lifebuoy: 400, stall: 900, torii: 1100, sled: 640, iceCluster: 640, giftBox: 520, lampPost: 340, iceCream: 440, cookie: 560, popcorn: 720 };
  const BIGPROP = { igloo: 0.25, stall: 0.25, torii: 0.3 };
  const OBSW = { poop: 420, rock: 560, snowdrift: 720, iceBlock: 560, jelly: 520, gum: 680 };
  const pick = (a, r) => a[(r() * a.length) | 0];

  function decorate(t, rand, items, course) {
    const segs = t.segs, N = segs.length;
    for (let i = 0; i < N; i++) {
      const s = segs[i], th = SC[s.theme];
      if (s.tunnel) continue;
      if (i % 2 === 0) for (const side of [-1, 1]) {
        if (rand() < 0.72) { const nm = pick(th.trees, rand); s.sprites.push({ name: nm, offset: side * (1.9 + rand() * 2.6), w: (1000 + rand() * 600) * (nm === 'candyCane' ? 0.5 : 1), kind: 'solid', hit: 0.2, crash: true }); }
      }
      if (rand() < 0.2) s.sprites.push({ name: pick(th.bush, rand), offset: (rand() < 0.5 ? -1 : 1) * (1.2 + rand() * 0.6), w: 520 + rand() * 200, kind: 'deco' });
      if (rand() < 0.028) { const nm = pick(th.prop, rand); s.sprites.push({ name: nm, offset: (rand() < 0.5 ? -1 : 1) * (1.35 + rand() * 0.4), w: PROPW[nm], ...(BIGPROP[nm] ? { kind: 'solid', hit: BIGPROP[nm], crash: true } : { kind: 'deco' }) }); }
      if (th.sign && rand() < 0.01) s.sprites.push({ name: 'signBoard', offset: (rand() < 0.5 ? -1 : 1) * (1.35 + rand() * 0.4), w: PROPW.signBoard, kind: 'solid', hit: 0.25, crash: true });
      if (rand() < 0.014) s.sprites.push({ name: pick(th.animal, rand), offset: (rand() < 0.5 ? -1 : 1) * (1.15 + rand() * 0.35), w: 380, kind: 'deco', hop: rand() * 6 });
    }
    if (!items) return;

    const put = (i, sp) => { if (segs[i]) segs[i].sprites.push(sp); };
    const coin = (i, off) => put(i, { name: 'coin', offset: off, w: 300, kind: 'coin', lift: 230, phase: rand() * 6 });
    const dO = course.diff.obs, poopP = [0.06, 0.08, 0.1].map(v => v * dO), rockP = [0.015, 0.025, 0.035].map(v => v * dO);
    for (let sec = 0; sec < 3; sec++) {
      const from = (sec === 0 ? 70 : t.cps[sec - 1] + 50), to = t.cps[sec] - 70;
      let i = from;
      while (i < to) {
        const r = rand(), lane = LANES[(rand() * LANES.length) | 0];
        if (r < 0.33) { const n = 6 + ((rand() * 5) | 0); for (let k = 0; k < n; k++) coin(i + k * 2, lane); i += n * 2; }
        else if (r < 0.48) { const ph = rand() * 6; for (let k = 0; k < 12; k++) coin(i + k * 2, 0.75 * Math.sin(k * 0.55 + ph)); i += 24; }
        else if (r < 0.535) { put(i, { name: 'nitro', offset: lane, w: 300, kind: 'nitro', lift: 260, phase: rand() * 6 }); for (let k = 1; k <= 3; k++) coin(i + k * 2, lane); i += 8; }
        else if (r < 0.595) { put(i, { name: 'missileBox', offset: lane, w: 340, kind: 'missile', lift: 250, phase: rand() * 6 }); for (let k = 1; k <= 3; k++) coin(i + k * 2, lane); i += 8; }
        else if (r < 0.595 + poopP[sec]) put(i, { name: course.obs[0], offset: lane + (rand() - 0.5) * 0.15, w: OBSW[course.obs[0]], kind: course.obs[0] });
        else if (r < 0.595 + poopP[sec] + rockP[sec]) put(i, { name: course.obs[1], offset: lane + (rand() - 0.5) * 0.12, w: OBSW[course.obs[1]], kind: course.obs[1] });
        else { const n = 5 + ((rand() * 4) | 0); for (let k = 0; k < n; k++) coin(i + k * 2, lane); i += n * 2; }
        i += 22 + ((rand() * 26) | 0);
      }
    }
    for (const w of t.warn) {
      for (const back of [55, 38, 22]) if (!(segs[w.idx - back] && segs[w.idx - back].tunnel)) for (const side of [-1, 1]) put(w.idx - back, { name: w.dir > 0 ? 'arrowR' : 'arrowL', offset: side * 1.5, w: 760, kind: 'solid', hit: 0.2, crash: true });
    }
  }

  function spawnCars(t, rand, course) {
    for (let sec = 0; sec < 3; sec++) {
      let z = (sec === 0 ? 90 : t.cps[sec - 1] + 60);
      const end = t.cps[sec] - 90;
      while (z < end) {
        const type = 1 + ((rand() * 3) | 0);
        const c = {
          type, z: z * L, x: LANES[(rand() * LANES.length) | 0] + (rand() - 0.5) * 0.2, baseX: 0,
          speed: [0.30, 0.48, 0.66][type - 1] * course.diff.spd * CFG.maxSpeed * (0.96 + rand() * 0.08), phase: rand() * 6, seg: null, percent: 0
        };
        c.baseX = c.x;
        t.cars.push(c);
        z += CFG.enemyGap * course.diff.gap * (0.7 + rand() * 0.9);
      }
    }
    t.cars.forEach(c => attachCar(t, c));
  }

  function attachCar(t, c) {
    const s = findSeg(t, c.z);
    if (c.seg !== s) {
      if (c.seg) { const k = c.seg.cars.indexOf(c); if (k >= 0) c.seg.cars.splice(k, 1); }
      s.cars.push(c); c.seg = s;
    }
    c.percent = (c.z % L) / L;
  }

  // ---------- 繪製 ----------
  function project(p, cx, cy, cz, hor, XS, YS) {
    p.camera.x = -cx; p.camera.y = p.world.y - cy; p.camera.z = p.world.z - cz;
    const sc = CFG.camDepth / p.camera.z;
    p.screen.scale = sc;
    p.screen.x = Math.round(W / 2 + sc * p.camera.x * XS);
    p.screen.y = Math.round(hor - sc * p.camera.y * YS);
    p.screen.w = Math.round(sc * RH * XS);
  }

  function poly(g, x1, y1, x2, y2, x3, y3, x4, y4, color) {
    g.fillStyle = color; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.lineTo(x4, y4); g.closePath(); g.fill();
  }

  function drawSeg(g, s, th) {
    const p1 = s.p1.screen, p2 = s.p2.screen, c = s.color;
    const x1 = p1.x, y1 = p1.y + 1, w1 = p1.w, x2 = p2.x, y2 = p2.y, w2 = p2.w;
    g.fillStyle = th.grass[c]; g.fillRect(0, y2, W, y1 - y2);
    const r1 = w1 / 6, r2 = w2 / 6;
    poly(g, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, th.rumble[c]);
    poly(g, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, th.rumble[c]);
    poly(g, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, th.road[c]);
    if (c === 0) {
      const lw1 = w1 * 2 / CFG.lanes, lw2 = w2 * 2 / CFG.lanes, m1 = w1 / 32, m2 = w2 / 32;
      let lx1 = x1 - w1 + lw1, lx2 = x2 - w2 + lw2;
      for (let l = 1; l < CFG.lanes; l++, lx1 += lw1, lx2 += lw2) poly(g, lx1 - m1 / 2, y1, lx1 + m1 / 2, y1, lx2 + m2 / 2, y2, lx2 - m2 / 2, y2, th.lane);
    }
    if (s.fog < 1) { g.globalAlpha = 1 - s.fog; g.fillStyle = th.fog; g.fillRect(0, y2, W, y1 - y2); g.globalAlpha = 1; }
  }

  // 道具閃光粒子:金幣 / 氮氣 / 飛彈箱周圍的十字星閃爍,遠處也容易辨識
  const SPARK = { coin: ['#fff7a0', '#ffffff'], nitro: ['#a8f0ff', '#ffffff'], missile: ['#ffb8ff', '#ffffff'] };
  function sparkle(g, sp, time, cx, cy, dw, dh, alpha) {
    const cols = SPARK[sp.kind];
    if (!cols || dw < 5) return;
    const R0 = Math.max(dw, dh) * 0.62;
    g.save(); g.globalAlpha = alpha;
    for (let k = 0; k < 5; k++) {
      const ph = (time * 1.3 + sp.phase * 0.37 + k * 0.2) % 1, tw = Math.sin(ph * Math.PI);
      const a = sp.phase * 3 + k * 2.4 + time * 0.6, rr = R0 * (0.55 + 0.45 * ((k * 37) % 10) / 10);
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.85 - ph * R0 * 0.25, r = Math.max(2, R0 * 0.16) * tw;
      if (r < 0.8) continue;
      g.fillStyle = cols[k % 2];
      g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.28, y - r * 0.28); g.lineTo(x + r, y); g.lineTo(x + r * 0.28, y + r * 0.28);
      g.lineTo(x, y + r); g.lineTo(x - r * 0.28, y + r * 0.28); g.lineTo(x - r, y); g.lineTo(x - r * 0.28, y - r * 0.28); g.closePath(); g.fill();
    }
    g.restore();
  }

  function drawSprite(g, img, scale, sx, sy, worldW, clipY, lift, xs, XS, YS) {
    const fw = scale * XS * worldW;
    const dw = fw * xs, dh = fw * img.height / img.width;
    if (dw < 1.5) return;
    const dx = sx - dw / 2, dy = sy - dh - scale * XS * (CFG.YS / CFG.XS) * lift;
    const clipH = clipY ? Math.max(0, dy + dh - clipY) : 0;
    if (clipH < dh) { g.drawImage(img, 0, 0, img.width, img.height - img.height * clipH / dh, dx, dy, dw, dh - clipH); return { cx: sx, cy: dy + (dh - clipH) / 2, dw: fw, dh: dh - clipH }; }
  }

  // ---------- 隧道(暗色封閉路段:牆 + 天花板 + 燈,入口有門框) ----------
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const mixc = (a, b, k) => { const p = hex(a), q = hex(b); return `rgb(${Math.round(q[0] + (p[0] - q[0]) * k)},${Math.round(q[1] + (p[1] - q[1]) * k)},${Math.round(q[2] + (p[2] - q[2]) * k)})`; };
  const TUN_H = 1400;
  // 三種隧道外觀:0 = 紫色燈廊 / 1 = 岩洞 / 2 = 霓虹光廊
  const TUN_STYLE = [
    { wall: ['#3a3462', '#332d58'], ceil: '#221d42', lit: '#fff1b0' },
    { wall: ['#7a5a44', '#6b4d3a'], ceil: '#3e2c22', lit: '#ffb45c', ring: '#9a8a7a' },
    { wall: ['#1c2350', '#182048'], ceil: '#0f1436', lit: '#7fe8ff', ring: '#2a1f5c', neon: ['#7fe8ff', '#ff4fd0'] }
  ];
  function drawTunnel(g, s, th, XS) {
    const p = s.p1.screen, q = s.p2.screen, k = CFG.YS / CFG.XS, st = TUN_STYLE[s.tStyle || 0];
    const hp = p.scale * XS * k * TUN_H, hq = q.scale * XS * k * TUN_H;
    if (hp < 2) return;
    const f = s.fog, wall = mixc(st.wall[s.color], th.fog, f), ceil = mixc(st.ceil, th.fog, f), lit = mixc(st.lit, th.fog, f);
    const xlp = p.x - p.w * 1.18, xrp = p.x + p.w * 1.18, xlq = q.x - q.w * 1.18, xrq = q.x + q.w * 1.18;
    poly(g, xlp, p.y, xlp, p.y - hp, xlq, q.y - hq, xlq, q.y, wall);
    poly(g, xrp, p.y, xrp, p.y - hp, xrq, q.y - hq, xrq, q.y, wall);
    poly(g, xlp, p.y - hp, xrp, p.y - hp, xrq, q.y - hq, xlq, q.y - hq, ceil);
    if (st.neon) {
      // 霓虹光廊:牆上兩道光帶 + 天花板中線,顏色隨路段交替
      const nc = mixc(st.neon[Math.floor(s.index / 6) % 2], th.fog, f);
      for (const sd of [-1, 1]) {
        const a1 = p.x + sd * p.w * 1.18, a2 = q.x + sd * q.w * 1.18;
        for (const h of [0.3, 0.68]) poly(g, a1, p.y - hp * h, a1, p.y - hp * (h + 0.05), a2, q.y - hq * (h + 0.05), a2, q.y - hq * h, nc);
      }
      const w1 = (xrp - xlp) * 0.035, w2 = (xrq - xlq) * 0.035;
      poly(g, p.x - w1, p.y - hp + 1, p.x + w1, p.y - hp + 1, q.x + w2, q.y - hq + 1, q.x - w2, q.y - hq + 1, nc);
    } else if (s.tStyle === 1) {
      // 岩洞:天花板垂下的鐘乳石 + 稀疏的暖色壁燈
      if (s.index % 3 === 0) {
        const cx = p.x + ((s.index * 37) % 11 - 5) / 5 * p.w * 0.9, sw = p.w * 0.1, sh = hp * (0.1 + ((s.index * 13) % 5) * 0.025);
        poly(g, cx - sw, p.y - hp, cx + sw, p.y - hp, cx, p.y - hp + sh, cx, p.y - hp + sh, mixc('#5a4234', th.fog, f));
      }
      if (s.index % 10 < 2) for (const sd of [-1, 1]) {
        const a1 = p.x + sd * p.w * 1.18, a2 = q.x + sd * q.w * 1.18;
        poly(g, a1, p.y - hp * 0.5, a1, p.y - hp * 0.62, a2, q.y - hq * 0.62, a2, q.y - hq * 0.5, lit);
      }
    } else if (s.index % 8 < 2) {
      const w1 = (xrp - xlp) * 0.16, w2 = (xrq - xlq) * 0.16;
      poly(g, p.x - w1, p.y - hp + 1, p.x + w1, p.y - hp + 1, q.x + w2, q.y - hq + 1, q.x - w2, q.y - hq + 1, lit);
      for (const sd of [-1, 1]) {
        const a1 = p.x + sd * p.w * 1.18, a2 = q.x + sd * q.w * 1.18;
        poly(g, a1, p.y - hp * 0.5, a1, p.y - hp * 0.62, a2, q.y - hq * 0.62, a2, q.y - hq * 0.5, lit);
      }
    }
    if (s.tIn && hp > 8) {
      const ow = p.w * 1.5, ot = p.y - hp * 1.2;
      g.beginPath(); g.rect(p.x - ow, ot, ow * 2, p.y - ot); g.rect(p.x - p.w * 1.18, p.y - hp, p.w * 2.36, hp);
      g.fillStyle = mixc(st.ring || th.rumble[0], th.fog, f); g.fill('evenodd');
      g.lineWidth = Math.max(1, p.w * (st.neon ? 0.04 : 0.02)); g.strokeStyle = st.neon ? mixc(st.neon[1], th.fog, f) : '#40284a'; g.stroke();
      g.strokeRect(p.x - p.w * 1.18, p.y - hp, p.w * 2.36, hp);
    }
  }

  function drawGate(g, s, XS, YS) {
    const p = s.p1.screen, q = s.p2.screen;
    if (s.p1.camera.z <= CFG.camDepth) return;
    const goal = s.gate === 'goal', start = s.gate === 'start';
    for (let k = 0; k < 8; k++) {
      const a = k / 8, b = (k + 1) / 8;
      poly(g, p.x - p.w + p.w * 2 * a, p.y + 1, p.x - p.w + p.w * 2 * b, p.y + 1, q.x - q.w + q.w * 2 * b, q.y, q.x - q.w + q.w * 2 * a, q.y,
        (k + s.index) % 2 ? '#ffffff' : '#2b2833');
    }
    const H1 = p.scale * XS * (CFG.YS / CFG.XS) * 1500, pw = Math.max(3, p.w * 0.1), bh = H1 * 0.3;
    if (H1 < 6) return;
    const top = p.y - H1, col = goal ? '#2b2833' : (start ? '#3ea8ff' : '#ff5c7a');
    for (const side of [-1, 1]) {
      const px = p.x + side * p.w * 1.12;
      g.fillStyle = '#f4f4fa'; g.fillRect(px - pw / 2, top, pw, H1);
      g.fillStyle = col; for (let y = top; y < p.y; y += pw * 2) g.fillRect(px - pw / 2, y, pw, Math.min(pw, p.y - y));
      g.lineWidth = Math.max(1, pw * 0.16); g.strokeStyle = '#40284a'; g.strokeRect(px - pw / 2, top, pw, H1);
    }
    const bx = p.x - p.w * 1.12 - pw / 2, bw = p.w * 2.24 + pw;
    g.fillStyle = col; g.fillRect(bx, top, bw, bh);
    if (goal) {
      g.fillStyle = '#fff'; const n = 14, cw = bw / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) g.fillRect(bx + i * cw, top + j * bh / 2, cw, bh / 2);
    }
    g.lineWidth = Math.max(1, pw * 0.16); g.strokeStyle = '#40284a'; g.strokeRect(bx, top, bw, bh);
    if (bh > 10) {
      g.font = `900 ${Math.max(7, bh * 0.5)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const label = goal ? 'GOAL' : (start ? 'START' : 'CHECK POINT');
      g.lineWidth = Math.max(2, bh * 0.14); g.lineJoin = 'round';
      g.strokeStyle = goal ? '#40284a' : '#40284a'; g.strokeText(label, p.x, top + bh / 2 + 1);
      g.fillStyle = goal ? '#ffd23f' : '#ffffff'; g.fillText(label, p.x, top + bh / 2 + 1);
    }
  }

  function render(g, t, cam) {
    const hor = cam.hor === undefined ? CFG.horizon : cam.hor;
    const XS = cam.XS || CFG.XS, YS = cam.YS || CFG.YS;
    const pz = cam.playerZ === undefined ? CFG.playerZ : cam.playerZ;
    const time = cam.time || 0;
    const N = t.N, len = t.length, segs = t.segs;
    let pos = cam.pos;
    if (t.kind === 'demo') pos = ((pos % len) + len) % len;
    const bi = Math.floor(pos / L) % N, bs = segs[bi], bp = (pos % L) / L;
    const ps = segs[Math.floor((pos + pz) / L) % N], pp = ((pos + pz) % L) / L;
    const py = lerp(ps.p1.world.y, ps.p2.world.y, pp);
    const camY = (cam.camH || CFG.camH) + py;
    const dd = cam.drawDist || CFG.drawDist;
    let maxy = H, xacc = 0, dx = -(bs.curve * bp);

    g.fillStyle = THEMES[cam.themeOverride !== undefined ? cam.themeOverride : bs.theme].grass[0];
    g.fillRect(0, hor, W, H - hor);

    for (let n = 0; n < dd; n++) {
      const s = segs[(bi + n) % N];
      const camZ = pos - (s.index < bi ? len : 0);
      project(s.p1, cam.x * RH - xacc, camY, camZ, hor, XS, YS);
      project(s.p2, cam.x * RH - xacc - dx, camY, camZ, hor, XS, YS);
      xacc += dx; dx += s.curve;
      s.fog = 1 / Math.exp((n / dd) * (n / dd) * FOG);
      s.clip = maxy;
      if (s.p1.camera.z <= CFG.camDepth || s.p2.screen.y >= s.p1.screen.y || s.p2.screen.y >= maxy) { s.hid = true; continue; }
      s.hid = false;
      drawSeg(g, s, THEMES[s.theme]);
      if (s.tunnel) { g.fillStyle = 'rgba(12,8,36,.4)'; g.fillRect(0, s.p2.screen.y, W, s.p1.screen.y + 1 - s.p2.screen.y); }
      maxy = s.p1.screen.y;
    }

    for (let n = dd - 1; n > 0; n--) {
      const s = segs[(bi + n) % N];
      if (s.p1.camera.z <= CFG.camDepth) continue;
      if (s.tunnel && !s.hid) drawTunnel(g, s, THEMES[s.theme], XS);
      if (s.gate) { const ga = clamp(s.fog * 1.5 - 0.1, 0, 1); if (ga > 0.03) { g.save(); g.globalAlpha = ga; drawGate(g, s, XS, YS); g.restore(); } }
      const sc1 = s.p1.screen;
      for (const sp of s.sprites) {
        if (sp.taken) continue;
        const img = Spr.get(sp.name);
        let lift = sp.lift || 0, xs = 1;
        if (sp.kind === 'coin') xs = 0.18 + 0.82 * Math.abs(Math.cos(time * 4.5 + sp.phase));
        else if (sp.kind === 'nitro') lift += Math.sin(time * 4 + sp.phase) * 40;
        else if (sp.hop !== undefined) lift = Math.abs(Math.sin(time * 5 + sp.hop)) * 170;
        const dr = drawSprite(g, img, sc1.scale, sc1.x + sc1.w * sp.offset, sc1.y, sp.w, s.clip, lift, xs, XS, YS);
        if (dr && SPARK[sp.kind]) sparkle(g, sp, time, dr.cx, dr.cy, dr.dw, dr.dh, clamp(s.fog * 2, 0.4, 1));
      }
      for (const c of s.cars) {
        const a = s.p1.screen, b = s.p2.screen, sc = lerp(a.scale, b.scale, c.percent);
        const sx = lerp(a.x, b.x, c.percent) + sc * c.x * RH * XS, sy = lerp(a.y, b.y, c.percent);
        drawSprite(g, Spr.get((c.front ? 'enemyF' : 'enemy') + c.type), sc, sx, sy, 640, s.clip, 0, 1, XS, YS);
      }
    }

    if (t.missiles) {
      for (const m of t.missiles) {
        const di = Math.floor(m.z / L) - bi;
        if (di < 1 || di >= dd) continue;
        const s = segs[Math.floor(m.z / L) % N];
        if (s.p1.camera.z <= CFG.camDepth) continue;
        const pc = (m.z % L) / L, a = s.p1.screen, b = s.p2.screen, sc = lerp(a.scale, b.scale, pc);
        drawSprite(g, Spr.get(m.sprite), sc, lerp(a.x, b.x, pc) + sc * m.x * RH * XS, lerp(a.y, b.y, pc), 380, s.clip, 120, 1, XS, YS);
      }
    }

    return {
      ps, pp, py,
      playerY: hor - (CFG.camDepth / pz * lerp(ps.p1.camera.y, ps.p2.camera.y, pp) * YS),
      curve: ps.curve
    };
  }

  return { build: (k, course, variant) => (k === 'demo' ? buildDemo() : buildGame(course, variant)), render, findSeg, attachCar, LANES };
})();
