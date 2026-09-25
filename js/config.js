'use strict';

const W = 540, H = 960, TAU = Math.PI * 2;
const FONT = '"Zen Maru Gothic","Noto Sans TC","Yu Gothic","Meiryo","Microsoft JhengHei","PingFang TC","Hiragino Maru Gothic ProN",sans-serif';
const QS = new URLSearchParams(location.search);
const FAST = QS.has('fast');

const CFG = {
  segLen: 200,
  roadHalf: 1150,
  rumble: 3,
  lanes: 4,
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
  centrifugal: 0.32,
  // 甩尾偏移(可調):車尾往外滑的加速度 / 上限 / 放開後的衰減,以及出彎時反向甩回的速度與時間
  driftSlideAccel: 0.7, driftSlideMax: 0.45, driftSlideDecay: 2.5, driftRecoverVel: 0.35, driftRecoverTime: 0.4,
  steerRate: 2.2,

  sections: FAST ? [240, 240, 240] : [2000, 2100, 2200],
  startTime: FAST ? 40 : 90,
  bonusTime: FAST ? [30, 30] : [65, 65],
  enemyGap: 170
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
  },
  {
    name: '雪原晴空',
    sky: ['#5fb8ff', '#b8e3ff', '#f2fbff'], fog: '#eaf6ff',
    grass: ['#f7fbff', '#e6f0fb'], road: ['#9aa6bd', '#8f9bb3'],
    rumble: ['#4fc3ff', '#ffffff'], lane: '#ffffff'
  },
  {
    name: '極光黃昏',
    sky: ['#5a4fb0', '#e58fc0', '#ffd0a0'], fog: '#f0c0d8',
    grass: ['#fdeaf3', '#f2d8ea'], road: ['#9a8fb5', '#8e83a9'],
    rumble: ['#ff7ab8', '#ffffff'], lane: '#fff0f8'
  },
  {
    name: '雪夜聖誕',
    sky: ['#0a1440', '#1c2f7a', '#3e6bb0'], fog: '#3a5a98',
    grass: ['#c6d8f5', '#b5c9ea'], road: ['#5a6788', '#505c7c'],
    rumble: ['#ff4d5e', '#4dff9a'], lane: '#e9f3ff'
  },
  {
    name: '棉花糖晴空',
    sky: ['#8fd3ff', '#ffc4ec', '#fff0fa'], fog: '#ffe6f6',
    grass: ['#a8f0cf', '#94e6bd'], road: ['#b9a6e0', '#ad9ad6'],
    rumble: ['#ff7ab8', '#ffffff'], lane: '#ffffff'
  },
  {
    name: '巧克力黃昏',
    sky: ['#ff8f6b', '#ffb98a', '#ffe0b0'], fog: '#ffd2a8',
    grass: ['#c98a5a', '#bb7c4e'], road: ['#8a6a7a', '#7f5f6f'],
    rumble: ['#ffd23f', '#ffffff'], lane: '#fff0d0'
  },
  {
    name: '霓虹樂園夜',
    sky: ['#1b0f4a', '#4a1f7a', '#b04a9a'], fog: '#7a3f9a',
    grass: ['#5a3fa8', '#4f3599'], road: ['#3d3562', '#362f58'],
    rumble: ['#3ff0ff', '#ff4fd0'], lane: '#ffe6ff'
  }
];

