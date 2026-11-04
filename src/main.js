import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { person, crafts, formats, wall, work, gear } from './data.js';
import { runBoot } from './boot.js';
import { createMultiviewer } from './multiviewer.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const desktop = matchMedia('(min-width: 900px)');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- Content ---------------- */

// Craft rundown: how a show runs
$('#craft-list').innerHTML = crafts.map((c) => `
  <li class="craft-item">
    <span class="craft-tag">${c.when}</span>
    <h3 class="craft-title">${c.title}</h3>
    <p class="craft-body">${c.body}</p>
  </li>`).join('');
$('#formats').innerHTML = formats.map((f) => `<li>${f}</li>`).join('');

// Work feeds
$('#feeds').innerHTML = work.map((w, i) => {
  const visual = w.strip
    ? `<div class="feed-strip">${w.strip.map((s) => `<span style="background-image:url(${s})"></span>`).join('')}</div>`
    : `<div class="feed-media" style="background-image:url(${w.img})"></div>`;
  return `
  <article class="feed${i === 0 ? ' is-on' : ''}" data-i="${i}" aria-label="${w.title}">
    <div class="feed-visual">${visual}<div class="feed-shade"></div>
      <span class="win-tag pgm-tag feed-tag"><i class="lamp"></i>FEED ${i + 1}</span>
    </div>
    <div class="feed-info">
      <div class="feed-lt">
        <span class="lt-slash"></span>
        <span class="feed-years">${w.years}</span>
        <h3 class="feed-title">${w.title}</h3>
        <span class="feed-role">${w.role}</span>
      </div>
      <div>
        <p class="feed-detail">${w.detail}</p>
        <ul class="feed-specs">${w.specs.map((s) => `<li>${s}</li>`).join('')}</ul>
      </div>
    </div>
  </article>`;
}).join('');

$('#feed-sources').innerHTML = work.map((w, i) => `
  <button type="button" class="feed-src${i === 0 ? ' is-pgm' : ''}" data-i="${i}" data-cursor="TAKE"
    style="background-image:url(${w.img || w.strip[2]})" aria-label="Show ${w.title}">
    <span>${i + 1} ${w.title}</span>
  </button>`).join('');

// LED wall: each list scrolls as one row, alternating direction
const ledRows = wall.filter((r) => r.items.length);
$('#led').innerHTML = ledRows.map((r, i) => {
  const run = r.items.map((n) => `<span>${n}</span><i aria-hidden="true"></i>`).join('');
  const secs = Math.max(18, r.items.join('').length * 0.55);
  return `<div class="led-row" data-row="${i % 3}">
    <span class="led-label">${r.label}</span>
    <div class="led-track" style="--dur:${secs}s;--dir:${i % 2 ? 'reverse' : 'normal'}">
      <div class="led-run">${run}</div><div class="led-run" aria-hidden="true">${run}</div>
    </div>
  </div>`;
}).join('');

// Gear rack
$('#rack').innerHTML = gear.map((g) => {
  const has = g.items.length > 0;
  return `
  <div class="ru ${has ? 'on' : 'wait'}">
    <span class="ru-led"></span>
    <span class="ru-name">${g.unit}</span>
    ${has ? `<ul class="ru-items">${g.items.map((it) => `<li>${it}</li>`).join('')}</ul>` : '<span class="ru-empty">Patch list coming soon</span>'}
    <span class="ru-vent"></span>
  </div>`;
}).join('');

// Contact
const mail = $('#mail-link');
mail.href = `mailto:${person.email}?subject=${encodeURIComponent('Show enquiry')}`;
$('#mail-text').textContent = person.email;
$('#wa-link').href = person.whatsapp;
$('#li-link').href = person.linkedin;
$('#phone-text').textContent = person.phone;
const alt = $('#mail-alt');
alt.href = `mailto:${person.emailAlt}`;
alt.textContent = person.emailAlt;

/* ---------------- Smooth scroll ---------------- */

let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.1 });
  else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}
function scrollToEl(el) {
  scrollToY(el.getBoundingClientRect().top + window.scrollY);
}

/* ---------------- Timecode (25 fps, PAL) ---------------- */

