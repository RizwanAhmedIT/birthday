/* ============================================================
   HAPPY BIRTHDAY — a celebratory birthday film
   Vanilla canvas 2D for the tree + GSAP orchestration + Web Audio
   Dynamic friendly color palettes & crisp vector typography
   ============================================================ */

import gsap from 'gsap';
import { sound } from './audio.js';
import { StardustTrail, CelebrationFX, SawaariProcession } from './celebration.js';
import { PALETTES, CURRENT_THEME } from './palettes.js';
import { initMemories, showFloatingPolaroids, stopFloatingPolaroids } from './memories.js';

/* the pen-stroke plugin: a `drawn` 0..1 property for the underline */
gsap.registerPlugin({
  name: 'drawn',
  init(target, value) {
    const len = target.getTotalLength();
    target.style.strokeDasharray = len;
    this.target = target; this.len = len; this.value = value;
  },
  render(ratio, data) {
    data.target.style.strokeDashoffset = data.len * (1 - data.value * ratio);
  },
});

const $ = (id) => document.getElementById(id);

const canvas = $('tree');
const ctx    = canvas.getContext('2d');
const wishEl = $('wish');

const hero       = $('hero');
const eyebrow    = $('eyebrow');
const hint       = $('hint');
const motes      = $('motes');
const target     = $('target');
const targetHeart= $('targetHeart');
const heartGlow  = target.querySelector('.heart__glow');
const aim        = $('aim');
const trajectoryPath = $('trajectoryPath');

const archery = $('archery');
const bow     = $('bow');
const arrow   = $('arrow');
const strL    = $('strL');
const strR    = $('strR');
const serving = $('serving');

const flood   = $('flood');
const field   = $('field');
const camera  = $('camera');
const fgrid   = $('fgrid');
const kEyebrow= $('kEyebrow');
const kSub    = $('kSub');
const barTop  = $('barTop');
const barBot  = $('barBot');
const uline   = $('uline').querySelector('.uline__path');
const bloom   = $('bloom');
const replay  = $('replay');

/* UI & Celebration Elements */
const soundToggle      = $('soundToggle');
const soundIcon        = $('soundIcon');
const soundLabel       = $('soundLabel');
const paletteToggle    = $('paletteToggle');
const paletteLabel     = $('paletteLabel');
const waxEnvelope      = $('waxEnvelope');

const letterModal      = $('letterModal');
const letterBackdrop   = $('letterBackdrop');
const letterCloseBtn   = $('letterCloseBtn');

const candleFlame      = $('candleFlame');
const candleSmoke      = $('candleSmoke');
const blowWishBtn      = $('blowWishBtn');
const wishCelebrationNote = $('wishCelebrationNote');
const toast            = $('toast');

/* FX Engines */
const stardust = new StardustTrail($('stardustCanvas'));
const celebration = new CelebrationFX($('celebrationCanvas'));
const sawaari = new SawaariProcession($('sawaariContainer'), celebration, sound);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isRecord     = new URLSearchParams(location.search).has('record');

/* Dynamic Palette Management */
let currentPaletteKey = CURRENT_THEME;
let activePalette = PALETTES[currentPaletteKey] || PALETTES.friend;
let BLOSSOM = activePalette.blossoms;

function applyPalette(paletteKey){
  const p = PALETTES[paletteKey] || PALETTES.friend;
  currentPaletteKey = paletteKey;
  activePalette = p;
  BLOSSOM = p.blossoms;

  // 1. Update CSS root variables
  const root = document.documentElement.style;
  root.setProperty('--paper-0', p.paper0);
  root.setProperty('--paper-1', p.paper1);
  root.setProperty('--paper-2', p.paper2);
  root.setProperty('--body-bg', p.bodyBg);
  root.setProperty('--ink', p.ink);
  root.setProperty('--ink-soft', p.inkSub);
  root.setProperty('--gold-1', p.gold1);
  root.setProperty('--gold-2', p.gold2);
  root.setProperty('--hero-grad', p.heroGrad);

  // 2. Update Target SVG Gradient
  const tgStop0 = $('tgStop0'), tgStop1 = $('tgStop1'), tgStop2 = $('tgStop2'), tgStop3 = $('tgStop3');
  if (tgStop0 && p.targetFill) {
    tgStop0.setAttribute('stop-color', p.targetFill[0]);
    tgStop1.setAttribute('stop-color', p.targetFill[1]);
    tgStop2.setAttribute('stop-color', p.targetFill[2]);
    tgStop3.setAttribute('stop-color', p.targetFill[3]);
  }

  // 3. Update Target Glow & Auras
  const tGlow = $('targetGlow'), tAura1 = $('targetAura1'), tAura2 = $('targetAura2');
  if (tGlow) tGlow.style.background = `radial-gradient(circle, ${p.targetGlow}, transparent 68%)`;
  if (tAura1) tAura1.style.borderColor = p.targetAura;
  if (tAura2) tAura2.style.borderColor = p.targetAura;

  // 4. Update Flood & Field backgrounds
  if (flood && p.floodCircle) {
    flood.style.background = `radial-gradient(circle at 40% 34%, ${p.floodCircle[0]}, ${p.floodCircle[1]} 46%, ${p.floodCircle[2]} 100%)`;
  }
  if (field && p.floodField) {
    field.style.background = `radial-gradient(120% 100% at 50% 8%, ${p.floodField[0]} 0%, ${p.floodField[1]} 42%, ${p.floodField[2]} 78%, ${p.floodField[3]} 100%)`;
  }

  // 5. Update UI Button label
  if (paletteLabel) paletteLabel.textContent = `Palette: ${p.name}`;

  // 6. Rebuild sprites and redraw scene with new colors
  buildSprites();
  buildScene();
  if (window.bdayDone) drawFinal();
}

function cyclePalette(){
  const keys = Object.keys(PALETTES);
  const idx = keys.indexOf(currentPaletteKey);
  const nextKey = keys[(idx + 1) % keys.length];
  applyPalette(nextKey);
  showToast(`Palette changed to: ${PALETTES[nextKey].name} ✨`);
}

if (paletteToggle) {
  paletteToggle.addEventListener('click', cyclePalette);
}

