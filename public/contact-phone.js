import {assetImage} from './asset-cache.js';
import * as THREE from 'three';
import {contactFrame} from './contact-landing.js';
import {plate,rounded,batchPhone} from './helm-hardware.js';
const W=31,H=65,SW=28.5,SH=61.8;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>t*t*t*(t*(t*6-15)+10);

// The same machined-part recipe as Helm, with a different body, finish, camera
// island and authored Contact display. No Helm screen or hardware is instantiated.
export function buildContactHardware(){
 const phone=new THREE.Group();phone.name='Contact Pixel — porcelain and satin aluminum';
 const metal=new THREE.MeshPhysicalMaterial({color:0xbfc4b7,metalness:1,roughness:.31,clearcoat:.25});
 const chamfer=new THREE.MeshStandardMaterial({color:0xdce0d3,metalness:1,roughness:.2});
 const porcelain=new THREE.MeshPhysicalMaterial({color:0xd5daca,roughness:.32,metalness:.02,clearcoat:1,clearcoatRoughness:.22});
 const seal=new THREE.MeshStandardMaterial({color:0x242825,roughness:.8});
 const black=new THREE.MeshPhysicalMaterial({color:0x080d0e,roughness:.28,clearcoat:.35,specularIntensity:.2});
 const optical=new THREE.MeshPhysicalMaterial({color:0x12232b,metalness:.25,roughness:.075,clearcoat:1,iridescence:.25});
 const add=(m,x=0,y=0,z=0)=>{m.position.set(x,y,z);phone.add(m);return m};
 const p=(w,h,r,d,b,mat,name,x=0,y=0,z=0)=>add(plate(w,h,r,d,b,mat,name),x,y,z);
 p(W,H,5,3.1,.42,metal,'Softly rounded satin aluminum frame');
 p(30.82,64.82,4.92,.20,.06,chamfer,'Fine polished display rim',0,0,1.51);
 p(30.53,64.53,4.78,.16,.05,seal,'Black display gasket',0,0,1.63);
 p(30.36,64.36,4.70,.16,.05,black,'Smooth cover glass perimeter',0,0,1.73);
 p(30.55,64.55,4.82,.16,.05,seal,'Rear perimeter gasket',0,0,-1.56);
 p(30.36,64.36,4.72,.24,.08,porcelain,'Porcelain satin glass back',0,0,-1.69);
 // A separate raised oval metal camera island, with a black two-lens capsule.
 p(27.6,10.4,5.1,1.25,.27,metal,'Oval aluminum camera island',0,20.8,-2.2);
 p(20.8,7.5,3.7,.19,.06,black,'Dual-camera optical capsule',-2.2,20.8,-2.88);
 const disk=(r,mat,name,x,y,z)=>{const m=add(new THREE.Mesh(new THREE.CircleGeometry(r,64),mat),x,y,z);if(z<0)m.rotation.y=Math.PI;m.name=name;return m};
 const ring=(r,t,mat,name,x,y,z)=>{const m=add(new THREE.Mesh(new THREE.TorusGeometry(r,t,10,72),mat),x,y,z);m.name=name;return m};
 for(const x of [-7.1,2.2]){
  ring(2.85,.18,chamfer,'Precision lens retaining ring',x,20.8,-3.01);
  disk(2.63,optical,'Coated lens cover',x,20.8,-3.03);
  ring(2.06,.09,metal,'Recessed lens barrel',x,20.8,-3.07);
  disk(1.83,black,'Lens aperture',x,20.8,-3.08);
  const lens=add(new THREE.Mesh(new THREE.SphereGeometry(1.2,40,20),optical),x,20.8,-3.1);lens.scale.z=.13;lens.name='Curved inner optical element';
 }
 disk(1.05,chamfer,'Flash bezel',10.4,21.3,-2.86);
 disk(.84,new THREE.MeshPhysicalMaterial({color:0xf2ebcf,roughness:.46,clearcoat:.3}),'Opal flash diffuser',10.4,21.3,-2.89);
 disk(.28,seal,'Rear microphone',10.4,18.8,-2.89);
 for(const [y,h,name] of [[12,4.8,'Power key'],[2.4,8,'Volume rocker']]){
  const recess=p(1.95,h+.4,.55,.12,.035,seal,name+' recess',15.49,y);recess.rotation.y=Math.PI/2;
  const key=p(1.7,h,.47,.32,.10,metal,name,15.64,y);key.rotation.y=Math.PI/2;
 }
 for(const x of [-15.5,15.5])for(const y of [-23,23]){const m=add(new THREE.Mesh(new THREE.BoxGeometry(.065,.45,2.12),seal),x,y);m.name='Flush antenna divider'}
 const bottom=(w,h,r,mat,name,x=0,z=0,y=-32.53)=>{const m=p(w,h,r,.10,.03,mat,name,x,y,z);m.rotation.x=Math.PI/2;return m};
 bottom(4.4,1.4,.65,chamfer,'USB-C aperture rim');bottom(4.04,1.05,.49,seal,'USB-C socket',0,0,-32.60);bottom(2.7,.22,.10,metal,'USB-C contact tongue',0,0,-32.67);
 for(const x of [-10.7,-9.5,-8.3,-7.1,7.1,8.3,9.5,10.7])bottom(.59,.84,.28,seal,'Speaker opening',x,0,-32.6);
 p(7,.25,.12,.08,.022,seal,'Recessed earpiece grille',0,31.1,1.825);
 for(let i=0;i<22;i++)disk(.036,chamfer,'Earpiece perforation',-3.1+i*.295,31.1,1.88);
 disk(.67,seal,'Centered selfie camera',0,28.9,1.9);disk(.36,optical,'Selfie camera optic',0,28.9,1.916);
 // Subtle Pixel-style identity; no model number is claimed.
 const c=document.createElement('canvas');c.width=256;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#8f9888';ctx.font='500 148px sans-serif';ctx.textAlign='center';ctx.fillText('G',128,179);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
 const logo=add(new THREE.Mesh(new THREE.PlaneGeometry(4.5,4.5),new THREE.MeshStandardMaterial({map,transparent:true,roughness:.6,depthWrite:false})),0,-1,-1.825);logo.rotation.y=Math.PI;logo.name='Subtle rear G monogram';
 phone.userData={editableSource:'contact-phone.js',design:'Pixel-style porcelain handset; distinct geometry and screen from Helm',dimensionsInSceneUnits:[W,H,3.1]};return batchPhone(phone);
}
export class ContactPhone {
 static async loadScreens(){return Promise.all(['portrait','landscape','compact'].map(async kind=>{return assetImage(`assets/contact-screen-${kind}.webp`)}))}
 constructor(scene,camera,images){
  this.state={lift:0,yaw:0,pitch:0,moving:false,mode:'resting'};this.camera=camera;this.ray=new THREE.Raycaster();this.transition=null;this.rotationTransition=null;
  this.root=new THREE.Group();this.root.name='Contact phone exhibit';
  const depth=4.6,dir=camera.getWorldDirection(new THREE.Vector3());
  this.ray.setFromCamera(new THREE.Vector2(156/1448*2-1,1-531/1086*2),camera);
  this.root.position.copy(this.ray.ray.origin).addScaledVector(this.ray.ray.direction,depth/this.ray.ray.direction.dot(dir));
  this.unit=2*depth/(camera.projectionMatrix.elements[0]*1448);this.root.scale.setScalar(this.unit);this.root.quaternion.copy(camera.quaternion);scene.add(this.root);
  this.phone=buildContactHardware();this.root.add(this.phone);this.images=images;this.canvas=images[0];
  this.textures=images.map((image,index)=>{const texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.center.set(.5,.5);texture.rotation=index===1?Math.PI/2:0;texture.needsUpdate=true;return texture});this.texture=this.textures[0];
  const g=new THREE.ShapeGeometry(rounded(SW,SH,3.85),32),a=g.attributes.position;
  g.setAttribute('uv',new THREE.Float32BufferAttribute(Array.from({length:a.count},(_,i)=>[a.getX(i)/SW+.5,a.getY(i)/SH+.5]).flat(),2));
  this.screen=new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({color:0x020402,emissive:0xffffff,emissiveMap:this.texture,emissiveIntensity:1,roughness:1,clearcoat:0,specularIntensity:0,toneMapped:false}));
  this.screen.position.z=1.845;this.screen.name='Contact OLED display';this.phone.add(this.screen);
  this.shadow=new THREE.Mesh(new THREE.PlaneGeometry(43,15),new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{lift:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float lift;void main(){vec2 p=(vUv-.5)*2.;float a=(.28-.13*lift)*exp(-5.*dot(p,p));gl_FragColor=vec4(.08,.055,.035,a);}'}));
  this.shadow.position.set(-1,-34,-4);this.shadow.name='Soft contact shadow in wooden cradle';this.root.add(this.shadow);this.pose();
 }
 sync(){this.state.moving=!!this.transition}
 focus(value,immediate=false){
  const to=value?1:0;this.state.yaw=0;this.state.pitch=0;
  if(immediate){this.transition=null;this.state.lift=to;this.state.mode=value?'inspecting':'resting';this.pose();this.sync();return}
  this.transition={from:this.state.lift,to,start:performance.now(),duration:1050};this.state.mode=value?'lifting':'lowering';this.sync();
 }
 tick(now){
  if(!this.transition)return false;
  const a=this.transition,t=clamp((now-a.start)/a.duration,0,1);this.state.lift=a.from+(a.to-a.from)*ease(t);
  if(t===1){this.transition=null;this.state.mode=a.to?'inspecting':'resting'}
  this.pose();this.sync();return true;
 }
 pose(){
  const l=this.state.lift,frame=contactFrame(),camera=this.camera;
  const depth=4.6,pixelsPerUnit=camera.projectionMatrix.elements[5]*this.unit*innerHeight/(2*depth);
  const scale=frame.height/((frame.landscape?W:H)*pixelsPerUnit+frame.height*1.845*this.unit/depth);
  this.ray.setFromCamera(new THREE.Vector2(frame.cx/innerWidth*2-1,1-frame.cy/innerHeight*2),camera);
  const distance=(depth-1.845*this.unit*scale)/this.ray.ray.direction.dot(camera.getWorldDirection(new THREE.Vector3()));
  const target=this.root.worldToLocal(this.ray.ray.origin.clone().addScaledVector(this.ray.ray.direction,distance));
  this.phone.position.set(target.x*l,target.y*l,0);this.phone.scale.setScalar(1+(scale-1)*l);
  this.phone.rotation.set(-.09*(1-l),-.24*(1-l),-.09*(1-l)+(frame.landscape?-Math.PI/2:0)*l);
  // Native page and texture share the exact design, including landscape layout.
  const index=l===0?0:frame.landscape?1:frame.compact?2:0;
  if(this.screenIndex!==index){this.screenIndex=index;this.texture=this.textures[index];this.screen.material.emissiveMap=this.texture;}
  this.root.updateMatrixWorld(true);if(this.shadow){this.shadow.material.uniforms.lift.value=l;this.shadow.visible=l<.98}
 }
 screenBounds(){
  this.screen.updateMatrixWorld(true);const points=[];
  for(const x of [-SW/2,SW/2])for(const y of [-SH/2,SH/2])points.push(this.screen.localToWorld(new THREE.Vector3(x,y,0)).project(this.camera));
  const xs=points.map(p=>(p.x+1)*innerWidth/2),ys=points.map(p=>(1-p.y)*innerHeight/2);return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
 }
 bounds(){this.phone.updateMatrixWorld(true);const points=[];for(const x of [-16,16])for(const y of [-32.6,32.6])for(const z of [-3.3,1.95])points.push(this.phone.localToWorld(new THREE.Vector3(x,y,z)).project(this.camera));const xs=points.map(p=>(p.x+1)*innerWidth/2),ys=points.map(p=>(1-p.y)*innerHeight/2);return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]}
}