// 賽事(每組 3 個賽段:白天 / 黃昏 / 夜晚),各有專屬障礙與音樂
const COURSES = [
  {
    id: 0, name: '櫻花之旅', en: 'SAKURA TOUR', stars: 1, seed: 20260925, hair: 1.0, tunnel: 100, mix: { straight: 9, gentle: 13, medium: 12, bigL: 18, sweep: 16, chicane: 10, trap: 5, crest: 6, esses: 6, hills: 5, tunnel: 3 }, sections: [1600, 2000, 2200], diff: { start: 60, bonus: 74, obs: 0.9, gap: 0.85, spd: 0.97, pen: 0.95 },
    desc: '從春日櫻花道出發,經過夕陽海岸,直奔星夜祭典!',
    themes: [0, 1, 2], obs: ['poop', 'rock'], music: ['c1s1', 'c1s2', 'c1s3'], color: ['#ffb7d5', '#ff8fbd']
  },
  {
    id: 1, name: '雪之國度', en: 'SNOW KINGDOM', stars: 2, seed: 20261111, hair: 1.8, tunnel: 120, mix: { straight: 6, gentle: 8, medium: 12, bigL: 14, sweep: 20, chicane: 10, trap: 10, crest: 5, esses: 4, hills: 4, tunnel: 4 }, diff: { start: 76, bonus: 70, obs: 1.15, gap: 0.72, spd: 1.03, pen: 1, ice: true },
    desc: '晴朗雪原、極光黃昏、聖誕雪夜。路面結冰車身會打滑,小心雪堆與冰塊!',
    themes: [3, 4, 5], obs: ['snowdrift', 'iceBlock'], music: ['c2s1', 'c2s2', 'c2s3'], color: ['#bfe8ff', '#5fb8ff']
  },
  {
    id: 2, name: '糖果樂園', en: 'CANDY LAND', stars: 3, seed: 20270303, hair: 2.6, tunnel: 140, mix: { straight: 4, gentle: 6, medium: 10, bigL: 12, sweep: 8, chicane: 20, trap: 10, crest: 13, esses: 6, hills: 4, tunnel: 5 }, diff: { start: 76, bonus: 70, obs: 1.6, gap: 0.62, spd: 1.1, pen: 1.2 },
    desc: '棉花糖、巧克力到霓虹遊樂園。果凍會彈飛你,口香糖會黏住你!',
    themes: [6, 7, 8], obs: ['jelly', 'gum'], music: ['c3s1', 'c3s2', 'c3s3'], color: ['#ffc4ec', '#ff7ab8']
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

// 可選車輛(外觀不同,性能相同)
const VEHICLES = [
  { id: 0, name: '熊貓賽車', en: 'PANDA BUGGY', desc: '經典的四驅賽車,熊貓最愛的座駕。', color: ['#8ee8ff', '#3ea8ff'] },
  { id: 1, name: '熊貓坦克', en: 'PANDA TANK', desc: '威風的履帶戰車,熊貓從砲塔探出頭來衝刺!', color: ['#b6f08a', '#5aa84a'] },
  { id: 2, name: '熊貓掌機車', en: 'PANDA HANDHELD', desc: '復古掌上型遊戲機變身的賽車,螢幕上還有像素跑道!', color: ['#ffe680', '#ffb02e'] },
  { id: 3, name: '小飛翼火龍車', en: 'MINI DRAGON WING', desc: '紅色小火龍變身的四輪車,展開小翅膀,噴著火焰全速衝刺!', color: ['#ff8a7a', '#ff3b30'] },
  { id: 4, name: 'ACE86', en: 'PANDA HACHIROKU', desc: '黑白配色的傳奇跑車,車尾是藤原とう乳店的招牌!飛彈是熱騰騰的豆花!', color: ['#f6f7fb', '#8a90a8'] }
];

// 視角(1 = 預設、2 = 壓低在熊貓背後、3 = 介於兩者之間)。地面上玩家車位置與賽道寬度固定,只改鏡頭高度 / 距離 / 地平線
function mkView(camH, zD, hor, car) {
  const roadPx = 287, yPlayer = 850;
  return { camH, zD, hor, car, XS: roadPx * zD / (CFG.roadHalf * CFG.camDepth), YS: (yPlayer - hor) * zD / (camH * CFG.camDepth) };
}
const VIEWS = [
  mkView(1000, 1000 * CFG.camDepth, 390, 0.68),
  mkView(450, 560, 460, 0.76),
  mkView(730, 700, 425, 0.71),
  mkView(190, 420, 640, 0.80)
];
