'use strict';

// ---------- 主選單 / 過場用的示範賽道場景 ----------
const Demo = {
  track: null, pos: 0, x: 0, t: 0, bg: [0, 0, 0],

  ensure() { if (!this.track) this.track = Road.build('demo'); },

  step(dt, speed, dir) {
    this.ensure();
    this.t += dt;
    this.pos += dir * speed * dt;
    const len = this.track.length;
    const z = (((this.pos % len) + len) % len) + CFG.playerZ;
    const seg = Road.findSeg(this.track, z);
    for (let i = 0; i < 3; i++) this.bg[i] += dir * seg.curve * (speed / CFG.maxSpeed) * dt * 900 * BG.FACTORS[i];
    this.x = 0.28 * Math.sin(this.t * 0.6);
  },

  draw(g, hor, YS) {
    this.ensure();
    BG.draw(g, 0, this.bg, hor);
    g.fillStyle = THEMES[0].grass[0]; g.fillRect(0, hor, W, H - hor);
    return Road.render(g, this.track, { pos: this.pos, x: this.x, time: this.t, hor, YS });
  },

  frontCar(g, x, y, sc, t) {
    const bob = Math.sin(t * 24) * 1.6, sway = Math.sin(t * 1.7) * 0.02;
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) {
      const ph = (t * 1.8 + i / 6) % 1;
      g.globalAlpha = (1 - ph) * 0.55; g.fillStyle = '#fff';
      g.beginPath(); g.arc(x + sx * (96 * sc + ph * 26), y - 6 - ph * 46, (6 + ph * 14) * sc, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    g.save(); g.translate(x, y + bob); g.scale(sc, sc); g.rotate(sway);
    Spr.drawBuggy(g, { view: 'front', wheel: t * 40, t, veh: Save.data.vehicle || 0 });
    g.restore();
  }
};

const rearCar = (g, x, y, sc, t, boost, wheel) => {
  g.save(); g.translate(x, y + Math.sin(t * 34) * 1.2); g.scale(sc, sc);
  Spr.drawBuggy(g, { view: 'rear', wheel, t, boost, veh: Save.data.vehicle || 0 });
  g.restore();
};

// ---------- App(畫面管理 / 轉場) ----------
const App = {
  t: 0, cur: null, name: '', pending: null, fade: 1,

  goto(name, arg) { if (this.pending) return; this.pending = { name, arg }; },

  frame(g, dt) {
    this.t += dt;
    if (this.pending) {
      this.fade = Math.min(1, this.fade + dt / 0.22);
      if (this.fade >= 1) {
        if (this.cur && this.cur.leave) this.cur.leave();
        const p = this.pending; this.pending = null;
        this.name = p.name; this.cur = Screens[p.name];
        Input.virtual = [];
        Input.lockUntil = performance.now() + 250;
        Input.pressed.clear(); Input.taps.length = 0;
        if (this.cur.enter) this.cur.enter(p.arg);
      }
    } else if (this.fade > 0) this.fade = Math.max(0, this.fade - dt / 0.22);
    if (this.cur) this.cur.frame(g, dt);
    if (this.fade > 0) { g.fillStyle = `rgba(10,5,25,${this.fade})`; g.fillRect(0, 0, W, H); }
  },

  start(name) { this.name = name; this.cur = Screens[name]; if (this.cur.enter) this.cur.enter(); this.fade = 1; }
};

const Screens = {};

// ---------- 開機畫面(點擊 / 按任意鍵,以解除瀏覽器音效限制) ----------
Screens.title = {
  frame(g, dt) {
    Demo.step(dt, 1800, -1);
    Demo.draw(g, 280, 330);
    UI.dim(g, 0.28);
    UI.logo(g, W / 2, 200, 1.05, App.t);
    Demo.frontCar(g, W / 2, 620, 1.15, App.t);
    if (Math.floor(App.t * 1.8) % 2 === 0) UI.text(g, Input.touchMode ? 'TAP TO START' : 'PRESS ANY KEY', W / 2, 800, 40, { fill: '#fff', sw: 8 });
    UI.copyright(g);
    if (Input.was('anykey') || Input.was('confirm')) { Sound.init(); Sound.play('confirm'); App.goto('intro'); }
  }
};

// ---------- 開頭過場 ----------
Screens.intro = {
  t: 0, wheel: 0,
  enter() { this.t = 0; this.wheel = 0; Demo.pos = 0; Demo.bg = [0, 0, 0]; Sound.music('menu'); },
  frame(g, dt) {
    this.t += dt;
    const t = this.t;
    const sp = t < 2.2 ? 0 : lerp(0, 11000, clamp((t - 2.2) / 2.8, 0, 1));
    Demo.step(dt, sp, 1);
    Demo.x = 0;
    this.wheel += (sp + 1500) * dt * 0.012;
    const info = Demo.draw(g, CFG.horizon, CFG.YS);
    const boost = t > 3.6 && t < 5.4;
    const carY = info.playerY + (t < 2.2 ? 0 : 0);
    if (sp > 6000) {
      g.save(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.globalAlpha = clamp((sp - 6000) / 8000, 0, 0.6);
      for (let i = 0; i < 18; i++) { const a = Math.random() * TAU, r0 = 200 + Math.random() * 200; g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * r0, 420 + Math.sin(a) * r0 * 1.4); g.lineTo(W / 2 + Math.cos(a) * (r0 + 120), 420 + Math.sin(a) * (r0 + 120) * 1.4); g.stroke(); }
      g.restore();
    }
    rearCar(g, W / 2, carY, 0.76, t, boost, this.wheel);

    // 電影黑邊
    const bar = t < 5.2 ? 70 : Math.max(0, 70 - (t - 5.2) * 400);
    g.fillStyle = '#0a0518'; g.fillRect(0, 0, W, bar); g.fillRect(0, H - bar, W, bar);
    UI.copyright(g);

    if (t > 0.3 && t < 2.3) UI.text(g, 'ARC WANG  presents', W / 2, 340, 34, { fill: '#fff', sw: 8, alpha: clamp(Math.min(t - 0.3, 2.3 - t) * 3, 0, 1) });
    if (t > 2.5 && t < 4.4) {
      const k = clamp((t - 2.5) * 5, 0, 1);
      UI.text(g, 'GET READY!', W / 2, 300, 66 * (1.5 - 0.5 * k), { fill: '#ffd23f', sw: 10, alpha: clamp(4.4 - t, 0, 1) });
    }
    if (t > 5.0) {
      const k = t - 5.3;
      if (k < 0) { g.fillStyle = `rgba(255,255,255,${clamp((t - 5.0) / 0.3, 0, 1)})`; g.fillRect(0, 0, W, H); }
      else {
        g.fillStyle = `rgba(255,255,255,${clamp(1 - k * 3, 0, 1)})`; g.fillRect(0, 0, W, H);
        const drop = clamp(k / 0.45, 0, 1), s = 1 + (1 - drop) * 2.2, yy = lerp(-120, 210, 1 - Math.pow(1 - drop, 3));
        UI.dim(g, 0.15);
        UI.logo(g, W / 2, yy, 1.05 * s, App.t);
        if (k > 1.2 && Math.floor(App.t * 2) % 2 === 0) UI.text(g, Input.touchMode ? 'TAP' : 'PRESS ANY KEY', W / 2, 800, 36, { fill: '#fff', sw: 8 });
      }
    }
    if ((t > 0.6 && (Input.was('anykey') || Input.was('confirm'))) || t > 10.5) App.goto('menu');
  }
};

// ---------- 主選單 ----------
Screens.menu = {
  sel: 0, n: 0,
  enter() { this.sel = 0; Sound.music('menu'); Demo.pos = 0; },
  frame(g, dt) {
    Demo.step(dt, 3600, -1);
    Demo.draw(g, 280, 330);
    UI.dim(g, 0.12);
    UI.logo(g, W / 2, 138, 0.95, App.t);
    Demo.frontCar(g, W / 2, 596, 1.15, App.t);

    UI.begin(this);
    const items = [
      ['開始遊戲', '#8dff8a', '#2fc46a', 'vehicle'], ['操作說明', '#8ee8ff', '#3ea8ff', 'howto'],
      ['排行榜', '#ffe680', '#ffb02e', 'ranking'], ['設定', '#d6b3ff', '#9a6bff', 'settings'],
      ['了解歷史', '#ffd6a0', '#ff9a5a', 'history'], ['CREDIT', '#ffb3d1', '#ff6b9a', 'credits']
    ];
    items.forEach(([label, c1, c2, dest], i) => {
      if (UI.button(g, this, label, 110, 618 + i * 49, 320, 43, { c1, c2 })) {
        App.goto(dest);
      }
    });
    UI.nav(this);
    UI.text(g, Input.padConnected ? '↑↓ / A 選擇' : '↑ ↓  選擇    Enter  決定', 16, 942, 14, { align: 'left', fill: '#40284a', stroke: '#ffffff', sw: 5 });
    UI.copyright(g);
  }
};

// ---------- 車輛選擇 ----------
Screens.vehicle = {
  sel: 0, n: 0, idx: 0, anim: 1, dir: 1, t: 0,
  enter() { this.idx = clamp(Save.data.vehicle || 0, 0, VEHICLES.length - 1); this.sel = 0; this.anim = 1; this.t = 0; Sound.music('menu'); },
  change(d) { this.idx = (this.idx + d + VEHICLES.length) % VEHICLES.length; this.dir = d; this.anim = 0; Sound.play('select'); },
  frame(g, dt) {
    this.t += dt; this.anim = Math.min(1, this.anim + dt * 5);
    const v = VEHICLES[this.idx];
    BG.draw(g, 0, [App.t * 10, App.t * 22, App.t * 44], 330);
    g.fillStyle = THEMES[0].grass[0]; g.fillRect(0, 330, W, H - 330);
    UI.dim(g, 0.5);
    UI.header(g, '選擇車輛', 'SELECT VEHICLE');

    const ease = 1 - Math.pow(1 - this.anim, 3), off = (1 - ease) * 70 * this.dir;
    g.save(); g.globalAlpha = 0.3 + 0.7 * ease; g.translate(off, 0);
    UI.panel(g, 40, 130, 460, 640, 26, 'rgba(30,20,60,.7)', v.color[0]);
    UI.text(g, v.name, W / 2, 190, 50, { fill: v.color[0], sw: 9 });
    UI.text(g, v.en, W / 2, 236, 24, { fill: '#fff', sw: 5 });
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(W / 2, 560, 190, 34, 0, 0, TAU); g.fill();
    const bob = Math.sin(this.t * 22) * 1.6;
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) {
      const ph = (this.t * 1.8 + i / 6) % 1;
      g.globalAlpha = (0.3 + 0.7 * ease) * (1 - ph) * 0.5; g.fillStyle = '#fff';
      g.beginPath(); g.arc(W / 2 + sx * (150 + ph * 34), 550 - ph * 52, 8 + ph * 16, 0, TAU); g.fill();
    }
    g.globalAlpha = 0.3 + 0.7 * ease;
    g.save(); g.translate(W / 2, 560 + bob); g.scale(1.55, 1.55); g.rotate(Math.sin(this.t * 1.7) * 0.02);
    Spr.drawBuggy(g, { view: 'front', veh: this.idx, wheel: this.t * 40, t: this.t });
    g.restore();
    UI.wrap(g, v.desc, 74, 618, 392, 30, 21, { fill: '#fff' });
    g.restore();

    for (let i = 0; i < VEHICLES.length; i++) {
      g.fillStyle = i === this.idx ? '#ffd23f' : 'rgba(255,255,255,.35)';
      g.beginPath(); g.arc(W / 2 + (i - 1) * 26, 790, i === this.idx ? 8 : 6, 0, TAU); g.fill();
    }
    UI.text(g, '◀', 20, 450, 46, { fill: '#ffd23f' }); UI.text(g, '▶', 520, 450, 46, { fill: '#ffd23f' });
    if (Input.was('left') || UI.tapIn(0, 300, 48, 300)) this.change(-1);
    if (Input.was('right') || UI.tapIn(492, 300, 48, 300)) this.change(1);

    UI.begin(this);
    if (UI.button(g, this, '確認車輛', 110, 812, 320, 60, { c1: '#8dff8a', c2: '#2fc46a' })) {
      Save.data.vehicle = this.idx; Save.store();
      App.goto('course');
    }
    if (UI.button(g, this, '返回', 170, 884, 200, 52, { c1: '#ffb3d1', c2: '#ff6b9a', back: true }) || Input.was('back')) App.goto('menu');
    UI.nav(this);
  }
};

