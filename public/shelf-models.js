import {MeshoptDecoder} from './vendor/meshoptimizer/meshopt_decoder.mjs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {shelfById} from './shelf-data.js';
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),downloads=new Map();
const modelPath=path=>matchMedia('(max-width:700px), (max-height:600px) and (pointer:coarse)').matches?'mobile/'+path.replace(/\.gltf$/,'.glb'):path;
function modelBytes(id,priority='high'){
 if(!downloads.has(id)){
  const task=fetch(modelPath(`assets/models/${id}.glb`),{priority}).then(r=>{if(!r.ok)throw new Error('Model unavailable');return r.arrayBuffer()}).catch(error=>{downloads.delete(id);throw error});
  downloads.set(id,task);
 }
 return downloads.get(id);
}
export function prefetchShelfBooks(){
 for(const item of shelfById.values())if(item.kind==='book')modelBytes(item.id,'low').catch(()=>{});
}
async function loadModel(id){return loader.parseAsync(await modelBytes(id),new URL('assets/models/',location.href).href)}
export async function buildShelfModel(id){
 const item=shelfById.get(id);if(!item)throw new Error('Unknown shelf item '+id);
 let root;if(item.kind==='book'||['weightlifting','dreamcast','student-drawing','sonic'].includes(id))root=(await loadModel(id)).scene;else root=(await loader.loadAsync(modelPath(id==='baseball'?'assets/baseball/baseball.gltf':`assets/${id}-inspect.glb`))).scene;
 // Preserve the sourced SA2 geometry/rig; align its authored forward axis.
 if(id==='sonic')root.rotation.y+=Math.PI/2;
 root.name=item.title;root.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 // Surface print is separate from the accepted housing. Use original bounds.
 if(id==='dreamcast')root.add((await loader.loadAsync(modelPath('assets/models/dreamcast-markings.glb'))).scene);
 const normalized=new THREE.Group();normalized.name=id+' centered geometry';normalized.add(root);root.position.sub(center);normalized.scale.setScalar(1/size.y);normalized.updateMatrixWorld(true);
 normalized.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.map)m.map.anisotropy=2}});
 normalized.userData.dimensions=id==='dreamcast'?size.clone().divideScalar(size.y).toArray():new THREE.Box3().setFromObject(normalized).getSize(new THREE.Vector3()).toArray();return normalized;
}
