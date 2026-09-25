import * as THREE from 'three';
import {mergeVertices,mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export const HARDWARE={width:26,height:55,screenWidth:24.1,screenHeight:52.5,screenZ:1.415};
export function rounded(w,h,r){
 const s=new THREE.Shape(),x=w/2-r,y=h/2-r;
 s.absarc(x,-y,r,-Math.PI/2,0,false);s.absarc(x,y,r,0,Math.PI/2,false);
 s.absarc(-x,y,r,Math.PI/2,Math.PI,false);s.absarc(-x,-y,r,Math.PI,Math.PI*1.5,false);s.closePath();return s;
}
export function plate(w,h,r,d,bevel,material,name){
 let g=new THREE.ExtrudeGeometry(rounded(w-2*bevel,h-2*bevel,r-bevel),{depth:d-2*bevel,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:w>5?5:3,curveSegments:w>5?16:6,steps:1});
 g.translate(0,0,-d/2+bevel);g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g);g.computeVertexNormals();const m=new THREE.Mesh(g,material);m.name=name;return m;
}
export function buildHardware(){
 const phone=new THREE.Group();phone.name='Helm handset — machined graphite and glass';
 const metal=new THREE.MeshPhysicalMaterial({color:0x909ba1,metalness:1,roughness:.27,clearcoat:.25,clearcoatRoughness:.22});
 const cut=new THREE.MeshStandardMaterial({color:0xb4bec2,metalness:1,roughness:.18});
 const dark=new THREE.MeshStandardMaterial({color:0x030507,metalness:.12,roughness:.5});
 const gasket=new THREE.MeshStandardMaterial({color:0x15181b,roughness:.82});
 const glass=new THREE.MeshPhysicalMaterial({color:0x07101a,metalness:.12,roughness:.16,clearcoat:1,clearcoatRoughness:.08,ior:1.5});
 const back=new THREE.MeshPhysicalMaterial({color:0x18212a,metalness:.18,roughness:.28,clearcoat:1,clearcoatRoughness:.11});
 const add=(m,x=0,y=0,z=0)=>{m.position.set(x,y,z);phone.add(m);return m};
 const panel=(w,h,r,d,b,mat,name,x=0,y=0,z=0)=>add(plate(w,h,r,d,b,mat,name),x,y,z);
 panel(26,55,3.35,2.35,.28,metal,'Continuous machined aluminum midframe');
 panel(25.87,54.87,3.3,.21,.065,cut,'Diamond-cut front chamfer',0,0,1.14);
 panel(25.64,54.64,3.18,.13,.04,gasket,'Display perimeter gasket',0,0,1.255);
 panel(25.53,54.53,3.13,.20,.07,glass,'Polished cover glass edge',0,0,1.29);
 panel(25.8,54.8,3.24,.16,.05,cut,'Rear polished chamfer',0,0,-1.155);
 panel(25.57,54.57,3.15,.15,.05,gasket,'Rear panel seam',0,0,-1.245);
 panel(25.43,54.43,3.08,.20,.07,back,'Satin graphite glass back',0,0,-1.35);
 // Dielectric breaks run across each flat side of the actual metal rail.
 for(const x of [-13.005,13.005])for(const y of [-19.6,19.6]){const m=add(new THREE.Mesh(new THREE.BoxGeometry(.06,.40,1.63),gasket),x,y,0);m.name='Flush antenna break'}
 for(const [y,h,name] of [[9.5,4,'Power key'],[1.7,6.8,'Volume rocker']]){
  const recess=panel(1.63,h+.3,.42,.09,.025,dark,name+' pocket',13.04,y,0);recess.rotation.y=Math.PI/2;
  const key=panel(1.38,h,.34,.30,.09,metal,name,13.16,y,0);key.rotation.y=Math.PI/2;
 }
 // Bottom apertures sit on the XZ plane, facing out of the bottom edge.
 const bottom=(w,h,r,d,mat,name,x=0,z=0,y=-27.51)=>{const m=panel(w,h,r,d,Math.min(.035,d/3),mat,name,x,y,z);m.rotation.x=Math.PI/2;return m};
 bottom(3.3,.97,.42,.11,cut,'USB-C polished aperture');bottom(3.02,.73,.32,.12,dark,'USB-C recessed cavity',0,0,-27.57);bottom(2.18,.16,.065,.06,metal,'USB-C connector tongue',0,0,-27.65);
 for(const x of [-8.8,-7.8,-6.8,-5.8,5.8,6.8,7.8,8.8])bottom(.48,.66,.23,.08,dark,'Speaker grille aperture',x,0,-27.56);
 for(const x of [-3.2,3.2]){bottom(.38,.38,.18,.07,cut,'Service screw head',x,0,-27.55);bottom(.21,.055,.023,.05,dark,'Service screw slot',x,0,-27.60)}
 // Narrow earpiece with separately modeled perforations.
 panel(5.6,.25,.12,.05,.015,dark,'Earpiece inset',0,26.6,1.398);
 for(let i=0;i<20;i++){const m=add(new THREE.Mesh(new THREE.CircleGeometry(.032,8),cut),-2.6+i*.275,26.6,1.43);m.name='Earpiece micro mesh'}
 const disk=(r,mat,name,x,y,z)=>{const m=add(new THREE.Mesh(new THREE.CircleGeometry(r,64),mat),x,y,z);m.name=name;if(z<0)m.rotation.y=Math.PI;return m};
 disk(.57,dark,'Front camera cutout',0,24.95,1.43);
 disk(.34,new THREE.MeshPhysicalMaterial({color:0x142233,metalness:.4,roughness:.1,clearcoat:1}), 'Front camera optical element',0,24.95,1.441);
 disk(.13,dark,'Front camera pupil',0,24.95,1.452);
 // Raised camera bridge: metal shoulder, isolating seal, ceramic top, optics.
 panel(23.7,8.0,2.0,.85,.22,metal,'Camera bridge machined shoulder',0,17.7,-1.74);
 panel(23.2,7.55,1.81,.20,.055,gasket,'Camera bridge seal',0,17.7,-2.17);
 panel(22.96,7.29,1.70,.25,.09,glass,'Camera bridge polished ceramic',0,17.7,-2.30);
 const ring=(r,tube,mat,name,x,y,z)=>{const m=add(new THREE.Mesh(new THREE.TorusGeometry(r,tube,10,72),mat),x,y,z);m.name=name;return m};
 const optical=new THREE.MeshPhysicalMaterial({color:0x0b1727,metalness:.28,roughness:.075,clearcoat:1,clearcoatRoughness:.025,iridescence:.3,iridescenceIOR:1.32,iridescenceThicknessRange:[220,360]});
 for(const [x,r] of [[-6.5,2.66],[.3,2.38]]){
  disk(r+.12,dark,'Lens housing shadow well',x,17.7,-2.443);
  ring(r,.16,cut,'Precision turned lens bezel',x,17.7,-2.49);
  disk(r-.17,optical,'Coated optical cover',x,17.7,-2.51);
  ring(r-.48,.07,metal,'Internal lens barrel',x,17.7,-2.54);
  disk(r-.65,dark,'Recessed lens aperture',x,17.7,-2.557);
  ring(r-.86,.055,optical,'Inner optical element',x,17.7,-2.57);
  const pupil=add(new THREE.Mesh(new THREE.SphereGeometry((r-.65)*.55,48,24),optical),x,17.7,-2.57);
  pupil.scale.z=.10;pupil.name='Curved internal optical element';
 
 }
 const flash=new THREE.MeshPhysicalMaterial({color:0xded7ba,roughness:.45,clearcoat:.6});
 disk(.86,metal,'Flash metal rim',7.2,18.35,-2.45);disk(.67,flash,'Diffused dual-tone flash',7.2,18.35,-2.47);
 disk(.23,dark,'Rear microphone',7.2,16.45,-2.47);
 // Tiny laser-marked back logo, applied to the glass surface rather than floating.
 const label=document.createElement('canvas');label.width=512;label.height=256;const c=label.getContext('2d');c.fillStyle='#829099';c.font='300 72px sans-serif';c.textAlign='center';c.fillText('helm ○',256,123);c.font='17px sans-serif';c.fillStyle='#657078';c.fillText('PHONE SHELL  /  TOKYO NIGHT',256,176);
 const map=new THREE.CanvasTexture(label);map.colorSpace=THREE.SRGBColorSpace;
 const logo=add(new THREE.Mesh(new THREE.PlaneGeometry(10,5),new THREE.MeshStandardMaterial({map,transparent:true,roughness:.55,metalness:.45,depthWrite:false})),0,-3,-1.458);logo.rotation.y=Math.PI;logo.name='Laser-etched Helm wordmark';
 phone.userData={construction:'layered metal chassis, glass panels, physical optical assemblies',chassisDimensionsMillimeters:[75,158.65,6.78],editableSource:'helm-hardware.js'};
 return batchPhone(phone);
}

