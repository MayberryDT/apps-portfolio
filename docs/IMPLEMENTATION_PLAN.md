# tylermayberry.dev — living plan

Updated 2026-09-28. This file owns current state, authority and the next action.
Rewrite it in place. Do not add a ticket board or a second status file.
[Agent entry](../AGENTS.md) · [Spec](SPEC.md) · [Project rules](agents/project-rules.md)
· [COPYWRITING](../COPYWRITING.md) · [juice](../juice.md)

## Outcome

Deliver [spec](SPEC.md) outcomes 1–5, and outcome 6 when Tyler says go. The
studio becomes the home of everything Tyler makes and stays an experience
first. It must never regress to the retired card site. An outcome is complete
when its spec verification passes, the release check passes, and Tyler has
reviewed anything visual.

## Execution boundary

- **Mode: preparation complete; delivery not started.** Start on Tyler's
  explicit go. Outcome 6 needs a separate go.
- **Granted for delivery (Tyler, 2026-09-28):**
  - attach `name.tylermayberry.dev` custom domains to the moved projects'
    existing Workers;
  - switch only the moved animasai.co hostnames to permanent redirects;
  - commit and push studio changes to `master` using the release check;
  - fix and deploy the moved projects' own repositories.
- **Never:**
  - touch the new Animas site (animasai.co apex and www), `animas-ai`, or the
    client-work sites (list: Halla-only
    `docs/research/animasai-subdomains-2026-09-28.md`);
  - re-enable the 20 hostnames taken offline on 2026-09-28;
  - restore the old card site.
- **Source:** GitHub `MayberryDT/apps-portfolio` (public), branch `master`. The
  Halla checkout tracks `origin/master`. **A push to `master` is a production
  deploy.**
- Halla-only records are listed in `.git/info/exclude` and must never be staged.
- Rollback version: record the active version before each push. The last
  verified release is `ef40a1fd-c68a-4fa9-bda9-1511511fcaa4`, the build of
  `f1aeca4`.

## Protected design

The room is the website. Room and furniture views are photographic in one fixed
coordinate system. Only the selected object becomes 3D, and phones animate back
to rest on exit. Liquid-glass nodes and panels sit in the scene. There are no
conventional headers, footers or bottom menus; the single subtle entrance link
in spec outcome 5 is the agreed exception. Back, Escape, history, keyboard,
touch and reduced motion all keep working. Original personal artwork, existing
links and the search identities stay as they are. The full contract is
invariants S1–S8 in `docs/design/studio-update-system.md` (Halla-only).

## Development and release

- **Local preview:** from the repo root, run
  `npx --yes wrangler@4.131.1 dev --port 8787`. Verified 2026-09-28: it
  serves `public/` exactly as deployed.
- **Browser, visual and phone checks:** use Ibara (see the Halla agent
  instructions). There's no physical iPhone, so use WebKit at iPhone sizes.
- **Release check (every push to `master`):**
  1. `test -f public/room.html`. Then `git diff --stat origin/master -- public`
     must show only the intended files.
  2. Record the active version: `npx --yes wrangler@4.131.1 deployments list`.
  3. Push. Then check that the GitHub check “Workers Builds:
     product-portfolio-preview” succeeds.
  4. From `public/`, confirm every served file matches live:
     `git ls-files | grep -v -e '\.md$' -e '^\.assetsignore$' | while read -r f; do u="$f"; [ "$f" = index.html ] && u=""; [ "$(curl -s "https://tylermayberry.dev/$u" | sha256sum)" = "$(sha256sum < "$f")" ] || echo "DIFF $f"; done`
     Only intended files may print.
  5. Look at the rendered studio. If it's broken, run
     `npx --yes wrangler@4.131.1 rollback <recorded id>`.

## Current work

- 2026-09-28: preparation done.
  - Guard added.
  - The grill covered scope, messaging and feel.
  - Focused Monid research done.
  - COPYWRITING.md, juice.md and the spec written.
  - Offline: the private tools, company demos and unclear sites; mapping in
    `docs/research/animasai-offline-2026-09-28.json` (Halla-only).
  - Chartroom project signed off by Tyler.
- **Next action:** on Tyler's go, start spec outcome 1.

## Remaining outcomes

1. Studio links survive the new Animas site. **Time-sensitive:** see the risk
   below.
2. Projects move to `name.tylermayberry.dev` with redirects.
3. Other old addresses redirect to their real homes.
4. Home mark on the moved projects.
5. Studio updates: Decree of War, links, the entrance link, returning
   visitors, project order, the Animas line.
6. ibara on the Omarchy monitor and first in Projects. Separate go; rendered
   options first.

## Risks and blockers

- **Risk:** if the new Animas site is deployed before outcome 1 ships, the
  studio's Masthead, Pip and ChartStead links and the Animas logo break,
  because the new site has no `masthead.html`, `pip.html`, `chartstead.html` or
  `logo-mark-v2-lg.webp`.
- Tyler owns the Search Console follow-up.

## Evidence and records

- Decisions (Chartroom): `decisions/tylermayberry-dev-personal-studio-direction`,
  `decisions/tylermayberry-dev-point-and-click-studio`,
  `decisions/tylermayberry-dev-cloudflare-hosting`, and the 2026-09-28 grill
  facts on entity `tylermayberry-dev`.
- Research: `docs/research/audience-2026-09-28/` (Halla-only).
- Halla-only design and history:
  - `docs/design/`;
  - `docs/agents/studio-object-workflow.md`;
  - `docs/tasks/personal-world.md` (the retired board);
  - `.design/`;
  - tag `studio-dev-history-2026-09-13`, which holds older studio builds that
    are not current;
  - the Veelox backup at `/home/tyler/Projects/personal-studio/`.