// ---------- 賽事選擇 ----------
const OBS_INFO = {
  poop: ['大便', '踩到會打滑轉圈'], rock: ['石頭', '撞到整台翻車'],
  snowdrift: ['雪堆', '陷入雪中大幅減速'], iceBlock: ['冰塊', '撞到整台翻車'],
  jelly: ['果凍', '被彈飛失去控制'], gum: ['口香糖', '被黏住幾乎停下']
};

Screens.course = {
  sel: 0, n: 0, idx: 0, anim: 1, dir: 1, t: 0,
  enter() { this.idx = clamp(Save.data.course || 0, 0, COURSES.length - 1); this.sel = 0; this.anim = 1; this.t = 0; Sound.music('menu'); },
  change(d) {
    this.idx = (this.idx + d + COURSES.length) % COURSES.length; this.dir = d; this.anim = 0; Sound.play('select');
  },
  thumb(g, x, y, w, h, theme, label, icon) {
    const th = THEMES[theme], k = w / W;
    g.save();
    g.beginPath(); g.roundRect(x, y, w, h, 14); g.clip();
    g.translate(x, y); g.scale(k, k);
    BG.draw(g, theme, [this.t * 30 + theme * 200, this.t * 60 + theme * 300, this.t * 120], 300);
    g.fillStyle = th.grass[0]; g.fillRect(0, 300, W, 400);
    g.fillStyle = th.rumble[0]; g.beginPath(); g.moveTo(W / 2 - 26, 300); g.lineTo(W / 2 + 26, 300); g.lineTo(W / 2 + 330, 700); g.lineTo(W / 2 - 330, 700); g.fill();
    g.fillStyle = th.road[0]; g.beginPath(); g.moveTo(W / 2 - 20, 300); g.lineTo(W / 2 + 20, 300); g.lineTo(W / 2 + 280, 700); g.lineTo(W / 2 - 280, 700); g.fill();
    g.restore();
    g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.beginPath(); g.roundRect(x, y, w, h, 14); g.stroke();
    UI.text(g, icon + " " + tr(label), x + w / 2, y + h + 16, 15, { fill: '#fff', stroke: null });
  },
  frame(g, dt) {
    this.t += dt; this.anim = Math.min(1, this.anim + dt * 5);
    const c = COURSES[this.idx], th0 = c.themes[0];
    BG.draw(g, th0, [App.t * 10, App.t * 22, App.t * 44], 330);
    g.fillStyle = THEMES[th0].grass[0]; g.fillRect(0, 330, W, H - 330);
    UI.dim(g, 0.5);
    UI.header(g, '選擇賽事', 'SELECT COURSE');

    const ease = 1 - Math.pow(1 - this.anim, 3), off = (1 - ease) * 70 * this.dir;
    g.save(); g.globalAlpha = 0.3 + 0.7 * ease; g.translate(off, 0);
    UI.panel(g, 40, 130, 460, 640, 26, 'rgba(30,20,60,.7)', c.color[0]);
    UI.text(g, c.name, W / 2, 190, 52, { fill: c.color[0], sw: 9 });
    UI.text(g, c.en, W / 2, 236, 24, { fill: '#fff', sw: 5 });
    UI.text(g, tr('難度') + '  ' + '★'.repeat(c.stars) + '☆'.repeat(3 - c.stars), W / 2, 274, 22, { fill: '#ffd23f', stroke: null });
    const icons = ['☀', '🌅', '🌙'];
    for (let i = 0; i < 3; i++) this.thumb(g, 62 + i * 143, 300, 130, 150, c.themes[i], THEMES[c.themes[i]].name, icons[i]);
    UI.text(g, '3 個賽段,途中有 2 個 CHECK POINT', W / 2, 492, 17, { fill: '#cfd8ff', stroke: null });
    UI.wrap(g, c.desc, 66, 530, 410, 28, 20, { fill: '#fff' });
    UI.text(g, '本賽事障礙', W / 2, 612, 20, { fill: '#7fe4ff', stroke: null });
    c.obs.forEach((o, i) => {
      const im = Spr.get(o), sw = 80, sh = Math.min(64, sw * im.height / im.width), sw2 = sh * im.width / im.height;
      const bx = 66 + i * 220;
      g.drawImage(im, bx + (80 - sw2) / 2, 640 + (64 - sh) / 2, sw2, sh);
      UI.text(g, OBS_INFO[o][0], bx + 88, 656, 21, { align: 'left', fill: '#fff27a', stroke: null });
      UI.text(g, OBS_INFO[o][1], bx + 88, 684, 14, { align: 'left', fill: '#fff', stroke: null });
    });
    g.restore();

    for (let i = 0; i < COURSES.length; i++) {
      g.fillStyle = i === this.idx ? '#ffd23f' : 'rgba(255,255,255,.35)';
      g.beginPath(); g.arc(W / 2 + (i - 1) * 26, 790, i === this.idx ? 8 : 6, 0, TAU); g.fill();
    }
    UI.text(g, '◀', 20, 450, 46, { fill: '#ffd23f' }); UI.text(g, '▶', 520, 450, 46, { fill: '#ffd23f' });
    if (Input.was('left') || UI.tapIn(0, 300, 48, 300)) this.change(-1);
    if (Input.was('right') || UI.tapIn(492, 300, 48, 300)) this.change(1);

    UI.begin(this);
    if (UI.button(g, this, '確認出發', 110, 812, 320, 60, { c1: '#8dff8a', c2: '#2fc46a' })) {
      Save.data.course = this.idx; Save.store();
      Game.courseId = this.idx;
      if (Save.data.gyro && Input.touchMode) Input.enableGyro();
      if (window.tryLockPortrait) window.tryLockPortrait();
      App.goto('game');
    }
    if (UI.button(g, this, '返回', 170, 884, 200, 52, { c1: '#ffb3d1', c2: '#ff6b9a', back: true }) || Input.was('back')) App.goto('vehicle');
    UI.nav(this);
  }
};

