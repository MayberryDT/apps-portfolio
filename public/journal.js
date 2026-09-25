import {profileContent} from './profile-content.js';
import {responsiveAsset} from './responsive-assets.js';
import {JournalTopics} from './journal-topics.js';
import {projectQuad} from './journal-pose.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mobileView=matchMedia('(max-width:700px), (max-height:600px) and (pointer:coarse)');

// Original, locally synthesized paper noise. No remote audio, autoplay, or media permissions.
class PaperSound {
 constructor(){this.enabled=true;this.voices=new Set();this.played=0;try{this.enabled=localStorage.getItem('journal-sound')!=='off'}catch{}}
 unlock(){if(!this.enabled)return;try{this.context??=new (window.AudioContext||window.webkitAudioContext)();this.context.resume().catch(()=>{});}catch{}}
 toggle(){this.enabled=!this.enabled;try{localStorage.setItem('journal-sound',this.enabled?'on':'off')}catch{}if(this.enabled)this.unlock();else this.stop();}
 turn(strength=1,duration=.24){
  const c=this.context;if(!this.enabled||!c||c.state!=='running')return;
  const length=Math.ceil(c.sampleRate*duration),buffer=c.createBuffer(1,length,c.sampleRate),samples=buffer.getChannelData(0);let smooth=0;
  for(let i=0;i<length;i++){smooth=.58*smooth+.42*(Math.random()*2-1);samples[i]=smooth*(.65+.35*Math.sin(i/97));}
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1300+Math.random()*1200;filter.Q.value=.65;
  source.connect(filter).connect(gain).connect(c.destination);const t=c.currentTime;
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.34*strength,t+.025);gain.gain.exponentialRampToValueAtTime(.025,t+duration*.7);gain.gain.linearRampToValueAtTime(0,t+duration);
  this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect()};source.start();source.stop(t+duration);this.played++;
 }
 stop(){for(const v of this.voices){try{v.stop()}catch{}}this.voices.clear()}
}

