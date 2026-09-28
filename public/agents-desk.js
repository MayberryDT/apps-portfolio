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
const BUDGET = [['Hosting', '1,240', '1,310'], ['Design', '800', '760'], ['Hardware', '2,400', '2,210'], ['Travel', '650', '590'], ['Software', '1,020', '1,140']];

export class AgentsDesk {
  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'agents-desk';
    this.root.innerHTML = `<div class="ad-bar"><span class="ad-ws"><b>1</b><b class="on">2</b><b>3</b></span><span class="ad-clock"></span><span class="ad-status"><i></i>3 agents</span></div>
      <section class="ad-win ad-browser"><header><span>invoices.acme.test</span><em>agent-1</em></header><div class="ad-page"><h4>Open invoices</h4><div class="ad-rows">${INVOICES.map(([n, who, amt]) => `<div class="ad-row"><span>#${n}</span><span>${who}</span><span>${amt}</span><b>Open</b></div>`).join('')}</div></div></section>
      <section class="ad-win ad-term"><header><span>alacritty</span><em>claude</em></header><pre></pre></section>
      <div class="ad-split"><section class="ad-win ad-sheet"><header><span>q3-budget.ods</span><em>agent-2</em></header><div class="ad-grid">${['', 'Plan', 'Actual'].map(h => `<span class="h">${h}</span>`).join('')}${BUDGET.map(([k]) => `<span class="h">${k}</span><span></span><span></span>`).join('')}</div></section>
      <section class="ad-win ad-top"><header><span>btop</span><em>tater0</em></header><div class="ad-bars">${'<i></i>'.repeat(8)}</div><div class="ad-mem"><span>mem</span><i></i></div></section></div>
      <div class="ad-cursor" aria-hidden="true"><svg viewBox="0 0 16 20"><path d="M1 1l13 11.5H8.4l3.3 6.5-2.6 1.3-3.3-6.6L1 17.5z"/></svg><span>agent-1</span></div>`;
    this.term = this.root.querySelector('pre');
    this.rows = [...this.root.querySelectorAll('.ad-row')];
    this.cells = [...this.root.querySelectorAll('.ad-grid span:not(.h)')];
    this.bars = [...this.root.querySelectorAll('.ad-bars i')];
    this.mem = this.root.querySelector('.ad-mem i');
    this.cursor = this.root.querySelector('.ad-cursor');
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
    this.moveCursor(this.rows[2]);
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
  moveCursor(target, dx = .72, dy = .5) {
    if (!target) return;
    // Layout pixels, not screen pixels: the desk sits inside a perspective-mapped screen.
    let x = target.offsetWidth * dx, y = target.offsetHeight * dy;
    for (let el = target; el && el !== this.root; el = el.offsetParent) { x += el.offsetLeft; y += el.offsetTop; }
    this.cursor.style.transform = `translate(${x}px,${y}px)`;
  }
  tick() {
    this.step++;
    // Terminal: type the agent log, then keep the last lines on screen.
    const text = TERMINAL[this.line % TERMINAL.length];
    this.char += text.startsWith('>') ? 1 : 3;
    const shown = [...this.lines, text.slice(0, this.char)].slice(-12);
    this.term.textContent = shown.join('\n') + (this.step % 8 < 4 ? '▌' : ' ');
    if (this.char >= text.length) { this.lines.push(text); this.lines = this.lines.slice(-11); this.line++; this.char = 0; }
    // Browser: the agent's cursor walks down the invoices and marks them paid.
    const beat = this.step % 26, row = Math.floor(this.step / 26) % (this.rows.length + 2);
    if (row < this.rows.length) {
      if (beat === 1) { this.rows.forEach(r => r.classList.remove('focus')); this.rows[row].classList.add('focus'); this.moveCursor(this.rows[row].lastElementChild, .5, .55); }
      if (beat === 12) { this.rows[row].classList.add('paid'); this.rows[row].lastElementChild.textContent = 'Paid'; }
    } else if (beat === 1 && row === this.rows.length + 1) {
      for (const r of this.rows) { r.classList.remove('paid', 'focus'); r.lastElementChild.textContent = 'Open'; }
    }
    // Spreadsheet: a second agent fills plan and actual figures.
    if (this.step % 18 === 9) {
      const i = Math.floor(this.step / 18) % (this.cells.length + 3);
      this.cells.forEach(c => c.classList.remove('sel'));
      if (i < this.cells.length) { const [, plan, actual] = BUDGET[Math.floor(i / 2)]; this.cells[i].textContent = i % 2 ? actual : plan; this.cells[i].classList.add('sel'); }
      else if (i === this.cells.length + 2) this.cells.forEach(c => { c.textContent = ''; });
    }
    // btop: the machines are busy.
    if (this.step % 4 === 0) {
      this.bars.forEach(bar => { const h = parseFloat(bar.style.height) || 40; bar.style.height = `${Math.max(12, Math.min(96, h + (Math.random() - .45) * 22))}%`; });
      this.mem.style.width = `${52 + Math.sin(this.step / 30) * 8}%`;
    }
    if (this.step % 200 === 1) this.clock.textContent = new Date().toLocaleString('en-US', {weekday: 'long'}) + ' ' + new Date().toTimeString().slice(0, 5);
  }
}