// ---------- 遊戲 ----------
Screens.game = {
  paused: false, sel: 0, n: 0,
  enter() { Game.newRun(); this.paused = false; this.sel = 0; Sound.music(Game.course.music[0]); },
  leave() { Sound.setLoops({ on: false }); Input.virtual = []; },
  pause() {
    if (!this.paused && Game.s.phase !== 'over') {
      this.paused = true; this.sel = 0; Sound.setLoops({ on: false });
      Input.pressed.clear(); Input.taps.length = 0;
    }
  },
  frame(g, dt) {
    let tapView = false, tapPause = false;
    for (const t of Input.taps) { const d1 = Math.hypot(t.x - 452, t.y - 106), d2 = Math.hypot(t.x - 490, t.y - 106); if (Math.min(d1, d2) < 26) { if (d1 < d2) tapView = true; else tapPause = true; } }
    if (tapView || Input.was('view')) { Game.cycleView(); Input.taps.length = 0; }
    if (!this.paused && (Input.was('pause') || tapPause)) this.pause();
    else if (this.paused && Input.was('pause')) { this.paused = false; Input.pressed.clear(); Input.taps.length = 0; }
    if (!this.paused) Game.update(dt);
    if (App.name !== 'game') return;
    Game.draw(g);
    if (this.paused) {
      UI.dim(g, 0.6);
      UI.text(g, 'PAUSE', W / 2, 260, 80, { fill: '#fff27a', sw: 12 });
      UI.begin(this);
      if (UI.button(g, this, '繼續遊戲', 110, 380, 320, 62, { c1: '#8dff8a', c2: '#2fc46a' })) this.paused = false;
      if (UI.button(g, this, '重新開始', 110, 460, 320, 62, { c1: '#ffe680', c2: '#ffb02e' })) { this.enter(); }
      if (UI.button(g, this, '回主選單', 110, 540, 320, 62, { c1: '#ffb3d1', c2: '#ff6b9a', back: true })) { App.goto('menu'); Sound.stopMusic(); }
      UI.nav(this);
    }
  }
};