// Keep palette-switching functionality fully accessible programmatically
window.applyPalette = applyPalette;
window.cyclePalette = cyclePalette;

/* Cues with live Web Audio playback */
if (isRecord) window.bdayCues = [];
let recT0 = 0;
function cue(name){
  if (isRecord && recT0) window.bdayCues.push({ cue: name, t: (performance.now() - recT0) / 1000 });

  if (name === 'release') {
    sound.playArrowRelease();
    sound.startBgm();
    if (soundToggle) soundToggle.classList.add('is-playing');
  } else if (name === 'hit') {
    sound.playHeartStrike();
  } else if (name === 'flood') {
    sound.playRoseFlood();
  } else if (name === 'wish' || name === 'wish2') {
    sound.playWishChime();
  } else if (name === 'bloom') {
    sound.playBloomSweep();
  }
}

/* ============================================================
   MATH & DRAWING HELPERS
   ============================================================ */
const rand  = (a, b) => a + Math.random() * (b - a);
const pick  = (a)    => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp  = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack  = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function shade(hex, amt){
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

const T = {
  trunkStart: 0.10,
  branchSpan: 1.80,
  bloomT0:    1.25,
  bloomSpan:  2.00,
  petalT0:    2.45,
  noteStart:  0.45,
  done:       4.60,
};

const SS = 168;

function heartShape(c, x, top, w, h){
  c.beginPath();
  c.moveTo(x, top + h * 0.28);
  c.bezierCurveTo(x, top, x - w * 0.5, top, x - w * 0.5, top + h * 0.28);
  c.bezierCurveTo(x - w * 0.5, top + h * 0.60, x - w * 0.16, top + h * 0.80, x, top + h);
  c.bezierCurveTo(x + w * 0.16, top + h * 0.80, x + w * 0.5, top + h * 0.60, x + w * 0.5, top + h * 0.28);
  c.bezierCurveTo(x + w * 0.5, top, x, top, x, top + h * 0.28);
  c.closePath();
}

function makeBlossom({ c0, c1 }, soft){
  const cv = document.createElement('canvas'); cv.width = cv.height = SS;
  const c = cv.getContext('2d');
  const w = SS * 0.62, h = SS * 0.58, x = SS / 2, top = SS * 0.17;

  c.save();
  c.shadowColor = 'rgba(180,100,20,0.28)';
  c.shadowBlur = SS * 0.085; c.shadowOffsetY = SS * 0.05;
  const g = c.createLinearGradient(x, top, x, top + h);
  g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, shade(c1, -35));
  c.fillStyle = g; heartShape(c, x, top, w, h); c.fill();
  c.restore();

  c.save(); heartShape(c, x, top, w, h); c.clip();
  const g2 = c.createRadialGradient(x, top + h * 0.85, 0, x, top + h * 0.85, h);
  g2.addColorStop(0, 'rgba(255,255,255,0)');
  g2.addColorStop(0.65, 'rgba(140,60,10,0)');
  g2.addColorStop(1, 'rgba(140,60,10,0.22)');
  c.fillStyle = g2; c.fillRect(0, 0, SS, SS);
  c.globalAlpha = 0.55; c.fillStyle = '#ffffff';
  c.beginPath(); c.ellipse(x - w * 0.15, top + h * 0.24, w * 0.17, h * 0.11, -0.5, 0, Math.PI * 2); c.fill();
  c.restore();

  if (!soft) return cv;

  const cv2 = document.createElement('canvas'); cv2.width = cv2.height = SS;
  const c2 = cv2.getContext('2d');
  c2.filter = 'blur(2.6px)'; c2.drawImage(cv, 0, 0); c2.filter = 'none';
  c2.globalCompositeOperation = 'source-atop';
  c2.globalAlpha = 0.42; c2.fillStyle = '#fffdf5'; c2.fillRect(0, 0, SS, SS);
  return cv2;
}

