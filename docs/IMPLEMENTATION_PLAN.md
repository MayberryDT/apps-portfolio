# tylermayberry.dev — living plan

Updated 2026-10-01. This file owns current state, authority and the next action.
Rewrite it in place. Do not add a ticket board or a second status file.
[Agent entry](../AGENTS.md) · [Spec](SPEC.md) · [Project rules](agents/project-rules.md)
· [COPYWRITING](../COPYWRITING.md) · [juice](../juice.md)

## Outcome

Deliver every [spec](SPEC.md) outcome, 1–8, in one continuous run. Then Tyler
does a full sweep and gives feedback, and the feedback is applied. The studio
becomes the home of everything Tyler makes and feels even more like his room.
It must never regress to the retired card site.

## Execution boundary

- **Mode: delivered 2026-09-28.** New work needs Tyler's request. Tyler said “Okay, I set you loose. Please implement
  everything for me.” on 2026-09-28. The run started when Tyler said “set you
  loose” and then **does not pause**. The implementer makes all routine and
  creative choices within the spec and juice, including the ibara treatment.
  Tyler reviews at the end.
- **Granted (Tyler, 2026-09-28):**
  - attach `name.tylermayberry.dev` domains to the moved projects' Workers;
  - switch only the moved animasai.co hostnames to permanent redirects;
  - commit and push studio changes (a push to `master` deploys);
  - fix and deploy the moved projects' own repositories;
  - use Ibara for browser checks and the ibara recording.
- **Never:**
  - touch the new Animas site (apex and www), `animas-ai`, or the client-work
    sites (listed in the Halla-only
    `docs/research/animasai-subdomains-2026-09-28.md`);
  - re-enable the 20 hostnames taken offline;
  - restore the old card site;
  - publish private data in the ibara recording.
- **Release routes:**
  - **Outcomes 1–4 go live** as each is verified. They are link and domain
    work, and outcome 1 must beat the Animas deploy.
  - **Outcomes 5–8 are built on branch `studio-next`.** They're published as
    one preview version for Tyler's sweep (`wrangler versions upload`, or a
    non-production build), then merged to `master` after his feedback.
- **Source:** GitHub `MayberryDT/apps-portfolio` (public), branch `master`.
  The Halla checkout tracks it. Halla-only records are listed in
  `.git/info/exclude` and are never staged.
- **Reviews:** a separate reviewer agent checks the live infra work after
  outcome 4, and the full candidate before Tyler's sweep. Material findings
  are fixed before moving on.

## Protected design

- **The room is the website.** Room and furniture views are photographic in
  one fixed coordinate system. Only the selected object becomes 3D.
- **Phones** animate back to rest on exit.
- **UI:** liquid-glass nodes and panels sit in the scene. There are no
  conventional headers, footers or bottom menus. Two exceptions are agreed:
  - the single subtle entrance link (spec outcome 5);
  - the small sound control (outcome 6).
- **Always working:** Back, Escape, history, keyboard, touch and reduced
  motion.
- **Unchanged:** original personal artwork, existing links and the search
  identities.
- **Full contract:** invariants S1–S8 in `docs/design/studio-update-system.md`
  (Halla-only).

## Development and release

- **Stylesheet bundle:** `index.html` and `room.html` load `room-bundle.css`,
  which is 12 stylesheets joined in order. After editing any of them, run
  `python3 tools/build-room-bundle.py`. Otherwise the change never reaches
  visitors.
- **Local preview:** from the repo root, run
  `npx --yes wrangler@4.131.1 dev --port 8787`. Verified 2026-09-28: it serves
  `public/` exactly as deployed.
- **Browser, visual, audio and phone checks:** run them through Ibara. There's
  no physical iPhone, so use WebKit at iPhone sizes.
- **Release check** for every push to `master`:
  1. Run `test -f public/room.html`, then
     `git diff --stat origin/master -- public`. Only the intended files may
     appear.
  2. Record the active version:
     `npx --yes wrangler@4.131.1 deployments list`.
  3. Push, then check that “Workers Builds: product-portfolio-preview”
     succeeds.
  4. From `public/`, confirm every served file matches live:
     `git ls-files | grep -v -e '\.md$' -e '^\.assetsignore$' | while read -r f; do u="$f"; [ "$f" = index.html ] && u=""; [ "$(curl -s "https://tylermayberry.dev/$u" | sha256sum)" = "$(sha256sum < "$f")" ] || echo "DIFF $f"; done`
     Only intended files may print.
  5. Look at the rendered studio. If it's broken, run
     `npx --yes wrangler@4.131.1 rollback <recorded id>`.
- **When page copy changes,** update `sitemap.xml` `lastmod` and the page's
  JSON-LD `dateModified`. After editing About or Press, rebuild
  `profile-content.js` from them, so the Contact phone and Notes match the
  pages.

## Current work

- **Self-Hosted AI Agent added to Projects (Tyler, 2026-10-01).** The
  eleventh project, https://selfhostedaiagent.com/, sits after Milkbench and
  before Helm, in `projects.js`, the homepage list, the room's structured
  data and noscript list, and `llms.txt`.