// Static hardware pieces sharing one opaque material can be one draw without
// changing a vertex, normal, silhouette, material or the interactive OLED.
export function batchPhone(phone){
 const batches=new Map();phone.updateMatrixWorld(true);
 for(const mesh of phone.children){if(!mesh.isMesh||Array.isArray(mesh.material)||mesh.material.transparent)continue;const material=mesh.material;if(!batches.has(material))batches.set(material,[]);batches.get(material).push(mesh)}
 for(const [material,meshes] of batches){
  if(meshes.length<2)continue;
  const geometries=meshes.map(mesh=>{const geometry=mesh.geometry.clone().applyMatrix4(mesh.matrix);if(!material.map&&!material.normalMap&&!material.emissiveMap)geometry.deleteAttribute('uv');return geometry});
  const indexed=geometries.every(g=>g.index),compatible=geometries.map(g=>!indexed&&g.index?g.toNonIndexed():g);
  const merged=mergeGeometries(compatible);if(!merged){geometries.forEach(g=>g.dispose());continue}
  const mesh=new THREE.Mesh(merged,material);mesh.name=meshes.map(m=>m.name).join(' / ');mesh.userData.parts=meshes.length;
  for(const old of meshes){phone.remove(old);old.geometry.dispose()}
  phone.add(mesh);new Set([...geometries,...compatible]).forEach(g=>g.dispose());
 }
 return phone;
}
