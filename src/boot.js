// Boot sequence: colour bars and ident, a film-leader countdown, then cut to the show.
// Plays once per browser session; skipped entirely for reduced-motion users.

export function runBoot({ reduced, onDone }) {
  const body = document.body;
  const boot = document.getElementById('boot');
  let seen = false;
  try { seen = sessionStorage.getItem('onair-booted') === '1'; } catch (e) { /* storage blocked */ }

  if (reduced || seen) {
    onDone({ skipped: true });
    return;
  }

  body.classList.add('booting');
  const leader = boot.querySelector('.leader');
  const num = boot.querySelector('.leader-num');
  const canvas = document.getElementById('leader-canvas');
  const ctx = canvas.getContext('2d');
  const timers = [];
  let raf = 0;
  let finished = false;
  let leaderStart = 0;
  const LEADER_SECS = 3;
  const SEC_MS = 560; // each leader "second" runs a little fast so the intro stays short

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawLeader(now) {
    const w = innerWidth, h = innerHeight;
    const elapsed = now - leaderStart;
    const n = Math.max(1, LEADER_SECS - Math.floor(elapsed / SEC_MS));
    const frac = (elapsed % SEC_MS) / SEC_MS;
    if (num.textContent !== String(n)) num.textContent = String(n);

    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const r = Math.hypot(w, h);
    // sweep wedge
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    // crosshair and rings
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.stroke();
    const base = Math.min(w, h);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#d0d0d0';
    ctx.beginPath(); ctx.arc(cx, cy, base * 0.32, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, base * 0.38, 0, Math.PI * 2); ctx.stroke();
    // film gate frame lines
    ctx.strokeStyle = '#3a3a3a';
    ctx.strokeRect(base * 0.06, base * 0.06, w - base * 0.12, h - base * 0.12);

    if (elapsed < LEADER_SECS * SEC_MS) raf = requestAnimationFrame(drawLeader);
  }

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    cancelAnimationFrame(raf);
    removeEventListener('resize', resize);
    removeEventListener('keydown', onKey);
    try { sessionStorage.setItem('onair-booted', '1'); } catch (e) { /* ignore */ }
    // hard cut to black, then hand over to the show
    boot.style.background = '#000';
    boot.querySelector('.bars').style.display = 'none';
    leader.classList.remove('on');
    setTimeout(() => {
      body.classList.remove('booting');
      onDone({ skipped: false });
    }, 160);
  }

  function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); }

  boot.querySelector('.boot-skip').addEventListener('click', finish);
  boot.addEventListener('click', finish);
  addEventListener('keydown', onKey);
  addEventListener('resize', resize);

  // 1) bars and ident
  timers.push(setTimeout(() => {
    // 2) leader countdown
    boot.querySelector('.bars').style.display = 'none';
    resize();
    leader.classList.add('on');
    leaderStart = performance.now();
    raf = requestAnimationFrame(drawLeader);
  }, 900));
  // 3) black, then on air
  timers.push(setTimeout(finish, 900 + LEADER_SECS * SEC_MS + 120));
}
