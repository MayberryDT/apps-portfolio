// The five supplied PhoneShell images retain their native aspect ratio. Controls
// below are a local visual demo; no messages, media or route requests leave it.
export const HELM_APPS=['Music','Messages','Maps','Browser','Video'];
export const DISPLAY={width:1024,height:2240,imageY:116,imageScale:1024/941,dockY:2000};
const tracks=['Midnight Overdrive','Shibuya Lights','Wangan Runner','Neon Tides','Rain on the Expressway','Nightfall in Tokyo','Odaiba Drift'];
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export class HelmShell {
 static async load(){return Promise.all(['music','messages','maps','browser','video'].map(async name=>{const i=new Image();i.src=`assets/helm/${name}.webp`;await i.decode();return i}))}
 constructor(images){
  this.images=images;this.canvas=document.createElement('canvas');Object.assign(this.canvas,{width:DISPLAY.width,height:DISPLAY.height});
  this.state={page:0,playing:false,track:0,draft:false,navigating:false,steps:false,palette:false,video:false};this.fade=null;this.paint();
 }
 get controls(){const s=this.state;return [
  [s.playing?'Pause preview':'Play preview','Next track'],
  [s.draft?'Clear draft':'Try a reply','View conversation'],
  [s.navigating?'Stop route preview':'Start route preview',s.steps?'Hide steps':'Show steps'],
  [s.palette?'Close palette':'Explore palette','View page'],
  [s.video?'Close video preview':'Open video preview','View feed']
 ][s.page]}
 select(page){this.change(()=>{this.state.page=clamp(page,0,4)})}
 action(which='primary'){
  this.change(()=>{const s=this.state,secondary=which==='secondary';
   if(s.page===0){if(secondary)s.track=(s.track+1)%tracks.length;else s.playing=!s.playing}
   if(s.page===1)s.draft=secondary?false:!s.draft;
   if(s.page===2){if(secondary)s.steps=!s.steps;else s.navigating=!s.navigating}
   if(s.page===3)s.palette=secondary?false:!s.palette;
   if(s.page===4)s.video=secondary?false:!s.video;
  });
 }
 change(update){
  // Capture the visible composite so rapid switching is continuous.
  const from=document.createElement('canvas');from.width=this.canvas.width;from.height=this.canvas.height;from.getContext('2d').drawImage(this.canvas,0,0);
  update();this.fade=matchMedia('(prefers-reduced-motion: reduce)').matches?null:{from,start:performance.now()};this.paint();
 }
 tick(now){if(!this.fade)return false;if(matchMedia('(prefers-reduced-motion: reduce)').matches||now-this.fade.start>=240)this.fade=null;this.paint(now);return true}
 paint(now=performance.now()){
  const c=this.canvas.getContext('2d'),s=this.state,im=this.images[s.page];
  c.fillStyle='#090d20';c.fillRect(0,0,1024,2240);
  c.save();c.translate(0,DISPLAY.imageY);c.scale(DISPLAY.imageScale,DISPLAY.imageScale);c.drawImage(im,0,0);
  const box=(x,y,w,h,r,color='#101526')=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
  const text=(t,x,y,size=26,color='#c0caf5')=>{c.fillStyle=color;c.font=`${size}px sans-serif`;c.fillText(t,x,y)};
  if(s.page===0){
   box(128,547,226,75,18,'#4858cd');text(s.playing?'Ⅱ  Pause':'▶  Play',185,593,27,'#edf0ff');
   c.strokeStyle='#7aa2f7';c.lineWidth=2;c.beginPath();c.roundRect(117,645+s.track*94,706,91,14);c.stroke();
   box(115,1363,709,134,18);c.drawImage(im,128,217,280,292,128,1378,86,86);
   text(tracks[s.track],232,1412,24);text('Helm',232,1450,22,'#7b8fc4');text(s.playing?'Ⅱ':'▶',653,1436,34);text('›|',745,1436,32);
   box(129,1476,678,3,2,'#24283b');box(129,1476,s.playing?466:200,3,2,'#7aa2f7');
  }
  if(s.page===1&&s.draft){box(72,1342,797,196,28);text('Sounds good. Talk tomorrow.',102,1400,29);text('Draft · stays on this phone',102,1448,22,'#7aa2f7');text('Tap to clear',102,1504,22,'#8994b8')}
  if(s.page===2&&s.navigating){box(78,416,784,120,20,'#171e37');text('↗  Continue toward Union Hall',108,469,30);text('Route preview · 12 min remaining',108,509,22,'#7aa2f7');box(81,1429,239,74,18,'#4858cd');text('■  Stop',143,1478,29,'#fff')}
  if(s.page===2&&s.steps){box(77,950,785,433,22);text('Your route',109,1010,36);['Head north on Kent Avenue','Turn left toward the bridge','Continue to Union Hall'].forEach((t,i)=>text(`${i+1}   ${t}`,109,1090+i*78,25));text('Local route preview',109,1333,22,'#7aa2f7')}
  if(s.page===3&&s.palette){box(109,370,722,870,24);text('Tokyo Night',143,443,48);text('A calm, vibrant dusk.',143,501,28,'#9aa5ce');['#1a1b26','#24283b','#7aa2f7','#bb9af7','#ff757f','#ff9e64'].forEach((color,i)=>{box(145,545+i*100,68,68,12,color);text(color.toUpperCase(),245,589+i*100,29)});text('Tap to return',143,1199,24,'#7aa2f7')}
  if(s.page===4&&s.video){box(115,82,711,1475,20,'#0c101b');c.drawImage(im,137,337,665,289,137,400,665,289);text('A Night in Tokyo',151,754,40);text('Visual preview',151,805,25,'#7aa2f7');text('Tap to return to the feed',151,1480,25,'#9aa5ce');box(420,509,96,76,18,'#121827dd');text('▶',452,559,38,'#fff')}
  c.restore();
  // Native PhoneShell app switcher with ample touch equivalents in the glass panel.
  c.fillStyle='#101528';c.beginPath();c.roundRect(42,2000,940,156,42);c.fill();
  HELM_APPS.forEach((name,i)=>{const x=136+i*188;if(i===s.page){c.fillStyle='#283250';c.beginPath();c.roundRect(x-84,2012,168,132,31);c.fill()}
   c.strokeStyle=i===s.page?'#bb9af7':'#7481a9';c.lineWidth=4;c.beginPath();
   if(i===0){c.moveTo(x-10,2077);c.lineTo(x-10,2037);c.lineTo(x+19,2031);c.lineTo(x+19,2070);c.stroke();c.beginPath();c.ellipse(x-17,2077,9,6,0,0,7);c.ellipse(x+12,2070,9,6,0,0,7)}
   if(i===1){c.roundRect(x-23,2034,46,35,8);c.moveTo(x-15,2069);c.lineTo(x-18,2081);c.lineTo(x-2,2069)}
   if(i===2){c.arc(x,2053,22,0,Math.PI*2);c.moveTo(x,2038);c.lineTo(x-9,2064);c.lineTo(x+9,2058);c.closePath()}
   if(i===3){c.arc(x,2053,24,0,Math.PI*2);c.moveTo(x-24,2053);c.lineTo(x+24,2053);c.moveTo(x,2029);c.bezierCurveTo(x-16,2042,x-16,2068,x,2077);c.bezierCurveTo(x+16,2068,x+16,2042,x,2029)}
   if(i===4){c.roundRect(x-25,2035,50,37,9);c.moveTo(x-5,2044);c.lineTo(x+10,2054);c.lineTo(x-5,2063);c.closePath()}
   c.stroke();c.fillStyle=i===s.page?'#dae2ff':'#8b96bd';c.font='24px sans-serif';c.textAlign='center';c.fillText(name,x,2121);c.textAlign='left';
  });
  c.fillStyle='#bec6e6';c.beginPath();c.roundRect(394,2200,236,7,4);c.fill();
  if(this.fade){const t=clamp((now-this.fade.start)/240,0,1);c.globalAlpha=(1-t)**3;c.drawImage(this.fade.from,0,0);c.globalAlpha=1}
 }
 tap(x,y){
  if(y>=1980&&y<=2165){this.select(clamp(Math.floor((x-42)/188),0,4));return true}
  const sx=x/DISPLAY.imageScale,sy=(y-DISPLAY.imageY)/DISPLAY.imageScale,s=this.state;
  if(sy>1555&&sy<1680){this.select((s.page+1)%5);return true}
  if(s.page===0){
   if(sy>1360&&sy<1500){this.action(sx>716?'secondary':'primary');return true}
   if(sy>542&&sy<626){this.action(sx>365?'secondary':'primary');return true}
   if(sy>645&&sy<1300){this.change(()=>{s.track=clamp(Math.floor((sy-645)/94),0,6);s.playing=true});return true}
  }
  if(s.page===1&&sy>1320&&sy<1550){this.action();return true}
  if(s.page===2){if(sy>1420&&sy<1510){this.action(sx>340?'secondary':'primary');return true}if(s.steps&&sy>950&&sy<1385){this.action('secondary');return true}}
  if(s.page===3&&sy>350&&sy<1250){this.action();return true}
  if(s.page===4&&sy>320&&sy<1550){this.action();return true}
  return false;
 }
}
