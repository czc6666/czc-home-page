/* Six procedural sculptures. No network assets, dependencies, or telemetry. */
'use strict';
(()=>{
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const names=[['流光','SILK','光，流动成绸。'],['星河','GALAXY','把等待，交给星辰。'],['沙漏','HOURGLASS','每一粒，都向自由坠落。'],['星核','NOVA','安静地积蓄一次出发。'],['光翼','WINGS','自由，有自己的轮廓。'],['山海','LANDSCAPE','工位之外，还有山海。']];
const icons=['<path d="M2 17C9-7 21 32 28 6M2 11C9-13 21 26 28 0M2 23C9-1 21 38 28 12"/>','<path d="M15 12c-8-5 5-10 10-5s-5 16-16 11S4 2 18 3M15 12c5 3-2 6-5 3s3-6 5-3"/>','<path d="M7 2h16M7 22h16M9 2c0 6 12 14 12 20M21 2C21 8 9 16 9 22"/>','<circle cx="15" cy="12" r="7"/><path d="M15 1v4m0 14v4M4 12h4m14 0h4M7 4l3 3m10 10 3 3M7 20l3-3M20 7l3-3"/>','<path d="M15 21C-4 12 3-6 15 12 27-6 34 12 15 21Zm0-9v9M8 3l7 9 7-9"/>','<path d="m1 17 7-9 6 6 7-12 8 15M1 21l9-6 5 3 6-8 8 11"/>'];
function geometry(nx,ny){
 const n=nx*ny,targets=names.map(()=>new Float32Array(n*3)),seeds=new Float32Array(n*3),indices=[];
 for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){
  const i=row*nx+col,k=i*3,u=(col+.35*hash(i+1))/(nx-1),v=(row+.25*hash(i+47))/ny,s1=hash(i+4),s2=hash(i+19),s3=hash(i+53);
  seeds.set([s1,s2,s3],k);const put=(j,x,y,z)=>targets[j].set([x,y,z],k);
  // Open, layered silk ribbons; deliberately not a closed torus.
  const layer=Math.floor(v*3),w=(v*3-layer-.5),x=(u*2-1)*1.9,tw=x*1.7+layer*.48,taper=.38+.62*Math.pow(Math.sin(clamp(u)*Math.PI),.45);
  const sy=.53*Math.sin(x*1.35+layer*.24)+Math.cos(tw)*w*taper+(layer-1)*.12,sz=.48*Math.cos(x*1.3)+Math.sin(tw)*w*taper+(layer-1)*.13;
  put(0,x*.93-sy*.37,x*.37+sy*.93,sz);
  // Four spiral arms, with a bright compact stellar core.
  const arm=Math.floor(v*4),band=v*4-arm,r=.04+Math.pow(clamp(u),.72)*1.85,a=arm*Math.PI/2+r*2.35+(band-.5)*(.6+.18*r);
  const gx=r*Math.cos(a),gy=r*Math.sin(a);put(1,gx*.92-gy*.2,gy*.53+gx*.16,(band-.5)*.16+gy*.72);
  // Two open cones meeting at a waist, not an opaque glass prop.
  const hy=(u*2-1)*1.65,hr=.045+Math.pow(Math.abs(hy)/1.65,1.18)*.94,ha=v*TAU;
  put(2,hr*Math.cos(ha),hy,hr*Math.sin(ha));
  // An irregular stellar shell with fine radial outbursts.
  const phi=Math.acos(1-2*v),theta=u*TAU,nr=1.22+.1*Math.sin(theta*7+phi*9)+.06*Math.sin(theta*13-phi*6)+(s1>.987?.24*s2:0);
  put(3,nr*Math.sin(phi)*Math.cos(theta),nr*Math.cos(phi),nr*Math.sin(phi)*Math.sin(theta));
  // A butterfly-like luminous wing surface, filled rather than outlined.
  const wa=u*TAU,wr=(Math.exp(Math.cos(wa))-2*Math.cos(4*wa)+Math.pow(Math.sin(wa/12),5))*.48*Math.pow(v,.58);
  put(4,Math.sin(wa)*wr,Math.cos(wa)*wr-.1,.4*Math.sin(wa*2)*Math.pow(v,.7)+.06*(s1-.5));
  // An oblique field of ridges with depth, like illuminated terrain.
  const lx=(u*2-1)*1.85,lz=(v*2-1)*1.25,lh=.34*Math.sin(lx*2.3+lz*1.8)+.22*Math.cos(lz*3.8-lx)+.1*Math.sin(lx*5+lz*4);
  put(5,lx,lh*.8-lz*.48,lz*.85+lh*.3);
  if(row%2===0&&col<nx-1)indices.push(i,i+1);
 }
 // Keep every silhouette inside the same art volume; tall modes never cover controls.
 for(const a of targets){let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;for(let k=0;k<a.length;k+=3){minX=Math.min(minX,a[k]);maxX=Math.max(maxX,a[k]);minY=Math.min(minY,a[k+1]);maxY=Math.max(maxY,a[k+1])}const cx=(minX+maxX)/2,cy=(minY+maxY)/2,scale=Math.min(1,2.48/(maxY-minY),3.6/(maxX-minX));for(let k=0;k<a.length;k+=3){a[k]=(a[k]-cx)*scale;a[k+1]=(a[k+1]-cy)*scale;a[k+2]*=scale}}
 return{targets,seeds,indices:new Uint16Array(indices),count:n,nx,ny};
}
const vertex=`
attribute vec3 aFrom;attribute vec3 aTo;attribute vec3 aSeed;
uniform float uMix,uTime,uScatter,uScale,uDpr,uFlow;uniform vec2 uSize,uCenter,uRotation;
varying float vShade,vTone,vSeed;
void main(){
 vec3 p=mix(aFrom,aTo,uMix);float t=uTime*.43;
 p+=vec3(sin(t+p.y*2.2),sin(t*.8+p.x*2.0),cos(t+p.y*1.7+p.x))*.025*uFlow;
 vec3 ray=normalize(aSeed*2.0-1.0+vec3(.001));p+=ray*uScatter*(1.7+aSeed.z*1.2);
 float ay=uRotation.x,ax=uRotation.y;float x=p.x*cos(ay)+p.z*sin(ay);float z=-p.x*sin(ay)+p.z*cos(ay);float y=p.y*cos(ax)-z*sin(ax);z=p.y*sin(ax)+z*cos(ax);
 float perspective=4.5/(4.5-z*.36);vec2 px=uCenter+vec2(x,-y)*uScale*perspective;
 gl_Position=vec4(px.x/uSize.x*2.0-1.0,1.0-px.y/uSize.y*2.0,0.0,1.0);
 float sparkle=pow(aSeed.y,14.0);gl_PointSize=(1.05+sparkle*3.3)*uDpr*perspective;
 vShade=clamp(.56+z*.15,.2,1.0);vTone=clamp(.45+p.y*.19+p.x*.12,0.0,1.0);vSeed=aSeed.x;
}`;
const fragment=`
precision mediump float;uniform vec3 uLow,uHigh;uniform float uLines,uLineWeight;varying float vShade,vTone,vSeed;
void main(){
 vec3 c=mix(uLow,uHigh,vTone);float alpha;
 if(uLines>.5){alpha=uLineWeight*vShade;}else{float r=length(gl_PointCoord-.5);if(r>.5)discard;alpha=exp(-r*r*17.0)*(.34+.4*vSeed)*vShade;c=mix(c,vec3(.94,.98,1.0),pow(vSeed,8.0)*.6);}
 gl_FragColor=vec4(c,alpha);
}`;
class Sculpture{
 constructor(canvas,fallback){
  this.canvas=canvas;this.fallback=fallback;this.mobile=innerWidth<=700;
  Object.assign(this,geometry(this.mobile?128:192,this.mobile?65:90));
  this.from=this.targets[0].slice();this.to=this.targets[0];this.mix=1;this.value=0;this.clock=0;this.transition=1;this.scatter=0;this.scatterGoal=0;this.rotation=[-.14,.08];this.pointer=[0,0];this.cold=true;this.quiet=false;this.suspended=false;this.frameId=0;this.last=0;this.mode='canvas';this.ctx=fallback.getContext('2d');
  try{this.gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',premultipliedAlpha:false});if(this.gl)this.initGL()}catch(e){this.gl=null}
  this.setBackend(!!this.gl);this.resize();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.setBackend(false);this.draw()});
  canvas.addEventListener('webglcontextrestored',()=>{try{this.initGL();this.setBackend(true);this.resize()}catch(e){this.setBackend(false)}});
 }
 initGL(){const g=this.gl,compile=(type,source)=>{const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS)){const log=g.getShaderInfoLog(s);g.deleteShader(s);throw Error(log)}return s};
  const vs=compile(g.VERTEX_SHADER,vertex),fs=compile(g.FRAGMENT_SHADER,fragment),p=g.createProgram();g.attachShader(p,vs);g.attachShader(p,fs);g.linkProgram(p);g.deleteShader(vs);g.deleteShader(fs);if(!g.getProgramParameter(p,g.LINK_STATUS))throw Error('Shader link failed');this.program=p;g.useProgram(p);this.locations={};['uMix','uTime','uScatter','uScale','uDpr','uFlow','uSize','uCenter','uRotation','uLow','uHigh','uLines','uLineWeight'].forEach(n=>this.locations[n]=g.getUniformLocation(p,n));
  this.buffers={};[['aFrom',this.from],['aTo',this.to],['aSeed',this.seeds]].forEach(([name,data])=>{const b=g.createBuffer();this.buffers[name]=b;g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,data,g.DYNAMIC_DRAW);const a=g.getAttribLocation(p,name);g.enableVertexAttribArray(a);g.vertexAttribPointer(a,3,g.FLOAT,false,0,0)});
  this.indexBuffer=g.createBuffer();g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,this.indexBuffer);g.bufferData(g.ELEMENT_ARRAY_BUFFER,this.indices,g.STATIC_DRAW);g.enable(g.BLEND);g.blendFuncSeparate(g.SRC_ALPHA,g.ONE,g.ONE,g.ONE_MINUS_SRC_ALPHA);g.disable(g.DEPTH_TEST);g.clearColor(0,0,0,0);
 }
 setBackend(useGL){this.mode=useGL?'webgl':'canvas';this.canvas.hidden=!useGL;this.fallback.hidden=useGL}
 resize(){const r=this.canvas.parentElement.getBoundingClientRect();this.w=r.width;this.h=r.height;this.mobile=this.w<=700;this.dpr=Math.min(devicePixelRatio||1,this.mobile?1.6:1.8);[this.canvas,this.fallback].forEach(c=>{c.width=Math.round(this.w*this.dpr);c.height=Math.round(this.h*this.dpr)});if(this.gl&&this.mode==='webgl')this.gl.viewport(0,0,this.canvas.width,this.canvas.height);if(this.ctx)this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.draw()}
 targetAt(value){const n=clamp(value,0,5),a=Math.floor(n),b=Math.min(5,a+1),f=n-a;if(f<.0001)return this.targets[a];const result=new Float32Array(this.count*3);for(let i=0;i<result.length;i++)result[i]=this.targets[a][i]*(1-f)+this.targets[b][i]*f;return result}
 setShape(value,animate=true){const dest=this.targetAt(value),src=new Float32Array(this.count*3);for(let i=0;i<src.length;i++)src[i]=this.from[i]*(1-this.mix)+this.to[i]*this.mix;this.from=src;this.to=dest;this.value=clamp(value,0,5);this.transition=animate&&!this.quiet?0:1;this.mix=this.transition;
  if(this.gl&&this.mode==='webgl'){const g=this.gl;[['aFrom',src],['aTo',dest]].forEach(([name,data])=>{g.bindBuffer(g.ARRAY_BUFFER,this.buffers[name]);g.bufferData(g.ARRAY_BUFFER,data,g.DYNAMIC_DRAW)})}this.draw();this.start()
 }
 burst(){clearTimeout(this.burstTimer);this.scatterGoal=1;if(this.quiet){this.scatter=.8;this.draw()}this.burstTimer=setTimeout(()=>{this.scatterGoal=0;if(this.quiet){this.scatter=0;this.draw()}this.start()},850);this.start()}
 setQuiet(value){this.quiet=value;if(value){this.mix=1;this.transition=1;this.scatter=this.scatterGoal}this.start()}
 setSuspended(value){this.suspended=value;this.start()}
 start(){cancelAnimationFrame(this.frameId);this.frameId=0;this.last=0;this.draw();if(!this.quiet&&!this.suspended&&!document.hidden)this.frameId=requestAnimationFrame(t=>this.frame(t))}
 frame(t){this.frameId=0;if(this.quiet||this.suspended||document.hidden)return;if(!this.last)this.last=t;const dt=(t-this.last)/1000;if(dt>=1/30){this.last=t;const d=Math.min(dt,.08);this.clock+=d;this.transition=clamp(this.transition+d/.95);this.mix=this.transition*this.transition*(3-2*this.transition);this.scatter+=(this.scatterGoal-this.scatter)*Math.min(1,d*6);this.draw()}this.frameId=requestAnimationFrame(t=>this.frame(t))}
 layout(){const mobile=this.w<=700;return {center:[this.w*(mobile?.55:.72),mobile?this.h*.325:this.h*.409],scale:mobile?this.w*.235:Math.min(this.w*.14,this.h*.24),rot:[this.rotation[0]+this.pointer[0]*.1+(this.quiet?0:Math.sin(this.clock*.11)*.08),this.rotation[1]+this.pointer[1]*.08]}}
 draw(){if(!this.w)return;const l=this.layout();if(this.mode==='webgl'){const g=this.gl,u=this.locations;g.useProgram(this.program);g.clear(g.COLOR_BUFFER_BIT);g.uniform1f(u.uMix,this.mix);g.uniform1f(u.uTime,this.clock);g.uniform1f(u.uScatter,this.scatter);g.uniform1f(u.uScale,l.scale);g.uniform1f(u.uDpr,this.dpr);g.uniform1f(u.uFlow,this.quiet?0:1);g.uniform2f(u.uSize,this.w,this.h);g.uniform2fv(u.uCenter,l.center);g.uniform2fv(u.uRotation,l.rot);g.uniform3fv(u.uLow,this.cold?[.29,.43,.79]:[.78,.28,.18]);g.uniform3fv(u.uHigh,this.cold?[.77,.96,.97]:[1,.83,.56]);g.uniform1f(u.uLineWeight,[.52,.14,.24,.12,.23,.36][Math.round(this.value)]*(1-clamp(this.scatter)));g.uniform1f(u.uLines,1);g.drawElements(g.LINES,this.indices.length,g.UNSIGNED_SHORT,0);g.uniform1f(u.uLines,0);g.drawArrays(g.POINTS,0,this.count)}else this.drawFallback(l)}
 drawFallback(l){
  const c=this.ctx;if(!c)return;c.clearRect(0,0,this.w,this.h);
  const ca=Math.cos(l.rot[0]),sa=Math.sin(l.rot[0]),cb=Math.cos(l.rot[1]),sb=Math.sin(l.rot[1]),t=this.clock*.43,flow=this.quiet?0:1;
  const xy=this.projected||(this.projected=new Float32Array(this.count*5));
  for(let i=0;i<this.count;i++){
   const k=i*3,j=i*5,s=this.seeds;let x=this.from[k]*(1-this.mix)+this.to[k]*this.mix,y=this.from[k+1]*(1-this.mix)+this.to[k+1]*this.mix,z=this.from[k+2]*(1-this.mix)+this.to[k+2]*this.mix;
   const waveX=Math.sin(t+y*2.2)*.025*flow,waveY=Math.sin(t*.8+x*2)*.025*flow,waveZ=Math.cos(t+y*1.7+x)*.025*flow;
   x+=waveX+(s[k]*2-1)*this.scatter*2;y+=waveY+(s[k+1]*2-1)*this.scatter*2;z+=waveZ+(s[k+2]*2-1)*this.scatter*2;
   const xx=x*ca+z*sa,zz=-x*sa+z*ca,yy=y*cb-zz*sb,depth=y*sb+zz*cb,pr=4.5/(4.5-depth*.36);
   xy[j]=l.center[0]+xx*l.scale*pr;xy[j+1]=l.center[1]-yy*l.scale*pr;xy[j+2]=clamp(.56+depth*.18,.18,1);xy[j+3]=clamp(.45+y*.19+x*.12);xy[j+4]=pr;
  }
  // Broad reflected light, then a fine illuminated surface and scattered stars.
  const light=c.createRadialGradient(l.center[0],l.center[1],0,l.center[0],l.center[1],l.scale*1.9);
  light.addColorStop(0,this.cold?'#8cb3ff0b':'#ffbf830b');light.addColorStop(.55,this.cold?'#7886ff04':'#e86c3004');light.addColorStop(1,'#00000000');c.fillStyle=light;c.fillRect(0,0,this.w,this.h);
  c.globalCompositeOperation='lighter';
  const color=(tone,alpha)=>this.cold?`rgba(${95+tone*125},${150+tone*95},${240+tone*15},${alpha})`:`rgba(255,${115+tone*115},${70+tone*130},${alpha})`;
  // For structured modes, filaments read as soft fabric, not a wireframe grid.
  const mode=Math.round(this.value),lineWeight=[.54,.14,.24,.12,.23,.36][mode]*(1-clamp(this.scatter));
  if(lineWeight>.015){
   for(let row=0;row<this.ny;row+=2){const begin=row*this.nx*5,end=(row*this.nx+this.nx-1)*5;const gradient=c.createLinearGradient(xy[begin],xy[begin+1],xy[end],xy[end+1]);gradient.addColorStop(0,color(.2,lineWeight*.38));gradient.addColorStop(.45,color(.65,lineWeight));gradient.addColorStop(.8,color(.98,lineWeight*.9));gradient.addColorStop(1,color(.7,lineWeight*.25));c.strokeStyle=gradient;c.lineWidth=this.mobile?.6:.7;c.beginPath();for(let col=0;col<this.nx;col++){const j=(row*this.nx+col)*5;if(col===0)c.moveTo(xy[j],xy[j+1]);else c.lineTo(xy[j],xy[j+1])}c.stroke()}
  }
  // Brightness buckets reduce state changes; subtle halos mark a few stars.
  for(let bucket=0;bucket<12;bucket++){c.fillStyle=color(bucket/11,.62);c.beginPath();for(let i=0;i<this.count;i+=2){const j=i*5;if(Math.min(11,Math.floor(xy[j+3]*12))!==bucket)continue;const r=(.42+Math.pow(this.seeds[i*3+1],12)*.85)*xy[j+4];c.moveTo(xy[j]+r,xy[j+1]);c.arc(xy[j],xy[j+1],r,0,TAU)}c.fill()}
  if(!this.starSprite){const sprite=document.createElement('canvas');sprite.width=sprite.height=32;const sc=sprite.getContext('2d'),sg=sc.createRadialGradient(16,16,0,16,16,16);sg.addColorStop(0,'#f0faffd0');sg.addColorStop(.14,'#d3ecffa0');sg.addColorStop(.36,'#a6ceff30');sg.addColorStop(1,'#86b9ff00');sc.fillStyle=sg;sc.fillRect(0,0,32,32);this.starSprite=sprite}
  for(let i=0;i<this.count;i+=2){if(this.seeds[i*3+1]<.985)continue;const j=i*5,r=(this.mobile?4:5)*xy[j+4];c.globalAlpha=xy[j+2]*.65;c.drawImage(this.starSprite,xy[j]-r,xy[j+1]-r,r*2,r*2)}c.globalAlpha=1;c.globalCompositeOperation='source-over';
 }
 diagnostics(){return{backend:this.mode,particles:this.count,shape:this.value,blend:this.mix,scatter:this.scatter,quiet:this.quiet,rotation:[...this.rotation]}}
}
window.KunSculpture={Sculpture,names,icons};
})();
