/* KUN / 04.1 — procedural point sculptures. No external images, fonts, libraries or tracking. */
'use strict';
(() => {
 const TAU=Math.PI*2, clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453123;return x-Math.floor(x)};
 const names=[['流光','LIGHT IN MOTION'],['星河','A POCKET UNIVERSE'],['沙漏','EVERY GRAIN COUNTS'],['星核','WAITING TO IGNITE'],['光翼','MADE TO BE FREE'],['山海','BEYOND YOUR DESK']];
 function geometry(n){
  const a=names.map(()=>new Float32Array(n*4)),seed=new Float32Array(n*3);
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

  }
  return {targets:a,seeds:seed};
 }
 const vert=`attribute vec4 aFrom,aTo;attribute vec3 aSeed;uniform vec2 uSize,uCenter,uRotation;uniform float uScale,uDpr,uMix,uTime,uBurst,uMotion,uBrightness;varying float vAlpha,vTone,vSeed;
 void main(){vec4 a=mix(aFrom,aTo,uMix);vec3 p=a.xyz;float f=sin(uMix*3.14159265);p+=(aSeed-.5)*f*.30;p+=normalize(aSeed-.5+vec3(.001))*uBurst*(.9+aSeed.z);p.z+=sin(p.x*2.0+p.y*1.7+uTime*.55)*.023*uMotion;float ay=uRotation.x,ax=uRotation.y;float x=p.x*cos(ay)+p.z*sin(ay);float z=-p.x*sin(ay)+p.z*cos(ay);float y=p.y*cos(ax)-z*sin(ax);z=p.y*sin(ax)+z*cos(ax);float per=4.5/(4.5-z*.25);vec2 q=uCenter+vec2(x,-y)*uScale*per;gl_Position=vec4(q.x/uSize.x*2.0-1.0,1.0-q.y/uSize.y*2.0,0.,1.);gl_PointSize=(2.85+pow(aSeed.z,10.)*2.2)*uDpr*per*(.86+uBrightness*.19);vAlpha=a.w*clamp(.78+z*.16,.38,1.)*uBrightness;vTone=clamp(.48+p.y*.23+aSeed.y*.15,0.,1.);vSeed=aSeed.x;}`;
 const frag=`precision mediump float;uniform vec3 uLow,uHigh;varying float vAlpha,vTone,vSeed;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;float a=(exp(-r*r*9.0)*.74+(1.0-smoothstep(0.0,.22,r))*.26)*vAlpha;vec3 c=mix(uLow,uHigh,vTone);c=mix(c,vec3(1.,.99,.93),pow(vSeed,10.)*.7);gl_FragColor=vec4(c,a);}`;
 class Sculpture{
  constructor(canvas,fallback,stage){
   this.canvas=canvas;this.fallback=fallback;this.stage=stage;this.n=innerWidth<701?11000:19000;Object.assign(this,geometry(this.n));
   this.from=this.targets[0].slice();this.to=this.targets[0];this.mix=1;this.value=0;this.rotation=[0,0];this.pointer=[0,0];this.time=0;this.burstValue=0;this.burstStart=-10;this.quiet=false;this.suspended=false;this.warm=false;this.brightness=1.25;this.last=0;this.raf=0;this.ctx=fallback.getContext('2d');this.backend='canvas';
   try{this.gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,powerPreference:'low-power'});if(this.gl)this.initGL()}catch(e){this.error=String(e);this.gl=null}
   canvas.style.display=this.gl?'block':'none';fallback.style.display=this.gl?'none':'block';this.backend=this.gl?'webgl':'canvas';
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.gl=null;this.backend='canvas';canvas.style.display='none';fallback.style.display='block';this.draw()});
   window.addEventListener('resize',()=>this.resize());document.addEventListener('visibilitychange',()=>this.start());this.resize();this.start();
  }
  initGL(){const gl=this.gl,compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vert));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Shader link failed');gl.useProgram(p);this.program=p;this.uniforms={};['uSize','uCenter','uRotation','uScale','uDpr','uMix','uTime','uBurst','uMotion','uBrightness','uLow','uHigh'].forEach(n=>this.uniforms[n]=gl.getUniformLocation(p,n));this.buffers={};[['aFrom',this.from,4],['aTo',this.to,4],['aSeed',this.seeds,3]].forEach(([n,a,size])=>{const b=gl.createBuffer();this.buffers[n]=b;gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,a,gl.DYNAMIC_DRAW);const l=gl.getAttribLocation(p,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,size,gl.FLOAT,false,0,0)});gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST)}
  resize(){const r=this.stage.getBoundingClientRect();this.W=r.width;this.H=r.height;this.mobile=this.W<=700;this.dpr=Math.min(devicePixelRatio||1,this.mobile?1.5:1.75);for(const c of [this.canvas,this.fallback]){c.width=Math.round(this.W*this.dpr);c.height=Math.round(this.H*this.dpr)}if(this.ctx)this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.draw()}
  setShape(v,animate=true){v=clamp(v,0,5);for(let k=0;k<this.from.length;k++)this.from[k]=this.from[k]+(this.to[k]-this.from[k])*this.mix;const a=Math.floor(v),b=Math.min(a+1,5),f=v-a;this.to=new Float32Array(this.from.length);for(let k=0;k<this.to.length;k++)this.to[k]=this.targets[a][k]+(this.targets[b][k]-this.targets[a][k])*f;this.value=v;this.rotation=[0,0];this.mix=animate&&!this.quiet&&!this.suspended?0:1;this.transition=0;if(this.gl){for(const [n,data]of [['aFrom',this.from],['aTo',this.to]]){this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffers[n]);this.gl.bufferData(this.gl.ARRAY_BUFFER,data,this.gl.DYNAMIC_DRAW)}}this.draw();this.start()}
  burst(){if(this.quiet){this.burstValue=0;this.draw();return}this.burstStart=this.time;this.start()}
  setQuiet(v){this.quiet=v;if(v){this.mix=1;this.burstValue=0}this.start()}
  setSuspended(v){this.suspended=v;this.start()}
  start(){cancelAnimationFrame(this.raf);this.last=0;this.draw();if(!this.quiet&&!this.suspended&&!document.hidden)this.raf=requestAnimationFrame(t=>this.frame(t))}
  frame(t){if(this.quiet||this.suspended||document.hidden)return;if(!this.last)this.last=t;const dt=(t-this.last)/1000;if(dt>=1/30){this.last=t;this.time+=Math.min(dt,.08);if(this.mix<1){this.transition=Math.min(1,this.transition+Math.min(dt,.08)/1.2);this.mix=this.transition*this.transition*(3-2*this.transition)}const age=this.time-this.burstStart;this.burstValue=age<1.9?Math.sin(clamp(age/1.9)*Math.PI)*1.0:0;this.draw()}this.raf=requestAnimationFrame(s=>this.frame(s))}
  draw(){if(!this.W)return;const center=this.mobile?[this.W*.54,this.H*.533]:[this.W*.707,this.H*.445],scale=this.mobile?Math.min(this.W*.32,this.H*.125):Math.min(this.W*.185,this.H*.235);const limit=2.5,rot=[clamp(this.rotation[0],-limit,limit)+(this.quiet?0:Math.sin(this.time*.16)*.09)+this.pointer[0]*.035,this.rotation[1]+this.pointer[1]*.025];
   const low=this.warm?[.9,.43,.22]:[.30,.76,.90],high=this.warm?[1,.95,.76]:[.88,1,.97];
   if(this.gl){const g=this.gl,u=this.uniforms;g.useProgram(this.program);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);g.uniform2f(u.uSize,this.W,this.H);g.uniform2f(u.uCenter,...center);g.uniform2f(u.uRotation,...rot);g.uniform1f(u.uScale,scale);g.uniform1f(u.uDpr,this.dpr);g.uniform1f(u.uMix,this.mix);g.uniform1f(u.uTime,this.time);g.uniform1f(u.uBurst,this.burstValue);g.uniform1f(u.uMotion,this.quiet?0:1);g.uniform1f(u.uBrightness,this.brightness);g.uniform3f(u.uLow,...low);g.uniform3f(u.uHigh,...high);g.drawArrays(g.POINTS,0,this.n);return}
   const c=this.ctx;if(!c)return;c.clearRect(0,0,this.W,this.H);c.globalCompositeOperation='lighter';const ca=Math.cos(rot[0]),sa=Math.sin(rot[0]),cb=Math.cos(rot[1]),sb=Math.sin(rot[1]),flow=this.quiet?0:1;
   for(let i=0,k=0;i<this.n;i++,k+=4){const j=i*3,s1=this.seeds[j],s2=this.seeds[j+1],s3=this.seeds[j+2],a=this.from,b=this.to,m=this.mix;let x=a[k]+(b[k]-a[k])*m,y=a[k+1]+(b[k+1]-a[k+1])*m,z=a[k+2]+(b[k+2]-a[k+2])*m;const f=Math.sin(m*Math.PI)*.3+this.burstValue*2;x+=(s1-.5)*f;y+=(s2-.5)*f;z+=(s3-.5)*f;z+=Math.sin(x*2+y*1.7+this.time*.55)*.023*flow;const xx=x*ca+z*sa,zz=-x*sa+z*ca,yy=y*cb-zz*sb,depth=y*sb+zz*cb,per=4.5/(4.5-depth*.25),sx=center[0]+xx*scale*per,sy=center[1]-yy*scale*per,tone=clamp(.48+y*.23+s2*.15);const intensity=clamp((a[k+3]+(b[k+3]-a[k+3])*m)*(.78+depth*.16)*this.brightness);const rgb=low.map((l,q)=>Math.round((l+(high[q]-l)*tone)*255));const size=(1.95+Math.pow(s3,10)*1.5)*per*(this.mobile?.76:1);
    c.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity*.88})`;c.beginPath();c.arc(sx,sy,size*.59,0,TAU);c.fill();
    if(s3>.985){c.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${intensity*.07})`;c.beginPath();c.arc(sx,sy,size*3,0,TAU);c.fill()}
   }c.globalCompositeOperation='source-over';
  }
 }
 window.KunArt=Object.freeze({Sculpture,names});
})();
