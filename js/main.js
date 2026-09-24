'use strict';

(function () {
  const canvas = document.getElementById('game');
  const g = canvas.getContext('2d');
  const stage = document.getElementById('stage');
  const nameInput = document.getElementById('nameInput');
  let res = 1;

  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const scale = Math.min(vw / W, vh / H);
    canvas.style.width = Math.floor(W * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
    res = clamp(scale * (window.devicePixelRatio || 1), 0.75, 2);
    canvas.width = Math.round(W * res);
    canvas.height = Math.round(H * res);
    nameInput.style.fontSize = Math.round(30 * scale) + 'px';
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  resize();

  Online.init();
  Input.init(canvas);
  Spr.warm();
  BG.warm();

  const pauseGame = () => { if (App.name === 'game') Screens.game.pause(); };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pauseGame(); Sound.suspend(); } else Sound.resume();
  });
  window.addEventListener('blur', pauseGame);

  App.start('title');

  const rotate = document.getElementById('rotate');
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  window.tryLockPortrait = () => {
    if (!coarse || !document.documentElement.requestFullscreen) return;
    document.documentElement.requestFullscreen().then(() => {
      if (screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait').catch(() => {});
    }).catch(() => {});
  };

  let last = performance.now();
  function loop(now) {
    const landscape = coarse && window.innerWidth > window.innerHeight * 1.1;
    if (landscape) { rotate.textContent = tr('請將手機直立握持'); rotate.style.display = 'flex'; pauseGame(); }
    else if (rotate.style.display !== 'none') rotate.style.display = 'none';
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    g.setTransform(res, 0, 0, res, 0, 0);
    Input.update();
    App.frame(g, dt);
    Input.endFrame();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.__game = { Game, App, Screens, Input, Save, Sound };
})();