const tcEl = $('#tc');
const tcStart = performance.now();
const pad = (n) => String(n).padStart(2, '0');
function tick() {
  const f = Math.floor(((performance.now() - tcStart) / 1000) * 25);
  const ff = f % 25, s = Math.floor(f / 25);
  tcEl.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(ff)}`;
  requestAnimationFrame(tick);
}
tick();

/* ---------------- Beams (loaded lazily, desktop gets more) ---------------- */

let beams = { setLevel() {}, cue() {} };
let currentLevel = 1;
if (!reduced) {
  const load = () => import('./beams.js').then(({ createBeams }) => {
    beams = createBeams($('#beams'), { mobile: !desktop.matches });
    beams.setLevel(currentLevel);
  });
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1500 });
  else setTimeout(load, 600);
}

/* ---------------- Cut effect ---------------- */

const cutFx = $('#cut-fx');
function cutFlash() {
  if (reduced) return;
  cutFx.classList.remove('flash');
  void cutFx.offsetWidth;
  cutFx.classList.add('flash');
}

/* ---------------- Multiviewer ---------------- */

const mv = createMultiviewer({
  reduced,
  onCut: (kind) => beams.cue(kind),
});

/* ---------------- Beat ---------------- */


/* ---------------- Sections, T-bar, header ---------------- */

const sections = $$('main > .sec');
const levels = { live: 0.9, about: 0.45, craft: 0.55, work: 0.5, wall: 0.6, gear: 0.4, offair: 0.2 };
const busList = $('.tbar-buses');
const rundownList = $('#rundown ol');
sections.forEach((s, i) => {
  const li = document.createElement('li');
  li.innerHTML = `<button type="button" data-i="${i}" aria-label="${s.dataset.name}">${i + 1}<span class="tip">${s.dataset.name}</span></button>`;
  busList.appendChild(li);
  const r = document.createElement('li');
  r.innerHTML = `<a href="#${s.id}" data-i="${i}"><span>${pad(i + 1)}</span>${s.dataset.name}</a>`;
  rundownList.appendChild(r);
});
const buses = $$('button', busList);
buses.forEach((b) => b.addEventListener('click', () => scrollToEl(sections[Number(b.dataset.i)])));

const tally = $('#tally');
const tallyText = $('.tally-text', tally);
const barSrc = $('#bar-src');
let active = -1;
function setActive(i) {
  if (i === active) return;
  const first = active === -1;
  active = i;
  const s = sections[i];
  buses.forEach((b, j) => {
    b.classList.toggle('is-pgm', j === i);
    b.classList.toggle('is-pvw', j === i + 1);
  });
  $$('a', rundownList).forEach((a, j) => a.setAttribute('aria-current', j === i ? 'true' : 'false'));
  barSrc.textContent = s.dataset.src;
  currentLevel = levels[s.id] ?? 0.5;
  beams.setLevel(currentLevel);
  const offAir = s.id === 'offair';
  if (document.body.dataset.live === '1') {
    tally.classList.toggle('on', !offAir);
    tally.classList.toggle('off', offAir);
    tallyText.textContent = offAir ? 'OFF AIR' : 'ON AIR';
  }
  mv.setVisible(s.id === 'live');
  if (!first && s.id !== 'live') beams.cue('mix');
}

sections.forEach((s, i) => {
  ScrollTrigger.create({
    trigger: s,
    start: 'top 55%',
    end: 'bottom 55%',
    onToggle: (self) => { if (self.isActive) setActive(i); },
  });
});

// T-bar handle and header progress follow the whole show
const handle = $('.tbar-handle');
const track = $('.tbar-track');
const prog = $('#bar-progress');
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => {
    const p = self.progress;
    handle.style.transform = `translateY(${p * track.clientHeight}px)`;
    prog.style.transform = `scaleX(${p})`;
  },
});

// Keyboard: 1–8 jump to sections, C cuts, A auto-transitions
addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || document.body.classList.contains('booting')) return;
  const n = Number(e.key);
  if (n >= 1 && n <= sections.length) { scrollToEl(sections[n - 1]); return; }
  if (sections[active] && sections[active].id === 'live') {
    if (e.key === 'c' || e.key === 'C') mv.cut();
    if (e.key === 'a' || e.key === 'A') mv.auto();
  }
});

// Mobile rundown menu
const menuBtn = $('#menu-btn');
const rundown = $('#rundown');
function setMenu(open) {
  rundown.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Rundown';
  if (lenis) open ? lenis.stop() : lenis.start();
}
menuBtn.addEventListener('click', () => setMenu(rundown.hidden));
rundown.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  e.preventDefault();
  setMenu(false);
  scrollToEl(sections[Number(a.dataset.i)]);
});

// In-page anchors go through the smooth scroller
$$('a[href^="#"]').forEach((a) => {
  if (a.closest('#rundown') || a.classList.contains('skip-link')) return;
  a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    scrollToEl(t);
  });
});

/* ---------------- About ---------------- */

$$('.count').forEach((el) => {
  const to = Number(el.dataset.to);
  if (reduced) { el.textContent = String(to); return; }
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.4, ease: 'power3.out', onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
    },
  });
});

// Viewfinder record timer
const vfTime = $('#vf-time');
let vfStart = 0, vfOn = false;
ScrollTrigger.create({
  trigger: '.viewfinder',
  start: 'top bottom',
  end: 'bottom top',
  onToggle: (self) => { vfOn = self.isActive; if (vfOn) vfStart = performance.now(); },
});
setInterval(() => {
  if (!vfOn) return;
  const s = Math.floor((performance.now() - vfStart) / 1000);
  vfTime.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}, 250);

if (!reduced) {
  // Focus box hunts then locks, like autofocus
  gsap.timeline({ scrollTrigger: { trigger: '.viewfinder', start: 'top 70%' } })
    .fromTo('.vf-focus', { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' })
    .to('.vf-focus', { x: '-=6', duration: 0.08, repeat: 3, yoyo: true })
    .to('.vf-focus', { borderColor: '#ff1e1e', duration: 0.05 })
    .to('.vf-focus', { borderColor: '#22e07a', duration: 0.05, delay: 0.15 });
}

/* ---------------- Craft rundown goes live as it crosses centre ---------------- */

$$('.craft-item').forEach((el) => {
  ScrollTrigger.create({ trigger: el, start: 'top 50%', end: 'bottom 50%', toggleClass: 'is-live' });
});

/* ---------------- Work feeds ---------------- */

const feeds = $$('.feed');
const feedSrcs = $$('.feed-src');
const workCount = $('#work-count');
let feedIdx = 0;
let workST = null;

function showFeed(i, fx = true) {
  if (i === feedIdx) return;
  feeds[feedIdx].classList.remove('is-on');
  feeds[i].classList.add('is-on');
  feedSrcs.forEach((b, j) => b.classList.toggle('is-pgm', j === i));
  workCount.textContent = `FEED ${i + 1} / ${feeds.length}`;
  feedIdx = i;
  if (fx && !reduced) {
    beams.cue('cut');
    const f = feeds[i];
    gsap.fromTo($('.feed-visual', f), { scale: 1.06 }, { scale: 1, duration: 0.9, ease: 'power3.out' });
    gsap.fromTo($$('.feed-years, .feed-title, .feed-role, .feed-detail, .feed-specs', f),
      { yPercent: 40, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' });
    gsap.fromTo($('.lt-slash', f), { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: 'power2.out' });
  }
}

const mm = gsap.matchMedia();
mm.add('(min-width: 900px)', () => {
  workST = ScrollTrigger.create({
    trigger: '#work',
    start: 'top top',
    end: () => `+=${(feeds.length - 1) * innerHeight * 0.85}`,
    pin: '.work-pin',
    anticipatePin: 1,
    refreshPriority: 1,
    onUpdate: (self) => {
      const i = Math.min(feeds.length - 1, Math.floor(self.progress * feeds.length * 0.9999));
      showFeed(i);
    },
  });
  return () => {
    workST = null;
    feeds.forEach((f, j) => f.classList.toggle('is-on', j === feedIdx));
  };
});

feedSrcs.forEach((b) => b.addEventListener('click', () => {
  const i = Number(b.dataset.i);
  if (!workST) return;
  const y = workST.start + ((i + 0.5) / feeds.length) * (workST.end - workST.start);
  scrollToY(y);
}));


/* ---------------- Credits roll ---------------- */

if (!reduced) {
  const roll = $('.credits-roll');
  const credits = $('#credits');
  gsap.to(roll, {
    y: () => -(roll.scrollHeight - credits.clientHeight),
    ease: 'none',
    scrollTrigger: { trigger: '#offair', start: 'top 85%', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
  });
} else {
  $('.credits-roll').style.padding = '0';
  $('#credits').style.height = 'auto';
}

/* ---------------- Cursor ---------------- */

if (finePointer && !reduced) {
  document.documentElement.classList.add('has-cursor');
  const cur = $('#cursor');
  const lbl = $('.cursor-label', cur);
  const xTo = gsap.quickTo(cur, 'x', { duration: 0.18, ease: 'power3' });
  const yTo = gsap.quickTo(cur, 'y', { duration: 0.18, ease: 'power3' });
  cur.style.opacity = '0';
  addEventListener('pointermove', (e) => {
    cur.style.opacity = '1';
    xTo(e.clientX); yTo(e.clientY);
    const hot = e.target.closest('a, button, label, input, [data-cursor]');
    cur.classList.toggle('hot', !!hot);
    const c = hot && hot.closest('[data-cursor]');
    cur.classList.toggle('labelled', !!c);
    if (c) lbl.textContent = c.dataset.cursor;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { cur.style.opacity = '0'; });
  document.addEventListener('pointerenter', () => { cur.style.opacity = '1'; });
}

/* ---------------- Boot, then go live ---------------- */

function goLive({ skipped }) {
  document.body.dataset.live = '1';
  tally.classList.add('on');
  tallyText.textContent = 'ON AIR';
  mv.start();
  ScrollTrigger.refresh();
  if (reduced) return;
  beams.cue('cut');
  // One orchestrated entrance: sources acquire signal, the name slams in, the lower third wipes on
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.mv-pgm, .mv-pvw', { opacity: 0, duration: 0.25, stagger: 0.08, ease: 'steps(3)' }, 0)
    .from('.tile', { opacity: 0, duration: 0.2, stagger: { each: 0.04, from: 'random' }, ease: 'steps(3)' }, 0.1)
    .from('.super-line', { yPercent: 100, opacity: 0, duration: skipped ? 0.6 : 0.8, stagger: 0.08 }, 0.15)
    .add(() => { const s = $('.super'); s.classList.add('glitch'); setTimeout(() => s.classList.remove('glitch'), 200); }, 0.35)
    .from('.lt-slash', { scaleY: 0, duration: 0.3 }, 0.5)
    .from('.lt-role, .lt-sub', { xPercent: -8, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.55)
    .from('.mv-controls, .scroll-cue', { opacity: 0, duration: 0.4 }, 0.7);
}

runBoot({ reduced, onDone: goLive });

addEventListener('load', () => ScrollTrigger.refresh());
