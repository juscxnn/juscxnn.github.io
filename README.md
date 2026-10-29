# juscxnn.github.io

Personal landing page for Justin Chua. Astro, fully static, no client-side framework.

Live: https://justinxa.com (Vercel) · https://juscxnn.github.io (GitHub Pages)

## What's in here

- `/` — single-screen spec sheet: now, receipts, writing, about. No scroll at 360–1440px wide.
- `/studies/` — essay index + 9 long-form studies.
- `/write/` — private composer (password-gated) that commits new studies to this repo via the
  GitHub API. The page hash lives in `src/pages/write.astro`; change it there.
- `public/contact.vcf` — save-contact card linked from the footer.
- `public/og.png` — 1200×630 social card (bone, forest mark). Regenerate by rendering an HTML
  card at `--window-size=1200,630` with headless Chrome.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview
```

## Deploy

Push to `main`. Both happen automatically:

- **GitHub Pages** — `.github/workflows/deploy.yml` builds with `withastro/action@v3`
  (Node 22). One-time setup: repo Settings → Pages → Source → **GitHub Actions**.
- **Vercel** — project `juscxnn-github-io` is git-linked to this repo; `justinxa.com` points at it.

## Notes

- Zero client JS except the theme toggle, the EN/繁中 toggle, and the JCXA copy chip.
- System font stack; no webfont downloads.
- `astro build` must stay warning-free — the Astro compiler rejects `{expr}` inside `<script>`
  tags, so page config is passed via `<script type="application/json" set:html>` blocks.
