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
    Spr.drawBuggy(g, { view: 'front', wheel: t * 40, t });
    g.restore();
  }
};

const rearCar = (g, x, y, sc, t, boost, wheel) => {
  g.save(); g.translate(x, y + Math.sin(t * 34) * 1.2); g.scale(sc, sc);
  Spr.drawBuggy(g, { view: 'rear', wheel, t, boost });
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
    UI.text(g, '© 2026 Arc Wang', W / 2, 930, 18, { fill: '#e6dcff', stroke: null });
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
      ['開始遊戲', '#8dff8a', '#2fc46a', 'game'], ['操作說明', '#8ee8ff', '#3ea8ff', 'howto'],
      ['排行榜', '#ffe680', '#ffb02e', 'ranking'], ['設定', '#d6b3ff', '#9a6bff', 'settings'], ['CREDIT', '#ffb3d1', '#ff6b9a', 'credits']
    ];
    items.forEach(([label, c1, c2, dest], i) => {
      if (UI.button(g, this, label, 110, 640 + i * 58, 320, 50, { c1, c2 })) {
        if (dest === 'game' && Save.data.gyro && Input.touchMode) Input.enableGyro();
        App.goto(dest);
      }
    });
    UI.nav(this);
    UI.text(g, Input.padConnected ? '↑↓ / A 選擇' : '↑ ↓  選擇    Enter  決定', W / 2, 940, 15, { fill: '#e6dcff', stroke: null });
  }
};

// ---------- 遊戲 ----------
Screens.game = {
  paused: false, sel: 0, n: 0,
  enter() { Game.newRun(); this.paused = false; this.sel = 0; Sound.music('s1'); },
  leave() { Sound.setLoops({ on: false }); Input.virtual = []; },
  pause() { if (!this.paused && Game.s.phase !== 'over') { this.paused = true; this.sel = 0; Sound.setLoops({ on: false }); } },
  frame(g, dt) {
    if (!this.paused && (Input.was('pause') || Input.taps.some(t => Math.hypot(t.x - 490, t.y - 106) < 30))) this.pause();
    if (!this.paused) Game.update(dt);
    if (App.name !== 'game') return;
    Game.draw(g);
    if (this.paused) {
      UI.dim(g, 0.6);
      UI.text(g, 'PAUSE', W / 2, 260, 80, { fill: '#fff27a', sw: 12 });
      UI.begin(this);
      if (UI.button(g, this, '繼續遊戲', 110, 380, 320, 62, { c1: '#8dff8a', c2: '#2fc46a' }) || Input.was('pause')) this.paused = false;
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
    UI.header(g, '操作說明', ['遊戲規則', '操作方式', '道具與障礙'][this.page] + `  (${this.page + 1}/3)`);
    UI.panel(g, 20, 130, 500, 690, 22);

    if (this.page === 0) this.p1(g); else if (this.page === 1) this.p2(g); else this.p3(g);

    const pv = () => { this.page = (this.page + 2) % 3; Sound.play('select'); };
    const nx = () => { this.page = (this.page + 1) % 3; Sound.play('select'); };
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
      ['💩', '避開障礙', '踩到大便會打滑失控;撞到石塊會整台翻車!也小心別撞到其他賽車。'],
      ['💰', '收集道具', '金幣加分、氮氣瓶最多可持有 5 瓶。'],
      ['🏆', '排行榜', '遊戲結束後,積分前 20 名可登錄姓名、留名排行榜。']
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
      ['油門', 'SPACE', 'RT / A 鈕', '油門按鈕'],
      ['剎車', '↓ / S / ALT', 'LT / B 鈕', '剎車按鈕'],
      ['氮氣', '↑ / W', 'X / Y 鈕', '氮氣按鈕']
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
      ['nitro', '氮氣瓶', '最多 5 瓶。使用後極速加速且無敵,可撞飛障礙與敵車!', 34, 0],
      ['poop', '大便', '踩到會打滑轉圈、失去控制並減速。', 64, 0],
      ['rock', '石塊', '撞到會整台翻車,速度歸零。', 70, 0],
      ['enemy1', '呱呱 (青蛙)', '龜速直行的路障車,超車時小心。', 0, 1],
      ['enemy2', '兔兔 (兔子)', '左右蛇行前進,難以預測。', 0, 1],
      ['enemy3', '黑喵 (黑貓)', '速度快,還會擋住你的路線!', 0, 1]
    ];
    items.forEach(([nm, t, d, w, car], i) => {
      const y = 158 + i * 88, im = Spr.get(nm), sw = car ? 96 : w, sh = sw * im.height / im.width;
      const k = Math.min(1, 70 / sh);
      g.drawImage(im, 70 - sw * k / 2, y + 40 - sh * k / 2, sw * k, sh * k);
      UI.text(g, t, 130, y + 16, 24, { align: 'left', fill: '#fff27a', stroke: null });
      UI.wrap(g, d, 130, y + 44, 380, 24, 18, { fill: '#fff' });
    });
  }
};

