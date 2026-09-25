export function inspectionBox(w=innerWidth,h=innerHeight,id=document.body.dataset.object){
 if(id&&!['helm','pixel','notebook'].includes(id)){
  if(w<=700&&h>w)return[18,4,w-36,Math.max(120,(h-72)*.5-16)];
  if(h<=600&&matchMedia('(pointer:coarse)').matches)return[16,8,w*.49-30,Math.max(120,h-88)];
 }
 if(w<=700&&h>w){const bottom=h<=700?Math.max(242,h*.4+8):h*.48;return[30,70,w-60,Math.max(95,bottom-150)]}
 return[30,76,w*.53-60,Math.max(90,h-230)];
}
