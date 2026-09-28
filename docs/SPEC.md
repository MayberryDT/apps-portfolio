# tylermayberry.dev — specification

What must be true for the next round of work. The [plan](IMPLEMENTATION_PLAN.md)
owns order, authority and status. [COPYWRITING.md](../COPYWRITING.md) owns
audience and voice. [juice.md](../juice.md) owns the felt character.

## Problem

The personal studio is live, but Tyler's own work is scattered across
animasai.co subdomains. Animas is being relaunched as an ibara services company,
and the studio links into old animasai.co pages that the new Animas site will
not serve. The studio should become the home of everything Tyler makes. It stays
an experience first and keeps the work easy to reach.

## Outcomes

**1. The studio survives the new Animas site.** No studio page, script, image or
structured data depends on an animasai.co page or asset, apart from the
Animas homepage link itself. The pages concerned are `index.html`, `room.html`,
`about.html`, `press.html`, `profile-content.js`, `journal-content.json` and
`llms.txt`.
- Masthead, Pip and ChartStead point to their own domains.
- The Animas logo is either self-hosted or dropped.
- About and Press keep their URLs, titles, canonicals and readable content.

**2. Tyler's projects live at `name.tylermayberry.dev`.**
- These move: milk, dow (Decree of War), paycheck, inntouch, stayconnect,
  jobapps and txtsync (Nova Share).
- Each serves the same site as before at its new address.
- Its old animasai.co address answers with a permanent redirect (301 or 308)
  that keeps the path and query. `wargus.animasai.co` redirects to
  `dow.tylermayberry.dev`.
- Canonical tags and absolute URLs inside each project point to the new
  address. Where a Worker's source repository can't be found, only its domain
  and redirect change, never its code.

**3. Old addresses redirect to the right home.**
- rat-detective → ratdetective.online
- executioner and executionr → executionr.com
- masthead → usemasthead.com
- hub and resume → tylermayberry.dev
- portfolio already redirects.

**4. Every moved project has a way home.** A small, out-of-the-way mark in a
corner, like a watermark, links to https://tylermayberry.dev.
- It is clickable, reachable by keyboard and labelled for screen readers.
- It never covers content or controls, down to 320 px wide.
- It looks the same on every site; the studio's `tm.` monogram is the default
  candidate.

**5. Studio updates.**
- Projects: Milkbench links to its new address. Rat Detective links to
  ratdetective.online. "Wargus TypeScript" becomes **Decree of War** (name,
  alt text and copy; it may say it grew out of the Wargus port) and links to
  dow.tylermayberry.dev.
- The laptop's project order (Tyler, 2026-09-28; he is not picky about the
  middle): Rat Detective Online, Chartroom, ChartStead, Masthead, Pip, Hotel
  Cleaning Schedule, Executioner, Milkbench, Decree of War, then Helm last,
  because it is a work in progress. When ibara is added (outcome 6) it goes
  first. Nothing is removed, and no moved project is added unless Tyler asks.
- The entrance gets one small, subtle link that opens the laptop's Projects
  view and says what Tyler does. No menu and no plain-text version.
- A returning visitor lands straight in the room, while a first visit still
  sees the entrance. Clearing site data restores the entrance, and the room
  must work when browser storage is blocked.
- The Contact phone gains one quiet line about Animas, linking to animasai.co.
- The Notes page-turn sound stays on by default.

**6. ibara on the Omarchy monitor.** This starts only when Tyler says go, after
outcomes 1–5, and begins with rendered design options for him to choose from.
- ibara also becomes the first entry in the laptop's Projects list.
- At rest the monitor shows the Omarchy screensaver.
- Inspecting it shows agents actively working on an Omarchy desktop through
  ibara, with a short explanation and links to ibara.app and Animas.
- Reduced motion gets a still equivalent, and 3D or animation runs only while
  the monitor is inspected.

## Protected constraints

- The plan's [protected design](IMPLEMENTATION_PLAN.md#protected-design).
- Never touch the new Animas site (animasai.co apex and www) or the client work
  (listed in the Halla-only `docs/research/animasai-subdomains-2026-09-28.md`).
- The private tools, company demos and unclear sites taken offline on
  2026-09-28 stay offline. Their mapping is in `docs/research/animasai-offline-2026-09-28.json`
  (Halla-only).
- The old card site stays retired. See [AGENTS.md](../AGENTS.md).

## Exclusions

- Tyler does the Search Console follow-up himself.
- No new studio projects, menu, plain-text alternative or analytics tooling.
- Deleting the offline Workers' code is not part of this work.

## Verification

- **Every push:** the plan's release check.
- **Redirects:** for each old hostname, one request with a path and a query
  returns 301 or 308 to the exact new URL.
- **Moves:** each new subdomain serves the same key pages as its old host did
  before the move.
- **Home mark:** checked at 320, 390 and 1440 px, with keyboard focus and
  click-through.
- **Studio journeys, in a real browser through Ibara, on desktop and a phone
  viewport:**
  - entrance link → Projects view;
  - first visit versus returning visit;
  - Decree of War entry → dow;
  - Contact → the Animas line;
  - back and history.
- **Search identities:** titles, canonicals and JSON-LD on `/`, `/about.html`
  and `/press.html`, plus a scan for any remaining animasai.co page
  dependencies.
- **Limit:** no physical iPhone is available (the Helm phone is Android). Use
  WebKit at iPhone sizes and record the gap.

## Settled and open decisions

- Settled 2026-09-28: the project order above, and the home mark goes on the
  moved `name.tylermayberry.dev` projects only, not on products with their own
  domains.
- Open: the ibara monitor treatment, chosen by Tyler from rendered options
  when outcome 6 starts.
