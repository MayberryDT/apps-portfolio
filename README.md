# Tyler Mayberry App Portfolio

Tyler Mayberry’s personal studio and project portfolio.

## Production

The live personal studio at `https://tylermayberry.dev` is served by the
Cloudflare Worker `product-portfolio-preview`. Its complete deployable site is
`public/`, with routing in `worker.js` and configuration in `wrangler.jsonc`.
The Worker also serves `www.tylermayberry.dev` and redirects the old
`portfolio.animasai.co` alias to the apex domain.

The existing Worker is connected to `MayberryDT/apps-portfolio` in **Workers &
Pages → product-portfolio-preview → Settings → Builds**. Its production branch
is `master`, root directory is the repository root, build command is empty, and
deploy command is `npx wrangler deploy`. The Worker name in `wrangler.jsonc`
matches the existing Worker.

The September 19 deployment of the old card site was rolled back. The current
`master` contains the reviewed `public/` tree that matches the live studio.
Keep the active Worker version ID for rollback before each release. A push to
`master` deploys through Workers Builds; check its build log, active version,
and live routes after a release. Cloudflare Web Analytics is injected by the
edge on the HTML pages; traffic and page views are under **Web Analytics** in
the Cloudflare dashboard.

Live site: https://tylermayberry.dev

## What This Shows

This repo is less about one large application and more about range: small shipped products, prototype interfaces, niche workflow tools, and creative technical experiments. It acts as a public index for projects that support job applications, consulting credibility, and conversations about practical AI-enabled product building.

## Current Positioning

Tyler builds practical AI systems, internal tools, automation workflows, and product prototypes. The portfolio collects examples across:

- AI-assisted productivity and execution systems.
- Hospitality and guest-experience tools.
- Credit/dispute workflow prototypes.
- Lightweight operational utilities.
- Creative web experiments and games.

## Notes

Some linked projects are live prototypes rather than maintained commercial products. They should be read as evidence of building, product judgment, and experimentation, not as traction claims.
