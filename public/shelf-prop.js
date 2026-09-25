import {inspectionBox} from './inspection-layout.js';
import * as THREE from 'three';
import {shelfById} from './shelf-data.js';
import {buildShelfModel} from './shelf-models.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),ease=t=>t*t*t*(t*(t*6-15)+10);
const special={shaco:{center:[1147,284],height:78,rotation:[.08,-.25,0]},sonic:{center:[1070,377],height:71,rotation:[.08,-.25,0]},baseball:{center:[1204,310],height:25,rotation:[.08,-.3,0]},dreamcast:{center:[993,393],height:39,rotation:[.31,-.04,0]},weightlifting:{center:[1195,399],height:28,rotation:[.13,-.3,.015]},'student-drawing':{center:[1070,287],height:69,rotation:[.035,-.025,0]}};
export function restDefinition(id){const item=shelfById.get(id);if(special[id])return special[id];const[x,y,w,h]=item.rect;return {center:[x+w/2,y+h/2-1.2],height:h-2,rotation:[0,Math.PI/2,0]}}
export {inspectionBox} from './inspection-layout.js';
export class ShelfProp{
 static async create(id,scene,calibration,camera){return new ShelfProp(id,scene,calibration,camera,await buildShelfModel(id))}
 constructor(id,scene,calibration,camera,model){
  this.id=id;this.camera=camera;this.definition=restDefinition(id);this.state={lift:0,yaw:0,pitch:0,moving:false,mode:'resting'};this.transition=null;
  this.root=new THREE.Group();this.root.name=id+' pickup root';this.root.quaternion.copy(calibration.quaternion);scene.add(this.root);
  this.pivot=new THREE.Group();this.root.add(this.pivot);this.model=model;this.pivot.add(model);
  this.restQuaternion=new THREE.Quaternion().setFromEuler(new THREE.Euler(...this.definition.rotation));
  this.inspectQuaternion=new THREE.Quaternion().setFromEuler(new THREE.Euler(id==='dreamcast'?.32:.055,id==='student-drawing'?-.12:-.25,0));
  this.depth=4.6;this.ray=new THREE.Raycaster();this.direction=calibration.getWorldDirection(new THREE.Vector3());
  const[cx,cy]=this.definition.center;this.restPosition=this.at(cx,cy,calibration,1448,1086);this.unit=2*this.depth/(calibration.projectionMatrix.elements[5]*1086);this.restScale=this.unit*this.definition.height;
  const size=new THREE.Vector3().fromArray(model.userData.dimensions),b=new THREE.Box3(size.clone().multiplyScalar(-.5),size.clone().multiplyScalar(.5));this.size=size;this.radius=size.length()/2;
  const restingSize=b.clone().applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(this.restQuaternion)).getSize(new THREE.Vector3());this.restScale/=restingSize.y;
  this.shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float opacity;void main(){vec2 p=(vUv-.5)*2.;float a=opacity*exp(-5.*dot(p,p))*(1.-smoothstep(.75,1.,length(p)));gl_FragColor=vec4(.045,.026,.012,a);}',uniforms:{opacity:{value:.45}}}));
  this.shadow.name=id+' shelf contact';this.shadow.quaternion.copy(calibration.quaternion);const shadowWidth=id==='dreamcast'?90:id==='weightlifting'?72:id==='student-drawing'?55:shelfById.get(id).kind==='book'?20:id==='baseball'?28:40;
  this.shadow.position.copy(this.at(cx,cy+this.definition.height/2-1,calibration,1448,1086));this.shadow.scale.set(shadowWidth*this.unit,5*this.unit,1);scene.add(this.shadow);
  this.light=new THREE.DirectionalLight(0xffebd2,2.1);this.light.name='Warm inspection key';this.light.target=this.root;scene.add(this.light);this.lightOffset=new THREE.Vector3(3,4,5).applyQuaternion(calibration.quaternion);
  const fill=new THREE.HemisphereLight(0xfff5df,0x453024,.7);scene.add(fill);scene.environmentIntensity=.55;
  this.pose();
 }
 at(x,y,camera,w=innerWidth,h=innerHeight){this.ray.setFromCamera(new THREE.Vector2(x/w*2-1,1-y/h*2),camera);return this.ray.ray.origin.clone().addScaledVector(this.ray.ray.direction,this.depth/this.ray.ray.direction.dot(this.direction))}
 focus(value,immediate=false){
  const to=value?1:0;if(immediate){this.transition=null;Object.assign(this.state,{lift:to,yaw:0,pitch:0,moving:false,mode:value?'inspecting':'resting'});this.pose();return}
  if(this.state.lift===to&&!this.transition)return;
  this.transition={from:this.state.lift,to,rotation:[this.state.yaw,this.state.pitch],start:performance.now(),duration:(value?600:300)*Math.max(.25,Math.abs(to-this.state.lift))};this.state.mode=value?'lifting':'returning';this.state.moving=true;
 }
 turn(yaw,pitch){this.state.yaw=yaw;this.state.pitch=clamp(pitch,-.65,.65);this.pose()}
 reset(){this.turn(0,0)}
 tick(now){const a=this.transition;if(!a)return false;let t=clamp((now-a.start)/a.duration,0,1);const e=ease(t);this.state.lift=a.from+(a.to-a.from)*e;if(a.to===0){this.state.yaw=a.rotation[0]*(1-e);this.state.pitch=a.rotation[1]*(1-e)}if(t===1){this.transition=null;this.state.moving=false;this.state.mode=a.to?'inspecting':'resting'}this.pose();return true}
 pose(){
  const s=this.state,l=s.lift,[x,y,w,h]=inspectionBox(innerWidth,innerHeight,this.id),unit=2*this.depth/(this.camera.projectionMatrix.elements[5]*innerHeight);
  // One fixed envelope per viewport: turning changes projection, never object scale.
  const spin=new THREE.Quaternion().setFromEuler(new THREE.Euler(s.pitch,s.yaw,0));
  const horizontal=Math.hypot(this.size.x,this.size.z);
  const maxTilt=this.id==='dreamcast'?.98:.71;
  const tilt=Math.min(maxTilt,Math.atan2(horizontal,this.size.y));
  const vertical=this.size.y*Math.cos(tilt)+horizontal*Math.sin(tilt);
  const fill=innerWidth<=700&&innerHeight>innerWidth?.94:.88;
  const scale=Math.min(w/horizontal,h/vertical)*fill*unit;
  const target=this.at(x+w/2,y+h/2,this.camera);
  this.root.position.copy(this.restPosition).lerp(target,l);this.root.scale.setScalar(this.restScale+(scale-this.restScale)*l);this.root.up.copy(new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion));this.root.lookAt(this.camera.position);
  const turnProgress=shelfById.get(this.id).kind==='book'?ease(clamp((l-.15)/.85,0,1)):l;
  this.pivot.quaternion.copy(this.restQuaternion).slerp(this.inspectQuaternion,turnProgress).multiply(spin);
  this.shadow.material.uniforms.opacity.value=.52*(1-l);this.shadow.visible=l<.995;
  this.light.position.copy(this.root.position).add(this.lightOffset);this.root.updateMatrixWorld(true);
 }
 bounds(){this.root.updateMatrixWorld(true);const b=new THREE.Box3(this.size.clone().multiplyScalar(-.5),this.size.clone().multiplyScalar(.5)),pts=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])pts.push(new THREE.Vector3(x,y,z).applyMatrix4(this.pivot.matrixWorld).project(this.camera));return[Math.min(...pts.map(p=>(p.x+1)*innerWidth/2)),Math.min(...pts.map(p=>(1-p.y)*innerHeight/2)),Math.max(...pts.map(p=>(p.x+1)*innerWidth/2)),Math.max(...pts.map(p=>(1-p.y)*innerHeight/2))]}
}
