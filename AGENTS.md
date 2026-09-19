# Agent notes — apps-portfolio

## Production deployment hold — 2026-09-19

The public `tylermayberry.dev` Worker serves the newer personal studio, **not**
the static card site on this `master` branch. A push from this branch replaced
the studio on 2026-09-19; Worker version
`4e657500-50f9-452b-8292-efbadeb43ffe` was restored. The sole Cloudflare
Workers Builds trigger for `product-portfolio-preview` was removed and must
remain absent while source and production diverge.

Do not deploy this checkout, re-enable a GitHub build trigger, or treat a green
HTTP status as proof of the right site. Before any future production release,
read the current studio guidance at `/home/halla/tylermayberry.dev/AGENTS.md`,
identify the active Worker version, compare the candidate's complete public
asset manifest and key room/portfolio routes against the live studio, and use
that project's reviewed release procedure. Reconcile the studio into a clean
repository revision before considering automatic deployment. Preserve the
last-known-good Worker version for rollback. A Git push alone is never a
portfolio release while this hold is in force.

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
