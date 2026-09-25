'use strict';

// 鍵盤 / Xbox 手把 / 觸控(虛擬按鈕、陀螺儀)統一輸入
const Input = {
  keys: new Set(),
  pressed: new Set(),
  pointers: new Map(),
  starts: new Map(),
  taps: [],
  ptr: { x: -1, y: -1, moved: false },
  touchMode: false,
  virtual: [],
  gyroVal: 0,
  gyroActive: false,
  wheel: 0,
  scrollAxis: 0,

  steer: 0, throttle: false, brake: false, nitro: false,
  padConnected: false,
  _padPrev: {},
  _vPrev: {},

  KEYMAP: {
    ArrowUp: ['up'], KeyW: ['up'],
    ArrowDown: ['down'], KeyS: ['down'],
    ArrowLeft: ['left'], KeyA: ['left'],
    ArrowRight: ['right'], KeyD: ['right'],
    Enter: ['confirm'], NumpadEnter: ['confirm'], Space: ['confirm', 'nitro'],
    Escape: ['back', 'pause'], Backspace: ['back'], KeyP: ['pause'], KeyC: ['view']
  },

  init(canvas) {
    this.canvas = canvas;
    window.addEventListener('keydown', e => {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'AltLeft', 'AltRight', 'Backspace'].includes(e.code)) e.preventDefault();
      if (!e.repeat) (this.KEYMAP[e.code] || []).forEach(a => this.pressed.add(a));
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); });
    const releaseAll = () => { this.keys.clear(); this.pointers.clear(); this.starts.clear(); };
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
    const endTouch = e => { if (!e.touches || e.touches.length === 0) { this.pointers.clear(); this.starts.clear(); } };
    document.addEventListener('touchend', endTouch);
    document.addEventListener('touchcancel', endTouch);
    canvas.addEventListener('lostpointercapture', e => { this.pointers.delete(e.pointerId); this.starts.delete(e.pointerId); });

    const pos = e => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    };
    canvas.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') this.touchMode = true;
      const p = pos(e);
      this.pointers.set(e.pointerId, p);
      this.starts.set(e.pointerId, { x: p.x, y: p.y, t: performance.now() });
      this.ptr.x = p.x; this.ptr.y = p.y; this.ptr.moved = true;
      this.pressed.add('anykey');
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
    });
    canvas.addEventListener('pointermove', e => {
      const p = pos(e);
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, p);
      if (e.pointerType !== 'touch') { this.ptr.x = p.x; this.ptr.y = p.y; this.ptr.moved = true; }
    });
    // 點擊在「放開」時才成立(移動很少);水平滑動 = 左 / 右(選單用手指左右滑切換)
    const up = (e, cancel) => {
      const st = this.starts.get(e.pointerId), p = pos(e);
      this.pointers.delete(e.pointerId); this.starts.delete(e.pointerId);
      if (!st || cancel) return;
      const dx = p.x - st.x, dy = p.y - st.y;
      if (Math.hypot(dx, dy) < 24) this.taps.push({ x: st.x, y: st.y });
      else if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) { this.pressed.add(dx > 0 ? 'right' : 'left'); this.pressed.add('anykey'); }
    };
    canvas.addEventListener('pointerup', e => up(e, false));
    canvas.addEventListener('pointercancel', e => up(e, true));
    // 鎖住整頁的拖曳 / 縮放 / 下拉重新整理
    const stop = e => { if (!(e.target && e.target.tagName === 'INPUT')) e.preventDefault(); };
    document.addEventListener('touchmove', stop, { passive: false });
    document.addEventListener('gesturestart', stop);
    document.addEventListener('dblclick', stop);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => { this.wheel += e.deltaY; e.preventDefault(); }, { passive: false });
    window.addEventListener('keydown', e => { if (!(e.target && e.target.tagName === 'INPUT')) this.pressed.add('anykey'); });

    window.addEventListener('deviceorientation', e => {
      if (e.gamma === null || e.gamma === undefined || e.beta === null) return;
      // 直握手機像轉方向盤:以重力在螢幕平面的傾角作為轉向(順時針為正)
      const b = e.beta * Math.PI / 180, gm = e.gamma * Math.PI / 180;
      this.gyroVal = Math.atan2(Math.cos(b) * Math.sin(gm), Math.sin(b)) * 180 / Math.PI;
      this.gyroActive = true;
    });
  },

  async enableGyro() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission();
        return r === 'granted';
      }
    } catch (e) { return false; }
    return true;
  },

  was(a) { return this.pressed.has(a); },

  lockUntil: 0,

  update() {
    if (performance.now() < this.lockUntil) { this.pressed.clear(); this.taps.length = 0; }
    const k = this.keys;
    const key = (...c) => c.some(x => k.has(x));
    let left = key('ArrowLeft', 'KeyA'), right = key('ArrowRight', 'KeyD');
    let thr = key('KeyW'), brk = key('AltLeft', 'AltRight'), nit = key('Space');
    let analog = 0, sy = (key('ArrowDown', 'KeyS') ? 1 : 0) - (key('ArrowUp', 'KeyW') ? 1 : 0);

    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    let gp = null;
    for (const p of pads) if (p && p.connected) { gp = p; break; }
    this.padConnected = !!gp;
    if (gp) {
      const b = i => !!(gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > 0.4));
      const ax = gp.axes[0] || 0;
      if (Math.abs(ax) > 0.18) analog = ax;
      left = left || b(14); right = right || b(15);
      thr = thr || b(7) || b(0);
      brk = brk || b(6) || b(1);
      nit = nit || b(2) || b(3);
      const edge = (i, ...acts) => {
        const now = b(i);
        if (now && !this._padPrev[i]) acts.forEach(a => { this.pressed.add(a); this.pressed.add('anykey'); });
        this._padPrev[i] = now;
      };
      edge(12, 'up'); edge(13, 'down'); edge(14, 'left'); edge(15, 'right');
      edge(0, 'confirm'); edge(1, 'back'); edge(9, 'confirm', 'pause'); edge(2, 'nitro'); edge(3, 'nitro'); edge(8, 'view'); edge(11, 'view');
      const ay = gp.axes[1] || 0;
      if (Math.abs(ay) > 0.3) sy += ay; if (b(13)) sy += 1; if (b(12)) sy -= 1;
      const vUp = ay < -0.6, vDown = ay > 0.6;
      if (vUp && !this._padPrev.vu) this.pressed.add('up');
      if (vDown && !this._padPrev.vd) this.pressed.add('down');
      this._padPrev.vu = vUp; this._padPrev.vd = vDown;
      const hLeft = ax < -0.6, hRight = ax > 0.6;
      if (hLeft && !this._padPrev.hl) this.pressed.add('left');
      if (hRight && !this._padPrev.hr) this.pressed.add('right');
      this._padPrev.hl = hLeft; this._padPrev.hr = hRight;
    }

    const vnow = {};
    for (const v of this.virtual) {
      for (const p of this.pointers.values()) {
        if (Math.hypot(p.x - v.x, p.y - v.y) <= v.r * 1.18) { vnow[v.id] = true; break; }
      }
    }
    for (const id in vnow) if (!this._vPrev[id] && id === 'nitro') this.pressed.add('nitro');
    this._vPrev = vnow;
    left = left || vnow.left; right = right || vnow.right;
    thr = thr || vnow.throttle; brk = brk || vnow.brake; nit = nit || vnow.nitro;

    let s = (right ? 1 : 0) - (left ? 1 : 0);
    if (analog) s = analog;
    if (Save.data.gyro && this.gyroActive && this.touchMode) {
      const g = Math.abs(this.gyroVal) < 3 ? 0 : this.gyroVal;
      s = clamp(g / 22, -1, 1);
    }
    if (Save.data.autoGas) thr = true;
    this.steer = clamp(s, -1, 1);
    this.scrollAxis = clamp(sy, -1, 1);
    this.throttle = !!thr; this.brake = !!brk; this.nitro = !!nit;
  },

  endFrame() {
    this.pressed.clear();
    this.wheel = 0;
    this.taps.length = 0;
    this.ptr.moved = false;
  }
};
