import {photoStories,photoById,photoViews} from './photo-stories.js';

// Native buttons follow the existing photographic plane, without covering it
// with eight floating menus. The selected photo uses the shared story panel.
export class PhotoGallery {
 constructor({world,panel,onSelect,onBack}){
  this.current='cotton';this.root=document.createElement('nav');this.root.id='photo-targets';this.root.setAttribute('aria-label','Photos on the wall');this.root.hidden=true;
  this.buttons=photoStories.map(item=>{
   const button=document.createElement('button');button.type='button';button.className='btn photo-target';button.dataset.photo=item.id;button.setAttribute('aria-label','Inspect '+item.objectName);
   const label=document.createElement('span');label.textContent=item.label;button.append(label);button.onclick=()=>onSelect(item.id);this.root.append(button);return button;
  });world.append(this.root);
  this.nav=document.createElement('nav');this.nav.id='photo-navigation';this.nav.setAttribute('aria-label','Browse photographs');this.nav.hidden=true;
  const control=(text,action)=>{const button=document.createElement('button');button.type='button';button.className='btn studio-control';button.textContent=text;button.onclick=action;this.nav.append(button);return button};
  this.previous=control('←',()=>this.step(-1,onSelect));this.back=control('All photos',onBack);this.next=control('→',()=>this.step(1,onSelect));panel.append(this.nav);this.back.hidden=true;
 }
 step(direction,onSelect){const index=photoStories.findIndex(item=>item.id===this.current);onSelect(photoStories[(index+direction+photoStories.length)%photoStories.length].id)}
 select(area,focused,id){
  this.root.hidden=area!=='photos'||focused;this.nav.hidden=area!=='photos'||!focused;
  if(area==='photos'&&photoById.has(id))this.current=id;
  const index=photoStories.findIndex(item=>item.id===this.current),previous=photoStories[(index+7)%8],next=photoStories[(index+1)%8];
  this.previous.setAttribute('aria-label','Previous photo: '+previous.title);this.next.setAttribute('aria-label','Next photo: '+next.title);
 }
 layout({x,y,s}){
  if(this.root.hidden)return;
  this.buttons.forEach(button=>{const [l,t,r,b]=photoViews[button.dataset.photo].inspectBounds,w=Math.max(44,(r-l)*s),h=Math.max(44,(b-t)*s);Object.assign(button.style,{left:x+(l+r)/2*s-w/2+'px',top:y+(t+b)/2*s-h/2+'px',width:w+'px',height:h+'px'})});
 }
 focusCurrent(){this.buttons.find(button=>button.dataset.photo===this.current)?.focus({preventScroll:true})}
}
