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
}
