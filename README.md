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

One real URL is still missing — the `LINKS` object at the top of `src/pages/index.astro`:

- `{{TELEGRAM_URL}}`

## Assets

- `public/logos/` — project marks pulled from each site's favicon (gatekeep.vc, attiteud.com,
  clique.tech; nichesim.svg is a vector redraw of their ⧉ mark — replace when they ship a favicon).
- `public/portrait.jpg` — 3:4 portrait. If missing, the page renders a bone-colored placeholder
  block instead; the build never breaks.
- `public/og.png` — Open Graph image placeholder path referenced in meta tags. Not generated.

Fonts are self-hosted via Fontsource (no third-party requests).
