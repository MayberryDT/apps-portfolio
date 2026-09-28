# Room presence — sound and environment

Read this for [spec](../SPEC.md) outcome 6, and for any later work that touches
sound or ambient motion. The [plan](../IMPLEMENTATION_PLAN.md) owns status and
order. [juice.md](../../juice.md) owns why.

Goal: after Enter, you're standing in Tyler's room. You hear the quiet of the
place, the outside through the glass, and the soft physical sounds of the things
you pick up. The light moves a little, the way it does in a real room.

## Rules

- **Only things in the room make sound.** Glass UI, menus and nodes stay
  silent. Every sound belongs to an object, the room or the outside.
- **Quieter than you expect.** Sounds sit under speech level and never startle.
  Each one has 2–4 variations, played with a little random pitch and volume, so
  nothing repeats identically.
- **One room.** Every sound runs through one Web Audio graph, with a short
  reverb matching a small wooden room and a gentle master limiter. That makes
  everything sound like it's in the same place.
- **Beds never audibly loop.** Ambience beds are long (at least 60 s) with
  crossfaded loop points, or they're layered from shorter parts with offset
  lengths.
- **Sound follows the camera.** The zoom engine's current view sets which area
  sounds are more present. It ramps smoothly and follows the camera, not
  clicks.
- **Starting, stopping and control:**
  - Audio unlocks on the Enter gesture, including iOS.
  - It fades out on `visibilitychange` and fades back in when the tab returns.
  - One small, accessible sound control remembers its setting, as
    `journal-sound` does. It lives with the existing glass controls and has a
    label.
  - The Notes page-turn keeps its own setting and follows the master mute.
- **Default on.** Experience first (Tyler, 2026-09-28).

## Sound map

| Where | Sound | Trigger |
| --- | --- | --- |
| Entrance, before Enter | Silent (browsers block autoplay) | — |
| Enter and walk-in | Gravel footsteps, the sliding glass door opening, 2–3 soft steps on the wood floor. The outside (wind in trees, birds) crossfades to muffled as the door closes behind you. | Enter; the shortcut link |
| Outside return | The door slides, the outside opens up again, then fades | Outside |
| Room bed | Quiet room tone, outside muffled through the glass (brighter toward the right-side windows), and a rare faint wood creak | Always, in the room |
| Desk | Faint laptop fan and monitor hum up close; a trackpad click when a project opens; a soft key tap when a window opens or closes; a mouse click | Desk area; laptop actions |
| Omarchy / ibara | Fans rise gently while the agents work, and settle when you leave | At the desk while agents work (outcome 7) |
| Helm phone | A slide off the fabric mat, a small tick for the screen, a set-down tap back at rest | Pickup; screen actions; return |
| Contact phone | Lifted from the entry console with a faint jingle of the XMAX keys beside it; a soft tick between tabs; set down | Pickup; tabs; return |
| Bookshelf | Shaco: a vinyl-figure lift. Sonic/Dreamcast: a plastic lift. Baseball: a leather thump. Weightlifting item: a small metal knock. Student drawing: a paper rustle. Books: a spine sliding. | Inspect or put back |
| Photo wall | A frame tick and a soft paper sound as a story opens | Photo story |
| Reading corner | The chair creaks as you arrive, the book opens and closes, and the page turns (existing) | Area; Notes |

## Environment

- **Dappled window light.** Soft leaf shadows drift on the floor and wall near
  the windows. It's a single low-cost layer, synced loosely with the wind
  gusts in the bed. It's photographic and subtle, and stills under reduced
  motion.
- **Dust in the light.** A few motes drift in the sunbeam in the wider views
  only. The room stays photographic (S1), and there's no WebGL for this.
- **Loading is part of the room.** Replace the `loading-ring` spinner in
  `loading-feedback.js` with an in-scene cue: the selected object's glow
  warming up, with an `aria-live` label kept for screen readers.
- **Time of day (only if it looks photographic).** A warmer, lower light in the
  visitor's evening, using same-image edits with registration checked. Drop
  it if it looks like a filter; honest surfaces come first.
  **Dropped for now (2026-09-28):** it can't be checked visually until Ibara
  access exists.

## Sourcing and budget

- **Where sounds come from:** real recordings only. Prefer CC0 (e.g.
  Freesound's CC0 filter) or royalty-free libraries. Keep each file's source,
  licence and edits in a Halla-only sourcing note, and credit where required.
  Tyler can later swap in recordings of his own room.
- **Format:** Opus/WebM, with an AAC fallback for Safari.
- **Size:** about 1.5 MB in total, loaded after Enter. Beds stream, and
  foley loads with its area.
- **Levels:** normalize every file, then mix by ear in the actual room
  views. A capture per area goes into the evidence.

## As built (2026-09-28, `studio-next`)

- **Code:** `public/room-audio.js` for sound and `public/room-light.js` for
  light, dust and the loading ember.
- **Audio:** assets in `public/audio/`, 809 KB in total.
- **Credits:** sources are credited on `model-credits.html`. The full
  source record is in the Halla-only `docs/research/studio-next-evidence/sound-sources.json`.
- **Still owed:** a listening pass and a check on a real phone.

## Done when

The spec's sound, environment and journey checks pass, and a listening pass
has covered every area and every interaction. After that, the optimization
audit (outcome 8) confirms that phones see no regression.
