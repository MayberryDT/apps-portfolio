// Basecoat owns tab interactions; this module only supplies studio content.
// Imports are local, pinned upstream files. No bundler or remote runtime needed.
import './vendor/basecoat/basecoat.min.js';
import './vendor/basecoat/tabs.min.js';

const root = document.getElementById('story-tabs');
const tablist = document.getElementById('tabs');
const panels = document.getElementById('stories');
let pill;
const active = () => tablist.querySelector('[role="tab"][aria-selected="true"]');

// Presentation observes Basecoat selection; it never changes tab semantics.
function syncTabs(animate = true) {
  for (const panel of panels.children) {
    panel.inert = panel.hidden;
    panel.setAttribute('aria-hidden', String(panel.hidden));
  }
  const tab = active();
  if (!tab || !pill) return;
  const previous = pill.style.transition;
  if (!animate) pill.style.transition = 'none';
  pill.style.transform = `translateX(${tab.offsetLeft}px)`;
  pill.style.width = `${tab.offsetWidth}px`;
  pill.style.height = `${tab.offsetHeight}px`;
  pill.style.top = `${tab.offsetTop}px`;
  if (!animate) { void pill.offsetWidth; pill.style.transition = previous; }
}
new MutationObserver(() => syncTabs()).observe(tablist, {
  subtree: true, attributes: true, attributeFilter: ['aria-selected']
});
new ResizeObserver(() => syncTabs(false)).observe(tablist);
document.fonts.ready.then(() => syncTabs(false));

export function renderStoryTabs(entries) {
  const multiple = entries.length > 1;
  root.dataset.singleSection = String(entries.length === 1);
  tablist.hidden = !multiple;
  // Preserve the tablist element: Basecoat attaches its listeners to this node.
  pill = document.createElement('span');
  pill.className = 't-tabs-pill';
  pill.setAttribute('aria-hidden', 'true');
  tablist.replaceChildren(...(multiple ? [pill] : []));
  panels.replaceChildren();
  entries.forEach(([label, html], index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 't-tab';
    tab.id = `tab-${index}`;
    tab.role = 'tab';
    tab.textContent = label;
    tab.setAttribute('aria-controls', `story-${index}`);
    tab.setAttribute('aria-selected', String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    if (multiple) tablist.append(tab);

    const panel = document.createElement('section');
    panel.id = `story-${index}`;
    panel.role = multiple ? 'tabpanel' : 'region';
    panel.classList.toggle('single-story', !multiple);
    panel.tabIndex = multiple ? 0 : -1;
    panel.hidden = index !== 0;
    panel.setAttribute('aria-labelledby', multiple ? tab.id : 'story-title');
    // Authored local content.js only; this is not an external HTML input.
    panel.innerHTML = html;
    for (const button of panel.querySelectorAll('button')) {
      button.type = 'button';
      button.classList.add('btn', 'studio-control');
    }
    panels.append(panel);
  });
  window.basecoat.init('tabs');
  window.basecoat.refresh(root);
  syncTabs(false);
}

export function selectedStoryTab() {
  if (tablist.hidden) return 0;
  return [...tablist.querySelectorAll('[role=tab]')].findIndex(tab => tab.getAttribute('aria-selected') === 'true');
}
