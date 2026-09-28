// Room presence: quiet sound that belongs to the room (docs/plan/room-presence.md).
// Only things in the room make sound. Audio starts after a visitor's gesture,
// fades out in hidden tabs, and one switch mutes it (remembered per browser).
const FOLEY = 'audio/foley.json';
const BEDS = {breeze: 'audio/outside-breeze.m4a', birds: 'audio/outside-birds.m4a', fan: 'audio/fan-air.m4a'};
const ONE_SHOTS = {gravel: 'audio/steps-gravel.m4a', door: 'audio/door-slide.m4a', steps: 'audio/steps-wood.m4a'};
// How the outside reaches each view: brighter by the glass, muffled deep inside.
const OUTSIDE = {outside: [16000, .5, .38], room: [950, .2, .1], desk: [700, .15, .05], photos: [850, .17, .07],
  bookshelf: [1400, .2, .11], journal: [1300, .2, .1], contact: [1700, .24, .13]};
const SHELF = {shaco: [['soft', .3], ['cloth', .12]], sonic: [['plastic', .28]], dreamcast: [['plastic', .3]],
  baseball: [['leather', .34]], weightlifting: [['metal', .26, .8]], 'student-drawing': [['paper', .3]]};
// Overall room level. Tyler, 2026-09-28: "pretty loud... toned down a little bit" (was 1).
const VOLUME = .6;
const store = {get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }};

