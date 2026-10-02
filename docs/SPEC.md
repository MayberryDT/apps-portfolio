# tylermayberry.dev — specification

This file says what must be true when the current plan is done. The
[plan](IMPLEMENTATION_PLAN.md) owns order, authority and status.
[COPYWRITING.md](../COPYWRITING.md) owns audience and voice. [juice.md](../juice.md)
owns the felt character.

## Problem

The personal studio is live, but Tyler's own work is scattered across
animasai.co subdomains. Animas is relaunching as an ibara services company, and
the studio still links into old animasai.co pages that the new Animas site won't
serve. The studio should become the home of everything Tyler makes. It should
also feel even more like standing in his room. Experience comes first; the work
stays easy to reach.

## Outcomes

**1. The studio survives the new Animas site.**
- Nothing in the studio depends on an animasai.co page or asset except the
  Animas homepage link. This covers every page, script, image and piece of
  structured data: `index.html`, `room.html`, `about.html`, `press.html`,
  `profile-content.js`, `journal-content.json` and `llms.txt`.
- Masthead, Pip and ChartStead point to their own domains.
- The Animas logo is either self-hosted or dropped.
- Anything that describes Animas matches its relaunch as Tyler's company for
  ibara services.
- About and Press keep their URLs, titles, canonicals and readable content.
- `llms.txt` and `sitemap.xml` list the current project addresses.

**2. Tyler's projects live at `name.tylermayberry.dev`.**
- These move: milk, dow (Decree of War), paycheck, stayconnect and jobapps.
  InnTouch and Nova Share were taken offline instead (Tyler, 2026-09-28: “get
  rid of InTouch and NovaShare … just drop those”).
- Each serves the same site at its new address.
- Each old animasai.co address gives a permanent redirect (301/308) that keeps
  the path and query. `wargus.animasai.co` redirects to `dow.tylermayberry.dev`.
- Canonicals and absolute URLs inside each project use the new address.
- If a Worker's source repository can't be found, change only its domain and
  redirect, never its code.

**3. Old addresses redirect to their real homes.**
- rat-detective and admirable-pony → ratdetective.online
- executioner and executionr → executionr.com
- masthead → usemasthead.com
- hub and resume → tylermayberry.dev

**4. Every moved project has a way home.**
- A small corner mark, like a watermark and based on the studio's `tm.`
  monogram, sits on each moved project.
- On hover or focus it gently widens to read “Tyler Mayberry's studio”.
- Clicking it opens `https://tylermayberry.dev/?from=<project>`. The studio
  walks the visitor in and opens that project's window on the laptop.
- It is keyboard reachable, labelled for screen readers, and never covers
  content or controls, down to 320 px.
- Moved projects only. Products on their own domains don't get it.

**5. Studio updates.**
- **Projects:**
  - Milkbench and Decree of War link to their new addresses.
  - Rat Detective links to ratdetective.online.
  - "Wargus TypeScript" becomes **Decree of War**: name, alt text and copy. It
    may say it grew out of the Wargus port.
