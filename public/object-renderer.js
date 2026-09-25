import {assetBytes,lightingAsset,forgetAsset} from './asset-cache.js';
import {shelfById} from './shelf-data.js';
import {ShelfProp} from './shelf-prop.js';
import * as THREE from 'three';
import {HelmPhone} from './helm-phone.js';
// Fetch only the selected lighting family. Phone reflections were baked from the
// existing helm-lighting.js scene; no PMREM generation on a visitor's device.
const environments=new Map();
function loadEnvironment(kind){
 if(environments.has(kind))return environments.get(kind);
 const path=lightingAsset(kind),width=path.startsWith('mobile/')?384:768,height=width/3*4;
 const task=assetBytes(path).then(async bytes=>{
  const data=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  if(data.byteLength!==width*height*8)throw new Error('Lighting data is incomplete');
  const texture=new THREE.DataTexture(new Uint16Array(data),width,height,THREE.RGBAFormat,THREE.HalfFloatType);
  texture.mapping=THREE.CubeUVReflectionMapping;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;return {texture};
 }).catch(error=>{environments.delete(kind);forgetAsset(path);throw error});
 environments.set(kind,task);return task;
}
// The image views do not create a renderer or load any object models.
// Each cached scene contains one inspectable object and its light/shadow helpers.
let renderer,camera,baseProjection,canvas,contactAttempts=0,lastSize="";
const entries=new Map(),pending=new Map();
const state={ready:false,lost:false,active:null,loaded:[],draws:0};
const fromBlender=p=>new THREE.Vector3(p[0],p[2],-p[1]);
function addLighting(scene) {
  scene.environmentIntensity=.38;
  const key = new THREE.DirectionalLight(0xffe9ce, 2.1);
  key.position.set(5.5, 2.3, -2.3);
  key.target.position.set(4.45, 1.65, -3.37);
  key.castShadow = false;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -.43, right: .43, top: .45, bottom: -.45, near: .1, far: 5 });
  key.shadow.normalBias = .0007; key.shadow.bias = -.000015;
  key.shadow.radius = 3;
  scene.add(key, key.target);
  const fill = new THREE.HemisphereLight(0xf3ede2, 0x6c4730, .5);
  scene.add(fill);

}

