// Full screen must start from a visitor's tap and include the entrance and reading view.
(() => {
  const button = document.querySelector('#fullscreen');
  const label = button?.querySelector('.fullscreen-label');
  const status = document.querySelector('#fullscreen-status');
  const root = document.documentElement;
  if (!button) return;
  const supported = () => Boolean(document.fullscreenEnabled && root.requestFullscreen);
  const sync = () => {
    const active = Boolean(document.fullscreenElement);
    button.hidden = !supported() && !active;
    root.dataset.fullscreen = String(active);
    button.setAttribute('aria-label', active ? 'Exit full screen' : 'Enter full screen');
    button.setAttribute('aria-pressed', String(active));
    if (label) label.textContent = active ? 'Exit full screen' : 'Full screen';
  };
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = '';
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.requestFullscreen({navigationUI: 'hide'});
    } catch {
      status.textContent = 'Full screen is not available right now. You can keep exploring in this view.';
    } finally {
      button.disabled = false;
      sync();
    }
  });
  document.addEventListener('fullscreenchange', sync);
  addEventListener('pageshow', sync);
  sync();
})();