// ---------- 設定 ----------
Screens.settings = {
  sel: 0, n: 0,
  enter() { this.sel = 0; },
  frame(g, dt) {
    BG.draw(g, 1, [App.t * 8, App.t * 18, App.t * 36], 380);
    g.fillStyle = THEMES[1].grass[0]; g.fillRect(0, 380, W, H - 380);
    UI.dim(g, 0.5);
    UI.header(g, '設定', 'SETTINGS');
    const rows = [['音樂', 'music', 'BGM'], ['音效', 'sfx', 'SE']];
    UI.begin(this);
    rows.forEach(([label, key, en], i) => {
      const y = 170 + i * 150, sel = this.sel === i;
      UI.panel(g, 30, y, 480, 130, 24, sel ? 'rgba(255,210,63,.28)' : 'rgba(30,20,60,.55)', sel ? '#ffd23f' : 'rgba(255,255,255,.35)');
      UI.text(g, label, 60, y + 32, 32, { align: 'left', fill: '#fff' });
      UI.text(g, en, 170, y + 34, 18, { align: 'left', fill: '#cfd8ff', stroke: null });
      UI.text(g, Save.data[key] === 0 ? 'MUTE' : String(Save.data[key]), 470, y + 32, 34, { align: 'right', fill: '#ffd23f' });
      const v = Save.data[key];
      for (let k = 0; k < 5; k++) {
        const bx = 80 + k * 66, bh = 30 + k * 6;
        g.fillStyle = k < v ? (key === 'music' ? '#7fe4ff' : '#ffb347') : 'rgba(255,255,255,.2)';
        g.beginPath(); g.roundRect(bx, y + 112 - bh, 52, bh, 8); g.fill();
        g.lineWidth = 3; g.strokeStyle = '#40284a'; g.stroke();
        if (UI.tapIn(bx - 6, y + 40, 64, 84)) { this.sel = i; this.setVol(key, k + 1 === v ? k : k + 1); }
      }
      UI.text(g, '−', 48, y + 90, 40, { fill: '#fff' }); UI.text(g, '+', 492, y + 90, 40, { fill: '#fff' });
      if (UI.tapIn(30, y + 60, 44, 66)) { this.sel = i; this.setVol(key, v - 1); }
      if (UI.tapIn(470, y + 60, 44, 66)) { this.sel = i; this.setVol(key, v + 1); }
      if (Input.ptr.moved && UI.inside(Input.ptr.x, Input.ptr.y, 30, y, 480, 130)) this.sel = i;
      if (sel) {
        if (Input.was('left')) this.setVol(key, v - 1);
        if (Input.was('right')) this.setVol(key, v + 1);
      }
    });
    // 陀螺儀
    const gy = 470, gsel = this.sel === 2;
    UI.panel(g, 30, gy, 480, 110, 24, gsel ? 'rgba(255,210,63,.28)' : 'rgba(30,20,60,.55)', gsel ? '#ffd23f' : 'rgba(255,255,255,.35)');
    UI.text(g, '傾斜控制', 60, gy + 34, 30, { align: 'left' });
    UI.text(g, '手機陀螺儀轉向', 60, gy + 76, 18, { align: 'left', fill: '#cfd8ff', stroke: null });
    const on = Save.data.gyro;
    UI.panel(g, 350, gy + 26, 130, 58, 29, on ? '#2fc46a' : 'rgba(255,255,255,.18)', '#fff');
    UI.text(g, on ? 'ON' : 'OFF', 415, gy + 56, 30, { fill: '#fff' });
    const toggle = () => { Save.data.gyro = !Save.data.gyro; Save.store(); Sound.play('confirm'); if (Save.data.gyro) Input.enableGyro(); };
    if (UI.tapIn(30, gy, 480, 110)) { this.sel = 2; toggle(); }
    if (Input.ptr.moved && UI.inside(Input.ptr.x, Input.ptr.y, 30, gy, 480, 110)) this.sel = 2;
    if (gsel && (Input.was('left') || Input.was('right') || Input.was('confirm'))) toggle();

    this.sel = clamp(this.sel, 0, 3);
    const backHit = UI.buttonAt(g, this, 3, '返回', 170, 640, 200, 60, { back: true });
    if (backHit || Input.was('back')) App.goto('menu');
    if (Input.was('up')) { this.sel = (this.sel + 3) % 4; Sound.play('select'); }
    if (Input.was('down')) { this.sel = (this.sel + 1) % 4; Sound.play('select'); }
    UI.text(g, '音量 0~5(0 為靜音)', W / 2, 740, 20, { fill: '#e6dcff', stroke: null });
  },
  setVol(key, v) {
    v = clamp(v, 0, 5);
    if (v === Save.data[key]) return;
    Sound.setVol(key, v);
    if (key === 'sfx') Sound.play('coin'); else Sound.play('select');
  }
};