function makeBokeh(rgb){
  const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${rgb},0.9)`); g.addColorStop(0.45, `rgba(${rgb},0.22)`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(0, 0, S, S);
  return cv;
}

function makeSparkle(){
  const S = 64, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d'); const m = S / 2;
  const g = c.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.25, 'rgba(255,236,200,0.5)'); g.addColorStop(1, 'rgba(255,236,200,0)');
  c.fillStyle = g; c.beginPath(); c.arc(m, m, m, 0, 6.2832); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.95)';
  c.translate(m, m);
  for (let k = 0; k < 2; k++){
    c.beginPath();
    c.moveTo(0, -m); c.quadraticCurveTo(0, 0, m, 0); c.quadraticCurveTo(0, 0, 0, m); c.quadraticCurveTo(0, 0, -m, 0); c.quadraticCurveTo(0, 0, 0, -m);
    c.fill(); c.rotate(Math.PI / 4); c.scale(0.5, 0.5);
  }
  return cv;
}

let SPR = { crisp: [], soft: [] }, BOKEH = [], SPARKLE = null;
function buildSprites(){
  SPR = { crisp: BLOSSOM.map((b) => makeBlossom(b, false)), soft: BLOSSOM.map((b) => makeBlossom(b, true)) };
  const bRgb = activePalette.bokehRgb || ['255,230,160', '255,190,120', '210,245,230'];
  BOKEH = bRgb.map(rgb => makeBokeh(rgb));
  SPARKLE = makeSparkle();
}

function drawSprite(sprite, x, y, size, rot, alpha){
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, -size * 0.5, -size * 0.47, size, size);
  ctx.restore();
}

let heartPoly = null;
function buildHeartPoly(){
  const raw = []; let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (let i = 0; i <= 160; i++){
    const t = (i / 160) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    // Invert Y so lobes are at the top and pointy tip is at the bottom on canvas
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    raw.push([x, y]);
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2, hw = (maxX - minX) / 2, hh = (maxY - minY) / 2;
  heartPoly = raw.map(([x, y]) => [(x - midX) / hw, (y - midY) / hh]);
}
function pointInPoly(x, y){
  let inside = false; const p = heartPoly;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++){
    const xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

let W = 0, H = 0, dpr = 1;
let cx = 0, cy = 0, rx = 0, ry = 0, groundY = 0;
let branches = [], hearts = [], petals = [], rested = [], orbs = [], floaters = [], twinkles = [];
let bgGrad = null, glowGrad = null, groundGrad = null;

let windForceX = 0;
window.addEventListener('pointermove', (e) => {
  windForceX = clamp((e.movementX || 0) * 0.5, -15, 15);
}, { passive: true });

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  for (let i = 0; i < 6; i++) {
    petals.push({
      x: clickX + rand(-15, 15), y: clickY + rand(-15, 15),
      vy: rand(12, 28), vx: rand(-12, 12), sway: rand(0.6, 1.4),
      phase: rand(0, 6.28), box: rand(20, 36), idx: (Math.random() * BLOSSOM.length) | 0,
      rot: rand(0, 6.28), vrot: rand(-1.4, 1.4), age: 0, land: groundY + rand(-6, H * 0.05)
    });
  }
});

const quad = (b, t) => { const m = 1 - t, a = m * m, k = 2 * m * t, d = t * t; return { x: a * b.x1 + k * b.cx + d * b.x2, y: a * b.y1 + k * b.cy + d * b.y2 }; };

function barkGrad(x1, y1, x2, y2, depth){
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, `hsl(30 30% ${24 + depth * 3}%)`);
  g.addColorStop(1, `hsl(28 26% ${38 + depth * 5}%)`);
  return g;
}

function buildScene(){
  branches = []; hearts = []; petals = []; rested = []; twinkles = []; orbs = []; floaters = [];
  buildHeartPoly();

  const wide = W / H > 1.2;
  cx = W * (wide ? 0.57 : 0.5);
  cy = H * (wide ? 0.37 : 0.35);
  rx = Math.min(W * 0.44, H * 0.43);
  ry = rx * 0.88;
  groundY = H * 0.94;

  const sGrad = activePalette.skyGrad || ['#fffbf4', '#f8eedc', '#ecd4b2', '#deb886'];
  bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, sGrad[0]);
  bgGrad.addColorStop(0.36, sGrad[1]);
  bgGrad.addColorStop(0.72, sGrad[2]);
  bgGrad.addColorStop(1, sGrad[3]);

  glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry) * 1.55);
  glowGrad.addColorStop(0, 'rgba(255,255,245,0.85)');
  glowGrad.addColorStop(0.25, 'rgba(255,235,190,0.55)');
  glowGrad.addColorStop(0.6, 'rgba(255,200,140,0.2)');
  glowGrad.addColorStop(1, 'rgba(255,200,140,0)');

  groundGrad = ctx.createLinearGradient(0, groundY - 20, 0, H);
  groundGrad.addColorStop(0, 'rgba(70,30,10,0)');
  groundGrad.addColorStop(0.35, 'rgba(60,25,8,0.3)');
  groundGrad.addColorStop(1, 'rgba(40,15,4,0.7)');

  // Main trunk: reaches directly to the heart bottom tip and smoothly branches out
  growBranch(cx, groundY, cx, cy + ry * 0.42, 0, 0.1, 0, W * (wide ? 0.024 : 0.032));

  // Densely populate the heart with lush, large petals
  const N = Math.round(clamp(W * H * (wide ? 0.0013 : 0.0018), 640, 1250));
  let placed = 0, guard = 0;
  while (placed < N && guard++ < 35000){
    const ang = Math.random() * Math.PI * 2;
    const rad = Math.sqrt(Math.random());
    const nx = Math.cos(ang) * rad, ny = Math.sin(ang) * rad;
    if (!pointInPoly(nx, ny)) continue;
    const x = cx + nx * rx, y = cy + ny * ry;
    const dEdge = Math.hypot(nx, ny);
    const soft = Math.random() < (dEdge > 0.78 ? 0.42 : 0.18);
    const box = rand(wide ? 28 : 22, wide ? 58 : 46) * (soft ? 1.25 : 1);
    const idx = (Math.random() * BLOSSOM.length) | 0;
    const t0 = T.bloomT0 + (1 - dEdge) * (T.bloomSpan * 0.45) + rand(0, T.bloomSpan * 0.55);
    hearts.push({ x, y, box, idx, soft, t0, rot: rand(-0.4, 0.4), sway: rand(0, 6.28) });
    placed++;
  }
  hearts.sort((a, b) => (a.soft === b.soft ? a.y - b.y : a.soft ? -1 : 1));

  for (let i = 0; i < 22; i++){
    orbs.push({ x: rand(0, W), y: rand(0, H), size: rand(60, 200), idx: i % BOKEH.length, vx: rand(-4, 4), vy: rand(-3, 3), alpha: rand(0.25, 0.6) });
  }
  for (let i = 0; i < 30; i++){
    floaters.push({ x: rand(0, W), y: rand(0, H), size: rand(8, 20), idx: (Math.random() * BLOSSOM.length) | 0, rot: rand(0, 6.28), vrot: rand(-0.6, 0.6), vx: rand(-8, 8), vy: rand(-6, -18), baseA: rand(0.3, 0.75), soft: Math.random() < 0.5 });
  }
}

function growBranch(x1, y1, x2, y2, depth, t0, angle, width){
  const dur = Math.max(0.18, (T.branchSpan / 5.5) * Math.pow(0.82, depth));
  const bend = (Math.random() - 0.5) * (Math.hypot(x2 - x1, y2 - y1) * 0.22);
  const mx = (x1 + x2) / 2 - Math.sin(angle) * bend;
  const my = (y1 + y2) / 2 + Math.cos(angle) * bend;
  const w0 = width, w1 = width * (depth === 0 ? 0.72 : 0.68);
  branches.push({ x1, y1, cx: mx, cy: my, x2, y2, t0, dur, w0, w1, depth, grad: barkGrad(x1, y1, x2, y2, depth) });
  
  if (depth >= 4) return;
  
  const count = depth <= 1 ? 2 : Math.random() < 0.25 ? 1 : 2;
  const spread = 0.52 - depth * 0.08;
  
  for (let k = 0; k < count; k++){
    const forkFrac = rand(0.68, 0.95);
    const p = quad({ x1, y1, cx: mx, cy: my, x2, y2 }, forkFrac);
    const side = (k === 0 ? -1 : 1);
    const newAng = angle + side * rand(spread * 0.6, spread);
    const len = Math.hypot(x2 - x1, y2 - y1) * (depth === 0 ? 0.68 : 0.58);
    const nx = p.x + Math.sin(newAng) * len;
    const ny = p.y - Math.cos(newAng) * len;

    // Check if branch stays safely within upper canopy
    if (ny < cy - ry * 0.85) continue;
    
    growBranch(p.x, p.y, nx, ny, depth + 1, t0 + dur * rand(0.4, 0.75), newAng, w1);
  }
}

function drawBackground(){ ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H); }
function drawGlow(t){
  const a = clamp01((t - T.bloomT0) / (T.bloomSpan * 0.8));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = glowGrad; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function drawGodRays(t, a){
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * 0.28; ctx.globalCompositeOperation = 'lighter';
  const rays = 7;
  for (let i = 0; i < rays; i++){
    const ang = -0.9 + (i / (rays - 1)) * 1.8;
    const w = W * 0.12;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.sin(ang - 0.08) * W * 1.2, cy + Math.cos(ang - 0.08) * H * 1.2);
    ctx.lineTo(cx + Math.sin(ang + 0.08) * W * 1.2, cy + Math.cos(ang + 0.08) * H * 1.2);
    ctx.closePath();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.9);
    g.addColorStop(0, 'rgba(255,248,220,0.6)'); g.addColorStop(0.5, 'rgba(255,210,180,0.18)'); g.addColorStop(1, 'rgba(255,190,170,0)');
    ctx.fillStyle = g; ctx.fill();
  }
  ctx.restore();
}
function drawBokeh(t, dt){
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const b of orbs){
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < -b.size) b.x = W + b.size; if (b.x > W + b.size) b.x = -b.size;
    if (b.y < -b.size) b.y = H + b.size; if (b.y > H + b.size) b.y = -b.size;
    ctx.globalAlpha = b.alpha; ctx.drawImage(BOKEH[b.idx], b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);
  }
  ctx.restore();
}
function drawFloaters(t, dt, fore){
  const appear = clamp01((t - T.bloomT0) / 1.5);
  if (appear <= 0) return;
  for (const f of floaters){
    if (f.soft !== fore) continue;
    f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vrot * dt;
    if (f.y < -f.size * 2){ f.y = H + f.size; f.x = rand(0, W); }
    if (f.x < -f.size * 2) f.x = W + f.size; if (f.x > W + f.size) f.x = -f.size;
    drawSprite((f.soft ? SPR.soft : SPR.crisp)[f.idx], f.x, f.y, f.box, f.rot, f.baseA * appear);
  }
}

function drawBranches(t){
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const b of branches){
    const f = clamp01((t - b.t0) / b.dur);
    if (f <= 0) continue;
    const e = easeOutCubic(f);
    ctx.strokeStyle = b.grad;
    const steps = 12, last = Math.max(1, Math.ceil(steps * e));
    let prev = quad(b, 0);
    for (let i = 1; i <= last; i++){
      const tt = Math.min(e, i / steps), p = quad(b, tt);
      ctx.lineWidth = lerp(b.w0, b.w1, tt);
      ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      prev = p;
    }
  }
}

function drawHearts(t){
  const breathe = 1 + Math.sin(t * 0.8) * 0.012;
  for (const h of hearts){
    const p = clamp01((t - h.t0) / 0.6);
    if (p <= 0) continue;
    const scale = Math.max(0, easeOutBack(p));
    let alpha = clamp01(p * 1.7); if (h.soft) alpha *= 0.8;
    const settled = clamp01((t - h.t0 - 0.6) / 0.7);
    const sway = settled * Math.sin(t * 1.5 + h.sway) * (h.box * 0.05);
    const rise = (1 - easeOutCubic(p)) * h.box * 0.45;
    const hx = cx + (h.x - cx) * breathe + sway;
    const hy = cy + (h.y - cy) * breathe - rise;
    drawSprite((h.soft ? SPR.soft : SPR.crisp)[h.idx], hx, hy, h.box * scale, h.rot + sway * 0.012, alpha);
  }
}

function updateTwinkles(t, dt){
  const active = t > T.bloomT0 + T.bloomSpan * 0.45;
  if (active && twinkles.length < 9 && Math.random() < 0.5){
    const h = hearts[(Math.random() * hearts.length) | 0];
    if (h) twinkles.push({ x: h.x, y: h.y, size: rand(0.6, 1.3) * (Math.min(W, H) * 0.05), age: 0, life: rand(0.7, 1.2), rot: rand(0, 6.28) });
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = twinkles.length - 1; i >= 0; i--){
    const s = twinkles[i]; s.age += dt;
    const k = s.age / s.life;
    if (k >= 1){ twinkles.splice(i, 1); continue; }
    const a = Math.sin(k * Math.PI);
    drawSprite(SPARKLE, s.x, s.y, s.size * (0.6 + 0.4 * a), s.rot + k * 1.2, a);
  }
  ctx.restore();
}

function spawnPetal(){
  const h = hearts[(Math.random() * hearts.length) | 0];
  if (!h) return;
  petals.push({ x: h.x + rand(-8, 8), y: h.y + rand(-8, 8), vy: rand(14, 30), vx: rand(-8, 8), sway: rand(0.6, 1.4), phase: rand(0, 6.28), box: h.box * rand(0.34, 0.6), idx: h.idx, rot: rand(0, 6.28), vrot: rand(-1.4, 1.4), age: 0, land: groundY + rand(-6, H * 0.05) });
}
function drawPetals(t, dt){
  for (let i = petals.length - 1; i >= 0; i--){
    const p = petals[i]; p.age += dt; p.vy += 8 * dt;
    p.x += (p.vx + Math.sin(t * p.sway + p.phase) * 16 + windForceX) * dt;
    p.y += p.vy * dt; p.rot += p.vrot * dt;
    if (p.y >= p.land){
      rested.push({ x: clamp(p.x, 6, W - 6), y: p.land, box: p.box, idx: p.idx, rot: p.rot, a: rand(0.7, 0.95) });
      if (rested.length > 90) rested.shift();
      petals.splice(i, 1); continue;
    }
    const a = p.age < 0.3 ? p.age / 0.3 : 1;
    drawSprite(SPR.crisp[p.idx], p.x, p.y, p.box, p.rot, a);
  }
}
function drawRested(){
  for (const r of rested) drawSprite(SPR.crisp[r.idx], r.x, r.y, r.box, r.rot, r.a);
}

let polaroidsShown = false;
function showWish(on){
  wishEl.classList.toggle('is-in', on);
  if (on && !polaroidsShown) {
    polaroidsShown = true;
    try {
      showFloatingPolaroids();
    } catch (err) {
      console.warn('showFloatingPolaroids error:', err);
    }
  }
}

let treeStartT = 0, treeLastT = 0, treeRAF = 0, lastPetal = 0, replayArmed = false;
window.bdayDone = false;

function treeFrame(now){
  if (!treeStartT){ treeStartT = now; treeLastT = now; }
  const t  = (now - treeStartT) / 1000;
  const dt = Math.min(0.05, (now - treeLastT) / 1000); treeLastT = now;

  const rays = clamp01((t - T.bloomT0) / T.bloomSpan);

  drawBackground();
  drawGodRays(t, rays);
  drawGlow(t);
  drawBokeh(t, dt);
  drawFloaters(t, dt, false);
  drawBranches(t);
  drawHearts(t);
  updateTwinkles(t, dt);

  ctx.fillStyle = groundGrad; ctx.fillRect(0, groundY - 20, W, H - (groundY - 20));

  if (t >= T.petalT0 && t - lastPetal > 0.18){ lastPetal = t; spawnPetal(); }
  drawPetals(t, dt);
  drawRested();
  drawFloaters(t, dt, true);

  showWish(t >= T.noteStart);

  if (!window.bdayDone && t >= T.done) window.bdayDone = true;
  if (!replayArmed && t >= T.done + 1.0){ replayArmed = true; armReplay(); }

  treeRAF = requestAnimationFrame(treeFrame);
}

function treeStart(){
  treeStartT = 0; treeLastT = 0; lastPetal = 0; replayArmed = false; window.bdayDone = false;
  cue('grow');
  buildScene();
  if (!treeRAF) treeRAF = requestAnimationFrame(treeFrame);
}
function treeStop(){
  if (treeRAF){ cancelAnimationFrame(treeRAF); treeRAF = 0; }
  ctx.clearRect(0, 0, W, H);
}

function drawFinal(){
  buildScene();
  drawBackground(); drawGodRays(0, 1); drawGlow(T.done); drawBokeh(0, 0); drawFloaters(99, 0, false);
  drawBranches(99); drawHearts(99);
  for (let i = 0; i < 40; i++){ const h = hearts[(Math.random() * hearts.length) | 0]; if (h) rested.push({ x: clamp(h.x + rand(-W * 0.3, W * 0.3), 6, W - 6), y: groundY + rand(-6, H * 0.05), box: h.box * 0.5, idx: h.idx, rot: rand(0, 6.28), a: 0.85 }); }
  drawRested(); drawFloaters(99, 0, true);
  showWish(true);
  window.bdayDone = true;
}

/* ============================================================
   ACTS 1–3 (GSAP) — the bow, the shot, the wish
   ============================================================ */
function splitWord(el){
  const chars = [...el.textContent];
  el.textContent = '';
  return chars.map((c) => {
    const s = document.createElement('span');
    s.className = 'hl__ch';
    s.textContent = c === ' ' ? ' ' : c;
    el.appendChild(s);
    return s;
  });
}
const line1Chars = splitWord($('wLine1'));
const line2Chars = splitWord($('wLine2'));
const kChars = [...line1Chars, ...line2Chars];

function buildMotes(){
  motes.innerHTML = '';
  for (let i = 0; i < 14; i++){
    const m = document.createElement('span');
    m.className = 'mote';
    const s = rand(5, 14);
    m.style.width = m.style.height = `${s}px`;
    m.style.left = `${rand(4, 96)}%`;
    m.style.top  = `${rand(10, 96)}%`;
    motes.appendChild(m);
    gsap.set(m, { opacity: rand(0.3, 0.75) });
    gsap.to(m, { y: -rand(40, 140), x: rand(-30, 30), duration: rand(7, 14), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: -rand(0, 8) });
    gsap.to(m, { opacity: rand(0.15, 0.6), duration: rand(2.5, 5), repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
}

const tip = $('tip');
let svgScale = 1, arrowBaseX = 0, arrowBaseY = 0, maxDraw = 120, curDraw = 0;
let pullUX = 0, pullUY = 1;
const REST_NOCK = 96;
const nockProxy = { val: REST_NOCK };

function applyNock(){
  const y = nockProxy.val;
  strL.setAttribute('y2', y); strR.setAttribute('y2', y); serving.setAttribute('cy', y);
}

function updateTrajectoryGuide(gripX, gripY, heartX, heartY){
  if (!trajectoryPath) return;
  const midX = (gripX + heartX) * 0.5 - 20;
  const midY = (gripY + heartY) * 0.5 - 35;
  trajectoryPath.setAttribute('d', `M ${gripX} ${gripY} Q ${midX} ${midY} ${heartX} ${heartY}`);
}

function refreshRig(){
  const gripX = W * 0.24, gripY = H * 0.76;
  const heartX = W * 0.5, heartY = H * 0.33;
  const aimRad = Math.atan2(heartX - gripX, gripY - heartY);
  pullUX = -Math.sin(aimRad); pullUY = Math.cos(aimRad);

  updateTrajectoryGuide(gripX, gripY, heartX, heartY);

  nockProxy.val = REST_NOCK; applyNock();
  gsap.set(archery, { rotation: 0, scale: 1, x: 0, y: 0 });
  archery.style.left = '0px'; archery.style.top = '0px';
  gsap.set(arrow, { x: 0, y: 0 });
  const aR = archery.getBoundingClientRect();
  const bR = bow.getBoundingClientRect();
  const sR = serving.getBoundingClientRect();
  const rR = arrow.getBoundingClientRect();
  svgScale = bR.width / 460;
  const gripLX = (bR.left - aR.left) + 0.5 * bR.width;
  const gripLY = (bR.top  - aR.top ) + (240 / 300) * bR.height;
  const nockLX = (sR.left - aR.left) + 0.5 * sR.width;
  const nockLY = (sR.top  - aR.top ) + 0.5 * sR.height;
  arrowBaseX = nockLX - ((rR.left - aR.left) + 0.5 * rR.width);
  arrowBaseY = nockLY - ((rR.top  - aR.top ) + (205 / 220) * rR.height);

  archery.style.left = (gripX - gripLX) + 'px';
  archery.style.top  = (gripY - gripLY) + 'px';
  gsap.set(archery, { transformOrigin: `${gripLX}px ${gripLY}px`, rotation: aimRad * 180 / Math.PI });
  gsap.set(arrow, { x: arrowBaseX, y: arrowBaseY });
  maxDraw = Math.min(bR.height * 0.72, H * 0.16, 132);
  curDraw = 0;
}

function setDraw(d){
  curDraw = clamp(d, 0, maxDraw);
  gsap.set(arrow, { x: arrowBaseX, y: arrowBaseY + curDraw });
  nockProxy.val = REST_NOCK + curDraw / svgScale; applyNock();
  gsap.set(aim, { opacity: 0.65 * (curDraw / maxDraw) });
  if (curDraw > 15 && trajectoryPath) {
    trajectoryPath.classList.add('is-active');
  } else if (trajectoryPath) {
    trajectoryPath.classList.remove('is-active');
  }
}

let beatTL = null;
function startBeat(){
  gsap.set(targetHeart, { scale: 1 });
  gsap.set(heartGlow, { scale: 1, opacity: 0.7 });
  beatTL = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
  beatTL.to(targetHeart, { scale: 1.07, duration: 0.13, ease: 'power2.out' }, 0)
        .to(heartGlow,   { scale: 1.15, opacity: 0.9, duration: 0.13, ease: 'power2.out' }, 0)
        .to(targetHeart, { scale: 1.0, duration: 0.2, ease: 'power2.in' }, 0.13)
        .to(targetHeart, { scale: 1.05, duration: 0.12, ease: 'power2.out' }, 0.3)
        .to(targetHeart, { scale: 1.0, duration: 0.5, ease: 'power2.inOut' }, 0.42)
        .to(heartGlow,   { scale: 1.0, opacity: 0.7, duration: 0.7, ease: 'power2.inOut' }, 0.3);
}
function stopBeat(){ if (beatTL){ beatTL.kill(); beatTL = null; } gsap.set(targetHeart, { scale: 1 }); }

function miniHeartSVG(fill){
  return `<svg viewBox="0 0 24 22" width="100%" height="100%"><path d="M12 20C5.5 15 1.5 11.4 1.5 6.9 1.5 3.6 4 1.5 7 1.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3 0 5.5 2.1 5.5 5.4C23.5 11.4 19.5 15 12 20Z" fill="${fill}"/></svg>`;
}
function burstHearts(){
  const r = target.getBoundingClientRect();
  const hr = hero.getBoundingClientRect();
  const ox = r.left - hr.left + r.width / 2;
  const oy = r.top - hr.top + r.height * 0.42;
  const cols = ['#fde047', '#f59e0b', '#fb923c', '#eab308', '#2dd4bf', '#ffffff'];
  const frag = document.createDocumentFragment();
  const nodes = [];
  for (let i = 0; i < 16; i++){
    const heart = i < 10;
    const el = document.createElement('span');
    el.className = 'burst';
    const s = heart ? rand(14, 24) : rand(5, 10);
    el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;pointer-events:none;z-index:4;`;
    if (heart) el.innerHTML = miniHeartSVG(pick(cols));
    else { el.style.borderRadius = '50%'; el.style.background = 'radial-gradient(circle,#fff,rgba(254,240,138,0) 70%)'; }
    frag.appendChild(el); nodes.push({ el, heart });
  }
  hero.appendChild(frag);
  nodes.forEach(({ el, heart }) => {
    const ang = rand(-Math.PI, 0);
    const dist = rand(heart ? 80 : 50, heart ? 210 : 140);
    gsap.to(el, {
      x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - rand(15, 60),
      rotation: rand(-140, 140), scale: heart ? rand(0.8, 1.3) : rand(0.5, 1.1),
      duration: rand(0.7, 1.25), ease: 'power2.out',
    });
    gsap.to(el, { opacity: 0, duration: 0.5, delay: rand(0.35, 0.65), ease: 'power1.in', onComplete: () => el.remove() });
  });
}