// ---------- 操作說明 ----------
Screens.howto = {
  page: 0, sel: 0, n: 0,
  enter() { this.page = 0; this.sel = 0; },
  frame(g, dt) {
    BG.draw(g, 0, [App.t * 8, App.t * 18, App.t * 36], 380);
    g.fillStyle = '#8ee05a'; g.fillRect(0, 380, W, H - 380);
    UI.dim(g, 0.55);
    UI.header(g, '操作說明', tr(["遊戲規則", "操作方式", "道具與敵車", "各賽事障礙"][this.page]) + `  (${this.page + 1}/4)`);
    UI.panel(g, 20, 130, 500, 690, 22);

    if (this.page === 0) this.p1(g); else if (this.page === 1) this.p2(g); else if (this.page === 2) this.p3(g); else this.p4(g);

    const pv = () => { this.page = (this.page + 3) % 4; Sound.play('select'); };
    const nx = () => { this.page = (this.page + 1) % 4; Sound.play('select'); };
    if (Input.was('left') || UI.tapIn(20, 830, 80, 64)) pv();
    if (Input.was('right') || UI.tapIn(440, 830, 80, 64)) nx();
    UI.text(g, '◀', 60, 862, 44, { fill: '#ffd23f' }); UI.text(g, '▶', 480, 862, 44, { fill: '#ffd23f' });
    UI.begin(this);
    if (UI.button(g, this, '返回', 170, 832, 200, 58, { back: true }) || Input.was('back')) App.goto('menu');
    UI.nav(this);
  },
  p1(g) {
    const rows = [
      ['🏁', '遊戲目標', '在限定時間內,跑完全部 3 個賽段的賽道即可過關。時間歸零仍未抵達終點,就是 GAME OVER!'],
      ['⏱', 'CHECK POINT', '每個賽段結尾都有檢查點。在時間內通過,就會增加倒數時間並加分!'],
      ['🌸', '留在賽道上', '賽道兩側是草叢與樹木。偏離跑道會大幅減速,撞到樹更慘。'],
      ['💩', '避開障礙', '每個賽事都有專屬障礙,撞到會打滑、翻車或減速!也小心別撞到其他賽車。'],
      ['💰', '收集道具', '金幣加分、氮氣瓶最多可持有 5 瓶。'],
      ['🏆', '排行榜', '遊戲結束後,各賽事積分前 20 名可登錄姓名,留名排行榜。']
    ];
    rows.forEach(([ic, t, d], i) => {
      const y = 170 + i * 106;
      UI.text(g, ic, 62, y + 22, 36, { stroke: null });
      UI.text(g, t, 100, y + 8, 25, { align: 'left', fill: '#fff27a', stroke: null });
      UI.wrap(g, d, 100, y + 38, 400, 26, 19, { fill: '#fff' });
    });
  },
  p2(g) {
    const cols = [['操作', 70], ['鍵盤', 190], ['Xbox 手把', 320], ['手機', 442]];
    cols.forEach(([t, x]) => UI.text(g, t, x, 162, 19, { fill: '#7fe4ff', stroke: null }));
    const rows = [
      ['左移', '← / A', '類比左/十字左', '虛擬鍵左/傾斜'],
      ['右移', '→ / D', '類比右/十字右', '虛擬鍵右/傾斜'],
      ['油門', 'W', 'RT / A', '油門按鈕'],
      ['剎車', 'ALT', 'LT / B', '剎車按鈕'],
      ['氮氣', 'SPACE', 'X / Y', '氮氣按鈕']
    ];
    rows.forEach((r, i) => {
      const y = 204 + i * 50;
      g.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.14)'; g.fillRect(30, y - 22, 480, 44);
      r.forEach((t, k) => UI.text(g, t, cols[k][1], y, k === 0 ? 22 : 15, { fill: k === 0 ? '#fff27a' : '#fff', stroke: null }));
    });
    UI.text(g, '進階技巧', W / 2, 486, 26, { fill: '#ffd23f', stroke: null });
    const tips = [
      ['油門', '按住不放,車速會線性加速;放開則慢慢滑行減速。'],
      ['剎車', '按下後減速(點放控制力道)。過急彎前先減速!'],
      ['甩尾', '「油門」+「剎車」同時按住,再按左/右,車身會飄移,能以不低的速度過彎,還有額外加分!'],
      ['氮氣', '按下消耗 1 瓶,BAR 條時間內瞬間加速且無敵,碰到障礙與敵車會把牠們撞飛!']
    ];
    let y = 520;
    tips.forEach(([t, d]) => {
      UI.text(g, t, 60, y + 4, 21, { align: 'left', fill: '#7fe4ff', stroke: null });
      const h = UI.wrap(g, d, 130, y + 4, 370, 25, 18, { fill: '#fff' });
      y += Math.max(h, 30) + 14;
    });
  },
  p3(g) {
    const items = [
      ['coin', '金幣', '取得後獲得 1000 分。', 44, 0],
      ['nitro', '氮氣瓶', '最多 5 瓶,使用後極速加速且無敵,可撞飛障礙與敵車!', 34, 0],
      ['missileBox', '飛彈箱', '取得後 10 秒內車子會自動發射飛彈,擊飛前方敵車與障礙(不可累積)。', 40, 0],
      ['enemy1', '呱呱 (青蛙)', '龜速直行的路障車,超車時小心。', 0, 1],
      ['enemy2', '兔兔 (兔子)', '左右蛇行前進,難以預測。', 0, 1],
      ['enemy3', '黑喵 (黑貓)', '速度快,還會擋住你的路線!', 0, 1]
    ];
    items.forEach(([nm, t, d, w, car], i) => {
      const y = 158 + i * 104, im = Spr.get(nm), sw = car ? 96 : w, sh = sw * im.height / im.width;
      const k = Math.min(1, 70 / sh);
      g.drawImage(im, 70 - sw * k / 2, y + 40 - sh * k / 2, sw * k, sh * k);
      UI.text(g, t, 130, y + 16, 24, { align: 'left', fill: '#fff27a', stroke: null });
      UI.wrap(g, d, 130, y + 44, 380, 24, 18, { fill: '#fff' });
    });
  },
  p4(g) {
    COURSES.forEach((c, ci) => {
      const y = 150 + ci * 224;
      UI.text(g, tr(c.name) + "  " + c.en, 40, y + 14, 24, { align: 'left', fill: c.color[0], stroke: null });
      UI.text(g, tr('難度') + ' ' + '★'.repeat(c.stars) + '☆'.repeat(3 - c.stars), 500, y + 14, 16, { align: 'right', fill: '#ffd23f', stroke: null });
      c.obs.forEach((o, i) => {
        const im = Spr.get(o), sh = Math.min(70, 84 * im.height / im.width), sw = sh * im.width / im.height, by = y + 40 + i * 88;
        g.drawImage(im, 40 + (84 - sw) / 2, by + (70 - sh) / 2, sw, sh);
        UI.text(g, OBS_INFO[o][0], 140, by + 16, 22, { align: 'left', fill: '#fff27a', stroke: null });
        UI.text(g, OBS_INFO[o][1], 140, by + 46, 17, { align: 'left', fill: '#fff', stroke: null });
      });
    });
  }
};

