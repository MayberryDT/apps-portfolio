import * as THREE from 'three';
import {HARDWARE,buildHardware,rounded} from './helm-hardware.js';
import {HelmShell} from './helm-shell.js';
const PITCH=-1.18,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>t*t*t*(t*(t*6-15)+10);
export class HelmPhone {
 static loadScreens(){return HelmShell.load()}
 constructor(scene,camera,images){
  this.state={lift:0,yaw:0,pitch:0,page:0,preview:false,moving:false,mode:'resting',screenTaps:0};
  this.camera=camera;this.ray=new THREE.Raycaster();this.transition=null;this.rotationTransition=null;
  this.root=new THREE.Group();this.root.name='Helm phone exhibit';
  const depth=4.6,dir=camera.getWorldDirection(new THREE.Vector3());
  this.ray.setFromCamera(new THREE.Vector2(263/1448*2-1,1-494/1086*2),camera);
  this.root.position.copy(this.ray.ray.origin).addScaledVector(this.ray.ray.direction,depth/this.ray.ray.direction.dot(dir));
  this.unit=2*depth/(camera.projectionMatrix.elements[0]*1448);this.root.scale.setScalar(this.unit);this.root.quaternion.copy(camera.quaternion);scene.add(this.root);
  this.phone=buildHardware();this.root.add(this.phone);this.shell=new HelmShell(images);this.canvas=this.shell.canvas;
  this.texture=new THREE.CanvasTexture(this.canvas);this.texture.colorSpace=THREE.SRGBColorSpace;this.texture.anisotropy=8;
  const {screenWidth:w,screenHeight:h,screenZ:z}=HARDWARE,g=new THREE.ShapeGeometry(rounded(w,h,2.53),32),a=g.attributes.position;
  g.setAttribute('uv',new THREE.Float32BufferAttribute(Array.from({length:a.count},(_,i)=>[a.getX(i)/w+.5,a.getY(i)/h+.5]).flat(),2));
  this.screen=new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({color:0x020305,emissive:0xffffff,emissiveMap:this.texture,emissiveIntensity:.92,roughness:.20,metalness:0,clearcoat:1,clearcoatRoughness:.08,specularIntensity:.3,toneMapped:false}));
  this.screen.position.z=z;this.screen.name='Helm interactive OLED beneath cover glass';this.phone.add(this.screen);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(45,35),new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float lift;void main(){vec2 p=(vUv-.5)*2.;float a=(.28-.12*lift)*exp(-4.*dot(p,p));gl_FragColor=vec4(.08,.055,.035,a);}',uniforms:{lift:{value:0}}}));
  shadow.position.set(0,-1,-.9);shadow.name='Soft desk contact';this.root.add(shadow);this.shadow=shadow;this.pose();
 }
 get controls(){return this.shell.controls}
 drawScreen(){this.shell.paint();this.texture.needsUpdate=true}
 sync(){this.state.page=this.shell.state.page;this.state.preview=this.shell.state.playing;this.state.moving=!!(this.transition||this.rotationTransition||this.shell.fade)}
 select(page){this.shell.select(page);this.texture.needsUpdate=true;if(Math.abs(this.state.yaw)>1.3)this.orient(-.14,0);this.sync()}
 action(which='primary'){
  if(which==='flip')this.orient(Math.abs(this.state.yaw)>1.6?-.14:2.8,Math.abs(this.state.yaw)>1.6?0:-.15);
  else if(which==='reset')this.orient(-.14,0);
  else {this.shell.action(which);this.texture.needsUpdate=true;if(Math.abs(this.state.yaw)>1.3)this.orient(-.14,0)}
  this.sync();
 }
 tap(x,y){
  this.ray.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),this.camera);
  const hit=this.ray.intersectObject(this.screen)[0];if(!hit)return false;
  const acted=this.shell.tap(hit.uv.x*this.canvas.width,(1-hit.uv.y)*this.canvas.height);
  if(acted){this.state.screenTaps++;this.texture.needsUpdate=true;this.sync()}return acted;
 }
 focus(value,immediate=false){
  const to=value?1:0,yaw=value?-.14:0;this.rotationTransition=null;
  if(!value&&this.shell.fade){this.shell.fade=null;this.drawScreen()}
  if(immediate){this.transition=null;this.state.lift=to;this.state.yaw=yaw;this.state.pitch=0;this.state.mode=value?'inspecting':'resting';this.sync();this.pose();return}
  if(this.state.lift===to&&!this.transition){this.sync();this.pose();return}
  this.transition={from:this.state.lift,to,start:performance.now(),duration:1050,rotation:{from:[this.state.yaw,this.state.pitch],to:[yaw,0]}};this.state.mode=value?'lifting':'lowering';this.sync();
 }
 orient(yaw,pitch){
  if(this.transition)this.transition.rotation=null;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){this.turn(yaw,pitch);return}
  this.rotationTransition={from:[this.state.yaw,this.state.pitch],to:[yaw,pitch],start:performance.now()};this.sync();
 }
 turn(yaw,pitch=0){if(this.transition)this.transition.rotation=null;this.rotationTransition=null;this.state.yaw=clamp(yaw,-Math.PI,Math.PI);this.state.pitch=clamp(pitch,-.55,.55);this.pose();this.sync()}
 tick(now){
  let changed=false;
  if(this.transition){const a=this.transition,t=clamp((now-a.start)/a.duration,0,1),e=ease(t);this.state.lift=a.from+(a.to-a.from)*e;if(a.rotation){this.state.yaw=a.rotation.from[0]+(a.rotation.to[0]-a.rotation.from[0])*e;this.state.pitch=a.rotation.from[1]+(a.rotation.to[1]-a.rotation.from[1])*e}changed=true;if(t===1){this.transition=null;this.state.mode=a.to?'inspecting':'resting'}}
  if(this.rotationTransition){const a=this.rotationTransition,t=clamp((now-a.start)/650,0,1);this.state.yaw=a.from[0]+(a.to[0]-a.from[0])*ease(t);this.state.pitch=a.from[1]+(a.to[1]-a.from[1])*ease(t);changed=true;if(t===1)this.rotationTransition=null}
  if(this.shell.tick(now)){this.texture.needsUpdate=true;changed=true}
  if(changed)this.pose();this.sync();return changed;
 }
 pose(){
  const s=this.state,l=s.lift;this.phone.position.set(0,20*l,8*l);this.phone.scale.setScalar(1);this.phone.rotation.set(PITCH+(1.05+s.pitch)*l,s.yaw*l,-.045*(1-l));
  // Lift into a viewport frame on phones, interpolating from the untouched desk
  // pose. Landscape reserves the right side for controls; portrait uses a tray.
  if(innerWidth<=700||innerHeight<=600){
   const landscape=innerWidth>innerHeight;
   const panel=document.querySelector('#story-panel');
   const trayHeight=Math.min(246,panel?.offsetHeight||234);
   const top=landscape?20:Math.max(26,innerHeight*.035);
   const bottom=landscape?innerHeight-76:innerHeight-70-trayHeight-18;
   const height=Math.max(90,Math.min(bottom-top,landscape?innerHeight-100:innerWidth*1.52));
   const cx=landscape?innerWidth*.265:innerWidth*.5,cy=top+(bottom-top)/2;
   const depth=4.6,pixelsPerUnit=this.camera.projectionMatrix.elements[5]*this.unit*innerHeight/(2*depth);
   const scale=height/(55.4*pixelsPerUnit+height*1.5*this.unit/depth);
   this.ray.setFromCamera(new THREE.Vector2(cx/innerWidth*2-1,1-cy/innerHeight*2),this.camera);
   const distance=(depth-1.5*this.unit*scale)/this.ray.ray.direction.dot(this.camera.getWorldDirection(new THREE.Vector3()));
   const target=this.root.worldToLocal(this.ray.ray.origin.clone().addScaledVector(this.ray.ray.direction,distance));
   this.phone.position.set(target.x*l,target.y*l,0);this.phone.scale.setScalar(1+(scale-1)*l);
  }
  this.phone.updateMatrixWorld(true);this.root.updateMatrixWorld(true);this.shadow.material.uniforms.lift.value=l;this.shadow.scale.setScalar(1+.2*l);
 }
 bounds(){
  this.phone.updateMatrixWorld(true);const points=[];
  for(const x of [-13.4,13.4])for(const y of [-27.7,27.7])for(const z of [-2.7,1.5])points.push(this.phone.localToWorld(new THREE.Vector3(x,y,z)).project(this.camera));
  const xs=points.map(p=>(p.x+1)*innerWidth/2),ys=points.map(p=>(1-p.y)*innerHeight/2);return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
 }
 screenPoint(u,v){return this.screen.localToWorld(new THREE.Vector3((u-.5)*HARDWARE.screenWidth,(v-.5)*HARDWARE.screenHeight,0)).project(this.camera).toArray()}
}
