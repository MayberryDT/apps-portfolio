import {connectStudioContent} from './studio-content.js';
import {assetBytes,assetImage,lightingAsset} from './asset-cache.js';
import {setLoading} from './loading-feedback.js';
import {responsiveAsset} from './responsive-assets.js';
import {detailAssets} from './detail-assets.js';
import {Journal} from './journal.js';
import {inspectionBox} from './inspection-layout.js';
import {shelfById,shelfViews} from './shelf-data.js';
import {ShelfGallery} from './shelf-gallery.js';
import {photoById,photoViews} from './photo-stories.js';
import {PhotoGallery} from './photo-gallery.js';
import {createPhotoFrame} from './photo-frames.js';
import {ContactLanding} from './contact-landing.js';
import {objects} from './object-layer.js';
import {areas,extraObjects} from './content.js';
import {tiles,views,artFrames,extraViews,addedPhotos,objectStills} from './scene-data.js';
import {ZoomEngine} from './zoom-engine.js';
import {Workstation} from './workstation.js';
import {projectById} from './projects.js';
import {renderStoryTabs,selectedStoryTab} from './studio-ui.js';
const directAreas=new Set(['contact','journal']);
const $=id=>document.getElementById(id),stage=$('scene');
const motion=matchMedia('(prefers-reduced-motion: reduce)'),zoom=new ZoomEngine();
const readyAreas=new Set(),areaTasks=new Map();
const state={busy:false,readyAreas:[],detailsReady:false,area:'room',object:null,focused:false,ready:false,progress:0,angle:0,width:1448,height:1086,transform:'',moving:false,detailCount:0,route:null,loadingObject:null,handoff:false,returningObject:null};
Object.defineProperty(state,'tab',{enumerable:true,get:selectedStoryTab});
let cameras,raf=0,phoneDrag=null,drag=null,last=0,targetAngle=0,selectionToken=0,retryAction=()=>location.reload();
const announce=s=>$('announcement').textContent=s;
const request=()=>{if(!raf)raf=requestAnimationFrame(draw)};
function panelVisible(value){journal.show(value&&state.detailsReady&&state.object==='notebook'&&journal.state.lift===1).then(()=>{if(state.object==='notebook'&&journal.visible&&(journal.ready||journal.error))setBusy(null)});const show=value&&!['monitor','pixel'].includes(state.object);document.body.dataset.focused=String(value&&(state.object!=='notebook'||journal.state.lift===1));$('story-panel').inert=!show;$('story-panel').setAttribute('aria-hidden',String(!show));workstation.layout(zoom.current,value&&!state.moving)}
function geometry(){
 const {x,y,s}=zoom.current;
 state.transform=`translate(${x}px,${y}px) scale(${s})`;stage.style.transform=state.transform;
 journal.layout(zoom.current);objects.view({x,y,s,vw:innerWidth,vh:innerHeight});if(objects.state.active==='pixel')objects.pixel.pose();if(objects.state.active==='helm')objects.helm.pose();objects.prop?.pose();syncContact();workstation.layout(zoom.current,state.focused&&!state.moving);gallery.layout(zoom.current);shelf.layout(zoom.current);positionHits();
}
function positionHits(){
 const {x,y,s}=zoom.current;
 const narrow=innerWidth<=700,portrait=narrow&&innerHeight>innerWidth;
 $('node-leaders').setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
 for(const hit of $('hotspots').children){
  const v={...views[hit.dataset.area],...(state.area!=='room'?(photoViews[hit.dataset.object]||shelfViews[hit.dataset.object]||extraViews[hit.dataset.object]):{})},p=v.point;
  let ax=x+p[0]*s,ay=y+(state.area==='room'?p[1]:v.bounds[3])*s;
  if(!state.focused&&state.area!=='room'&&v.nodePoint){const node=(narrow||innerHeight<=500)&&v.mobileNodePoint||v.nodePoint;ax=x+node[0]*s;ay=y+node[1]*s}
  const expandedLaptop=state.focused&&state.object==='monitor'&&(narrow||innerHeight<=500);
  if(expandedLaptop){ax=innerWidth/2;ay=innerHeight-36}
  if(hit.dataset.object==='helm'&&state.area!=='room'&&objects.state.active==='helm'){const b=objects.helm.bounds();ax=(b[0]+b[2])/2;ay=b[3]}
  const offsets=state.area==='room'&&(narrow||innerHeight<=500)?{desk:[0,-30],photos:[innerHeight<=500?-25:0,-18],bookshelf:[innerHeight<=500?25:0,40],journal:[0,34],contact:[0,48]}:{};
  if(state.area==='room'&&portrait){
   // Distribute labels around their real objects, retaining short visible tethers.
   const placements={desk:[.20,.42],photos:[.51,.24],bookshelf:[.79,.42],contact:[.20,.74],journal:[.79,.74]};
   const [px,py]=placements[hit.dataset.area];
   offsets[hit.dataset.area]=[innerWidth*px-ax,y+1086*s*py-ay];
  }
  const [dx,dy]=expandedLaptop?[0,0]:offsets[hit.dataset.area]||[0,state.area==='room'?0:30];
  const w=hit.offsetWidth,h=hit.offsetHeight;
  const ceiling=state.focused&&narrow&&state.object!=='monitor'?$('story-panel').getBoundingClientRect().top-14:innerHeight-18;
  const nx=Math.max(w/2+14,Math.min(innerWidth-w/2-14,ax+dx));
  const ny=Math.max(92+h/2,Math.min(ceiling-h/2,ay+dy));
  Object.assign(hit.style,{left:nx+'px',top:ny+'px'});
  for(const [key,value] of Object.entries({x1:ax,y1:ay,x2:nx,y2:ny}))hit.tether.setAttribute(key,value);
  hit.tether.style.opacity=Math.hypot(ax-nx,ay-ny)>12?'.65':'0';
 }
 if(objects.handset){const [l,t,r,b]=objects.handset.bounds();Object.assign($('phone-drag').style,{left:l+'px',top:t+'px',width:(r-l)+'px',height:(b-t)+'px'})}
 if(objects.prop){const[l,t,r,b]=objects.prop.bounds();Object.assign($('figure-drag').style,{left:l+'px',top:t+'px',width:(r-l)+'px',height:(b-t)+'px'})}
 const [ix,iy,iw,ih]=inspectionBox();Object.assign($('shelf-controls').style,{left:(ix+iw/2)+'px',top:(iy+ih+12)+'px'});

}
function syncContact(){contact.layout({selected:state.focused&&state.object==='pixel',phone:objects.state.active==='pixel'?objects.pixel:null,moving:state.moving,failed:!$('error').hidden&&!state.loadingObject})}
function focusDestination(){
 if($('world').inert)return;
 if(state.focused&&state.object==='notebook'){journal.focus();return}
 if(state.focused&&state.object==='pixel'){if(contact.visible)contact.focus();return}
 if(state.focused&&state.object==='monitor'){workstation.focus();return}
 if(state.focused){$('story-title').tabIndex=-1;$('story-title').focus({preventScroll:true})}
 else if(state.area==='photos')gallery.focusCurrent();
 else if(state.area==='bookshelf')shelf.focusCurrent();
 else if(state.area!=='room')$('hotspots').querySelector('button')?.focus({preventScroll:true});
 else $('world').focus({preventScroll:true});
}
function draw(now){
 raf=0;const dt=last?Math.min((now-last)/1000,.05):.016;last=now;
 const wasMoving=!!zoom.active,t=zoom.tick(now);state.moving=!!zoom.active;
 if(wasMoving){geometry();state.progress=state.focused?t:1-t;if(state.focused&&t>.8)panelVisible(true);if(!state.moving){panelVisible(state.focused);focusDestination()}}
 const diff=targetAngle-state.angle;state.angle=Math.abs(diff)<.0001?targetAngle:state.angle+diff*(drag||motion.matches?1:1-Math.exp(-dt*11));
 const journalChanged=journal.tick(now);if(journalChanged&&journal.state.lift===1&&state.object==='notebook')panelVisible(state.focused&&!state.moving);
 const phoneChanged=objects.actor?.tick(now);if(phoneChanged){positionHits();syncHelmControls();objects.renderer.shadowMap.needsUpdate=true}
 if(state.returningObject&&objects.state.active){
  const done=objects.actor?.state.lift===0;
  if(done){state.returningObject=null;objects.hide();syncImages();updateInteractionControls()}
 }
 objects.resize(innerWidth,innerHeight,state.moving||!!objects.actor?.state.moving);objects.draw(state.angle);syncContact();
 if(state.moving||journal.state.moving||objects.actor?.state.moving||Math.abs(targetAngle-state.angle)>.0001)request();
 else {stage.style.willChange='auto'}
}
function anticipateShelf(event){
 if(event.type==='pointerover'&&event.pointerType!=='mouse'||navigator.connection?.saveData)return;
 const id=event.target.closest('[data-shelf]')?.dataset.shelf;
 if(!id||!state.ready||state.moving||objects.state.lost)return;
 objects.prepare(id,$('objects'),cameras.room).catch(()=>{});
}
$('world').addEventListener('pointerover',anticipateShelf);

