/* fireworks.js — periodic rocket + bloom fireworks on its own canvas */
(function (global) {
  "use strict";

  const { rand, pick, palette, setupCanvas, easeOutCubic, prefersReducedMotion } = global.Utils;

  class Rocket {
    constructor(w, h) {
      this.x = rand(w * 0.15, w * 0.85);
      this.y = h + 10;
      this.targetY = rand(h * 0.15, h * 0.45);
      this.speed = rand(7, 11);
      this.color = pick(palette);
      this.trail = [];
      this.dead = false;
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 12) this.trail.shift();
      this.y -= this.speed;
      this.speed *= 0.985;
      if (this.y <= this.targetY || this.speed < 1.5) {
        this.dead = true;
      }
    }

    draw(ctx) {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const a = (i / this.trail.length) * 0.6;
        ctx.globalAlpha = a;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  class Spark {
    constructor(x, y, color) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1.5, 7);
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1;
      this.fade = rand(0.012, 0.022);
      this.color = color;
      this.size = rand(1.5, 3);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.06; // gravity
      this.vx *= 0.985;
      this.vy *= 0.985;
      this.life -= this.fade;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  class FireworksSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = setupCanvas(canvas);
      this.rockets = [];
      this.sparks = [];
      this.running = false;
      this.rafId = null;
      this.nextLaunch = 0;
    }

    /** Manually trigger a single firework at a random x and target y. */
    triggerOne() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.rockets.push(new Rocket(w, h));
    }

    /** Trigger a firework at a specific x,y (used for click celebration). */
    triggerAt(x, y) {
      const color = pick(palette);
      const count = prefersReducedMotion() ? 30 : 80;
      for (let i = 0; i < count; i++) {
        this.sparks.push(new Spark(x, y, color));
      }
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.nextLaunch = performance.now() + rand(600, 1800);
      const loop = (now) => {
        if (!this.running) return;
        this._frame(now);
        this.rafId = requestAnimationFrame(loop);
      };
      this.rafId = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    _frame(now) {
      const ctx = this.ctx;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // schedule rockets
      if (now >= this.nextLaunch && this.rockets.length < 3) {
        this.rockets.push(new Rocket(w, h));
        this.nextLaunch = now + rand(1200, 3500);
      }

      // update + draw rockets
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const r = this.rockets[i];
        r.update();
        r.draw(ctx);
        if (r.dead) {
          // explode
          const burstCount = prefersReducedMotion() ? 40 : 110;
          for (let s = 0; s < burstCount; s++) {
            this.sparks.push(new Spark(r.x, r.y, r.color));
          }
          this.rockets.splice(i, 1);
        }
      }

      // update + draw sparks
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const s = this.sparks[i];
        s.update();
        s.draw(ctx);
        if (s.life <= 0) {
          this.sparks.splice(i, 1);
        }
      }

      // cap sparks to keep performance healthy
      if (this.sparks.length > 2000) {
        this.sparks.splice(0, this.sparks.length - 2000);
      }
    }
  }

  global.FireworksSystem = FireworksSystem;
})(window);
