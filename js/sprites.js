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

  function pandaFront(g, o) {
    E(g, -28, -84, 9, 18, '#2b2833', 2.5, 0.5); E(g, 28, -84, 9, 18, '#2b2833', 2.5, -0.5);
    E(g, 0, -90, 27, 24, '#ffffff');
    E(g, 0, -124, 29, 26, '#ffffff');
    E(g, -12, -121, 7.5, 9.5, '#2b2833', 0, 0.4); E(g, 12, -121, 7.5, 9.5, '#2b2833', 0, -0.4);
    E(g, 0, -113, 4.5, 3.2, '#2b2833', 0);
    if (o.cheer) {
      g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.lineCap = 'round';
      for (const ex of [-12, 12]) { g.beginPath(); g.arc(ex, -119, 4.5, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }
      E(g, 0, -106, 6.5, 5.5, '#c2334f', 1.8);
    } else {
      E(g, -12, -122, 2.8, 3.2, '#fff', 0); E(g, 12, -122, 2.8, 3.2, '#fff', 0);
      g.beginPath(); g.arc(0, -111, 5, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = 2; g.strokeStyle = '#2b2833'; g.stroke();
    }
    E(g, -20, -110, 5, 3.4, 'rgba(255,110,150,.6)', 0); E(g, 20, -110, 5, 3.4, 'rgba(255,110,150,.6)', 0);
    g.beginPath(); g.ellipse(0, -131, 31, 23, 0, Math.PI, TAU); g.closePath(); fs(g, '#ff4d5e', 3);
    E(g, -12, -139, 8, 8, '#8ee8ff', 2.5); E(g, 12, -139, 8, 8, '#8ee8ff', 2.5);
    E(g, -12, -139, 3, 3, '#fff', 0); E(g, 12, -139, 3, 3, '#fff', 0);
    E(g, -26, -150, 10, 10, '#2b2833', 2.5); E(g, 26, -150, 10, 10, '#2b2833', 2.5);
    // 圍巾
    g.beginPath(); g.moveTo(-20, -102); g.quadraticCurveTo(0, -94, 20, -102); g.lineTo(22, -94); g.quadraticCurveTo(0, -84, -22, -94); g.closePath(); fs(g, '#ff5c7a', 2.5);
  }

  function buggyFront(g, o) {
    const body = o.body || '#3ea8ff', acc = o.acc || '#ffd23f';
    g.save(); g.globalAlpha = 0.28; E(g, 0, -2, 112, 13, '#000', 0); g.restore();
    wheel(g, -94, o.wheel || 0, 40, 68); wheel(g, 94, o.wheel || 0, 40, 68);
    R(g, -84, -36, 168, 10, 4, '#4a4860', 3);
    cage(g);
    R(g, -34, -104, 68, 44, 14, '#3d3d55', 3);
    pandaFront(g, o);
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

  // ---------- 車輛 2:坦克 ----------
  function tread(g, cx, ph) {
    R(g, cx - 24, -68, 48, 68, 16, '#34343f', 3.5);
    g.save(); g.beginPath(); rrect(g, cx - 20, -64, 40, 60, 12); g.clip();
    g.fillStyle = '#5e5e74';
    const p = ((ph % 12) + 12) % 12;
    for (let k = -1; k < 7; k++) g.fillRect(cx - 20, -66 + k * 12 + p, 40, 5);
    g.restore();
    E(g, cx, -50, 10, 10, '#8a8aa0', 2.5); E(g, cx, -18, 10, 10, '#8a8aa0', 2.5);
  }
  function tankRear(g, o) {
    const body = o.body || '#6fbf5a', dark = '#4a8f45';
    g.save(); g.globalAlpha = 0.28; E(g, 0, -2, 108, 13, '#000', 0); g.restore();
    tread(g, -84, o.wheel || 0); tread(g, 84, o.wheel || 0);
    R(g, -74, -72, 148, 56, 12, body, 3.5);
    R(g, -50, -66, 100, 24, 6, dark, 2.5);
    g.strokeStyle = '#2f5f2c'; g.lineWidth = 2.5; for (let i = -36; i <= 36; i += 12) { g.beginPath(); g.moveTo(i, -63); g.lineTo(i, -45); g.stroke(); }
    R(g, -66, -40, 22, 12, 5, o.brake ? '#ff2030' : '#c0283c', 2.5); R(g, 44, -40, 22, 12, 5, o.brake ? '#ff2030' : '#c0283c', 2.5);
    if (o.brake) { glow(g, -55, -34, 34, '#ff4050', 0.7); glow(g, 55, -34, 34, '#ff4050', 0.7); }
    R(g, -30, -32, 18, 14, 5, '#9aa0b8', 2.5); R(g, 12, -32, 18, 14, 5, '#9aa0b8', 2.5);
    // 天線與小旗
    const w = Math.sin((o.t || 0) * 9) * 5;
    g.strokeStyle = OUT; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(58, -90); g.lineTo(58, -190); g.stroke();
    poly(g, [[58, -190], [92 + w, -182], [58, -172]], '#ff5c7a', 2.5);
    // 熊貓從砲塔探出
    g.save(); g.translate(0, -42); g.scale(0.92, 0.92); riderRear(g, 'panda', o.t || 0); g.restore();
    E(g, 0, -92, 54, 30, body, 3.5);
    E(g, 0, -108, 30, 11, dark, 3);
    E(g, -30, -84, 9, 6, 'rgba(255,255,255,.45)', 0);
    if (o.boost) {
      for (const sx of [-36, 36]) { const f = 30 + Math.random() * 22; g.save(); poly(g, [[sx - 10, -22], [sx, -22 + f], [sx + 10, -22]], '#ffb32b', 2); poly(g, [[sx - 5, -22], [sx, -22 + f * 0.6], [sx + 5, -22]], '#fff3a0', 0); g.restore(); }
      glow(g, 0, -20, 90, '#7fe4ff', 0.5);
    }
  }
  function tankFront(g, o) {
    const body = o.body || '#6fbf5a', dark = '#4a8f45';
    g.save(); g.globalAlpha = 0.28; E(g, 0, -2, 112, 13, '#000', 0); g.restore();
    tread(g, -86, o.wheel || 0); tread(g, 86, o.wheel || 0);
    R(g, -74, -72, 148, 56, 12, body, 3.5);
    poly(g, [[-58, -68], [58, -68], [68, -22], [-68, -22]], '#82d06c', 3);
    E(g, -46, -40, 13, 13, '#fff7c0', 3); E(g, 46, -40, 13, 13, '#fff7c0', 3);
    E(g, -46, -40, 6, 6, '#ffd23f', 0); E(g, 46, -40, 6, 6, '#ffd23f', 0);
    glow(g, -46, -40, 44, '#fff7c0', 0.5); glow(g, 46, -40, 44, '#fff7c0', 0.5);
    R(g, -60, -22, 120, 10, 5, '#5a5872', 3);
    g.save(); g.translate(0, -42); g.scale(0.92, 0.92); pandaFront(g, o); g.restore();
    E(g, 0, -92, 54, 30, body, 3.5);
    E(g, -30, -84, 9, 6, 'rgba(255,255,255,.45)', 0);
    E(g, 0, -86, 19, 17, dark, 3.5); E(g, 0, -86, 11, 10, '#1b1b26', 2.5); E(g, -4, -90, 3, 2.5, 'rgba(255,255,255,.6)', 0);
    R(g, -8, -112, 16, 10, 3, '#d9dde8', 2.5);
  }

  // ---------- 車輛 3:掌上型遊戲機 ----------
  function consoleRear(g, o) {
    const c = o.body || '#8fd6c8', dk = '#6cb6a8';
    g.save(); g.globalAlpha = 0.28; E(g, 0, -2, 106, 13, '#000', 0); g.restore();
    wheel(g, -88, o.wheel || 0, 36, 58); wheel(g, 88, o.wheel || 0, 36, 58);
    R(g, -80, -30, 160, 9, 4, '#4a4860', 3);
    g.save(); g.translate(0, -22); riderRear(g, 'panda', o.t || 0); g.restore();
    R(g, -74, -100, 148, 90, 18, c, 3.5);
    R(g, -30, -112, 60, 14, 4, '#ff5c7a', 3); R(g, -22, -108, 44, 5, 2, '#fff', 0);
    R(g, -50, -86, 100, 52, 10, dk, 3);
    [[-40, -78], [40, -78], [-40, -42], [40, -42]].forEach(([x, y]) => E(g, x, y, 3.2, 3.2, '#3e8a7c', 1.5));
    g.strokeStyle = '#3e8a7c'; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-14 + i * 10, -66); g.lineTo(-14 + i * 10, -50); g.stroke(); }
    R(g, -66, -26, 22, 12, 5, o.brake ? '#ff2030' : '#c0283c', 2.5); R(g, 44, -26, 22, 12, 5, o.brake ? '#ff2030' : '#c0283c', 2.5);
    if (o.brake) { glow(g, -55, -20, 34, '#ff4050', 0.7); glow(g, 55, -20, 34, '#ff4050', 0.7); }
    if (o.boost) {
      for (const sx of [-30, 30]) { const f = 30 + Math.random() * 22; g.save(); poly(g, [[sx - 10, -14], [sx, -14 + f], [sx + 10, -14]], '#ffb32b', 2); poly(g, [[sx - 5, -14], [sx, -14 + f * 0.6], [sx + 5, -14]], '#fff3a0', 0); g.restore(); }
      glow(g, 0, -14, 90, '#7fe4ff', 0.5);
    }
  }
  function consoleFront(g, o) {
    const c = o.body || '#e4e7f4';
    g.save(); g.globalAlpha = 0.28; E(g, 0, -2, 110, 13, '#000', 0); g.restore();
    wheel(g, -92, o.wheel || 0, 38, 62); wheel(g, 92, o.wheel || 0, 38, 62);
    R(g, -84, -30, 168, 9, 4, '#4a4860', 3);
    g.save(); g.translate(0, -22); pandaFront(g, o); g.restore();
    R(g, -74, -100, 148, 90, 18, c, 3.5);
    R(g, -58, -94, 116, 56, 10, '#4a4f6a', 3);
    R(g, -50, -88, 100, 42, 4, '#a8e0a0', 2.5);
    g.fillStyle = '#5f9a5c'; g.beginPath(); g.moveTo(-8, -88); g.lineTo(8, -88); g.lineTo(34, -46); g.lineTo(-34, -46); g.fill();
    g.fillStyle = '#e8f8dc'; g.fillRect(-1, -84, 2, 6); g.fillRect(-1, -70, 2, 8);
    g.fillStyle = '#c23a4a'; g.fillRect(-9, -60, 18, 10); g.fillStyle = '#3a1f28'; g.fillRect(-9, -52, 5, 4); g.fillRect(4, -52, 5, 4);
    E(g, -62, -68, 3, 3, '#ff5c7a', 0);
    R(g, -60, -34, 26, 8, 3, '#3a3f58', 2.5); R(g, -52, -42, 10, 24, 3, '#3a3f58', 2.5);
    E(g, 34, -24, 9, 9, '#ff5c7a', 3); E(g, 54, -32, 9, 9, '#ffd23f', 3);
    E(g, -16, -20, 8, 3.5, '#9aa0b8', 1.5, -0.4); E(g, 4, -20, 8, 3.5, '#9aa0b8', 1.5, -0.4);
    E(g, -66, -18, 7, 7, '#fff7c0', 2.5); E(g, 66, -18, 7, 7, '#fff7c0', 2.5);
    glow(g, -66, -18, 34, '#fff7c0', 0.5); glow(g, 66, -18, 34, '#fff7c0', 0.5);
  }

  function drawBuggy(g, o) {
    if (o.veh === 1) { (o.view === 'front' ? tankFront : tankRear)(g, o); return; }
    if (o.veh === 2) { (o.view === 'front' ? consoleFront : consoleRear)(g, o); return; }
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
  function pine(w, h, c1, c2, trunk, snow, lights) {
    return mk(w, h, g => {
      const cx = w / 2;
      R(g, cx - 10, h * 0.78, 20, h * 0.22, 6, trunk, 3);
      for (let i = 2; i >= 0; i--) {
        const top = h * (0.03 + i * 0.2), bot = h * (0.4 + i * 0.19), half = w * (0.27 + i * 0.09);
        g.beginPath(); g.moveTo(cx, top); g.lineTo(cx + half, bot); g.quadraticCurveTo(cx, bot + h * 0.05, cx - half, bot); g.closePath(); fs(g, c1, 3);
        g.save(); g.globalAlpha = 0.35; g.beginPath(); g.moveTo(cx, top + 6); g.lineTo(cx + half - 5, bot - 2); g.lineTo(cx + 4, bot); g.closePath(); g.fillStyle = c2; g.fill(); g.restore();
        if (snow) {
          const d = bot - top;
          g.beginPath(); g.moveTo(cx, top); g.lineTo(cx + half * 0.66, top + d * 0.66);
          g.quadraticCurveTo(cx + half * 0.3, top + d * 0.52, cx + half * 0.1, top + d * 0.74);
          g.quadraticCurveTo(cx - half * 0.2, top + d * 0.5, cx - half * 0.66, top + d * 0.66); g.closePath(); fs(g, snow, 0);
        }
        if (lights) for (let k = 0; k < 4; k++) E(g, cx + (k - 1.5) * half * 0.42, bot - 8 - (k % 2) * 8, 5, 5, ['#ff5c7a', '#ffd23f', '#7fe4ff', '#8dff8a'][(k + i) % 4], 1.5);
      }
      if (lights) poly(g, [[cx, -2], [cx + 8, 12], [cx + 22, 12], [cx + 11, 22], [cx + 15, 36], [cx, 27], [cx - 15, 36], [cx - 11, 22], [cx - 22, 12], [cx - 8, 12]].map(p => [p[0], p[1] + 6]), '#ffd23f', 2);
    });
  }
  function snowBush() {
    return mk(160, 90, g => {
      E(g, 45, 62, 44, 26, '#ffffff'); E(g, 115, 62, 44, 26, '#ffffff'); E(g, 80, 46, 46, 32, '#ffffff');
      g.save(); g.globalAlpha = 0.5; E(g, 80, 74, 62, 9, '#9cc8f0', 0); g.restore();
      [[60, 50], [96, 40], [112, 62]].forEach(([x, y]) => E(g, x, y, 5, 5, '#ff5c7a', 2));
    });
  }
  function snowman() {
    return mk(120, 170, g => {
      poly(g, [[38, 2], [82, 2], [76, 18], [44, 18]], '#3a3350', 3); R(g, 30, 16, 60, 8, 4, '#3a3350', 3);
      g.strokeStyle = '#8a5a3a'; g.lineWidth = 5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(36, 88); g.lineTo(8, 70); g.stroke(); g.beginPath(); g.moveTo(84, 88); g.lineTo(112, 68); g.stroke();
      E(g, 60, 132, 38, 36, '#fff'); E(g, 60, 84, 28, 27, '#fff'); E(g, 60, 44, 22, 21, '#fff');
      R(g, 40, 60, 40, 9, 4, '#ff5c7a', 2.5);
      E(g, 53, 40, 3, 3.6, OUT, 0); E(g, 68, 40, 3, 3.6, OUT, 0);
      poly(g, [[60, 46], [80, 51], [60, 54]], '#ff9a3c', 2);
      [[60, 98], [60, 116], [60, 134]].forEach(([x, y]) => E(g, x, y, 3.4, 3.4, OUT, 0));
      E(g, 34, 130, 8, 5, 'rgba(160,200,240,.5)', 0);
    });
  }
  function igloo() {
    return mk(200, 130, g => {
      g.beginPath(); g.moveTo(10, 122); g.arc(100, 122, 90, Math.PI, TAU); g.closePath(); fs(g, '#f4fbff', 4);
      g.save(); g.clip();
      g.strokeStyle = '#9cc8f0'; g.lineWidth = 3;
      for (let y = 100; y > 40; y -= 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(200, y); g.stroke(); }
      for (let r = 0; r < 4; r++) for (let x = (r % 2) * 20; x < 200; x += 40) { g.beginPath(); g.moveTo(x, 122 - r * 22); g.lineTo(x, 100 - r * 22); g.stroke(); }
      g.restore();
      g.beginPath(); g.moveTo(66, 124); g.lineTo(66, 92); g.arc(100, 92, 34, Math.PI, TAU); g.lineTo(134, 124); g.closePath(); fs(g, '#5a7ab0', 3);
      g.beginPath(); g.moveTo(10, 122); g.arc(100, 122, 90, Math.PI, TAU); g.closePath(); fs(g, null, 4);
    });
  }
  function penguin() {
    return mk(100, 120, g => {
      E(g, 22, 76, 9, 22, '#3a3a5a', 3, 0.3); E(g, 78, 76, 9, 22, '#3a3a5a', 3, -0.3);
      E(g, 50, 74, 30, 40, '#3a3a5a'); E(g, 50, 82, 20, 29, '#ffffff', 0);
      E(g, 42, 52, 5, 6, '#fff', 2); E(g, 58, 52, 5, 6, '#fff', 2); E(g, 43, 53, 2.2, 2.6, OUT, 0); E(g, 57, 53, 2.2, 2.6, OUT, 0);
      poly(g, [[43, 62], [57, 62], [50, 72]], '#ff9a3c', 2);
      E(g, 36, 62, 5, 3, 'rgba(255,120,150,.6)', 0); E(g, 64, 62, 5, 3, 'rgba(255,120,150,.6)', 0);
      E(g, 38, 112, 11, 5, '#ff9a3c', 2.5); E(g, 62, 112, 11, 5, '#ff9a3c', 2.5);
    });
  }
  function iceBlock() {
    return mk(160, 130, g => {
      const gr = g.createLinearGradient(0, 10, 0, 124); gr.addColorStop(0, '#eafaff'); gr.addColorStop(1, '#7fd0ff');
      poly(g, [[14, 118], [8, 60], [40, 24], [84, 8], [124, 30], [150, 70], [144, 118]], gr, 4);
      poly(g, [[40, 30], [84, 14], [70, 60], [30, 70]], 'rgba(255,255,255,.55)', 0);
      poly(g, [[100, 40], [124, 34], [136, 80], [112, 90]], 'rgba(255,255,255,.3)', 0);
      g.strokeStyle = '#a8def8'; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(84, 30); g.lineTo(78, 64); g.lineTo(96, 84); g.stroke();
      [[30, 40], [128, 60]].forEach(([x, y]) => poly(g, [[x, y - 8], [x + 3, y - 3], [x + 8, y], [x + 3, y + 3], [x, y + 8], [x - 3, y + 3], [x - 8, y], [x - 3, y - 3]], '#fff', 0));
    });
  }
  function snowdrift() {
    return mk(190, 100, g => {
      E(g, 95, 76, 88, 22, '#dcecff', 0); E(g, 95, 70, 84, 24, '#ffffff'); E(g, 62, 56, 42, 26, '#ffffff'); E(g, 126, 54, 40, 24, '#ffffff');
      g.save(); g.globalAlpha = 0.5; E(g, 95, 88, 70, 7, '#9cc8f0', 0); g.restore();
      [[40, 60], [96, 40], [150, 56], [120, 78]].forEach(([x, y]) => E(g, x, y, 3, 3, '#cfe8ff', 0));
      g.strokeStyle = '#8fbce8'; g.lineWidth = 2.5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(70, 44); g.quadraticCurveTo(80, 36, 92, 44); g.stroke();
    });
  }
  function lollipop(c1, c2, stick) {
    return mk(130, 230, g => {
      g.strokeStyle = OUT; g.lineWidth = 15; g.lineCap = 'round'; g.beginPath(); g.moveTo(65, 118); g.lineTo(65, 226); g.stroke();
      g.strokeStyle = stick || '#ffffff'; g.lineWidth = 8; g.beginPath(); g.moveTo(65, 118); g.lineTo(65, 226); g.stroke();
      g.strokeStyle = c2; g.lineWidth = 8; g.setLineDash([12, 14]); g.beginPath(); g.moveTo(65, 122); g.lineTo(65, 226); g.stroke(); g.setLineDash([]);
      E(g, 65, 66, 56, 56, c1, 4);
      g.strokeStyle = c2; g.lineWidth = 9; g.lineCap = 'round';
      g.beginPath(); g.arc(65, 66, 12, 0, TAU * 0.8); g.stroke();
      g.beginPath(); g.arc(65, 66, 28, Math.PI * 0.6, TAU * 0.95); g.stroke();
      g.beginPath(); g.arc(65, 66, 44, Math.PI * 1.2, TAU + Math.PI * 0.3); g.stroke();
      E(g, 40, 40, 9, 5, 'rgba(255,255,255,.7)', 0, -0.6);
    });
  }
  function gumdrop(cols) {
    return mk(170, 100, g => {
      [[40, 74, 34, cols[0]], [128, 74, 34, cols[1]], [84, 66, 42, cols[2]]].forEach(([x, y, r, c]) => {
        g.beginPath(); g.moveTo(x - r, y + 22); g.quadraticCurveTo(x - r, y - r * 1.1, x, y - r * 1.1); g.quadraticCurveTo(x + r, y - r * 1.1, x + r, y + 22); g.closePath(); fs(g, c, 3);
        for (let k = 0; k < 8; k++) E(g, x + Math.cos(k * 1.7) * r * 0.6, y - 6 + Math.sin(k * 2.3) * r * 0.5, 2.2, 2.2, 'rgba(255,255,255,.8)', 0);
        E(g, x - r * 0.4, y - r * 0.5, r * 0.22, r * 0.12, 'rgba(255,255,255,.6)', 0, -0.6);
      });
    });
  }
  function cupcake() {
    return mk(130, 140, g => {
      poly(g, [[22, 66], [108, 66], [96, 136], [34, 136]], '#ffd6a0', 3.5);
      g.strokeStyle = '#e8a860'; g.lineWidth = 3; for (let x = 44; x < 100; x += 14) { g.beginPath(); g.moveTo(x - (x - 65) * 0.05, 70); g.lineTo(x - (x - 65) * 0.2, 132); g.stroke(); }
      E(g, 65, 60, 46, 20, '#ff9fd0'); E(g, 65, 42, 36, 18, '#ffb3dc'); E(g, 65, 26, 24, 14, '#ff9fd0');
      E(g, 65, 12, 8, 8, '#ff3f5c', 2.5); g.strokeStyle = '#3a8a3a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(65, 5); g.lineTo(72, -1); g.stroke();
      [[45, 58], [80, 56], [62, 44], [72, 34]].forEach(([x, y], i) => E(g, x, y, 2.6, 2.6, ['#fff', '#7fe4ff', '#ffe680', '#8dff8a'][i], 0));
    });
  }
  function candyCane() {
    return mk(110, 190, g => {
      const path = () => { g.beginPath(); g.moveTo(28, 186); g.lineTo(28, 62); g.arc(58, 62, 30, Math.PI, 0.05 * Math.PI, false); };
      g.lineCap = 'round'; path(); g.lineWidth = 26; g.strokeStyle = OUT; g.stroke();
      path(); g.lineWidth = 18; g.strokeStyle = '#ffffff'; g.stroke();
      path(); g.lineWidth = 18; g.strokeStyle = '#ff4d5e'; g.setLineDash([14, 18]); g.stroke(); g.setLineDash([]);
    });
  }
  function donut() {
    return mk(170, 130, g => {
      g.save(); g.globalAlpha = 0.15; E(g, 85, 100, 74, 22, '#000', 0); g.restore();
      E(g, 85, 80, 70, 46, '#e3a25a', 4); E(g, 85, 74, 64, 40, '#ff8fc8', 2.5);
      g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.ellipse(85, 76, 22, 14, 0, 0, TAU); g.fill(); g.restore();
      g.beginPath(); g.ellipse(85, 76, 22, 14, 0, 0, TAU); g.lineWidth = 3; g.strokeStyle = OUT; g.stroke();
      [[40, 70, '#fff'], [58, 50, '#ffe680'], [110, 48, '#7fe4ff'], [130, 68, '#8dff8a'], [120, 92, '#fff'], [52, 92, '#ffe680'], [88, 104, '#7fe4ff']].forEach(([x, y, c], i) => { g.save(); g.translate(x, y); g.rotate(i); R(g, -6, -2, 12, 4, 2, c, 0); g.restore(); });
    });
  }
  function balloon() {
    return mk(100, 210, g => {
      g.strokeStyle = '#6a5a7a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(50, 104); g.quadraticCurveTo(40, 150, 52, 204); g.stroke();
      E(g, 50, 56, 36, 46, '#ff5c7a'); poly(g, [[44, 100], [56, 100], [50, 110]], '#ff5c7a', 3);
      E(g, 36, 36, 8, 14, 'rgba(255,255,255,.6)', 0, 0.4);
      R(g, 36, 196, 28, 12, 4, '#8a5a3a', 3);
    });
  }
  function gummy() {
    return mk(110, 130, g => {
      const c = '#ffa53a';
      E(g, 22, 84, 11, 9, c, 3); E(g, 78, 84, 11, 9, c, 3);
      E(g, 34, 116, 13, 10, c, 3); E(g, 66, 116, 13, 10, c, 3);
      E(g, 50, 88, 28, 30, c); E(g, 50, 46, 26, 24, c);
      E(g, 30, 26, 10, 10, c, 3); E(g, 70, 26, 10, 10, c, 3);
      E(g, 50, 54, 11, 8, '#ffd28a', 2); E(g, 50, 51, 3.6, 2.8, OUT, 0);
      E(g, 40, 42, 3, 3.6, OUT, 0); E(g, 60, 42, 3, 3.6, OUT, 0);
      E(g, 38, 76, 8, 12, 'rgba(255,255,255,.4)', 0, 0.3);
    });
  }
  function jelly() {
    return mk(160, 130, g => {
      E(g, 80, 118, 70, 10, '#ffffff', 3);
      const gr = g.createLinearGradient(0, 20, 0, 120); gr.addColorStop(0, '#ff9fe6'); gr.addColorStop(1, '#ff4fb8');
      g.beginPath(); g.moveTo(22, 118); g.quadraticCurveTo(22, 20, 80, 16); g.quadraticCurveTo(138, 20, 138, 118); g.closePath(); fs(g, gr, 4);
      g.save(); g.globalAlpha = 0.6; E(g, 54, 54, 12, 26, '#fff', 0, 0.4); g.restore();
      E(g, 62, 84, 4, 5, OUT, 0); E(g, 98, 84, 4, 5, OUT, 0);
      g.beginPath(); g.arc(80, 90, 8, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = 2.5; g.strokeStyle = OUT; g.stroke();
    });
  }
  function gum() {
    return mk(170, 90, g => {
      E(g, 85, 62, 74, 20, '#ff8fc8'); E(g, 50, 50, 30, 20, '#ff8fc8'); E(g, 122, 48, 32, 22, '#ff8fc8'); E(g, 88, 44, 30, 20, '#ff8fc8');
      E(g, 120, 30, 16, 16, 'rgba(255,255,255,.55)', 3);
      g.strokeStyle = '#ffb3dc'; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(30, 74); g.quadraticCurveTo(14, 60, 22, 42); g.stroke(); g.beginPath(); g.moveTo(148, 72); g.quadraticCurveTo(166, 60, 156, 44); g.stroke();
      E(g, 70, 46, 3.4, 4, OUT, 0); E(g, 104, 46, 3.4, 4, OUT, 0);
    });
  }
  function palm(flip, leaf) {
    return mk(240, 250, g => {
      if (flip) { g.translate(220, 0); g.scale(-1, 1); } else g.translate(20, 0);
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(100, 246); g.quadraticCurveTo(84, 150, 122, 66);
      g.lineWidth = 26; g.strokeStyle = OUT; g.stroke();
      g.lineWidth = 19; g.strokeStyle = '#b9814f'; g.stroke();
      const tx = 122, ty = 62;
      [[-2.9, 0], [-2.3, 0], [-1.7, 0], [-1.2, 0], [-0.5, 0], [0.1, 0], [0.6, 0]].forEach(([a]) => {
        E(g, tx + Math.cos(a) * 48, ty + Math.sin(a) * 26 + 6, 52, 13, leaf || '#3fbf5a', 3, a * 0.55);
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
  function arrow(dir) {
    return mk(180, 170, g => {
      R(g, 82, 100, 16, 70, 3, '#8a5a3a', 2.5);
      R(g, 10, 8, 160, 100, 14, '#ffd23f', 4);
      R(g, 18, 16, 144, 84, 10, '#2b2833', 0);
      g.save(); g.translate(90, 58); g.scale(dir, 1);
      for (let i = 0; i < 2; i++) {
        const x = -34 + i * 38;
        g.beginPath(); g.moveTo(x, -34); g.lineTo(x + 30, 0); g.lineTo(x, 34); g.lineTo(x + 14, 34); g.lineTo(x + 44, 0); g.lineTo(x + 14, -34); g.closePath();
        g.fillStyle = i ? '#ffd23f' : '#fff27a'; g.fill();
      }
      g.restore();
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
  function surfboards() {
    return mk(150, 170, g => {
      R(g, 18, 152, 114, 12, 4, '#8a5a3a', 3);
      [[45, '#ff5c7a', -0.16], [75, '#ffe680', 0], [105, '#7fe4ff', 0.16]].forEach(([x, c, r]) => {
        E(g, x, 84, 17, 68, c, 3.5, r); E(g, x, 84, 3, 58, 'rgba(255,255,255,.75)', 0, r);
      });
      R(g, 26, 112, 98, 9, 4, '#6a4a2a', 3);
    });
  }
  function lifebuoy() {
    return mk(100, 150, g => {
      R(g, 45, 70, 10, 80, 3, '#8a5a3a', 3);
      E(g, 50, 52, 38, 38, '#ff4d5e', 4);
      g.strokeStyle = '#fff'; g.lineWidth = 12;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(50, 52, 27, i * Math.PI / 2 + 0.2, i * Math.PI / 2 + 0.75); g.stroke(); }
      g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(50, 52, 15, 0, TAU); g.fill(); g.restore();
      g.beginPath(); g.arc(50, 52, 15, 0, TAU); g.lineWidth = 3.5; g.strokeStyle = OUT; g.stroke();
    });
  }
  function stall() {
    return mk(210, 180, g => {
      R(g, 28, 60, 8, 112, 2, '#8a5a3a', 2.5); R(g, 174, 60, 8, 112, 2, '#8a5a3a', 2.5);
      R(g, 24, 114, 162, 56, 6, '#c98a5a', 3.5);
      R(g, 40, 122, 130, 12, 4, '#ffe6b0', 2.5);
      for (let i = 0; i < 6; i++) poly(g, [[14 + i * 30.5, 66], [44.5 + i * 30.5, 66], [42 + i * 30.5, 30 + (i % 2) * 0], [22 + i * 30.5, 30]].map((p, k) => [p[0], k > 1 ? p[1] : p[1]]), i % 2 ? '#fff' : '#ff4d5e', 2.5);
      for (const x of [55, 105, 155]) { glow(g, x, 82, 24, '#ffd27a', 0.7); E(g, x, 82, 10, 13, '#ff4d5e', 2.5); }
    });
  }
  function torii() {
    return mk(210, 210, g => {
      R(g, 42, 60, 20, 148, 3, '#ff4d5e', 3.5); R(g, 148, 60, 20, 148, 3, '#ff4d5e', 3.5);
      R(g, 50, 96, 110, 12, 3, '#ff4d5e', 3);
      poly(g, [[6, 44], [204, 44], [192, 64], [18, 64]], '#ff4d5e', 3.5);
      poly(g, [[0, 26], [210, 26], [200, 46], [10, 46]], '#2b2833', 3.5);
      R(g, 92, 46, 26, 22, 3, '#ffe680', 2.5);
    });
  }
  function bareSnow(c) {
    return mk(190, 250, g => {
      g.lineCap = 'round';
      const br = (x1, y1, x2, y2, w) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineWidth = w + 6; g.strokeStyle = OUT; g.stroke(); g.lineWidth = w; g.strokeStyle = c || '#8a6a54'; g.stroke(); };
      br(95, 248, 95, 110, 22);
      br(95, 150, 42, 96, 12); br(95, 130, 148, 78, 12); br(95, 110, 70, 40, 10); br(95, 100, 124, 34, 10);
      br(42, 96, 22, 60, 7); br(148, 78, 170, 46, 7);
      g.strokeStyle = '#ffffff'; g.lineWidth = 7;
      [[42, 96, 22, 60], [148, 78, 170, 46], [70, 40, 92, 100], [124, 34, 96, 98]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(a, b - 6); g.lineTo(a + (c2 - a) * 0.5, b + (d - b) * 0.5 - 6); g.stroke(); });
      E(g, 95, 100, 20, 8, '#fff', 0); E(g, 60, 92, 22, 7, '#fff', 0);
    });
  }
  function iceSpire() {
    return mk(170, 240, g => {
      const gr = g.createLinearGradient(0, 0, 0, 236); gr.addColorStop(0, '#f2fcff'); gr.addColorStop(1, '#6fc8ff');
      poly(g, [[36, 236], [26, 140], [50, 90], [66, 236]], gr, 3.5);
      poly(g, [[128, 236], [136, 130], [118, 100], [104, 236]], gr, 3.5);
      poly(g, [[62, 236], [58, 100], [84, 8], [112, 96], [110, 236]], gr, 4);
      poly(g, [[70, 90], [84, 30], [90, 90]], 'rgba(255,255,255,.7)', 0);
      g.strokeStyle = '#a8def8'; g.lineWidth = 3; g.beginPath(); g.moveTo(84, 60); g.lineTo(80, 150); g.lineTo(92, 200); g.stroke();
    });
  }
  function iceCluster() {
    return mk(130, 110, g => {
      const gr = g.createLinearGradient(0, 0, 0, 108); gr.addColorStop(0, '#f2fcff'); gr.addColorStop(1, '#7fd0ff');
      poly(g, [[14, 106], [24, 50], [44, 106]], gr, 3); poly(g, [[86, 106], [100, 40], [118, 106]], gr, 3);
      poly(g, [[40, 106], [56, 8], [82, 106]], gr, 3.5); poly(g, [[50, 60], [58, 24], [64, 60]], 'rgba(255,255,255,.7)', 0);
    });
  }
  function sled() {
    return mk(160, 110, g => {
      g.lineCap = 'round'; g.strokeStyle = '#6a4a3a'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(14, 96); g.lineTo(140, 96); g.quadraticCurveTo(156, 96, 150, 76); g.stroke();
      R(g, 30, 66, 100, 26, 10, '#c9503a', 3.5);
      R(g, 56, 36, 34, 30, 4, '#7fe4ff', 3); R(g, 68, 36, 10, 30, 0, '#ffe680', 0); R(g, 90, 46, 28, 20, 4, '#8dff8a', 3);
      E(g, 73, 32, 9, 6, '#ffe680', 2);
    });
  }
  function giftBox() {
    return mk(120, 120, g => {
      R(g, 16, 50, 88, 64, 4, '#ff5c7a', 3.5); R(g, 10, 38, 100, 20, 4, '#ff7a94', 3.5);
      R(g, 50, 38, 20, 76, 0, '#ffe680', 2.5);
      E(g, 42, 30, 16, 11, '#ffe680', 3, -0.5); E(g, 78, 30, 16, 11, '#ffe680', 3, 0.5); E(g, 60, 34, 7, 7, '#ffd23f', 2.5);
    });
  }
  function lampPost() {
    return mk(90, 240, g => {
      glow(g, 45, 40, 60, '#fff3a0', 0.6);
      R(g, 39, 50, 12, 188, 3, '#3a3a4a', 3); R(g, 28, 226, 34, 12, 4, '#3a3a4a', 3);
      poly(g, [[22, 22], [68, 22], [56, 6], [34, 6]], '#3a3a4a', 3);
      R(g, 28, 22, 34, 34, 5, '#fff3a0', 3);
    });
  }
  function cottonTree(c1, c2) {
    return mk(160, 240, g => {
      g.strokeStyle = OUT; g.lineWidth = 15; g.lineCap = 'round'; g.beginPath(); g.moveTo(80, 120); g.lineTo(80, 234); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 8; g.beginPath(); g.moveTo(80, 120); g.lineTo(80, 234); g.stroke();
      [[52, 84, 34], [108, 84, 34], [80, 50, 40], [56, 46, 26], [104, 46, 26], [80, 92, 32]].forEach(([x, y, r]) => E(g, x, y, r, r * 0.92, c1, 3.5));
      [[62, 60, 10], [100, 70, 8], [76, 90, 9], [50, 84, 7]].forEach(([x, y, r]) => E(g, x, y, r, r, c2, 0));
    });
  }
  function chocoTree() {
    return mk(170, 240, g => {
      R(g, 68, 120, 34, 118, 8, '#7a4a34', 3.5); R(g, 68, 120, 34, 118, 8, null, 0);
      E(g, 85, 82, 66, 58, '#8a5a44', 4);
      g.fillStyle = '#fff6ea'; g.beginPath(); g.ellipse(85, 44, 60, 22, 0, Math.PI, TAU); g.fill();
      [[38, 8], [64, 24], [92, 14], [120, 26], [148, 8]].forEach(([x, d]) => { g.beginPath(); g.arc(x, 44, 12, 0, Math.PI); g.lineTo(x - 12, 44); g.fill(); g.fillRect(x - 12, 40, 24, d); });
      E(g, 85, 82, 66, 58, null, 4);
      [[52, 74], [96, 70], [76, 100], [116, 92], [44, 98]].forEach(([x, y], i) => E(g, x, y, 4, 3, ['#ff7ab8', '#7fe4ff', '#ffe680'][i % 3], 0, i));
    });
  }
  function iceCream() {
    return mk(110, 210, g => {
      poly(g, [[20, 96], [90, 96], [55, 204]], '#e8b96a', 3.5);
      g.strokeStyle = '#c8964a'; g.lineWidth = 2.5;
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(55 + i * 12, 100); g.lineTo(55 + i * 3, 180); g.stroke(); }
      E(g, 55, 88, 40, 30, '#ff9fc4', 3.5); E(g, 55, 54, 32, 28, '#8ee8ff', 3.5); E(g, 55, 26, 8, 8, '#ff3f5c', 2.5);
      E(g, 40, 82, 8, 4, 'rgba(255,255,255,.6)', 0, -0.4);
    });
  }
  function cookie() {
    return mk(140, 140, g => {
      g.save(); g.globalAlpha = 0.15; E(g, 70, 128, 50, 9, '#000', 0); g.restore();
      E(g, 70, 74, 56, 56, '#d8a05a', 4);
      g.save(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(122, 34, 18, 0, TAU); g.fill(); g.restore();
      [[46, 52], [86, 46], [62, 84], [98, 88], [40, 90], [78, 66]].forEach(([x, y], i) => E(g, x, y, 8, 7, '#6a3a24', 2, i));
    });
  }
  function popcorn() {
    return mk(150, 180, g => {
      poly(g, [[8, 44], [142, 44], [124, 14], [26, 14]], '#ff4d5e', 3.5);
      for (let i = 0; i < 4; i++) poly(g, [[26 + i * 30, 14], [56 + i * 30 - 8, 14], [50 + i * 30, 44], [8 + i * 33, 44]], i % 2 ? '#fff' : '#ff4d5e', 0);
      R(g, 20, 52, 110, 66, 6, 'rgba(255,255,255,.45)', 3);
      for (let i = 0; i < 16; i++) E(g, 32 + (i % 6) * 17 + (i > 5 ? 8 : 0), 62 + Math.floor(i / 6) * 17, 9, 8, '#fff3c0', 2, i);
      R(g, 14, 118, 122, 44, 6, '#ff4d5e', 3.5); R(g, 40, 128, 70, 12, 3, '#fff', 2);
      E(g, 34, 168, 12, 12, '#3a3a4a', 3); E(g, 116, 168, 12, 12, '#3a3a4a', 3);
    });
  }
  function lightPole() {
    return mk(100, 240, g => {
      R(g, 44, 36, 10, 200, 3, '#e6d0ff', 3);
      for (let i = 0; i < 6; i++) { const c = ['#ff4fd0', '#3ff0ff', '#ffe24d'][i % 3]; glow(g, 49 + (i % 2 ? 22 : -22), 50 + i * 30, 20, c, 0.9); E(g, 49 + (i % 2 ? 22 : -22), 50 + i * 30, 6, 6, c, 1.5); }
      glow(g, 49, 24, 30, '#ffffff', 0.8); E(g, 49, 24, 10, 10, '#fff', 2);
    });
  }
  function rocketShape(g, cx, top, s) {
    poly(g, [[cx - 20 * s, top + 40 * s], [cx, top], [cx + 20 * s, top + 40 * s]], '#ff4d5e', 3.5);
    R(g, cx - 20 * s, top + 36 * s, 40 * s, 56 * s, 10 * s, '#f4f4fa', 3.5);
    E(g, cx, top + 58 * s, 9 * s, 9 * s, '#8ee8ff', 2.5);
    poly(g, [[cx - 20 * s, top + 74 * s], [cx - 40 * s, top + 104 * s], [cx - 20 * s, top + 94 * s]], '#ff4d5e', 3);
    poly(g, [[cx + 20 * s, top + 74 * s], [cx + 40 * s, top + 104 * s], [cx + 20 * s, top + 94 * s]], '#ff4d5e', 3);
  }
  function missile0() {
    return mk(100, 150, g => {
      glow(g, 50, 116, 40, '#ffb35c', 0.8);
      poly(g, [[36, 94], [50, 146], [64, 94]], '#ffb32b', 2.5); poly(g, [[42, 94], [50, 128], [58, 94]], '#fff3a0', 0);
      rocketShape(g, 50, 4, 1);
    });
  }
  function missile1() {
    return mk(100, 120, g => {
      [[30, 108, 14], [52, 112, 12], [70, 104, 10]].forEach(([x, y, r]) => E(g, x, y, r, r * 0.8, 'rgba(215,215,225,.85)', 0));
      E(g, 50, 56, 34, 34, '#4a4a5c', 4); E(g, 50, 56, 34, 8, null, 0);
      E(g, 38, 42, 11, 7, 'rgba(255,255,255,.5)', 0, -0.5);
      g.strokeStyle = '#8a8a9c'; g.lineWidth = 4; g.beginPath(); g.ellipse(50, 56, 34, 10, 0, 0, TAU); g.stroke();
      g.strokeStyle = '#8a5a3a'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(50, 22); g.quadraticCurveTo(58, 10, 66, 12); g.stroke();
      glow(g, 67, 12, 16, '#ffd23f', 0.9); E(g, 67, 12, 5, 5, '#fff3a0', 0);
    });
  }
  function missile2() {
    return mk(100, 130, g => {
      glow(g, 50, 110, 30, '#7fe4ff', 0.6);
      g.save(); g.translate(50, 60); g.rotate(0.14);
      R(g, -32, -44, 64, 88, 8, '#c0c6da', 4); R(g, -22, -44, 44, 13, 3, '#7a809a', 3);
      R(g, -24, -26, 48, 42, 4, '#ff5c7a', 3);
      g.fillStyle = '#fff'; g.font = '900 20px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TR', 0, -4);
      g.fillStyle = '#ffe680'; g.fillRect(-16, 6, 32, 5);
      R(g, -20, 34, 40, 8, 2, '#ffd23f', 2.5);
      g.restore();
    });
  }
  function missileBox() {
    return mk(96, 110, g => {
      glow(g, 48, 60, 46, '#ffb35c', 0.8);
      R(g, 10, 34, 76, 64, 10, '#ff9a3c', 4);
      R(g, 10, 34, 76, 14, 6, '#ffb35c', 3);
      g.save(); g.translate(48, 52); g.scale(0.52, 0.52); rocketShape(g, 0, 0, 1); g.restore();
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
    palm: () => palm(false), palmB: () => palm(true, '#5fd07a'),
    bush: () => bush('#66cf58', '#3a9a3a', false),
    bushFlower: () => bush('#66cf58', '#3a9a3a', true),
    bushDry: () => bush('#d8c25a', '#a89a3a', true),
    bushNight: () => bush('#238a7c', '#0f5a58', true),
    lantern, redLantern, umbrella, rabbit, crab, fox, signBoard: sign,
    snowPine: () => pine(190, 250, '#4fbf7a', '#2f8f5a', '#8a5a44', '#ffffff'),
    snowPineB: () => pine(190, 250, '#3fa8b8', '#2a7a90', '#7a5a4a', '#ffffff'),
    snowPineD: () => pine(190, 250, '#8a6ac8', '#5a4a98', '#6a4a5a', '#ffe6f2'),
    snowPineN: () => pine(190, 250, '#2f7a9a', '#1a4a70', '#4a3a58', '#dcecff'),
    xmasTree: () => pine(180, 260, '#2fa05a', '#1d6a42', '#6a4a3a', '#ffffff', true),
    snowBush, snowman, igloo, penguin, iceBlock, snowdrift,
    lollipopA: () => lollipop('#ff8fc8', '#ffffff'), lollipopB: () => lollipop('#7fe4ff', '#ffffff', '#ffd6ec'),
    lollipopC: () => lollipop('#ffe680', '#ff9a3c'), lollipopD: () => lollipop('#c98a5a', '#ffe6c0', '#ffe6c0'),
    lollipopN: () => lollipop('#ff4fd0', '#3ff0ff', '#e6d0ff'), lollipopN2: () => lollipop('#3ff0ff', '#ff4fd0', '#e6d0ff'),
    gumdropA: () => gumdrop(['#ff7ab8', '#7fe4ff', '#ffe680']), gumdropB: () => gumdrop(['#ff9a3c', '#c98a5a', '#ffd23f']),
    gumdropN: () => gumdrop(['#ff4fd0', '#3ff0ff', '#b48aff']),
    surfboards, lifebuoy, stall, torii, ginkgo: () => tree(200, 250, '#ffd23f', '#e0a020', '#5a4a3a', '#fff3a0'),
    bareSnow: () => bareSnow(), bareSnowD: () => bareSnow('#7a5a78'), iceSpire, iceCluster, sled, giftBox, lampPost,
    cottonPink: () => cottonTree('#ffb3dc', '#ffe6f4'), cottonBlue: () => cottonTree('#a8e8ff', '#e6f8ff'),
    chocoTree, iceCream, cookie, popcorn, lightPole,
    missile0, missile1, missile2, missileBox,
    cupcake, candyCane, donut, balloon, gummy, jelly, gum,
    coin, nitro, poop, rock, arrowR: () => arrow(1), arrowL: () => arrow(-1),
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
