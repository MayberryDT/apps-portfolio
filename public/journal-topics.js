// Select-only combobox: focus stays on the trigger; arrows preview, Enter selects.
// The popup is a sibling of the panel so its glass is never clipped by panel scrolling.
export class JournalTopics {
 constructor(trigger,host,onChange){
  this.trigger=trigger;trigger.disabled=true;this.onChange=onChange;this.values=[];this.value='All';this.active=0;
  this.list=document.createElement('div');this.list.id='journal-topic-options';this.list.className='journal-topic-menu';this.list.hidden=true;this.list.tabIndex=-1;this.list.setAttribute('role','listbox');this.list.setAttribute('aria-labelledby','journal-topic-label');host.append(this.list);
  trigger.addEventListener('click',()=>this.list.hidden?this.open():this.close());
  trigger.addEventListener('keydown',e=>this.key(e));
  this.list.addEventListener('focusin',()=>trigger.focus({preventScroll:true}));
  this.list.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')e.preventDefault()});
  this.list.addEventListener('click',e=>{const option=e.target.closest('[role=option]');if(option){this.active=Number(option.dataset.index);this.choose();}});
  document.addEventListener('pointerdown',e=>{if(!this.list.contains(e.target)&&!trigger.contains(e.target))this.close()});
  document.addEventListener('focusin',e=>{if(!this.list.contains(e.target)&&!trigger.contains(e.target))this.close()});
  document.addEventListener('scroll',e=>{
   if(this.list.hidden||this.list.contains(e.target))return;
   const r=trigger.getBoundingClientRect();
   if(Math.abs(r.top-this.anchor.top)>.5||Math.abs(r.left-this.anchor.left)>.5)this.close();
  },{capture:true,passive:true});
  addEventListener('resize',()=>this.close());
  document.addEventListener('fullscreenchange',()=>this.close());
 }
 setOptions(values){
  this.close();this.trigger.disabled=!values.length;this.values=values;this.list.replaceChildren();
  values.forEach((value,i)=>{const option=document.createElement('div');option.id=`journal-topic-${i}`;option.dataset.index=i;option.tabIndex=-1;option.setAttribute('role','option');option.textContent=this.label(value);this.list.append(option)});
  this.setValue(this.value);
 }
 label(value){return value==='All'?'All topics':value}
 setValue(value){
  this.value=value;this.trigger.querySelector('.journal-topic-value').textContent=this.label(value);
  [...this.list.children].forEach((option,i)=>option.setAttribute('aria-selected',String(this.values[i]===value)));
 }
 open(){
  if(!this.values.length)return;
  this.active=Math.max(0,this.values.indexOf(this.value));this.typed='';this.list.hidden=false;this.trigger.setAttribute('aria-expanded','true');
  const r=this.trigger.getBoundingClientRect(),gap=7,edge=12,width=Math.min(r.width,innerWidth-edge*2),below=innerHeight-r.bottom-gap-edge,above=r.top-gap-edge;
  this.anchor=r;
  const needed=this.values.length*44+16,down=below>=needed||below>=above,available=Math.max(0,down?below:above);
  Object.assign(this.list.style,{width:width+'px',maxHeight:Math.min(needed,available)+'px',left:Math.max(edge,Math.min(r.left,innerWidth-width-edge))+'px',top:(down?r.bottom+gap:Math.max(edge,r.top-gap-Math.min(needed,available)))+'px'});
  this.trigger.focus({preventScroll:true});this.highlight();
 }
 close(){this.list.hidden=true;this.trigger.setAttribute('aria-expanded','false');this.trigger.removeAttribute('aria-activedescendant');this.typed=''}
 highlight(){
  const option=this.list.children[this.active];
  [...this.list.children].forEach((item,i)=>item.dataset.active=String(i===this.active));
  this.trigger.setAttribute('aria-activedescendant',option.id);
  // Scroll only the popup, never the room or the contents panel.
  const top=option.offsetTop,bottom=top+option.offsetHeight;
  if(top<this.list.scrollTop)this.list.scrollTop=top;
  else if(bottom>this.list.scrollTop+this.list.clientHeight)this.list.scrollTop=bottom-this.list.clientHeight;
 }
 choose(focus=true){const value=this.values[this.active];this.setValue(value);this.close();this.onChange(value);if(focus)this.trigger.focus({preventScroll:true})}
 key(e){
  const open=!this.list.hidden;
  if(e.key==='Escape'){if(open){e.preventDefault();e.stopPropagation();this.close()}return}
  e.stopPropagation(); // Topic navigation must never reach the journal's page shortcuts.
  if(e.key==='Tab'){if(open)this.choose(false);return}
  if(e.ctrlKey||e.metaKey)return;
  if(['Enter',' ','ArrowDown','ArrowUp','Home','End'].includes(e.key)){
   e.preventDefault();
   if(e.key==='Enter'||e.key===' '){open?this.choose():this.open();return}
   if(!open)this.open();
   if(e.key==='Home')this.active=0;
   else if(e.key==='End')this.active=this.values.length-1;
   else if(open)this.active=Math.max(0,Math.min(this.values.length-1,this.active+(e.key==='ArrowDown'?1:-1)));
   this.highlight();return;
  }
  if(e.key.length===1){
   e.preventDefault();if(!open)this.open();const now=performance.now();this.typed=now-(this.typedAt||0)<650?(this.typed||'')+e.key:e.key;this.typedAt=now;
   const query=this.typed.toLocaleLowerCase(),repeat=[...query].every(c=>c===query[0]);
   for(let step=1;step<=this.values.length;step++){const i=(this.active+step)%this.values.length;if(this.label(this.values[i]).toLocaleLowerCase().startsWith(repeat?query[0]:query)){this.active=i;this.highlight();break}}
  }
 }
}