function shotGeom(){
  const tipR = tip.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();
  const tipX = tipR.left + tipR.width / 2, tipY = tipR.top + tipR.height / 2;
  const tcx = tRect.left + tRect.width / 2, tcy = tRect.top + tRect.height / 2;
  const flightDist = Math.hypot(tcx - tipX, tcy - tipY);
  const fallPx = Math.min(H * 0.26, H - tcy - tRect.height * 0.4);
  const impactX = tcx, impactY = tcy + fallPx;
  const distC = Math.hypot(Math.max(impactX, W - impactX), Math.max(impactY, H - impactY));
  const reach = Math.hypot(W / 2, H / 2);
  return {
    arrowStartY: arrowBaseY + curDraw,
    arrowFlyY:   arrowBaseY + curDraw - flightDist,
    drawnNock:   REST_NOCK + curDraw / svgScale,
    fallPx, fx: impactX - W / 2, fy: impactY - H / 2,
    floodScale: (distC * 1.12) / 70, bloomScale: (reach * 1.2) / 30,
  };
}

let filmTL = null;
function buildFilm(m){
  const t = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.set(field, { autoAlpha: 0 });
      treeStart();
      gsap.to(bloom, { autoAlpha: 0, duration: 1.15, ease: 'power2.out' });
    },
  });

  t.set(target, { y: 0, scaleX: 1, scaleY: 1, opacity: 1 })
   .set(arrow, { opacity: 1, x: arrowBaseX, y: m.arrowStartY, scaleY: 1 })
   .set([flood, bloom], { autoAlpha: 0, scale: 0.001, x: 0, y: 0 })
   .set(flood, { x: m.fx, y: m.fy })
   .set(field, { autoAlpha: 0 })
   .set('.blob', { opacity: 0 })
   .set(camera, { scale: 1, yPercent: 0 })
   .set(fgrid, { xPercent: 0, yPercent: 0 })
   .set(barTop, { yPercent: -100 })
   .set(barBot, { yPercent: 100 })
   .set(kEyebrow, { opacity: 0, y: 12 })
   .set(kSub, { opacity: 0, y: 12 })
   .set(kChars, { transformPerspective: 620, transformOrigin: '50% 100%', yPercent: 135, rotationX: -82 })
   .set(uline, { drawn: 0 });

  t.fromTo(nockProxy, { val: m.drawnNock }, { val: REST_NOCK, duration: 0.5, ease: 'elastic.out(1,0.34)', onUpdate: applyNock }, 0)
   .to(arrow, { y: m.arrowFlyY, duration: 0.26, ease: 'power2.in' }, 0)
   .to(arrow, { scaleY: 1.16, duration: 0.14, ease: 'power2.in' }, 0)
   .to(arrow, { scaleY: 1.0, duration: 0.1, ease: 'power1.out' }, 0.16)
   .to(aim, { opacity: 0, duration: 0.18 }, 0)
   .to([eyebrow, hint], { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);

  t.add(burstHearts, 0.26)
   .to(target, { x: 7, y: -9, duration: 0.06, ease: 'power2.out' }, 0.26)
   .to(target, { x: 0, y: 0, duration: 0.32, ease: 'power2.out' }, 0.32)
   .to(target, { scale: 1.14, duration: 0.06, ease: 'power2.out' }, 0.26)
   .to(target, { scale: 1.0, duration: 0.26, ease: 'power2.inOut' }, 0.32)
   .to(arrow, { rotation: '+=4', duration: 0.05, yoyo: true, repeat: 4, ease: 'sine.inOut' }, 0.27)
   .set(arrow, { rotation: 0 }, 0.52)
   .to(arrow, { opacity: 0, duration: 0.16, ease: 'power1.out' }, 0.56);

  t.to(target, { y: m.fallPx, scaleX: 0.84, scaleY: 1.3, duration: 0.34, ease: 'power1.in' }, 0.64)
   .to(target, { scaleX: 1.4, scaleY: 0.6, duration: 0.07, ease: 'power2.out' }, 0.98)
   .set(flood, { autoAlpha: 1 }, 1.00)
   .fromTo(flood, { scale: 0.02 }, { scale: m.floodScale, duration: 0.34, ease: 'power2.in' }, 1.00)
   .to(target, { opacity: 0, duration: 0.12, ease: 'power1.out' }, 1.06);

  t.set(field, { autoAlpha: 1 }, 1.32)
   .set(hero, { autoAlpha: 0 }, 1.33)
   .to('.blob', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.34)
   .set(flood, { autoAlpha: 0 }, 1.36);

  t.fromTo(camera, { scale: 1.0, yPercent: 0 }, { scale: 1.07, yPercent: -1.3, duration: 2.6, ease: 'none' }, 1.38)
   .fromTo(fgrid, { xPercent: 0, yPercent: 0 }, { xPercent: -1.5, yPercent: -1.0, duration: 2.6, ease: 'none' }, 1.38);

  t.call(cue, ['hit'], 0.26)
   .call(cue, ['flood'], 1.00)
   .call(cue, ['wish'], 1.68)
   .call(cue, ['wish2'], 2.06)
   .call(cue, ['bloom'], 3.42);

  t.to(barTop, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.5)
   .to(barBot, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.5);

  t.to(kEyebrow, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 1.54)
   .to(line1Chars, { yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.033 }, 1.68)
   .to(line2Chars, { yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.033 }, 2.06)
   .to(uline, { drawn: 1, duration: 0.45, ease: 'power2.inOut' }, 2.54)
   .to(kSub, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 2.74);

  t.to(barTop, { yPercent: -100, duration: 0.5, ease: 'power2.in' }, 3.32)
   .to(barBot, { yPercent: 100, duration: 0.5, ease: 'power2.in' }, 3.32)
   .set(bloom, { autoAlpha: 1 }, 3.42)
   .fromTo(bloom, { scale: 0.02 }, { scale: m.bloomScale, duration: 0.58, ease: 'power2.in' }, 3.42);

  return t;
}

