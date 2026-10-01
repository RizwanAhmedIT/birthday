/* ============================================================
   CELEBRATION & INTERACTION SUITE
   - Fairy Stardust Cursor Trail
   - Confetti & Sparkler Fireworks Engine
   - Interactive Candle & Wish Mechanism
   - Wax-Sealed Letter Card Modal
   ============================================================ */

import { sound } from './audio.js';

export class StardustTrail {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.pointer = { x: -100, y: -100, active: false };
    this.lastSpawn = 0;
    this.raf = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindEvents();
    this.loop();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  bindEvents() {
    const onMove = (x, y) => {
      this.pointer.x = x;
      this.pointer.y = y;
      this.pointer.active = true;
      const now = performance.now();
      if (now - this.lastSpawn > 24) {
        this.lastSpawn = now;
        this.spawn(x, y, 2);
      }
    };

    window.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('pointerdown', (e) => {
      onMove(e.clientX, e.clientY);
      this.spawn(e.clientX, e.clientY, 8);
    }, { passive: true });
  }

  spawn(x, y, count = 2) {
    const colors = ['#fff8e7', '#ffd59e', '#ff9bb2', '#ffa372', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.8 + 0.3;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: Math.random() * 3.5 + 1.2,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.02,
        color: colors[(Math.random() * colors.length) | 0],
        sparkle: Math.random() > 0.4
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // slight gravity
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life * 0.9;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 6;

      if (p.sparkle) {
        // Draw 4-point sparkle star
        const s = p.size * p.life;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y - s * 1.5);
        this.ctx.quadraticCurveTo(p.x, p.y, p.x + s * 1.5, p.y);
        this.ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + s * 1.5);
        this.ctx.quadraticCurveTo(p.x, p.y, p.x - s * 1.5, p.y);
        this.ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - s * 1.5);
        this.ctx.fill();
      } else {
        // Soft glowing circle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    this.raf = requestAnimationFrame(() => this.loop());
  }
}

