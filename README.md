# supercooljozefow

A single-page congratulations celebration site deployed to Cloudflare Pages.

Live URL: **https://supercooljozefow.pages.dev**

## What it does

On load:
- Animated gradient title (`Congratulations!`) revealing letter-by-letter
- Confetti continuously falling from the top of the page
- Periodic fireworks rocketing up from the bottom and exploding
- A drifting colorful orb background that responds to window size
- Click anywhere (or the "Celebrate again" button) to trigger a fresh burst

## Tech stack

Plain HTML, CSS, and vanilla JS — no framework, no build step, no dependencies.
Each concern lives in its own file:

```
index.html              # Page structure + script/style imports
css/reset.css           # Sane defaults + reduced-motion handling
css/main.css            # Layout, typography, color system
css/animations.css      # Keyframes (rise, gradientShift, haloSpin, shimmer)
js/utils.js             # Shared helpers (random, palette, canvas setup, throttle)
js/confetti.js          # ConfettiSystem — particle confetti on its own canvas
js/fireworks.js         # FireworksSystem — rockets + sparks on its own canvas
js/text-reveal.js       # Splits the title into letters and staggers the reveal
js/main.js              # Orchestrator: boot, controls, lifecycle
```

## Local dev

Just open `index.html` in a browser. No server needed.

## Deploy

Pushing to `main` triggers Cloudflare Pages to rebuild and deploy automatically.

## Accessibility

- Honors `prefers-reduced-motion`: animations are drastically shortened when the
  user has reduced motion enabled.
- All canvas elements are `aria-hidden="true"` and `pointer-events: none`.
- Focus-visible outlines are preserved on the CTA button.

---

## Auto-deploy test

This line was added to test the GitHub→Cloudflare Pages auto-deploy integration.
If a new deployment appears in the Cloudflare Pages dashboard within a minute
of this commit being pushed, the integration is working.