class RoomAudio {
  constructor() {
    this.muted = store.get('studio-sound') === 'off';
    this.place = 'outside';
    this.ready = null;
    this.buffers = {};
    this.cues = {};
    document.documentElement.dataset.sound = this.muted ? 'off' : 'on';
    addEventListener('visibilitychange', () => this.visibility());
    // Returning visitors arrive without a click; the first gesture starts sound.
    // WebKit unlocks audio on touchend/click, not pointerdown; listen for all.
    const first = () => { if (this.inRoom() && this.place !== 'outside') this.unlock(); };
    for (const type of ['pointerdown', 'touchend', 'click', 'keydown']) addEventListener(type, first, {capture: true});
  }
  inRoom() { return (document.body.dataset.arrival || 'room') === 'room'; }
  // Must run inside a user gesture the first time (iOS/Safari autoplay rules).
  unlock() {
    if (!this.ctx) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return null;
      // The entrance may already have created the context inside the Enter click.
      const ctx = this.ctx = window.__studioAudioContext || new Context({latencyHint: 'interactive'});
      this.master = ctx.createGain(); this.master.gain.value = 0;
      const limit = ctx.createDynamicsCompressor();
      limit.threshold.value = -20; limit.ratio.value = 4; limit.attack.value = .004; limit.release.value = .25;
      this.master.connect(limit).connect(ctx.destination);
      // One small wooden room for every object sound.
      this.room = ctx.createGain();
      const verb = ctx.createConvolver(); verb.buffer = this.impulse(.5); const wet = ctx.createGain(); wet.gain.value = .22;
      this.room.connect(this.master); this.room.connect(verb).connect(wet).connect(this.master);
      this.glass = ctx.createBiquadFilter(); this.glass.type = 'lowpass'; this.glass.frequency.value = OUTSIDE.outside[0];
      this.glass.connect(this.master);
      this.breeze = ctx.createGain(); this.birds = ctx.createGain(); this.fan = ctx.createGain();
      for (const g of [this.breeze, this.birds, this.fan]) g.gain.value = 0;
      this.breeze.connect(this.glass); this.birds.connect(this.glass); this.fan.connect(this.room);
      this.arrival = this.loadArrival();
      this.ready = this.arrival.then(() => this.load());
    }
    if (this.ctx.state === 'suspended' && !document.hidden) this.ctx.resume().catch(() => {});
    this.level(this.muted ? 0 : VOLUME, .6);
    this.ramp(this.fan.gain, this.fanTarget || 0, 1);
    return this.ready;
  }
  impulse(seconds) {
    const rate = this.ctx.sampleRate, n = Math.floor(rate * seconds), buf = this.ctx.createBuffer(2, n, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c); let low = 0;
      for (let i = 0; i < n; i++) { low += ((Math.random() * 2 - 1) - low) * .35; d[i] = low * Math.pow(1 - i / n, 3.2); }
    }
    return buf;
  }
  // Sound never competes with the room's images: arrival sounds first, the rest at low priority.
  async fetch(url, priority = 'low') { const r = await fetch(url, {priority}); if (!r.ok) throw new Error(url); return this.ctx.decodeAudioData(await r.arrayBuffer()); }
  // The walk-in's own sounds load first so they can play during it.
  async loadArrival() {
    try { await Promise.all(Object.entries(ONE_SHOTS).map(async ([k, u]) => { this.buffers[k] = await this.fetch(u, 'high'); })); } catch {}
  }
  async load() {
    try {
      const [meta, ...beds] = await Promise.all([fetch(FOLEY, {priority: 'low'}).then(r => r.json()), ...Object.values(BEDS).map(u => this.fetch(u))]);
      Object.keys(BEDS).forEach((k, i) => { this.buffers[k] = beds[i]; });
      this.cues = meta.cues; this.buffers.foley = await this.fetch(meta.file);
      for (const [k, gain] of [['breeze', this.breeze], ['birds', this.birds], ['fan', this.fan]]) {
        const src = this.ctx.createBufferSource(); src.buffer = this.buffers[k]; src.loop = true;
        src.connect(gain); src.start(0, Math.random() * this.buffers[k].duration);
      }
      this.apply(this.place, 1.5);
      this.creaks();
    } catch { /* Sound is a bonus; the room works silently. */ }
  }
  ramp(param, value, seconds) {
    const t = this.ctx.currentTime; param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t); param.linearRampToValueAtTime(value, t + Math.max(.01, seconds));
  }
  level(value, seconds) { if (this.ctx) this.ramp(this.master.gain, value, seconds); }
  apply(place, seconds = 1.1) {
    this.place = place;
    if (!this.ctx) return;
    const [freq, breeze, birds] = OUTSIDE[place] || OUTSIDE.room;
    const t = this.ctx.currentTime;
    this.glass.frequency.cancelScheduledValues(t); this.glass.frequency.setValueAtTime(this.glass.frequency.value, t);
    this.glass.frequency.exponentialRampToValueAtTime(freq, t + seconds);
    this.ramp(this.breeze.gain, breeze, seconds); this.ramp(this.birds.gain, birds, seconds);
  }
  // A sound from the room: a random variation, slightly varied so nothing repeats exactly.
  play(cue, gain = .3, {rate = 1, delay = 0} = {}) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const shot = this.buffers[cue], variants = this.cues[cue];
    if (!shot && !variants?.length) return;
    const src = this.ctx.createBufferSource(), g = this.ctx.createGain();
    src.buffer = shot || this.buffers.foley; src.playbackRate.value = rate * (0.96 + Math.random() * .08);
    g.gain.value = gain * (0.9 + Math.random() * .2);
    src.connect(g).connect(this.room);
    const when = this.ctx.currentTime + delay;
    if (shot) src.start(when);
    else { const [at, length] = variants[Math.floor(Math.random() * variants.length)]; src.start(when, at, length + .02); }
  }
  creaks() {
    clearTimeout(this.creakTimer);
    this.creakTimer = setTimeout(() => {
      if (this.place !== 'outside' && !document.hidden) this.play('creak', .09, {rate: .85});
      this.creaks();
    }, 45000 + Math.random() * 75000);
  }
  visibility() {
    if (!this.ctx) return;
    if (document.hidden) { this.level(0, .25); setTimeout(() => document.hidden && this.ctx.suspend().catch(() => {}), 300); }
    else { this.ctx.resume().then(() => this.level(this.muted ? 0 : VOLUME, .8)).catch(() => {}); }
  }
  setMuted(muted) {
    this.muted = muted; store.set('studio-sound', muted ? 'off' : 'on');
    document.documentElement.dataset.sound = muted ? 'off' : 'on';
    // Outside, before Enter, the switch only stores the choice: the entrance stays silent.
    if (muted) this.level(0, .3); else if (this.ctx || this.inRoom()) this.unlock();
  }
  // The walk in: gravel, the sliding glass door, a few steps on the wood floor,
  // while the outside falls away behind the glass.
  arrive({motion = true} = {}) {
    this.unlock();
    this.arriving = true;
    const go = () => {
      setTimeout(() => { this.arriving = false; }, motion ? 1100 : 0);
      if (!motion) { this.apply('room', .8); this.play('door', .28); return; }
      this.apply('outside', .6);
      this.play('gravel', .42); this.play('door', .5, {delay: .85}); this.play('steps', .34, {delay: 1.45});
      setTimeout(() => this.apply(this.target || 'room', 1.3), 1100);
    };
    (this.arrival || Promise.resolve()).then(go);
  }
  // Back outside: the door slides, the outside opens up, then fades.
  leave({motion = true} = {}) {
    if (!this.ctx) return;
    this.play('door', .45, {delay: motion ? .25 : 0});
    clearTimeout(this.leaveTimer);
    this.leaveTimer = setTimeout(() => this.apply('outside', 1.2), motion ? 450 : 0);
    clearTimeout(this.fadeTimer);
    this.fadeTimer = setTimeout(() => { if (this.place === 'outside') { this.ramp(this.breeze.gain, 0, 5); this.ramp(this.birds.gain, 0, 5); } }, 6000);
  }
  // A cancelled walk-out: stay in the room's sound.
  settle() {
    clearTimeout(this.leaveTimer); clearTimeout(this.fadeTimer);
    this.place = this.target || 'room';
    if (this.ctx) { this.unlock(); this.apply(this.place, 1.2); }
  }
  // Route changes: the camera moves, so the room's sound follows it.
  route(prev, next) {
    if (this.place === 'outside' && next.area) this.place = 'room';
    const place = this.target = next.area && next.area !== 'room' ? next.area : 'room';
    if (this.place !== 'outside' && !this.arriving) this.apply(place, next.focused ? 1.05 : 1.15);
    this.fanTarget = next.area === 'desk' ? (this.busy ? .2 : .025) : 0;
    // The fan follows the room even while muted, so unmuting never plays a stale level.
    if (this.ctx) this.ramp(this.fan.gain, this.fanTarget, 1.2);
    if (!this.ctx || this.muted) return;
    if (next.area === 'journal' && prev.area !== 'journal') this.play('creak', .2, {delay: .5});
    const opened = next.focused && next.object && next.object !== prev.object;
    const closed = prev.focused && prev.object && prev.object !== next.object;
    if (closed) this.putDown(prev.object, prev.area);
    if (opened) this.pickUp(next.object, next.area);
    if (next.project && next.project !== prev.project) this.play('trackpad', .32);
    else if (prev.project && !next.project && next.object === 'monitor') this.play('key', .22);
    if (next.area === 'contact' && prev.area === 'contact' && next.detail !== prev.detail) this.play('tick', .18);
  }
  // The computer's fans rise while agents work on the Omarchy monitor.
  machine(busy) {
    this.busy = busy;
    this.fanTarget = this.target === 'desk' ? (busy ? .2 : .025) : 0;
    if (this.ctx) this.ramp(this.fan.gain, this.fanTarget, busy ? 2.2 : 1.2);
  }
  pickUp(object, area) {
    if (object === 'helm') { this.play('cloth', .3); this.play('tick', .1, {delay: .7}); return; }
    if (object === 'pixel') { this.play('cloth', .26); this.play('metal', .07, {rate: 1.9, delay: .08}); this.play('metal', .05, {rate: 2.2, delay: .19}); return; }
    if (object === 'notebook') { this.play('book-open', .3, {delay: .2}); return; }
    if (object === 'monitor') { this.play('key', .2, {delay: .3}); return; }
    const shelf = SHELF[object];
    if (shelf) { for (const [cue, gain, rate = 1] of shelf) this.play(cue, gain, {rate}); return; }
    if (area === 'bookshelf') this.play('book-slide', .3);
    else if (area === 'photos') { this.play('wood', .22); this.play('paper', .16, {delay: .15}); }
  }
  putDown(object, area) {
    if (object === 'helm' || object === 'pixel') { this.play(object === 'pixel' ? 'wood' : 'soft', .22, {delay: .9}); return; }
    if (object === 'notebook') { this.play('book-close', .26); return; }
    const shelf = SHELF[object];
    if (shelf) { const [cue, gain, rate = 1] = shelf[0]; this.play(cue, gain * .7, {rate: rate * .95, delay: .5}); return; }
    if (area === 'bookshelf') this.play('book-slide', .2, {delay: .4});
  }
}

export const roomAudio = new RoomAudio();
// The switch lives beside the full-screen control; it stays silent itself.
const toggle = document.querySelector('#sound-toggle');
if (toggle) {
  const sync = () => {
    toggle.setAttribute('aria-pressed', String(!roomAudio.muted));
    toggle.dataset.state = roomAudio.muted ? 'off' : 'on';
  };
  toggle.addEventListener('click', () => { roomAudio.setMuted(!roomAudio.muted); sync(); });
  sync();
}
