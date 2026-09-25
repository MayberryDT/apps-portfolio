import * as THREE from 'three';
// Anchor a normalized collectible to the same photographic coordinates as its still.
export class SonicFigure {
 constructor(scene,camera,model){
  this.root=new THREE.Group();this.root.name='Sonic at the second shelf';
  const depth=4.6,ray=new THREE.Raycaster(),direction=camera.getWorldDirection(new THREE.Vector3());
  ray.setFromCamera(new THREE.Vector2(1070/1448*2-1,1-411/1086*2),camera);
  this.root.position.copy(ray.ray.origin).addScaledVector(ray.ray.direction,depth/ray.ray.direction.dot(direction));
  const unit=2*depth/(camera.projectionMatrix.elements[5]*1086);this.root.scale.setScalar(unit*70);this.root.quaternion.copy(camera.quaternion);scene.add(this.root);
  this.pivot=new THREE.Group();this.pivot.name='Sonic inspection pivot';this.root.add(this.pivot);
  model.rotation.set(.13,-.25,0);this.pivot.add(model);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(.94,.15),new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;gl_FragColor=vec4(.06,.035,.02,.34*exp(-5.*dot(p,p)));}'}));contact.position.set(.02,-.024,-.15);contact.name='Soft shelf contact';this.root.add(contact);
 }
}
