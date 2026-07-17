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

Real URLs are missing for these. They live in one place — the `TOKENS` object at the top of
`src/pages/index.astro`:

- `{{GATEKEEP_URL}}`
- `{{ATTITEUD_URL}}`
- `{{SIGNAL_URL}}`
- `{{HANDLESTACK_URL}}`
- `{{FDS_URL}}`
- `{{TELEGRAM_URL}}`

## Assets

- `public/portrait.jpg` — 3:4 portrait. If missing, the page renders a bone-colored placeholder
  block instead; the build never breaks.
- `public/og.png` — Open Graph image placeholder path referenced in meta tags. Not generated.
