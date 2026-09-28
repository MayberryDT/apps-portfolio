# Optimization audit (spec outcome 8)

This covers spec outcome 8: an audit of the `studio-next` candidate, then the
fixes it found. The [plan](../IMPLEMENTATION_PLAN.md) owns status. Measured on
2026-09-28. Released `master` (`b19a77b`) and the candidate were served side by
side with `wrangler dev`. Lighthouse 12 ran as mobile with simulated
throttling; production was also measured once.

## Results

| Page (Lighthouse mobile) | master | candidate before fixes | candidate after fixes |
|---|---|---|---|
| Entrance `/`: performance | 98 | 97 | 97–98 |
| Entrance LCP | 2.3 s | 2.5 s | 2.3 s (2 of 3 runs) |
| Entrance transfer | 863 KiB | 871 KiB | **570 KiB** |
| Room page `/room.html`: performance | 78 | 78 | **96** |
| Room page LCP | 5.7 s | 5.9 s | **2.5 s** |
| Room page transfer | 668 KiB | 675 KiB | **364 KiB** |
| Idle main thread in the room, per 10 s (1440 / 390 px) | 291 / 285 ms | 318 / 316 ms | same |

Production entrance before this release: performance 95, LCP 2.7 s, 893 KiB.
Response time, text compression and caching passed.

## Found and fixed

- **A 206 KB font for one icon.** The full `Lato-Regular` face had no
  `unicode-range`. The full-screen icon (⛶) sits outside the Latin subset, so
  every visit downloaded the full font for a glyph that Lato doesn't contain.
  The face now covers only scripts the subset lacks.
- **Omarchy monospace: 126 KB, now 28 KB.** It is subset to the 542
  characters the monitor actually draws, including the screensaver's scramble
  glyphs and the ibara desktop text. None was lost (checked with fontTools).
- **`room.html` loaded 14 stylesheets,** about 780 ms of render blocking. It
  now uses the same `room-bundle.css` as the entrance. The bundle is exact:
  `tools/build-room-bundle.py`. The room photo is `fetchpriority="high"`.
- **The entrance's critical path.** `hero.js` now loads the sound module in
  idle time instead of importing it. The audio context is still created inside
  the Enter click, which Safari requires.
- **Sound never competes with the room.** The arrival sounds load first at
  high priority; the beds and foley (about 700 KB) follow at low priority.

## Considered and left alone

- **Hero image savings (62–111 KB).** Lighthouse assumes a smaller display
  size. The hero uses `object-fit: cover`, so a portrait phone needs more
  height than the 1672×941 source has. It's a false positive.
- **Inlining `integrated-content.css` and `studio-fullscreen.css` (~150 ms).**
  Four pages share them. Inlining would add another hand-synced copy, the same
  drift risk as the three hero copies, and the entrance already scores 97–98.
- **Phone GLBs (`assets/contact-phone.glb`, `assets/helm-phone.glb`, ~2.5 MB
  each).** They are portable exports. The phones are built in code, and no
  runtime path fetches these files.
- **Mobile `weightlifting.glb` (1 MB, PNG texture).** The one mobile prop
  without a WebP texture. It is left unchanged until someone can look at it:
  the texture may be PNG on purpose.
- **Long-lived caching.** Assets revalidate with ETags. Long `max-age` needs
  content-hashed URLs, or new HTML could run against stale scripts after a
  deploy. That is a bigger build change, noted for later.

## Limits

- Lighthouse throttling is simulated. There was no real phone.
- Idle cost is main-thread time only. GPU compositing of the light layer on a
  real phone is not captured.
- Visual and listening checks through Ibara are still owed (see the plan's
  blockers).

Evidence is in the Halla-only `docs/research/studio-next-evidence/audit/`:
Lighthouse JSON for every run, plus `idle.json`.