// ---------- 設定 ----------
Screens.settings = {
  sel: 0, n: 0,
  enter() { this.sel = 0; },
  setVol(key, v) {
    v = clamp(v, 0, 5);
    if (v === Save.data[key]) return;
    Sound.setVol(key, v);
    if (key === 'sfx') Sound.play('coin'); else Sound.play('select');
  },
  setLang(l) {
    if (Save.data.lang === l) return;
    Save.data.lang = l; Save.store(); Sound.play('confirm');
  },
  frame(g, dt) {
    BG.draw(g, 1, [App.t * 8, App.t * 18, App.t * 36], 380);
    g.fillStyle = THEMES[1].grass[0]; g.fillRect(0, 380, W, H - 380);
    UI.dim(g, 0.5);
    UI.header(g, '設定', 'SETTINGS');
    const panel = (i, y, h) => {
      const sel = this.sel === i;
      UI.panel(g, 30, y, 480, h, 24, sel ? 'rgba(255,210,63,.28)' : 'rgba(30,20,60,.55)', sel ? '#ffd23f' : 'rgba(255,255,255,.35)');
      if (Input.ptr.moved && UI.inside(Input.ptr.x, Input.ptr.y, 30, y, 480, h)) this.sel = i;
    };

    [['音樂', 'music', 140], ['音效', 'sfx', 268]].forEach(([label, key, y], i) => {
      panel(i, y, 118);
      const v = Save.data[key];
      UI.text(g, label, 60, y + 28, 30, { align: 'left' });
      UI.text(g, v === 0 ? 'MUTE' : String(v), 470, y + 28, 32, { align: 'right', fill: '#ffd23f' });
      for (let k = 0; k < 5; k++) {
        const bx = 80 + k * 66, bh = 26 + k * 5;
        g.fillStyle = k < v ? (key === 'music' ? '#7fe4ff' : '#ffb347') : 'rgba(255,255,255,.2)';
        g.beginPath(); g.roundRect(bx, y + 106 - bh, 52, bh, 8); g.fill();
        g.lineWidth = 3; g.strokeStyle = '#40284a'; g.stroke();
        if (UI.tapIn(bx - 6, y + 40, 64, 78)) { this.sel = i; this.setVol(key, k + 1 === v ? k : k + 1); }
      }
      UI.text(g, '−', 50, y + 86, 40, { fill: '#fff' }); UI.text(g, '+', 490, y + 86, 40, { fill: '#fff' });
      if (UI.tapIn(30, y + 56, 44, 62)) { this.sel = i; this.setVol(key, v - 1); }
      if (UI.tapIn(470, y + 56, 44, 62)) { this.sel = i; this.setVol(key, v + 1); }
      if (this.sel === i) {
        if (Input.was('left')) this.setVol(key, v - 1);
        if (Input.was('right')) this.setVol(key, v + 1);
      }
    });

    const toggle = (i, y, label, sub, key) => {
      panel(i, y, 88);
      UI.text(g, label, 60, y + 28, 28, { align: 'left' });
      UI.text(g, sub, 60, y + 62, 15, { align: 'left', fill: '#cfd8ff', stroke: null });
      const on = Save.data[key];
      UI.panel(g, 370, y + 18, 120, 52, 26, on ? '#2fc46a' : 'rgba(255,255,255,.18)', '#fff');
      UI.text(g, on ? 'ON' : 'OFF', 430, y + 45, 28, { fill: '#fff' });
      const flip = () => { Save.data[key] = !Save.data[key]; Save.store(); Sound.play('confirm'); if (key === 'gyro' && Save.data.gyro) Input.enableGyro(); };
      if (UI.tapIn(30, y, 480, 88)) { this.sel = i; flip(); }
      if (this.sel === i && (Input.was('left') || Input.was('right') || Input.was('confirm'))) flip();
    };
    toggle(2, 398, '傾斜控制', '手機陀螺儀轉向(直握手機)', 'gyro');
    toggle(3, 498, '自動油門', '自動全程踩住油門', 'autoGas');

    panel(4, 598, 108);
    UI.text(g, '語言', 60, 626, 28, { align: 'left' });
    const langs = [['zh', '中文'], ['ja', '日本語'], ['en', 'English']];
    langs.forEach(([code, label], k) => {
      const x = 46 + k * 148, on = Save.data.lang === code;
      UI.panel(g, x, 648, 138, 46, 23, on ? '#ffb02e' : 'rgba(255,255,255,.16)', on ? '#fff' : 'rgba(255,255,255,.4)');
      UI.text(g, label, x + 69, 672, 22, { fill: '#fff', stroke: on ? '#40284a' : null });
      if (UI.tapIn(x, 648, 138, 46)) { this.sel = 4; this.setLang(code); }
    });
    if (this.sel === 4) {
      const idx = langs.findIndex(l => l[0] === Save.data.lang);
      if (Input.was('left')) this.setLang(langs[(idx + 2) % 3][0]);
      if (Input.was('right')) this.setLang(langs[(idx + 1) % 3][0]);
    }

    this.sel = clamp(this.sel, 0, 5);
    if (UI.buttonAt(g, this, 5, '返回', 170, 736, 200, 60, { back: true }) || Input.was('back')) App.goto('menu');
    if (Input.was('up')) { this.sel = (this.sel + 5) % 6; Sound.play('select'); }
    if (Input.was('down')) { this.sel = (this.sel + 1) % 6; Sound.play('select'); }
    UI.text(g, '音量 0~5(0 為靜音)', W / 2, 830, 18, { fill: '#e6dcff', stroke: null });
  }
};

// 指定索引的按鈕(供設定畫面混用焦點)
UI.buttonAt = function (g, scr, index, label, x, y, w, h, o) {
  scr.n = index;
  return this.button(g, scr, label, x, y, w, h, o);
};

