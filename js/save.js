'use strict';

const Save = {
  key: 'toprace.v1',
  data: { music: 4, sfx: 4, gyro: false, autoGas: false, lang: null, name: '', course: 0, vehicle: 0, boards: null },

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    const d = this.data;
    if (!Array.isArray(d.boards)) {
      d.boards = [[], [], []];
      if (Array.isArray(d.board) && d.board.length) d.boards[0] = d.board;
    }
    delete d.board;
    for (let c = 0; c < 3; c++) {
      if (!Array.isArray(d.boards[c]) || d.boards[c].length === 0) this.seed(c);
      this.sort(c);
    }
    if (!d.lang) {
      const l = (navigator.language || 'zh').toLowerCase();
      d.lang = l.startsWith('ja') ? 'ja' : l.startsWith('zh') ? 'zh' : 'en';
    }
  },

  store() {
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  },

  seed(c) {
    const sets = [
      ['PANDA', 'USAGI', 'NEKO', 'KERO', 'TANUKI', 'KITSUNE', 'SAKURA', 'FUJI', 'MOMO', 'KUMA', 'HANA', 'SORA', 'MIKAN', 'DAIFUKU', 'TAIYAKI', 'ONIGIRI', 'MOCHI', 'PUDDING', 'RAMEN', 'DANGO'],
      ['YUKI', 'SNOWY', 'PENGUIN', 'AURORA', 'MOFU', 'KOORI', 'NOEL', 'FROST', 'IGLOO', 'SHIRO', 'MIZORE', 'KAMAKURA', 'TONAKAI', 'ICEBEAR', 'HOTCOCOA', 'MUFFLER', 'MITTEN', 'SLEIGH', 'COCOA', 'SNOWMAN'],
      ['CANDY', 'GUMMY', 'JELLY', 'COOKIE', 'CHOCO', 'MARSH', 'SUGAR', 'CUPCAKE', 'DONUT', 'MACARON', 'TOFFEE', 'CARAMEL', 'LOLLI', 'SPRINKLE', 'WAFFLE', 'BONBON', 'FUDGE', 'PRALINE', 'GUMDROP', 'SWEETIE']
    ];
    this.data.boards[c] = sets[c].map((n, i) => ({
      name: n, score: 1700000 - i * 80000, time: 200 + i * 6, clear: i < 8, seed: true
    }));
    this.store();
  },

  board(c) { return this.data.boards[c || 0]; },

  sort(c) {
    const b = this.data.boards[c];
    b.sort((x, y) => y.score - x.score);
    b.length = Math.min(b.length, 20);
  },

  qualifies(score, c) {
    const b = this.board(c);
    return b.length < 20 || score > b[b.length - 1].score;
  },

  add(entry, c) {
    this.board(c).push(entry);
    this.sort(c);
    this.data.name = entry.name;
    this.store();
    return this.board(c).indexOf(entry);
  }
};

Save.load();