function validObject(area,id){return area!=='room'&&(areas[area]?.object===id||(area==='desk'&&['helm','omarchy'].includes(id))||(area==='photos'&&photoById.has(id))||(area==='bookshelf'&&shelfById.has(id)))}
function parse(){
 const entry={about:'contact/about',press:'journal/facts'}[document.body.dataset.entry];
 const raw=location.hash.slice(1)||entry||'';
 const[a,rawId,p]=(raw==='work'?'desk/monitor':raw).split('/'),area=areas[a]?a:'room';
 // Single-destination areas retain old links without an intermediate menu.
 if(directAreas.has(area)){
  const detail=area==='contact'&&rawId==='about'?'about':area==='journal'&&rawId==='facts'?'facts':null;
  const canonical='#'+area+(detail?'/'+detail:'');
  if(location.hash!==canonical)history.replaceState(null,'',canonical);
  return{area,focused:true,object:areas[area].object,project:null,detail};
 }
 const id=rawId;
 const focused=validObject(area,id),project=focused&&id==='monitor'&&projectById.has(p)?p:null;
 return{area,focused,object:focused?id:null,project,detail:null};
}
function navigate(area,focused=false,object=areas[area]?.object,project=null){
 if(!areas[area])area='room';
 const route=directAreas.has(area)?'#'+area:'#'+area+(focused&&validObject(area,object)?'/'+object:'')+(focused&&object==='monitor'&&projectById.has(project)?'/'+project:'');
 if(location.hash!==route)history.pushState(null,'',route);if(state.ready)applyRoute();
}
function back(){
 if(directAreas.has(state.area)){navigate('room');return}
 if(state.focused&&state.object==='monitor'&&state.project){navigate('desk',true,'monitor');return}
 navigate(state.focused?state.area:'room');
}
function setBusy(label){state.busy=!!label;setLoading(label)}
function failure(message,fn){setBusy(null);$('error-message').textContent=message;$('error').hidden=false;retryAction=fn;syncContact()}
function applyRoute({initial=false}={}){
 const next=parse(),route=next.area+(next.focused?'/'+next.object:'')+(next.project?'/'+next.project:'')+(next.detail?'/'+next.detail:'');
 const sameView=state.area===next.area&&state.object===next.object&&state.focused===next.focused;
 if(state.route===route&&!initial)return;
 $('error').hidden=true;drag=null;phoneDrag=null;document.body.dataset.dragging='false';
 if(state.object!==next.object)state.angle=0;
 Object.assign(state,next,{route});state.detailsReady=readyAreas.has(state.area);targetAngle=0;setBusy(null);
 document.body.dataset.area=state.area;document.body.dataset.object=state.object||'none';if(document.body.dataset.arrival!=='hero')document.title=(projectById.get(state.project)?.name||photoById.get(state.object)?.title||shelfById.get(state.object)?.title||extraObjects[state.object]?.title||areas[state.area]?.name||'Tyler’s studio')+' · Tyler Mayberry';
 if((document.body.dataset.entry==='about'&&state.detail==='about')||(document.body.dataset.entry==='press'&&state.detail==='facts'))document.title=document.body.dataset.entryTitle;
 updateUI();
 // Cache the photographic composite during travel; rerasterize once when settled.
 stage.style.willChange='transform';
 // Camera response is independent of model loading, as in Photos and Notes.
 zoom.start(zoom.target(state.area,state.focused,innerWidth,innerHeight,state.object),{immediate:initial||motion.matches||sameView,duration:state.focused?1050:1150});
 state.moving=!!zoom.active;state.progress=state.focused&&!state.moving?1:0;
 panelVisible(state.focused&&!state.moving);objects.resize(innerWidth,innerHeight,state.moving||!!objects.actor?.state.moving);geometry();request();
 prepareInspection({initial});
 if(!state.moving)focusDestination();
 announce(directAreas.has(state.area)?areas[state.area].name+'. Escape returns to the room.':state.project?projectById.get(state.project).name+'. Escape returns to all projects.':state.focused?'Inspecting '+(photoById.get(state.object)||shelfById.get(state.object)||extraObjects[state.object]||areas[state.area]).objectName+'. Escape returns to the area.':state.area==='room'?'At the doorway. Choose an area.':areas[state.area].name+'. Select an object to inspect.');
}

