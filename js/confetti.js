/* confetti.js — particle confetti system on its own canvas */
(function (global) {
  "use strict";

  const { rand, randInt, pick, palette, setupCanvas, easeOutCubic, clamp } = global.Utils;

  const SHAPES = ["rect", "circle", "ribbon"];

  class Particle {
    constructor(w, h, originX, originY) {
      this.reset(w, h, originX, originY, true);
    }

    reset(w, h, originX, originY, initialBurst) {
      this.x = originX != null ? originX : rand(0, w);
      this.y = originY != null ? originY : rand(-h * 0.4, -10);
      this.w = rand(6, 14);
      this.h = rand(8, 18);
      this.shape = pick(SHAPES);
      this.color = pick(palette);
      this.vx = rand(-2.2, 2.2);
      this.vy = initialBurst ? rand(2, 7) : rand(1.5, 4.5);
      this.gravity = rand(0.04, 0.09);
      this.rotation = rand(0, Math.PI * 2);
      this.spin = rand(-0.18, 0.18);
      this.life = 1;             // 1 → 0
      this.fadeStart = rand(0.55, 0.85);
      this.fadeRate = rand(0.005, 0.012);
      this.wobble = rand(0, Math.PI * 2);
      this.wobbleSpeed = rand(0.02, 0.06);
      this.wobbleAmp = rand(0.4, 1.6);
    }

    update(w, h) {
      this.vy += this.gravity;
      this.wobble += this.wobbleSpeed;
      this.x += this.vx + Math.sin(this.wobble) * this.wobbleAmp;
      this.y += this.vy;
      this.rotation += this.spin;

      if (this.y > h * 0.7) {
        this.life -= this.fadeRate * 2;
      } else {
        this.life -= this.fadeRate * 0.4;
      }

      // gently decelerate horizontal drift
      this.vx *= 0.992;

      // respawn if fully faded or off-screen
      if (this.life <= 0 || this.y > h + 60) {
        this.reset(w, h, null, null, false);
        this.life = 1;
      }
    }

    draw(ctx) {
      const alpha = clamp(this.life, 0, 1);
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;

      if (this.shape === "rect") {
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      } else if (this.shape === "circle") {
        ctx.beginPath();
        const r = Math.max(2, this.w / 2);
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // ribbon — a thin tapered rectangle
        ctx.beginPath();
        ctx.moveTo(-this.w, 0);
        ctx.lineTo(0, -this.h / 2);
        ctx.lineTo(this.w, 0);
        ctx.lineTo(0, this.h / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  class ConfettiSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = setupCanvas(canvas);
      this.particles = [];
      this.maxParticles = 220;
      this.running = false;
      this.rafId = null;
      this.spawnInitial();
    }

    spawnInitial() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const initialCount = global.Utils.prefersReducedMotion() ? 40 : 140;
      for (let i = 0; i < initialCount; i++) {
        const p = new Particle(w, h, rand(0, w), rand(-h * 0.6, 0), true);
        this.particles.push(p);
      }
    }

    /** Burst particles from a specific x/y — used by click / button triggers. */
    burst(x, y, count) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      count = count || 80;
      if (global.Utils.prefersReducedMotion()) count = Math.floor(count / 3);
      for (let i = 0; i < count; i++) {
        const p = new Particle(w, h, x, y, true);
        const angle = rand(-Math.PI, 0);     // upward fan
        const speed = rand(4, 11);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 2;
        p.life = 1;
        this.particles.push(p);
      }
      // Cap total particles to keep perf in check
      if (this.particles.length > this.maxParticles) {
        this.particles.splice(0, this.particles.length - this.maxParticles);
      }
    }

    start() {
      if (this.running) return;
      this.running = true;
      const loop = () => {
        if (!this.running) return;
        this._frame();
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    _frame() {
      const ctx = this.ctx;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.update(w, h);
        p.draw(ctx);
      }
    }
  }

  global.ConfettiSystem = ConfettiSystem;
})(window);
