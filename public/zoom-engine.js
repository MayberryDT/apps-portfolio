import {shelfViews} from './shelf-data.js';
import {photoViews} from './photo-stories.js';
import {views,extraViews} from './scene-data.js';
import {screenQuads} from './screen-data.js';
const smooth=t=>t*t*t*(t*(t*6-15)+10);
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
function frame(bounds,box,base,vw,vh){
 const[l,t,r,b]=bounds,[x,y,w,h]=box;
 const s=Math.max(base,Math.min(w/(r-l),h/(b-t)));
 return{x:clamp(x+w/2-(l+r)/2*s,vw-1448*s,0),y:clamp(y+h/2-(t+b)/2*s,vh-1086*s,0),s};
}
export class ZoomEngine{
 constructor(){this.current={x:0,y:0,s:1};this.active=null;this.initialized=false;this.lastSamples=[]}
 target(area,focused,vw,vh,object=null){
  const base=Math.max(vw/1448,vh/1086),mobile=vw<=700,detail=area==='photos'?photoViews[object]:area==='bookshelf'?shelfViews[object]:extraViews[object],v=focused&&detail?{...views[area],...detail}:views[area];
  // Portrait starts with the entire room visible. The photographic backdrop
  // fills the spare height; all further travel uses the same room coordinates.
  if(!v&&mobile&&vh>vw){const s=vw/1448;return{x:0,y:vh*.48-1086*s/2,s}}
  if(!focused&&area==='desk'&&mobile&&vh>vw){
   return frame([178,340,530,525],[18,vh*.26,vw-36,vh*.43],base,vw,vh);
  }
  // Keep the width filled, with a small downward framing offset where floor allows.
  if(!v)return{x:(vw-1448*base)/2,y:-Math.min(36*base,Math.max(0,1086*base-vh)),s:base};
  if(area==='bookshelf'&&focused&&detail){
   // Travel toward each real shelf position while its model withdraws into the foreground.
   // A bounded approach preserves photographic context instead of magnifying a tiny spine.
   const overview=frame(views.bookshelf.areaBounds,[mobile?16:60,80,vw-(mobile?32:120),vh-160],base,vw,vh);
   const bounds=detail.inspectBounds||detail.bounds,point=bounds?[(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2]:detail.point;
   const s=overview.s*(mobile?1.24:1.36),cx=point?.[0]||views.bookshelf.center[0],cy=point?.[1]||views.bookshelf.center[1];
   return {s,x:clamp(vw*(mobile?.5:.30)-cx*s,vw-1448*s,0),y:clamp(vh*(mobile?.28:.45)-cy*s,vh-1086*s,0)};
  }
  if(!focused&&area==='bookshelf'&&(mobile||vh<=600&&matchMedia('(pointer:coarse)').matches)){
   const portrait=vh>vw;return frame(v.areaBounds,portrait?[16,56,vw-32,Math.max(150,vh*.46-56)]:[16,28,vw*.48-24,vh-100],Math.min(vw/1448,vh/1086),vw,vh);
  }
  if(!focused&&v.areaBounds)return frame(v.areaBounds,[mobile?16:60,80,vw-(mobile?32:120),vh-160],base,vw,vh);
  if(focused&&area==='bookshelf'&&object==='shaco'&&vh<=500&&vw>=vh)return frame(v.bounds,[24,76,vw*.48-40,vh-152],base,vw,vh);
  if(focused&&area==='bookshelf'&&object==='shaco'&&mobile&&vh<=700)return frame(v.bounds,[24,76,vw-48,Math.max(150,vh*.4-90)],base,vw,vh);
  if(focused&&v.inspectBounds){
   const compactPhoto=['photos','bookshelf'].includes(area)&&vh<=500&&vw>=vh;
   const box=compactPhoto?[24,76,vw*.48-40,vh-152]:mobile?[24,76,vw-48,Math.max(150,vh*.4-90)]:[32,80,vw*.55-72,vh-160];
   return frame(v.inspectBounds,box,base,vw,vh);
  }
  if(focused&&object==='monitor'&&!mobile&&vh>500){
   const points=screenQuads.laptop,cx=(points[0][0]+points[2][0])/2,cy=(points[0][1]+points[2][1])/2;
   const s=Math.min(vw*.78/(points[1][0]-points[0][0]),vh*.69/(points[3][1]-points[0][1]));
   return{x:vw*.5-cx*s,y:vh*.48-cy*s,s};
  }
  if(focused&&object==='pixel'){
   const s=Math.max(base,mobile?1.8:base*3.1);
   return{x:clamp(vw*.5-220*s,vw-1448*s,0),y:clamp(vh*.52-526*s,vh-1086*s,0),s};
  }
  const s=Math.max(base,focused?(mobile?v.inspectMobile:base*v.inspect):(mobile?v.mobile:base*v.zoom));
  const [cx,cy]=focused?v.point:v.center;
  let x=vw*(focused&&!mobile?.3:.5)-cx*s,y=vh*(focused?(mobile?.225:.45):.5)-cy*s;
  x=Math.min(0,Math.max(vw-1448*s,x));y=Math.min(0,Math.max(vh-1086*s,y));
  return{x,y,s};
 }
 start(to,{immediate=false,duration=1050,vw=innerWidth,vh=innerHeight}={}){
  if(immediate||!this.initialized){this.current={...to};this.active=null;this.initialized=true;return}
  // Begin exactly at the visible frame, including when a zoom is interrupted.
  this.active={from:{...this.current},to:{...to},start:performance.now(),duration,vw,vh};
  this.lastSamples=[];
 }
 tick(now){
  if(!this.active)return 1;
  const a=this.active,t=Math.min(1,Math.max(0,(now-a.start)/a.duration)),e=smooth(t);
  // Interpolate the complete affine transform with one easing value. Every
  // photographed point then follows a monotone path between its endpoints;
  // independently blending camera centers and log-scale caused reversals.
  this.current={x:a.from.x+(a.to.x-a.from.x)*e,y:a.from.y+(a.to.y-a.from.y)*e,s:a.from.s+(a.to.s-a.from.s)*e};
  if(this.lastSamples.length<150)this.lastSamples.push({t,...this.current});
  if(t===1){this.current={...a.to};this.active=null}
  return t;
 }
 finish(){if(this.active){this.current={...this.active.to};this.active=null}}
}
