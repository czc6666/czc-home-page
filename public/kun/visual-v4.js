/* KUN / 04 — procedural point sculptures. No external images, fonts, libraries or tracking. */
'use strict';
(() => {
 const TAU=Math.PI*2, clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453123;return x-Math.floor(x)};
 const names=[['流光','LIGHT IN MOTION'],['星河','A POCKET UNIVERSE'],['沙漏','EVERY GRAIN COUNTS'],['星核','WAITING TO IGNITE'],['光翼','MADE TO BE FREE'],['山海','BEYOND YOUR DESK'],['坤化','KUN / PARTICLE PORTRAIT']];
 /* An original stylized centre-parted bust, drawn only into an offscreen sampling mask.
    It is deliberately an abstract interpretation, not a photograph or a face scan. */
 function portraitMask(){
  const c=document.createElement('canvas');c.width=640;c.height=760;const g=c.getContext('2d',{willReadFrequently:true});
  const path=(d,fill,stroke,width=1)=>{const p=new Path2D(d);if(fill){g.fillStyle=fill;g.fill(p)}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke(p)}};
  const grad=(x,y,x2,y2,stops)=>{const q=g.createLinearGradient(x,y,x2,y2);stops.forEach(s=>q.addColorStop(...s));return q};
  // Shoulder silhouette, shirt and two satin suspenders.
  path('M275 462L267 510C231 528 181 530 145 553C112 579 105 634 99 699Q322 734 542 699C533 632 524 577 489 555C458 534 405 528 374 510L367 462Z',grad(120,530,500,710,[[0,'#a5b4bf'],[.35,'#56626e'],[.58,'#202d38'],[1,'#7d8c98']]));
  path('M257 508Q318 551 384 508L411 540Q393 601 321 608Q248 600 232 540Z','#171f2a');
  path('M258 506L272 458L367 458L382 506Q372 554 320 569Q271 548 258 506Z',grad(265,495,380,525,[[0,'#6f7c88'],[.25,'#c5d0d7'],[.56,'#e9ece8'],[1,'#7a8590']]));
  path('M275 475Q319 517 365 475L370 502Q324 534 270 495Z','#75808a');
  path('M232 534L257 547L234 709L199 705Z',grad(202,550,252,555,[[0,'#b7c3ca'],[.5,'#f8f5e7'],[1,'#a4b4be']]),'#ecf5ed',2);
  path('M397 535L423 545L445 706L411 711Z',grad(400,570,443,568,[[0,'#e3e8e1'],[.5,'#f8f5e7'],[1,'#9babb9']]),'#e7ede8',2);
  path('M204 628L242 634L239 663L201 657Z','#263442','#c8d3da',2);path('M410 635L442 632L445 660L412 665Z','#263442','#c8d3da',2);
  path('M275 577Q319 596 366 578',null,'#adbbc5',2);path('M312 610L314 708',null,'#83939d',1);
  // Ears, tapered face and faceted lighting.
  path('M211 285C184 270 184 323 199 352L215 363M425 286C449 267 453 322 435 354L421 364',grad(190,300,450,350,[[0,'#9faeb9'],[.5,'#dce4e7'],[1,'#7c8e9f']]));
  path('M213 224C217 181 260 160 316 163C378 158 414 187 425 231L422 333C421 379 397 427 371 454Q346 480 320 486Q290 477 265 454C233 423 212 377 211 332Z',grad(205,300,425,350,[[0,'#7f92a4'],[.18,'#d3dde2'],[.42,'#f6f4eb'],[.65,'#c7d2dc'],[1,'#5a7188']]));
  path('M221 321Q227 381 269 401L285 443L321 481Q284 477 260 448Q220 400 216 353Z','#8fa3b5');
  path('M420 302Q400 335 380 361L372 403L344 449L321 481Q356 476 378 446Q416 397 422 342Z','#8193a8');
  path('M239 344Q267 334 292 359Q269 378 244 373Z','#e4e9e6');
  path('M348 351Q379 333 401 341L389 372L361 373Z','#afbfce');
  // Brows and eyes: dark negative space is preserved in the particle sampling.
  path('M234 291Q262 278 290 292L291 300Q263 291 237 301Z','#394553');
  path('M345 292Q374 280 402 293L399 301Q375 292 346 300Z','#344352');
  path('M237 315Q263 302 288 317Q267 330 244 322Z','#dbe5eb');
  path('M347 316Q375 302 399 316Q378 331 352 322Z','#d4e0e7');
  g.fillStyle='#1f2c3b';g.beginPath();g.ellipse(265,316,7,9,0,0,TAU);g.fill();g.beginPath();g.ellipse(373,316,7,9,0,0,TAU);g.fill();
  path('M237 315Q263 301 288 317M347 316Q374 302 399 316',null,'#263444',4);
  path('M243 325Q267 334 285 323M352 325Q373 333 394 323',null,'#8496aa',2);
  g.fillStyle='#f6ffff';g.beginPath();g.arc(263,313,2,0,TAU);g.fill();g.beginPath();g.arc(371,313,2,0,TAU);g.fill();
  // Nose bridge, nostril shadows, philtrum and thin lips.
  path('M312 315L298 377Q299 393 317 396L337 388L330 374L325 316Z',grad(296,350,336,350,[[0,'#72889f'],[.42,'#e2e9e6'],[.63,'#f9f6e7'],[1,'#a3b3c5']]));
  path('M299 387Q305 382 310 389M326 389Q333 382 337 386',null,'#405369',3);
  path('M315 402L313 413M322 402L325 412',null,'#99a7b8',2);
  path('M287 427Q305 415 319 421Q333 415 353 426Q337 443 320 444Q302 442 287 427Z','#aab4bf');
  path('M290 427Q305 426 318 427Q335 425 350 427',null,'#35475d',3);
  path('M303 438Q321 444 339 436',null,'#e9ece9',2);path('M303 460Q320 464 338 457',null,'#e0e6e6',2);
  // Sculptural silver centre part, deliberately larger than the face for legibility.
  const hair=grad(205,125,410,285,[[0,'#7e92a6'],[.27,'#e9edef'],[.46,'#b5c5d2'],[.66,'#e5ebea'],[1,'#627e98']]);
  path('M213 315C203 295 186 283 181 248C169 211 176 172 194 145C209 113 247 91 288 95Q309 95 320 111Q338 87 375 99C423 110 447 146 452 185C466 235 448 277 425 306L419 245C410 204 359 184 320 161C293 187 251 195 228 236Z',hair,'#f0f6ee',1.6);
  path('M317 112Q303 133 316 162Q294 173 273 194Q287 162 290 149Q300 121 317 112Z','#40566e');
  path('M321 111Q335 124 343 149Q349 171 372 189Q345 179 321 163Q325 143 321 111Z','#627c94');
  path('M183 230Q205 243 215 309L225 260Q211 232 197 210Z','#5f7892');
  path('M423 230Q429 257 425 299Q444 282 450 247L445 207Z','#58728d');
  // Engraved individual hair strands, not an opaque pasted headshot.
  for(let i=0;i<24;i++){
   const t=i/23;
   path(`M${312-t*20} ${111+t*25}C${266-t*47} ${93+t*17} ${191-t*11} ${135+t*42} ${211+t*16} ${251+t*40}`,null,i%3===0?'#eff4ee':'#c8d4dc',1.4+(i%3)*.45);
   path(`M${328+t*17} ${113+t*25}C${376+t*40} ${95+t*19} ${442+t*6} ${144+t*31} ${428-t*12} ${247+t*41}`,null,i%3===0?'#edf3ef':'#b9cad9',1.2+(i%3)*.5);
  }
  path('M207 348L205 361',null,'#f7fff3',4);g.fillStyle='#eaf5ef';g.beginPath();g.arc(205,362,3,0,TAU);g.fill();
  return g.getImageData(0,0,640,760).data;
 }
 function geometry(n){
  const a=names.map(()=>new Float32Array(n*4)),seed=new Float32Array(n*3),data=portraitMask(),candidates=[];
  for(let y=90;y<710;y+=2)for(let x=92;x<548;x+=2){const k=(y*640+x)*4,l=(data[k]+data[k+1]+data[k+2])/765;if(data[k+3]>80&&l>.18&&hash(k) < .10+l*.90)candidates.push([x,y,l])}
  // Deterministic shuffle keeps the morph distributed across the full silhouette.
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(hash(i+109)* (i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}
  for(let i=0;i<n;i++){
   const u=hash(i+3),v=hash(i+17),w=hash(i+61),k=i*4;seed.set([u,v,w],i*3);const put=(m,x,y,z,b=.85)=>a[m].set([x,y,z,b],k);
   const layer=i%4,x=(u*2-1)*1.75,t=x*2+layer*.33,width=(v-.5)*(.30+.75*Math.sin(u*Math.PI));
   const y=.47*Math.sin(x*1.45+layer*.22)+Math.cos(t)*width+(layer-1.5)*.075;
   put(0,x*.91-y*.25,x*.25+y*.91,.58*Math.cos(x*1.2)+Math.sin(t)*width,.6+v*.4);
   const r=Math.pow(u,.68)*1.72,arm=i%4,angle=r*3.0+arm*TAU/4+(v-.5)*.66;
   const gx=r*Math.cos(angle),gy=r*Math.sin(angle);put(1,gx*.98-gy*.12,gy*.52+gx*.15,gy*.58+(w-.5)*.14,.65+.35*(1-u));
   const hy=(u*2-1)*1.40,hr=.04+.88*Math.pow(Math.abs(hy)/1.4,1.2),ha=v*TAU;put(2,hr*Math.cos(ha),hy,hr*Math.sin(ha),.6+.4*w);
   const ph=Math.acos(2*v-1),th=u*TAU,nr=1.04+.09*Math.sin(th*8+ph*9)+(w>.975?.45*u:0);put(3,nr*Math.sin(ph)*Math.cos(th),nr*Math.cos(ph),nr*Math.sin(ph)*Math.sin(th),.62+.38*w);
   const wa=u*TAU,wr=(Math.exp(Math.cos(wa))-2*Math.cos(4*wa)+Math.pow(Math.sin(wa/12),5))*.47*Math.pow(v,.55);put(4,Math.sin(wa)*wr,Math.cos(wa)*wr-.12,.32*Math.sin(wa*2)*v,.6+.4*v);
   const lx=(u*2-1)*1.7,lz=(v*2-1)*1.1,lh=.30*Math.sin(lx*2.3+lz*1.8)+.2*Math.cos(lz*4-lx)+.1*Math.sin(lx*5+lz*4);put(5,lx,lh-lz*.4,lz*.85+lh*.25,.6+.4*w);
   const p=candidates[i%candidates.length],px=p[0]+(u-.5)*1.7,py=p[1]+(v-.5)*1.7;
   const fx=(px-320)/220,fy=(380-py)/220;let z=.12;
   if(py>200&&py<485){z=.25+.32*Math.sqrt(Math.max(0,1-Math.pow((px-320)/110,2)));z+=.13*Math.exp(-((px-318)**2/280+(py-360)**2/2100))}else if(py<300)z=.22+.17*Math.cos(fx*2);else z=.14+.06*Math.cos(fx*3);
   put(6,fx,fy,z+(w-.5)*.025,Math.pow(p[2],1.55));
  }
  return {targets:a,seeds:seed};
 }
 const vert=`attribute vec4 aFrom,aTo;attribute vec3 aSeed;uniform vec2 uSize,uCenter,uRotation;uniform float uScale,uDpr,uMix,uTime,uBurst,uMotion,uPortrait,uBrightness;varying float vAlpha,vTone,vSeed;
 void main(){vec4 a=mix(aFrom,aTo,uMix);vec3 p=a.xyz;float f=sin(uMix*3.14159265);p+=(aSeed-.5)*f*.30;p+=normalize(aSeed-.5+vec3(.001))*uBurst*(.9+aSeed.z);p.z+=sin(p.x*2.0+p.y*1.7+uTime*.55)*.023*uMotion*(1.0-uPortrait*.92);float ay=uRotation.x,ax=uRotation.y;float x=p.x*cos(ay)+p.z*sin(ay);float z=-p.x*sin(ay)+p.z*cos(ay);float y=p.y*cos(ax)-z*sin(ax);z=p.y*sin(ax)+z*cos(ax);float per=4.5/(4.5-z*.25);vec2 q=uCenter+vec2(x,-y)*uScale*per;gl_Position=vec4(q.x/uSize.x*2.0-1.0,1.0-q.y/uSize.y*2.0,0.,1.);gl_PointSize=(2.85+pow(aSeed.z,10.)*2.2)*uDpr*per*(.86+uBrightness*.19);vAlpha=a.w*clamp(.78+z*.16,.38,1.)*uBrightness;vTone=clamp(.48+p.y*.23+aSeed.y*.15,0.,1.);vSeed=aSeed.x;}`;
 const frag=`precision mediump float;uniform vec3 uLow,uHigh;varying float vAlpha,vTone,vSeed;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float a=(exp(-r*r*9.0)*.74+(1.0-smoothstep(0.0,.22,r))*.26)*vAlpha;vec3 c=mix(uLow,uHigh,vTone);c=mix(c,vec3(1.,.99,.93),pow(vSeed,10.)*.7);gl_FragColor=vec4(c,a);}`;
 class Sculpture{
  constructor(canvas,fallback,stage){
   this.canvas=canvas;this.fallback=fallback;this.stage=stage;this.n=innerWidth<701?11000:19000;Object.assign(this,geometry(this.n));
   this.from=this.targets[0].slice();this.to=this.targets[0];this.mix=1;this.value=0;this.portrait=0;this.rotation=[0,0];this.pointer=[0,0];this.time=0;this.burstValue=0;this.burstStart=-10;this.quiet=false;this.suspended=false;this.warm=false;this.brightness=1.25;this.last=0;this.raf=0;this.ctx=fallback.getContext('2d');this.backend='canvas';
   try{this.gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,powerPreference:'low-power'});if(this.gl)this.initGL()}catch(e){this.error=String(e);this.gl=null}
   canvas.style.display=this.gl?'block':'none';fallback.style.display=this.gl?'none':'block';this.backend=this.gl?'webgl':'canvas';
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.gl=null;this.backend='canvas';canvas.style.display='none';fallback.style.display='block';this.draw()});
   window.addEventListener('resize',()=>this.resize());document.addEventListener('visibilitychange',()=>this.start());this.resize();this.start();
  }
  initGL(){const gl=this.gl,compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vert));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Shader link failed');gl.useProgram(p);this.program=p;this.uniforms={};['uSize','uCenter','uRotation','uScale','uDpr','uMix','uTime','uBurst','uMotion','uPortrait','uBrightness','uLow','uHigh'].forEach(n=>this.uniforms[n]=gl.getUniformLocation(p,n));this.buffers={};[['aFrom',this.from,4],['aTo',this.to,4],['aSeed',this.seeds,3]].forEach(([n,a,size])=>{const b=gl.createBuffer();this.buffers[n]=b;gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,a,gl.DYNAMIC_DRAW);const l=gl.getAttribLocation(p,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,size,gl.FLOAT,false,0,0)});gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST)}
  resize(){const r=this.stage.getBoundingClientRect();this.W=r.width;this.H=r.height;this.mobile=this.W<=700;this.dpr=Math.min(devicePixelRatio||1,this.mobile?1.5:1.75);for(const c of [this.canvas,this.fallback]){c.width=Math.round(this.W*this.dpr);c.height=Math.round(this.H*this.dpr)}if(this.ctx)this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.draw()}
  setShape(v,animate=true){v=clamp(v,0,6);for(let k=0;k<this.from.length;k++)this.from[k]=this.from[k]+(this.to[k]-this.from[k])*this.mix;const a=Math.floor(v),b=Math.min(a+1,6),f=v-a;this.to=new Float32Array(this.from.length);for(let k=0;k<this.to.length;k++)this.to[k]=this.targets[a][k]+(this.targets[b][k]-this.targets[a][k])*f;this.portrait=clamp(v-5);this.value=v;this.rotation=[0,0];this.mix=animate&&!this.quiet&&!this.suspended?0:1;this.transition=0;if(this.gl){for(const [n,data]of [['aFrom',this.from],['aTo',this.to]]){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffers[n]);this.gl.bufferData(this.gl.ARRAY_BUFFER,data,this.gl.DYNAMIC_DRAW)}}this.draw();this.start()}
  burst(){if(this.quiet){this.burstValue=0;this.draw();return}this.burstStart=this.time;this.start()}
  setQuiet(v){this.quiet=v;if(v){this.mix=1;this.burstValue=0}this.start()}
  setSuspended(v){this.suspended=v;this.start()}
  start(){cancelAnimationFrame(this.raf);this.last=0;this.draw();if(!this.quiet&&!this.suspended&&!document.hidden)this.raf=requestAnimationFrame(t=>this.frame(t))}
  frame(t){if(this.quiet||this.suspended||document.hidden)return;if(!this.last)this.last=t;const dt=(t-this.last)/1000;if(dt>=1/30){this.last=t;this.time+=Math.min(dt,.08);if(this.mix<1){this.transition=Math.min(1,this.transition+Math.min(dt,.08)/1.2);this.mix=this.transition*this.transition*(3-2*this.transition)}const age=this.time-this.burstStart;this.burstValue=age<1.9?Math.sin(clamp(age/1.9)*Math.PI)*1.0:0;this.draw()}this.raf=requestAnimationFrame(s=>this.frame(s))}
  draw(){if(!this.W)return;const center=this.mobile?[this.W*.54,this.H*.533]:[this.W*.707,this.H*.445],scale=this.mobile?Math.min(this.W*.32,this.H*.125):Math.min(this.W*.185,this.H*.235);const portrait=this.portrait,limit=portrait>.7?.42:2.5,rot=[clamp(this.rotation[0],-limit,limit)+(this.quiet?0:Math.sin(this.time*.16)*.09*(1-portrait*.8))+this.pointer[0]*.035,this.rotation[1]+this.pointer[1]*.025];
   const low=this.warm?[.9,.43,.22]:portrait>.5?[.60,.73,.82]:[.30,.76,.90],high=this.warm?[1,.95,.76]:portrait>.5?[1,.97,.84]:[.88,1,.97];
   if(this.gl){const g=this.gl,u=this.uniforms;g.useProgram(this.program);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);g.uniform2f(u.uSize,this.W,this.H);g.uniform2f(u.uCenter,...center);g.uniform2f(u.uRotation,...rot);g.uniform1f(u.uScale,scale);g.uniform1f(u.uDpr,this.dpr);g.uniform1f(u.uMix,this.mix);g.uniform1f(u.uTime,this.time);g.uniform1f(u.uBurst,this.burstValue);g.uniform1f(u.uMotion,this.quiet?0:1);g.uniform1f(u.uPortrait,portrait);g.uniform1f(u.uBrightness,this.brightness);g.uniform3f(u.uLow,...low);g.uniform3f(u.uHigh,...high);g.drawArrays(g.POINTS,0,this.n);return}
   const c=this.ctx;if(!c)return;c.clearRect(0,0,this.W,this.H);c.globalCompositeOperation='lighter';const ca=Math.cos(rot[0]),sa=Math.sin(rot[0]),cb=Math.cos(rot[1]),sb=Math.sin(rot[1]),flow=this.quiet?0:1;
   for(let i=0,k=0;i<this.n;i++,k+=4){const j=i*3,s1=this.seeds[j],s2=this.seeds[j+1],s3=this.seeds[j+2],a=this.from,b=this.to,m=this.mix;let x=a[k]+(b[k]-a[k])*m,y=a[k+1]+(b[k+1]-a[k+1])*m,z=a[k+2]+(b[k+2]-a[k+2])*m;const f=Math.sin(m*Math.PI)*.3+this.burstValue*2;x+=(s1-.5)*f;y+=(s2-.5)*f;z+=(s3-.5)*f;z+=Math.sin(x*2+y*1.7+this.time*.55)*.023*flow*(1-portrait*.92);const xx=x*ca+z*sa,zz=-x*sa+z*ca,yy=y*cb-zz*sb,depth=y*sb+zz*cb,per=4.5/(4.5-depth*.25),sx=center[0]+xx*scale*per,sy=center[1]-yy*scale*per,tone=clamp(.48+y*.23+s2*.15);const intensity=clamp((a[k+3]+(b[k+3]-a[k+3])*m)*(.78+depth*.16)*this.brightness);const rgb=low.map((l,q)=>Math.round((l+(high[q]-l)*tone)*255));const size=(1.95+Math.pow(s3,10)*1.5)*per*(this.mobile?.76:1);
    c.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity*.88})`;c.beginPath();c.arc(sx,sy,size*.59,0,TAU);c.fill();
    if(s3>.985){c.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity*.07})`;c.beginPath();c.arc(sx,sy,size*3,0,TAU);c.fill()}
   }c.globalCompositeOperation='source-over';
  }
 }
 window.KunArt=Object.freeze({Sculpture,names});
})();
