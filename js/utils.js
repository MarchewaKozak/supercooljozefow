/* utils.js — small helpers used across modules */
(function (global) {
  "use strict";

  const Utils = {
    /** Random float in [min, max). */
    rand(min, max) {
      return Math.random() * (max - min) + min;
    },

    /** Random integer in [min, max] inclusive. */
    randInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /** Pick a random element from an array. */
    pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    /** Clamp a value into [min, max]. */
    clamp(v, min, max) {
      return Math.min(max, Math.max(min, v));
    },

    /** Linear interpolation. */
    lerp(a, b, t) {
      return a + (b - a) * t;
    },

    /** Map t (0..1) through an ease-out cubic curve. */
    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    },

    /** Map t (0..1) through an ease-in-out cubic curve. */
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    /** A canonical golden-pink-violet palette shared across modules. */
    palette: [
      "#ffd166",
      "#ff5d8f",
      "#8b5cf6",
      "#34d399",
      "#60a5fa",
      "#fb923c",
      "#f472b6",
    ],

    /** Set up a hi-DPI canvas sized to its CSS box. Returns the 2D context. */
    setupCanvas(canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ctx = canvas.getContext("2d");
      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener("resize", resize);
      return ctx;
    },

    /** Throttle a function to fire at most once per `wait` ms. */
    throttle(fn, wait) {
      let last = 0;
      let timer = null;
      return function throttled(...args) {
        const now = Date.now();
        const remaining = wait - (now - last);
        if (remaining <= 0) {
          if (timer) { clearTimeout(timer); timer = null; }
          last = now;
          fn.apply(this, args);
        } else if (!timer) {
          timer = setTimeout(() => {
            last = Date.now();
            timer = null;
            fn.apply(this, args);
          }, remaining);
        }
      };
    },

    /** Returns true if the user prefers reduced motion. */
    prefersReducedMotion() {
      return window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
  };

  global.Utils = Utils;
})(window);