const paragraphs=s=>String(s??'').split(/\n\s*\n/).map(p=>`<p>${esc(p)}</p>`).join('');
export class Journal {
 constructor({host,panel=null,onClose=()=>{}}){
  this.host=host;this.panel=panel;this.state={lift:0,moving:false,mode:'resting'};this.view={x:0,y:0,s:1};this.onClose=onClose;this.page=0;this.target=0;this.token=0;this.visible=false;this.ready=false;this.sound=new PaperSound();this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.trace=[];
  this.root=document.createElement('section');this.root.id='journal-reader';this.root.hidden=true;this.root.inert=true;this.root.setAttribute('aria-label','Interactive journal');
  this.root.innerHTML=`<div class="journal-shell"><div class="journal-stage"><img class="journal-photo" data-src="journal-assets/notebook-photo.webp" alt="An open cream-paper journal with a woven cloth cover" draggable="false"><div class="journal-binding"><div class="journal-book"></div><div class="journal-riffle" aria-hidden="true"></div></div></div><footer class="journal-footer"><button class="btn studio-control j-prev" data-action="previous" aria-label="Previous page">←</button><div class="journal-pagination"><span class="journal-page-number" role="status" aria-live="polite"></span><span class="journal-instruction">Drag a corner or use the arrows</span></div><button class="btn studio-control j-next" data-action="next" aria-label="Next page">→</button></footer><div class="journal-load" role="status" hidden></div></div>`;
  this.contents=document.createElement('section');this.contents.id='journal-contents';this.contents.setAttribute('aria-label','Table of contents');this.contents.hidden=true;
  this.contents.innerHTML=`<label class="j-search-label" for="journal-search">Search the journal</label><input id="journal-search" type="search" placeholder="A project, an idea, a word…" autocomplete="off"><div class="journal-filters"><span id="journal-topic-label">Topic</span><span class="journal-topic-field"><button type="button" id="journal-topic" class="btn studio-control" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="journal-topic-options" aria-labelledby="journal-topic-label journal-topic-value"><span id="journal-topic-value" class="journal-topic-value">All topics</span><span class="journal-topic-chevron" aria-hidden="true"></span></button></span></div><p class="j-result-count" role="status"></p><div id="journal-results" class="journal-results"></div><div class="journal-tools"><button class="btn studio-control j-sound" data-action="sound" aria-label="Mute page sounds" aria-pressed="true">Sound on</button><span class="j-demo-notice">Project archive</span></div>`;
  host.append(this.root);(panel?.querySelector('.glass-content')||host).append(this.contents);this.q=s=>this.root.querySelector(s)||this.contents.querySelector(s);this.layer=this.q('.journal-riffle');
  panel?.addEventListener('keydown',e=>{if(this.visible&&!e.defaultPrevented)this.key(e)});
  this.contents.addEventListener('click',e=>this.click(e));this.contents.addEventListener('pointerdown',()=>this.sound.unlock());this.contents.addEventListener('keydown',e=>this.key(e));
  this.root.addEventListener('pointerdown',()=>this.sound.unlock());
  this.root.addEventListener('click',e=>this.click(e));
  this.q('#journal-search').addEventListener('input',()=>this.filter());
  this.topics=new JournalTopics(this.q('#journal-topic'),host,value=>{this.category=value;this.filter()});
  this.root.addEventListener('keydown',e=>this.key(e));
  // Own touch intent so slow swipes do not hit the widget's 250 ms cutoff,
  // and vertical reading remains native scrolling on short pages.
  this.root.addEventListener('touchstart',e=>{if(!e.target.closest('.journal-book')||e.target.closest('button,a,input'))return;e.stopPropagation();const t=e.touches[0];this.touch={x:t.clientX,y:t.clientY};},{capture:true,passive:true});
  this.root.addEventListener('touchmove',e=>{if(!this.touch)return;e.stopPropagation();const t=e.touches[0],dx=t.clientX-this.touch.x,dy=t.clientY-this.touch.y;if(Math.abs(dx)>18&&Math.abs(dx)>Math.abs(dy)*1.3&&e.cancelable)e.preventDefault();},{capture:true,passive:false});
  this.root.addEventListener('touchend',e=>{if(!this.touch)return;e.stopPropagation();const t=e.changedTouches[0],dx=t.clientX-this.touch.x,dy=t.clientY-this.touch.y;this.touch=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){if(e.cancelable)e.preventDefault();this.turn(dx<0?1:-1);}},{capture:true,passive:false});
  this.root.addEventListener('touchcancel',()=>this.touch=null,{capture:true});
  addEventListener('resize',()=>{clearTimeout(this.resizeTimer);if(this.visible)this.resizeTimer=setTimeout(()=>this.resize(),80)});
  this.motion.addEventListener('change',()=>{if(this.visible&&this.motion.matches){const target=this.target;this.cancel();this.setPage(target);}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){const target=this.target;this.cancel();if(this.ready)this.setPage(target);}});
  this.mobile=document.createElement('section');this.mobile.className='mobile-journal';this.mobile.hidden=true;
  this.mobile.innerHTML='<header class="mobile-journal-header"><span>Notes <small>VOL. 01</small></span><div class="journal-header-actions"><button class="journal-room-return" type="button" data-action="room">← Room</button><button type="button" data-action="contents" aria-controls="story-panel" aria-expanded="false">Contents <span aria-hidden="true">☰</span></button></div></header><div class="mobile-journal-page" tabindex="-1"></div><footer class="mobile-journal-footer"><button type="button" data-action="previous" aria-label="Previous page">← <span>Previous</span></button><span class="mobile-page-count" role="status"></span><button type="button" data-action="next" aria-label="Next page"><span>Next</span> →</button></footer>';
  this.root.append(this.mobile);
  const close=document.createElement('button');close.type='button';close.className='mobile-contents-close';close.dataset.action='contents-close';close.textContent='Read →';close.setAttribute('aria-label','Return to reading');this.contents.prepend(close);
  const room=close.cloneNode(false);room.className="journal-room-return journal-contents-room";room.dataset.action="room";room.textContent="← Room";room.setAttribute("aria-label","Back to Room");this.contents.prepend(room);
  this.updateSound();
 }
 async load(){
  if(this.data)return;if(this.loading)return this.loading;
  this.loading=(async()=>{const [module,res]=await Promise.all([mobileView.matches?Promise.resolve(null):import('./vendor/page-flip/page-flip.module.js'),fetch('./journal-content.json')]);if(module)this.PageFlip=module.PageFlip;if(!res.ok)throw Error('Journal content unavailable');this.data=await res.json();
   if(!Array.isArray(this.data.projects)||!this.data.projects.length||!this.data.projects.every(p=>p.id&&p.title))throw Error('Journal content is invalid');
   if(new Set(this.data.projects.map(p=>p.id)).size!==this.data.projects.length)throw Error('Duplicate journal entry');
   this.renderPages();this.q('.j-demo-notice').textContent=(this.data.fictional?'Fictional projects':'Project archive')+' · '+this.pages.length+' pages';this.category='All';
   this.topics.setOptions(['All',...new Set(this.data.projects.map(p=>p.category)),'Reference']);
   this.filter();
  })().catch(error=>{this.data=null;throw error}).finally(()=>this.loading=null);return this.loading;
 }
 async show(value){
  if(value===this.visible)return;this.visible=value;if(!value)this.closeContents(false);this.mobile.hidden=!value||!mobileView.matches;this.contents.hidden=!value;this.root.inert=!value||this.state.lift!==1;this.root.setAttribute('aria-hidden',String(this.root.inert));this.root.dataset.interactive=String(value&&this.state.lift===1);
  if(!value){this.topics.close();this.cancel();this.sound.stop();this.q('.journal-load').hidden=true;if(this.assetError||this.cleanFailed)this.root.hidden=true;return;}
  if(!this.ready){this.q('.journal-load').textContent='Opening the journal…';this.q('.journal-load').hidden=false;}
  try{if(this.assetError||this.cleanFailed)throw Error('Journal photograph unavailable');await this.load();if(!this.visible)return;this.resize();if(this.referencePending){this.referencePending=false;this.setPage(this.referenceStart)}this.q('.journal-load').hidden=true;this.focus();}
  catch(error){if(!this.visible)return;this.root.hidden=false;this.q('.journal-load').innerHTML='The journal could not open. <button class="btn studio-control" data-action="retry">Try again</button>';this.q('.journal-load').hidden=false;this.error=error.message;}
 }
 activatePhoto(){const available=this.photoReady&&!this.cleanFailed;this.root.hidden=!available;this.root.dataset.assetFailed=String(!available);document.body.dataset.journalReady=String(available);}
 async prepare(){const photo=this.q('.journal-photo');if(photo.dataset.src){photo.src=responsiveAsset(photo.dataset.src);delete photo.dataset.src}try{await photo.decode();this.assetError=null}catch(error){this.assetError=error;return;}this.photoReady=true;this.pose();}
 select(value,immediate=false){
  const to=value?1:0;
  if(immediate){this.transition=null;Object.assign(this.state,{lift:to,moving:false,mode:value?'inspecting':'resting'});this.pose();return;}
  if(this.transition?.to===to||this.state.lift===to&&!this.transition)return;
  this.transition={from:this.state.lift,to,start:performance.now(),duration:1050};this.state.moving=true;this.state.mode=value?'lifting':'lowering';
  if(!value)this.cancel();
 }
 tick(now){
  if(!this.transition)return false;const a=this.transition,t=clamp((now-a.start)/a.duration,0,1),e=t*t*t*(t*(t*6-15)+10);
  this.state.lift=a.from+(a.to-a.from)*e;
  if(t===1){this.state.lift=a.to;this.transition=null;this.state.moving=false;this.state.mode=a.to?'inspecting':'resting';}
  this.pose();return true;
 }
 layout(view){this.view=view;this.pose();}
 dimensions(){
  const portrait=innerWidth<=700&&innerHeight>innerWidth,short=innerHeight<=600;
  if(!mobileView.matches&&!short){
   // Use the menu's layout box: its entrance transform must not resize the book.
   const edge=16,gap=24,right=this.panel?this.panel.offsetLeft-gap:innerWidth-edge;
   const availableWidth=right-edge,availableHeight=innerHeight-96;
   const width=Math.max(220,Math.min(availableWidth,availableHeight/.75)),height=width*.75;
   return{width,height,left:edge+(availableWidth-width)/2,top:edge+(availableHeight-height)/2,spread:2};
  }
  const width=Math.max(220,Math.min(portrait?innerWidth-44:short?innerWidth*.53-60:innerWidth*.58-48,portrait||short?1000:(innerHeight-200)/.75,1000));
  const height=portrait?Math.min(width*.85,Math.max(118,innerHeight*.48-154)):short?innerHeight-162:width*.75;
  return{width,height,left:portrait?(innerWidth-width)/2:28,top:portrait||short?60:Math.max(70,(innerHeight-height-55)/2),spread:portrait||short?1:2};
 }
 pose(){
  const {width:w,height:h,left,top}=this.dimensions(),{x,y,s}=this.view,l=this.state.lift;
  const rest=[[1072,610],[1272,609],[1298,674],[1061,675]].map(([px,py])=>[x+px*s,y+py*s]);
  const dest=[[left,top],[left+w,top],[left+w,top+h],[left,top+h]];
  const points=rest.map((p,i)=>p.map((v,j)=>v+(dest[i][j]-v)*l));
  Object.assign(this.q('.journal-stage').style,{width:w+'px',height:h+'px',transform:projectQuad(w,h,points)});
  const footer=this.q('.journal-footer');Object.assign(footer.style,{left:left+w/2+'px',top:top+h-14+'px'});
  this.root.inert=!(this.visible&&l===1);this.root.setAttribute('aria-hidden',String(this.root.inert));this.root.dataset.mode=this.state.mode;this.root.dataset.interactive=String(this.visible&&l===1);this.root.style.zIndex=l>0?'6':'2';if(this.mobile)this.mobile.hidden=!mobileView.matches||!this.visible||l!==1;
  this.q('.journal-binding').style.opacity=String(clamp((l-.25)/.55,0,1));
 }
 focus(){if(!this.visible)return;if(mobileView.matches){this.mobile.querySelector('.mobile-journal-page').focus({preventScroll:true});return}const heading=this.panel?.querySelector('#story-title');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
 visual(p){
  if(p.image?.src&&/^(assets|journal-assets)\/[a-zA-Z0-9_./-]+$/.test(p.image.src)&&!p.image.src.includes('..'))return `<figure class="journal-study j-project-image"><img loading="lazy" decoding="async" src="${esc(responsiveAsset(p.image.src))}" alt="${esc(p.image.alt||p.title)}" draggable="false"><figcaption>${esc(p.image.caption)}</figcaption></figure>`;
  return '';
 }
 links(p){return (p.links||[]).filter(l=>{try{const u=new URL(l.url);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}}).map(l=>`<a class="j-text-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('');}

 openReference(){if(this.ready){this.go(this.referenceStart)}else this.referencePending=true;}
 renderPages(){
  const footer=(i,label)=>`<footer class="j-page-footer"><span>${esc(label)}</span><span>${String(i+1).padStart(2,'0')}</span></footer>`;
  const page=(i,cls,body,label)=>`<article class="j-page ${cls}${i%2?' j-paper-right':''}" data-page="${i}" aria-label="Page ${i+1}"><div class="j-page-inner">${body}${footer(i,label)}</div></article>`;
  const count=this.data.projects.length;
  this.pages=[page(0,'j-title-page',`<span class="j-kicker">Notes / Volume 01</span><h1>${esc(this.data.title)}</h1><p class="j-deck">${esc(this.data.subtitle)}</p><div class="j-rule"></div><p class="j-title-note">Some useful tools, some games, some experiments: what they started with, what took shape and the choices along the way.</p><span class="j-fixture-label">${this.data.fictional?'Fictional content · Prototype edition':'The project archive'}</span>`,'The journal'),page(1,'j-intro-page',`<span class="j-kicker">Contents</span><h2>Find something that interests you</h2><p>A project you recognize, an idea to search for, a topic in Contents — start there. Each entry introduces the project, then gets into how it started, what was built and the decisions behind it.</p><div class="j-index-preview">${this.data.projects.slice(0,5).map((p,i)=>`<button data-page-link="${i*2+2}"><span>${esc(p.title)}</span><i></i><span>${String(i*2+3).padStart(2,'0')}</span></button>`).join('')}</div><button class="j-text-link" data-action="contents">Browse all ${count} entries ↗</button><a class="j-text-link" href="/press.html">Facts and press ↗</a><p class="j-small-note">${this.data.fictional?'Every project in this edition is invented for testing. The real stories will arrive here soon.':'Read through released work, private tools, prototypes and older experiments, with each story keeping the stage it reached clear.'}</p>`,'An open invitation')];
  this.data.projects.forEach((p,i)=>{
   const decision=`<section class="j-project-decision"><h3>A design decision</h3>${paragraphs(p.decision)}</section>`;
   this.pages.push(page(i*2+2,'j-project-page j-archive-page',`<span class="j-kicker">${esc([p.category,p.date].filter(Boolean).join(' / '))}</span><h2>${esc(p.title)}</h2><p class="j-deck">${esc(p.summary)}</p>${p.image?this.visual(p):decision}`,p.title));
   this.pages.push(page(i*2+3,'j-notes-page j-archive-page',`<span class="j-kicker">Project notes</span><h2>Project notes</h2>${(p.sections||[]).map(section=>`<section><h3>${esc(section.heading)}</h3>${paragraphs(section.text)}</section>`).join('')}${p.image?decision:''}<nav class="j-project-links" aria-label="${esc(p.title)} links">${this.links(p)}</nav>`,p.title));
  });
  this.referenceStart=this.pages.length;
  this.references=profileContent.references.map((r,i)=>({...r,page:this.referenceStart+i,category:'Reference'}));
  for(const ref of this.references)this.pages.push(page(ref.page,'j-reference-page',`<span class="j-kicker">Facts and press / Reference</span><div class="reference-copy">${ref.html}</div>`,'Facts and press'));
  if(this.pages.length%2)this.pages.push(page(this.pages.length,'j-reference-page','<span class="j-kicker">Reference</span><h2>From the studio</h2><nav class="j-project-links"><a href="/about.html">About Tyler</a><a href="/#work">Explore the projects</a><a href="mailto:tyler@animasai.co">Email Tyler</a></nav>','Facts and press'));
 }
 resize(){
  if(!this.data)return;const oldPage=this.page;this.cancel();
  this.mobile.hidden=!this.visible||!mobileView.matches;
  if(mobileView.matches){
   if(this.book){this.book.destroy();this.book=null;const el=document.createElement('div');el.className='journal-book';this.q('.journal-binding').prepend(el)}
   this.spread=1;this.ready=true;this.setPage(oldPage);this.syncMobileContents();return;
  }
  this.closeContents(false);
  if(!this.PageFlip){if(!this.desktopLoading)this.desktopLoading=import('./vendor/page-flip/page-flip.module.js').then(m=>{this.PageFlip=m.PageFlip;if(!mobileView.matches)this.resize()}).catch(()=>{this.q('.journal-load').textContent='The page reader could not load. Return to Notes to try again.';this.q('.journal-load').hidden=false}).finally(()=>this.desktopLoading=null);return;}
  const dims=this.dimensions(),wide=dims.spread===2;
  this.pw=Math.floor(dims.width*.896/dims.spread);this.ph=Math.floor(dims.height*.802);this.spread=dims.spread;
  const binding=this.q('.journal-binding');binding.style.width=this.pw*this.spread+'px';binding.style.height=this.ph+'px';binding.classList.toggle('j-single',!wide);
  if(this.book){
   const el=this.q('.journal-book');el.style.width=this.pw*this.spread+'px';el.style.height=this.ph+'px';Object.assign(el.style,{minWidth:this.pw+'px',maxWidth:this.pw*this.spread+'px',minHeight:this.ph+'px',maxHeight:this.ph+'px'});Object.assign(this.book.getSettings(),{width:this.pw,height:this.ph});this.book.update();this.setPage(oldPage);this.updateCompact();return;
  }
  let el=this.q('.journal-book');if(!el){el=document.createElement('div');el.className='journal-book';binding.insertBefore(el,this.layer);}
  el.style.width=this.pw*this.spread+'px';el.style.height=this.ph+'px';el.innerHTML=this.pages.join('');
  this.book=new this.PageFlip(el,{width:this.pw,height:this.ph,size:'fixed',usePortrait:true,autoSize:false,drawShadow:true,maxShadowOpacity:.36,flippingTime:650,showCover:false,startPage:Math.min(oldPage,this.pages.length-1),mobileScrollSupport:true,useMouseEvents:true,clickEventForward:true,swipeDistance:35,showPageCorners:true,disableFlipByClick:true});
  this.book.on('flip',()=>{if(this.riffling)return;this.page=this.book.getCurrentPageIndex();if(!this.riffling)this.target=this.page;this.update();});
  this.book.on('changeState',e=>{if(e.data==='flipping'&&!this.riffling)this.sound.turn(.8);if(e.data==='read')requestAnimationFrame(()=>{if(!this.riffling)this.update()});});
  this.book.loadFromHTML(el.querySelectorAll('.j-page'));this.ready=true;this.setPage(oldPage);this.updateCompact();
 }
 updateCompact(){this.q('.journal-binding').classList.toggle('j-compact',this.ph<330);this.q('.journal-binding').classList.toggle('j-short',this.ph<490);this.q('.journal-instruction').textContent='Scroll to read · drag a corner or use the arrows';}
 update(){
  if(!this.ready)return;const end=Math.min(this.pages.length,this.page+this.spread);
  this.q('.journal-page-number').textContent=this.riffling?'Turning to page '+(this.target+1)+'…':`Page${this.spread===2?'s':''} ${this.page+1}${this.spread===2?'–'+end:''} / ${this.pages.length}`;
  this.q('.j-prev').disabled=this.page===0&&!this.riffling;this.q('.j-next').disabled=end>=this.pages.length&&!this.riffling;
  this.contents.querySelectorAll('[data-page-link]').forEach(b=>{const active=Number(b.dataset.pageLink)<=this.page&&this.page<Number(b.dataset.pageLink)+2;if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  if(mobileView.matches)this.renderMobile();
  this.root.dataset.page=String(this.page+1);this.root.dataset.turning=String(!!this.riffling);
  this.q('.journal-book').querySelectorAll('.j-page').forEach(el=>{const n=Number(el.dataset.page),visible=n>=this.page&&n<this.page+this.spread;el.setAttribute('aria-hidden',String(!visible));el.inert=!visible;});
 }
 setPage(n){if(mobileView.matches){this.page=clamp(n,0,this.pages.length-1);this.target=this.page;this.update();return}if(!this.book)return;this.page=clamp(Math.floor(n/this.spread)*this.spread,0,this.pages.length-this.spread);this.target=this.page;this.book.turnToPage(this.page);this.update();}
 cancel(){this.token++;cancelAnimationFrame(this.raf);this.resolveRiffle?.();this.resolveRiffle=null;this.touch=null;this.layer.replaceChildren();this.layer.hidden=true;this.riffling=false;this.q('.journal-book')?.classList.remove('j-riffle-hidden');this.sound.stop();if(this.book){this.book.getRender().finishAnimation();this.book.turnToPage(this.page);this.book.getRender().drawFrame();}if(this.ready)this.update();}
 turn(dir){if(!this.ready)return;if(mobileView.matches){this.setPage(this.page+dir);return}this.sound.unlock();if(this.riffling){const n=this.target+dir*this.spread;this.go(n);return;}if(this.motion.matches){this.setPage(this.page+dir*this.spread);return;}if(dir>0)this.book.flipNext('bottom');else this.book.flipPrev('bottom');}
 async go(n){
  if(!this.ready)return;if(mobileView.matches){this.setPage(clamp(n,0,this.pages.length-1));this.closeContents();return}this.sound.unlock();const target=clamp(Math.floor(n/this.spread)*this.spread,0,this.pages.length-this.spread);this.cancel();this.target=target;
  if(target===this.page)return;if(this.motion.matches){this.setPage(target);return;}
  const steps=Math.abs(target-this.page)/this.spread;
  if(steps===1){target>this.page?this.book.flipNext('bottom'):this.book.flipPrev('bottom');return;}
  await this.riffle(target);
 }
 // The widget remains the real reader. A temporary curved-sheet renderer uses
 // clones of its SAME pages for overlapping long jumps, then returns ownership.
 async riffle(target){
  const token=this.token,from=this.page,dir=target>from?1:-1,count=Math.min(8,Math.abs(target-from)/this.spread);this.riffling=true;this.target=target;this.layer.hidden=false;this.update();
  this.trace=[];const sheets=[],w=this.pw,h=this.ph,segments=9,sw=w/segments;
  // Keep the outgoing spread underneath the fan until the destination arrives.
  const under=document.createElement('div');under.className='j-riffle-under';
  for(let i=0;i<this.spread;i++){const tpl=document.createElement('template');tpl.innerHTML=this.pages[from+i];const el=tpl.content.firstElementChild;Object.assign(el.style,{position:'absolute',left:(i*w)+'px',top:'0',width:w+'px',height:h+'px'});under.append(el);}
  this.layer.append(under);this.q('.journal-book').classList.add('j-riffle-hidden');
  // Render the destination under the fan well before exposing it. The widget's
  // page selection updates its DOM on the next frame, not synchronously.
  this.book.turnToPage(target);this.book.getRender().drawFrame();
  for(let n=target;n<target+this.spread;n++)this.q('.journal-book').querySelector(`[data-page="${n}"] .j-page-inner`).scrollTop=0;
  const startTimes=Array.from({length:count},(_,i)=>i===0?0:170+(i-1)*78+(i===count-1?65:0));const sheetDuration=490,total=startTimes.at(-1)+sheetDuration;
  for(let i=0;i<count;i++){
   const destination=from+dir*Math.round((i+1)*Math.abs(target-from)/(count*this.spread))*this.spread;
   const frontIndex=clamp(dir===1?destination-1:destination+this.spread-1,0,this.pages.length-1);
   const backIndex=clamp(dir===1?destination:destination+this.spread,0,this.pages.length-1);
   const sheet={strips:[],start:startTimes[i],sounded:false};
   for(let k=0;k<segments;k++){
    const strip=document.createElement('div');strip.className='j-riffle-strip';Object.assign(strip.style,{width:(sw+.8)+'px',height:h+'px',left:(this.spread===2?w:dir===1?0:w)+'px'});
    // A physical leaf has two different pages. Its back rotates with the leaf
    // so the destination becomes upright as it settles, without mirrored text.
    for(const [side,index] of [['front',frontIndex],['back',backIndex]]){
     const face=document.createElement('div');face.className='j-riffle-face j-riffle-'+side;face.innerHTML=this.pages[index];Object.assign(face.style,{width:w+'px',height:h+'px',left:(-k*sw)+'px'});face.querySelector('.j-page').style.height=h+'px';strip.append(face);
    }
    strip.style.visibility='hidden';this.layer.append(strip);sheet.strips.push(strip);
   }
   sheets.push(sheet);
  }
  const started=performance.now();let previous=started,slowFrames=0,underChanged=false;
  await new Promise(resolve=>{
   this.resolveRiffle=resolve;
   const frame=now=>{
    if(token!==this.token||!this.visible){resolve();return;}
    if(now-previous>45)slowFrames++;previous=now;
    const elapsed=now-started;let active=0;
    if(!underChanged&&elapsed>total-sheetDuration*.7){
     underChanged=true;under.remove();this.q('.journal-book').classList.remove('j-riffle-hidden');
    }
    sheets.forEach((sheet,i)=>{
     const p=clamp((elapsed-sheet.start)/sheetDuration,0,1);const activeSheet=elapsed>=sheet.start&&p<1;if(activeSheet)active++;
     if(activeSheet&&!sheet.sounded){this.sound.turn(.55,.2);sheet.sounded=true;}
     const angle=p*Math.PI;let x=0,z=0;
     sheet.strips.forEach((strip,k)=>{
      if(!activeSheet){strip.style.visibility='hidden';return;}
      const bend=.7*Math.sin(Math.PI*p)*Math.sin(Math.PI*(k+.5)/segments);
      const theta=(dir===1?0:Math.PI)+(angle+bend)*dir;
      // The final 40ms blend removes GPU text-rasterization shimmer as the
      // segmented surface becomes the identical, already-visible HTML page.
      const settle=i===count-1?clamp((p-.92)/.08,0,1):0;strip.style.opacity=String(1-settle*settle*(3-2*settle));
      strip.style.visibility='visible';strip.style.transform=`translate3d(${x}px,${Math.sin(Math.PI*p)*(-5-i*.5)}px,${z+Math.sin(angle)*(5+i*.3)}px) rotateY(${-theta*180/Math.PI}deg)`;
      // Clipped strips flatten CSS 3D descendants. Select the face explicitly
      // and mirror its sampling locally before the strip's world rotation.
      const backFacing=Math.cos(theta)<0;strip.children[0].style.display=backFacing?'none':'block';strip.children[1].style.display=backFacing?'block':'none';
      x+=sw*Math.cos(theta);z+=sw*Math.sin(theta);
     });
    });
    this.trace.push({t:Math.round(elapsed),active});
    if(elapsed>=total){resolve();return;}this.raf=requestAnimationFrame(frame);
   };this.raf=requestAnimationFrame(frame);
  });
  if(token!==this.token)return;
  this.resolveRiffle=null;this.layer.replaceChildren();this.layer.hidden=true;this.q('.journal-book').classList.remove('j-riffle-hidden');this.riffling=false;this.setPage(target);this.lastRiffle={from:from+1,to:target+1,sheets:count,duration:Math.round(performance.now()-started),maxOverlap:Math.max(...this.trace.map(s=>s.active)),slowFrames};
 }
 filter(){
  if(!this.data)return;const query=this.q('#journal-search').value.trim().toLocaleLowerCase();const matches=[...this.data.projects.map((p,i)=>({...p,page:i*2+2})),...(this.references||[])].filter(p=>(this.category==='All'||p.category===this.category)&&[p.title,p.summary,p.decision,p.category,...(p.aliases||[]),...(p.sections||[]).map(s=>s.text)].join(' ').toLocaleLowerCase().includes(query));
  this.q('.journal-results').innerHTML=matches.length?matches.map(p=>`<button class="j-result" data-page-link="${p.page}"><span><small>${esc(p.category)}</small><strong>${esc(p.title)}</strong><em>${esc(p.summary)}</em></span><span class="j-result-page">${p.page+1}</span></button>`).join(''):'<p class="j-empty">No pages found. Try another word or choose All.</p>';
  this.q('.j-result-count').textContent=`${matches.length} ${matches.length===1?'entry':'entries'}${query?' matching your search':''}`;
  this.topics.setValue(this.category);this.q('.journal-results').scrollTop=0;
 }
 renderMobile(){
  const page=this.mobile.querySelector('.mobile-journal-page');
  if(this.mobilePage!==this.page){page.innerHTML=this.pages[this.page];page.scrollTop=0;this.mobilePage=this.page;}
  this.mobile.querySelector('.mobile-page-count').textContent=`${this.page+1} / ${this.pages.length}`;
  this.mobile.querySelector('[data-action=previous]').disabled=this.page===0;this.mobile.querySelector('[data-action=next]').disabled=this.page===this.pages.length-1;
 }
 syncMobileContents(){
  const open=mobileView.matches&&this.contentsOpen&&this.visible;
  document.body.dataset.journalContents=String(!!open);
  this.mobile.querySelector('[data-action=contents]').setAttribute('aria-expanded',String(!!open));
  if(this.panel&&mobileView.matches&&this.visible){this.panel.inert=!open;this.panel.setAttribute('aria-hidden',String(!open));}
  this.mobile.inert=!!open;
 }
 openContents(){this.contentsOpen=true;this.syncMobileContents();this.q('#journal-search').focus({preventScroll:true})}
 closeContents(focus=true){this.contentsOpen=false;this.topics.close();this.syncMobileContents();if(focus&&mobileView.matches&&this.visible)this.mobile.querySelector('[data-action=contents]').focus({preventScroll:true})}
 updateSound(){const b=this.q('[data-action="sound"]');b.textContent=this.sound.enabled?'Sound on':'Sound off';b.setAttribute('aria-pressed',String(this.sound.enabled));b.setAttribute('aria-label',this.sound.enabled?'Mute page sounds':'Enable page sounds');}
 click(e){const b=e.target.closest('button');if(!b)return;if(b.dataset.pageLink!==undefined){this.go(Number(b.dataset.pageLink));return;}
  switch(b.dataset.action){case'room':this.onClose();break;case'contents':this.openContents();break;case'contents-close':this.closeContents();break;case'previous':this.turn(-1);break;case'next':this.turn(1);break;case'sound':this.sound.toggle();this.updateSound();break;case'retry':if(this.assetError||this.cleanFailed){location.reload();break;}this.data=null;this.visible=false;this.show(true);break;}
 }
 key(e){
  if(e.key==='Escape'&&mobileView.matches&&this.contentsOpen){e.preventDefault();e.stopPropagation();this.closeContents();return}
  this.sound.unlock();
  if(e.target.matches('input,textarea,select'))return;
  if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Home')this.go(0);else if(e.key==='End')this.go(this.pages.length-1);else this.turn(e.key==='ArrowRight'?1:-1);}
 }
}
