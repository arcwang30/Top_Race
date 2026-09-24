'use strict';

const W = 540, H = 960, TAU = Math.PI * 2;
const FONT = '"Zen Maru Gothic","Noto Sans TC","Microsoft JhengHei","PingFang TC","Hiragino Maru Gothic ProN",sans-serif';
const QS = new URLSearchParams(location.search);
const FAST = QS.has('fast');

const CFG = {
  segLen: 200,
  roadHalf: 1000,
  rumble: 3,
  lanes: 3,
  drawDist: 220,
  camH: 1000,
  camDepth: 1 / Math.tan(50 * Math.PI / 180),
  XS: 250,
  YS: 460,
  horizon: 390,

  maxSpeed: 9000,
  normalMax: 0.8,
  accel: 0.17,
  brake: 0.65,
  coast: 0.06,
  offroadDecel: 0.45,
  offroadLimit: 0.2,
  nitroTime: 2.6,
  nitroAccel: 0.7,
  nitroMax: 5,
  centrifugal: 0.3,
  steerRate: 2.2,

  sections: FAST ? [240, 240, 240] : [3400, 3600, 3800],
  startTime: FAST ? 40 : 150,
  bonusTime: FAST ? [30, 30] : [110, 110],
  enemyGap: 95
};
CFG.playerZ = CFG.camH * CFG.camDepth;

const SCORE = {
  perSeg: 130, coin: 1000, cp: 100000, timeBonus: 5000,
  clear: 500000, drift: 500, bottleFull: 2000, max: 9999999
};

const THEMES = [
  {
    name: '春日櫻花道',
    sky: ['#4fbaff', '#9fe0ff', '#fff1d0'], fog: '#e6f6ff',
    grass: ['#8ee05a', '#7fd24c'], road: ['#8b93a8', '#7f879c'],
    rumble: ['#ff5c7a', '#ffffff'], lane: '#ffffff'
  },
  {
    name: '夕陽海岸',
    sky: ['#ff7fa8', '#ffb36b', '#ffe9a8'], fog: '#ffd9b0',
    grass: ['#f0d27a', '#e6c66a'], road: ['#9a8fa8', '#8e8399'],
    rumble: ['#ff7a3d', '#fff2d0'], lane: '#fff7e0'
  },
  {
    name: '星夜祭典',
    sky: ['#161a55', '#3c2a7a', '#9a55a8'], fog: '#5a3f8f',
    grass: ['#2f9c8a', '#298f7e'], road: ['#565c7c', '#4d5372'],
    rumble: ['#ff4fa3', '#ffe24d'], lane: '#ffe9ff'
  }
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIn = (a, b, t) => a + (b - a) * t * t;
const easeInOut = (a, b, t) => a + (b - a) * (-Math.cos(t * Math.PI) / 2 + 0.5);
const pad = (n, len) => String(Math.max(0, Math.floor(n))).padStart(len, '0');

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m + "'" + pad(s, 2) + '"';
}
