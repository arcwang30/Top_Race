'use strict';

// 遠 / 中 / 近 三層視差背景(每個賽段一種風格),皆為可無縫循環的橫向圖塊
const BG = (() => {
  const T = 1080;
  const cache = {};
  const FAR = 0.04, MID = 0.09, NEAR = 0.18;

  function mk(h, fn) {
    const c = document.createElement('canvas');
    c.width = T; c.height = h;
    const g = c.getContext('2d');
    fn(g, T, h, rng(h * 7 + 3));
    return c;
  }
  const wrap = fn => { for (const dx of [-T, 0, T]) fn(dx); };
  const per = (k, x) => Math.sin((k * TAU * x) / T);

  function cloud(g, x, y, s, c1, c2) {
    wrap(dx => {
      g.fillStyle = c2;
      [[0, 8, 34], [36, 12, 26], [-34, 12, 24]].forEach(([ox, oy, r]) => { g.beginPath(); g.ellipse(x + dx + ox * s, y + oy * s, r * s * 1.2, r * s * 0.8, 0, 0, TAU); g.fill(); });
      g.fillStyle = c1;
      [[0, 0, 34], [38, 6, 26], [-36, 6, 24], [14, -14, 24]].forEach(([ox, oy, r]) => { g.beginPath(); g.ellipse(x + dx + ox * s, y + oy * s, r * s * 1.2, r * s * 0.85, 0, 0, TAU); g.fill(); });
    });
  }
  function hills(g, h, base, amp, colors, ks, ph) {
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= T; x += 8) {
      let y = base;
      ks.forEach((k, i) => { y -= amp[i] * (1 + per(k, x + ph[i])) / 2; });
      g.lineTo(x, y);
    }
    g.lineTo(T, h); g.closePath(); g.fillStyle = colors; g.fill();
  }
  function pagoda(g, x, y, s, col, roof) {
    wrap(dx => {
      g.save(); g.translate(x + dx, y); g.scale(s, s);
      for (let i = 0; i < 4; i++) {
        const w = 44 - i * 8, yy = -i * 22;
        g.fillStyle = col; g.fillRect(-w / 2 + 4, yy - 16, w - 8, 16);
        g.fillStyle = roof; g.beginPath(); g.moveTo(-w / 2 - 8, yy - 16); g.lineTo(0, yy - 26); g.lineTo(w / 2 + 8, yy - 16); g.lineTo(w / 2 + 4, yy - 12); g.lineTo(-w / 2 - 4, yy - 12); g.closePath(); g.fill();
      }
      g.fillRect(-1.5, -104, 3, 16);
      g.restore();
    });
  }

  const makers = [
    // ---- 春日櫻花道 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h, r) => {
        [[120, 80, 1], [430, 44, 0.8], [780, 92, 1.1], [980, 54, 0.7]].forEach(([x, y, s]) => cloud(g, x, y, s, '#ffffff', '#cfeaff'));
        wrap(dx => {
          g.fillStyle = '#9cc0e8'; g.beginPath(); g.moveTo(180 + dx, h); g.quadraticCurveTo(280 + dx, 150, 300 + dx, 170); g.quadraticCurveTo(340 + dx, 200, 440 + dx, h); g.fill();
          g.beginPath(); g.moveTo(860 + dx, h); g.quadraticCurveTo(940 + dx, 190, 960 + dx, 200); g.quadraticCurveTo(1010 + dx, 230, 1060 + dx, h); g.fill();
          g.fillStyle = '#7fa6d9'; g.beginPath(); g.moveTo(450 + dx, h); g.quadraticCurveTo(590 + dx, 130, 612 + dx, 96); g.lineTo(638 + dx, 96); g.quadraticCurveTo(660 + dx, 130, 800 + dx, h); g.closePath(); g.fill();
          g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(560 + dx, 154); g.quadraticCurveTo(596 + dx, 110, 612 + dx, 96); g.lineTo(638 + dx, 96); g.quadraticCurveTo(654 + dx, 110, 690 + dx, 154);
          g.lineTo(668 + dx, 146); g.lineTo(650 + dx, 166); g.lineTo(625 + dx, 148); g.lineTo(600 + dx, 168); g.lineTo(582 + dx, 146); g.closePath(); g.fill();
        });
      }) },
      { f: MID, c: mk(200, (g, w, h) => {
        hills(g, h, 150, [40, 22], '#9fe28a', [1, 3], [0, 90]);
        pagoda(g, 300, 140, 0.9, '#fff4d6', '#ff7a95'); pagoda(g, 820, 132, 0.7, '#fff4d6', '#ff7a95');
        hills(g, h, 176, [34, 16], '#79d566', [2, 4], [200, 40]);
        const r = rng(11);
        for (let i = 0; i < 16; i++) { const x = r() * T, y = 128 + r() * 40; wrap(dx => { g.fillStyle = i % 3 ? '#ffb7d5' : '#ff9fc4'; g.beginPath(); g.ellipse(x + dx, y, 22, 17, 0, 0, TAU); g.fill(); g.fillStyle = '#ffd6e6'; g.beginPath(); g.ellipse(x + dx - 6, y - 6, 10, 7, 0, 0, TAU); g.fill(); }); }
      }) },
      { f: NEAR, c: mk(150, (g, w, h) => {
        g.fillStyle = '#5fc257'; g.fillRect(0, 116, T, 40);
        const r = rng(5);
        for (let i = 0; i < 30; i++) {
          const x = (i / 30) * T + r() * 20, rad = 26 + r() * 16, pink = i % 2 === 0;
          wrap(dx => {
            g.fillStyle = pink ? '#ff9fc4' : '#4fb64a'; g.beginPath(); g.arc(x + dx, 108 - r() * 12, rad, 0, TAU); g.fill();
            g.fillStyle = pink ? '#ffc4dc' : '#6fd35a'; g.beginPath(); g.arc(x + dx - 8, 100 - r() * 8, rad * 0.5, 0, TAU); g.fill();
          });
        }
        g.fillStyle = '#4fb64a'; g.fillRect(0, 128, T, 30);
      }) }
    ],
    // ---- 夕陽海岸 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h, r) => {
        const gr = g.createRadialGradient(270, 214, 10, 270, 214, 110); gr.addColorStop(0, '#fffbd0'); gr.addColorStop(0.55, '#ffd27a'); gr.addColorStop(1, 'rgba(255,150,90,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(270, 214, 110, 0, TAU); g.fill();
        g.fillStyle = '#fff1a8'; g.beginPath(); g.arc(270, 214, 70, 0, TAU); g.fill();
        g.fillStyle = '#ffe17a'; g.beginPath(); g.arc(270, 214, 58, 0, TAU); g.fill();
        [[110, 70, 1.1], [520, 46, 0.9], [760, 96, 1.2], [960, 52, 0.8]].forEach(([x, y, s]) => cloud(g, x, y, s, '#ffd0d8', '#ff9fb8'));
        wrap(dx => { g.fillStyle = '#c56a8a'; g.beginPath(); g.moveTo(640 + dx, h); g.quadraticCurveTo(700 + dx, 200, 780 + dx, 230); g.quadraticCurveTo(840 + dx, 250, 900 + dx, h); g.fill(); });
      }) },
      { f: MID, c: mk(200, (g, w, h, r) => {
        const gr = g.createLinearGradient(0, 120, 0, h); gr.addColorStop(0, '#ffb07a'); gr.addColorStop(1, '#ff8fa8');
        g.fillStyle = gr; g.fillRect(0, 120, T, 90);
        g.fillStyle = 'rgba(255,250,200,.65)';
        for (let i = 0; i < 40; i++) { const x = r() * T, y = 126 + r() * 60; wrap(dx => g.fillRect(x + dx, y, 18 + r() * 24, 3)); }
        wrap(dx => {
          g.fillStyle = '#fff'; g.beginPath(); g.moveTo(420 + dx, 120); g.lineTo(420 + dx, 88); g.lineTo(446 + dx, 118); g.fill();
          g.fillStyle = '#ffe9a8'; g.beginPath(); g.moveTo(414 + dx, 122); g.lineTo(452 + dx, 122); g.lineTo(440 + dx, 130); g.lineTo(420 + dx, 130); g.fill();
          g.fillStyle = '#fff4e0'; g.fillRect(800 + dx, 60, 16, 62); g.fillStyle = '#ff5c7a'; g.fillRect(800 + dx, 78, 16, 8); g.fillRect(800 + dx, 100, 16, 8);
          g.fillStyle = '#ffd23f'; g.fillRect(797 + dx, 48, 22, 12); g.fillStyle = '#ff5c7a'; g.beginPath(); g.moveTo(796 + dx, 48); g.lineTo(808 + dx, 36); g.lineTo(820 + dx, 48); g.fill();
        });
      }) },
      { f: NEAR, c: mk(150, (g, w, h, r) => {
        g.fillStyle = '#8a4a6a'; g.fillRect(0, 118, T, 40);
        hills(g, h, 126, [18, 10], '#8a4a6a', [3, 7], [0, 30]);
        for (let i = 0; i < 9; i++) {
          const x = (i / 9) * T + 40 + r() * 30, hh = 70 + r() * 30;
          wrap(dx => {
            g.strokeStyle = '#6a3358'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + dx, 130); g.quadraticCurveTo(x + dx - 10, 130 - hh / 2, x + dx + 10, 130 - hh); g.stroke();
            g.fillStyle = '#6a3358';
            for (let k = 0; k < 5; k++) { const a = -2.9 + k * 0.6; g.beginPath(); g.ellipse(x + dx + 10 + Math.cos(a) * 20, 130 - hh + Math.sin(a) * 10 + 4, 24, 6, a * 0.6, 0, TAU); g.fill(); }
          });
        }
      }) }
    ],
    // ---- 星夜祭典 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h, r) => {
        for (let i = 0; i < 90; i++) { const x = r() * T, y = r() * 200, s = r() < 0.15 ? 2.4 : 1.3; g.fillStyle = r() < 0.5 ? '#ffffff' : '#ffe9a8'; g.fillRect(x, y, s, s); }
        wrap(dx => {
          const mx = 800 + dx;
          glow(g, mx, 100, 90, '#ffe9a8', 0.35);
          g.fillStyle = '#fff2b8'; g.beginPath(); g.arc(mx, 100, 46, 0, TAU); g.fill();
          g.fillStyle = '#ffe28a'; [[-14, -10, 9], [12, 14, 7], [16, -16, 5]].forEach(([ox, oy, rr]) => { g.beginPath(); g.arc(mx + ox, 100 + oy, rr, 0, TAU); g.fill(); });
          g.fillStyle = '#4a3a8a'; g.beginPath(); g.moveTo(80 + dx, h); g.quadraticCurveTo(240 + dx, 150, 340 + dx, h); g.fill();
          g.beginPath(); g.moveTo(520 + dx, h); g.quadraticCurveTo(620 + dx, 190, 720 + dx, h); g.fill();
        });
      }) },
      { f: MID, c: mk(200, (g, w, h, r) => {
        g.fillStyle = '#2a1f5a';
        for (let i = 0; i < 26; i++) {
          const x = (i / 26) * T, bw = 30 + r() * 24, bh = 40 + r() * 70;
          wrap(dx => {
            g.fillStyle = '#2a1f5a'; g.fillRect(x + dx, h - bh, bw, bh);
            g.fillStyle = '#ffe58a';
            for (let wy = h - bh + 8; wy < h - 10; wy += 14) for (let wx = x + 5; wx < x + bw - 8; wx += 12) if (r() < 0.5) g.fillRect(wx + dx, wy, 5, 7);
          });
        }
        wrap(dx => {
          const cx = 300 + dx, cy = 96;
          g.strokeStyle = '#ff7ab8'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 58, 0, TAU); g.stroke();
          g.strokeStyle = '#8ee8ff'; g.lineWidth = 2;
          for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58); g.stroke(); g.fillStyle = i % 2 ? '#ffe24d' : '#ff7ab8'; g.beginPath(); g.arc(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58, 6, 0, TAU); g.fill(); }
          g.strokeStyle = '#2a1f5a'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 30, h); g.lineTo(cx, cy); g.lineTo(cx + 30, h); g.stroke();
          g.fillStyle = '#ff4d5e'; g.beginPath(); g.moveTo(800 + dx, h); g.lineTo(812 + dx, 40); g.lineTo(824 + dx, h); g.closePath(); g.fill();
          g.fillStyle = '#fff'; g.fillRect(806 + dx, 88, 12, 5); g.fillRect(804 + dx, 128, 16, 5);
        });
      }) },
      { f: NEAR, c: mk(150, (g, w, h, r) => {
        g.fillStyle = '#0d3a48'; g.fillRect(0, 122, T, 40);
        for (let i = 0; i < 22; i++) {
          const x = (i / 22) * T + r() * 20, hh = 70 + r() * 50;
          wrap(dx => { g.fillStyle = i % 2 ? '#0f4a55' : '#0b3340'; g.beginPath(); g.moveTo(x + dx, h - hh); g.lineTo(x + dx + 26, h - 24); g.lineTo(x + dx - 26, h - 24); g.fill(); g.beginPath(); g.moveTo(x + dx, h - hh + 26); g.lineTo(x + dx + 34, h - 8); g.lineTo(x + dx - 34, h - 8); g.fill(); });
        }
        for (let i = 0; i < 14; i++) {
          const x = (i / 14) * T + 30;
          wrap(dx => glow(g, x + dx, 118 - (i % 3) * 8, 22, i % 2 ? '#ff7ab8' : '#ffe24d', 0.85));
        }
      }) }
    ]
  ];

  function glow(g, x, y, r, color, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.save(); g.globalAlpha = a; g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore();
  }

  function layers(th) { return cache[th] || (cache[th] = makers[th]()); }

  function draw(g, th, off, hor, alpha) {
    const L = layers(th), s = THEMES[th].sky;
    g.save();
    if (alpha !== undefined && alpha < 1) g.globalAlpha = alpha;
    const gr = g.createLinearGradient(0, 0, 0, hor + 4);
    gr.addColorStop(0, s[0]); gr.addColorStop(0.6, s[1]); gr.addColorStop(1, s[2]);
    g.fillStyle = gr; g.fillRect(0, 0, W, hor + 4);
    L.forEach((ly, i) => {
      const x0 = -(((off[i] % T) + T) % T), y = hor - ly.c.height + 6;
      g.drawImage(ly.c, x0, y); g.drawImage(ly.c, x0 + T, y);
    });
    g.restore();
  }

  return { draw, FACTORS: [FAR, MID, NEAR], warm() { for (let i = 0; i < 3; i++) layers(i); } };
})();
