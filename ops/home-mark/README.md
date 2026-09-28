# Home mark for moved projects

A Cloudflare Worker in front of Tyler's projects at `name.tylermayberry.dev`.
It passes every request to the project's own Worker through a service binding
and adds the small `tm.` mark, which leads back to the studio
(`https://tylermayberry.dev/?from=<project>`), to HTML pages. Project code is
not modified. Spec outcome 4; see `docs/SPEC.md`. Deploy by hand from this
folder with `npx --yes wrangler@4.131.1 deploy`.

Operational note (2026-09-28): reassigning a custom domain with
`override_existing_origin` caused about 15 seconds of failed connections on that
hostname while it propagated. Switch the lowest-traffic site first and check each
one. The previous direct mapping is in the Halla-only
`docs/research/home-mark-switch-2026-09-28.json`.
