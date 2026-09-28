# Agent entry point — tylermayberry.dev

Keep this file short. The [plan](docs/IMPLEMENTATION_PLAN.md) owns current state,
authority, the next action and the release check.

## The live site is the personal studio. Never bring back the old card site.

- https://tylermayberry.dev is the photographic **personal studio**: a room you
  explore. It is served from `public/` by `worker.js` and `wrangler.jsonc`
  (Cloudflare Worker `product-portfolio-preview`).
- **Every push to `master` deploys to production** through Cloudflare Workers
  Builds. A push is a release. Follow the plan's release check.
- `master` is the only source of the site. On 2026-09-28 every file in
  `master@e3d764e` `public/` matched the live site byte for byte.
- The old **product-card index** (a grid of project cards led by Masthead) is
  retired. It exists only in tags `old-card-site-2026-08` and `old-site/*`, and
  in any commit before `0a051a7`. Never check out, restore, merge, copy from or
  deploy those. On 2026-09-19 a stale `master` auto-deployed the old site over
  the studio and had to be rolled back.
- Tell them apart: the studio has `public/room.html`, `public/app.js` and
  `public/projects.js`, and its hero reads “A Personal Studio”. The old site's
  homepage is a card grid, with no `room.html`.
- Before any git restore, checkout, reset, stash, merge, sync or deploy, check
  that the result keeps `public/room.html` and leaves `public/` matching live.
  If you cannot tell, stop and ask Tyler.
- The GitHub repository is public. Never commit personal source material or
  Halla-only development records.

## Read next

- [Plan](docs/IMPLEMENTATION_PLAN.md): current work, execution limits, protected
  design and the release/rollback check. [Spec](docs/SPEC.md): what must be true.
- [Project rules](docs/agents/project-rules.md): projects, content and search
  preservation.
- Creative or copy work: read [COPYWRITING.md](COPYWRITING.md) for audience and
  voice. Read [juice.md](juice.md) and only the directions relevant to the
  task. Use make-it-juicy to apply them. Update useful discoveries and stale
  guidance as part of that work.
- Studio object changes on Halla: the Halla-only
  [object workflow](docs/agents/studio-object-workflow.md).
