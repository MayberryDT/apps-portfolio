// Serves Tyler's moved projects unchanged and adds the small `tm.` mark that
// leads back to the studio. Project code is never modified; each project is
// reached through a service binding.
const SITES = {
  'milk.tylermayberry.dev': { binding: 'MILK', from: 'milk' },
  // Decree of War uses every screen edge for its HUD; its own pause menu links home.
  'dow.tylermayberry.dev': { binding: 'DOW', from: 'dow', overlay: false },
  'paycheck.tylermayberry.dev': { binding: 'PAYCHECK', from: 'paycheck' },
  'inntouch.tylermayberry.dev': { binding: 'INNTOUCH', from: 'inntouch' },
  'stayconnect.tylermayberry.dev': { binding: 'STAYCONNECT', from: 'stayconnect' },
  'jobapps.tylermayberry.dev': { binding: 'JOBAPPS', from: 'jobapps' },
  'txtsync.tylermayberry.dev': { binding: 'TXTSYNC', from: 'txtsync' },
};

const STYLE = `<style>
.tm-home-mark{all:initial;position:fixed;z-index:1000;display:flex;align-items:center;gap:0;height:30px;min-width:30px;max-width:30px;padding:0;border-radius:15px;overflow:hidden;box-sizing:border-box;background:rgba(24,20,17,.52);box-shadow:0 1px 2px rgba(0,0,0,.18),inset 0 0 0 1px rgba(255,244,228,.14);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:.62;cursor:pointer;text-decoration:none;-webkit-tap-highlight-color:transparent;transition:max-width .32s cubic-bezier(.2,.7,.2,1),opacity .2s ease,background-color .2s ease;left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom))}
.tm-home-mark img{all:initial;display:block;flex:0 0 30px;width:30px;height:30px;border-radius:15px}
.tm-home-mark span{all:initial;flex:0 0 auto;padding:0 12px 0 6px;font:500 12.5px/30px system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.01em;color:#f6ecdf;white-space:nowrap;opacity:0;transition:opacity .2s ease .06s}
.tm-home-mark:hover,.tm-home-mark:focus-visible{max-width:240px;opacity:1;background:rgba(24,20,17,.82)}
.tm-home-mark:hover span,.tm-home-mark:focus-visible span{opacity:1}
.tm-home-mark:focus-visible{outline:2px solid #f6ecdf;outline-offset:2px}
@media (prefers-reduced-motion:reduce){.tm-home-mark,.tm-home-mark span{transition:none}}
@media print{.tm-home-mark{display:none}}
</style>`;

function mark(site) {
  return `${STYLE}<a class="tm-home-mark" href="https://tylermayberry.dev/?from=${site.from}" aria-label="Tyler Mayberry's studio"><img src="https://tylermayberry.dev/favicon-tm.png" alt="" width="30" height="30"><span>Tyler Mayberry's studio</span></a>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const site = SITES[url.hostname];
    if (!site) return new Response('Not found', { status: 404 });
    if (url.protocol === 'http:') { url.protocol = 'https:'; return Response.redirect(url.href, 301); }
    const response = await env[site.binding].fetch(request);
    const type = response.headers.get('content-type') || '';
    if (site.overlay === false || !type.includes('text/html') || request.method !== 'GET') return response;
    return new HTMLRewriter()
      .on('body', { element(body) { body.append(mark(site), { html: true }); } })
      .transform(response);
  },
};
