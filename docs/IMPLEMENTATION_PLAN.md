# tylermayberry.dev — living plan

Updated 2026-09-28. This file owns current state, authority and the next action.
Rewrite it in place. Do not add a ticket board or a second status file.
[Agent entry](../AGENTS.md) · [Spec](SPEC.md) · [Project rules](agents/project-rules.md)
· [COPYWRITING](../COPYWRITING.md) · [juice](../juice.md)

## Outcome

Deliver every [spec](SPEC.md) outcome, 1–8, in one continuous run. Then Tyler
does a full sweep and gives feedback, and the feedback is applied. The studio
becomes the home of everything Tyler makes and feels even more like his room.
It must never regress to the retired card site.

## Execution boundary

- **Mode: delivery running.** Tyler said “Okay, I set you loose. Please implement
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

## Current work

- **Outcome 1 is live:** the Animas relaunch no longer breaks studio links (`d2f628e`).
- **Outcomes 2–3 are live:**
  - the seven projects serve at `name.tylermayberry.dev`, identical to before;
  - the old addresses redirect through the `animasai-legacy-redirects` Worker
    (source in `ops/legacy-redirects/`; rollback map in the Halla-only
    `docs/research/animasai-redirect-switch-2026-09-28.json`);
  - the studio links point to the new homes.
- **Kept on their old addresses, not redirected:** InnTouch (Firebase) and Nova
  Share (Supabase), so their logins can't break. See the blockers.
- **Outcome 4 is live:** the `tm-home-mark` Worker (`ops/home-mark/`) fronts all
  seven `name.tylermayberry.dev` projects.
  - It adds the corner mark to six of them and forces HTTPS. Pages are
    otherwise byte-identical, and z-index 1000 keeps each site's own dialogs
    on top.
  - **Decree of War** has no overlay, because its HUD uses every screen edge.
    A paused-only in-game link is ready on branch `studio-home-link` in the
    Decree of War repo, but not deployed; see blockers.
  - The `?from=` return lands with outcome 5.
- **Independent infra review:** all findings are fixed (the Decree of War
  overlay, z-index, the Animas Notes entry on `studio-next`, and this status).
- **Next:** outcome 5 is in progress on branch `studio-next`:
  - done: Decree of War, project order, copy pass, the quiet door, `?from=`,
    the room remembering you, and the Animas contact card with its
    re-rendered phone assets;
  - then outcomes 6–8.

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

   On `studio-next`.
6. **Room presence:** sound and environment, per
   [plan/room-presence.md](plan/room-presence.md). On `studio-next`.
7. **ibara on the Omarchy monitor**, and first in Projects. On `studio-next`.
8. **Optimization audit, then optimize.** Findings go in
   `plan/optimization-audit.md`. On `studio-next`. Then the candidate review,
   the preview for Tyler's sweep, his feedback, and the merge to `master`.

## Risks and blockers

- **Ibara:** it denies control to `claude-code-halla@halla`, so browser, visual
  and audio QA can't go through Ibara. Unblocks when Tyler grants this agent
  control in Ibara Access. Everything else continues, and the checks run
  once access exists.
- **InnTouch and Nova Share redirects:** to finish them, add
  `inntouch.tylermayberry.dev` to InnTouch's Firebase authorized domains and
  `txtsync.tylermayberry.dev` to Nova Share's Supabase redirect URLs, then add
  both to `ops/legacy-redirects`. Only Tyler has access to those consoles.
- **Decree of War's way home:** the live game was built from 82 uncommitted
  changes in its checkout. Deploying the clean commit would roll that work
  back. Merge branch `studio-home-link` into that work before its next deploy.
  The branch also stops the game claiming `dow.animasai.co`.
- **Repo configs that reclaim old hostnames:** Milk's untracked
  `wrangler.jsonc` on Veelox was edited to stop claiming `milk.animasai.co`.
  Other moved projects have no known source. If one is redeployed with an
  old animasai.co route, it takes that hostname back from the redirect Worker.
- Tyler owns the Search Console follow-up.

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
- **Last verified release:** `a0e66ddb-828c-44f9-b1dd-b4f4fd920fb2`, the build
  of `68b2150`.
