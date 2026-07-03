# HUFT Fit Finder Portal — v2.0 Deploy Notes

Single-file static app (React 18 UMD + Babel standalone — same pattern as the CRM Engine frontend). No build step.

## Deploy to Vercel

```bash
# unzip into a fresh folder — do NOT drop this inside an existing project clone
cd ~/Desktop
mkdir huft-fit-finder && cd ~/Desktop/huft-fit-finder
unzip ~/Downloads/huft-fit-portal-v2.zip -d .

# deploy (static, zero config)
cd ~/Desktop/huft-fit-finder
vercel --prod
```

Or push to a new repo in HUFT-EPPL and import in the Vercel dashboard — framework preset: **Other**, no build command, output dir: root.

## What's stored where
- **Saved products** and **team feedback** live in each user's browser localStorage.
- Both tabs have **Export JSON** — collect exports from the team to consolidate feedback.
- Upgrade path to shared storage: swap the `store` object (bottom of index.html has notes) for your self-hosted Supabase — two tables, `fit_products` and `fit_feedback`.

## Data model quick reference
- Confidence tiers per dimension: **A** ±2–3 cm (published standard / measured study) · **B** ±4–6 cm (aggregated sizing charts) · **C** ±8 cm+ (estimate — fit-lab validation needed).
- Behaviour scores per breed: pull force, energy, escape risk (1–5) + recommended clip/gear + hardware spec by pull class.
- The feedback loop is the mechanism for promoting C-tier native-breed estimates to A-tier once fit-lab measurements come in.
