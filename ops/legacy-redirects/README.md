# animasai.co legacy redirects

A Cloudflare Worker that permanently redirects Tyler's old animasai.co project
addresses to their new homes (2026-09-28 move to `name.tylermayberry.dev`).
It is not part of the studio site. Deploy by hand from this folder with
`npx --yes wrangler@4.131.1 deploy`. The Workers Build for the studio
ignores it. The hostnames are attached as custom domains on the Worker. Never
attach the Animas site (apex, www) or client-work hostnames here.