- **Project order (Tyler, 2026-09-28):**
  - ibara first (outcome 7), then Rat Detective Online, Chartroom, ChartStead,
    Masthead, Pip, Hotel Cleaning Schedule, Executioner, Milkbench, and Helm
    last.
  - Decree of War is removed from the studio for now (“just remove Decree of
    War for now. We'll deal with it later”); its site stays up, and so does
    its Notes page (“keep Decree of War in the notes”).
  - No other project is removed, and moved projects are not added.
- **Projects computer polish (Tyler's sweep):**
  - Every thumbnail and project window shows its whole image; nothing is
    cropped.
  - The grid fits image, name and category.
  - Each window leads with the description's first paragraph, with no
    repeated summary.
  - Rat Detective uses its current social image.
- **Project copy pass:** every entry says what it is, what Tyler did and one
  decision or reason, and links live. It's proofread, and facts come only from
  existing sources.
- **The quiet door:**
  - The entrance gains one small, subtle link, working wording “See what I've
    built →”. It fades in after the entrance settles.
  - Using it plays the normal walk-in, carries on to the desk, and wakes the
    laptop to Projects.
  - No menu and no plain-text version.
- **The room remembers:**
  - A returning visitor lands in the room, and the laptop reopens to the
    project they last viewed. A first visit still sees the entrance.
  - If storage is blocked or cleared, the visitor gets the first-visit
    behaviour and everything still works.
- **Cirlet on the Contact phone:** it appears as a contact entry, “Cirlet, my
  company”, linking to https://cirlet.com. There's no other sales content.
  (Until 2026-09-30 this was “Animas, my company” → animasai.co; animasai.co
  is becoming a separate small-business resource site.)
- **Notes:** the page-turn sound stays on by default.

**6. Room presence: sound and environment.**
- After Enter, the studio sounds and feels like being in Tyler's room.
- The full design, sound map, budgets and rules are in
  [plan/room-presence.md](plan/room-presence.md). Required:
  - a quiet outside-to-inside ambience that follows the walk in and back out;
  - area sound that follows the camera;
  - soft foley for every interactive object;
  - living light near the windows;
  - loading shown as part of the room, never a spinner;
  - one small, accessible sound control that remembers its setting.
- The overall level is modest (Tyler: “pretty loud … toned down a little”),
  and adjustable in one place (`VOLUME` in `room-audio.js`).
- Sound starts only after the Enter gesture. It never startles, loops audibly
  or plays in a hidden tab.
- Reduced motion stills the environment movement, but not the sound.

**7. ibara on the Omarchy monitor.**
- ibara is the first Projects entry.
- **Monitor behaviour (Tyler's second sweep, 2026-09-28):**
  - From the room, the monitor shows the Omarchy screensaver still.
  - As soon as the camera reaches the desk (“Projects”), agents appear on the
    monitor and work. The motion graphics show a tiled Omarchy desktop: a
    browser, a terminal of ibara tool calls, a spreadsheet and btop, each
    worked by its own agent with a colourful Cua cursor as on ibara.app.
  - The monitor's node reads **ibara**. Inspecting it zooms in on the agents,
    still working, with the **ibara** tab first.
  - The **Omarchy** tab brings the screensaver back; the ibara tab returns to
    the agents. Leaving the desk stops them.
- **No videos:** “I don't want real videos.” The panel copy calls it an
  illustration in the ibara.app demo's style, with links to ibara.app and
  Animas.
- **The screen fits the monitor:** the surface covers the photographed
  screen to its edge, so none of the photo's lit screen shows around it. It
  reads as lit glass, with glare and a vignette, not a flat overlay.
- Animation runs only at the desk and in a visible tab. Reduced motion gets a
  still.

**8. Optimization audit, then optimization.** Last, after 1–7:
- Audit the whole studio for load performance, runtime cost (CPU/GPU, memory,
  battery), transferred bytes, caching, audio weight and phone behaviour,
  using Lighthouse and WebKit at iPhone sizes on throttled networks.
- Record the findings in `docs/plan/optimization-audit.md`, fix what matters,
  and re-measure.
- No regression of the experience is allowed in the name of speed.

## Protected constraints

- The plan's [protected design](IMPLEMENTATION_PLAN.md#protected-design).
- Never touch the new Animas site (animasai.co apex and www) or the client work
  (listed in the Halla-only `docs/research/animasai-subdomains-2026-09-28.md`).
- The 20 hostnames taken offline on 2026-09-28 stay offline.
- The old card site stays retired. See [AGENTS.md](../AGENTS.md).
- Audio and footage must be CC0, royalty-free or Tyler's own, and credited on
  `model-credits.html` where required.

## Exclusions

- Search Console follow-up: closed. Tyler submitted the sitemap, and Google
  read it in late September 2026.
- New studio projects other than ibara.
- A menu or plain-text alternative.
- Analytics tooling.
- Deleting the offline Workers' code.

## Verification

- **Every push:** the plan's release check.
- **Redirects:** each old hostname, requested with a path and query, returns
  301/308 to the exact new URL.
- **Moves:** each new subdomain serves the same key pages its old host did.
- **Home mark:**
  - checked at 320, 390 and 1440 px, for focus and for click-through;
  - `?from=` opens the right project.
- **Studio journeys, in a real browser through Ibara, on desktop and a phone
  viewport:**
  - entrance link → walk-in → Projects;
  - first visit versus returning visit, including the remembered project and
    blocked storage;
  - Decree of War → dow, and Contact → Cirlet;
  - back and history.
- **Sound:**
  - no audio before Enter; the toggle works and persists;
  - no audio in hidden tabs;
  - levels checked by listening (a recorded capture per area);
  - iOS WebKit audio unlock.
- **Environment:**
  - reduced motion stills it;
  - no measurable frame drop at rest on a phone profile.
- **ibara:**
  - agents appear on arrival at the desk and keep working through
    inspection; the Omarchy tab brings the screensaver back;
  - nothing runs outside the desk or in a hidden tab;
  - reduced-motion still;
  - the surface's edges checked in zoomed crops of the rendered desk and
    monitor views, on desktop and a phone.
- **Search identities:**
  - titles, canonicals and JSON-LD on `/`, `/about.html` and `/press.html`;
  - no remaining animasai.co page dependencies.
- **Optimization:** before and after metrics recorded in the audit.
- **Limit:** there's no physical iPhone, so WebKit at iPhone sizes stands in,
  and the gap is recorded.

## Settled and open decisions

- **Settled 2026-09-28** (including Tyler's first sweep):
  - the project order;
  - home mark on moved projects only;
  - all seven juice ideas;
  - more quiet sounds and environment;
  - the implementer chooses the ibara treatment;
  - delivery runs to the end without pauses, then Tyler sweeps.
- **Open:** none. Tyler's end-of-run feedback may reopen specific choices.
