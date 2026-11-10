import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './notfound.css';

// 404 "Signal lost": colour bars + slate drawn to an offscreen canvas,
// then pushed through a WebGL CRT shader (curvature, scanlines, RGB mask, tearing).
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FPS = 25; // PAL timecode
const t0 = performance.now();

/* ---------- Off-screen 2D source: colour bars + slate ---------- */
const W = 960, H = 540;
const src = document.createElement('canvas'); src.width = W; src.height = H;
const g = src.getContext('2d');

const bars  = ['#bfbfbf','#bfbf00','#00bfbf','#00bf00','#bf00bf','#bf0000','#0000bf'];
const rev   = ['#0000bf','#131313','#bf00bf','#131313','#00bfbf','#131313','#bfbfbf'];

function tc(ms){
  const f = Math.floor(ms / (1000/FPS));
  const ff = f % FPS, s = Math.floor(f/FPS)%60, m = Math.floor(f/FPS/60)%60, h = Math.floor(f/FPS/3600);
  return [h,m,s,ff].map(n=>String(n).padStart(2,'0')).join(':');
}

function drawSource(ms){
  const bw = W/7;
  bars.forEach((c,i)=>{ g.fillStyle=c; g.fillRect(Math.round(i*bw),0,Math.ceil(bw),H*.67); });
  rev.forEach((c,i)=>{ g.fillStyle=c; g.fillRect(Math.round(i*bw),H*.67,Math.ceil(bw),H*.08); });
  const low = ['#00214c','#ffffff','#32006a','#131313','#090909','#131313','#1d1d1d','#131313'];
  const lw = [1.25,1.25,1.25,1.25,1/3,1/3,1/3,1].map(x=>x*bw);
  let x=0; low.forEach((c,i)=>{ g.fillStyle=c; g.fillRect(Math.round(x),H*.75,Math.ceil(lw[i]),H*.25); x+=lw[i]; });

  // centre slate
  const bxW = 520, bxH = 250, bx = (W-bxW)/2, by = (H-bxH)/2 - 20;
  g.fillStyle = '#050505'; g.fillRect(bx,by,bxW,bxH);
  g.strokeStyle = '#ff1e1e'; g.lineWidth = 4; g.strokeRect(bx+2,by+2,bxW-4,bxH-4);

  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#f2f2f2';
  g.font = '700 150px "JetBrains Mono", monospace';
  g.fillText('404', W/2, by+108);

  const on = Math.floor(ms/600)%2===0;
  g.font = '700 26px "JetBrains Mono", monospace';
  g.fillStyle = on ? '#ff1e1e' : '#5a0606';
  g.fillText('● NO SIGNAL', W/2, by+200);

  // burnt-in timecode
  g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(W/2-150, H-74, 300, 44);
  g.fillStyle = '#f2f2f2'; g.font = '500 28px "JetBrains Mono", monospace';
  g.fillText(tc(ms), W/2, H-51);

  // corner source ID
  g.textAlign='left'; g.font='500 20px "JetBrains Mono", monospace';
  g.fillStyle='rgba(0,0,0,.7)'; g.fillRect(24,22,220,36);
  g.fillStyle='#f2f2f2'; g.fillText('SRC  CAM ??', 36, 41);
}

/* ---------- WebGL CRT pass ---------- */
const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl', {antialias:false, premultipliedAlpha:false});