let played = false, drawing = false, startPX = 0, startPY = 0, startDraw = 0;

function fire(){
  if (played) return;
  played = true;
  drawing = false;
  if (trajectoryPath) trajectoryPath.classList.remove('is-active');
  stopBeat();
  cue('release');
  filmTL = buildFilm(shotGeom());
  filmTL.play(0);
}

function springBack(){
  const from = curDraw;
  gsap.to({ d: from }, { d: 0, duration: 0.55, ease: 'elastic.out(1,0.4)', onUpdate() { setDraw(this.targets()[0].d); } });
}

function autoFire(){
  if (played) return;
  recT0 = performance.now();
  sound.playBowDraw(0.8);
  gsap.to({ d: curDraw }, {
    d: maxDraw * 0.94, duration: 0.62, ease: 'power2.inOut',
    onUpdate() { setDraw(this.targets()[0].d); },
    onComplete: () => gsap.delayedCall(0.16, fire),
  });
}

archery.addEventListener('pointerdown', (e) => {
  if (played) return;
  drawing = true;
  try { archery.setPointerCapture(e.pointerId); } catch (_) {}
  startPX = e.clientX; startPY = e.clientY; startDraw = curDraw;
  sound.playBowDraw(0.3);
  e.preventDefault();
});
archery.addEventListener('pointermove', (e) => {
  if (!drawing) return;
  const proj = (e.clientX - startPX) * pullUX + (e.clientY - startPY) * pullUY;
  setDraw(startDraw + proj);
  if (Math.random() < 0.2) sound.playBowDraw(curDraw / maxDraw);
});
function endDraw(){
  if (!drawing) return;
  drawing = false;
  if (curDraw > maxDraw * 0.26) fire(); else springBack();
}
archery.addEventListener('pointerup', endDraw);
archery.addEventListener('pointercancel', endDraw);
archery.addEventListener('keydown', (e) => {
  if (played) return;
  if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); autoFire(); }
});

