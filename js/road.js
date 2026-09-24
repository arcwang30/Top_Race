'use strict';

// 偽 3D 賽道:建構(賽道 / 物件 / 敵車)與繪製
const Road = (() => {
  const L = CFG.segLen, RH = CFG.roadHalf;
  const LANES = [-0.62, 0, 0.62];
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
    let lastY = 0, theme = 0;
    const add = (curve, y) => { newSeg(t, t.segs.length, lastY, y, curve, theme); lastY = y; };
    const road = (enter, hold, leave, curve, hill) => {
      enter = Math.max(1, Math.round(enter)); hold = Math.max(0, Math.round(hold)); leave = Math.max(1, Math.round(leave));
      const y0 = lastY, y1 = y0 + hill * L, total = enter + hold + leave;
      for (let n = 0; n < enter; n++) add(easeIn(0, curve, n / enter), easeInOut(y0, y1, n / total));
      for (let n = 0; n < hold; n++) add(curve, easeInOut(y0, y1, (enter + n) / total));
      for (let n = 0; n < leave; n++) add(easeInOut(curve, 0, n / leave), easeInOut(y0, y1, (enter + hold + n) / total));
    };
    return { road, get lastY() { return lastY; }, setTheme(v) { theme = v; }, count: () => t.segs.length };
  }

  function buildGame(course) {
    const t = { segs: [], cars: [], cps: [], secStart: [], warn: [], kind: 'game' };
    const b = makeBuilder(t);
    const rand = rng(course.seed);
    const hillOf = () => (rand() < 0.5 ? -1 : 1) * (3 + ((rand() * 9) | 0));
    const hairP = [0.05, 0.08, 0.12].map(v => v * course.hair);

    b.road(10, 30, 10, 0, 0);
    for (let s = 0; s < 3; s++) {
      b.setTheme(course.themes[s]);
      t.secStart.push(t.segs.length);
      const start = t.segs.length, target = CFG.sections[s];
      if (s > 0) b.road(20, 30, 20, 0, 0);
      while (t.segs.length - start < target - 100) {
        const r = rand(), dir = rand() < 0.5 ? -1 : 1, n = 40 + ((rand() * 60) | 0);
        const warn = c => { t.warn.push({ idx: t.segs.length, dir: Math.sign(c) }); };
        if (r < 0.14) b.road(n * 0.3, n * 0.4, n * 0.3, 0, rand() < 0.6 ? hillOf() : 0);
        else if (r < 0.30) b.road(n * 0.3, n * 0.5, n * 0.3, dir * (2.2 + rand() * 1.2), rand() < 0.5 ? hillOf() : 0);
        else if (r < 0.46) b.road(14, 26 + rand() * 16, 14, dir * (4.4 + rand()), rand() < 0.4 ? hillOf() : 0);
        else if (r < 0.72) { const c = dir * (6.3 + rand() * 0.8); warn(c); b.road(12, 30 + rand() * 14, 12, c, 0); b.road(15, 25, 15, 0, 0); }
        else if (r < 0.72 + hairP[s]) { warn(dir); b.road(12, 30 + rand() * 14, 12, dir * 8.4, 0); b.road(15, 25, 15, 0, 0); }
        else if (r < 0.92) { b.road(15, 25, 15, dir * 4.2, 0); b.road(15, 25, 15, -dir * 4.2, 0); }
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
    spawnCars(t, rand);
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
    { trees: ['sakura', 'treeRound', 'sakura'], bush: ['bush', 'bushFlower'], prop: ['lantern', 'signBoard'], animal: ['rabbit'] },
    { trees: ['palm', 'palm', 'pine'], bush: ['bushDry'], prop: ['umbrella', 'signBoard'], animal: ['crab'] },
    { trees: ['pineNight', 'pineNight', 'treeNight'], bush: ['bushNight'], prop: ['redLantern', 'lantern'], animal: ['fox'] },
    { trees: ['snowPine', 'snowPineB', 'snowPine'], bush: ['snowBush'], prop: ['snowman', 'igloo'], animal: ['penguin'] },
    { trees: ['snowPineD', 'snowPineD', 'snowPineB'], bush: ['snowBush'], prop: ['igloo', 'snowman'], animal: ['penguin'] },
    { trees: ['snowPineN', 'snowPineN', 'xmasTree'], bush: ['snowBush'], prop: ['snowman', 'redLantern'], animal: ['rabbit'] },
    { trees: ['lollipopA', 'lollipopB', 'lollipopC'], bush: ['gumdropA'], prop: ['cupcake', 'candyCane'], animal: ['gummy'] },
    { trees: ['lollipopD', 'candyCane', 'lollipopD'], bush: ['gumdropB'], prop: ['donut', 'candyCane'], animal: ['gummy'] },
    { trees: ['lollipopN', 'lollipopN2', 'candyCane'], bush: ['gumdropN'], prop: ['balloon', 'cupcake'], animal: ['gummy'] }
  ];
  const PROPW = { lantern: 420, signBoard: 900, umbrella: 800, redLantern: 420, snowman: 520, igloo: 900, cupcake: 600, candyCane: 420, donut: 800, balloon: 380 };
  const OBSW = { poop: 420, rock: 560, snowdrift: 720, iceBlock: 560, jelly: 520, gum: 680 };
  const pick = (a, r) => a[(r() * a.length) | 0];

  function decorate(t, rand, items, course) {
    const segs = t.segs, N = segs.length;
    for (let i = 0; i < N; i++) {
      const s = segs[i], th = SC[s.theme];
      if (i % 3 === 0) for (const side of [-1, 1]) {
        if (rand() < 0.6) { const nm = pick(th.trees, rand); s.sprites.push({ name: nm, offset: side * (1.9 + rand() * 2.6), w: (1000 + rand() * 600) * (nm === 'candyCane' ? 0.5 : 1), kind: 'solid', hit: 0.2 }); }
      }
      if (rand() < 0.09) s.sprites.push({ name: pick(th.bush, rand), offset: (rand() < 0.5 ? -1 : 1) * (1.2 + rand() * 0.6), w: 520 + rand() * 200, kind: 'deco' });
      if (rand() < 0.02) { const nm = pick(th.prop, rand); s.sprites.push({ name: nm, offset: (rand() < 0.5 ? -1 : 1) * (1.35 + rand() * 0.4), w: PROPW[nm], kind: 'deco' }); }
      if (rand() < 0.014) s.sprites.push({ name: pick(th.animal, rand), offset: (rand() < 0.5 ? -1 : 1) * (1.15 + rand() * 0.35), w: 380, kind: 'deco', hop: rand() * 6 });
    }
    if (!items) return;

    const put = (i, sp) => { if (segs[i]) segs[i].sprites.push(sp); };
    const coin = (i, off) => put(i, { name: 'coin', offset: off, w: 300, kind: 'coin', lift: 230, phase: rand() * 6 });
    const poopP = [0.06, 0.08, 0.1], rockP = [0.015, 0.025, 0.035];
    for (let sec = 0; sec < 3; sec++) {
      const from = (sec === 0 ? 70 : t.cps[sec - 1] + 50), to = t.cps[sec] - 70;
      let i = from;
      while (i < to) {
        const r = rand(), lane = LANES[(rand() * 3) | 0];
        if (r < 0.33) { const n = 6 + ((rand() * 5) | 0); for (let k = 0; k < n; k++) coin(i + k * 2, lane); i += n * 2; }
        else if (r < 0.48) { const ph = rand() * 6; for (let k = 0; k < 12; k++) coin(i + k * 2, 0.62 * Math.sin(k * 0.55 + ph)); i += 24; }
        else if (r < 0.6) { put(i, { name: 'nitro', offset: lane, w: 300, kind: 'nitro', lift: 260, phase: rand() * 6 }); for (let k = 1; k <= 3; k++) coin(i + k * 2, lane); i += 8; }
        else if (r < 0.6 + poopP[sec]) put(i, { name: course.obs[0], offset: lane + (rand() - 0.5) * 0.15, w: OBSW[course.obs[0]], kind: course.obs[0] });
        else if (r < 0.6 + poopP[sec] + rockP[sec]) put(i, { name: course.obs[1], offset: lane + (rand() - 0.5) * 0.12, w: OBSW[course.obs[1]], kind: course.obs[1] });
        else { const n = 5 + ((rand() * 4) | 0); for (let k = 0; k < n; k++) coin(i + k * 2, lane); i += n * 2; }
        i += 22 + ((rand() * 26) | 0);
      }
    }
    for (const w of t.warn) {
      for (const back of [55, 38, 22]) for (const side of [-1, 1]) put(w.idx - back, { name: w.dir > 0 ? 'arrowR' : 'arrowL', offset: side * 1.5, w: 760, kind: 'deco' });
    }
  }

  function spawnCars(t, rand) {
    for (let sec = 0; sec < 3; sec++) {
      let z = (sec === 0 ? 90 : t.cps[sec - 1] + 60);
      const end = t.cps[sec] - 90;
      while (z < end) {
        const type = 1 + ((rand() * 3) | 0);
        const c = {
          type, z: z * L, x: LANES[(rand() * 3) | 0] + (rand() - 0.5) * 0.2, baseX: 0,
          speed: [0.30, 0.48, 0.66][type - 1] * CFG.maxSpeed * (0.96 + rand() * 0.08), phase: rand() * 6, seg: null, percent: 0
        };
        c.baseX = c.x;
        t.cars.push(c);
        z += CFG.enemyGap * (0.7 + rand() * 0.9);
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

  function drawSprite(g, img, scale, sx, sy, worldW, clipY, lift, xs, XS, YS) {
    const fw = scale * XS * worldW;
    const dw = fw * xs, dh = fw * img.height / img.width;
    if (dw < 1.5) return;
    const dx = sx - dw / 2, dy = sy - dh - scale * YS * lift;
    const clipH = clipY ? Math.max(0, dy + dh - clipY) : 0;
    if (clipH < dh) g.drawImage(img, 0, 0, img.width, img.height - img.height * clipH / dh, dx, dy, dw, dh - clipH);
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
    const H1 = p.scale * YS * 1500, pw = Math.max(3, p.w * 0.1), bh = H1 * 0.3;
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
    const camY = CFG.camH + py;
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
      if (s.p1.camera.z <= CFG.camDepth || s.p2.screen.y >= s.p1.screen.y || s.p2.screen.y >= maxy) continue;
      drawSeg(g, s, THEMES[s.theme]);
      maxy = s.p1.screen.y;
    }

    for (let n = dd - 1; n > 0; n--) {
      const s = segs[(bi + n) % N];
      if (s.p1.camera.z <= CFG.camDepth) continue;
      if (s.gate) drawGate(g, s, XS, YS);
      const sc1 = s.p1.screen;
      for (const sp of s.sprites) {
        if (sp.taken) continue;
        const img = Spr.get(sp.name);
        let lift = sp.lift || 0, xs = 1;
        if (sp.kind === 'coin') xs = 0.18 + 0.82 * Math.abs(Math.cos(time * 4.5 + sp.phase));
        else if (sp.kind === 'nitro') lift += Math.sin(time * 4 + sp.phase) * 40;
        else if (sp.hop !== undefined) lift = Math.abs(Math.sin(time * 5 + sp.hop)) * 170;
        drawSprite(g, img, sc1.scale, sc1.x + sc1.w * sp.offset, sc1.y, sp.w, s.clip, lift, xs, XS, YS);
      }
      for (const c of s.cars) {
        const a = s.p1.screen, b = s.p2.screen, sc = lerp(a.scale, b.scale, c.percent);
        const sx = lerp(a.x, b.x, c.percent) + sc * c.x * RH * XS, sy = lerp(a.y, b.y, c.percent);
        drawSprite(g, Spr.get('enemy' + c.type), sc, sx, sy, 640, s.clip, 0, 1, XS, YS);
      }
    }

    return {
      ps, pp, py,
      playerY: hor - (CFG.camDepth / pz * lerp(ps.p1.camera.y, ps.p2.camera.y, pp) * YS),
      curve: ps.curve
    };
  }

  return { build: (k, course) => (k === 'demo' ? buildDemo() : buildGame(course)), render, findSeg, attachCar, LANES };
})();