- **Business renamed Cirlet (Tyler, 2026-09-30).** Animas is now Cirlet at
  https://cirlet.com/, and animasai.co and www redirect there. The studio
  names Cirlet, links cirlet.com and uses tyler@cirlet.com. Its JSON-LD
  Organization is `https://cirlet.com/#organization` with alternate names
  Animas and Animas AI. Project subdomains on animasai.co keep their
  addresses, and so does the `portfolio.animasai.co` alias. The Notes page
  about the earlier Animas AI site keeps its name.
- **SEO and AI-search pass (2026-09-28, Tyler: “do it all and ship it”):**
  - About, Press and the room copy lead with ibara. Masthead is no longer
    called the flagship.
  - Press gains four common questions and a note separating ibara.app from
    ibara.ai.
  - The homepage project list and the room's project data follow
    `projects.js`, and the structured data adds ibara and a line that tells
    Tyler apart from others with his name.
  - The entrance gains a role line on desktop and tablet, and its link has a
    larger tap area.
  - About and Press now load `room-bundle.css`.
  - `llms.txt` uses Markdown links. `robots.txt` declares Content Signals
    (`search=yes, ai-input=yes, ai-train=yes`), matching ibara.app. Tyler
    turned off Cloudflare's AI-crawler block; GPTBot, ClaudeBot and CCBot get 200.
  - The Worker adds security headers.
  - The audit is in the Halla-only `docs/research/seo-audit-2026-09-28/`.
  - **Still for Tyler:**
    - Search Console access for the SEO service account;
    - LinkedIn and GitHub profile text;
    - ibara.app's link to its GitHub repository, which returns 404.
- **All eight outcomes are live (2026-09-28).** After his second sweep Tyler
  said “go ahead and deploy … ship it”, with review fixes to follow the same
  way.
  - **Outcomes 1–4:** studio links survive the Animas relaunch. Seven projects
    moved to `name.tylermayberry.dev`, and old addresses redirect through
    `animasai-legacy-redirects` (`ops/legacy-redirects/`). The `tm-home-mark`
    Worker (`ops/home-mark/`) adds the corner mark; Decree of War has none,
    because its HUD uses every edge.
  - **Outcomes 5–8,** merged from `studio-next`:
    - **Monitor:** the surface fits the photographed screen, checked in zoomed
      renders. Agents appear when the camera reaches the desk. The node and
      panel read ibara; the Omarchy tab brings the screensaver back. Each
      window's agent has its own colourful Cua cursor, as on ibara.app. No
      videos.
    - **Projects computer:** whole images, a polished grid and windows.
    - **Content:** Rat Detective's new image. Decree of War is off Projects
      for now; its Notes page stays (Tyler).
    - **Contact:** opens with nothing left to download (4G phone 2.75 s →
      1.36 s).
    - **Sound:** 4.5 dB quieter. Tyler checked sound and the phone behaviour
      on his own phone.
- **Reviews:** both sweep rounds were independently reviewed, and every finding
  is fixed. One nit is left: the monitor surface overlaps the bezel by 1–5
  source pixels, which reads as bezel.
- **Next:** nothing is scheduled. New work starts from Tyler's request.

## Outcomes, in order

1. **Studio survives the new Animas site**, including Animas metadata and the
   discovery files. Live. Time-sensitive (see risks).
2. **Projects move to `name.tylermayberry.dev`**, with redirects. Live.
3. **Other old addresses redirect** to their real homes. Live.
4. **The home mark goes on the moved projects.** Live and reviewed.
5. **Studio updates:**
   - Decree of War, the new links, project order and copy pass;
   - the quiet door and the room remembering you;
   - Animas as a contact.

   Live.
6. **Room presence:** sound and environment, per
   [plan/room-presence.md](plan/room-presence.md). Live.
7. **ibara on the Omarchy monitor**, and first in Projects. Live.
8. **Optimization audit, then optimize.** Findings go in
   `plan/optimization-audit.md`. Live, after two sweeps by Tyler and the
   fixes from both.

## Risks and blockers

- **Ibara:** unavailable while it's being worked on. Tyler checks visuals
  and sound himself.

## Evidence and records

- **Decisions:**
  - Chartroom decisions `tylermayberry-dev-personal-studio-direction`,
    `…-point-and-click-studio` and `…-cloudflare-hosting`;
  - the 2026-09-28 facts on entity `tylermayberry-dev`.
- **Research:** `docs/research/audience-2026-09-28/` (Halla-only).
- **Halla-only history:**
  - `docs/design/`;
  - `docs/agents/studio-object-workflow.md`;
  - the retired board `docs/tasks/personal-world.md`;
  - `.design/`;
  - tag `studio-dev-history-2026-09-13` (older builds, not current);
  - the Veelox backup personal-studio folder.
- **Last verified release:** `646fd662-8287-4dc3-abaf-6307c3092203`, the build
  of `861bcdf` (Self-Hosted AI Agent added to Projects, 2026-10-01). Rollback
  target before it: `8956155f-f019-4562-85e5-4c319b9a6375`. smoke-studio.py
  49/49 locally and live; every served file matched live.
