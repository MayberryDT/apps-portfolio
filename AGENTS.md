# Agent notes — apps-portfolio

The production personal studio is served from `public/` by `worker.js` using
`wrangler.jsonc`. Read the Production section of `README.md` before changing
its deployment workflow. A release must compare the complete public asset tree
and key routes with the active Worker, retain its version ID for rollback, and
verify the new active version and live routes after deployment. Keep private
source and agent instructions out of the served assets.

## Product cards

- The homepage is a curated product index (featured Masthead + supporting cards).
- **When asked to add a product: always append a new card.** Never remove or replace an existing card unless the user explicitly requests removal or a ranked rearrange.
- Prefer multi-row CSS grid areas over dumping every card into one horizontal row.
- Live ChartStead URL: https://chartstead.com
- Live Wargus TypeScript URL: https://wargus.animasai.co
- Live Hotel Cleaning Schedule URL: https://hotelcleaningschedule.com
- Deploy: Cloudflare Worker custom domains for tylermayberry.dev only.

## Current supporting cards (display order as of 2026-08-13)

1. ChartStead
2. Pip
3. Hotel Cleaning Schedule
4. Executioner
5. Milkbench
6. Wargus TypeScript
7. Rat Detective Online
