// Room presence: light that moves a little, the way it does in a real room
// (docs/plan/room-presence.md). Soft patches drift over the three places where
// the photograph already has sun: the left wall, the back wall and the floor.
// CSS-only motion in scene coordinates, so it zooms with the room; it stills
// under reduced motion and stays out of the way of every object.
const REGIONS = {
  left: 'polygon(0 205px,191px 259px,191px 567px,0 676px)',
  back: 'polygon(205px 278px,591px 278px,591px 483px,917px 483px,917px 615px,205px 615px)',
  floor: 'polygon(374px 658px,1086px 658px,1442px 736px,1442px 929px,917px 881px,398px 772px)'
};
const BOUNDS = {left: [0, 205, 191, 471], back: [205, 278, 712, 337], floor: [374, 658, 1068, 271]};
const CSS = `#room-light{position:absolute;inset:0;pointer-events:none;z-index:1}
#room-light .patch{position:absolute;inset:0;overflow:hidden}
#room-light .leaf{position:absolute;border-radius:50%;mix-blend-mode:soft-light;opacity:.34;will-change:transform;animation:room-leaf var(--d) ease-in-out var(--delay) infinite alternate}
#room-light .leaf.sun{background:radial-gradient(closest-side,rgba(255,236,196,.95),rgba(255,236,196,0))}
#room-light .leaf.shade{background:radial-gradient(closest-side,rgba(58,38,20,.9),rgba(58,38,20,0));opacity:.26}
@keyframes room-leaf{from{transform:translate(0,0) scale(1)}to{transform:translate(var(--dx),var(--dy)) scale(var(--s))}}
#room-light .mote{position:absolute;width:2.4px;height:2.4px;border-radius:50%;background:rgba(255,242,214,.85);box-shadow:0 0 3px rgba(255,236,200,.7);opacity:0;animation:room-mote var(--d) linear var(--delay) infinite}
@keyframes room-mote{0%{opacity:0;transform:translate(0,0)}15%{opacity:var(--o)}85%{opacity:var(--o)}100%{opacity:0;transform:translate(var(--dx),var(--dy))}}
#room-light .motes{transition:opacity 1.2s ease}
body:not([data-area=room]) #room-light .motes,body[data-focused=true] #room-light .motes{opacity:0}
@media(prefers-reduced-motion:reduce){#room-light{display:none}}
.loading-ring{border:0!important;width:12px!important;height:12px!important;border-radius:50%!important;background:radial-gradient(circle,#ffe6b8 0,#eaa95e 55%,rgba(234,169,94,0) 72%)!important;animation:loading-warm 1.8s ease-in-out infinite alternate!important}
@keyframes loading-warm{from{opacity:.45;transform:scale(.85);box-shadow:0 0 4px 1px rgba(255,196,120,.2)}to{opacity:1;transform:scale(1.06);box-shadow:0 0 12px 4px rgba(255,196,120,.45)}}
@media(prefers-reduced-motion:reduce){.loading-ring{animation:none!important;opacity:.9}}`;

function rand(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

export function addRoomLight(scene) {
  if (!scene || scene.querySelector('#room-light')) return;
  const style = document.createElement('style'); style.textContent = CSS; document.head.append(style);
  const layer = document.createElement('div'); layer.id = 'room-light'; layer.setAttribute('aria-hidden', 'true');
  const r = rand(20260928);
  for (const [name, clip] of Object.entries(REGIONS)) {
    const patch = document.createElement('div'); patch.className = 'patch'; patch.style.clipPath = clip;
    const [x, y, w, h] = BOUNDS[name];
    const count = name === 'floor' ? 9 : 7;
    for (let i = 0; i < count; i++) {
      const leaf = document.createElement('i');
      const size = 70 + r() * 120;
      leaf.className = 'leaf ' + (i % 3 === 2 ? 'shade' : 'sun');
      Object.assign(leaf.style, {left: `${x + r() * w - size / 2}px`, top: `${y + r() * h - size / 2}px`, width: `${size}px`, height: `${size * (0.6 + r() * .5)}px`});
      leaf.style.setProperty('--d', `${7 + r() * 7}s`); leaf.style.setProperty('--delay', `${-r() * 10}s`);
      leaf.style.setProperty('--dx', `${(r() - .5) * 26}px`); leaf.style.setProperty('--dy', `${(r() - .5) * 14}px`);
      leaf.style.setProperty('--s', `${0.9 + r() * .25}`);
      patch.append(leaf);
    }
    layer.append(patch);
  }
  // Dust in the sunbeam, only in the wide room view.
  const motes = document.createElement('div'); motes.className = 'motes';
  for (let i = 0; i < 16; i++) {
    const m = document.createElement('i'); m.className = 'mote';
    Object.assign(m.style, {left: `${420 + r() * 900}px`, top: `${470 + r() * 330}px`});
    m.style.setProperty('--d', `${16 + r() * 16}s`); m.style.setProperty('--delay', `${-r() * 30}s`);
    m.style.setProperty('--dx', `${(r() - .3) * 60}px`); m.style.setProperty('--dy', `${(r() - .6) * 40}px`);
    m.style.setProperty('--o', `${0.25 + r() * .45}`);
    motes.append(m);
  }
  layer.append(motes);
  const details = scene.querySelector('#details');
  (details || scene.lastChild).after(layer);
}
