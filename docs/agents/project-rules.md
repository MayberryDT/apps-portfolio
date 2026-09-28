# Project rules

Standing rules for the personal studio. [Agent entry](../../AGENTS.md) explains
which site is current. The [plan](../IMPLEMENTATION_PLAN.md) owns current state.
The old card-grid rules (featured Masthead, supporting cards, grid areas) are
retired along with that site.

## Projects

- Projects live in the laptop's Projects collection. `public/projects.js` holds
  their order, names, descriptions, URLs and images (`public/assets/projects/`).
- **When asked to add a product, append a new project to that collection.**
  Never remove, replace or reorder existing projects unless Tyler asks.
  Chartroom was appended as the tenth project on 2026-09-19.
- Keep project URLs in `projects.js`. Do not copy them into other docs.
- Linked projects are prototypes and experiments, not traction claims. Label
  conceptual artwork as conceptual.

## Content and search

- The room is the website. See the plan's protected design list.
- Keep the search identities from the 2026-09-13 launch: `/`, `/about.html`
  and `/press.html` URLs, titles, canonicals, JSON-LD, readable page content,
  `robots.txt`, `sitemap.xml`, `llms.txt` and the Google verification file.
- Personal photos, biography and private research reach `public/` only after
  Tyler approves publishing them.

## Hosting

- Cloudflare Worker custom domains only. Netlify is forbidden unless Tyler asks
  for it in the current task.