function updateUI(){
 contact.select(state.detail==='about');
 if(state.detail==='facts')journal.openReference();else journal.referencePending=false;
 if(state.object!=='notebook')journal.show(false);
 const area=areas[state.area],focused=state.focused,item=focused&&(photoById.get(state.object)||shelfById.get(state.object)||extraObjects[state.object])||area;
 gallery.select(state.area,focused,state.object);
 shelf.select(state.area,focused,state.object);
 workstation.setSelection(focused&&state.object==='monitor',state.project);
 workstation.omarchy.select(focused&&state.object==='omarchy');
 $('story-panel').hidden=focused&&['monitor','pixel'].includes(state.object);
 $('room-return').hidden=state.area==='room';
 $('return').hidden=!focused||directAreas.has(state.area)||(state.object==='monitor'&&!!state.project);
 const backLabel=state.project?'Back to Projects':state.area==='bookshelf'?'Back to Shelf':state.area==='photos'?'Back to Photos':state.object==='monitor'?'Back to Desk':'Back to '+(area?.label||'Room');
 $('return').textContent=backLabel;$('return').setAttribute('aria-label',backLabel);
 $('story-panel').inert=!focused||['pixel'].includes(state.object);$('story-panel').setAttribute('aria-hidden',String(!focused||['pixel'].includes(state.object)));
 if(state.object!=='pixel')syncContact();
 updateInteractionControls();
 $('hotspots').replaceChildren();$('node-leaders').replaceChildren();
 const entries=(state.area==='room'?Object.keys(areas):[state.area]).map(key=>({key,item:areas[key]}));
 if(state.area==='desk'&&!focused)entries.push({key:'desk',item:extraObjects.omarchy},{key:'desk',item:extraObjects.helm});
 if(focused&&extraObjects[state.object])entries[0].item=extraObjects[state.object];
 for(const {key,item} of entries){
  if(focused||state.area==='photos'||state.area==='bookshelf'||directAreas.has(state.area))continue;
  const hit=document.createElement('button');hit.type='button';hit.dataset.area=key;hit.dataset.object=item.object;hit.className='btn scene-node '+(state.area==='room'?'area-hit':'object-hit');
  hit.setAttribute('aria-label',focused?'Back to '+area.name.toLowerCase():state.area==='room'?'Visit '+areas[key].name.toLowerCase():'Inspect '+item.objectName);
  const label=focused?'← '+area.label:state.area==='room'?areas[key].label:item.object==='helm'?'Helm':item.objectName.replace(/^The |^the /,'');
  hit.innerHTML='<i aria-hidden="true"></i><span></span>';
  hit.querySelector('span').textContent=label.charAt(0).toUpperCase()+label.slice(1);
  hit.onclick=()=>{if(focused)navigate(state.area);else if(state.area==='room')navigate(key,directAreas.has(key));else navigate(key,true,item.object)};
  hit.tether=document.createElementNS('http://www.w3.org/2000/svg','line');$('node-leaders').append(hit.tether);
  $('hotspots').append(hit);
 }
 if(!area)return;
 $('category').textContent=item.category;$('mark').textContent=item.mark;$('story-title').replaceChildren(document.createTextNode(item.title));
 const sub=document.createElement('span');sub.textContent=item.subtitle;$('story-title').append(sub);$('footnote').textContent=item.footnote;
 renderStoryTabs(['pixel','notebook'].includes(state.object)?[]:item.tabs);
 if(state.object==='notebook'){$('category').textContent='NOTES / VOLUME 01';$('mark').textContent='';$('story-title').textContent='Contents';$('footnote').textContent='';}
 $('stories').querySelectorAll('[data-helm-page],[data-helm-action]').forEach(b=>b.disabled=objects.state.active!=='helm');$('story-panel').querySelector('.glass-content').scrollTop=0;
}
function rotate(amount,pitch=0){if(objects.prop&&state.focused&&objects.state.active===state.object){const s=objects.prop.state;objects.prop.turn(s.yaw+amount,s.pitch+pitch);positionHits();request()}}
$('return').onclick=back;
$('room-return').onclick=()=>navigate('room');
$('figure-drag').onpointerdown=e=>{if(!objects.prop)return;drag={x:e.clientX,y:e.clientY,yaw:objects.prop.state.yaw,pitch:objects.prop.state.pitch};$('figure-drag').setPointerCapture(e.pointerId);document.body.dataset.dragging='true'};
$('figure-drag').onpointermove=e=>{if(drag&&objects.prop){objects.prop.turn(drag.yaw+(e.clientX-drag.x)*.012,drag.pitch+(e.clientY-drag.y)*.005);positionHits();request()}};
$('figure-drag').onpointerup=$('figure-drag').onpointercancel=()=>{drag=null;document.body.dataset.dragging='false'};
$('figure-drag').onkeydown=e=>{if(e.key.startsWith('Arrow')){e.preventDefault();rotate(e.key==='ArrowLeft'?-.25:e.key==='ArrowRight'?.25:0,e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0)}else if(e.key==='Home'){e.preventDefault();objects.prop?.reset();positionHits();request()}};
$('shelf-controls').onclick=e=>{const action=e.target.closest('[data-prop-action]')?.dataset.propAction;if(!action||!objects.prop)return;if(action==='reset')objects.prop.reset();else rotate(action==='left'?-.4:.4);positionHits();request()};
$('retry').onclick=()=>{$('error').hidden=true;retryAction()};
$('error-dismiss').onclick=()=>{$('error').hidden=true;syncContact();focusDestination()};
addEventListener('keydown',e=>{if(!e.defaultPrevented&&e.key==='Escape'&&state.area!=='room'){e.preventDefault();back()}});
addEventListener('popstate',()=>state.ready&&applyRoute());addEventListener('hashchange',()=>state.ready&&applyRoute());
addEventListener('resize',()=>{if(state.ready){journal.resize();zoom.start(zoom.target(state.area,state.focused,innerWidth,innerHeight,state.object),{immediate:true});state.moving=false;state.progress=state.focused?1:0;panelVisible(state.focused);objects.resize(innerWidth,innerHeight,state.moving||!!objects.actor?.state.moving);geometry();request()}});
motion.addEventListener('change',()=>{if(motion.matches){journal.select(state.object==='notebook',true);state.returningObject=null;objects.helm?.focus(wanted3D()==='helm',true);objects.pixel?.focus(wanted3D()==='pixel',true);objects.prop?.focus(wanted3D()===objects.state.active,true);if(!wanted3D())objects.hide();syncImages();updateInteractionControls();zoom.finish();state.moving=false;state.progress=state.focused?1:0;panelVisible(state.focused);geometry();request()}});
$('objects').addEventListener('webglcontextlost',e=>{e.preventDefault();selectionToken++;state.loadingObject=null;state.handoff=false;state.returningObject=null;objects.state.ready=false;objects.state.lost=true;objects.hide();syncImages();updateInteractionControls();failure('The 3D object paused. Its image and the room are still available.',()=>location.reload())});
function wanted3D(){return state.focused&&(['helm','pixel'].includes(state.object)||shelfById.has(state.object))?state.object:null}
function syncImages(){
 document.body.dataset.liveObject=objects.state.active||'none';
 for(const id of shelfById.keys()){const img=$('still-'+id);if(img)img.style.opacity=objects.state.active===id?'0':'1'}
 document.body.dataset.helmReveal=String(state.handoff||objects.state.active==='helm');syncContact();
}
function syncHelmControls(){
 const h=objects.helm;if(!h)return;
 $('stories').querySelectorAll('[data-helm-page]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.helmPage)===h.state.page)));
 const [primary,secondary]=h.controls;
 const set=(action,text)=>{const b=$('stories').querySelector(`[data-helm-action="${action}"]`);if(b)b.textContent=text};
 set('primary',primary);set('secondary',secondary);set('flip',Math.abs(h.state.yaw)>1.6?'View front':'View back');
}
function updateInteractionControls(){
 syncHelmControls();
 $('phone-drag').hidden=!(state.focused&&state.object==='helm'&&objects.state.active==='helm'&&objects.state.ready);
 $('phone-drag').setAttribute('aria-label',state.object==='pixel'?'Contact phone. Drag or use arrow keys to turn.':'Helm phone. Drag to tilt, arrow keys to turn, tap the screen to explore.');
 const active=state.focused&&shelfById.has(state.object)&&objects.state.active===state.object&&objects.state.ready;
 $('figure-drag').setAttribute('aria-label',`${shelfById.get(state.object)?.title||'Shelf object'}. Drag to rotate and tilt, use arrow keys, or Home to reset.`);
 $('figure-drag').hidden=!active;$('shelf-controls').hidden=!active;
 $('stories').querySelectorAll('[data-helm-page],[data-helm-action]').forEach(b=>b.disabled=objects.state.active!=='helm'||!objects.state.ready);
}
async function prepareInspection({initial=false}={}){
 const id=wanted3D(),token=++selectionToken,area=state.area;state.loadingObject=null;state.handoff=false;
 if(area!=='room'&&(!readyAreas.has(area)||id&&!objects.state.loaded.includes(id)||state.object==='notebook'&&!journal.ready))setBusy('Opening '+(state.object==='notebook'?'Notes':id==='pixel'?'Contact':id==='helm'?'Helm':shelfById.get(id)?.title||areas[area].label)+'…');
 const journalPrepared=state.object==='notebook'?journal.load().then(()=>({}),error=>({error})):null;
 // Start only the requested phone while the room details decode. Capture failure
 // now, and retain the selection-token guard before activating any loaded object.
 const phonePrepared=['helm','pixel'].includes(id)?objects.prepare(id,$('objects'),cameras.room).then(entry=>({entry}),error=>({error})):null;
 if(state.area!=='room'&&!state.detailsReady){
  try{await ensureDetails(area)}catch(error){if(token===selectionToken)failure('This area could not finish loading. You can return to the room or try again.',()=>prepareInspection({initial}));return;}
  if(token!==selectionToken)return;
 }
 const notebook=state.focused&&state.object==='notebook';
 if(!notebook){journal.select(false,initial||motion.matches);request();if(id&&journal.state.moving){await new Promise(resolve=>{const poll=()=>{if(token!==selectionToken||!journal.state.moving)resolve();else requestAnimationFrame(poll)};poll()});if(token!==selectionToken)return;}}
 if(id&&objects.state.active===id){setBusy(null);state.returningObject=null;objects.actor?.focus(true,initial||motion.matches);syncImages();updateInteractionControls();request();return}
 // Decode the incoming asset while the outgoing owner returns. Capture errors
 // immediately so an interrupted selection cannot leave an unhandled rejection.
 const prepared=phonePrepared||(id&&shelfById.has(id)?new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))).then(()=>objects.prepare(id,$('objects'),cameras.room)).then(entry=>({entry}),error=>({error})):null);
 const previous=objects.actor;
 if(previous){
  if(initial||motion.matches||!objects.state.ready){previous.focus(false,true);state.returningObject=null;objects.hide()}
  else{
   if(state.returningObject!==objects.state.active){state.returningObject=objects.state.active;previous.focus(false)}
   syncImages();updateInteractionControls();request();
   if(!id&&!notebook){setBusy(null);return;}
   // One active owner throughout handoff; a new selection can reverse or replace
   // this wait without leaving a stale load able to activate itself.
   await new Promise(resolve=>{const poll=()=>{if(token!==selectionToken||!previous.state.moving)resolve();else requestAnimationFrame(poll)};poll()});
   if(token!==selectionToken)return;
   if(objects.state.active){objects.hide();state.returningObject=null}
  }
 }
 if(notebook){const result=await journalPrepared;if(token!==selectionToken)return;if(result.error){failure('Notes could not finish loading. Please try again.',()=>prepareInspection({initial}));return}journal.select(true,initial||motion.matches);if(initial||motion.matches)panelVisible(true);syncImages();updateInteractionControls();request();return;}
 if(!id){setBusy(null);syncImages();updateInteractionControls();request();return}
 state.loadingObject=id;syncImages();updateInteractionControls();
 try{
  if(prepared){const result=await prepared;if(result.error)throw result.error}else await objects.prepare(id,$('objects'),cameras.room);
  if(token!==selectionToken||wanted3D()!==id)return;
  if(id==='helm'){
   state.handoff=true;syncImages();
   if(!initial&&!motion.matches)await new Promise(resolve=>setTimeout(resolve,220));
   if(token!==selectionToken||wanted3D()!==id)return;
  }
  state.handoff=false;objects.activate(id);setBusy(null);
  objects.actor?.focus(false,true);
  state.loadingObject=null;objects.actor?.focus(true,initial||motion.matches);
  objects.resize(innerWidth,innerHeight,state.moving||!!objects.actor?.state.moving);geometry();
  syncImages();updateInteractionControls();request();
 }catch(error){
  if(token!==selectionToken)return;
  state.loadingObject=null;state.handoff=false;objects.hide();syncImages();updateInteractionControls();
  if(shelfById.has(id))panelVisible(state.focused);
  console.warn('Inspection unavailable:',error.message);
  failure('This 3D object could not open. Its image is still available.',()=>objects.state.lost?location.reload():prepareInspection());
 }
}

