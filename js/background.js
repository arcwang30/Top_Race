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
    ],
    // ---- 雪原晴空 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h) => {
        [[140, 70, 1], [470, 44, 0.8], [800, 86, 1.1], [990, 50, 0.7]].forEach(([x, y, s]) => cloud(g, x, y, s, '#ffffff', '#d4e8ff'));
        peak(g, 250, 320, 110, h, '#8fb0dc', '#ffffff'); peak(g, 620, 400, 60, h, '#7fa2d4', '#ffffff'); peak(g, 930, 280, 140, h, '#9cbce4', '#ffffff');
      }) },
      { f: MID, c: mk(200, (g, w, h) => {
        hills(g, h, 150, [34, 20], '#eaf4ff', [1, 3], [0, 90]);
        pineRow(g, 176, 24, 46, '#3fa070', '#2f8a5c', 3, '#ffffff');
        hills(g, h, 184, [26, 14], '#ffffff', [2, 4], [200, 40]);
      }) },
      { f: NEAR, c: mk(150, (g, w, h) => {
        hills(g, h, 126, [22, 12], '#f4f9ff', [3, 7], [0, 30]);
        pineRow(g, 132, 14, 76, '#3fa070', '#2f8a5c', 9, '#ffffff');
        g.fillStyle = '#ffffff'; g.fillRect(0, 128, T, 30);
        hills(g, h, 140, [16, 8], '#e6f0fb', [4, 9], [60, 10]);
      }) }
    ],
    // ---- 極光黃昏 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h) => {
        aurora(g, 40, ['rgba(127,255,208,.55)', 'rgba(255,143,208,.5)', 'rgba(170,140,255,.45)']);
        [[130, 90, 1], [560, 50, 0.9], [860, 100, 1.1]].forEach(([x, y, s]) => cloud(g, x, y, s, '#ffd6e6', '#f0a8c8'));
        peak(g, 230, 340, 120, h, '#8a6ac0', '#ffd6ec'); peak(g, 640, 420, 70, h, '#7a5ab4', '#ffd6ec'); peak(g, 950, 280, 150, h, '#9a7ad0', '#ffd6ec');
      }) },
      { f: MID, c: mk(200, (g, w, h) => {
        hills(g, h, 150, [34, 20], '#e8c4e0', [1, 3], [0, 90]);
        pineRow(g, 176, 24, 46, '#6a4aa8', '#5a3a98', 5, '#ffe6f2');
        hills(g, h, 184, [26, 14], '#f8dcec', [2, 4], [200, 40]);
      }) },
      { f: NEAR, c: mk(150, (g, w, h, r) => {
        hills(g, h, 126, [22, 12], '#fde8f2', [3, 7], [0, 30]);
        g.fillStyle = '#fde8f2'; g.fillRect(0, 128, T, 30);
        for (let i = 0; i < 26; i++) {
          const x = (i / 26) * T + r() * 20, hh = 26 + r() * 40;
          wrap(dx => { g.fillStyle = i % 2 ? 'rgba(160,230,255,.85)' : 'rgba(210,180,255,.85)'; g.beginPath(); g.moveTo(x + dx - 10, 128); g.lineTo(x + dx, 128 - hh); g.lineTo(x + dx + 10, 128); g.fill(); });
        }
      }) }
    ],
    // ---- 雪夜聖誕 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h, r) => {
        for (let i = 0; i < 90; i++) { g.fillStyle = r() < 0.5 ? '#fff' : '#cfe8ff'; g.fillRect(r() * T, r() * 190, r() < 0.15 ? 2.4 : 1.3, r() < 0.15 ? 2.4 : 1.3); }
        aurora(g, 30, ['rgba(80,255,180,.5)', 'rgba(120,200,255,.4)']);
        wrap(dx => { glow(g, 800 + dx, 100, 90, '#e6f0ff', 0.35); g.fillStyle = '#f4f8ff'; g.beginPath(); g.arc(800 + dx, 100, 44, 0, TAU); g.fill(); g.fillStyle = '#dce8ff'; g.beginPath(); g.arc(790 + dx, 92, 8, 0, TAU); g.fill(); });
        peak(g, 220, 340, 130, h, '#2a3f8a', '#a8c8ff'); peak(g, 560, 420, 90, h, '#24357a', '#a8c8ff'); peak(g, 960, 300, 150, h, '#2f4696', '#a8c8ff');
      }) },
      { f: MID, c: mk(200, (g, w, h, r) => {
        hills(g, h, 150, [30, 16], '#3a5aa0', [1, 3], [0, 90]);
        for (let i = 0; i < 12; i++) {
          const x = (i / 12) * T + 20 + r() * 30, bw = 34 + r() * 20, bh = 26 + r() * 16;
          wrap(dx => {
            g.fillStyle = '#2a3f7a'; g.fillRect(x + dx, h - 14 - bh, bw, bh);
            g.fillStyle = '#f4f8ff'; g.beginPath(); g.moveTo(x + dx - 6, h - 14 - bh); g.lineTo(x + dx + bw / 2, h - 34 - bh); g.lineTo(x + dx + bw + 6, h - 14 - bh); g.fill();
            g.fillStyle = '#ffe58a'; g.fillRect(x + dx + 6, h - 14 - bh + 8, 9, 10); g.fillRect(x + dx + bw - 15, h - 14 - bh + 8, 9, 10);
          });
        }
        wrap(dx => {
          [[0, 46], [-14, 34], [-26, 24]].forEach(([oy, half], i) => { g.fillStyle = '#1f8a58'; g.beginPath(); g.moveTo(460 + dx, 30 + i * 30); g.lineTo(460 + dx + half, 62 + i * 30); g.lineTo(460 + dx - half, 62 + i * 30); g.fill(); });
          g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(460 + dx, 26, 7, 0, TAU); g.fill();
          for (let k = 0; k < 10; k++) glow(g, 460 + dx + Math.cos(k * 2.1) * 26, 50 + (k % 5) * 14, 8, ['#ff5c7a', '#ffd23f', '#7fe4ff'][k % 3], 0.95);
        });
      }) },
      { f: NEAR, c: mk(150, (g, w, h, r) => {
        g.fillStyle = '#0d2c50'; g.fillRect(0, 122, T, 40);
        pineRow(g, 140, 20, 84, '#0f3a5a', '#0a2a48', 8, '#dcecff');
        for (let i = 0; i < 16; i++) { const x = (i / 16) * T + 30; wrap(dx => glow(g, x + dx, 112 - (i % 3) * 8, 20, ['#ff5c7a', '#ffd23f', '#7fe4ff', '#8dff8a'][i % 4], 0.85)); }
      }) }
    ],
    // ---- 棉花糖晴空 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h) => {
        [[110, 70, 1.1], [420, 40, 0.9], [760, 96, 1.2], [980, 52, 0.8]].forEach(([x, y, s]) => cloud(g, x, y, s, '#ffffff', '#ffc4ec'));
        wrap(dx => { ['#ff7ab8', '#ffb35c', '#ffe680', '#8dff8a', '#7fe4ff', '#b48aff'].forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 7; g.beginPath(); g.arc(650 + dx, h + 6, 150 - i * 7, Math.PI * 1.02, TAU * 0.98); g.stroke(); }); });
        peak(g, 200, 300, 140, h, '#ffb3d9', '#ffffff'); peak(g, 900, 340, 120, h, '#b3ffe0', '#ffffff');
      }) },
      { f: MID, c: mk(200, (g, w, h, r) => {
        hills(g, h, 150, [36, 20], '#b8f5d8', [1, 3], [0, 90]);
        for (let i = 0; i < 14; i++) {
          const x = r() * T, y = 132 + r() * 30, c = ['#ff7ab8', '#7fe4ff', '#ffe680'][i % 3];
          wrap(dx => { g.fillStyle = '#fff'; g.fillRect(x + dx - 1.5, y, 3, 26); g.fillStyle = c; g.beginPath(); g.arc(x + dx, y, 12, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.arc(x + dx, y, 6, 0, TAU * 0.8); g.stroke(); });
        }
        hills(g, h, 182, [28, 14], '#9aecc4', [2, 4], [200, 40]);
      }) },
      { f: NEAR, c: mk(150, (g, w, h, r) => {
        g.fillStyle = '#8ae6b8'; g.fillRect(0, 124, T, 40);
        for (let i = 0; i < 24; i++) {
          const x = (i / 24) * T + r() * 20, rad = 24 + r() * 16, c = ['#ff7ab8', '#7fe4ff', '#ffe680', '#c8a6ff'][i % 4];
          wrap(dx => { g.fillStyle = c; g.beginPath(); g.moveTo(x + dx - rad, 128); g.quadraticCurveTo(x + dx - rad, 128 - rad * 1.5, x + dx, 128 - rad * 1.5); g.quadraticCurveTo(x + dx + rad, 128 - rad * 1.5, x + dx + rad, 128); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(x + dx - rad * 0.4, 128 - rad * 0.9, rad * 0.2, rad * 0.35, 0.5, 0, TAU); g.fill(); });
        }
      }) }
    ],
    // ---- 巧克力黃昏 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h) => {
        const gr = g.createRadialGradient(300, 210, 10, 300, 210, 120); gr.addColorStop(0, '#fff3c0'); gr.addColorStop(0.5, '#ffb35c'); gr.addColorStop(1, 'rgba(255,140,90,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(300, 210, 120, 0, TAU); g.fill();
        g.fillStyle = '#ffd88a'; g.beginPath(); g.arc(300, 210, 62, 0, TAU); g.fill();
        [[120, 70, 1.1], [520, 40, 0.9], [780, 100, 1.2], [980, 56, 0.8]].forEach(([x, y, s]) => cloud(g, x, y, s, '#ffd0b0', '#ff9f88'));
        peak(g, 700, 360, 120, h, '#8a5a44', '#fff0e0'); peak(g, 1000, 280, 160, h, '#7a4a38', '#fff0e0');
      }) },
      { f: MID, c: mk(200, (g, w, h, r) => {
        hills(g, h, 150, [36, 20], '#a06a48', [1, 3], [0, 90]);
        for (let i = 0; i < 10; i++) {
          const x = r() * T, y = 150 + r() * 20;
          wrap(dx => { g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + dx, y + 20); g.lineTo(x + dx, y - 20); g.arc(x + dx + 8, y - 20, 8, Math.PI, 0.2 * Math.PI); g.stroke(); g.strokeStyle = '#ff4d5e'; g.setLineDash([6, 8]); g.stroke(); g.setLineDash([]); });
        }
        hills(g, h, 182, [26, 14], '#8f5a3c', [2, 4], [200, 40]);
      }) },
      { f: NEAR, c: mk(150, (g, w, h, r) => {
        g.fillStyle = '#7a4a34'; g.fillRect(0, 124, T, 40);
        for (let i = 0; i < 24; i++) {
          const x = (i / 24) * T + r() * 20, rad = 22 + r() * 14, c = ['#e89a50', '#c8763a', '#ffd23f'][i % 3];
          wrap(dx => { g.fillStyle = c; g.beginPath(); g.moveTo(x + dx - rad, 128); g.quadraticCurveTo(x + dx - rad, 128 - rad * 1.5, x + dx, 128 - rad * 1.5); g.quadraticCurveTo(x + dx + rad, 128 - rad * 1.5, x + dx + rad, 128); g.fill(); });
        }
        g.strokeStyle = '#e8c48a'; g.lineWidth = 3;
        for (let x = 0; x < T; x += 22) { g.beginPath(); g.moveTo(x, 118); g.lineTo(x, 150); g.stroke(); }
        g.beginPath(); g.moveTo(0, 128); g.lineTo(T, 128); g.stroke(); g.beginPath(); g.moveTo(0, 142); g.lineTo(T, 142); g.stroke();
      }) }
    ],
    // ---- 霓虹樂園夜 ----
    () => [
      { f: FAR, c: mk(300, (g, w, h, r) => {
        for (let i = 0; i < 90; i++) { g.fillStyle = r() < 0.5 ? '#fff' : '#ffe9a8'; g.fillRect(r() * T, r() * 200, r() < 0.15 ? 2.4 : 1.3, r() < 0.15 ? 2.4 : 1.3); }
        [[220, 90, '#ff4fd0'], [560, 60, '#3ff0ff'], [900, 110, '#ffe24d']].forEach(([x, y, c]) => wrap(dx => {
          glow(g, x + dx, y, 70, c, 0.4); g.strokeStyle = c; g.lineWidth = 3; g.lineCap = 'round';
          for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; g.beginPath(); g.moveTo(x + dx + Math.cos(a) * 14, y + Math.sin(a) * 14); g.lineTo(x + dx + Math.cos(a) * 46, y + Math.sin(a) * 46); g.stroke(); }
        }));
        wrap(dx => { glow(g, 760 + dx, 170, 80, '#ffe9a8', 0.3); g.fillStyle = '#fff2b8'; g.beginPath(); g.arc(760 + dx, 170, 36, 0, TAU); g.fill(); });
        peak(g, 100, 300, 190, h, '#3a2a80', null); peak(g, 480, 340, 210, h, '#33247a', null);
      }) },
      { f: MID, c: mk(200, (g, w, h, r) => {
        wrap(dx => {
          g.strokeStyle = '#ff4fd0'; g.lineWidth = 3; g.beginPath();
          for (let x = 520; x <= 900; x += 6) { const y = 100 - 46 * Math.sin((x - 520) / 380 * TAU * 1.5) * (0.6 + 0.4 * Math.sin((x - 520) / 380 * Math.PI)); x === 520 ? g.moveTo(x + dx, y) : g.lineTo(x + dx, y); }
          g.stroke();
          g.strokeStyle = '#2a1560'; g.lineWidth = 3; for (let x = 540; x < 900; x += 40) { g.beginPath(); g.moveTo(x + dx, 100); g.lineTo(x + dx, h); g.stroke(); }
          const cx = 250 + dx, cy = 92;
          g.strokeStyle = '#3ff0ff'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 58, 0, TAU); g.stroke();
          for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58); g.stroke(); g.fillStyle = i % 2 ? '#ffe24d' : '#ff4fd0'; g.beginPath(); g.arc(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58, 6, 0, TAU); g.fill(); }
          g.strokeStyle = '#2a1560'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 30, h); g.lineTo(cx, cy); g.lineTo(cx + 30, h); g.stroke();
        });
        for (let i = 0; i < 9; i++) {
          const x = (i / 9) * T + 20 + r() * 40, tw = 46 + r() * 20;
          wrap(dx => { g.fillStyle = i % 2 ? '#ff4fd0' : '#3ff0ff'; g.beginPath(); g.moveTo(x + dx - tw / 2, h); g.lineTo(x + dx, h - 46); g.lineTo(x + dx + tw / 2, h); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x + dx - tw / 6, h); g.lineTo(x + dx, h - 46); g.lineTo(x + dx + tw / 6, h); g.fill(); });
        }
      }) },
      { f: NEAR, c: mk(150, (g, w, h, r) => {
        g.fillStyle = '#2f2478'; g.fillRect(0, 122, T, 40);
        for (let i = 0; i < 18; i++) {
          const x = (i / 18) * T + 20 + r() * 20, c = ['#ff4fd0', '#3ff0ff', '#ffe24d'][i % 3];
          wrap(dx => { g.fillStyle = '#e6d0ff'; g.fillRect(x + dx - 2, 90, 4, 50); glow(g, x + dx, 82, 28, c, 0.9); g.fillStyle = c; g.beginPath(); g.arc(x + dx, 82, 13, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(x + dx, 82, 6, 0, TAU * 0.8); g.stroke(); });
        }
      }) }
    ]
  ];

  function peak(g, x, w, top, bottom, body, cap) {
    wrap(dx => {
      const cx = x + dx, d = bottom - top;
      g.fillStyle = body; g.beginPath(); g.moveTo(cx - w / 2, bottom); g.quadraticCurveTo(cx - w * 0.12, top + d * 0.4, cx, top); g.quadraticCurveTo(cx + w * 0.12, top + d * 0.4, cx + w / 2, bottom); g.closePath(); g.fill();
      if (cap) {
        g.fillStyle = cap; g.beginPath(); g.moveTo(cx, top); g.lineTo(cx + w * 0.12, top + d * 0.32); g.lineTo(cx + w * 0.06, top + d * 0.26); g.lineTo(cx, top + d * 0.36); g.lineTo(cx - w * 0.06, top + d * 0.26); g.lineTo(cx - w * 0.12, top + d * 0.32); g.closePath(); g.fill();
      }
    });
  }
  function pineRow(g, base, n, sz, c1, c2, seed, snow) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = (i / n) * T + r() * 30, s = sz * (0.7 + r() * 0.6);
      wrap(dx => {
        g.fillStyle = c1; g.beginPath(); g.moveTo(x + dx - s * 0.5, base); g.lineTo(x + dx + s * 0.5, base); g.lineTo(x + dx, base - s * 1.1); g.fill();
        g.fillStyle = c2; g.beginPath(); g.moveTo(x + dx - s * 0.36, base - s * 0.55); g.lineTo(x + dx + s * 0.36, base - s * 0.55); g.lineTo(x + dx, base - s * 1.5); g.fill();
        if (snow) { g.fillStyle = snow; g.beginPath(); g.moveTo(x + dx, base - s * 1.5); g.lineTo(x + dx + s * 0.16, base - s * 1.12); g.lineTo(x + dx - s * 0.16, base - s * 1.12); g.fill(); }
      });
    }
  }
  function aurora(g, y0, cols) {
    cols.forEach((c, i) => {
      g.fillStyle = c; g.beginPath(); g.moveTo(0, y0 + i * 26);
      for (let x = 0; x <= T; x += 10) g.lineTo(x, y0 + i * 26 + 18 * per(2 + i, x + i * 90) + 10 * per(5, x));
      for (let x = T; x >= 0; x -= 10) g.lineTo(x, y0 + i * 26 + 70 + 14 * per(3 + i, x + 40));
      g.closePath(); g.fill();
    });
  }

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

  return { draw, FACTORS: [FAR, MID, NEAR], warm() { for (let i = 0; i < makers.length; i++) layers(i); } };
})();