// 指定索引的按鈕(供設定畫面混用焦點)
UI.buttonAt = function (g, scr, index, label, x, y, w, h, o) {
  scr.n = index;
  return this.button(g, scr, label, x, y, w, h, o);
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
    ['Kelvin Lo', 'Bubu Lin', '大王KUNI', 'KT Lee', 'Gmoto', '國見比呂'].forEach((n, i) =>
      line(4 + i, 440 + i * 50, y => UI.text(g, n, W / 2, y, 30, { fill: '#fff' })));
    line(10, 745, y => UI.text(g, '頂尖賽車  TOP RACE  トップレース', W / 2, y, 18, { fill: '#e6dcff', stroke: null }));
    Demo.t += dt;
    Demo.frontCar(g, W / 2, 900, 0.62, App.t);
    UI.begin(this);
    if (UI.button(g, this, '返回', 350, 850, 170, 56, { back: true }) || Input.was('back')) App.goto('menu');
    UI.nav(this);
  }
};

// ---------- 排行榜 ----------
Screens.ranking = {
  sel: 0, n: 0, hl: null,
  enter(arg) { this.hl = arg && arg.entry; this.sel = 0; if (this.hl) Sound.music('menu'); },
  frame(g, dt) {
    BG.draw(g, 0, [App.t * 8, App.t * 18, App.t * 36], 300);
    g.fillStyle = THEMES[0].grass[0]; g.fillRect(0, 300, W, H - 300);
    UI.dim(g, 0.55);
    UI.header(g, '排行榜', 'RANKING  TOP 20');
    UI.panel(g, 14, 122, 512, 730, 20);
    const cols = { rank: 46, name: 86, score: 372, time: 508 };
    UI.text(g, '名次', cols.rank, 144, 16, { fill: '#7fe4ff', stroke: null });
    UI.text(g, '姓名', cols.name, 144, 16, { align: 'left', fill: '#7fe4ff', stroke: null });
    UI.text(g, '總積分', cols.score, 144, 16, { align: 'right', fill: '#7fe4ff', stroke: null });
    UI.text(g, '完成時間', cols.time, 144, 16, { align: 'right', fill: '#7fe4ff', stroke: null });
    const b = Save.data.board;
    for (let i = 0; i < 20; i++) {
      const y = 180 + i * 33, e = b[i];
      const isHl = e && e === this.hl;
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
    this.qualifies = Save.qualifies(this.r.score);
    Sound.stopMusic(); Sound.setLoops({ on: false });
    Sound.jingle(this.r.clear ? 'clear' : 'over');
    this.input = document.getElementById('nameInput');
    this.input.value = Save.data.name || '';
    this.input.onkeydown = e => { if (e.key === 'Enter') this.submit(); };
    this.shown = false; this.submitted = false;
  },
  leave() { if (this.input) this.input.style.display = 'none'; },
  submit() {
    if (this.submitted) return;
    const nm = (this.input.value || '').trim().slice(0, 8) || 'PLAYER';
    this.submitted = true;
    const entry = { name: nm, score: this.r.score, time: Math.round(this.r.time), clear: this.r.clear };
    Save.add(entry);
    Sound.play('confirm');
    App.goto('ranking', { entry });
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
      ['距離得分', p.dist], ['漂移得分', p.drift], [`金幣 × ${r.coins}`, p.coin],
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
    UI.text(g, `完成總時間   ${fmtTime(r.time)}`, W / 2, 610, 24, { fill: '#fff', stroke: null });

    if (!this.done && (Input.taps.length || Input.was('confirm')) && t > 0.5 && t < 3.6) { this.t = 3.6; Input.taps.length = 0; }
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
        if (UI.button(g, this, '前往排行榜', 130, 720, 280, 60, { c1: '#ffe680', c2: '#ffb02e' })) App.goto('ranking', {});
        UI.nav(this);
      }
    }
  }
};
