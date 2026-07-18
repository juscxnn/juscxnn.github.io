# juscxnn.github.io

Personal landing page for Justin Chua. Astro, fully static output, zero client-side JavaScript.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:4321
npm run build      # static build to dist/
npm run preview    # preview the production build locally
```

## Deploy

**GitHub Pages (default).** Push to `main` — `.github/workflows/deploy.yml` builds and deploys
automatically. One-time setup: repo Settings → Pages → Source → **GitHub Actions**.

**Vercel / Cloudflare Pages (alternative).** Framework preset: Astro. Build command
`npm run build`, output directory `dist`.

## Tokens to fill

None. Telegram was removed until a real handle exists — the deal-sheet CTA routes to email.
To restore it, add a `TELEGRAM` entry to `LINKS` in `src/pages/index.astro`.

## Assets

- `public/shots/` — product screenshots (headless Chrome, 560w JPEG). Re-capture when the sites
  change.
- `public/logos/` — project marks pulled from each site's favicon (gatekeep.vc, attiteud.com,
  clique.tech; nichesim.svg is a vector redraw of their ⧉ mark — replace when they ship a favicon).
- `public/og.png` — generated 1200×630 Open Graph card.
- `public/portrait.jpg` — 3:4 portrait, optional. Missing file falls back to the asterisk mark;
  the build never breaks.

Fonts are self-hosted via Fontsource (no third-party requests).
