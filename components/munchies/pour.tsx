'use client';
import {useEffect,useRef} from 'react';
import {beat,intro} from '@/lib/motion';

// The Pour: a glossy chocolate sheet with rose cream folded through it. It pours down from the top, the tagline lands
// line by line on its surface, then the sheet lifts off the screen on two-tone drips and wipes the type away with it.
const vertex='attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const fragment=`precision highp float;
uniform vec2 uRes;uniform float uTime,uIn,uLift;uniform vec3 uLines;uniform sampler2D uT0,uT1,uT2;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+7.1;a*=.5;}return v;}
// Drips hanging below the edge: one rounded tongue per column, each with its own length and width.
float tongue(float x,float freq,float seed,out float id){float c=x*freq+seed;id=floor(c);float f=fract(c)-.5-(h(vec2(id,seed))-.5)*.4,w=.12+.26*h(vec2(id,seed+4.)),len=.15+.85*pow(h(vec2(id,seed+9.)),2.2);float q=clamp(f/w,-1.,1.);return len*sqrt(1.-q*q)*step(abs(f),w);}
float drip(float x,out float id){float a,b;float d1=tongue(x,5.,0.,a),d2=tongue(x,9.,3.7,b)*.6;id=d1>d2?a:b+50.;return max(d1,d2);}
float height(vec2 p){vec2 q=p*2.6+vec2(uTime*.03,-uTime*.05);return fbm(q+fbm(q*.6)*1.4);}
void main(){
 float aspect=uRes.x/uRes.y;vec2 p=vec2(vUv.x*aspect,vUv.y);float px=1.5/uRes.y;
 float id;float d=drip(p.x,id);float wob=(fbm(vec2(p.x*2.5,uTime*.2))-.5)*.05;
 float stretch=.16+uLift*.2;float base=1.08-uIn*1.45+uLift*1.8;float edge=base-d*stretch+wob;
 float cover=smoothstep(edge-px,edge+px,p.y);float below=edge-p.y;
 float shade=below>0.?.4*(1.-smoothstep(0.,.05,below))*step(below,.05)*uIn:0.;
 float H=height(p),e=.003;vec3 nrm=normalize(vec3(-(height(p+vec2(e,0.))-H)/e*.11,-(height(p+vec2(0.,e))-H)/e*.11,1.));
 // Rose folds through the chocolate in ribbons; every other drip runs rose so the edge is two-tone.
 float ribbon=sin(p.x*2.4+p.y*4.2+H*9.+uTime*.16);float rose=smoothstep(.55,.68,ribbon);float streak=smoothstep(.9,.98,sin(p.x*5.+p.y*8.+H*14.))*.35*(1.-rose);
 float inDrip=smoothstep(0.,.02,base+wob-p.y);rose=mix(rose,step(.5,h(vec2(id,2.))),inDrip);
 vec3 choc=mix(vec3(.12,.035,.015),vec3(.42,.19,.1),H*H*1.6);vec3 cream=mix(vec3(.8,.42,.45),vec3(1.,.87,.79),H);vec3 col=mix(choc,cream,rose)+vec3(.9,.6,.55)*streak;
 vec3 l=normalize(vec3(-.4,.65,.65));col*=.6+.55*max(dot(nrm,l),0.);
 float spec=pow(max(dot(reflect(-l,nrm),vec3(0,0,1)),0.),70.)*(.9+.5*rose);float sheen=smoothstep(.55,1.,sin(p.x*1.3-p.y*.9+uTime*.35))*.12;col+=spec+sheen*vec3(1.,.85,.75);
 float rim=p.y-edge;col+=vec3(1.,.88,.78)*.45*(1.-smoothstep(0.,.008,rim))*cover;col*=1.-.35*smoothstep(.008,.02,rim)*(1.-smoothstep(.02,.05,rim));
 // Tagline: each line is its own layer that slides up and fades in on its beat. The script layer goes on last so it
 // sits across the capitals, and no line is ever clipped by another.
 vec4 a0=texture2D(uT0,vec2(vUv.x,1.-vUv.y-(1.-uLines.x)*.05));col=mix(col,a0.rgb/max(a0.a,.001)+spec*.3,a0.a*uLines.x);
 vec4 a2=texture2D(uT2,vec2(vUv.x,1.-vUv.y-(1.-uLines.z)*.05));col=mix(col,a2.rgb/max(a2.a,.001)+spec*.3,a2.a*uLines.z);
 vec4 a1=texture2D(uT1,vec2(vUv.x,1.-vUv.y-(1.-uLines.y)*.05));col=mix(col,a1.rgb/max(a1.a,.001)+spec*.2,a1.a*uLines.y);
 gl_FragColor=vec4(col*cover,cover)+vec4(0.,0.,0.,shade*(1.-cover));
}`;

// Three layers: the capitals with the eyebrow, the script, and the last line, so each can land on its own beat.
function drawTagline(w:number,h:number){const size=Math.min(130,Math.max(60,w*.08)),cx=w/2,cy=h/2;
 const layer=(draw:(ctx:CanvasRenderingContext2D)=>void)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')!;ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#230b0899';ctx.shadowOffsetY=size*.04;ctx.shadowBlur=size*.05;draw(ctx);return c};
 const caps=(text:string,y:number)=>(ctx:CanvasRenderingContext2D)=>{ctx.font=`600 ${size}px Fredoka`;ctx.fillStyle='#ffe4c7';ctx.fillText(text,cx,y)};
 return [
  layer(ctx=>{caps('CRAVE IT.',cy-size*.95)(ctx);ctx.shadowColor='transparent';ctx.font=`700 ${Math.max(8,size*.08)}px Nunito`;ctx.fillStyle='#f9d8c4';ctx.fillText('A LITTLE ANTICIPATION. A LOT OF SWEET.',cx,cy-size*1.75)}),
  layer(ctx=>{ctx.translate(cx,cy);ctx.rotate(-8*Math.PI/180);ctx.font=`400 ${size*1.08}px Sacramento`;ctx.shadowBlur=size*.12;ctx.lineWidth=Math.max(2,size*.025);ctx.strokeStyle='#ffe4c7';ctx.strokeText('Munch it.',0,0);ctx.fillStyle='#d6456a';ctx.fillText('Munch it.',0,0)}),
  layer(caps('LOVE IT.',cy+size*.95)),
 ]}

export function Pour({clock,dprCap=1.5,onFailure}:{clock:{current:{t:number}};dprCap?:number;onFailure:()=>void}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current;const gl=canvas?.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false});if(!canvas||!gl){onFailure();return}
  const shader=(type:number,src:string)=>{const s=gl.createShader(type)!;gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s};
  let program:WebGLProgram;try{program=gl.createProgram()!;gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("link")}catch{onFailure();return}
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const u=(name:string)=>gl.getUniformLocation(program,name);const uRes=u('uRes'),uTime=u('uTime'),uIn=u('uIn'),uLift=u('uLift'),uLines=u('uLines');
  const textures=[0,1,2].map(unit=>{const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(4));gl.uniform1i(u(`uT${unit}`),unit);return texture});
  let live=true;
  const resize=()=>{const dpr=Math.min(devicePixelRatio,dprCap),w=canvas.clientWidth,h=canvas.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;gl.viewport(0,0,canvas.width,canvas.height);
   Promise.all([document.fonts.load('600 100px Fredoka'),document.fonts.load('100px Sacramento')]).catch(()=>{}).then(()=>{if(!live)return;drawTagline(canvas.width,canvas.height).forEach((layer,unit)=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,textures[unit]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,layer)})})};
  resize();window.addEventListener('resize',resize);const start=performance.now();let frame=0;
  const tick=()=>{const t=clock.current.t,lift=beat(t,intro.lift,'pour');
   gl.uniform2f(uRes,canvas.width,canvas.height);gl.uniform1f(uTime,(performance.now()-start)/1000);gl.uniform1f(uIn,beat(t,intro.pourIn,'pour'));gl.uniform1f(uLift,lift);
   const line=(n:number)=>beat(t,[intro.type+n*intro.typeStep,intro.type+n*intro.typeStep+intro.typeDur],'snap');gl.uniform3f(uLines,line(0),line(1),line(2));
   gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
   // Once the sheet has lifted clear there is nothing left to draw.
   if(lift<1)frame=requestAnimationFrame(tick)};
  frame=requestAnimationFrame(tick);
  // No loseContext here: the canvas element is reused when React re-runs this effect, and a lost context cannot compile.
  return()=>{live=false;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);textures.forEach(t=>gl.deleteTexture(t));gl.deleteBuffer(buffer);gl.deleteProgram(program)}},[clock,dprCap,onFailure]);
 return <canvas ref={ref} className="pour-canvas" aria-hidden="true"/>
}