function initialize(target,meta){
 if(renderer)return;
 canvas=target;
 renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.86;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 camera=new THREE.PerspectiveCamera(meta.fov_vertical,meta.aspect,.1,25);
 camera.position.copy(fromBlender(meta.position));camera.lookAt(fromBlender(meta.target));camera.updateMatrixWorld(true);
 if(meta.view_frame){const f=meta.view_frame,k=camera.near/Math.abs(f[0][2]);camera.projectionMatrix.makePerspective(f[2][0]*k,f[0][0]*k,f[0][1]*k,f[1][1]*k,camera.near,camera.far)}
 const [sx,sy,tx,ty]=meta.registration||[1,1,0,0],e=camera.projectionMatrix.elements;
 for(let col=0;col<4;col++){const i=col*4,w=e[i+3];e[i]=sx*e[i]+(sx+2*tx-1)*w;e[i+1]=sy*e[i+1]+(1-sy-2*ty)*w}
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();baseProjection=camera.projectionMatrix.clone();
 state.ready=true;
}
export const objects={
 state,
 async prepare(id,target,meta){
  if(state.lost)throw new Error('The graphics context was lost');
  if(!['helm','pixel'].includes(id)&&!shelfById.has(id))throw new Error('Unknown inspected object');
  if(entries.has(id))return entries.get(id);
  if(pending.has(id))return pending.get(id);
  const task=(async()=>{
   const isPhone=['helm','pixel'].includes(id);
   const screenTask=id==='helm'?HelmPhone.loadScreens():id==='pixel'?import(`./contact-phone.js?attempt=${++contactAttempts}`).then(async ({ContactPhone})=>({ContactPhone,screens:await ContactPhone.loadScreens()})):Promise.resolve(null);
   const [environment,screenData]=await Promise.all([loadEnvironment(isPhone?'phone':'room'),screenTask]);
   if(state.lost)throw new Error('The graphics context was lost');
   initialize(target,meta);
   const scene=new THREE.Scene();scene.name=id+' inspection only';scene.environment=environment.texture;if(isPhone)addLighting(scene);
   const entry={scene,id};
   if(id==='helm'){
    const calibration=camera.clone();calibration.projectionMatrix.copy(baseProjection);calibration.projectionMatrixInverse.copy(baseProjection).invert();
    const screens=screenData;
    if(state.lost)throw new Error('The graphics context was lost');
    entry.environment=environment;scene.environment=entry.environment.texture;
    scene.environmentIntensity=1.15;scene.environmentRotation.copy(calibration.rotation);scene.environmentRotation.y+=1.2;
    entry.helm=new HelmPhone(scene,calibration,screens);entry.helm.camera=camera;
   }else if(id==='pixel'){
    const {ContactPhone,screens}=screenData;
    if(state.lost)throw new Error('The graphics context was lost');
    const calibration=camera.clone();calibration.projectionMatrix.copy(baseProjection);calibration.projectionMatrixInverse.copy(baseProjection).invert();
    entry.environment=environment;scene.environment=entry.environment.texture;
    scene.environmentIntensity=1.05;scene.environmentRotation.copy(calibration.rotation);scene.environmentRotation.y+=1.2;
    entry.pixel=new ContactPhone(scene,calibration,screens);entry.pixel.camera=camera;
   }else{
    const calibration=camera.clone();calibration.projectionMatrix.copy(baseProjection);calibration.projectionMatrixInverse.copy(baseProjection).invert();
    entry.prop=await ShelfProp.create(id,scene,calibration,camera);
   }

   // Upload decoded images before activation, while the photograph remains usable.
   const textures=new Set();scene.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])for(const value of Object.values(m))if(value?.isTexture)textures.add(value)});
   for(const texture of textures)renderer.initTexture(texture);
   await renderer.compileAsync(scene,camera);
   entries.set(id,entry);state.loaded=[...entries.keys()];return entry;
  })();
  pending.set(id,task);try{return await task}finally{pending.delete(id)}
 },
 activate(id){if(!entries.has(id))throw new Error('Object is not ready');state.active=id;canvas.hidden=false;renderer.shadowMap.needsUpdate=true},
 hide(){state.active=null;if(renderer)renderer.clear();if(canvas)canvas.hidden=true},
 view({x,y,s,vw,vh}){
  if(!camera)return;
  const sx=1448*s/vw,sy=1086*s/vh,tx=x/vw,ty=y/vh;
  camera.projectionMatrix.copy(baseProjection);const e=camera.projectionMatrix.elements;
  for(let col=0;col<4;col++){const i=col*4,w=e[i+3];e[i]=sx*e[i]+(sx+2*tx-1)*w;e[i+1]=sy*e[i+1]+(1-sy-2*ty)*w}
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
 },
 resize(w,h,moving=false){if(!renderer)return;const ratio=Math.min(moving?1:devicePixelRatio,w<=700?1.5:2,4096/Math.max(w,h)),key=[w,h,ratio].join(':');if(key===lastSize)return;lastSize=key;renderer.setPixelRatio(ratio);renderer.setSize(w,h,false)},
 draw(angle=0){const entry=entries.get(state.active);if(!state.ready||!entry)return;if(entry.pivot){if(entry.pivot.rotation.y!==angle)renderer.shadowMap.needsUpdate=true;entry.pivot.rotation.y=angle}renderer.render(entry.scene,camera);state.draws++},
 get prop(){return entries.get(state.active)?.prop},get actor(){return this.handset||this.prop},
 get pixel(){return entries.get('pixel')?.pixel},get handset(){return state.active==='pixel'?this.pixel:state.active==='helm'?this.helm:null},
 get helm(){return entries.get('helm')?.helm},get pivot(){return entries.get('shaco')?.pivot},
 get scene(){return entries.get(state.active)?.scene},get renderer(){return renderer},get activeCamera(){return camera}
};
