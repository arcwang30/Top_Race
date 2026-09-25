'use strict';

// 玩家自訂頭像:照片只存在這台裝置的瀏覽器(localStorage),不會上傳。
const Face = {
  KEY: 'toprace.face.v1',
  img: null,
  has: false,
  meta: null,

  defaultMeta() { return { el: [0.35, 0.43], er: [0.65, 0.43], m: [0.5, 0.74] }; },

  load() {
    this.meta = this.defaultMeta();
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return;
      const o = JSON.parse(raw), im = new Image();
      if (o.meta) this.meta = Object.assign(this.meta, o.meta);
      im.onload = () => {
        const c = document.createElement('canvas'); c.width = c.height = 128;
        c.getContext('2d').drawImage(im, 0, 0, 128, 128);
        this.img = c; this.has = true;
      };
      im.src = o.data;
    } catch (e) { /* ignore */ }
  },

  save(canvas, meta) {
    this.img = canvas; this.has = true;
    this.meta = meta || this.defaultMeta();
    this.store();
  },

  store() {
    try { localStorage.setItem(this.KEY, JSON.stringify({ data: this.img.toDataURL('image/jpeg', 0.86), meta: this.meta })); } catch (e) { /* ignore */ }
  },

  clear() {
    this.img = null; this.has = false; this.meta = this.defaultMeta();
    try { localStorage.removeItem(this.KEY); } catch (e) { /* ignore */ }
  },

  // ---- 表情:直接疊在臉上(笑:彎眼、大嘴、腮紅;哭:八字眉、淚水、下垂的嘴) ----
  overlay(g, P, r, mood, t, onDark) {
    if (mood !== 'happy' && mood !== 'sad') return;
    const lw = Math.max(1.5, r * 0.1), DK = '#40284a';
    const line = (build, w, dark) => {
      g.lineCap = 'round'; g.lineJoin = 'round';
      build(); g.strokeStyle = '#ffffff'; g.lineWidth = w * (dark ? 2.1 : 1.3); g.stroke();
      if (dark) { build(); g.strokeStyle = DK; g.lineWidth = w; g.stroke(); }
    };
    const dark = !onDark;
    if (mood === 'happy') {
      for (const [x, y] of [[P.lx, P.ly], [P.rx, P.ry]]) {
        line(() => { g.beginPath(); g.arc(x, y + r * 0.07, r * 0.16, Math.PI * 1.1, Math.PI * 1.9); }, lw, dark);
        g.fillStyle = 'rgba(255,110,150,.55)'; g.beginPath(); g.ellipse(x + (x < P.mx ? -r * 0.05 : r * 0.05), y + r * 0.3, r * 0.17, r * 0.09, 0, 0, TAU); g.fill();
      }
      g.beginPath(); g.moveTo(P.mx - r * 0.3, P.my - r * 0.05); g.quadraticCurveTo(P.mx, P.my + r * 0.46, P.mx + r * 0.3, P.my - r * 0.05); g.closePath();
      g.fillStyle = '#c2334f'; g.fill(); g.lineWidth = lw * 0.8; g.strokeStyle = '#ffffff'; g.stroke();
      g.fillStyle = '#ff9fbd'; g.beginPath(); g.ellipse(P.mx, P.my + r * 0.15, r * 0.12, r * 0.06, 0, 0, TAU); g.fill();
    } else {
      line(() => { g.beginPath(); g.moveTo(P.lx - r * 0.22, P.ly - r * 0.14); g.lineTo(P.lx + r * 0.16, P.ly - r * 0.28); }, lw * 0.9, dark);
      line(() => { g.beginPath(); g.moveTo(P.rx + r * 0.22, P.ry - r * 0.14); g.lineTo(P.rx - r * 0.16, P.ry - r * 0.28); }, lw * 0.9, dark);
      for (const [x, y, ph] of [[P.lx, P.ly, 0], [P.rx, P.ry, 0.5]]) {
        for (let k = 0; k < 2; k++) {
          const u = ((t * 1.7 + ph + k * 0.5) % 1), yy = y + r * 0.1 + u * r * 0.75;
          g.save(); g.globalAlpha = 1 - u * 0.7;
          g.fillStyle = '#7fd8ff'; g.beginPath(); g.ellipse(x + (k ? r * 0.06 : -r * 0.06), yy, r * 0.075, r * 0.11, 0, 0, TAU); g.fill();
          g.lineWidth = 1.5; g.strokeStyle = '#ffffff'; g.stroke();
          g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(x + (k ? r * 0.04 : -r * 0.08), yy - r * 0.03, r * 0.02, r * 0.035, 0, 0, TAU); g.fill();
          g.restore();
        }
      }
      line(() => { g.beginPath(); g.arc(P.mx, P.my + r * 0.2, r * 0.24, Math.PI * 1.15, Math.PI * 1.85); }, lw, dark);
    }
  },

  points(cx, cy, r) {
    const m = this.meta, X = n => cx - r + n * 2 * r, Y = n => cy - r + n * 2 * r;
    return { lx: X(m.el[0]), ly: Y(m.el[1]), rx: X(m.er[0]), ry: Y(m.er[1]), mx: X(m.m[0]), my: Y(m.m[1]) };
  },

  // 玩家照片(圓形裁切)+ 表情
  head(g, cx, cy, r, mood, t, o) {
    o = o || {};
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip();
    g.drawImage(this.img, cx - r, cy - r, r * 2, r * 2);
    if (mood === 'sad') { g.fillStyle = 'rgba(70,100,170,.24)'; g.fillRect(cx - r, cy - r, r * 2, r * 2); }
    g.restore();
    if (o.ring !== false) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.lineWidth = Math.max(2, r * 0.09); g.strokeStyle = '#40284a'; g.stroke(); }
    g.save(); g.beginPath(); g.arc(cx, cy, r * 1.02, 0, TAU); g.clip();
    this.overlay(g, this.points(cx, cy, r), r, mood, t || 0, false);
    g.restore();
  },

  // 預設熊貓頭像(沒設定照片時使用)
  pandaHead(g, cx, cy, r, mood, t) {
    const E = (x, y, rx, ry, fill, rot) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, TAU); g.fillStyle = fill; g.fill(); g.lineWidth = Math.max(1.5, r * 0.06); g.strokeStyle = '#40284a'; g.stroke(); };
    E(cx - r * 0.78, cy - r * 0.78, r * 0.36, r * 0.36, '#2b2833'); E(cx + r * 0.78, cy - r * 0.78, r * 0.36, r * 0.36, '#2b2833');
    E(cx, cy, r, r * 0.94, '#ffffff');
    E(cx - r * 0.38, cy - r * 0.06, r * 0.22, r * 0.28, '#2b2833', 0.4); E(cx + r * 0.38, cy - r * 0.06, r * 0.22, r * 0.28, '#2b2833', -0.4);
    if (mood !== 'happy') { g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - r * 0.38, cy - r * 0.08, r * 0.07, 0, TAU); g.arc(cx + r * 0.38, cy - r * 0.08, r * 0.07, 0, TAU); g.fill(); }
    g.fillStyle = '#2b2833'; g.beginPath(); g.ellipse(cx, cy + r * 0.24, r * 0.12, r * 0.08, 0, 0, TAU); g.fill();
    if (mood === 'normal') { g.beginPath(); g.arc(cx, cy + r * 0.28, r * 0.13, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = Math.max(1.5, r * 0.05); g.strokeStyle = '#2b2833'; g.stroke(); }
    const P = { lx: cx - r * 0.38, ly: cy - r * 0.06, rx: cx + r * 0.38, ry: cy - r * 0.06, mx: cx, my: cy + r * 0.42 };
    this.overlay(g, P, r, mood, t || 0, true);
  },

  // HUD 頭像:圓框 + 依狀態彈跳(笑)/ 顫抖(哭)
  avatar(g, cx, cy, r, mood, t) {
    let ox = 0, oy = 0;
    if (mood === 'happy') oy = -Math.abs(Math.sin(t * 12)) * r * 0.16;
    if (mood === 'sad') ox = Math.sin(t * 40) * r * 0.05;
    const ring = mood === 'happy' ? '#ffd23f' : mood === 'sad' ? '#7fb8ff' : 'rgba(255,255,255,.85)';
    g.save(); g.translate(ox, oy);
    g.beginPath(); g.arc(cx, cy, r + 4, 0, TAU); g.fillStyle = 'rgba(30,20,60,.65)'; g.fill();
    if (this.has) this.head(g, cx, cy, r, mood, t, { ring: false }); else this.pandaHead(g, cx, cy, r * 0.86, mood, t);
    g.beginPath(); g.arc(cx, cy, r + 3, 0, TAU); g.lineWidth = 4; g.strokeStyle = ring; g.stroke();
    if (mood === 'happy') {
      g.fillStyle = '#fff3a0';
      for (let i = 0; i < 3; i++) {
        const a = t * 3 + i * 2.1, sx = cx + Math.cos(a) * (r + 9), sy = cy + Math.sin(a) * (r + 9);
        g.beginPath(); g.moveTo(sx, sy - 5); g.lineTo(sx + 2, sy - 2); g.lineTo(sx + 5, sy); g.lineTo(sx + 2, sy + 2); g.lineTo(sx, sy + 5); g.lineTo(sx - 2, sy + 2); g.lineTo(sx - 5, sy); g.lineTo(sx - 2, sy - 2); g.closePath(); g.fill();
      }
    }
    g.restore();
  }
};

Face.load();
