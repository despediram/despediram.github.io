/* One continuous timeline: falling point -> hinged name -> word morph -> landing. */
(()=>{
 const stage=document.getElementById('cinema-intro'),word=stage.querySelector('.kinetic-word'),dot=stage.querySelector('.kinetic-dot'),heading=document.querySelector('.cinematic-hero h1'),canvas=document.getElementById('assembly-canvas'),ctx=canvas.getContext('2d'),replay=document.getElementById('replay-assembly'),meter=document.createElement('canvas').getContext('2d');
 const letters=Array.from({length:9},()=>{const el=document.createElement('span');word.appendChild(el);return{el,x:null,entered:0,char:''}}),morphs=['TON','PON','POR','PORT','PORTF','PORTFÓ','PORTFÓL','PORTFÓLI','PORTFÓLIO'];
 let active=false,start=0,raf=0,w=innerWidth,h=innerHeight,jobs=[],paused=0,cloudStarted=false,last=0,soundIndex=0;
 const soundTimeline=[[0,"fall",0],[430,"impact",0],[730,"letter",0],[1030,"letter",1],[1330,"letter",2],...Array.from({length:9},(_,i)=>[2050+i*105,"morph",i]),[3100,"landing",0],[3950,"particles",0]];
 const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v)},out=v=>1-Math.pow(1-clamp(v),3),mix=(a,b,t)=>a+(b-a)*t;
 function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(d,0,0,d,0,0)}resize();addEventListener('resize',resize,{passive:true});
 function reveal(el){el.classList.add('in');el.classList.remove('assembly-hidden')}
 function hideStage(){stage.hidden=true;stage.classList.remove('active');}
 function finish(){const was=active;active=false;root.classList.remove('assembling','intro-active','cinema-landed','controls-pending');root.style.removeProperty('--hero-copy');hideStage();if(was)document.dispatchEvent(new CustomEvent('cinema-finish'));}
 window.stopAssembly=()=>{finish();jobs.forEach(j=>reveal(j.el));jobs=[];document.querySelectorAll('.reveal').forEach(reveal);if(raf)cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,w,h)};
 function layout(t,dt){
  while(soundIndex<soundTimeline.length&&t>=soundTimeline[soundIndex][0]){const [at,kind,index]=soundTimeline[soundIndex++];if(t-at<160)document.dispatchEvent(new CustomEvent("cinema-sound",{detail:{kind,index,time:at}}));}
  const landing=smooth((t-3100)/850),style=getComputedStyle(heading),finalSize=parseFloat(style.fontSize),fontSize=mix(Math.min(w*.14,220),finalSize,landing),tracking=-fontSize*.085;
  const text=t<2050?'TON':morphs[Math.min(8,Math.floor((t-2050)/105))];
  meter.font='700 '+fontSize+'px "DM Sans",sans-serif';const widths=[...text].map(c=>meter.measureText(c).width+tracking),total=widths.reduce((a,b)=>a+b,0);
  const r=heading.getBoundingClientRect(),centerX=mix(w/2,r.left+total/2,landing),centerY=mix(h*.48,r.top+finalSize*.5,landing),left=centerX-total/2,top=centerY-fontSize*.5;
  word.style.fontSize=fontSize+'px';word.style.left=left+'px';word.style.top=top+'px';word.style.height=fontSize+'px';word.style.width=total+'px';
  const spring=1-Math.exp(-dt/45);let x=0;
  letters.forEach((l,i)=>{const c=text[i];if(!c){l.el.style.visibility='hidden';return}if(l.char!==c){const isNew=!l.char;l.char=c;l.el.textContent=c;if(isNew)l.entered=t}l.el.style.visibility='visible';if(l.x===null)l.x=x;else l.x=mix(l.x,x,spring);
   if(t<2050){const u=clamp((t-730-i*300)/620),s=out(u),angles=[-150,125,-105],angle=angles[i]*(1-s),orbit=fontSize*.65;
    l.el.style.opacity=t>=730+i*300?'1':'0';l.el.style.transformOrigin='50% 145%';l.el.style.transform='translate3d('+(x+Math.sin(angle*Math.PI/180)*orbit)+'px,'+(-Math.cos(u*Math.PI)*fontSize*.35*(1-s))+'px,0) rotate('+angle+'deg) rotateY('+(70*(1-s))+'deg)';
   }else{const appear=out((t-l.entered)/230);l.el.style.opacity='1';l.el.style.transformOrigin='50% 100%';l.el.style.transform='translate3d('+l.x+'px,'+((1-appear)*fontSize*.4)+'px,0) rotateY('+(85*(1-appear))+'deg) rotate('+(-20*(1-appear))+'deg)';}
   x+=widths[i];
  });
  let dotX=w/2,dotY=h*.48+fontSize*.67,scale=1;
  if(t<430){dotY=mix(-14,h*.48+fontSize*.67,Math.pow(clamp(t/430),2));}
  else if(t<730){dotY-=Math.sin((t-430)/300*Math.PI)*fontSize*.4;}
  else if(t<1900){const u=clamp((t-730)/1170);dotX+=Math.sin(u*Math.PI*3)*fontSize*.12*(1-u);dotY+=Math.sin(u*Math.PI*4)*fontSize*.08*(1-u);}
  if(t>1930)scale=1-smooth((t-1930)/180);dot.style.transform='translate3d('+dotX+'px,'+dotY+'px,0) translate(-50%,-50%) scale('+scale+')';
  if(t>=3100){root.classList.add('cinema-landed');root.style.setProperty('--hero-copy',String(smooth((t-3400)/650)));}
  if(t>=3950&&!cloudStarted){cloudStarted=true;document.dispatchEvent(new CustomEvent('cinema-reveal',{detail:{elapsed:t-3950}}));}
  stage.dataset.phase=t<730?'point':t<2050?'name':t<3000?'morph':t<3950?'landing':'particles';stage.dataset.time=String(Math.round(t));
 }
 function queue(){if(!raf&&!document.hidden&&!reduced)raf=requestAnimationFrame(frame)}
 function frame(now){raf=0;const dt=Math.min(now-(last||now-16),50);last=now;ctx.clearRect(0,0,w,h);if(reduced){window.stopAssembly();return}if(active){const t=now-start;layout(t,dt);if(t>=4050){hideStage();root.classList.remove('assembling','intro-active');}if(t>=6500)finish();}
  jobs=jobs.filter(j=>{const t=now-j.start;if(t<0)return true;const r=j.el.getBoundingClientRect(),p=clamp(t/480);if(t>230)reveal(j.el);if(t<850){ctx.globalAlpha=1-clamp((t-420)/430);ctx.strokeStyle='#c8ff0070';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(r.left,r.top);ctx.lineTo(r.left+r.width*p,r.top);ctx.moveTo(r.left,r.top);ctx.lineTo(r.left,r.top+r.height*p);ctx.stroke();ctx.fillStyle='#c8ff00';ctx.fillRect(r.left+r.width*p-1.5,r.top-1.5,3,3);ctx.globalAlpha=1}return t<850});if(active||jobs.length)queue();
 }
 function play(){if(typeof window.stopEffects==='function')window.stopEffects();finish();window.scrollTo({top:0,behavior:'instant'});letters.forEach(l=>{l.x=null;l.char='';l.entered=0;l.el.textContent='';l.el.style.visibility='hidden'});cloudStarted=false;soundIndex=0;last=0;root.classList.add('assembling','intro-active','controls-pending');root.classList.remove('cinema-landed');root.style.setProperty('--hero-copy','0');stage.hidden=false;stage.classList.add('active');active=true;start=performance.now();document.dispatchEvent(new CustomEvent('cinema-start',{detail:{cues:soundTimeline}}));layout(0,16);queue();}
 root.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting||root.classList.contains("entry-pending"))return;observer.unobserve(e.target);if(reduced)reveal(e.target);else{jobs.push({el:e.target,start:performance.now()+Math.min(jobs.length,3)*90});queue()}}),{threshold:.1,rootMargin:'0px 0px -25px 0px'});document.querySelectorAll('.reveal').forEach(el=>{el.style.transitionDelay='0ms';observer.observe(el)});
 replay.addEventListener('click',()=>{if(reduced){reduced=false;explicitMotion=true;try{localStorage.setItem('ton-reduced-motion','false')}catch{}applyMotion()}play()});addEventListener('keydown',e=>{if(e.key==='Escape'&&active)finish()});addEventListener('scroll',()=>{if(active&&scrollY>80)finish();if(jobs.length)queue()},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=performance.now();if(active)document.dispatchEvent(new CustomEvent('cinema-audio-pause'));cancelAnimationFrame(raf);raf=0}else{if(paused){const delta=performance.now()-paused;start+=delta;jobs.forEach(j=>j.start+=delta);paused=0}if(active)document.dispatchEvent(new CustomEvent('cinema-audio-resume',{detail:{elapsed:performance.now()-start,cues:soundTimeline}}));if(active||jobs.length)queue()}});
 document.addEventListener('ton-enter',()=>{if(reduced)window.stopAssembly();else play()});
 hideStage();if(!root.classList.contains('entry-pending')){if(reduced)window.stopAssembly();else if(!location.hash||location.hash==='#inicio')play();}

})();
