// Project one physical paper surface into four screen-space corners. The room
// camera and pickup use the same coordinates on every frame, including reversal.
export function projectQuad(w,h,points){
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=points;
 const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
 const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
 const det=dx1*dy2-dx2*dy1;
 const g=(dx3*dy2-dx2*dy3)/det,k=(dx1*dy3-dx3*dy1)/det;
 const a=x1-x0+g*x1,b=x3-x0+k*x3,d=y1-y0+g*y1,e=y3-y0+k*y3;
 return `matrix3d(${a/w},${d/w},0,${g/w},${b/h},${e/h},0,${k/h},0,0,1,0,${x0},${y0},0,1)`;
}