export class CelebrationFX {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.confetti = [];
    this.fireworks = [];
    this.running = false;
    this.raf = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  burst(originX = this.w * 0.5, originY = this.h * 0.45) {
    const colors = [
      '#ff4071', '#ff7096', '#fca311', '#ffd166',
      '#ff85a1', '#fbb1bd', '#ffdfba', '#e7c6ff', '#ffffff'
    ];

    // Metallic and soft paper confetti ribbons & shapes
    for (let i = 0; i < 160; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 4;
      this.confetti.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.6),
        vy: Math.sin(angle) * speed - Math.random() * 7,
        sizeW: Math.random() * 12 + 6,
        sizeH: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 16,
        color: colors[(Math.random() * colors.length) | 0],
        opacity: 1,
        isHeart: Math.random() > 0.65,
        drag: 0.96,
        gravity: 0.28
      });
    }

    // Secondary sparkle bursts
    for (let i = 0; i < 45; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 12 + 3;
      this.fireworks.push({
        x: originX,
        y: originY,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color: '#ffec99',
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        size: Math.random() * 3 + 1.5
      });
    }

    if (!this.running) {
      this.running = true;
      this.loop();
    }
  }

  drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  loop() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    // Update fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vx *= 0.97;
      fw.vy *= 0.97;
      fw.life -= fw.decay;

      if (fw.life <= 0) {
        this.fireworks.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = fw.life;
      this.ctx.fillStyle = fw.color;
      this.ctx.shadowColor = '#fff';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(fw.x, fw.y, fw.size * fw.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Update confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vx *= c.drag;
      c.vy += c.gravity;
      c.rotation += c.rotSpeed;

      if (c.y > this.h + 20) {
        this.confetti.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate((c.rotation * Math.PI) / 180);
      this.ctx.fillStyle = c.color;
      this.ctx.shadowColor = 'rgba(0,0,0,0.12)';
      this.ctx.shadowBlur = 4;

      if (c.isHeart) {
        this.drawHeart(this.ctx, 0, 0, c.sizeW);
      } else {
        this.ctx.fillRect(-c.sizeW / 2, -c.sizeH / 2, c.sizeW, c.sizeH);
      }
      this.ctx.restore();
    }

    if (this.confetti.length > 0 || this.fireworks.length > 0) {
      this.raf = requestAnimationFrame(() => this.loop());
    } else {
      this.running = false;
    }
  }

  /* High-velocity Confetti Cannon (e.g. from screen corners) */
  cannon(originX, originY, angleDeg = -60, spreadDeg = 45, count = 80, customColors = null) {
    const colors = customColors || [
      '#f59e0b', '#fbbf24', '#f43f5e', '#38bdf8', '#a855f7', '#34d399', '#ffffff', '#ffd166', '#ec4899'
    ];
    const baseAngle = (angleDeg * Math.PI) / 180;
    const spread = (spreadDeg * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      const speed = Math.random() * 20 + 8;
      this.confetti.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        sizeW: Math.random() * 13 + 6,
        sizeH: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 18,
        color: colors[(Math.random() * colors.length) | 0],
        opacity: 1,
        isHeart: Math.random() > 0.65,
        drag: 0.955,
        gravity: 0.3
      });
    }

    if (!this.running) {
      this.running = true;
      this.loop();
    }
  }

  /* Sparkler Fireworks Burst */
  firework(x, y, color = '#ffd166', count = 40) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 13 + 3.5;
      this.fireworks.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.012,
        size: Math.random() * 3.5 + 1.6
      });
    }
    if (!this.running) {
      this.running = true;
      this.loop();
    }
  }

  /* Grand Multi-Phase Celebration */
  grandCelebration() {
    // 1. Immediate Center Cake Confetti Burst
    this.burst(this.w * 0.5, this.h * 0.48);

    // 2. Dual Confetti Cannons from Bottom Corners
    setTimeout(() => {
      this.cannon(20, this.h - 10, -52, 40, 85);
      this.cannon(this.w - 20, this.h - 10, -128, 40, 85);
    }, 200);

    // 3. Staggered Sky Fireworks
    const fwColors = ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#f97316'];
    [350, 700, 1150, 1600].forEach((del, idx) => {
      setTimeout(() => {
        const x = this.w * (0.18 + 0.64 * Math.random());
        const y = this.h * (0.14 + 0.32 * Math.random());
        this.firework(x, y, fwColors[idx % fwColors.length], 45);
      }, del);
    });
  }
}

/* ============================================================
   SAWAARI / FESTIVE BALLOONS & CHARMS PROCESSION
   - Floating helium balloons with glossy highlights & strings
   - Floating celebratory emojis (🎈, 🥳, 🎁, ✨, 🫰, 🎂, 🥂)
   - Interactive popping on click/tap with sound and sparkles
   ============================================================ */
export class SawaariProcession {
  constructor(container, celebrationFX, audioManager) {
    this.container = container;
    this.celebrationFX = celebrationFX;
    this.sound = audioManager;
    this.activeElements = [];
  }

