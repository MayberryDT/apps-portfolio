import {screenQuads, quadTransform} from './screen-data.js';
import {omarchyAscii} from './omarchy-ascii.js';

// Native ttfx frames exported from Tyler's Omarchy screensaver, played as text cells.
// The source engine, logo, export settings and licenses are recorded with the asset.
export class OmarchyScreen {
  constructor(scene) {
    this.active = false;
    this.ready = false;
    this.playing = false;
    this.frame = 0;
    this.raf = 0;
    this.loadState = 'idle';
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.root = document.createElement('div');
    this.root.id = 'omarchy-screen-still';
    this.root.className = 'screen-still omarchy-surface';
    this.root.setAttribute('aria-hidden', 'true');
    this.text = document.createElement('pre');
    this.text.className = 'omarchy-ascii';
    this.text.textContent = omarchyAscii;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1400;
    this.canvas.height = 2400;
    this.canvas.hidden = true;
    this.root.append(this.text, this.canvas);
    Object.assign(this.root.style, {width:'700px',height:'1200px',transform:quadTransform(screenQuads.omarchy,700,1200)});
    scene.append(this.root);
    this.motion.addEventListener('change', () => this.sync());
    document.addEventListener('visibilitychange', () => this.sync());
  }

  select(active) {
    if (active === this.active) return;
    this.active = active;
    this.ready = false;
    this.stop();
    if (active && this.loadState === 'failed') { this.loadState = 'idle'; this.loading = null; }
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.playing = false;
    this.frame = 0;
    this.canvas.hidden = true;
    this.text.hidden = false;
    this.root.dataset.animating = 'false';
  }

  reveal(ready) {
    this.ready = ready && this.active;
    this.sync();
  }

  async load() {
    if (!this.loading) {
      this.loadState = 'loading';
      this.loading = (async () => {
        if (!globalThis.DecompressionStream) throw new Error('Static ASCII fallback');
        const response = await fetch('assets/omarchy/screensaver-frames.json.gz');
        if (!response.ok || !response.body) throw new Error('Screensaver frames unavailable');
        const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
        this.data = await new Response(stream).json();
        await document.fonts.load('12px OmarchyMono');
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) throw new Error('Static ASCII fallback');
        this.ctx.setTransform(2,0,0,2,0,0);
        this.ctx.font = '11.666667px OmarchyMono, monospace';
        this.ctx.textBaseline = 'top';
        this.cells = new Uint16Array(this.data.cols * this.data.rows);
        this.clipIndex = -1;
        this.loadState = 'ready';
      })().catch(() => { this.loadState = 'failed'; this.stop(); });
    }
    return this.loading;
  }

  sync() {
    if (!this.active || !this.ready || this.motion.matches || document.hidden) { this.stop(); return; }
    if (this.playing || this.loadState === 'failed') return;
    if (this.loadState !== 'ready') {
      // Completion re-checks selection: leaving during fetch cannot start playback.
      if (this.loadState === 'idle') this.load().then(() => this.sync());
      return;
    }
    this.playing = true;
    this.text.hidden = true;
    this.canvas.hidden = false;
    this.root.dataset.animating = 'true';
    this.nextClip(performance.now());
    this.raf = requestAnimationFrame(now => this.tick(now));
  }

  nextClip(now) {
    // Native screensaver chooses a random text effect each time through its loop.
    const count = this.data.clips.length;
    this.clipIndex = this.clipIndex < 0 ? Math.floor(Math.random()*count) : (this.clipIndex + 1 + Math.floor(Math.random()*(count-1))) % count;
    this.root.dataset.effect = this.data.clips[this.clipIndex].name;
    this.cells.fill(0);
    this.frame = 0;
    this.started = now;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0,0,700,1200);
  }

  tick(now) {
    if (!this.playing) return;
    const frames = this.data.clips[this.clipIndex].frames;
    const target = Math.min(frames.length - 1, Math.floor((now - this.started) * this.data.fps / 1000));
    if (this.frame <= target) {
      for (; this.frame <= target; this.frame++) {
        const delta = frames[this.frame];
        for (let i=0;i<delta.length;i+=2) this.cells[delta[i]] = delta[i+1];
      }
      this.paint();
    }
    if (now-this.started >= frames.length * 1000/this.data.fps) this.nextClip(now);
    this.raf = requestAnimationFrame(time => this.tick(time));
  }

  paint() {
    const c = this.ctx, {cols, rows, styles} = this.data;
    c.fillStyle = '#000';
    c.fillRect(0,0,700,1200);
    const cellWidth = 700/cols, cellHeight = 1200/rows;
    for (let i=0;i<this.cells.length;i++) {
      const style = this.cells[i];
      if (!style) continue;
      const [glyph, color] = styles[style];
      c.fillStyle = '#' + color;
      c.fillText(glyph,(i%cols)*cellWidth,Math.floor(i/cols)*cellHeight);
    }
  }
}
