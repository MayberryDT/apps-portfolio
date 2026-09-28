# tylermayberry.dev

Tyler Mayberry's personal studio: a photographic room you explore to find his
projects, interests, photos, notes and contact.

Live site: https://tylermayberry.dev

## Production

The live personal studio is served by the Cloudflare Worker
`product-portfolio-preview`. Its complete deployable site is `public/`, with
routing in `worker.js` and configuration in `wrangler.jsonc`. The Worker also
serves `www.tylermayberry.dev` and redirects the old `portfolio.animasai.co`
alias to the apex domain.

The Worker is connected to this repository in **Workers & Pages →
product-portfolio-preview → Settings → Builds**. The production branch is
`master`, the root directory is the repository root, the build command is empty
and the deploy command is `npx wrangler deploy`. **A push to `master` deploys.**
Before each release, keep the active Worker version ID for rollback. After it,
check the build log, the active version and the live routes. The full release
check is in the [plan](docs/IMPLEMENTATION_PLAN.md#development-and-release).
Cloudflare Web Analytics is injected at the edge on the HTML pages.

## The old card site is retired

Before September 2026 this repository served a grid of product cards. That site
is retired and must never be restored or deployed. It is kept only in tag
`old-card-site-2026-08`. On 2026-09-19 a stale `master` auto-deployed it over
the studio and had to be rolled back. Read [AGENTS.md](AGENTS.md) before any git
or deploy operation.

## Working on the site

- [AGENTS.md](AGENTS.md): entry point and old/new site guard.
- [Plan](docs/IMPLEMENTATION_PLAN.md): current state, limits and next action.
  [Spec](docs/SPEC.md): what the next round of work must deliver.
- [COPYWRITING.md](COPYWRITING.md): audience and voice.
  [juice.md](juice.md): creative direction.
- Linked projects are live prototypes and experiments, not traction claims.