  launch() {
    if (!this.container) return;
    this.clear();

    const balloonThemes = [
      { bg: 'radial-gradient(circle at 35% 30%, #fda4af, #e11d48)', border: '#be123c' },
      { bg: 'radial-gradient(circle at 35% 30%, #fef08a, #d97706)', border: '#b45309' },
      { bg: 'radial-gradient(circle at 35% 30%, #7dd3fc, #0284c7)', border: '#0369a1' },
      { bg: 'radial-gradient(circle at 35% 30%, #d8b4fe, #7e22ce)', border: '#6b21a8' },
      { bg: 'radial-gradient(circle at 35% 30%, #6ee7b7, #059669)', border: '#047857' },
      { bg: 'radial-gradient(circle at 35% 30%, #fed7aa, #ea580c)', border: '#c2410c' },
      { bg: 'radial-gradient(circle at 35% 30%, #fbcfe8, #db2777)', border: '#9d174d' },
      { bg: 'radial-gradient(circle at 35% 30%, #fef9c3, #eab308)', border: '#ca8a04' }
    ];

    const charms = ['🎈', '🥳', '🎁', '🎂', '✨', '🫰', '🍰', '🌟', '🎊', '🥂', '💖'];

    // 1. Spawn floating helium balloons
    const isMobile = window.innerWidth < 768;
    const balloonCount = isMobile ? 12 : 18;

    for (let i = 0; i < balloonCount; i++) {
      const leftPercent = 3 + (94 / balloonCount) * i + (Math.random() * 5 - 2.5);
      const delay = 0.05 + Math.random() * 1.3;
      const duration = 3.6 + Math.random() * 1.8;
      const swayDuration = 1.8 + Math.random() * 1.0;
      const theme = balloonThemes[i % balloonThemes.length];
      const scale = isMobile ? (0.75 + Math.random() * 0.25) : (0.88 + Math.random() * 0.32);

      const item = document.createElement('div');
      item.className = 'sawaariItem';
      item.style.left = `${leftPercent}%`;
      item.style.setProperty('--rise-duration', `${duration}s`);
      item.style.setProperty('--rise-delay', `${delay}s`);

      const balloon = document.createElement('div');
      balloon.className = 'sawaariBalloon';
      balloon.style.background = theme.bg;
      balloon.style.borderColor = theme.border;
      balloon.style.setProperty('--sway-duration', `${swayDuration}s`);
      balloon.style.setProperty('--target-scale', scale);
      balloon.setAttribute('title', 'Tap to pop! 🎈✨');

      // Knot & String
      const knot = document.createElement('div');
      knot.className = 'sawaariKnot';
      const string = document.createElement('div');
      string.className = 'sawaariString';
      balloon.appendChild(knot);
      balloon.appendChild(string);
      item.appendChild(balloon);

      // Interactive popping
      const onPop = (e) => {
        e.stopPropagation();
        if (item.classList.contains('sawaariPopped')) return;
        item.classList.add('sawaariPopped');
        if (this.sound) this.sound.playBalloonPop();
        const rect = balloon.getBoundingClientRect();
        if (this.celebrationFX) {
          this.celebrationFX.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        setTimeout(() => item.remove(), 260);
      };

      item.addEventListener('pointerdown', onPop);
      this.container.appendChild(item);
      this.activeElements.push(item);

      // Auto-cleanup after floating off-screen
      setTimeout(() => {
        if (item.parentNode) item.remove();
      }, (delay + duration + 0.6) * 1000);
    }

    // 2. Spawn floating celebration charms
    const charmCount = isMobile ? 10 : 16;

    for (let i = 0; i < charmCount; i++) {
      const leftPercent = 5 + (90 / charmCount) * i + (Math.random() * 6 - 3);
      const delay = 0.1 + Math.random() * 1.5;
      const duration = 3.4 + Math.random() * 1.7;
      const swayDuration = 1.6 + Math.random() * 0.9;
      const charmChar = charms[i % charms.length];
      const scale = isMobile ? 0.85 : 1.0;

      const item = document.createElement('div');
      item.className = 'sawaariItem';
      item.style.left = `${leftPercent}%`;
      item.style.setProperty('--rise-duration', `${duration}s`);
      item.style.setProperty('--rise-delay', `${delay}s`);

      const charm = document.createElement('div');
      charm.className = 'sawaariCharm';
      charm.textContent = charmChar;
      charm.style.setProperty('--sway-duration', `${swayDuration}s`);
      charm.style.setProperty('--target-scale', scale);
      charm.setAttribute('title', 'Tap to celebrate! ✨');
      item.appendChild(charm);

      const onPop = (e) => {
        e.stopPropagation();
        if (item.classList.contains('sawaariPopped')) return;
        item.classList.add('sawaariPopped');
        if (this.sound) this.sound.playBalloonPop();
        const rect = charm.getBoundingClientRect();
        if (this.celebrationFX) {
          this.celebrationFX.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        setTimeout(() => item.remove(), 260);
      };

      item.addEventListener('pointerdown', onPop);
      this.container.appendChild(item);
      this.activeElements.push(item);

      setTimeout(() => {
        if (item.parentNode) item.remove();
      }, (delay + duration + 0.6) * 1000);
    }
  }

  clear() {
    this.activeElements.forEach(el => {
      if (el.parentNode) el.remove();
    });
    this.activeElements = [];
    if (this.container) this.container.innerHTML = '';
  }
}

