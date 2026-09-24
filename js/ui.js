'use strict';

// 即時模式(immediate-mode)UI 小工具:文字、面板、按鈕、標題 Logo
const UI = {
  text(g, str, x, y, size, o) {
    o = o || {};
    str = tr(str);
    g.save();
    if (o.alpha !== undefined) g.globalAlpha = o.alpha;
    g.font = `${o.italic ? 'italic ' : ''}${o.weight || 900} ${size}px ${FONT}`;
    g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const stroke = o.stroke === undefined ? '#40284a' : o.stroke;
    if (stroke) { g.lineWidth = o.sw || Math.max(3, size * 0.16); g.strokeStyle = stroke; g.strokeText(str, x, y); }
    g.fillStyle = o.fill || '#fff'; g.fillText(str, x, y);
    g.restore();
  },

  sticker(g, str, x, y, size, o) {
    g.save();
    g.font = `${o.italic ? 'italic ' : ''}900 ${size}px ${FONT}`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = size * 0.34; g.strokeStyle = '#40284a'; g.strokeText(str, x, y);
    g.lineWidth = size * 0.2; g.strokeStyle = '#ffffff'; g.strokeText(str, x, y);
    const gr = g.createLinearGradient(0, y - size * 0.5, 0, y + size * 0.5);
    gr.addColorStop(0, o.grad[0]); gr.addColorStop(1, o.grad[1]);
    g.fillStyle = gr; g.fillText(str, x, y);
    g.restore();
  },

  logo(g, cx, cy, sc, t) {
    g.save(); g.translate(cx, cy); g.scale(sc, sc);
    const bob = Math.sin(t * 2.2) * 3;
    this.sticker(g, '頂尖賽車', 0, -58 + bob, 100, { grad: ['#fff27a', '#ffa41f'] });
    g.save(); g.translate(0, 34 + bob * 0.6); g.rotate(-0.05);
    this.sticker(g, 'TOP RACE', 0, 0, 74, { grad: ['#ff9fb5', '#ff3f6c'], italic: true });
    g.restore();
    this.sticker(g, 'トップレース', 0, 100 + bob * 0.4, 34, { grad: ['#ffffff', '#bfe3ff'] });
    g.restore();
  },

  panel(g, x, y, w, h, r, fill, stroke) {
    g.save();
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h);
    g.fillStyle = fill || 'rgba(30,20,60,.55)'; g.fill();
    g.lineWidth = 2; g.strokeStyle = stroke || 'rgba(255,255,255,.35)'; g.stroke();
    g.restore();
  },

  digits(g, str, x, y, cell, size) {
    for (let i = 0; i < str.length; i++) this.text(g, str[i], x + cell * i + cell / 2, y, size, { sw: 5 });
  },

  wrap(g, str, x, y, maxW, lineH, size, o) {
    str = tr(str);
    g.font = `${(o && o.weight) || 700} ${size}px ${FONT}`;
    const lines = []; let cur = '';
    const words = Save.data.lang === 'en';
    for (const ch of (words ? str.split(/(?<= )/) : str)) {
      if (ch === '\n') { lines.push(cur); cur = ''; continue; }
      if (g.measureText(cur + ch).width > maxW && cur) { lines.push(cur.trimEnd()); cur = ch; } else cur += ch;
    }
    if (cur) lines.push(cur);
    lines.forEach((ln, i) => this.text(g, ln, x, y + i * lineH, size, Object.assign({ align: 'left', stroke: null }, o || {})));
    return lines.length * lineH;
  },

  begin(scr) { scr.n = 0; },

  button(g, scr, label, x, y, w, h, o) {
    o = o || {};
    const i = scr.n++;
    const inside = (px, py) => px >= x && px <= x + w && py >= y && py <= y + h;
    if (Input.ptr.moved && inside(Input.ptr.x, Input.ptr.y) && scr.sel !== i) { scr.sel = i; Sound.play('select'); }
    let hit = false;
    for (const t of Input.taps) if (inside(t.x, t.y)) { scr.sel = i; hit = true; }
    const focus = scr.sel === i;
    if (focus && Input.was('confirm')) hit = true;

    const pulse = focus ? 1 + Math.sin(App.t * 8) * 0.012 : 1;
    const c1 = o.c1 || '#ffb347', c2 = o.c2 || '#ff6b81';
    g.save();
    g.translate(x + w / 2, y + h / 2); g.scale(pulse * (focus ? 1.04 : 1), pulse * (focus ? 1.04 : 1));
    g.beginPath(); if (g.roundRect) g.roundRect(-w / 2, -h / 2 + 5, w, h, h / 2); else g.rect(-w / 2, -h / 2 + 5, w, h);
    g.fillStyle = 'rgba(30,10,50,.5)'; g.fill();
    const gr = g.createLinearGradient(0, -h / 2, 0, h / 2);
    gr.addColorStop(0, focus ? '#fff27a' : c1); gr.addColorStop(1, focus ? '#ffa41f' : c2);
    g.beginPath(); if (g.roundRect) g.roundRect(-w / 2, -h / 2, w, h, h / 2); else g.rect(-w / 2, -h / 2, w, h);
    g.fillStyle = gr; g.fill();
    g.lineWidth = focus ? 5 : 3.5; g.strokeStyle = focus ? '#ffffff' : '#40284a'; g.stroke();
    g.globalAlpha = 0.35; g.fillStyle = '#fff';
    g.beginPath(); if (g.roundRect) g.roundRect(-w / 2 + 10, -h / 2 + 5, w - 20, h * 0.3, h * 0.15); else g.rect(-w / 2 + 10, -h / 2 + 5, w - 20, h * 0.3); g.fill();
    g.restore();
    this.text(g, label, x + w / 2, y + h / 2 + 1, o.size || Math.min(30, h * 0.56), { fill: focus ? '#7a2a10' : '#fff', stroke: focus ? '#ffffff' : '#40284a', sw: focus ? 5 : 5 });
    if (focus) this.text(g, '▶', x + 26, y + h / 2 + 1, 22, { fill: '#ff5c7a', stroke: '#fff', sw: 4 });

    if (hit) Sound.play(o.back ? 'back' : 'confirm');
    return hit;
  },

  nav(scr) {
    if (scr.n <= 0) return;
    if (Input.was('up')) { scr.sel = (scr.sel - 1 + scr.n) % scr.n; Sound.play('select'); }
    if (Input.was('down')) { scr.sel = (scr.sel + 1) % scr.n; Sound.play('select'); }
    scr.sel = clamp(scr.sel, 0, scr.n - 1);
  },

  copyright(g) { this.text(g, "©Arc's Concept Game", W - 14, 942, 18, { align: 'right', fill: '#40284a', stroke: '#ffffff', sw: 6 }); },

  inside(px, py, x, y, w, h) { return px >= x && px <= x + w && py >= y && py <= y + h; },
  tapIn(x, y, w, h) { return Input.taps.some(t => this.inside(t.x, t.y, x, y, w, h)); },

  dim(g, a) { g.fillStyle = `rgba(20,10,40,${a})`; g.fillRect(0, 0, W, H); },

  header(g, title, sub) {
    this.text(g, title, W / 2, 62, 50, { fill: '#fff27a', sw: 10 });
    if (sub && tr(title) !== sub) this.text(g, sub, W / 2, 106, 20, { fill: '#cfd8ff', stroke: null });
  }
};
