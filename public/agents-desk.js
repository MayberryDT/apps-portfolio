// Agents at work on an Omarchy desktop, drawn as motion graphics for the portrait
// monitor (spec outcome 7). A simulation in ibara.app's demo style, not a recording:
// Tyler, 2026-09-28: "I want the cool motion effect animations of agents working."
// Agents drive ibara over MCP, so the terminal shows a coding agent calling its tools.
const TERMINAL = [
  '> reconcile the open invoices, then fill q3',
  '» ibara computer_status',
  '  └ tater0 ready · tater1 ready',
  '» ibara computer_begin tater0',
  '» ibara computer_act click "Mark paid"',
  '  └ #1042 paid · verified',
  '» ibara computer_act click "Mark paid"',
  '  └ #1043 paid · verified',
  '» ibara computer_begin tater1',
  '» ibara computer_act type 5 cells',
  '  └ saved q3-budget.ods',
  '» ibara computer_end tater0',
  '  Invoices reconciled; the budget is filled.'
];
const INVOICES = [['1042', 'Harbor Supply', '$1,240.00'], ['1043', 'Northwind', '$318.50'], ['1044', 'Cedar & Co', '$2,015.00'],
  ['1045', 'Blue Mesa', '$96.20'], ['1046', 'Fjord Labs', '$640.00'], ['1047', 'Juniper', '$1,105.75']];
// One agent per window, each with its own Cua cursor colour from the ibara.app demo.
const AGENTS = {browser: '#d45de0', term: '#3fc1c9', sheet: '#ff9e64', top: '#7ee787'};
const CUA = '<svg viewBox="0 0 20 20"><path d="M3 2.5 17.5 8.6 10.6 10.6 8.6 17.5Z"/></svg>';
const BUDGET = [['Hosting', '1,240', '1,310'], ['Design', '800', '760'], ['Hardware', '2,400', '2,210'], ['Travel', '650', '590'], ['Software', '1,020', '1,140']];

