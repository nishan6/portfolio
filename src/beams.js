// Moving-head light beams through haze, drawn with Three.js over the page in screen blend.
// Beams drift on their own, follow the pointer a little, and snap to a new cue on every cut.

import {
  WebGLRenderer, Scene, PerspectiveCamera, CylinderGeometry, ShaderMaterial, Mesh, Group,
  AdditiveBlending, DoubleSide, Color, Vector2, Sprite, SpriteMaterial, CanvasTexture,
} from 'three';

const vert = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */`
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vWorld;

  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    float along = pow(vUv.y, 1.6);
    float facing = abs(dot(normalize(vNormal), normalize(-vViewPos)));
    float core = pow(facing, 2.2);
    vec3 p = vWorld * 0.45 + vec3(0.0, uTime * 0.12, uTime * 0.05);
    float haze = 0.45 + 0.55 * noise(p) * noise(p * 2.1 + 3.0);
    float a = along * core * haze * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.5)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

export function createBeams(canvas, { mobile }) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch (e) {
    canvas.remove();
    return { setLevel() {}, cue() {}, destroy() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const COUNT = mobile ? 4 : 8;
  const LEN = 20;
  const geo = new CylinderGeometry(0.06, 2.1, LEN, 40, 1, true);
  geo.translate(0, -LEN / 2, 0);
  const tex = glowTexture();

  const warm = new Color(1.0, 0.93, 0.85);
  const red = new Color(1.0, 0.12, 0.1);
  const green = new Color(0.13, 0.88, 0.48);

  const fixtures = [];
  for (let i = 0; i < COUNT; i++) {
    const t = COUNT === 1 ? 0.5 : i / (COUNT - 1);
    const group = new Group();
    group.position.set((t - 0.5) * (mobile ? 7 : 15), 5.2, -2 - (i % 2) * 1.5);
    const isRed = i === 1 || i === COUNT - 2;
    const mat = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uColor: { value: (isRed ? red : warm).clone() },
        uOpacity: { value: isRed ? 0.55 : 0.32 },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
    });
    const beam = new Mesh(geo, mat);
    group.add(beam);
    const lamp = new Sprite(new SpriteMaterial({ map: tex, color: isRed ? 0xff3b30 : 0xffffff, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.9 }));
    lamp.scale.set(0.9, 0.9, 1);
    group.add(lamp);
    scene.add(group);
    fixtures.push({
      group, beam, mat, lamp,
      baseColor: (isRed ? red : warm).clone(),
      baseOpacity: mat.uniforms.uOpacity.value,
      phase: Math.random() * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.22,
      pan: (t - 0.5) * -0.9,
      tilt: -0.25,
      targetPan: (t - 0.5) * -0.9,
      targetTilt: -0.25,
    });
  }

  const pointer = new Vector2(0, 0);
  const pointerSmooth = new Vector2(0, 0);
  addEventListener('pointermove', (e) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  }, { passive: true });

  let level = 1;
  let levelTarget = 1;
  let flash = 0;

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  let running = true;
  let raf = 0;
  const t0 = performance.now();

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!running || document.hidden) return;
    const t = (now - t0) / 1000;
    pointerSmooth.lerp(pointer, 0.04);
    level += (levelTarget - level) * 0.05;
    flash *= 0.9;

    fixtures.forEach((f) => {
      f.pan += (f.targetPan - f.pan) * 0.08;
      f.tilt += (f.targetTilt - f.tilt) * 0.08;
      const wobPan = Math.sin(t * f.speed + f.phase) * 0.35;
      const wobTilt = Math.sin(t * f.speed * 0.7 + f.phase * 1.3) * 0.25;
      f.group.rotation.z = f.pan + wobPan + pointerSmooth.x * -0.25;
      f.group.rotation.x = f.tilt + wobTilt + pointerSmooth.y * 0.15;
      f.mat.uniforms.uTime.value = t;
      f.mat.uniforms.uOpacity.value = f.baseOpacity * level * (1 + flash * 1.6);
      f.lamp.material.opacity = Math.min(1, 0.9 * level * (1 + flash));
    });
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    setLevel(v) { levelTarget = v; },
    // A lighting cue: every fixture snaps to a new position, colours shift, brief flash
    cue(kind = 'cut') {
      flash = kind === 'cut' ? 1 : 0.5;
      const pattern = Math.floor(Math.random() * 3);
      fixtures.forEach((f, i) => {
        const t = COUNT === 1 ? 0.5 : i / (COUNT - 1);
        if (pattern === 0) { f.targetPan = (t - 0.5) * -1.1; f.targetTilt = -0.2; }
        else if (pattern === 1) { f.targetPan = (t - 0.5) * 1.0; f.targetTilt = -0.45; }
        else { f.targetPan = (Math.random() - 0.5) * 1.2; f.targetTilt = -0.1 - Math.random() * 0.4; }
        const roll = Math.random();
        const col = roll < 0.12 ? green : roll < 0.3 ? red : f.baseColor;
        f.mat.uniforms.uColor.value.copy(col);
      });
    },
    pause() { running = false; },
    resume() { running = true; },
    destroy() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
