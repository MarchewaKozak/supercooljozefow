/* text-reveal.js — split the title into letters and stagger their reveal */
(function (global) {
  "use strict";

  /**
   * Splits the text content of #title into per-letter <span class="letter">.
   * Spaces become <span class="space">.</span>.
   * Each letter receives an inline transition-delay so the reveal cascades
   * left-to-right.
   */
  function buildTitle() {
    const title = document.getElementById("title");
    if (!title) return;

    const text = "Congratulations!";
    const frag = document.createDocumentFragment();

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === " ") {
        const span = document.createElement("span");
        span.className = "space";
        span.innerHTML = "&nbsp;";
        frag.appendChild(span);
      } else {
        const span = document.createElement("span");
        span.className = "letter";
        span.textContent = ch;
        // Stagger each letter 60ms after the previous
        span.style.transitionDelay = `${300 + i * 60}ms`;
        frag.appendChild(span);
      }
    }
    title.appendChild(frag);
  }

  function revealTitle() {
    const letters = document.querySelectorAll(".title .letter");
    letters.forEach((l) => l.classList.add("is-in"));
  }

  function resetTitle() {
    const letters = document.querySelectorAll(".title .letter");
    letters.forEach((l, i) => {
      l.classList.remove("is-in");
      // Re-stagger for replay so the reveal re-runs left-to-right
      l.style.transitionDelay = `${i * 60}ms`;
    });
    // Force reflow so the next class addition triggers the transition
    void document.body.offsetWidth;
    requestAnimationFrame(() => {
      letters.forEach((l) => l.classList.add("is-in"));
    });
  }

  global.TextReveal = {
    buildTitle,
    revealTitle,
    resetTitle,
  };
})(window);
