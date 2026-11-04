// The hero multiviewer: tiles are camera sources, PVW is the next shot, PGM is on air.
// Visitors pick a camera and cut it to air; when they're idle, an auto-director takes over.

import { cams, sequence } from './data.js';

export function createMultiviewer({ reduced, onCut }) {
  const pgmMedia = document.getElementById('pgm-media');
  const pvwMedia = document.getElementById('pvw-media');
  const pgmSrc = document.getElementById('pgm-src');
  const pvwSrc = document.getElementById('pvw-src');
  const tilesEl = document.getElementById('tiles');
  const superEl = document.querySelector('.super');
  const btnCut = document.getElementById('btn-cut');
  const btnAuto = document.getElementById('btn-auto');
  const pvwWin = document.getElementById('pvw');
  const meters = [...document.querySelectorAll('.win-meters i')];

  let pgm = 0;
  let pvw = 1;
  let busy = false;
  let lastUser = -Infinity;
  let visible = true;
  let started = false;

  // Build tiles
  const tiles = cams.map((cam, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile';
    b.style.backgroundImage = `url(${cam.sm})`;
    b.dataset.cursor = 'PVW';
    b.setAttribute('aria-label', `Camera ${cam.id}, ${cam.label.toLowerCase()}`);
    b.innerHTML = `<span class="tile-label">CAM ${cam.id} ${cam.label}</span>`;
    b.addEventListener('click', () => {
      lastUser = performance.now();
      if (i === pgm) return;
      if (i === pvw) cut();
      else setPreview(i);
    });
    tilesEl.appendChild(b);
    return b;
  });

  // preload large images
  cams.forEach((c) => { const im = new Image(); im.src = c.src; });

  function layer(src, kb = true) {
    const d = document.createElement('div');
    d.className = 'layer' + (kb && !reduced ? ' kb' : '');
    d.style.backgroundImage = `url(${src})`;
    // desync Ken Burns so cuts never look like they restart the same move
    d.style.animationDelay = `${-Math.random() * 14}s`;
    return d;
  }

  function show(media, i, mode = 'cut') {
    const next = layer(cams[i].src, media === pgmMedia);
    const prev = [...media.children];
    if (mode === 'mix' && !reduced) {
      next.style.opacity = '0';
      next.style.transition = 'opacity .7s linear';
      media.appendChild(next);
      requestAnimationFrame(() => { requestAnimationFrame(() => { next.style.opacity = '1'; }); });
      setTimeout(() => prev.forEach((p) => p.remove()), 760);
    } else {
      media.appendChild(next);
      prev.forEach((p) => p.remove());
    }
  }

  function label(i) { return `CAM ${cams[i].id} ${cams[i].label}`; }

  function paint() {
    tiles.forEach((t, i) => {
      t.classList.toggle('is-pgm', i === pgm);
      t.classList.toggle('is-pvw', i === pvw);
      t.dataset.cursor = i === pvw ? 'CUT' : i === pgm ? 'ON AIR' : 'PVW';
      t.setAttribute('aria-pressed', i === pvw ? 'true' : 'false');
    });
    pgmSrc.textContent = label(pgm);
    pvwSrc.textContent = label(pvw);
  }

  function setPreview(i) {
    pvw = i;
    show(pvwMedia, pvw);
    paint();
  }

  function glitch() {
    if (reduced) return;
    superEl.classList.add('glitch');
    setTimeout(() => superEl.classList.remove('glitch'), 160);
  }

  function press(btn) {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 160);
  }

  function cut() {
    if (busy) return;
    press(btnCut);
    const old = pgm;
    pgm = pvw;
    pvw = old;
    show(pgmMedia, pgm, 'cut');
    show(pvwMedia, pvw);
    glitch();
    paint();
    onCut && onCut('cut');
  }

  function auto() {
    if (busy) return;
    busy = true;
    press(btnAuto);
    const old = pgm;
    pgm = pvw;
    pvw = old;
    show(pgmMedia, pgm, 'mix');
    setTimeout(() => {
      show(pvwMedia, pvw);
      paint();
      busy = false;
    }, reduced ? 0 : 720);
    paint();
    onCut && onCut('mix');
  }

  btnCut.addEventListener('click', () => { lastUser = performance.now(); cut(); });
  btnAuto.addEventListener('click', () => { lastUser = performance.now(); auto(); });
  pvwWin.addEventListener('click', () => { lastUser = performance.now(); cut(); });
  pvwWin.dataset.cursor = 'CUT';

  // Auto-director: when nobody is touching the desk, it calls the show in the planned sequence.
  // Preview the next shot, hold, then take it (mostly cuts, the odd mix), like calling a song.
  let step = 0;
  let seqPos = 0;
  function nextInSequence() {
    for (let k = 0; k < sequence.length; k++) {
      seqPos = (seqPos + 1) % sequence.length;
      const n = sequence[seqPos];
      if (n !== pgm) return n;
    }
    return (pgm + 1) % cams.length;
  }
  function director() {
    if (!started || reduced) return;
    const idle = performance.now() - lastUser > 9000;
    if (idle && visible && !document.hidden) {
      step++;
      if (step % 2 === 1) {
        const n = nextInSequence();
        if (n !== pvw) setPreview(n);
      } else {
        seqPos % 4 === 3 ? auto() : cut();
      }
    }
  }
  setInterval(director, 1700);

  // Audio meters bounce while the hero is visible
  const levels = meters.map(() => 0.4);
  function meterLoop() {
    if (visible && !document.hidden) {
      meters.forEach((m, i) => {
        const target = 0.35 + Math.random() * 0.6;
        levels[i] += (target - levels[i]) * 0.35;
        m.style.setProperty('--m', `${(1 - levels[i]) * 100}%`);
      });
    }
    setTimeout(() => requestAnimationFrame(meterLoop), 70);
  }
  if (!reduced) meterLoop();

  // init
  show(pgmMedia, pgm);
  show(pvwMedia, pvw);
  paint();

  return {
    cut, auto,
    start() { started = true; },
    setVisible(v) { visible = v; },
    isActive() { return visible; },
    tiles,
  };
}
