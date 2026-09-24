'use strict';

// 線上排行榜(Firebase Firestore)。每個賽事一個集合:leaderboard_0 / _1 / _2
const Online = {
  enabled: false,
  db: null,
  cache: {},

  init() {
    try {
      if (typeof firebase === 'undefined' || typeof FIREBASE_CONFIG === 'undefined' || !FIREBASE_CONFIG.apiKey) return;
      firebase.initializeApp(FIREBASE_CONFIG);
      this.db = firebase.firestore();
      this.enabled = true;
    } catch (e) { console.warn('Firebase init failed', e); }
  },

  col(c) { return this.db.collection('leaderboard_' + c); },

  async top(c) {
    const snap = await this.col(c).orderBy('score', 'desc').limit(20).get();
    const list = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
    this.cache[c] = list;
    return list;
  },

  qualifies(score, c) {
    const l = this.cache[c];
    return score > 0 && (!l || l.length < 20 || score > l[l.length - 1].score);
  },

  async submit(entry, c) {
    const ref = await this.col(c).add({
      name: String(entry.name).slice(0, 8), score: Math.floor(entry.score), time: Math.round(entry.time),
      clear: !!entry.clear, ts: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  }
};
