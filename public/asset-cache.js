const bytes=new Map(),images=new Map();
export function assetBytes(path,priority='high'){
 if(!bytes.has(path))bytes.set(path,fetch(path,{priority}).then(r=>{if(!r.ok)throw new Error('Asset unavailable');return r.arrayBuffer()}).catch(error=>{bytes.delete(path);throw error}));return bytes.get(path);
}
export function assetImage(path,priority='high'){
 if(!images.has(path)){const image=new Image();image.fetchPriority=priority;image.decoding='async';image.src=path;images.set(path,image.decode().then(()=>image).catch(error=>{images.delete(path);throw error}))}return images.get(path);
}

export const mobileAssets=()=>matchMedia('(max-width:700px), (max-height:600px) and (pointer:coarse)').matches;
export const lightingAsset=kind=>(mobileAssets()?'mobile/':'')+`assets/${kind}-environment.bin.gz`;
export const forgetAsset=path=>bytes.delete(path);