target.addEventListener('click', () => {
  if (!played) autoFire();
});

hint.addEventListener('click', () => {
  if (!played) autoFire();
});

// Mobile friendly: tapping archery or anywhere on Act 1 screen triggers autoFire smoothly
archery.addEventListener('click', () => {
  if (!played) autoFire();
});

window.addEventListener('click', (e) => {
  if (played) return;
  if (e.target.closest('#soundToggle') || e.target.closest('#paletteToggle')) return;
  autoFire();
});

window.autoFire = autoFire;

/* boot Act 1 */
function enter(){
  gsap.set(hero, { autoAlpha: 1 });
  refreshRig();
  setDraw(0);
  gsap.set([eyebrow, hint], { opacity: 0, y: 14 });
  gsap.set(target, { opacity: 0, y: 10, scaleX: 0.9, scaleY: 0.9 });
  gsap.set(archery, { opacity: 0, scale: 0.85 });
  gsap.set(heartGlow, { opacity: 0, scale: 1 });
  gsap.set(arrow, { opacity: 1 });

  const tl = gsap.timeline({ onComplete: startBeat });
  tl.to(target,   { opacity: 1, y: 0, scaleX: 1, scaleY: 1, duration: 0.8, ease: 'power3.out' }, 0.1)
    .to(heartGlow,{ opacity: 0.7, duration: 0.8, ease: 'power2.out' }, 0.2)
    .to(archery,  { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.28)
    .to(eyebrow,  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4)
    .to(hint,     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.7);
}

function armReplay(){
  replay.hidden = false;
  requestAnimationFrame(() => replay.classList.add('is-shown'));
}

function resetAll(){
  treeStop();
  polaroidsShown = false;
  stopFloatingPolaroids();
  const floatContainer = document.getElementById('floatingPolaroids');
  if (floatContainer) { floatContainer.innerHTML = ''; floatContainer.classList.remove('is-visible'); }
  showWish(false);
  window.bdayDone = false; replayArmed = false;
  replay.classList.remove('is-shown'); replay.hidden = true;
  if (filmTL){ filmTL.pause(0); }
  gsap.set([flood, bloom], { autoAlpha: 0 });
  gsap.set(field, { autoAlpha: 0 });
  gsap.set(arrow, { opacity: 1, scaleY: 1 });
  played = false;
  enter();
}

function showToast(text){
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('is-shown');
  setTimeout(() => toast.classList.remove('is-shown'), 3000);
}

// Letter modal handlers
if (waxEnvelope) {
  waxEnvelope.addEventListener('click', () => {
    sound.playLetterOpen();
    letterModal.classList.add('is-open');
    letterModal.setAttribute('aria-hidden', 'false');
  });
}
if (letterCloseBtn) {
  letterCloseBtn.addEventListener('click', () => {
    letterModal.classList.remove('is-open');
    letterModal.setAttribute('aria-hidden', 'true');
  });
}
if (letterBackdrop) {
  letterBackdrop.addEventListener('click', () => {
    letterModal.classList.remove('is-open');
    letterModal.setAttribute('aria-hidden', 'true');
  });
}

// Interactive Wish Candle, Sawaari & Confetti
if (blowWishBtn) {
  blowWishBtn.addEventListener('click', () => {
    sound.playCandleBlowAndConfetti();
    if (candleFlame) candleFlame.classList.add('is-out');
    if (candleSmoke) candleSmoke.classList.add('is-active');

    // Grand multi-stage celebratory fireworks and dual confetti cannons
    celebration.grandCelebration();

    // Sawaari: Floating festive balloons & celebration charms parade
    sawaari.launch();

    // Cake celebratory pulse aura
    const cakeVisual = $('cakeVisual');
    if (cakeVisual && !cakeVisual.querySelector('.cakeAuraPulse')) {
      const aura = document.createElement('div');
      aura.className = 'cakeAuraPulse';
      cakeVisual.appendChild(aura);
    }

    if (wishCelebrationNote) wishCelebrationNote.classList.add('is-shown');

    // Triumphant button transformation
    blowWishBtn.classList.add('is-blown');
    blowWishBtn.innerHTML = `
      <span class="blowWishBtn__icon">🎉</span>
      <span class="blowWishBtn__text">Wish Sent to the Universe! 🥳</span>
    `;
    blowWishBtn.style.pointerEvents = 'none';
  });
}

// Sound Toggle
if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    soundToggle.classList.toggle('is-muted', isMuted);
    soundToggle.classList.toggle('is-playing', !isMuted);
    soundIcon.textContent = isMuted ? '🔇' : '🎵';
    soundLabel.textContent = isMuted ? 'Sound: Off' : 'Sound: On';
    if (!isMuted && played) sound.startBgm();
  });
}

/* ============================================================
   SIZING + BOOT
   ============================================================ */
function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildSprites();
  buildScene();
  if (reduceMotion){ drawFinal(); return; }
  if (window.bdayDone){
    drawFinal();
    return;
  }
  if (played && filmTL){
    const at = filmTL.time(); const active = filmTL.isActive();
    if (active) {
      filmTL = buildFilm(shotGeom());
      filmTL.play(at);
    } else {
      drawFinal();
    }
  } else {
    refreshRig(); setDraw(0);
  }
}

window.drawFinal = drawFinal;
let resizeRAF = 0;
window.addEventListener('resize', () => {
  if (resizeRAF) return;
  resizeRAF = requestAnimationFrame(() => { resizeRAF = 0; resize(); });
});

// Initialize with configured palette (default: 'friend')
applyPalette(CURRENT_THEME);

// Initialize interactive memories album & keepsakes
initMemories();

resize();

if (reduceMotion){
  drawFinal();
} else {
  buildMotes();
  document.fonts && document.fonts.ready.then(() => { refreshRig(); setDraw(0); });
  enter();
  replay.addEventListener('click', resetAll);
}

if (isRecord){
  window.bdayAPI = {
    start(){ autoFire(); },
    replay(){ resetAll(); },
  };
}
