import * as THREE from 'three';
// A warm window and dark studio surfaces give the machined edges and cover glass
// something shaped to reflect. This environment belongs only to the Helm scene.
export function helmEnvironment(renderer,size=256){
 const room=new THREE.Scene();room.background=new THREE.Color(0x11151b);
 const resources=[];
 function panel(size,pos,color,intensity=1){const geometry=new THREE.BoxGeometry(...size),material=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity)}),m=new THREE.Mesh(geometry,material);m.position.set(...pos);room.add(m);resources.push(geometry,material);return m}
 panel([20,.1,20],[0,-5,0],0x4b3729);
 panel([20,.1,20],[0,8,0],0x5c636d);
 panel([.1,14,20],[-10,1,0],0x2e3139);
 panel([.1,14,20],[10,1,0],0x252933);
 panel([5,8,.1],[-4.1,2.4,8],0xffedd9,3.5);
 panel([.13,8,.2],[-4.1,2.4,7.8],0x252831);
 panel([5,.13,.2],[-4.1,2.4,7.8],0x252831);
 const strip=panel([1.1,11,.1],[5.8,1.5,5],0xe7efff,2.3);strip.rotation.y=-.55;
 panel([7,9,.1],[0,1,-9],0x363d47);
 panel([3,7,.1],[-5,3,-8],0xffe8d1,2);
 const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(room,.025,.1,100,{size});pmrem.dispose();resources.forEach(r=>r.dispose());return target;
}
