# KitFit — Deployment Guide

This demo is **two deployments** that talk to each other:

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  streade-site  (static)     │  loads  │  KitFit  (Next.js, Vercel Pro)│
│  the storefront — THIS is    │ ──────▶ │  • /widget/kitfit.js          │
│  the demo link you share     │  calls  │  • /api/tryon  (generation)   │
│  widget embedded in 22 pages │ ──────▶ │  • Supabase + Gemini behind   │
└─────────────────────────────┘         └──────────────────────────────┘
```

- **KitFit** (`vinceree/kitfit`) — the backend + the embeddable widget JS. Needs serverless functions → **Vercel Pro** (the try-on route runs up to 800s).
- **streade-site** (`vinceree/streade-site`) — a static mirror of the storefront with the widget already injected. Deployed as a **static site** (no build). This URL is what you send around.

Updates: push to `kitfit` → Vercel redeploys backend + widget; the storefront picks up the new widget automatically (it loads `kitfit.js` from the KitFit domain). You only touch `streade-site` if the storefront HTML itself changes.

---

## Prerequisites

- A **Supabase** project (already exists) with:
  - migrations `001`–`004` applied (`supabase/migrations/`)
  - two **public** storage buckets: `product-images` and `tryon-temp`
  - URL + anon key + service-role key (Supabase → Project Settings → API)
- A **Gemini API key**.
- GitHub connected to Vercel.

---

## Part 1 — Deploy KitFit (Vercel Pro)

1. [vercel.com](https://vercel.com) → **Add New… → Project** → import `vinceree/KitFit`.
2. Make sure the team/project is on **Pro** (needed for the 800s function timeout).
3. Framework is auto-detected as **Next.js**. Leave Build & Output settings at defaults — the `build` script already builds the widget (`node widget/build.mjs && next build`).
4. **Production branch:** the repo default branch (`claude/kitfit-virtual-tryon-SDBgv`) — Vercel deploys it automatically.
5. Add **Environment Variables** (see `.env.example`):
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → leave as a placeholder for now (set in step 7)
6. **Deploy.** You'll get a URL like `https://kitfit-xxxx.vercel.app`.
7. Set `NEXT_PUBLIC_APP_URL` to that exact URL → **Redeploy** (it's a build-time value baked into the embed code, demo page, and widget default apiUrl).
8. Sanity check: open `https://kitfit-xxxx.vercel.app/widget/kitfit.js` — it should serve the widget JS.

---

## Part 2 — Deploy streade-site (Vercel, static)

The site uses **absolute paths** (`/products/…`), so it must be served from the **domain root**.

1. Vercel → **Add New… → Project** → import `vinceree/streade-site`.
2. Framework preset: **Other**. No build command.
3. **Root Directory:** `straede` (the actual site lives in that subfolder).
4. **Point the widget at the deployed KitFit URL.** The pages currently reference the old Codespaces URL. Replace it everywhere with your KitFit Vercel URL (no trailing slash):

   ```bash
   # run inside the streade-site repo
   OLD="https://miniature-fiesta-7vv77p5qr9rqcr5wj-3000.app.github.dev"
   NEW="https://kitfit-xxxx.vercel.app"
   grep -rl "$OLD" straede/ | xargs sed -i "s#${OLD}#${NEW}#g"
   git add -A && git commit -m "Point widget at deployed KitFit URL" && git push
   ```

5. **Deploy.** This URL (e.g. `https://straede-demo.vercel.app`) is the **demo link**.

---

## Update flow

- **Widget / backend change** → `git push` to `kitfit` → Vercel redeploys. Storefront updates automatically (no streade-site change needed).
- **Storefront HTML change** → `git push` to `streade-site` → its Vercel project redeploys.
- Non-production branches get their own preview URLs automatically.

---

## Notes / gotchas

- **CORS** is already wide-open in KitFit (`Access-Control-Allow-Origin: *`), so the cross-origin calls from the storefront work out of the box.
- **Mixed content:** some `data-kitfit-garment` values point to `http://straede.cc/…`. On an HTTPS demo these should be `https://` to avoid being blocked — fix with the same `sed` approach if needed.
- **Size:** streade-site is ~201 MB / ~3100 files. It deploys fine on Vercel; only the first upload is slow. The `products/` folder has duplicated scraped assets that could be trimmed later.
- **Stripe** is intentionally omitted for the demo. The billing page will be limited until Stripe env vars are set.
