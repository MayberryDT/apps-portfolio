// Ordinary links retain real document destinations. Inside the running studio
// they select the same objects, so the room remains the navigation.
export function connectStudioContent(studio) {
  document.addEventListener('click', event => {
    const link=event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download') || !studio.state.ready) return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin)return;
    const route=url.pathname==='/about.html'&&!url.hash?'#contact/about':url.pathname==='/press.html'&&!url.hash?'#journal/facts':url.pathname==='/'&&url.hash==='#work'?'#desk/monitor':null;
    if(!route)return;
    event.preventDefault();
    if(location.hash===route)studio.prepareRoute();else location.hash=route;
  });
  studio.initialized.then(ok=>{
    if(!ok)return;
    if(!document.body.dataset.entry){document.documentElement.classList.add('studio-running');return;}
    // Leave the full original document readable until its object actually opens.
    // If an asset/module fails, the original URL is still useful.
    const started=performance.now();
    const check=()=>{
      const state=studio.state;
      const ready=state.area==='contact'?studio.contact.visible:state.area==='journal'?studio.journal.visible&&studio.journal.ready:!state.busy&&!state.moving&&!state.loadingObject&&!state.returningObject&&(state.area==='room'||state.detailsReady); 
      if(ready){document.documentElement.classList.add('studio-running');studio.focusDestination();return;}
      if(performance.now()-started<60000)requestAnimationFrame(check);
    };
    check();
  }).catch(()=>{/* The server-rendered document remains available. */});
}
