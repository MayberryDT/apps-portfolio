// Photographic navigation has no Three.js dependency or graphics context.
let implementation,loading;
const empty={ready:false,lost:false,active:null,loaded:[],draws:0};
async function load(){
 if(!loading)loading=import('./object-renderer.js').then(m=>implementation=m.objects).catch(error=>{loading=null;throw error});
 return loading;
}
export const objects={
 get state(){return implementation?.state||empty},
 async prepare(...args){return (await load()).prepare(...args)},
 activate(...args){return implementation.activate(...args)},
 hide(){implementation?.hide()},
 view(...args){implementation?.view(...args)},
 resize(...args){implementation?.resize(...args)},
 draw(...args){implementation?.draw(...args)},
 get prop(){return implementation?.prop},get actor(){return implementation?.actor},
 get pixel(){return implementation?.pixel},get handset(){return implementation?.handset},
 get helm(){return implementation?.helm},get pivot(){return implementation?.pivot},
 get scene(){return implementation?.scene},get renderer(){return implementation?.renderer},
 get activeCamera(){return implementation?.activeCamera}
};
