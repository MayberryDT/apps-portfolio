/* Own only hero availability, entry animation and the room/hero boundary.
   app.js remains the room's route, content, input and inspection owner. */
const hero = document.querySelector('#hero');
const outside = document.querySelector('#outside');
const identity = document.querySelector('.hero-identity');
const world = document.querySelector('#world');
const image = document.querySelector('#hero-art');
const enter = document.querySelector('#hero-enter');
const notice = document.querySelector('#hero-notice');
const status = document.querySelector('#hero-status');
const skip = document.querySelector('#hero-skip');
const cancel = document.querySelector('#hero-cancel');
const retry = document.querySelector('#hero-retry');
const fallback = document.querySelector('#hero-fallback');
const live = document.querySelector('#hero-live');
const enterLabel = enter.querySelector('span');
let loadingFeedback;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let sequence = 0;
let boot;
let roomStyles;
function loadRoomStyles(){
  if(!roomStyles){
    roomStyles=Promise.all([...document.querySelector('#room-styles').content.children].map(source=>new Promise((resolve,reject)=>{
      const link=source.cloneNode(true);link.onload=resolve;link.onerror=()=>reject(new Error('Room styles unavailable'));
      document.head.insertBefore(link,document.querySelector('#hero-critical'));
    })));
  }
  return roomStyles;
}
let needsFreshLoad = false;
let animations = [];
let skipMotion = false;
let pendingTarget = '#room';
let phase = 'hero';
const isExterior = () => !location.hash || location.hash === '#hero';

