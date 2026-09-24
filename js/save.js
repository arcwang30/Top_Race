'use strict';

const Save = {
  key: 'toprace.v1',
  data: { music: 4, sfx: 4, gyro: false, name: '', course: 0, board: [] },

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    if (!Array.isArray(this.data.board) || this.data.board.length === 0) this.seed();
    this.sort();
  },

  store() {
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  },

  seed() {
    const names = ['PANDA', 'USAGI', 'NEKO', 'KERO', 'TANUKI', 'KITSUNE', 'SAKURA', 'FUJI', 'MOMO', 'KUMA',
      'HANA', 'SORA', 'MIKAN', 'DAIFUKU', 'TAIYAKI', 'ONIGIRI', 'MOCHI', 'PUDDING', 'RAMEN', 'DANGO'];
    this.data.board = names.map((n, i) => ({
      name: n, score: 1800000 - i * 85000, time: 250 + i * 6, clear: i < 8, seed: true
    }));
    this.store();
  },

  sort() {
    this.data.board.sort((a, b) => b.score - a.score);
    this.data.board.length = Math.min(this.data.board.length, 20);
  },

  qualifies(score) {
    const b = this.data.board;
    return b.length < 20 || score > b[b.length - 1].score;
  },

  add(entry) {
    this.data.board.push(entry);
    this.sort();
    this.data.name = entry.name;
    this.store();
    return this.data.board.indexOf(entry);
  },

  reset() {
    this.data.board = [];
    this.seed();
    this.sort();
  }
};

Save.load();
