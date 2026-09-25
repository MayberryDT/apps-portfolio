// Frame surfaces stay registered to the photograph's plane. The original image
// owns the aperture ratio; the wood rails are built around that exact rectangle.
export const FRAME_RAIL=6.2;
let materialReady;
function prepareMaterial(){if(!materialReady){const material=new Image();material.src='assets/frame-walnut.webp';materialReady=material.decode().then(()=>true,()=>false)}return materialReady;}
const polygon=(points,fill)=>`<polygon points="${points}" fill="${fill}"/>`;
export async function createPhotoFrame(photo,img,index){
 const [,woodReady]=await Promise.all([img.decode(),prepareMaterial()]);
 const [x,y,w]=photo.rect,h=photo.rect[3],f=FRAME_RAIL,W=w+2*f,H=h+2*f,id='frame-'+photo.src;
 const frame=document.createElement('div');frame.className='photo-frame';frame.dataset.photo=photo.src;frame.dataset.aperture=`${w},${h}`;frame.dataset.material=woodReady?'walnut':'fallback';
 Object.assign(frame.style,{left:x-f+'px',top:y-f+'px',width:W+'px',height:H+'px'});
 Object.assign(img.style,{left:f+'px',top:f+'px',width:w+'px',height:h+'px'});
 const back=document.createElement('span');back.className='frame-depth';back.setAttribute('aria-hidden','true');
 const surface=document.createElementNS('http://www.w3.org/2000/svg','svg');surface.classList.add('frame-joinery');surface.setAttribute('viewBox',`0 0 ${W} ${H}`);surface.setAttribute('aria-hidden','true');
 const rails=[`0,0 ${W},0 ${W-f},${f} ${f},${f}`,`${W},0 ${W},${H} ${W-f},${H-f} ${W-f},${f}`,`${W},${H} 0,${H} ${f},${H-f} ${W-f},${H-f}`,`0,${H} 0,0 ${f},${f} ${f},${H-f}`];
 const grain=(name,rotate,offset)=>`<pattern id="${id}-${name}" patternUnits="userSpaceOnUse" viewBox="0 0 220 220" width="220" height="220" x="${-(8+index*3+offset)}" y="${-(12+index*7+offset)}"><rect width="220" height="220" fill="#69452f"/>${woodReady?`<image href="assets/frame-walnut.webp" width="220" height="220" transform="rotate(${rotate} 110 110)" preserveAspectRatio="none"/>`:''}</pattern>`;
 const gradient=(name,x1,y1,x2,y2,light)=>`<linearGradient id="${id}-${name}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="#160c06" stop-opacity=".72"/><stop offset=".055" stop-color="#ecd4b0" stop-opacity="${light}"/><stop offset=".16" stop-color="#c5a078" stop-opacity=".08"/><stop offset=".24" stop-color="#211409" stop-opacity=".05"/><stop offset=".68" stop-color="#211409" stop-opacity=".12"/><stop offset=".72" stop-color="#d4b48a" stop-opacity=".4"/><stop offset=".78" stop-color="#1d1007" stop-opacity=".5"/><stop offset=".91" stop-color="#211206" stop-opacity=".65"/><stop offset=".95" stop-color="#ceb292" stop-opacity=".9"/><stop offset="1" stop-color="#291b11" stop-opacity=".55"/></linearGradient>`;
 surface.innerHTML=`<defs>${grain('horizontal',90,0)}${grain('vertical',0,5)}${gradient('top',0,0,0,f,.64)}${gradient('right',W,0,W-f,0,.25)}${gradient('bottom',0,H,0,H-f,.24)}${gradient('left',0,0,f,0,.56)}</defs>`+
 rails.map((points,i)=>polygon(points,`url(#${id}-${i%2?'vertical':'horizontal'})`)).join('')+
 rails.map((points,i)=>polygon(points,`url(#${id}-${['top','right','bottom','left'][i]})`)).join('')+
 `<path d="M0 0L${f} ${f}M${W} 0L${W-f} ${f}M${W} ${H}L${W-f} ${H-f}M0 ${H}L${f} ${H-f}" fill="none" stroke="#24160c" stroke-opacity=".65" stroke-width=".22"/>`;
 const glass=document.createElement('span');glass.className='frame-glazing';glass.setAttribute('aria-hidden','true');Object.assign(glass.style,{left:f+'px',top:f+'px',width:w+'px',height:h+'px'});
 frame.append(back,img,glass,surface);return frame;
}