// Settle all contributors before exposing or cleaning up an attempted composite.
// A rejected image must not append late DOM into a subsequent retry.
async function required(tasks){
 const results=await Promise.allSettled(tasks),failed=results.find(r=>r.status==='rejected');
 if(failed)throw failed.reason;
 return results.map(r=>r.value);
}
const regionKeys={photos:['photo-wall-clean'],desk:['photographic-desk','helm-reveal'],contact:['contact-clean'],bookshelf:['bookshelf','shelf-empty','carton-removed'],journal:['chair','journal','notebook','journal-clean']};
async function installDetails(area){
 const region=document.createElement('div');region.className='detail-region';region.dataset.region=area;
 const selected=tiles.filter(tile=>regionKeys[area]?.includes(tile.key||tile.id));
 await required(selected.map(async tile=>{
  const key=tile.key||tile.id,asset=detailAssets[key],img=await assetImage(responsiveAsset(asset.src));
  const wrap=document.createElement('div');wrap.className='detail-layer';wrap.dataset.detail=key;
  const poly=tile.clip.map(p=>p.join(',')).join(' ');
  const mask=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1448 1086"><defs><filter id="s"><feGaussianBlur stdDeviation="${tile.feather}"/></filter></defs><polygon points="${poly}" fill="white" filter="url(#s)"/></svg>`;
  wrap.style.maskImage=`url("data:image/svg+xml,${encodeURIComponent(mask)}")`;
  const copy=img.cloneNode();copy.alt='';copy.draggable=false;const[x,y,w,h]=asset.rect;Object.assign(copy.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});wrap.append(copy);
  // Preserve source stacking order even when image downloads finish out of order.
  wrap.dataset.order=String(tiles.indexOf(tile));region.append(wrap);
 }));
 [...region.children].sort((a,b)=>Number(a.dataset.order)-Number(b.dataset.order)).forEach(el=>region.append(el));
 if(area==='photos')await required(addedPhotos.map(async(photo,index)=>{
  const original=await assetImage(responsiveAsset(`assets/photos/${photo.src}.webp`)),img=original.cloneNode();img.alt=photo.alt;img.className='wall-photo';region.append(await createPhotoFrame(photo,img,index));
 }));
 const stills=objectStills.filter(still=>area==='contact'?still.id==='contact-rest':area==='desk'?still.id==='helm-rest':area==='bookshelf'?shelfById.has(still.id):false);
 await required(stills.map(async still=>{const original=await assetImage(responsiveAsset(`stills/${still.id}.webp`)),img=original.cloneNode();img.id='still-'+still.id;img.className='object-still';img.alt='';img.draggable=false;const[x,y,w,h]=still.rect;Object.assign(img.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});region.append(img)}));
 await required([...region.querySelectorAll('img')].map(img=>img.decode()));return region;
}
async function ensureDetails(area=state.area){
 if(area==='room'||readyAreas.has(area))return;
 if(areaTasks.has(area))return areaTasks.get(area);
 const task=(async()=>{
  const [region]=await required([installDetails(area),area==='journal'?journal.prepare():area==='desk'?workstation.prepareImages():Promise.resolve()]);
  // Keep the accepted baked overview beneath each independently decoded region.
  // Unvisited areas retain their complete artwork instead of being stripped bare.
  $('details').append(region);readyAreas.add(area);state.readyAreas=[...readyAreas];state.detailCount=$('details').querySelectorAll('.detail-layer').length;
  state.detailsReady=readyAreas.has(state.area);document.body.dataset[area+'Ready']='true';
  if(area==='journal')journal.activatePhoto();syncImages();geometry();request();
 })();
 areaTasks.set(area,task);try{return await task}finally{areaTasks.delete(area)}
}
// Bounded, low-priority warmup runs only while the visitor has a usable view.
// It retains results in the same caches consumed by foreground selections.
const warmSteps=[()=>Promise.all([ensureDetails('journal'),journal.load()]),()=>assetBytes(lightingAsset('phone'),'low'),()=>Promise.all(['portrait','landscape','compact'].map(kind=>assetImage(`assets/contact-screen-${kind}.webp`,'low'))),()=>objects.prepare('pixel',$('objects'),cameras.room)];
let warmIndex=0,warming=false;
function warmNext(){
 const connection=navigator.connection;
 if(warming||warmIndex>=warmSteps.length||connection?.saveData||/2g/.test(connection?.effectiveType||''))return;
 if(!state.ready||state.busy||state.moving||objects.actor?.state.moving||document.hidden||document.body.dataset.arrival&&document.body.dataset.arrival!=='room'){setTimeout(warmNext,1200);return}
 warming=true;Promise.resolve().then(warmSteps[warmIndex++]).catch(()=>{}).finally(()=>{warming=false;setTimeout(warmNext,1200)});
}
setTimeout(warmNext,3500);
async function start(){
 try{
  const response=await fetch('assets/scenes.json');if(!response.ok)throw new Error('Camera unavailable');cameras=await response.json();
  cameras.room.registration=[.997,1,-.0025,-.033];cameras.room.artFrames=artFrames;cameras.room.artQuads={};
  await $('plate').decode();
  state.ready=true;$('loading').hidden=true;applyRoute({initial:true});return true;
 }catch(e){$('loading').hidden=true;failure('The detailed studio could not load. Please try again.',()=>location.reload());return false;}
}
$('phone-drag').onpointerdown=e=>{phoneDrag={x:e.clientX,y:e.clientY,yaw:objects.handset.state.yaw,pitch:objects.handset.state.pitch,moved:false};$('phone-drag').setPointerCapture(e.pointerId)};
$('phone-drag').onpointermove=e=>{if(!phoneDrag||!objects.handset)return;const dx=e.clientX-phoneDrag.x,dy=e.clientY-phoneDrag.y;if(Math.hypot(dx,dy)>5)phoneDrag.moved=true;if(phoneDrag.moved){objects.handset.turn(phoneDrag.yaw+dx*.012,phoneDrag.pitch+dy*.003);syncHelmControls();positionHits();request()}};
$('phone-drag').onpointerup=e=>{if(phoneDrag&&!phoneDrag.moved&&objects.handset?.tap(e.clientX,e.clientY)){syncHelmControls();announce(state.object==='pixel'?'Contact email opened.':'Helm screen updated.');request()}phoneDrag=null};
$('phone-drag').onpointercancel=()=>{phoneDrag=null};
$('phone-drag').onkeydown=e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();const h=objects.handset;if(!h)return;h.turn(h.state.yaw+(e.key==='ArrowLeft'?-.08:e.key==='ArrowRight'?.08:0),h.state.pitch+(e.key==='ArrowUp'?-.04:e.key==='ArrowDown'?.04:0));syncHelmControls();positionHits();request()};
$('stories').addEventListener('click',e=>{const b=e.target.closest('[data-helm-page],[data-helm-action]');if(!b||objects.state.active!=='helm'||!objects.state.ready)return;if(b.dataset.helmPage!==undefined)objects.helm.select(Number(b.dataset.helmPage));else objects.helm.action(b.dataset.helmAction);syncHelmControls();announce('Helm screen updated.');request()});
const gallery=new PhotoGallery({world:$('world'),panel:$('story-panel'),onSelect:id=>navigate('photos',true,id),onBack:()=>navigate('photos')});
const shelf=new ShelfGallery({world:$('world'),panel:$('story-panel'),scene:stage,onSelect:id=>navigate('bookshelf',true,id),onBack:()=>navigate('bookshelf')});
const journal=new Journal({host:$('world'),panel:$('story-panel'),onClose:()=>navigate('room')});
const contact=new ContactLanding($('world'));
const workstation=new Workstation({scene:stage,world:$('world'),onProject:project=>navigate('desk',true,'monitor',project)});
window.studio={state,objects,zoom,journal,contact,gallery,shelf,navigate,views,tiles,workstation,focusDestination,prepareRoute:()=>applyRoute({initial:true}),get cameras(){return cameras}};
window.studio.initialized=start();
connectStudioContent(window.studio);

new ResizeObserver(()=>{if(objects.state.active==='helm'&&state.focused){objects.helm.pose();positionHits();request()}}).observe($('story-panel'));
