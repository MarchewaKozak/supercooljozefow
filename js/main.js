/* main.js — orchestrator: build title, start animation loops, wire up controls */
(function (global) {
  "use strict";

  const { ConfettiSystem, FireworksSystem, TextReveal, Utils } = global;

  // ===== Boot timestamp in footer =====
  function stampBootTime() {
    const el = document.getElementById("boot-time");
    if (!el) return;
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    el.textContent = `Deployed ${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
  }

  // ===== Background canvas: drifting gradient orbs =====
  class BackgroundCanvas {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = Utils.setupCanvas(canvas);
      this.orbs = [];
      this.spawn();
      this.running = false;
    }

    spawn() {
      const colors = [
        "rgba(139, 92, 246, 0.45)",   // violet
        "rgba(255, 93, 143, 0.40)",   // pink
        "rgba(96, 165, 250, 0.35)",   // blue
        "rgba(52, 211, 153, 0.30)",   // teal
        "rgba(251, 146, 60, 0.32)",   // orange
      ];
      const count = Utils.prefersReducedMotion() ? 2 : 5;
      for (let i = 0; i < count; i++) {
        this.orbs.push({
          x: Utils.rand(0, window.innerWidth),
          y: Utils.rand(0, window.innerHeight),
          r: Utils.rand(180, 360),
          vx: Utils.rand(-0.25, 0.25),
          vy: Utils.rand(-0.25, 0.25),
          color: colors[i % colors.length],
        });
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

    _frame() {
      const ctx = this.ctx;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // base fill
      ctx.fillStyle = "#06060e";
      ctx.fillRect(0, 0, w, h);

      // blur via shadow trick is expensive; instead use composite + radial gradient
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < this.orbs.length; i++) {
        const o = this.orbs[i];
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;

        const grd = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        grd.addColorStop(0, o.color);
        grd.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
  }

  // ===== Page lifecycle =====
  function init() {
    stampBootTime();

    // Build the title before revealing
    TextReveal.buildTitle();

    // Inject the rotating halo element (decorative)
    const halo = document.createElement("div");
    halo.className = "halo";
    document.body.appendChild(halo);

    // Boot canvases
    const bg = new BackgroundCanvas(document.getElementById("bg-canvas"));
    const confetti = new ConfettiSystem(document.getElementById("confetti-canvas"));
    const fireworks = new FireworksSystem(document.getElementById("fireworks-canvas"));

    bg.start();
    confetti.start();
    fireworks.start();

    // Initial big burst from the top center
    const w = window.innerWidth;
    confetti.burst(w / 2, 60, 140);
    // Trigger a firework shortly after page load
    setTimeout(() => fireworks.triggerOne(), 600);
    setTimeout(() => fireworks.triggerOne(), 1400);

    // Reveal title letters
    requestAnimationFrame(() => {
      // small delay so the transition has a starting state
      setTimeout(TextReveal.revealTitle, 80);
    });

    // ===== Controls =====
    const replayBtn = document.getElementById("replay-btn");

    function celebrateAgain(originX, originY) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = originX != null ? originX : w / 2;
      const y = originY != null ? originY : h * 0.35;

      // confetti burst from the click point
      confetti.burst(x, y, 120);
      // firework at the same point
      fireworks.triggerAt(x, y);
      // replay the letter reveal
      TextReveal.resetTitle();
    }

    replayBtn.addEventListener("click", (ev) => {
      const rect = replayBtn.getBoundingClientRect();
      celebrateAgain(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    // Click anywhere (except on interactive elements) to celebrate again
    document.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t.closest("button, a")) return;
      celebrateAgain(ev.clientX, ev.clientY);
    });

    // Tap on touch devices
    document.addEventListener("touchstart", (ev) => {
      const t = ev.target;
      if (t.closest("button, a")) return;
      const touch = ev.touches[0];
      if (touch) celebrateAgain(touch.clientX, touch.clientY);
    }, { passive: true });

    // Pause animations when the tab is hidden, to save battery / CPU
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        bg.stop();
        confetti.stop();
        fireworks.stop();
      } else {
        bg.start();
        confetti.start();
        fireworks.start();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
