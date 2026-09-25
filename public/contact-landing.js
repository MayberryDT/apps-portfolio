import {profileContent} from './profile-content.js';
export function contactFrame(vw=innerWidth,vh=innerHeight){
 const landscape=vw>vh&&vh<600,ratio=landscape?65/31:31/65;
 const height=Math.min(landscape?360:820,vh-(landscape?124:120),(vw-64)/ratio);
 return{landscape,compact:!landscape&&height<600,height,width:height*ratio,cx:vw/2,cy:vh/2-10};
}
export const CONTACT={email:'mailto:tyler@animasai.co',github:'https://github.com/MayberryDT',linkedin:'https://www.linkedin.com/in/mayberrydt/'};
// Native HTML is the display at rest after pickup. The same page is captured to
// the model's screen texture during motion; links never depend on canvas picking.
export class ContactLanding {
 constructor(world){
  this.root=document.createElement('section');this.root.id='contact-landing';this.root.className='contact-page';this.root.hidden=true;this.root.inert=true;this.root.setAttribute('aria-label','Contact Tyler Mayberry');this.root.setAttribute('aria-hidden','true');
  this.root.innerHTML=`<span class="contact-camera" aria-hidden="true"></span>
   <header class="contact-brand"><span class="contact-monogram" aria-hidden="true">tm.</span><span>TYLER<br>MAYBERRY</span></header>
   <div class="contact-intro"><p class="contact-eyebrow">From my studio</p><h1 id="contact-heading" tabindex="-1">Say<br>hello</h1><p class="contact-copy">A project in mind, an idea to share, or just saying hello? You can reach me here.</p></div>
   <div class="contact-actions"><a class="contact-email" href="${CONTACT.email}"><span>Email me</span><span aria-hidden="true">↗</span></a><span class="contact-address">tyler@animasai.co</span>
    <nav class="contact-social" aria-label="Elsewhere"><a href="${CONTACT.github}" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a><a href="${CONTACT.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></nav></div>
   <span class="contact-home-indicator" aria-hidden="true"></span>`;
  const tabs=document.createElement('nav');tabs.className='contact-tabs';tabs.setAttribute('aria-label','Phone pages');tabs.innerHTML='<a href="#contact" data-contact-tab="contact">Contact</a><a href="/about.html" data-contact-tab="about">About</a>';
  this.root.querySelector('.contact-brand').after(tabs);
  this.profile=document.createElement('div');this.profile.className='contact-profile';this.profile.hidden=true;this.profile.tabIndex=0;this.profile.setAttribute('aria-label','About Tyler Mayberry');this.profile.innerHTML=profileContent.about;
  this.root.querySelector('.contact-home-indicator').before(this.profile);
  world.append(this.root);this.visible=false;this.about=false;
 }
 select(about){
  const changed=this.about!==about;this.about=about;this.root.dataset.page=about?'about':'contact';this.profile.hidden=!about;
  for(const el of this.root.querySelectorAll('.contact-intro,.contact-actions'))el.hidden=about;
  for(const el of this.root.querySelectorAll('[data-contact-tab]')){if((el.dataset.contactTab==='about')===about)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')}
  if(changed){this.profile.scrollTop=0;if(this.visible)this.focus()}
 }
 layout({selected,phone,moving,failed=false}){
  const ready=selected&&!moving&&((phone&&phone.state.lift===1)||failed);
  this.root.hidden=!ready;this.root.inert=!ready;this.root.setAttribute('aria-hidden',String(!ready));
  document.body.dataset.contactFallback=String(ready&&failed);
  if(!ready){this.visible=false;return}
  const {landscape,compact,height,width,cx,cy}=contactFrame();
  this.root.dataset.landscape=String(landscape);this.root.dataset.compact=String(compact);this.root.classList.toggle('contact-fallback',failed);
  const w=landscape?650:compact?280:360,h=landscape?300:compact?607:780;
  let bounds;
  if(phone&&!failed)bounds=phone.screenBounds();
  else bounds=[cx-width/2,cy-height/2,cx+width/2,cy+height/2];
  const [l,t,r,b]=bounds;Object.assign(this.root.style,{width:w+'px',height:h+'px',transform:`translate(${l}px,${t}px) scale(${(r-l)/w},${(b-t)/h})`});
  this.root.style.setProperty('--profile-scale',String(w/(r-l)));
  if(!this.visible){this.visible=true;this.focus()}
 }
 focus(){const heading=this.about?this.profile.querySelector('h1'):this.root.querySelector('#contact-heading');heading.tabIndex=-1;heading.focus({preventScroll:true})}
}
