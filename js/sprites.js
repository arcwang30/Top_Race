'use strict';

// 所有美術皆為程式繪製(可愛日式卡通風)。
// 玩家車輛可置換:於 assets/images/ 放入 player_rear.png(背面)/ player_front.png(正面)即會自動取代。
const Spr = (() => {
  const OUT = '#40284a';
  const cache = {};

  function mk(w, h, fn) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    fn(c.getContext('2d'), w, h);
    return c;
  }
  function rrect(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function fs(g, fill, lw, stroke) {
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (lw) { g.lineWidth = lw; g.strokeStyle = stroke || OUT; g.lineJoin = 'round'; g.stroke(); }
  }
  function R(g, x, y, w, h, r, fill, lw) { g.beginPath(); rrect(g, x, y, w, h, r); fs(g, fill, lw === undefined ? 3 : lw); }
  function E(g, x, y, rx, ry, fill, lw, rot) { g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, TAU); fs(g, fill, lw === undefined ? 3 : lw); }
  function poly(g, pts, fill, lw) {
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); fs(g, fill, lw === undefined ? 3 : lw);
  }
  function glow(g, x, y, r, color, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.save(); g.globalAlpha = a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore();
  }
  function bar(g, x1, y1, x2, y2) {
    g.lineCap = 'round';
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineWidth = 11; g.strokeStyle = OUT; g.stroke();
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineWidth = 5; g.strokeStyle = '#eef1fa'; g.stroke();
  }

  // ---------- 賽車(背面 / 正面) ----------
  function wheel(g, cx, ph, w, h) {
    w = w || 38; h = h || 64;
    R(g, cx - w / 2, -h, w, h, 13, '#2c2a3c', 3);
    g.save(); g.beginPath(); rrect(g, cx - w / 2 + 3, -h + 3, w - 6, h - 6, 10); g.clip();
    g.fillStyle = '#5a5872';
    const p = ((ph % 14) + 14) % 14;
    for (let k = -1; k < 6; k++) g.fillRect(cx - w / 2 + 4, -h + k * 14 + p, w - 8, 5);
    g.restore();
  }

  function cage(g) {
    g.lineCap = 'round'; g.lineJoin = 'round';
    const path = () => {
      g.beginPath(); g.moveTo(-48, -60); g.lineTo(-48, -152); g.quadraticCurveTo(-48, -174, -26, -174);
      g.lineTo(26, -174); g.quadraticCurveTo(48, -174, 48, -152); g.lineTo(48, -60);
    };
    path(); g.lineWidth = 11; g.strokeStyle = OUT; g.stroke();
    path(); g.lineWidth = 5; g.strokeStyle = '#eef1fa'; g.stroke();
  }

  function riderRear(g, kind, t) {
    const w = Math.sin(t * 9) * 6;
    const scarf = c => {
      g.beginPath(); g.moveTo(-12, -102); g.quadraticCurveTo(-38 + w, -104, -66 + w * 1.6, -90 + w * 0.6);
      g.lineTo(-64 + w * 1.6, -77 + w * 0.6); g.quadraticCurveTo(-38 + w, -92, -10, -90); g.closePath(); fs(g, c, 2.5);
    };
    if (kind === 'panda') {
      scarf('#ff5c7a');
      E(g, -32, -84, 9, 19, '#2b2833', 2.5, 0.3); E(g, 32, -84, 9, 19, '#2b2833', 2.5, -0.3);
      E(g, 0, -84, 27, 24, '#ffffff');
      E(g, 0, -122, 29, 26, '#ffffff');
      g.beginPath(); g.ellipse(0, -126, 31, 27, 0, Math.PI, TAU); g.closePath(); fs(g, '#ff4d5e', 3);
      E(g, 0, -143, 5, 12, '#fff', 0);
      E(g, -25, -148, 10, 10, '#2b2833', 2.5); E(g, 25, -148, 10, 10, '#2b2833', 2.5);
    } else if (kind === 'cat') {
      g.beginPath(); g.moveTo(34, -66); g.quadraticCurveTo(70, -70, 58, -112);
      g.lineCap = 'round'; g.lineWidth = 14; g.strokeStyle = OUT; g.stroke();
      g.lineWidth = 8; g.strokeStyle = '#4a4a5c'; g.stroke();
      scarf('#ffd23f');
      E(g, 0, -84, 26, 23, '#4a4a5c');
      E(g, 0, -120, 27, 24, '#4a4a5c');
      poly(g, [[-27, -126], [-24, -154], [-6, -140]], '#4a4a5c'); poly(g, [[27, -126], [24, -154], [6, -140]], '#4a4a5c');
      poly(g, [[-22, -132], [-21, -147], [-11, -139]], '#ff9fbd', 0); poly(g, [[22, -132], [21, -147], [11, -139]], '#ff9fbd', 0);
    } else if (kind === 'bunny') {
      scarf('#7c5cff');
      E(g, 0, -84, 25, 23, '#ffd9ea');
      E(g, -11, -160, 8, 24, '#ffd9ea', 3, -0.12); E(g, 11, -160, 8, 24, '#ffd9ea', 3, 0.12);
      E(g, -11, -158, 3.5, 16, '#ff9fbd', 0, -0.12); E(g, 11, -158, 3.5, 16, '#ff9fbd', 0, 0.12);
      E(g, 0, -120, 25, 23, '#ffd9ea');
    } else {
      scarf('#ff7a3d');
      E(g, 0, -84, 26, 22, '#5ac858');
      E(g, 0, -116, 31, 21, '#5ac858');
      E(g, -17, -134, 11, 11, '#5ac858'); E(g, 17, -134, 11, 11, '#5ac858');
      E(g, -19, -137, 3.5, 3.5, '#fff', 0); E(g, 15, -137, 3.5, 3.5, '#fff', 0);
      R(g, -31, -124, 62, 8, 4, '#ffd23f', 2.5);
    }
  }

  function buggyRear(g, o) {
    const body = o.body || '#3ea8ff', acc = o.acc || '#ffd23f';
    g.save(); g.globalAlpha = 0.28; E(g, 0, -2, 106, 13, '#000', 0); g.restore();
    wheel(g, -88, o.wheel || 0); wheel(g, 88, o.wheel || 0);
    R(g, -80, -36, 160, 10, 4, '#4a4860', 3);
    cage(g);
    R(g, -44, -98, 88, 44, 14, '#3d3d55', 3);
    riderRear(g, o.rider || 'panda', o.t || 0);
    R(g, -72, -62, 144, 44, 15, body, 3);
    R(g, -64, -46, 128, 8, 4, acc, 0);
    const lc = o.brake ? '#ff2030' : '#c0283c';
    R(g, -64, -58, 22, 12, 5, lc, 2.5); R(g, 42, -58, 22, 12, 5, lc, 2.5);
    if (o.brake) { glow(g, -53, -52, 34, '#ff4050', 0.7); glow(g, 53, -52, 34, '#ff4050', 0.7); }
    R(g, -58, -22, 116, 10, 5, '#5a5872', 3);
    R(g, -32, -26, 18, 14, 5, '#9aa0b8', 2.5); R(g, 14, -26, 18, 14, 5, '#9aa0b8', 2.5);
    if (o.boost) {
      for (const sx of [-23, 23]) {
        const f = 34 + Math.random() * 22;
        g.save(); g.globalAlpha = 0.95;
        poly(g, [[sx - 11, -16], [sx, -16 + f], [sx + 11, -16]], '#ffb32b', 2);
        poly(g, [[sx - 6, -16], [sx, -16 + f * 0.62], [sx + 6, -16]], '#fff3a0', 0);
        g.restore();
      }
      glow(g, 0, -14, 90, '#7fe4ff', 0.55);
    }
  }

  function buggyFront(g, o) {
    const body = o.body || '#3ea8ff', acc = o.acc || '#ffd23f';
    g.save(); g.globalAlpha = 0.28; E(g, 0, -2, 112, 13, '#000', 0); g.restore();
    wheel(g, -94, o.wheel || 0, 40, 68); wheel(g, 94, o.wheel || 0, 40, 68);
    R(g, -84, -36, 168, 10, 4, '#4a4860', 3);
    cage(g);
    R(g, -34, -104, 68, 44, 14, '#3d3d55', 3);
    // 熊貓(正面)
    E(g, -28, -84, 9, 18, '#2b2833', 2.5, 0.5); E(g, 28, -84, 9, 18, '#2b2833', 2.5, -0.5);
    E(g, 0, -90, 27, 24, '#ffffff');
    E(g, 0, -124, 29, 26, '#ffffff');
    E(g, -12, -121, 7.5, 9.5, '#2b2833', 0, 0.4); E(g, 12, -121, 7.5, 9.5, '#2b2833', 0, -0.4);
    E(g, -12, -122, 2.8, 3.2, '#fff', 0); E(g, 12, -122, 2.8, 3.2, '#fff', 0);
    E(g, 0, -113, 4.5, 3.2, '#2b2833', 0);
    g.beginPath(); g.arc(0, -111, 5, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = 2; g.strokeStyle = '#2b2833'; g.stroke();
    E(g, -20, -110, 5, 3.4, 'rgba(255,110,150,.6)', 0); E(g, 20, -110, 5, 3.4, 'rgba(255,110,150,.6)', 0);
    g.beginPath(); g.ellipse(0, -131, 31, 23, 0, Math.PI, TAU); g.closePath(); fs(g, '#ff4d5e', 3);
    E(g, -12, -139, 8, 8, '#8ee8ff', 2.5); E(g, 12, -139, 8, 8, '#8ee8ff', 2.5);
    E(g, -12, -139, 3, 3, '#fff', 0); E(g, 12, -139, 3, 3, '#fff', 0);
    E(g, -26, -150, 10, 10, '#2b2833', 2.5); E(g, 26, -150, 10, 10, '#2b2833', 2.5);
    // 圍巾
    g.beginPath(); g.moveTo(-20, -102); g.quadraticCurveTo(0, -94, 20, -102); g.lineTo(22, -94); g.quadraticCurveTo(0, -84, -22, -94); g.closePath(); fs(g, '#ff5c7a', 2.5);
    // 車體
    R(g, -78, -60, 156, 44, 16, body, 3);
    R(g, -60, -80, 120, 26, 12, o.body2 || body, 3);
    R(g, -70, -44, 140, 8, 4, acc, 0);
    R(g, -28, -48, 56, 26, 8, '#f4f4fa', 3);
    g.strokeStyle = '#9aa0b8'; g.lineWidth = 2;
    for (let i = -18; i <= 18; i += 9) { g.beginPath(); g.moveTo(i, -45); g.lineTo(i, -25); g.stroke(); }
    E(g, -54, -42, 14, 14, '#fff7c0', 3); E(g, 54, -42, 14, 14, '#fff7c0', 3);
    E(g, -54, -42, 7, 7, '#ffd23f', 0); E(g, 54, -42, 7, 7, '#ffd23f', 0);
    glow(g, -54, -42, 46, '#fff7c0', 0.5); glow(g, 54, -42, 46, '#fff7c0', 0.5);
    R(g, -62, -20, 124, 10, 5, '#5a5872', 3);
    // 方向盤
    g.beginPath(); g.ellipse(0, -72, 21, 8, 0, 0, TAU); g.lineWidth = 8; g.strokeStyle = OUT; g.stroke();
    g.lineWidth = 4; g.strokeStyle = '#c9cfe6'; g.stroke();
  }

  function drawBuggy(g, o) {
    if (o.view === 'front') {
      if (Spr.imgFront && Spr.imgFront.complete && Spr.imgFront.naturalWidth) {
        const im = Spr.imgFront, k = 220 / im.naturalWidth;
        g.drawImage(im, -110, -im.naturalHeight * k, 220, im.naturalHeight * k); return;
      }
      buggyFront(g, o);
    } else {
      if (Spr.imgRear && Spr.imgRear.complete && Spr.imgRear.naturalWidth) {
        const im = Spr.imgRear, k = 220 / im.naturalWidth;
        g.drawImage(im, -110, -im.naturalHeight * k, 220, im.naturalHeight * k); return;
      }
      buggyRear(g, o);
    }
  }

  // ---------- 場景物件 ----------
  function tree(w, h, c1, c2, trunk, dots) {
    return mk(w, h, g => {
      const cx = w / 2;
      R(g, cx - 11, h * 0.55, 22, h * 0.45, 7, trunk, 3);
      E(g, cx - w * 0.24, h * 0.44, w * 0.26, h * 0.22, c1);
      E(g, cx + w * 0.24, h * 0.44, w * 0.26, h * 0.22, c1);
      E(g, cx, h * 0.28, w * 0.34, h * 0.26, c1);
      g.save(); g.globalAlpha = 0.4;
      E(g, cx - w * 0.2, h * 0.5, w * 0.16, h * 0.08, c2, 0); E(g, cx + w * 0.22, h * 0.5, w * 0.16, h * 0.08, c2, 0);
      g.restore();
      g.save(); g.globalAlpha = 0.5;
      E(g, cx - w * 0.14, h * 0.16, w * 0.12, h * 0.05, '#fff', 0, -0.4);
      g.restore();
      if (dots) for (let i = 0; i < 9; i++) E(g, cx + Math.cos(i * 2.3) * w * 0.28, h * 0.32 + Math.sin(i * 1.7) * h * 0.14, 5, 4, dots, 0);
    });
  }
  function pine(w, h, c1, c2, trunk) {
    return mk(w, h, g => {
      const cx = w / 2;
      R(g, cx - 10, h * 0.78, 20, h * 0.22, 6, trunk, 3);
      for (let i = 2; i >= 0; i--) {
        const top = h * (0.03 + i * 0.2), bot = h * (0.4 + i * 0.19), half = w * (0.27 + i * 0.09);
        g.beginPath(); g.moveTo(cx, top); g.lineTo(cx + half, bot); g.quadraticCurveTo(cx, bot + h * 0.05, cx - half, bot); g.closePath(); fs(g, c1, 3);
        g.save(); g.globalAlpha = 0.35; g.beginPath(); g.moveTo(cx, top + 6); g.lineTo(cx + half - 5, bot - 2); g.lineTo(cx + 4, bot); g.closePath(); g.fillStyle = c2; g.fill(); g.restore();
      }
    });
  }
  function palm() {
    return mk(200, 250, g => {
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(100, 246); g.quadraticCurveTo(84, 150, 122, 66);
      g.lineWidth = 26; g.strokeStyle = OUT; g.stroke();
      g.lineWidth = 19; g.strokeStyle = '#b9814f'; g.stroke();
      const tx = 122, ty = 62;
      [[-2.9, 0], [-2.3, 0], [-1.7, 0], [-1.2, 0], [-0.5, 0], [0.1, 0], [0.6, 0]].forEach(([a]) => {
        E(g, tx + Math.cos(a) * 48, ty + Math.sin(a) * 26 + 6, 52, 13, '#3fbf5a', 3, a * 0.55);
      });
      E(g, tx - 6, ty + 12, 8, 8, '#8a5a2b', 2.5); E(g, tx + 8, ty + 14, 8, 8, '#8a5a2b', 2.5);
    });
  }
  function bush(c1, c2, flower) {
    return mk(160, 100, g => {
      E(g, 45, 68, 42, 28, c1); E(g, 115, 68, 42, 28, c1); E(g, 80, 50, 46, 36, c1);
      g.save(); g.globalAlpha = 0.4; E(g, 80, 80, 60, 10, c2, 0); g.restore();
      if (flower) [[50, 55], [95, 40], [112, 68], [68, 72], [80, 30]].forEach(([x, y], i) => {
        E(g, x, y, 7, 7, i % 2 ? '#ff9fbd' : '#fff3a0', 2); E(g, x, y, 2.5, 2.5, '#ff5c7a', 0);
      });
    });
  }
  function lantern() {
    return mk(96, 160, g => {
      const cx = 48;
      R(g, cx - 30, 142, 60, 18, 4, '#b9b3c9'); R(g, cx - 10, 84, 20, 60, 4, '#c9c3d9');
      R(g, cx - 32, 70, 64, 16, 5, '#b9b3c9'); R(g, cx - 26, 30, 52, 42, 7, '#c9c3d9');
      R(g, cx - 14, 38, 28, 28, 5, '#ffe58a', 2.5); glow(g, cx, 52, 40, '#fff3a0', 0.5);
      poly(g, [[cx - 46, 34], [cx - 14, 8], [cx + 14, 8], [cx + 46, 34]], '#a9a3bd'); E(g, cx, 6, 7, 7, '#c9c3d9', 2.5);
    });
  }
  function redLantern() {
    return mk(100, 190, g => {
      const cx = 50;
      R(g, cx - 4, 50, 8, 140, 3, '#6b4a3a', 2.5);
      glow(g, cx, 62, 64, '#ffd27a', 0.6);
      E(g, cx, 62, 30, 38, '#ff4d5e');
      R(g, cx - 22, 22, 44, 9, 3, '#2b2833', 2); R(g, cx - 22, 92, 44, 9, 3, '#2b2833', 2);
      g.fillStyle = '#fff3d0'; g.font = '900 30px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('祭', cx, 62);
    });
  }
  function umbrella() {
    return mk(210, 200, g => {
      const cx = 105;
      R(g, cx - 4, 70, 8, 130, 3, '#f2d7a6', 2.5);
      g.beginPath(); g.ellipse(cx, 84, 96, 60, 0, Math.PI, TAU); g.closePath(); fs(g, '#ff5c7a', 3);
      g.save(); g.beginPath(); g.ellipse(cx, 84, 96, 60, 0, Math.PI, TAU); g.closePath(); g.clip();
      g.fillStyle = '#fff'; [-58, -20, 20, 58].forEach((x, i) => { if (i % 2 === 0) { g.beginPath(); g.moveTo(cx, 84); g.lineTo(cx + x - 18, 20); g.lineTo(cx + x + 18, 20); g.closePath(); g.fill(); } });
      g.restore();
      g.beginPath(); g.ellipse(cx, 84, 96, 60, 0, Math.PI, TAU); g.closePath(); fs(g, null, 3);
    });
  }
  function rabbit() {
    return mk(120, 130, g => {
      E(g, 90, 100, 10, 10, '#fff'); E(g, 58, 98, 34, 26, '#fff');
      E(g, 44, 18, 7.5, 24, '#fff', 3, -0.1); E(g, 68, 18, 7.5, 24, '#fff', 3, 0.1);
      E(g, 44, 20, 3.5, 16, '#ff9fbd', 0, -0.1); E(g, 68, 20, 3.5, 16, '#ff9fbd', 0, 0.1);
      E(g, 56, 62, 26, 23, '#fff');
      E(g, 47, 60, 3.4, 4, OUT, 0); E(g, 65, 60, 3.4, 4, OUT, 0);
      E(g, 56, 68, 3.5, 2.6, '#ff8fb0', 0); E(g, 40, 68, 5, 3, 'rgba(255,120,150,.5)', 0); E(g, 72, 68, 5, 3, 'rgba(255,120,150,.5)', 0);
      E(g, 44, 122, 10, 6, '#fff', 2.5); E(g, 70, 122, 10, 6, '#fff', 2.5);
    });
  }
  function crab() {
    return mk(150, 110, g => {
      g.lineCap = 'round'; g.strokeStyle = OUT;
      for (const s of [-1, 1]) {
        for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(75 + s * 30, 80); g.lineTo(75 + s * (52 + i * 6), 92 + i * 6); g.lineWidth = 6; g.stroke(); }
        g.beginPath(); g.moveTo(75 + s * 34, 66); g.lineTo(75 + s * 52, 42); g.lineWidth = 8; g.stroke();
        E(g, 75 + s * 56, 34, 15, 13, '#ff6b4a');
        poly(g, [[75 + s * 56, 34], [75 + s * 66, 20], [75 + s * 70, 32]], '#ff6b4a', 2.5);
        g.beginPath(); g.moveTo(75 + s * 14, 50); g.lineTo(75 + s * 14, 34); g.lineWidth = 5; g.stroke();
        E(g, 75 + s * 14, 30, 7, 7, '#fff', 2.5); E(g, 75 + s * 14, 31, 2.6, 2.6, OUT, 0);
      }
      E(g, 75, 72, 44, 28, '#ff6b4a');
      E(g, 62, 66, 8, 4, 'rgba(255,255,255,.5)', 0, -0.4);
      g.beginPath(); g.arc(75, 76, 8, 0.1 * Math.PI, 0.9 * Math.PI); g.lineWidth = 2.5; g.strokeStyle = OUT; g.stroke();
    });
  }
  function fox() {
    return mk(130, 150, g => {
      E(g, 104, 108, 20, 34, '#ff9a3c', 3, 0.5); E(g, 112, 132, 10, 10, '#fff', 0, 0.5);
      E(g, 58, 108, 30, 34, '#ff9a3c'); E(g, 58, 116, 17, 24, '#fff', 0);
      poly(g, [[34, 60], [38, 24], [56, 46]], '#ff9a3c'); poly(g, [[82, 60], [78, 24], [60, 46]], '#ff9a3c');
      poly(g, [[40, 54], [41, 34], [51, 47]], '#4a2a3a', 0); poly(g, [[76, 54], [75, 34], [65, 47]], '#4a2a3a', 0);
      E(g, 58, 64, 27, 22, '#ff9a3c');
      poly(g, [[34, 72], [58, 88], [82, 72], [70, 62], [46, 62]], '#fff', 0);
      E(g, 48, 62, 3.4, 4, OUT, 0); E(g, 68, 62, 3.4, 4, OUT, 0);
      E(g, 58, 76, 4, 3, OUT, 0);
    });
  }
  function sign() {
    return mk(220, 180, g => {
      R(g, 40, 90, 12, 90, 3, '#8a5a3a', 2.5); R(g, 168, 90, 12, 90, 3, '#8a5a3a', 2.5);
      R(g, 8, 8, 204, 96, 14, '#fff4d6', 4); R(g, 16, 16, 188, 80, 10, null, 2.5);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '900 38px ' + FONT; g.lineWidth = 6; g.strokeStyle = OUT; g.strokeText('TOP RACE', 110, 44); g.fillStyle = '#ff5c7a'; g.fillText('TOP RACE', 110, 44);
      g.font = '900 24px ' + FONT; g.fillStyle = '#4a2a5a'; g.fillText('頂尖賽車', 110, 76);
    });
  }
  function coin() {
    return mk(64, 64, g => {
      glow(g, 32, 32, 32, '#fff3a0', 0.6);
      E(g, 32, 32, 26, 26, '#ffd23f', 4);
      E(g, 32, 32, 18, 18, '#ffe680', 2.5, 0);
      const pts = [];
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 13; pts.push([32 + Math.cos(a) * r, 33 + Math.sin(a) * r]); }
      poly(g, pts, '#ff9f1c', 2);
    });
  }
  function nitro() {
    return mk(70, 116, g => {
      glow(g, 35, 66, 46, '#7fe4ff', 0.7);
      R(g, 24, 16, 22, 26, 5, '#bfefff', 3);
      R(g, 20, 6, 30, 14, 5, '#ff5c7a', 3);
      const gr = g.createLinearGradient(10, 0, 60, 0); gr.addColorStop(0, '#5fdcff'); gr.addColorStop(1, '#2a8bff');
      g.beginPath(); rrect(g, 8, 36, 54, 72, 20); fs(g, gr, 3);
      E(g, 35, 72, 19, 22, '#fff', 2);
      poly(g, [[38, 54], [26, 74], [34, 74], [30, 90], [46, 68], [37, 68]], '#ffd23f', 2);
      E(g, 19, 52, 4, 9, 'rgba(255,255,255,.75)', 0, 0.2);
    });
  }
  function poop() {
    return mk(120, 110, g => {
      g.strokeStyle = '#7bc043'; g.lineWidth = 3; g.lineCap = 'round';
      [[20, 30], [100, 24]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y + 14); g.quadraticCurveTo(x - 8, y + 6, x, y); g.quadraticCurveTo(x + 8, y - 6, x, y - 14); g.stroke(); });
      E(g, 60, 90, 46, 20, '#8a5a2b'); E(g, 60, 64, 35, 20, '#8a5a2b'); E(g, 60, 40, 23, 16, '#8a5a2b');
      g.beginPath(); g.moveTo(52, 28); g.quadraticCurveTo(62, 6, 70, 22); g.quadraticCurveTo(66, 30, 52, 28); fs(g, '#8a5a2b', 3);
      E(g, 44, 60, 6, 7.5, '#fff', 2); E(g, 76, 60, 6, 7.5, '#fff', 2); E(g, 45, 62, 2.8, 3.4, OUT, 0); E(g, 75, 62, 2.8, 3.4, OUT, 0);
      g.beginPath(); g.arc(60, 68, 8, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = 2.5; g.strokeStyle = OUT; g.stroke();
      g.save(); g.globalAlpha = 0.6; E(g, 34, 84, 10, 4, '#c78a4a', 0, -0.3); E(g, 44, 52, 8, 3, '#c78a4a', 0, -0.5); g.restore();
    });
  }
  function rock() {
    return mk(160, 120, g => {
      const gr = g.createLinearGradient(0, 10, 0, 118); gr.addColorStop(0, '#c4c9d8'); gr.addColorStop(1, '#8b90a4');
      poly(g, [[10, 112], [4, 74], [30, 34], [64, 14], [104, 22], [140, 58], [152, 104], [124, 116]], gr, 4);
      poly(g, [[30, 60], [50, 32], [78, 24], [60, 50]], 'rgba(255,255,255,.4)', 0);
      g.strokeStyle = '#6b7086'; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(96, 36); g.lineTo(88, 62); g.lineTo(102, 76); g.stroke();
      g.beginPath(); g.moveTo(44, 84); g.lineTo(62, 92); g.stroke();
      E(g, 120, 90, 10, 6, 'rgba(0,0,0,.12)', 0);
    });
  }
  function enemy(body, acc, kind) {
    return mk(250, 210, g => { g.translate(125, 202); g.scale(1.02, 1.02); buggyRear(g, { body, acc, rider: kind, t: 0.4, wheel: 4 }); });
  }

  const defs = {
    sakura: () => tree(200, 250, '#ffb7d5', '#ff8fbd', '#8a5a44', '#fff0f6'),
    treeRound: () => tree(200, 250, '#6fd35a', '#3f9f3f', '#8a5a44', '#a8ee7a'),
    treeNight: () => tree(200, 250, '#2f8f83', '#1d6a66', '#5a4258', '#5fd0b8'),
    pine: () => pine(180, 250, '#4fbf6a', '#2f8f4f', '#8a5a44'),
    pineNight: () => pine(180, 250, '#1f7a72', '#0f4a55', '#4a3548'),
    palm,
    bush: () => bush('#66cf58', '#3a9a3a', false),
    bushFlower: () => bush('#66cf58', '#3a9a3a', true),
    bushDry: () => bush('#d8c25a', '#a89a3a', true),
    bushNight: () => bush('#238a7c', '#0f5a58', true),
    lantern, redLantern, umbrella, rabbit, crab, fox, signBoard: sign,
    coin, nitro, poop, rock,
    enemy1: () => enemy('#5ad27a', '#fff3a0', 'frog'),
    enemy2: () => enemy('#ff8fc7', '#ffffff', 'bunny'),
    enemy3: () => enemy('#7c5cff', '#ffd23f', 'cat')
  };

  function get(name) { return cache[name] || (cache[name] = defs[name]()); }
  function warm() { Object.keys(defs).forEach(get); }

  const api = { get, warm, drawBuggy, imgRear: null, imgFront: null };
  ['Rear', 'Front'].forEach(k => {
    const im = new Image();
    im.onload = () => { api['img' + k] = im; };
    im.src = 'assets/images/player_' + k.toLowerCase() + '.png';
  });
  return api;
})();
