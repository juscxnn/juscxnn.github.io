# juscxnn.github.io

Justin Chua's site. Astro, static output, one canvas game.

Live: https://justinxa.com (Vercel) · https://juscxnn.github.io (GitHub Pages)

## Routes

- `/` — **The Climb**: a Doodle Jump through the timeline. Auto-bounce, steer with arrows /
  A-D / touch. Platform stamps are milestones; falling restarts the era. Installable PWA,
  works offline after first load. `?auto` enables the autopilot (used by headless smoke tests).
- `/about/` — the flat spec sheet (SEO + no-JS version of the same content).
- `/studies/` — essay index + long-form studies.
- `/write/` — private composer (password-gated) committing studies via the GitHub API. The
  page hash lives in `src/pages/write.astro`.

## Commands

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output in dist/
npm run preview
npm run test:world   # generator + physics checks (60 seeds)
```

## Structure

- `src/data/timeline.ts` — eras, milestone cards, pickups, EN/繁中 copy. Single source of truth.
- `src/data/site.ts` — links, email, handle.
- `src/game/` — engine (`engine.ts`), physics, seeded world generator (`world.ts`), paper-ink
  renderer, DOM UI overlays, WebAudio blips, localStorage save.
- `src/integrations/pwa.ts` — `astro:build:done` hook that emits `dist/sw.js` with a
  content-hashed precache list. Every deploy produces a new cache and deletes the old one.
- `public/manifest.webmanifest`, `public/icons/*` — install assets.

## Notes

- 33 KB of JS total; studies pages stay static HTML.
- The engine uses a fixed 60 Hz step; `draw()` samples CSS custom properties, so light/dark
  both work.
- Debug hooks are only enabled with `?auto`: `window.__snap()` and `window.__tick(frames)`.

## Deploy

Push to `main`:

- **GitHub Pages** — `.github/workflows/deploy.yml` (`withastro/action@v3`, Node 22).
- **Vercel** — project `juscxnn-github-io` is git-linked; `justinxa.com` points at it.

After deploying, reload once so the new service worker takes over; the generated `sw.js`
precaches the fresh build and drops the previous cache on activate.
