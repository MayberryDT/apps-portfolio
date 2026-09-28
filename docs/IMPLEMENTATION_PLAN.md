# tylermayberry.dev — living plan

Updated 2026-09-28. This file owns current state, authority and the next action.
Rewrite it in place. Do not add a ticket board or a second status file.
[Agent entry](../AGENTS.md) · [Project rules](agents/project-rules.md)

## Outcome

The personal studio is live and is the site. The ongoing outcome is to keep it
live and correct while making changes Tyler asks for, and never to regress to
the retired card site. A change is complete when the release check passes and
Tyler has reviewed anything visual.

## Execution boundary

- Source: GitHub `MayberryDT/apps-portfolio` (public), branch `master`. The
  Halla checkout `/home/halla/tylermayberry.dev` tracks `origin/master`.
- **A push to `master` is a production deploy.** Commit and push only when
  Tyler asks for that change. Deployable files are `public/`, `worker.js`,
  `wrangler.jsonc` and `package*.json`.
- Known-good rollback version: `28e7b995-6568-44d7-9154-8dc50a834756`, the
  2026-09-25 build of `e3d764e`. Update it after each verified release.
- The Halla-only records (see the evidence list) are listed in `.git/info/exclude`
  and must never be staged.
- No new objects, providers, automation or Netlify without Tyler.

## Protected design

The room is the website. Room and furniture views are photographic in one fixed
coordinate system. Only the selected object becomes 3D, and phones animate back
to rest on exit. Liquid-glass nodes and panels sit in the scene. There are no
conventional headers, footers or bottom menus. Back, Escape, history, keyboard,
touch and reduced motion all keep working. Original personal artwork, existing
links and the search identities stay as they are. The full contract is
invariants S1–S8 in `docs/design/studio-update-system.md` (Halla-only).

## Release check (every push to `master`)

1. `test -f public/room.html`. Then `git diff --stat origin/master -- public`
   must show only the intended files.
2. Record the active version: `npx --yes wrangler@4.131.1 deployments list`.
3. Push. Then check that the GitHub check “Workers Builds:
   product-portfolio-preview” succeeds.
4. From `public/`, confirm every served file matches live (about 1 minute):
   `git ls-files | grep -v -e '\.md$' -e '^\.assetsignore$' | while read -r f; do u="$f"; [ "$f" = index.html ] && u=""; [ "$(curl -s "https://tylermayberry.dev/$u" | sha256sum)" = "$(sha256sum < "$f")" ] || echo "DIFF $f"; done`
   Only intended files may print. `robots.txt` may carry a Cloudflare prefix.
5. Look at the rendered studio in a browser. An HTTP 200 alone is not proof.
   If it's broken, run `npx --yes wrangler@4.131.1 rollback <recorded id>`.

## Current work

- 2026-09-28 preparation:
  - Removed the old-site traps: re-pointed the Halla checkout onto `master`
    (working files untouched), removed the root card-site files, and deleted
    two old-site GitHub branches, all kept as tags.
  - Replaced the retired ticket board with this plan.
  - Added [COPYWRITING.md](../COPYWRITING.md) and [juice.md](../juice.md).
- Next action: none authorized. Wait for Tyler's next change request.

## Remaining outcomes

1. Search Console follow-through: submit the sitemap, inspect the key URLs,
   and compare against the recorded dates. Plan:
   `docs/research/seo-preservation-2026-09-13/launch-plan.md` (Halla-only).
2. Not scheduled; ask before starting:
   - a physical Android/Brave toolbar check;
   - the proposed shared object-inspection foundation (R19, never started).

## Blockers

- Search Console needs Tyler's signed-in Google session (through Ibara) and his
  go-ahead for account actions.

## Evidence and records

- Decisions (Chartroom): `decisions/tylermayberry-dev-personal-studio-direction`,
  `decisions/tylermayberry-dev-point-and-click-studio`,
  `decisions/tylermayberry-dev-cloudflare-hosting`.
- Halla-only (not on GitHub): `docs/design/` (studio design records),
  `docs/agents/studio-object-workflow.md`, `docs/tasks/personal-world.md`
  (retired board, history only), `docs/research/`, and `.design/` (release
  records for 2026-09-13 onward).
- History: tag `studio-dev-history-2026-09-13` (design checkpoints v1–v49, which
  are older studio builds and not current) and the Veelox backup at
  `/home/tyler/Projects/personal-studio/`. The 2026-09-13 launch, share, integration,
  favicon and hero release records were lost from disk around 2026-09-19. Their
  outcomes are live and summarized in the retired board.
