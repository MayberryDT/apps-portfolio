// Three short suggestions per tab, independent of room readiness and route.
(()=>{
const portrait=matchMedia('(max-width:700px) and (orientation:portrait) and (pointer:coarse)');
const key='studio-rotation-hint-v2';
let count=0,retired=false,timer=0,hideTimer=0;
try{const saved=JSON.parse(sessionStorage.getItem(key)||'{}');count=Math.min(3,Math.max(0,Number(saved.count)||0));retired=!!saved.retired}catch{}
const hint=document.createElement('button');hint.id='rotation-hint';hint.type='button';hint.hidden=true;hint.setAttribute('aria-label','More room in landscape. Dismiss rotation suggestion.');
hint.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><g class="rotation-phone"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10 18h4"/></g></svg><span>More room in landscape</span>';
document.body.append(hint);
function save(){try{sessionStorage.setItem(key,JSON.stringify({count,retired}))}catch{}}
function hide(){hint.hidden=true;clearTimeout(hideTimer)}
function eligible(){return !retired&&count<3&&portrait.matches&&!document.hidden}
function schedule(delay=0){clearTimeout(timer);if(eligible())timer=setTimeout(show,delay)}
function show(){if(!eligible())return;hint.hidden=false;count++;save();hideTimer=setTimeout(hide,3000);schedule(5000)}
hint.onclick=()=>{retired=true;save();hide();clearTimeout(timer)};
portrait.addEventListener('change',()=>{if(innerWidth>innerHeight&&matchMedia('(pointer:coarse)').matches){retired=true;save()}hide();schedule()});
document.addEventListener('visibilitychange',()=>{hide();schedule()});
if(eligible())show();
})();