function setPhase(value) {
  phase = value;
  document.body.dataset.arrival = value;
}
function clearAnimations() {
  for (const animation of animations) animation.cancel();
  animations = [];
}
function resetFeedback() {
  clearTimeout(loadingFeedback);
  enterLabel.textContent = 'Enter';
  enter.removeAttribute('aria-busy');
  live.textContent = '';
  skip.hidden = true;
  cancel.hidden = true;
  cancel.textContent = 'Back to exterior';
  outside.removeAttribute('aria-disabled');
}
function showNotice(message, mode) {
  status.textContent = message;
  notice.hidden = false;
  skip.hidden = mode !== 'loading';
  cancel.hidden = mode !== 'loading';
  retry.hidden = mode !== 'error';
  fallback.hidden = mode !== 'error';
  fallback.href = `room.html${pendingTarget}`;
}
function showExterior({focus = false} = {}) {
  sequence++;
  clearAnimations();
  resetFeedback();
  setPhase('hero');
  world.inert = true;
  world.setAttribute('aria-hidden', 'true');
  hero.hidden = false;
  hero.inert = false;
  enter.removeAttribute('aria-disabled');
  notice.hidden = true;
  document.title = 'Tyler Mayberry | AI Systems Builder & Practical Product Engineer';
  if (hero.classList.contains('image-unavailable')) {
    showNotice('The exterior image is unavailable. You can still enter the studio.', 'image');
  }
  if (focus) enter.focus({preventScroll:true});
}
function cancelEntry() {
  if (phase === 'leaving') {
    sequence++;
    if (isExterior()) history.replaceState(null, '', '#room');
    revealRoom();
    return;
  }
  // A cancelled direct URL must become an exterior URL before cached boot ends.
  if (!isExterior()) history.replaceState(null, '', '#hero');
  showExterior({focus:true});
  if (window.studio?.state.ready) window.studio.prepareRoute();
}
async function loadRoom() {
  if (!boot) {
    const plate = document.querySelector('#plate');
    if (plate.dataset.src) {
      plate.src = matchMedia('(max-width:700px)').matches ? 'scenes/overview-phone.webp' : plate.dataset.src;
      delete plate.dataset.src;
    }
    boot = loadRoomStyles().then(()=>import('./app.js')).then(async () => {
      if (!await window.studio.initialized) throw new Error('Room initialization failed');
      return window.studio;
    });
  }
  let timer;
  try {
    return await Promise.race([
      boot,
      new Promise((_, reject) => {timer = setTimeout(() => reject(new Error('Room loading timed out')), 25000);})
    ]);
  } finally { clearTimeout(timer); }
}
// Preparation never changes routes, focus, or hero visibility. Failed speculative
// work stays silent; the explicit entry path owns recovery. Keep the complete
// photographic composite intact and leave inspection models to the room.
function prepareRoom() {
  if (boot || document.hidden) return;
  loadRoom().catch(() => {});
}
enter.addEventListener('pointerenter', prepareRoom);
enter.addEventListener('focus', prepareRoom);
async function prepareAfterHeroPaint() {
  try { await image.decode(); } catch { return; }
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (navigator.connection?.saveData) return;
  if ('requestIdleCallback' in window) requestIdleCallback(prepareRoom, {timeout:1000});
  else setTimeout(prepareRoom, 200);
}
function revealRoom() {
  // Current interaction is the sole owner; internal room routing keeps its IDs.
  resetFeedback();
  hero.inert = true;
  hero.hidden = true;
  notice.hidden = true;
  setPhase('room');
  world.inert = false;
  world.removeAttribute('aria-hidden');
  world.focus({preventScroll:true});
  clearAnimations();
  enter.removeAttribute('aria-disabled');
  window.studio.focusDestination();
}
function doorTransform() {
  const width = hero.clientWidth, height = hero.clientHeight;
  const fit = Math.max(width / 1672, height / 941);
  const narrow = width <= 700;
  const doorX = (width - 1672 * fit) * (narrow ? .67 : .5) + 1672 * fit * .576;
  const doorY = (height - 941 * fit) * .5 + 941 * fit * .466;
  const scale = narrow ? 3.2 : 6;
  return `matrix(${scale},0,0,${scale},${width / 2 - scale * doorX},${height / 2 - scale * doorY})`;
}
// One authored path in both directions: no independent return approximation.
function playJourney(direction = 'normal') {
  const timing = {duration:2000, direction, fill:'both'};
  const end = doorTransform();
  animations = [
    image.animate([
      {transform:'matrix(1,0,0,1,0,0)',easing:'cubic-bezier(.35,0,.65,1)'},
      {transform:end,offset:.7},{transform:end}
    ], timing),
    image.animate([{opacity:1},{opacity:1,offset:.2,easing:'ease-in-out'},{opacity:0,offset:.75},{opacity:0}], timing),
    hero.animate([{opacity:1},{opacity:1,offset:.75,easing:'ease-in-out'},{opacity:0}], timing),
    ...[identity,enter].map(element => element.animate([{opacity:1,easing:'ease-in-out'},{opacity:0,offset:.1},{opacity:0}], timing))
  ];
  return Promise.all(animations.map(animation => animation.finished));
}
async function leave({writeHistory = true} = {}) {
  if (phase !== 'room') return;
  const mine = ++sequence;
  if (writeHistory && !isExterior()) history.pushState(null, '', '#hero');
  clearAnimations();
  resetFeedback();
  setPhase('leaving');
  world.inert = true;
  world.setAttribute('aria-hidden','true');
  outside.setAttribute('aria-disabled','true');
  // Back to Room can still be finishing a prop return. Let that settle before
  // taking the doorway path; navigation/cancellation retains sole ownership.
  while (!motion.matches && (window.studio.state.moving || window.studio.state.returningObject)) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (mine !== sequence) return;
  }
  hero.hidden = false;
  hero.inert = false;
  enter.setAttribute('aria-disabled','true');
  skip.hidden = false;
  cancel.hidden = false;
  cancel.textContent = 'Back to room';
  live.textContent = 'Going outside…';
  hero.focus({preventScroll:true});
  try {
    if (!motion.matches && image.naturalWidth && typeof hero.animate === 'function') await playJourney('reverse');
  } catch {
    // A newer interaction cancels this animation and owns the final state.
  }
  if (mine !== sequence) return;
  showExterior({focus:true});
}
outside.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  leave();
});
async function arrive(target = '#room', {animate = true, writeHistory = true} = {}) {
  const mine = ++sequence;
  pendingTarget = target;
  // Commit the destination before loading so browser Back cancels pending entry.
  if (writeHistory && location.hash !== target) history.pushState(null, '', target);
  skipMotion = !animate || motion.matches || !image.naturalWidth;
  clearAnimations();
  hero.hidden = false;
  hero.inert = false;
  world.inert = true;
  world.setAttribute('aria-hidden', 'true');
  setPhase('loading');
  enter.setAttribute('aria-disabled', 'true');
  resetFeedback();
  notice.hidden = true;
  enter.setAttribute('aria-busy', 'true');
  live.textContent = 'Opening the studio…';
  // No flashing loading card on the fast path. Escape/browser Back work at once;
  // keyboard users can also reach the discreet cancel/skip controls.
  cancel.hidden = false;
  skip.hidden = false;
  loadingFeedback = setTimeout(() => {
    if (mine === sequence && phase === 'loading') enterLabel.textContent = 'Opening…';
  }, 250);
  try {
    await loadRoom();
    if (mine !== sequence) return;
    window.studio.prepareRoute();
    if (!skipMotion && target === '#room' && typeof hero.animate === 'function') {
      clearTimeout(loadingFeedback);
      setPhase('entering');
      await playJourney();
    }
    if (mine !== sequence) return;
    revealRoom();
  } catch (error) {
    if (mine !== sequence) return;
    clearAnimations();
    resetFeedback();
    setPhase('hero');
    enter.removeAttribute('aria-disabled');
    needsFreshLoad = true;
    showNotice('The studio couldn’t open. Try again or open the room directly.', 'error');
    retry.focus({preventScroll:true});
  }
}
for (const link of hero.querySelectorAll('[data-arrival-target]')) {
  link.addEventListener('click', event => {
    // A rejected module is browser-cached; retry through the native fresh page.
    if (needsFreshLoad) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (link === enter && enter.getAttribute('aria-disabled') === 'true') return;
    const target = link.dataset.arrivalTarget;
    arrive(target, {animate:target === '#room'});
  });
}
skip.addEventListener('click', () => {
  skipMotion = true;
  for (const animation of animations) animation.finish();
  if (phase === 'loading') live.textContent = 'Waiting for the room to finish loading…';
});
cancel.addEventListener('click', cancelEntry);
retry.addEventListener('click', () => location.assign(`room.html${pendingTarget}`));
function onRoute() {
  if (phase === 'leaving' && !isExterior()) {
    sequence++;
    clearAnimations();
    window.studio.prepareRoute();
    revealRoom();
    return;
  }
  if (isExterior()) {
    if (phase === 'leaving') return;
    if (phase === 'room' && window.studio?.state.area === 'room') {leave({writeHistory:false});return;}
    showExterior({focus:true});
    // app's existing route listeners run after this one and may set a room title.
    queueMicrotask(() => {if (isExterior()) document.title = 'Tyler Mayberry | AI Systems Builder & Practical Product Engineer';});
  } else if (phase !== 'room' && !(['loading','entering'].includes(phase) && pendingTarget === location.hash)) {
    arrive(location.hash, {animate:phase === 'hero' && location.hash === '#room',writeHistory:false});
  }
}
addEventListener('popstate', onRoute);
addEventListener('hashchange', onRoute);
addEventListener('keydown', event => {
  if (event.key === 'Escape' && (phase === 'loading' || phase === 'entering' || phase === 'leaving')) {
    event.preventDefault();
    cancelEntry();
  }
}, {capture:true});
function finishMotion() {
  if (phase !== 'entering' && phase !== 'leaving') return;
  skipMotion = true;
  for (const animation of animations) animation.finish();
}
addEventListener('resize', finishMotion);
motion.addEventListener('change', () => {if (motion.matches) {skipMotion = true;finishMotion();}});
function handleImageError() {
  const source=image.parentElement.querySelector('source');
  if(source){image.addEventListener('load',()=>{if(isExterior())prepareAfterHeroPaint()},{once:true});source.remove();image.src='assets/hero-exterior-v6.webp';return;}

  hero.classList.add('image-unavailable');
  if (phase === 'hero') showNotice('The exterior image is unavailable. You can still enter the studio.', 'image');
}
image.addEventListener('error',handleImageError);
if (image.complete && !image.naturalWidth) handleImageError();
if (isExterior()) {showExterior();prepareAfterHeroPaint();}
else arrive(location.hash, {animate:false,writeHistory:false});
// Small observation seam: no image assets, secrets, timers or mutable state exposed.
window.arrival = {get phase(){return phase;}, get pending(){return pendingTarget;}};
