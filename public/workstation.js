import {profileContent} from './profile-content.js';
import {responsiveAsset} from './responsive-assets.js';
import {projects, projectById} from './projects.js';
import {screenQuads, quadTransform} from './screen-data.js';
import {OmarchyScreen} from './omarchy-screen.js';

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export class Workstation {
  constructor({scene, world, onProject}) {
    this.onProject = onProject;
    this.current = null;
    this.lastProject = projects[0].id;
    this.active = false;
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.entrance = [];
    this.ready = false;
    this.motion.addEventListener('change', () => {
      if (this.motion.matches) this.cancelEntrance();
    });
    this.omarchy = new OmarchyScreen(scene);

    this.root = element('section', 'project-desktop');
    this.root.id = 'project-desktop';
    this.root.setAttribute('aria-label', 'Laptop projects');
    this.root.hidden = true;
    this.root.inert = true;
    this.root.innerHTML = `
      <div class="desktop-bar"><span class="desktop-owner"><img src="assets/omarchy/logo.svg" alt="Omarchy"><span>tyler / projects</span></span><span class="desktop-bar-right">portfolio</span></div>
      <div class="file-toolbar"><button id="project-up" class="btn studio-control" type="button" aria-label="Close project and return to all projects" hidden>← <span>Back to Projects</span></button><span id="desktop-path">~/projects</span><span class="file-count">${String(projects.length).padStart(2, '0')} items</span></div>
      <div class="t-page-slide" data-page="1"><div id="project-browser" class="t-page" data-page-id="1"><aside class="file-sidebar" aria-label="Collection"><span class="sidebar-label">WORKSPACE</span><span class="sidebar-current">▦ <span>Projects</span><small>${String(projects.length).padStart(2, '0')}</small></span><p>A few ideas<br>made real.</p><span class="sidebar-signature">Tyler Mayberry</span></aside><div class="project-files"><div class="files-heading"><h1 id="desktop-title" tabindex="-1">Projects</h1><span>Built, explored, put into the world.</span></div><div id="project-grid" aria-label="All ${projects.length} projects"></div></div></div>
      <article id="project-window" class="t-page" data-page-id="2" aria-labelledby="project-heading" inert aria-hidden="true"></article></div>
      <div class="desktop-status"><span id="desktop-status-text">Choose a project to take a closer look.</span><span class="desktop-status-count">${projects.length} projects</span></div>`;
    this.grid = this.root.querySelector('#project-grid');
    this.browser = this.root.querySelector('#project-browser');
    this.window = this.root.querySelector('#project-window');
    this.up = this.root.querySelector('#project-up');
    this.up.addEventListener('click', () => this.onProject(null));
    this.slider = this.root.querySelector('.t-page-slide');
    for (const project of projects) this.grid.append(this.projectCard(project, true));
    this.rest = this.desktopStill();
    this.rest.id = 'laptop-screen-still';
    this.rest.inert = true;
    this.rest.setAttribute('aria-hidden', 'true');
    this.placeStill(this.rest, screenQuads.laptop, 1200, 720);
    scene.append(this.rest);
    world.append(this.root);
  }

  async prepareImages() {
    const images=[...this.root.querySelectorAll('img[data-src]'),...this.rest.querySelectorAll('img[data-src]')];
    await Promise.all(images.map(async image=>{image.src=responsiveAsset(image.dataset.src);delete image.dataset.src;try{await image.decode()}catch{}}));
  }

  placeStill(node, points, width, height) {
    Object.assign(node.style, {width: `${width}px`, height: `${height}px`, transform: quadTransform(points, width, height)});
  }

  projectCard(project, interactive = false) {
    const card = element(interactive ? 'button' : 'div', 'project-file');
    card.dataset.project = project.id;
    card.style.setProperty('--project-color', project.color);
    const media = element('span', 'project-file-media');
    media.setAttribute('aria-hidden', 'true');
    const fallback = element('span', 'project-file-icon', project.mark);
    media.append(fallback);
    if (project.image) {
      const image = element('img');
      image.alt = '';
      image.draggable = false;
      image.addEventListener('load', () => { fallback.hidden = true; image.classList.add('loaded'); });
      image.addEventListener('error', () => { image.hidden = true; fallback.hidden = false; });
      image.dataset.src = project.image;
      media.append(image);
    }
    card.append(media, element('span', 'project-file-name', project.name), element('span', 'project-file-kind', project.category));
    if (interactive) {
      card.classList.add('btn');
      card.type = 'button';
      card.setAttribute('aria-label', `Open ${project.name}`);
      card.addEventListener('click', () => this.onProject(project.id));
    }
    return card;
  }

  desktopStill() {
    // Same catalog and image loader as the live collection; no baked screenshot.
    const still = element('div', 'screen-still laptop-rest');
    still.append(this.root.querySelector('.desktop-bar').cloneNode(true));
    const path = element('div', 'file-toolbar', '~/projects');
    const heading = element('div', 'rest-heading', 'Projects');
    const grid = element('div', 'rest-grid');
    for (const project of projects) grid.append(this.projectCard(project));
    still.append(path, heading, grid);
    return still;
  }

  cancelEntrance() {
    for (const animation of this.entrance) animation.cancel();
    this.entrance = [];
  }

  revealContent() {
    this.cancelEntrance();
    if (this.motion.matches) return;
    const nodes = this.current ? this.window.querySelectorAll('.project-preview, .project-copy > *') : this.grid.children;
    const duration = parseFloat(getComputedStyle(this.root).getPropertyValue('--content-enter-dur')) || 400;
    this.entrance = [...nodes].map((node, index) => node.animate([
      {opacity: 0, translate: '0 8px'}, {opacity: 1, translate: '0 0'}
    ], {duration, delay: Math.min(index, 5) * 35, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards'}));
  }

  setSelection(active, projectId) {
    const wasActive = this.active;
    this.active = active;
    this.root.hidden = !active;
    if (!active) {
      this.cancelEntrance();
      this.ready = false;
      this.root.inert = true;
      this.rest.style.visibility = '';
      return;
    }
    const project = projectById.get(projectId) || null;
    const changed = this.current !== (project?.id || null);
    this.current = project?.id || null;
    this.browser.inert = !!project;
    this.browser.setAttribute('aria-hidden', String(!!project));
    this.window.inert = !project;
    this.window.setAttribute('aria-hidden', String(!project));
    this.slider.dataset.page = project ? '2' : '1';
    this.up.hidden = !project;
    this.root.dataset.projectOpen = String(!!project);
    this.root.querySelector('#desktop-path').textContent = project ? `~/projects/${project.id}` : '~/projects';
    this.root.querySelector('#desktop-status-text').textContent = project ? project.category : 'Choose a project to take a closer look.';
    if (project && (changed || !this.window.childElementCount)) this.renderProject(project);
    if (changed && wasActive && this.ready) this.revealContent();
  }

  renderProject(project) {
    this.lastProject = project.id;
    this.window.replaceChildren();
    const media = element('div', 'project-preview');
    media.style.setProperty('--project-color', project.color);
    const fallback = element('div', 'project-preview-fallback');
    fallback.append(element('span', 'preview-monogram', project.mark), element('span', 'preview-fallback-name', project.name));
    media.append(fallback);
    if (project.image) {
      const image = element('img');
      image.alt = project.imageAlt;
      image.addEventListener('load', () => {fallback.hidden = true; image.classList.add('loaded');});
      image.addEventListener('error', () => {image.hidden = true; fallback.hidden = false;});
      image.src = responsiveAsset(project.image);
      media.append(image);
    } else {
      fallback.append(element('span', 'preview-caption', 'Interactive studio phone preview'));
    }
    const copy = element('div', 'project-copy');
    const heading = element('h2', '', project.name);
    heading.id = 'project-heading';
    heading.tabIndex = -1;
    copy.append(element('span', 'project-eyebrow', project.category), heading);
    if(profileContent.summaries[project.name])copy.append(element('p','project-summary',profileContent.summaries[project.name]));
    copy.append(element('p', 'project-description', project.description));
    if (project.role) copy.append(element('p', 'project-role', project.role));
    const link = element('a', 'btn studio-control project-visit', project.id === 'chartroom' ? 'View on GitHub ↗' : project.url ? 'Visit project ↗' : 'Inspect the Helm phone →');
    link.href = project.url || project.route;
    if (project.url) {link.target = '_blank'; link.rel = 'noopener noreferrer';}
    copy.append(link);
    this.window.append(media, copy);
  }

  layout({x, y, s}, ready) {
    this.omarchy.reveal(ready);
    if (!this.active) return;
    // A phone screen expands into the same native controls over the room.
    // Wide screens retain the exact photographic screen plane.
    const expanded = innerWidth <= 700 || innerHeight <= 500;
    this.root.dataset.expanded = String(expanded);
    const entering = ready && !this.ready;
    this.ready = ready;
    this.root.inert = !ready;
    this.root.setAttribute('aria-hidden', String(!ready));
    this.root.classList.toggle('screen-ready', ready);
    if (expanded) {
      const left = 14, top = 78, width = innerWidth - 28, height = innerHeight - 150;
      Object.assign(this.root.style, {width: `${width}px`, height: `${Math.max(180, height)}px`, transform: `translate(${left}px,${top}px)`});
      this.rest.style.visibility = '';
    } else {
      const points = screenQuads.laptop.map(([px, py]) => [x + px * s, y + py * s]);
      const width = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]);
      const height = Math.hypot(points[3][0] - points[0][0], points[3][1] - points[0][1]);
      Object.assign(this.root.style, {width: `${width}px`, height: `${height}px`, transform: quadTransform(points, width, height)});
      this.rest.style.visibility = ready ? 'hidden' : '';
    }
    if (entering) this.revealContent();
  }

  focus() {
    if (!this.active || this.root.inert) return;
    const target = this.current ? this.root.querySelector('#project-heading') : this.grid.querySelector(`[data-project="${this.lastProject}"]`);
    target?.focus({preventScroll: true});
  }
}