export class AgentsDesk {
  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'agents-desk';
    this.root.innerHTML = `<div class="ad-bar"><span class="ad-ws"><b>1</b><b class="on">2</b><b>3</b></span><span class="ad-clock"></span><span class="ad-status"><i></i>3 agents</span></div>
      <section class="ad-win ad-browser"><header><span>invoices.acme.test</span><em>agent-1</em></header><div class="ad-page"><h4>Open invoices</h4><div class="ad-rows">${INVOICES.map(([n, who, amt]) => `<div class="ad-row"><span>#${n}</span><span>${who}</span><span>${amt}</span><b>Open</b></div>`).join('')}</div></div></section>
      <section class="ad-win ad-term"><header><span>alacritty</span><em>claude</em></header><pre></pre></section>
      <div class="ad-split"><section class="ad-win ad-sheet"><header><span>q3-budget.ods</span><em>agent-2</em></header><div class="ad-grid">${['', 'Plan', 'Actual'].map(h => `<span class="h">${h}</span>`).join('')}${BUDGET.map(([k]) => `<span class="h">${k}</span><span></span><span></span>`).join('')}</div></section>
      <section class="ad-win ad-top"><header><span>btop</span><em>tater0</em></header><div class="ad-bars">${'<i></i>'.repeat(8)}</div><div class="ad-mem"><span>mem</span><i></i></div></section></div>`;
    this.term = this.root.querySelector('pre');
    this.rows = [...this.root.querySelectorAll('.ad-row')];
    this.cells = [...this.root.querySelectorAll('.ad-grid span:not(.h)')];
    this.bars = [...this.root.querySelectorAll('.ad-bars i')];
    this.mem = this.root.querySelector('.ad-mem i');
    this.cursors = {};
    for (const [name, color] of Object.entries(AGENTS)) {
      const win = this.root.querySelector(`.ad-${name}`), cursor = document.createElement('div');
      cursor.className = 'ad-cursor'; cursor.innerHTML = CUA;
      win.style.setProperty('--c', color); win.append(cursor);
      this.cursors[name] = cursor;
    }
    this.clock = this.root.querySelector('.ad-clock');
    this.timer = 0;
    this.fresh = true;
  }
  reset() {
    this.step = 0; this.line = 0; this.char = 0; this.lines = [];
    for (const row of this.rows) { row.classList.remove('paid', 'focus'); row.lastElementChild.textContent = 'Open'; }
    for (const cell of this.cells) { cell.textContent = ''; cell.classList.remove('sel'); }
    this.term.textContent = '';
  }
  // A composed still for reduced motion and for the first frame.
  still() {
    this.reset();
    this.lines = TERMINAL.slice(0, 9); this.term.textContent = this.lines.join('\n');
    this.rows.slice(0, 2).forEach(row => { row.classList.add('paid'); row.lastElementChild.textContent = 'Paid'; });
    BUDGET.slice(0, 3).forEach(([, plan, actual], i) => { this.cells[i * 2].textContent = plan; this.cells[i * 2 + 1].textContent = actual; });
    this.bars.forEach((bar, i) => { bar.style.height = `${30 + (i * 37) % 55}%`; });
    this.mem.style.width = '58%';
    this.point('browser', this.rows[2].lastElementChild);
    this.point('term', this.term, 0, 0, this.termSpot());
    this.point('sheet', this.cells[6]);
    this.point('top', this.bars[3], .5, .2);
    this.clock.textContent = new Date().toLocaleString('en-US', {weekday: 'long'}) + ' ' + new Date().toTimeString().slice(0, 5);
    this.fresh = true;
  }
  start() {
    if (this.timer) return;
    // Open mid-work: the composed still, then carry on typing from where it leaves off.
    // A pause (hidden tab) resumes where it was.
    if (this.fresh) { this.still(); this.step = 26 * 2; this.line = 9; this.char = 0; }
    this.fresh = false;
    this.timer = setInterval(() => this.tick(), 70);
  }
  stop() { clearInterval(this.timer); this.timer = 0; }
  // Glide a window's cursor to a point on a target. Layout pixels, not screen pixels:
  // the desk sits inside a perspective-mapped screen.
  point(name, target, dx = .5, dy = .55, [ox, oy] = [0, 0]) {
    const cursor = this.cursors[name];
    let x = target.offsetWidth * dx + ox, y = target.offsetHeight * dy + oy;
    for (let el = target; el && el !== cursor.offsetParent; el = el.offsetParent) { x += el.offsetLeft; y += el.offsetTop; }
    cursor.style.transform = `translate(${x}px,${y}px)`;
  }
  click(name) { const cursor = this.cursors[name]; cursor.classList.remove('click'); void cursor.offsetWidth; cursor.classList.add('click'); }
  // Just under the line the terminal is typing (14px mono, 1.45 line height).
  termSpot() {
    const n = Math.min(this.term.textContent.split('\n').length, 12);
    return [14, Math.min(this.term.clientHeight - 30, 12 + n * 20.3)];
  }
  tick() {
    this.step++;
    // Terminal: type the agent log, then keep the last lines on screen.
    const text = TERMINAL[this.line % TERMINAL.length];
    this.char += text.startsWith('>') ? 1 : 3;
    const shown = [...this.lines, text.slice(0, this.char)].slice(-12);
    this.term.textContent = shown.join('\n') + (this.step % 8 < 4 ? '▌' : ' ');
    if (this.char >= text.length) { this.lines.push(text); this.lines = this.lines.slice(-11); this.line++; this.char = 0; }
    else if (this.char <= 3) { this.point('term', this.term, 0, 0, this.termSpot()); if (this.char === 1) this.click('term'); }
    // Browser: the agent's cursor walks down the invoices and marks them paid.
    const beat = this.step % 26, row = Math.floor(this.step / 26) % (this.rows.length + 2);
    if (row < this.rows.length) {
      if (beat === 1) { this.rows.forEach(r => r.classList.remove('focus')); this.rows[row].classList.add('focus'); this.point('browser', this.rows[row].lastElementChild); }
      if (beat === 12) { this.click('browser'); this.rows[row].classList.add('paid'); this.rows[row].lastElementChild.textContent = 'Paid'; }
    } else if (beat === 1 && row === this.rows.length + 1) {
      for (const r of this.rows) { r.classList.remove('paid', 'focus'); r.lastElementChild.textContent = 'Open'; }
    }
    // Spreadsheet: a second agent fills plan and actual figures.
    // Its cursor reaches the cell, clicks, then the figure appears.
    const cell = Math.floor(this.step / 18) % (this.cells.length + 3);
    if (this.step % 18 === 9) {
      this.cells.forEach(c => c.classList.remove('sel'));
      if (cell < this.cells.length) { this.cells[cell].classList.add('sel'); this.point('sheet', this.cells[cell]); }
      else if (cell === this.cells.length + 2) { this.cells.forEach(c => { c.textContent = ''; }); this.point('sheet', this.cells[0]); }
    }
    if (this.step % 18 === 17 && cell < this.cells.length) {
      const [, plan, actual] = BUDGET[Math.floor(cell / 2)];
      this.click('sheet'); this.cells[cell].textContent = cell % 2 ? actual : plan;
    }
    // btop: the machines are busy.
    // btop: its agent checks the busiest core now and then.
    if (this.step % 40 === 20) this.point('top', this.bars[Math.floor(Math.random() * this.bars.length)], .5, .2);
    if (this.step % 40 === 30) this.click('top');
    if (this.step % 4 === 0) {
      this.bars.forEach(bar => { const h = parseFloat(bar.style.height) || 40; bar.style.height = `${Math.max(12, Math.min(96, h + (Math.random() - .45) * 22))}%`; });
      this.mem.style.width = `${52 + Math.sin(this.step / 30) * 8}%`;
    }
    if (this.step % 200 === 1) this.clock.textContent = new Date().toLocaleString('en-US', {weekday: 'long'}) + ' ' + new Date().toTimeString().slice(0, 5);
  }
}