const vs = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;
const fs = `
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D tex;
  uniform float t, glitch, staticAmt;
  uniform vec2 res;
  float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453); }
  vec2 curve(vec2 u){ u = u*2.-1.; vec2 o = abs(u.yx)/vec2(5.5,4.2); u += u*o*o; return u*.5+.5; }
  void main(){
    vec2 c = curve(uv);
    if(c.x<0.||c.x>1.||c.y<0.||c.y>1.){ gl_FragColor = vec4(0.,0.,0.,1.); return; }

    // rolling hum bar
    float roll = fract(t*.11);
    float band = 1. - smoothstep(0., .07, abs(c.y - roll));

    // horizontal line tearing, scaled by glitch
    float line = floor(c.y * 180.);
    float tear = (rand(vec2(line, floor(t*24.))) - .5) * .045 * glitch;
    float block = step(.92, rand(vec2(floor(c.y*14.), floor(t*12.)))) * glitch;
    c.x += tear + block*(rand(vec2(t, line))-.5)*.08 + band*.003;

    // vertical hold slip during heavy glitch
    c.y = fract(c.y + glitch*glitch*.04*sin(t*7.));

    float ab = .0018 + .009*glitch;
    vec3 col;
    col.r = texture2D(tex, vec2(c.x+ab, c.y)).r;
    col.g = texture2D(tex, c).g;
    col.b = texture2D(tex, vec2(c.x-ab, c.y)).b;

    float n = rand(c*res + fract(t)*91.);
    col = mix(col, vec3(n), clamp(staticAmt,0.,1.));
    col += (n-.5) * (.07 + .2*glitch);

    // scanlines + phosphor mask
    col *= .78 + .22*sin(gl_FragCoord.y*3.14159);
    float m = mod(gl_FragCoord.x, 3.);
    col *= vec3(m<1.?1.08:.94, m>=1.&&m<2.?1.08:.94, m>=2.?1.08:.94);

    col *= 1. + band*.18;
    col *= 1. + .025*sin(t*120.);              // mains flicker
    vec2 v = c*(1.-c); col *= pow(v.x*v.y*16., .28); // vignette
    col = pow(col, vec3(.95));
    gl_FragColor = vec4(col, 1.);
  }`;

let prog, tex, U = {};
function sh(type, s){ const o = gl.createShader(type); gl.shaderSource(o,s); gl.compileShader(o);
  if(!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }

let useGL = !!gl;
if (useGL) {
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog,'p'); gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    ['t','glitch','staticAmt','res','tex'].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
  } catch(e){ console.warn('CRT shader fallback:', e); useGL = false; }
}
const ctx2d = useGL ? null : canvas.getContext('2d');

function resize(){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  if (useGL) gl.viewport(0,0,canvas.width,canvas.height);
}
addEventListener('resize', resize); resize();

/* ---------- Interaction ---------- */
let glitch = 0, staticAmt = 1, mx = 0, my = 0;
const screen = document.getElementById('screen');
addEventListener('pointermove', e => {
  const d = Math.hypot(e.clientX-mx, e.clientY-my); mx = e.clientX; my = e.clientY;
  if (!reduce) glitch = Math.min(1, glitch + d*0.0025);
});
function burst(){ glitch = 1; staticAmt = .85; }
screen.addEventListener('click', burst);

const umd = document.getElementById('umd');
const umdStates = ['PGM · 404','INPUT · ??','PGM · 404','NO SYNC'];

// cut-to-program: static burst + fade to black, then navigate
const cut = document.getElementById('cut'), flash = document.getElementById('flash');
function goProgram(e){
  if (e) e.preventDefault();
  burst(); umd.textContent = 'CUT → PGM';
  setTimeout(()=>flash.classList.add('on'), 220);
  setTimeout(()=>location.href = cut.getAttribute('href'), 420);
}
cut.addEventListener('click', goProgram);
addEventListener('keydown', e => { if (e.key === 'Enter') goProgram(e); });

/* ---------- Loop ---------- */
const tcTop = document.getElementById('tc');
let nextSpike = 3000 + Math.random()*4000;

function frame(now){
  const ms = now - t0, t = ms/1000;

  // random signal drop-outs
  if (!reduce && ms > nextSpike){ glitch = Math.max(glitch,.7); staticAmt = Math.max(staticAmt,.55);
    nextSpike = ms + 3500 + Math.random()*5000; umd.textContent = umdStates[Math.floor(Math.random()*umdStates.length)]; }
  glitch *= reduce ? .8 : .93;
  staticAmt *= .9;

  drawSource(ms);
  tcTop.textContent = tc(ms);

  if (useGL){
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.uniform1f(U.t, t);
    gl.uniform1f(U.glitch, reduce ? 0 : glitch);
    gl.uniform1f(U.staticAmt, staticAmt);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1i(U.tex, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  } else {
    ctx2d.drawImage(src, 0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);
}
// load the canvas fonts first so the slate renders in JetBrains Mono
const fontsReady = document.fonts
  ? Promise.all(['700 150px "JetBrains Mono"', '500 28px "JetBrains Mono"'].map((f) => document.fonts.load(f))).catch(() => {})
  : Promise.resolve();
fontsReady.then(() => requestAnimationFrame(frame));