// ---------- 了解歷史(內文與 LOGO、粉絲團連結取自 game_live 專案) ----------
Screens.history = {
  sel: 99, n: 0, sub: 0, scroll: 0, aboutH: 0, lay: null, layKey: '', dragY: null, blockedT: 0, logo: null, fb: null,

  H(key) {
    const L = HISTORY_TEXT[Save.data.lang] || HISTORY_TEXT.zh;
    return L[key] !== undefined ? L[key] : HISTORY_TEXT.zh[key];
  },

  enter() {
    this.sub = 0; this.scroll = 0; this.sel = 99; this.dragY = null; this.blockedT = 0; this.layKey = '';
    if (!this.logo) { this.logo = new Image(); this.logo.src = 'assets/images/ui/arc-logo.webp'; }
    if (!this.fb) {
      const a = document.createElement('a');
      a.href = HISTORY_LINKS.fanPage; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.tabIndex = -1;
      a.setAttribute('aria-label', 'Facebook');
      a.style.cssText = 'position:fixed;display:none;z-index:50;background:transparent;cursor:pointer;outline:none;-webkit-tap-highlight-color:transparent;';
      a.addEventListener('click', () => Sound.play('confirm'));
      document.body.appendChild(a);
      this.fb = a;
    }
  },
  leave() { if (this.fb) this.fb.style.display = 'none'; },

  card() { return this.sub === 2 ? { y: 176, h: 566, y0: 186, y1: 732 } : { y: 176, h: 646, y0: 186, y1: 812 }; },
  fbBtn() { return { x: 90, y: 752, w: 360, h: 52 }; },

  setSub(i) {
    if (i === this.sub) return;
    this.sub = i; this.scroll = 0; this.layKey = ''; Sound.play('select');
  },

  // 段落開頭標記: # 標題(金色大字)  • 項目  ◦ 次項目  > 次項目接續
  layout(g, key) {
    const ck = Save.data.lang + key;
    if (this.layKey === ck) return this.lay;
    const STY = {
      '': { x: 36, size: 17, gap: 12 },
      '#': { x: 36, size: 20, weight: 900, color: '#ffd166', before: 8, gap: 6 },
      '•': { x: 54, gx: 36, size: 17, gap: 6 },
      '◦': { x: 76, gx: 58, size: 17, gap: 6 },
      '>': { x: 76, size: 17, gap: 6 }
    };
    const lines = []; let y = 14;
    for (const para of this.H(key).split('\n')) {
      const m = /^([#•◦>]) /.exec(para), st = STY[m ? m[1] : ''], text = m ? para.slice(2) : para;
      if (st.before && lines.length) y += st.before;
      UI.lines(g, text, 468 - st.x, st.size, st.weight).forEach((t, i) => {
        lines.push({ t, y, x: st.x, size: st.size, weight: st.weight || 700, color: st.color, glyph: i === 0 && st.gx ? m[1] : '', gx: st.gx });
        y += st.size + 10;
      });
      y += st.gap;
    }
    this.layKey = ck;
    return (this.lay = { lines, h: y + 6 });
  },

  openFan() {
    Sound.play('confirm');
    const w = window.open(HISTORY_LINKS.fanPage, '_blank');
    if (w) { try { w.opener = null; } catch (e) { /* ignore */ } } else this.blockedT = 3.5;
  },

  frame(g, dt) {
    BG.draw(g, 0, [App.t * 8, App.t * 18, App.t * 36], 300);
    g.fillStyle = THEMES[0].grass[0]; g.fillRect(0, 300, W, H - 300);
    UI.dim(g, 0.6);
    UI.header(g, '了解歷史', null);

    const A = this.card(), arc = this.sub === 2, logoH = arc ? 204 : 0, viewH = A.y1 - A.y0;
    const lay = this.layout(g, 'about.body.' + this.sub);
    this.aboutH = lay.h + logoH;
    const max = Math.max(0, this.aboutH - viewH);

    // 操作:左右切分頁,上下(搖桿/十字鍵/滾輪/拖曳)捲動,捲到頭尾再按 = 換分頁
    if (Input.was('left')) this.setSub((this.sub + 2) % 3);
    if (Input.was('right')) this.setSub((this.sub + 1) % 3);
    if (Input.was('down') && this.scroll >= max - 0.5) this.setSub((this.sub + 1) % 3);
    else if (Input.was('up') && this.scroll <= 0) this.setSub((this.sub + 2) % 3);
    let d = Input.scrollAxis * 520 * dt + Input.wheel;
    const p = Input.pointers.values().next().value;
    if (p) {
      if (this.dragY === null) this.dragY = (p.y > A.y0 && p.y < A.y1) ? p.y : -1;
      else if (this.dragY >= 0) { d -= p.y - this.dragY; this.dragY = p.y; }
    } else this.dragY = null;
    this.scroll = clamp(this.scroll + d, 0, Math.max(0, this.aboutH - viewH));
    if (arc && Input.was('confirm')) this.openFan();

    // 分頁列
    for (let i = 0; i < 3; i++) {
      const x = 22 + i * 166, on = this.sub === i;
      UI.panel(g, x, 122, 160, 44, 22, on ? '#ffb02e' : 'rgba(255,255,255,.14)', on ? '#fff' : 'rgba(255,255,255,.35)');
      UI.text(g, this.H('about.' + i), x + 80, 145, 15, { fill: '#fff', stroke: on ? '#40284a' : null });
      if (UI.tapIn(x, 122, 160, 44)) this.setSub(i);
    }

    // 內文卡片
    UI.panel(g, 20, A.y, 500, A.h, 18);
    g.save();
    g.beginPath(); g.rect(26, A.y0, 488, viewH); g.clip();
    const top = A.y0 - this.scroll;
    if (arc && this.logo.complete && this.logo.naturalWidth) {
      const s = 184, h = s * this.logo.naturalHeight / this.logo.naturalWidth;
      g.drawImage(this.logo, W / 2 - s / 2, top + 6, s, h);
    }
    for (const ln of lay.lines) {
      const y = top + logoH + ln.y;
      if (y > A.y0 - 20 && y < A.y1 + 20) {
        UI.text(g, ln.t, ln.x + 4, y, ln.size, { align: 'left', weight: ln.weight, fill: ln.color || '#e6ecff', stroke: null });
        if (ln.glyph) UI.text(g, ln.glyph, ln.gx + 4, y, ln.size, { align: 'left', fill: '#ffd166', stroke: null });
      }
    }
    g.restore();
    if (max > 0) {
      g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(510, A.y0, 4, viewH);
      const th = Math.max(28, viewH * viewH / this.aboutH), ty = A.y0 + (viewH - th) * (this.scroll / max);
      g.fillStyle = 'rgba(255,209,102,.85)'; g.fillRect(510, ty, 4, th);
      if (this.scroll < max - 4) UI.text(g, '▼', 492, A.y1 - 8, 16, { fill: '#ffd166', stroke: null, alpha: 0.5 + 0.5 * Math.sin(App.t * 5) });
    }

    UI.begin(this);
    const fbShow = arc;
    if (fbShow) {
      const b = this.fbBtn();
      UI.button(g, this, this.H('about.fb'), b.x, b.y, b.w, b.h, { c1: '#8ee8ff', c2: '#3ea8ff', size: 22 });
      const r = document.getElementById('game').getBoundingClientRect();
      this.fb.style.display = 'block';
      this.fb.style.left = (r.left + b.x / W * r.width) + 'px'; this.fb.style.top = (r.top + b.y / H * r.height) + 'px';
      this.fb.style.width = (b.w / W * r.width) + 'px'; this.fb.style.height = (b.h / H * r.height) + 'px';
    } else this.fb.style.display = 'none';
    if (UI.button(g, this, '返回', 170, arc ? 826 : 832, 200, 54, { back: true }) || Input.was('back')) App.goto('menu');
    this.sel = 99;
    if (this.blockedT > 0) { this.blockedT -= dt; UI.text(g, this.H('about.fb.blocked'), W / 2, 900, 15, { fill: '#ff9fb5', sw: 4 }); }
    UI.text(g, '← → 切換分頁　↑ ↓ / 滾輪 捲動', 16, 942, 14, { align: 'left', fill: '#40284a', stroke: '#ffffff', sw: 5 });
  }
};

// ---------- CREDIT ----------
Screens.credits = {
  sel: 0, n: 0, t: 0,
  enter() { this.t = 0; },
  frame(g, dt) {
    this.t += dt;
    BG.draw(g, 2, [App.t * 8, App.t * 18, App.t * 36], 380);
    g.fillStyle = THEMES[2].grass[0]; g.fillRect(0, 380, W, H - 380);
    UI.dim(g, 0.35);
    UI.header(g, 'CREDIT', '製作名單');
    UI.panel(g, 30, 130, 480, 640, 24);
    const line = (i, y, fn) => { const k = clamp((this.t - i * 0.12) * 4, 0, 1); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 20); fn(y); g.restore(); };
    const role = (i, y, r, n) => line(i, y, () => { UI.text(g, r, 130, y, 24, { fill: '#7fe4ff', stroke: null }); UI.text(g, n, 300, y, 30, { fill: '#fff', align: 'left' }); });
    role(0, 190, '企劃', 'Arc Wang');
    role(1, 250, '程式', 'AI');
    role(2, 310, '美術', 'AI');
    line(3, 380, y => UI.text(g, '特別感謝', W / 2, y, 30, { fill: '#ffd23f' }));
    ['Kelvin Lo', 'Bubu Lin', '大王KUNI', 'KT Lee', 'Gmoto', '國見比呂', 'Greed'].forEach((n, i) =>
      line(4 + i, 436 + i * 44, y => UI.text(g, n, W / 2, y, 30, { fill: '#fff' })));
    line(11, 745, y => UI.text(g, '頂尖賽車  TOP RACE  トップレース', W / 2, y, 18, { fill: '#e6dcff', stroke: null }));
    Demo.t += dt;
    Demo.frontCar(g, W / 2, 900, 0.62, App.t);
    UI.begin(this);
    if (UI.button(g, this, '返回', 350, 850, 170, 56, { back: true }) || Input.was('back')) App.goto('menu');
    UI.nav(this);
  }
};

// ---------- 排行榜 ----------
Screens.ranking = {
  sel: 0, n: 0, hl: null, hlId: null, cid: 0, mode: 'local', list: null, loading: false, err: false,
  enter(arg) {
    this.hl = arg && arg.entry; this.hlId = arg && arg.entryId; this.sel = 0;
    this.cid = arg && arg.course !== undefined ? arg.course : (Save.data.course || 0);
    if (this.hl) Sound.music('menu');
    this.mode = Online.enabled ? 'global' : 'local'; this.load();
  },
  load() {
    this.list = null; this.err = false;
    if (!(this.mode === 'global' && Online.enabled)) { this.loading = false; return; }
    const cid = this.cid; this.loading = true;
    Online.top(cid).then(l => { if (this.cid === cid) { this.list = l; this.loading = false; } })
      .catch(() => { if (this.cid === cid) { this.err = true; this.loading = false; this.mode = 'local'; } });
  },
  frame(g, dt) {
    const c = COURSES[this.cid];
    BG.draw(g, c.themes[0], [App.t * 8, App.t * 18, App.t * 36], 300);
    g.fillStyle = THEMES[c.themes[0]].grass[0]; g.fillRect(0, 300, W, H - 300);
    UI.dim(g, 0.55);
    UI.header(g, '排行榜', null);
    const move = d => { this.cid = (this.cid + d + COURSES.length) % COURSES.length; this.hl = null; this.hlId = null; Sound.play('select'); this.load(); };
    UI.text(g, '◀', 60, 106, 30, { fill: '#ffd23f' }); UI.text(g, '▶', 480, 106, 30, { fill: '#ffd23f' });
    UI.text(g, tr(c.name) + "  " + c.en, W / 2, 106, 26, { fill: c.color[0], sw: 6 });
    if (Input.was('left') || UI.tapIn(20, 84, 90, 44)) move(-1);
    if (Input.was('right') || UI.tapIn(430, 84, 90, 44)) move(1);
    UI.panel(g, 14, 128, 512, 724, 20);
    const cols = { rank: 46, name: 86, score: 372, time: 508 };
    UI.text(g, '名次', cols.rank, 148, 16, { fill: '#7fe4ff', stroke: null });
    UI.text(g, '姓名', cols.name, 148, 16, { align: 'left', fill: '#7fe4ff', stroke: null });
    UI.text(g, '總積分', cols.score, 148, 16, { align: 'right', fill: '#7fe4ff', stroke: null });
    UI.text(g, '完成時間', cols.time, 148, 16, { align: 'right', fill: '#7fe4ff', stroke: null });
    const glob = this.mode === 'global' && Online.enabled;
    const b = glob ? (this.list || []) : Save.board(this.cid);
    if (glob && this.loading) UI.text(g, '讀取中...', W / 2, 480, 26, { fill: '#fff' });
    for (let i = 0; i < 20; i++) {
      const y = 182 + i * 33, e = b[i];
      const isHl = e && (glob ? e.id === this.hlId : e === this.hl);
      g.fillStyle = isHl ? `rgba(255,210,63,${0.35 + 0.25 * Math.sin(App.t * 8)})` : (i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.12)');
      g.fillRect(22, y - 16, 496, 32);
      const col = i === 0 ? '#ffd23f' : i === 1 ? '#e0e6f0' : i === 2 ? '#f0a070' : '#ffffff';
      UI.text(g, String(i + 1), cols.rank, y, 22, { fill: col, stroke: null });
      if (e) {
        UI.text(g, (e.clear ? '★ ' : '') + e.name, cols.name, y, 21, { align: 'left', fill: isHl ? '#fff27a' : '#fff', stroke: null });
        UI.text(g, pad(e.score, 7), cols.score, y, 22, { align: 'right', fill: col, stroke: null });
        UI.text(g, fmtTime(e.time), cols.time, y, 19, { align: 'right', fill: '#cfd8ff', stroke: null });
      } else {
        UI.text(g, '---', cols.name, y, 21, { align: 'left', fill: 'rgba(255,255,255,.4)', stroke: null });
      }
    }
    UI.text(g, '★ = 完賽通關', 30, 872, 15, { align: 'left', fill: '#ffd23f', stroke: null });
    if (this.err) UI.text(g, '無法連線,顯示本機紀錄', W - 30, 872, 15, { align: 'right', fill: '#ff9fb5', stroke: null });
    if (Online.enabled) {
      UI.panel(g, 20, 894, 112, 40, 20, glob ? '#2fc46a' : '#ffb02e', '#fff');
      UI.text(g, glob ? '全球' : '本機', 76, 914, 20, { fill: '#fff' });
      if (UI.tapIn(20, 894, 112, 40)) { this.mode = glob ? 'local' : 'global'; this.hl = null; this.hlId = null; this.err = false; Sound.play('select'); this.load(); }
    }
    UI.begin(this);
    if (UI.button(g, this, '返回主選單', 150, 884, 240, 56, { back: true }) || Input.was('back')) App.goto('menu');
    UI.nav(this);
  }
};

// ---------- 結算 ----------
Screens.result = {
  sel: 0, n: 0, t: 0, r: null, qualifies: false, done: false, name: '', input: null,
  enter() {
    this.r = Game.result; this.t = 0; this.done = false; this.sel = 0;
    this.qualifies = Save.qualifies(this.r.score, this.r.course);
    Sound.stopMusic(); Sound.setLoops({ on: false });
    Sound.jingle(this.r.clear ? 'clear' : 'over');
    this.input = document.getElementById('nameInput');
    this.input.value = Save.data.name || '';
    this.input.onkeydown = e => { if (e.key === 'Enter') this.submit(); };
    this.shown = false; this.submitted = false; this.qChecked = false;
    if (Online.enabled) Online.top(this.r.course).catch(() => {});
  },
  leave() { if (this.input) this.input.style.display = 'none'; },
  submit() {
    if (this.submitted) return;
    const nm = (this.input.value || '').trim().slice(0, 8) || 'PLAYER';
    this.submitted = true;
    const entry = { name: nm, score: this.r.score, time: Math.round(this.r.time), clear: this.r.clear };
    Save.add(entry, this.r.course);
    if (Online.enabled) {
      Sound.play('confirm');
      Online.submit(entry, this.r.course).then(id => App.goto('ranking', { entry, entryId: id, course: this.r.course }))
        .catch(() => App.goto('ranking', { entry, course: this.r.course }));
      return;
    }
    Sound.play('confirm');
    App.goto('ranking', { entry, course: this.r.course });
  },
  frame(g, dt) {
    this.t += dt;
    const r = this.r, t = this.t;
    BG.draw(g, r.clear ? 0 : 2, [App.t * 10, App.t * 22, App.t * 44], 300);
    g.fillStyle = THEMES[r.clear ? 0 : 2].grass[0]; g.fillRect(0, 300, W, H - 300);
    UI.dim(g, 0.5);
    if (r.clear) { UI.sticker(g, 'GOAL!', W / 2, 78, 84, { grad: ['#fff27a', '#ffa41f'] }); UI.text(g, '恭喜完賽!', W / 2, 140, 26, { fill: '#fff' }); }
    else { UI.sticker(g, 'GAME OVER', W / 2, 78, 70, { grad: ['#ff9fb5', '#ff3f6c'] }); UI.text(g, '時間到了…下次再挑戰!', W / 2, 140, 24, { fill: '#fff' }); }

    UI.panel(g, 30, 170, 480, 300, 22);
    const p = r.parts;
    const rows = [
      ['距離得分', p.dist], ['漂移得分', p.drift], [tr('金幣 × {0}', r.coins), p.coin],
      ['CHECK POINT 獎勵', p.cp], ['剩餘時間獎勵', p.time], ['通關獎勵', p.clear]
    ];
    rows.forEach(([lb, v], i) => {
      const k = clamp((t - 0.3 - i * 0.25) * 5, 0, 1);
      if (k <= 0) return;
      g.save(); g.globalAlpha = k; g.translate((1 - k) * -30, 0);
      UI.text(g, lb, 56, 206 + i * 44, 22, { align: 'left', fill: '#fff', stroke: null });
      UI.text(g, String(Math.floor(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','), 490, 206 + i * 44, 24, { align: 'right', fill: '#ffe680', stroke: null });
      g.restore();
    });

    const cnt = clamp((t - 1.9) / 1.4, 0, 1);
    UI.text(g, 'TOTAL SCORE', W / 2, 505, 20, { fill: '#7fe4ff', stroke: null });
    UI.digits(g, pad(r.score * cnt, 7), W / 2 - 7 * 22, 550, 44, 62);
    UI.text(g, tr('完成總時間') + '   ' + fmtTime(r.time), W / 2, 610, 24, { fill: '#fff', stroke: null });

    if (!this.done && (Input.taps.length || Input.was('confirm')) && t > 0.5 && t < 3.6) { this.t = 3.6; Input.taps.length = 0; }
    if (t > 3.6 && !this.qChecked) { this.qChecked = true; this.qualifies = Online.enabled ? Online.qualifies(r.score, r.course) : Save.qualifies(r.score, r.course); }
    if (t > 3.6) {
      this.done = true;
      if (this.qualifies) {
        UI.text(g, '進榜!請輸入你的姓名', W / 2, 652, 26, { fill: '#ffd23f' });
        this.input.style.display = 'block';
        if (!this.shown) { this.shown = true; this.input.focus(); this.input.select(); }
        UI.begin(this);
        if (UI.button(g, this, '登錄', 170, 780, 200, 60, { c1: '#8dff8a', c2: '#2fc46a' })) this.submit();
        UI.nav(this);
      } else {
        UI.text(g, '很可惜未進入前 20 名', W / 2, 660, 24, { fill: '#fff' });
        UI.begin(this);
        if (UI.button(g, this, '前往排行榜', 130, 720, 280, 60, { c1: '#ffe680', c2: '#ffb02e' })) App.goto('ranking', { course: this.r.course });
        UI.nav(this);
      }
    }
  }
};
