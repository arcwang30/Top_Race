'use strict';

const OBS_FX = { poop: 'slip', rock: 'crash', snowdrift: 'mud', iceBlock: 'crash', jelly: 'bounce', gum: 'stuck' };

const Game = {
  track: null,
  s: null,
  info: null,
  result: null,
  CRASH_T: 2.0,
  SLIP_T: 1.5,

  courseId: 0,
  BOUNCE_T: 1.0,

  newRun() {
    this.course = COURSES[this.courseId] || COURSES[0];
    this.track = Road.build('game', this.course);
    this.result = null;
    this.s = {
      pos: 0, x: 0, speed: 0, nitro: 1, nitroT: 0, slipT: 0, slipDir: 1, crashT: 0, invT: 0, shake: 0,
      mudT: 0, mudCap: 1, bounceT: 0,
      sc: { dist: 0, drift: 0, coin: 0, cp: 0, time: 0, clear: 0 }, coins: 0,
      time: CFG.startTime, elapsed: 0, phase: 'countdown', countT: 3.6, cp: 0, stage: 1,
      drift: false, bg: [0, 0, 0], bgTheme: this.course.themes[0], bgPrev: this.course.themes[0], bgFade: 0,
      toast: null, pops: [], parts: [], fly: [], wheel: 0, t: 0, endT: 0, tickSec: -1, bumpCool: 0, treeCool: 0
    };
  },

  total() {
    const c = this.s.sc;
    return Math.min(SCORE.max, Math.floor(c.dist + c.drift + c.coin + c.cp + c.time + c.clear));
  },

  toast(text, sub, dur, color, size) { this.s.toast = { text, sub, dur: dur || 1.6, t: 0, color: color || '#fff', size: size || 64 }; },
  pop(text, color) { this.s.pops.push({ text, t: 0, color: color || '#ffe680', x: W / 2 + (Math.random() - 0.5) * 60 }); },

  update(dt) {
    const s = this.s, T = this.track, C = CFG, L = C.segLen;
    s.t += dt;
    if (s.toast && (s.toast.t += dt) > s.toast.dur) s.toast = null;
    s.pops.forEach(p => { p.t += dt; }); s.pops = s.pops.filter(p => p.t < 1.1);
    s.shake = Math.max(0, s.shake - dt * 1.6);
    s.invT = Math.max(0, s.invT - dt); s.bumpCool = Math.max(0, s.bumpCool - dt); s.treeCool = Math.max(0, s.treeCool - dt);

    if (s.phase === 'countdown') {
      const prev = Math.ceil(s.countT);
      s.countT -= dt;
      const cur = Math.ceil(s.countT);
      if (cur !== prev && cur > 0 && cur <= 3) Sound.play('beep');
      if (s.countT <= 0) { s.phase = 'play'; Sound.play('go'); this.toast('GO!', '', 1.0, '#ffd23f', 120); }
    }
    const playing = s.phase === 'play';
    const inp = Input;

    // ---- 計時 ----
    if (playing) {
      s.time -= dt; s.elapsed += dt;
      const sec = Math.ceil(s.time);
      if (s.time <= 10 && sec !== s.tickSec && s.time > 0) { s.tickSec = sec; Sound.play('tick'); }
      if (s.time <= 0) {
        s.time = 0; s.phase = 'timeup'; s.endT = 0;
        this.toast('TIME UP', 'GAME OVER', 4, '#ff5c7a', 84);
        Sound.play('crash');
      }
    }

    // ---- 操作 ----
    const canCtl = playing && s.crashT <= 0;
    const thr = canCtl && inp.throttle, brk = canCtl && inp.brake;
    const steer = (canCtl && s.slipT <= 0 && s.bounceT <= 0) ? inp.steer : 0;
    if (canCtl && inp.was('nitro') && s.nitro > 0 && s.nitroT <= 0) {
      s.nitro--; s.nitroT = C.nitroTime; s.slipT = 0; s.shake = 0.35; Sound.play('nitro');
      this.toast('NITRO!', '無敵衝刺!', 1.0, '#7fe4ff', 72);
    }
    if (s.nitroT > 0) s.nitroT = Math.max(0, s.nitroT - dt);
    if (s.bounceT > 0) s.bounceT -= dt;
    if (s.mudT > 0) s.mudT -= dt;
    const boosting = s.nitroT > 0;

    let pct = s.speed / C.maxSpeed; const p0 = pct;
    const off = Math.abs(s.x) > 1.0;
    s.drift = canCtl && s.slipT <= 0 && thr && brk && Math.abs(steer) > 0.25 && pct > 0.35;

    // ---- 速度 ----
    if (s.crashT > 0) {
      pct = Math.max(0, pct - 1.6 * dt);
    } else if (s.phase === 'goal' || s.phase === 'timeup') {
      pct = Math.max(0, pct - (s.phase === 'goal' ? 0.45 : 0.3) * dt);
    } else if (s.phase === 'play') {
      if (s.slipT > 0) pct = Math.max(0.3, pct - 0.3 * dt);
      else if (boosting && !brk && !off) pct = Math.min(1, pct + (C.accel + C.nitroAccel) * dt);
      else if (s.drift) pct = Math.max(0.3, pct - 0.045 * dt);
      else if (thr && !brk) { if (pct < C.normalMax) pct = Math.min(C.normalMax, pct + C.accel * dt); }
      else if (brk && !thr) pct -= C.brake * dt;
      else if (thr && brk) pct -= 0.22 * dt;
      else pct -= C.coast * dt;
      if (!boosting && pct > C.normalMax) pct = Math.max(C.normalMax, pct - 0.25 * dt);
    }
    if (off && pct > C.offroadLimit && s.phase !== 'goal') pct = Math.max(C.offroadLimit, pct - C.offroadDecel * dt);
    pct = clamp(pct, 0, 1);
    if (s.mudT > 0 && pct > s.mudCap) pct = Math.max(s.mudCap, Math.min(pct, p0) - 1.5 * dt);
    s.speed = pct * C.maxSpeed;

    // ---- 橫移 / 離心力 / 打滑 ----
    const seg = Road.findSeg(T, s.pos + C.playerZ);
    const dxs = dt * C.steerRate * (0.3 + 0.7 * pct) * (s.drift ? 1.6 : 1);
    s.x += steer * dxs;
    if (s.crashT <= 0) s.x -= dxs * pct * seg.curve * C.centrifugal * (s.drift ? 0.35 : 1);
    if (s.slipT > 0) { s.slipT -= dt; s.x += s.slipDir * dt * (0.5 + pct * 1.2); }
    if (s.crashT > 0) {
      s.crashT -= dt;
      if (s.crashT <= 0) { s.invT = 1.6; s.nitroT = 0; s.x = clamp(s.x, -0.7, 0.7); s.slipT = 0; }
    }
    if (Math.abs(s.x) > 2.6) { s.x = clamp(s.x, -2.6, 2.6); if (pct > 0.3 && s.treeCool <= 0) { s.speed *= 0.7; s.treeCool = 0.4; s.shake = 0.3; Sound.play('bump'); } }

    // ---- 位置 ----
    const oldZ = s.pos + C.playerZ;
    s.pos += s.speed * dt;
    const newZ = s.pos + C.playerZ;
    s.wheel += s.speed * dt * 0.012;

    // ---- 得分 ----
    if (playing || s.phase === 'goal') s.sc.dist += (s.speed * dt / L) * SCORE.perSeg;
    if (s.drift) {
      s.sc.drift += SCORE.drift * dt;
      if (Math.random() < 0.08) Sound.play('drift');
    }

    this.collide(oldZ, newZ, playing);
    this.updateCars(dt, newZ);

    // ---- 檢查點 / 終點 ----
    if (playing) {
      while (s.cp < 3 && newZ >= T.cps[s.cp] * L) {
        const i = s.cp++;
        if (i < 2) {
          s.time += C.bonusTime[i]; s.sc.cp += SCORE.cp; s.stage = i + 2;
          this.toast('CHECK POINT!', tr('TIME +{0} 秒', C.bonusTime[i]), 2.2, '#ffe680', 60);
          Sound.play('checkpoint');
          Sound.music(this.course.music[i + 1]);
        } else {
          s.phase = 'goal'; s.endT = 0;
          s.sc.time = Math.floor(s.time) * SCORE.timeBonus; s.sc.clear = SCORE.clear;
          this.toast('GOAL!', '恭喜完賽!', 9.5, '#ffd23f', 100);
          Sound.stopMusic(); Sound.play('checkpoint');
        }
      }
    }

    // ---- 結束 ----
    if (s.phase === 'timeup' || s.phase === 'goal') {
      s.endT += dt;
      if (s.phase === 'goal' && s.endT > 5.6 && !s.cheered) { s.cheered = true; Sound.play('cheer'); }
      const skip = s.phase === 'goal' && s.endT > 6 && (Input.was('confirm') || Input.taps.length > 0);
      if (skip || s.endT > (s.phase === 'goal' ? 10 : 3.4)) this.finish(s.phase === 'goal');
    }

    // ---- 背景視差 ----
    const th = seg.theme;
    if (th !== s.bgTheme) { s.bgPrev = s.bgTheme; s.bgTheme = th; s.bgFade = 1; }
    s.bgFade = Math.max(0, s.bgFade - dt / 1.3);
    for (let i = 0; i < 3; i++) s.bg[i] += seg.curve * pct * dt * 900 * BG.FACTORS[i];

    this.fx(dt, pct, boosting, off);
    Sound.setLoops({ on: s.phase !== 'over', pct, boost: boosting, drift: s.drift, off: off && pct > 0.15 });
  },

  collide(oldZ, newZ, playing) {
    const s = this.s, T = this.track, L = CFG.segLen, RH = CFG.roadHalf;
    const i0 = Math.floor(oldZ / L), i1 = Math.floor(newZ / L);
    const inv = s.nitroT > 0;
    for (let i = i0; i <= i1; i++) {
      const sg = T.segs[i % T.N];
      for (const sp of sg.sprites) {
        if (sp.taken || sp.kind === 'deco') continue;
        const hw = (sp.kind === 'solid' ? sp.hit : sp.w / RH / 2 * 0.85) + 0.24;
        if (Math.abs(s.x - sp.offset) > hw) continue;
        if (sp.kind === 'coin') {
          sp.taken = true; s.coins++; s.sc.coin += SCORE.coin; Sound.play('coin'); this.pop('+' + SCORE.coin);
        } else if (sp.kind === 'nitro') {
          sp.taken = true; Sound.play('nitroGet');
          if (s.nitro < CFG.nitroMax) { s.nitro++; this.pop('NITRO +1', '#7fe4ff'); }
          else { s.sc.coin += SCORE.bottleFull; this.pop('+' + SCORE.bottleFull, '#7fe4ff'); }
        } else if (OBS_FX[sp.kind] && inv) {
          sp.taken = true; this.smash(sp.name, sp.offset, 130, 500);
        } else if (OBS_FX[sp.kind] && playing && s.invT <= 0 && s.crashT <= 0) {
          const fx = OBS_FX[sp.kind];
          if (fx === 'slip' && s.slipT > 0) continue;
          sp.taken = true;
          if (fx === 'slip') {
            s.slipT = this.SLIP_T; s.slipDir = s.x > sp.offset ? 1 : -1; s.shake = 0.25;
            Sound.play('slip'); this.toast('打滑!', '', 1.0, '#c78a4a', 60);
          } else if (fx === 'crash') {
            s.crashT = this.CRASH_T; s.slipT = 0; s.bounceT = 0; s.shake = 0.9; s.nitroT = 0;
            Sound.play('crash'); this.toast('翻車!', '', 1.4, '#ff5c7a', 72);
          } else if (fx === 'mud') {
            s.mudT = 1.4; s.mudCap = 0.3; s.shake = 0.3;
            Sound.play('mud'); this.toast('陷入雪堆!', '', 1.0, '#bfe8ff', 56);
          } else if (fx === 'stuck') {
            s.mudT = 1.6; s.mudCap = 0.1; s.shake = 0.3;
            Sound.play('mud'); this.toast('被黏住了!', '', 1.2, '#ff8fc8', 56);
          } else if (fx === 'bounce') {
            s.bounceT = this.BOUNCE_T; s.speed *= 0.7; s.slipT = 0; s.shake = 0.4;
            Sound.play('bounce'); this.toast('彈飛!', '', 1.0, '#ff9fe6', 64);
          }
        } else if (sp.kind === 'solid' && !inv && s.treeCool <= 0 && s.speed > 800) {
          s.treeCool = 0.5; s.speed *= 0.35; s.shake = 0.5;
          s.x = sp.offset - Math.sign(sp.offset) * (sp.hit + 0.3); Sound.play('bump');
        }
      }
      for (const c of sg.cars.slice()) {
        if (inv) {
          if (Math.abs(c.x - s.x) > 0.55 || Math.abs(newZ - c.z) > 320) continue;
          c.dead = true; sg.cars.splice(sg.cars.indexOf(c), 1);
          this.smash('enemy' + c.type, c.x, 170, 2000);
          continue;
        }
        if (s.speed <= c.speed || Math.abs(c.x - s.x) > 0.5 || s.bumpCool > 0) continue;
        if (Math.abs(newZ - c.z) > 240) continue;
        s.speed = c.speed * 0.9;
        s.pos = c.z - CFG.playerZ - 250;
        const dir = s.x >= c.x ? 1 : -1;
        s.x += dir * 0.22; c.x -= dir * 0.18;
        s.bumpCool = 0.35; s.shake = 0.5; Sound.play('bump');
      }
    }
  },

  smash(name, off, w, pts) {
    const s = this.s, y = this.info ? this.info.playerY : 850;
    const x = W / 2 + clamp((off - s.x) * 250, -220, 220);
    const dir = (off - s.x) >= 0 ? 1 : -1;
    s.fly.push({ img: Spr.get(name), x, y: y - 90, vx: dir * (260 + Math.random() * 260), vy: -650 - Math.random() * 250, rot: 0, vr: dir * (8 + Math.random() * 6), w, t: 0 });
    s.sc.coin += pts; this.pop('SMASH! +' + pts, '#ffd23f');
    s.shake = Math.max(s.shake, 0.35); Sound.play('bump');
    for (let i = 0; i < 14; i++) s.parts.push({ x, y: y - 90, vx: (Math.random() - 0.5) * 520, vy: -Math.random() * 420, life: 0.55, max: 0.55, r: 4, color: Math.random() < 0.5 ? '#fff3a0' : '#7fe4ff', star: true });
  },

  updateCars(dt, pz) {
    const s = this.s, T = this.track;
    for (const c of T.cars) {
      if (c.dead) continue;
      const rel = c.z - pz;
      if (rel > CFG.drawDist * CFG.segLen * 1.2 || rel < -6000) continue;
      c.z += c.speed * dt;
      if (c.type === 2) c.x = clamp(c.baseX + 0.5 * Math.sin(s.t * 1.4 + c.phase), -0.8, 0.8);
      else if (c.type === 3) {
        const target = (rel > 0 && rel < 4800) ? s.x : c.baseX;
        c.x = clamp(c.x + clamp(target - c.x, -0.6 * dt, 0.6 * dt), -0.8, 0.8);
      }
      if (c.z >= T.N * CFG.segLen - 400) c.z = T.N * CFG.segLen - 400;
      Road.attachCar(T, c);
    }
  },

  fx(dt, pct, boosting, off) {
    const s = this.s, y = (this.info ? this.info.playerY : 850);
    const emit = (x, yy, vx, vy, life, r, color) => s.parts.push({ x, y: yy, vx, vy, life, max: life, r, color });
    if (s.drift) {
      for (const sx of [-58, 58]) {
        emit(W / 2 + sx, y - 6, (Math.random() - 0.5) * 60 - Math.sign(Input.steer) * 40, -30 - Math.random() * 40, 0.6, 12 + Math.random() * 10, 'rgba(255,255,255,.7)');
        if (Math.random() < 0.5) emit(W / 2 + sx, y - 8, (Math.random() - 0.5) * 220, -80 - Math.random() * 120, 0.35, 3, '#ffd23f');
      }
    }
    if (off && pct > 0.12) {
      for (const sx of [-58, 58]) emit(W / 2 + sx, y - 6, (Math.random() - 0.5) * 120, -60 - Math.random() * 80, 0.5, 8 + Math.random() * 8, THEMES[s.bgTheme].grass[1]);
    }
    if (s.phase === 'goal' && s.endT > 2.2) {
      s.fwT = (s.fwT || 0) - dt;
      if (s.fwT <= 0) {
        s.fwT = 0.3 + Math.random() * 0.4;
        const fx0 = 70 + Math.random() * 400, fy0 = 110 + Math.random() * 230;
        const cols = [['#ff5c7a', '#ffd23f'], ['#7fe4ff', '#ffffff'], ['#8dff8a', '#ffe680'], ['#d6b3ff', '#ff9fe6']][(Math.random() * 4) | 0];
        const n = 46, sp0 = 130 + Math.random() * 90;
        for (let q = 0; q < n; q++) {
          const a = q / n * TAU, v = sp0 * (0.6 + Math.random() * 0.5);
          s.parts.push({ x: fx0, y: fy0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1.3, max: 1.3, r: 3.2, color: cols[q % 2], fw: true });
        }
        Sound.play('firework');
      }
      for (let k = 0; k < 2; k++) {
        const cols = ['#ff5c7a', '#ffd23f', '#7fe4ff', '#8dff8a', '#d6b3ff'];
        s.parts.push({ x: Math.random() * W, y: -10, vx: (Math.random() - 0.5) * 60, vy: 90 + Math.random() * 160, life: 3.2, max: 3.2, r: 5, color: cols[(Math.random() * 5) | 0], conf: true });
      }
    }
    s.fly.forEach(f => { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 1500 * dt; f.rot += f.vr * dt; });
    s.fly = s.fly.filter(f => f.t < 1.2);
    if (boosting) {
      for (let k = 0; k < 2; k++) {
        const a = Math.random() * TAU, r = 90 + Math.random() * 40;
        emit(W / 2 + Math.cos(a) * r, y - 70 + Math.sin(a) * r * 0.8, Math.cos(a) * 40, Math.sin(a) * 40 - 30, 0.5, 5, Math.random() < 0.5 ? '#fff3a0' : '#9ff0ff');
        s.parts[s.parts.length - 1].star = true;
      }
      for (const sx of [-16, 16]) emit(W / 2 + sx, y - 12, (Math.random() - 0.5) * 60, 60 + Math.random() * 80, 0.35, 5 + Math.random() * 4, Math.random() < 0.5 ? '#7fe4ff' : '#fff3a0');
    }
    if (s.mudT > 0 && pct > 0.02) {
      for (const sx of [-58, 58]) emit(W / 2 + sx, y - 6, (Math.random() - 0.5) * 160, -60 - Math.random() * 90, 0.55, 8 + Math.random() * 8, s.mudCap < 0.2 ? '#ff8fc8' : '#ffffff');
    }
    if (s.crashT > 0 && Math.random() < 0.5) emit(W / 2 + (Math.random() - 0.5) * 80, y - 40, (Math.random() - 0.5) * 200, -120 - Math.random() * 120, 0.6, 6, '#ffd23f');
    s.parts.forEach(p => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt; });
    s.parts = s.parts.filter(p => p.life > 0);
  },

  finish(clear) {
    const s = this.s;
    s.phase = 'over';
    Sound.setLoops({ on: false });
    this.result = {
      clear, course: this.courseId, score: this.total(), time: s.elapsed, coins: s.coins,
      parts: Object.assign({}, s.sc), stage: s.stage
    };
    App.goto('result');
  },

  // ---------- 繪製 ----------
  draw(g) {
    const s = this.s, T = this.track;
    const th = THEMES[s.bgTheme];
    BG.draw(g, s.bgTheme, s.bg, CFG.horizon);
    if (s.bgFade > 0) BG.draw(g, s.bgPrev, s.bg, CFG.horizon, s.bgFade);
    g.fillStyle = th.grass[0]; g.fillRect(0, CFG.horizon, W, H - CFG.horizon);
    g.save();
    if (s.shake > 0) g.translate((Math.random() - 0.5) * s.shake * 16, (Math.random() - 0.5) * s.shake * 10);
    this.info = Road.render(g, T, { pos: s.pos, x: s.x, time: s.t });
    this.drawSpeedLines(g);
    this.drawPlayer(g);
    this.drawParts(g);
    g.restore();
    this.drawHUD(g);
  },

  drawSpeedLines(g) {
    const s = this.s, pct = s.speed / CFG.maxSpeed;
    const a = clamp((pct - 0.6) * 1.6, 0, 0.6) + (s.nitroT > 0 ? 0.3 : 0);
    if (a <= 0.02) return;
    g.save(); g.strokeStyle = s.nitroT > 0 ? '#bff2ff' : '#ffffff'; g.lineWidth = 2; g.globalAlpha = a * 0.7;
    const cx = W / 2, cy = CFG.horizon + 30;
    for (let i = 0; i < 18; i++) {
      const ang = Math.random() * TAU, r0 = 200 + Math.random() * 200, r1 = r0 + 60 + Math.random() * 120;
      g.beginPath(); g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * 1.4); g.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1 * 1.4); g.stroke();
    }
    g.restore();
  },

  drawPlayer(g) {
    const s = this.s, pct = s.speed / CFG.maxSpeed;
    let y = this.info.playerY + Math.sin(s.t * 34) * 1.2 * pct;
    let rot = 0, hop = 0;
    if (s.crashT > 0) {
      const p = clamp(1 - s.crashT / this.CRASH_T, 0, 1);
      hop = Math.sin(clamp(p * 1.6, 0, 1) * Math.PI) * 150;
      rot = clamp(p * 1.5, 0, 1) * TAU * 2;
    } else if (s.slipT > 0) {
      rot = (1 - s.slipT / this.SLIP_T) * TAU * 2 * -s.slipDir;
    }
    if (s.bounceT > 0) { const p = clamp(1 - s.bounceT / this.BOUNCE_T, 0, 1); hop = Math.sin(p * Math.PI) * 170; rot = Math.sin(p * TAU) * 0.35; }
    const lean = Input.steer * 0.1 * (s.slipT > 0 || s.crashT > 0 ? 0 : 1);
    if (s.nitroT > 0) {
      const pulse = 1 + Math.sin(s.t * 14) * 0.06, cy = y - 70;
      g.save();
      const gr = g.createRadialGradient(W / 2, cy, 20, W / 2, cy, 135 * pulse);
      gr.addColorStop(0, 'rgba(255,243,160,0.05)'); gr.addColorStop(0.7, 'rgba(127,228,255,0.35)'); gr.addColorStop(1, 'rgba(127,228,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(W / 2, cy, 135 * pulse, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,243,160,0.85)'; g.lineWidth = 4; g.setLineDash([16, 12]); g.lineDashOffset = -s.t * 90;
      g.beginPath(); g.ellipse(W / 2, cy, 108 * pulse, 92 * pulse, 0, 0, TAU); g.stroke();
      g.restore();
    }
    let view = 'rear', k = 0.76, cheer = false, boostFx = s.nitroT > 0;
    if (s.phase === 'goal' && s.endT > 1.6) {
      const t = s.endT, hy = CFG.horizon + 22, py0 = y;
      if (t < 2.8) {
        const e = Math.pow(clamp((t - 1.6) / 1.2, 0, 1), 2);
        k = lerp(0.76, 0.06, e); y = lerp(py0, hy, e); boostFx = true;
      } else {
        view = 'front';
        if (t < 5.6) {
          const p = clamp((t - 2.8) / 2.8, 0, 1), z = lerp(14, 1, 1 - Math.pow(1 - p, 2.4));
          k = 1.08 / z; y = hy + (py0 - hy) * (1 / z - 1 / 14) / (1 - 1 / 14);
        } else { k = 1.08; y = py0; cheer = true; hop = Math.abs(Math.sin(t * 7)) * 34; }
      }
    }
    g.save();
    if (s.invT > 0 && Math.floor(s.t * 14) % 2) g.globalAlpha = 0.45;
    g.translate(W / 2, y - hop);
    g.scale(k, k);
    if (rot) { g.translate(0, -70); g.rotate(rot); g.translate(0, 70); }
    if (s.drift) g.rotate(Input.steer * 0.17);
    g.transform(1, 0, lean, 1, 0, 0);
    Spr.drawBuggy(g, { veh: Save.data.vehicle || 0, view, cheer, wheel: view === 'front' ? s.t * 40 : s.wheel, t: s.t, brake: Input.brake && s.phase === 'play', boost: boostFx });
    g.restore();
  },

  drawParts(g) {
    for (const f of this.s.fly) {
      const h = f.w * f.img.height / f.img.width;
      g.save(); g.translate(f.x, f.y); g.rotate(f.rot); g.globalAlpha = clamp(1.2 - f.t, 0, 1);
      g.drawImage(f.img, -f.w / 2, -h / 2, f.w, h); g.restore();
    }
    for (const p of this.s.parts) {
      g.globalAlpha = clamp(p.life / p.max, 0, 1);
      g.fillStyle = p.color;
      if (p.fw) { g.save(); g.globalCompositeOperation = 'lighter'; g.beginPath(); g.arc(p.x, p.y, p.r * (0.5 + p.life / p.max), 0, TAU); g.fill(); g.restore(); }
      else if (p.conf) { g.save(); g.translate(p.x, p.y); g.rotate(p.x * 0.05 + p.life * 6); g.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2); g.restore(); }
      else if (p.star) {
        const r = p.r * 2.2;
        g.beginPath(); g.moveTo(p.x, p.y - r); g.lineTo(p.x + r * 0.3, p.y - r * 0.3); g.lineTo(p.x + r, p.y); g.lineTo(p.x + r * 0.3, p.y + r * 0.3);
        g.lineTo(p.x, p.y + r); g.lineTo(p.x - r * 0.3, p.y + r * 0.3); g.lineTo(p.x - r, p.y); g.lineTo(p.x - r * 0.3, p.y - r * 0.3); g.closePath(); g.fill();
      } else { g.beginPath(); g.arc(p.x, p.y, p.r * (1 + (1 - p.life / p.max) * 0.6), 0, TAU); g.fill(); }
    }
    g.globalAlpha = 1;
  },

  drawHUD(g) {
    const s = this.s, C = CFG;
    const kmh = Math.round(s.speed / C.maxSpeed * 250);
    // SCORE
    UI.panel(g, 12, 10, 200, 74, 18);
    UI.text(g, 'SCORE', 26, 28, 15, { align: 'left', fill: '#ffd23f', stroke: null });
    UI.digits(g, pad(this.total(), 7), 24, 60, 24, 32);
    // TIME
    const low = s.time <= 10 && s.phase === 'play', flash = low && Math.floor(s.t * 4) % 2;
    UI.panel(g, 220, 10, 110, 74, 18, low ? 'rgba(160,20,50,.7)' : undefined);
    UI.text(g, 'TIME', 275, 28, 15, { fill: '#ffd23f', stroke: null });
    UI.text(g, String(Math.ceil(s.time)), 275, 62, 50, { fill: flash ? '#ff5c7a' : '#ffffff', stroke: '#40284a', sw: 5 });
    // STAGE
    UI.panel(g, 340, 10, 188, 74, 18);
    UI.text(g, 'STAGE', 434, 28, 15, { fill: '#ffd23f', stroke: null });
    UI.text(g, s.stage + ' / 3', 434, 51, 30, { fill: '#fff', stroke: '#40284a', sw: 4 });
    UI.text(g, THEMES[this.course.themes[s.stage - 1]].name, 434, 72, 14, { fill: '#cfd8ff', stroke: null });
    // 進度
    const prog = clamp((s.pos + C.playerZ) / this.track.goalZ, 0, 1);
    g.fillStyle = 'rgba(30,20,60,.6)'; g.beginPath(); g.roundRect ? g.roundRect(16, 98, 410, 14, 7) : g.rect(16, 98, 410, 14); g.fill();
    g.fillStyle = '#7fe4ff'; g.beginPath(); g.roundRect ? g.roundRect(16, 98, Math.max(8, 410 * prog), 14, 7) : g.rect(16, 98, 410 * prog, 14); g.fill();
    for (let i = 0; i < 3; i++) {
      const fx = 16 + 410 * (this.track.cps[i] / this.track.cps[2]) - (i === 2 ? 12 : 0);
      g.fillStyle = i === 2 ? '#2b2833' : '#ff5c7a'; g.fillRect(fx - 2, 92, 4, 26);
      g.fillStyle = i === 2 ? '#fff' : '#ffe680'; g.fillRect(fx + 2, 92, 10, 9);
    }
    UI.text(g, '🐼', 16 + 410 * prog, 106, 20, { stroke: null });
    // 暫停鈕
    g.fillStyle = 'rgba(30,20,60,.6)'; g.beginPath(); g.arc(490, 106, 20, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.fillRect(482, 96, 6, 20); g.fillRect(494, 96, 6, 20);
    // NITRO
    UI.panel(g, 12, 124, 250, 72, 18);
    UI.text(g, 'NITRO', 26, 140, 14, { align: 'left', fill: '#7fe4ff', stroke: null });
    for (let i = 0; i < C.nitroMax; i++) {
      g.globalAlpha = i < s.nitro ? 1 : 0.25;
      g.drawImage(Spr.get('nitro'), 90 + i * 34, 128, 26, 42);
    }
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(26, 178, 222, 9);
    const gr = g.createLinearGradient(26, 0, 248, 0); gr.addColorStop(0, '#2a8bff'); gr.addColorStop(1, '#7fe4ff');
    g.fillStyle = gr; g.fillRect(26, 178, 222 * (s.nitroT / C.nitroTime), 9);
    // SPEED
    UI.panel(g, 274, 124, 254, 72, 18);
    UI.text(g, String(kmh), 440, 152, 44, { align: 'right', fill: '#fff', stroke: '#40284a', sw: 5 });
    UI.text(g, 'km/h', 452, 160, 16, { align: 'left', fill: '#ffd23f', stroke: null });
    const n = 22, lit = Math.round(kmh / 250 * n);
    for (let i = 0; i < n; i++) {
      g.fillStyle = i < lit ? (i < 12 ? '#6fe06a' : i < 18 ? '#ffd23f' : '#ff5c7a') : 'rgba(255,255,255,.18)';
      g.fillRect(288 + i * 10.4, 176, 8, 12);
    }

    // 前方急彎提示
    if (s.phase === 'play') {
      const zi = Math.floor((s.pos + C.playerZ) / C.segLen);
      const w = this.track.warn.find(q => q.idx - zi > 3 && q.idx - zi < 70);
      if (w && Math.floor(s.t * 4) % 2 === 0) {
        UI.text(g, w.dir > 0 ? '▶▶' : '◀◀', W / 2, 236, 76, { fill: '#ffd23f', sw: 10 });
        UI.text(g, '前方急彎!', W / 2, 284, 26, { fill: '#fff', sw: 6 });
      }
    }
    // 倒數 / 訊息
    if (s.phase === 'countdown' && s.countT > 0) {
      const n2 = Math.ceil(s.countT), f = s.countT % 1;
      if (n2 <= 3) UI.text(g, String(n2), W / 2, 430, 150 * (1 + f * 0.35), { fill: '#ffd23f', stroke: '#40284a', sw: 12, alpha: clamp(f * 2 + 0.3, 0, 1) });
      else UI.text(g, 'READY?', W / 2, 430, 84, { fill: '#fff', stroke: '#40284a', sw: 10 });
    }
    if (s.toast) {
      const t = s.toast, k = clamp(t.t / 0.22, 0, 1), sc = 1 + (1 - k) * 0.6, a = clamp((t.dur - t.t) / 0.4, 0, 1);
      UI.text(g, t.text, W / 2, 300, t.size * sc, { fill: t.color, stroke: '#40284a', sw: 9, alpha: a });
      if (t.sub) UI.text(g, t.sub, W / 2, 300 + t.size * 0.9, 34, { fill: '#fff', stroke: '#40284a', sw: 7, alpha: a });
    }
    for (const p of s.pops) UI.text(g, p.text, p.x, 660 - p.t * 90, 30, { fill: p.color, stroke: '#40284a', sw: 6, alpha: 1 - p.t / 1.1 });

    this.drawControls(g);
  },

  drawControls(g) {
    if (!Input.touchMode || this.s.phase !== 'play' && this.s.phase !== 'countdown') { Input.virtual = []; return; }
    const gyro = Save.data.gyro && Input.gyroActive;
    const btns = [
      { id: 'throttle', x: 452, y: 872, r: 62, label: 'GO', col: '#5fdc7a' },
      { id: 'brake', x: 348, y: 916, r: 42, label: 'BRAKE', col: '#ff6b81' },
      { id: 'nitro', x: 462, y: 752, r: 46, label: 'NITRO', col: '#3ea8ff' }
    ];
    if (Save.data.autoGas) btns.shift();
    if (!gyro) btns.push({ id: 'left', x: 66, y: 888, r: 56, label: '◀', col: '#ffd23f' }, { id: 'right', x: 186, y: 888, r: 56, label: '▶', col: '#ffd23f' });
    Input.virtual = btns;
    for (const b of btns) {
      const on = Input._vPrev[b.id];
      g.save();
      g.globalAlpha = on ? 0.85 : 0.5;
      g.fillStyle = b.col; g.beginPath(); g.arc(b.x, b.y, b.r * (on ? 0.94 : 1), 0, TAU); g.fill();
      g.lineWidth = 5; g.strokeStyle = '#fff'; g.stroke();
      g.restore();
      UI.text(g, b.label, b.x, b.y, b.r > 50 ? 30 : 20, { fill: '#fff', stroke: '#40284a', sw: 5 });
    }
  }
};
