'use client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Environment,Lightformer,ContactShadows,RoundedBox} from '@react-three/drei';
import {useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import type {Dessert} from '@/lib/munchies/data';
import {beat,intro as beats} from '@/lib/motion';
import {dprCap,type Tier} from '@/lib/device-tier';

type Live=number|{current:number};
// The home shelf passes its whole list plus a continuous position; other pages pass a single dessert.
export type ShelfInput={desserts:Dessert[];position:{current:{value:number}};axis:'x'|'y'};
export type StageProps={dessert:Dessert;neighbours?:Dessert[];shelf?:ShelfInput;intro?:boolean;clock?:{current:{t:number}};tier?:Tier;opened?:boolean;progress?:Live;onReady?:()=>void;onFailure?:()=>void;detail?:boolean};
// Per-frame values are read from refs so animating them never re-renders the model tree.
const read=(v:Live)=>typeof v==='number'?v:v.current;
function useMaterials(d:Dessert){
 const [label,setLabel]=useState<THREE.CanvasTexture|null>(null);
 const bump=useMemo(()=>{const n=128,data=new Uint8Array(n*n*4);for(let i=0;i<n*n;i++){const v=125+Math.sin(i*12.9898)*23;data[i*4]=data[i*4+1]=data[i*4+2]=v;data[i*4+3]=255}const t=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);t.needsUpdate=true;return t},[]);
 useEffect(()=>{let live=true;let texture:THREE.CanvasTexture;const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d')!;ctx.fillStyle='#fdf7eb';ctx.fillRect(0,0,1024,512);ctx.fillStyle=d.colour;ctx.fillRect(0,0,1024,21);ctx.fillRect(0,491,1024,21);ctx.fillStyle='#a60f35';ctx.fillRect(0,29,1024,3);ctx.fillRect(0,480,1024,3);ctx.drawImage(img,167,9,770,758,337,38,350,345);ctx.fillStyle='#3a1308';ctx.textAlign='center';ctx.font='600 30px Fredoka, sans-serif';ctx.fillText(d.name,512,423,900);ctx.font='12px Nunito, sans-serif';ctx.letterSpacing='3px';ctx.fillText('FOR THE SWEETEST MOMENTS',512,455);texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;if(live)setLabel(texture)};img.src='/brand/logo-source.png';return()=>{live=false;texture?.dispose()}},[d.slug,d.colour,d.name]);
 useEffect(()=>()=>bump.dispose(),[bump]);return {label,bump};
}
function Ring({radius,y,colour='#fff8e9',tube=.025,metalness=0}:{radius:number;y:number;colour?:string;tube?:number;metalness?:number}){return <mesh position={[0,y,0]} rotation={[Math.PI/2,0,0]} castShadow><torusGeometry args={[radius,tube,12,80]}/><meshPhysicalMaterial color={colour} metalness={metalness} roughness={metalness?.2:.32} clearcoat={1}/></mesh>}
export function Ingredient({kind=0}:{kind?:number}){return kind===0?<mesh rotation={[.3,0,.4]} castShadow scale={[.07,.018,.12]}><sphereGeometry args={[1,12,8]}/><meshPhysicalMaterial color="#ad1649" roughness={.38} clearcoat={.3}/></mesh>:kind===1?<group><mesh castShadow scale={[.065,.035,.13]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#9caa3d" roughness={.65}/></mesh><mesh position={[.012,.031,0]} scale={[.015,.01,.115]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#cbd18a"/></mesh></group>:<mesh castShadow rotation={[.15,0,.1]}><coneGeometry args={[.07,.13,12]}/><meshPhysicalMaterial color="#361509" roughness={.31} clearcoat={.6}/></mesh>}
function Toppings({d,radius,y}:{d:Dessert;radius:number;y:number}){const chocolate=/brown|cookie|bueno/.test(d.slug),mango=d.slug==='mango-cups';return <group>{Array.from({length:42},(_,i)=>{const a=i*2.39996,r=Math.sqrt((i+.5)/43)*radius*.84;return <group key={i} position={[Math.cos(a)*r,y+Math.sin(i)*.012,Math.sin(a)*r]} rotation={[0,a,0]} scale={i%4===0?1.25:.7}><Ingredient kind={chocolate?2:mango?1:i%4===0?0:1}/></group>})}</group>}
function Cream({d,y,radius,bump}:{d:Dessert;y:number;radius:number;bump:THREE.Texture}){const dark=/cookies-and|bueno/.test(d.slug);return <group><mesh position={[0,y,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[radius,80]}/><meshPhysicalMaterial color={dark?'#9c7458':d.slug==='mango-cups'?'#f5b529':'#f7e7bf'} roughness={.36} clearcoat={.26} bumpMap={bump} bumpScale={.032}/></mesh><Toppings d={d} y={y+.035} radius={radius}/></group>}
function DessertModel({d,open=0,rotation=0}:{d:Dessert;open?:Live;rotation?:number}){
 const {label,bump}=useMaterials(d);const pot=d.format==='pot',box=d.format==='box',can=d.format==='can'||d.format==='tin';
 const lid=useRef<THREE.Group>(null);
 useFrame(()=>{const g=lid.current;if(!g)return;const o=read(open);if(box){g.rotation.set(-o*1.65,0,0)}else if(pot){g.position.set(0,.57+o*.95,-o*.15);g.rotation.set(-o*.3,0,o*.1)}else{g.position.set(0,1+o*.95,-o*.22);g.rotation.set(-o*.2,0,o*.15)}});
 const bowl=useMemo(()=>new THREE.LatheGeometry([[.66,-.72],[.75,-.7],[.88,-.62],[1.02,-.39],[1.12,0],[1.17,.4],[1.2,.48],[1.2,.54],[1.14,.56],[1.1,.49],[1.08,.39],[.99,-.32],[.81,-.53],[.66,-.55]].map(([x,y])=>new THREE.Vector2(x,y)),96),[]);
 useEffect(()=>()=>bowl.dispose(),[bowl]);
 const glass=<meshPhysicalMaterial color="#f5f8f8" transparent opacity={.3} metalness={.05} roughness={.08} clearcoat={1} clearcoatRoughness={.06} transmission={.3} thickness={.04} ior={1.46} envMapIntensity={1.8} side={THREE.DoubleSide}/>;
 return <group rotation={[0,rotation,0]}>{box?<group>
 <RoundedBox args={[2.55,.13,1.85]} radius={.035} position={[0,-.55,0]} receiveShadow><meshStandardMaterial color="#f4dfc1" roughness={.88} bumpMap={bump} bumpScale={.009}/></RoundedBox>
 {[-1,1].map(side=><group key={side}><RoundedBox args={[.055,.63,1.85]} radius={.018} position={[side*1.25,-.22,0]} castShadow><meshStandardMaterial color={d.colour} roughness={.77} bumpMap={bump} bumpScale={.01}/></RoundedBox><RoundedBox args={[2.55,.63,.055]} radius={.018} position={[0,-.22,side*.9]} castShadow><meshStandardMaterial color={side===1?'#f9ecd8':d.colour} roughness={.8}/></RoundedBox></group>)}
 {Array.from({length:6},(_,i)=><RoundedBox key={i} args={[.69,.39,.69]} radius={.08} smoothness={3} position={[(i%3-1)*.77,-.29,Math.floor(i/3)*.78-.39]} rotation={[0,Math.sin(i)*.045,0]} castShadow><meshPhysicalMaterial color={/cake|leches/.test(d.slug)?'#e7c394':'#3b190c'} roughness={.53} bumpMap={bump} bumpScale={.09} clearcoat={.17}/></RoundedBox>)}
 <group ref={lid} position={[0,.1,-.94]}><RoundedBox args={[2.58,.065,1.91]} radius={.025} position={[0,.02,.94]} castShadow><meshStandardMaterial color="#fdf3e3" roughness={.7} bumpMap={bump} bumpScale={.012}/></RoundedBox>{label&&<mesh position={[0,.057,.94]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[2.2,1.1]}/><meshStandardMaterial map={label} roughness={.7}/></mesh>}<RoundedBox args={[2.58,.17,.04]} radius={.012} position={[0,-.065,1.88]}><meshStandardMaterial color={d.colour}/></RoundedBox></group>
 {label&&<mesh position={[0,-.2,.932]}><planeGeometry args={[1.5,.43]}/><meshStandardMaterial map={label} roughness={.7}/></mesh>}
 </group>:pot?<group>
 <mesh geometry={bowl} castShadow receiveShadow><meshPhysicalMaterial color="#b96131" roughness={.51} clearcoat={.16} bumpMap={bump} bumpScale={.035}/></mesh>
 {[-.57,-.49,-.41,-.33].map((y,i)=><Ring key={y} y={y} radius={.91+i*.03} colour="#ae572b" tube={.008}/>)}<Ring y={.51} radius={1.17} colour="#b66a3c" tube={.045}/><Cream d={d} y={.43} radius={1.09} bump={bump}/>
 {label&&<mesh position={[0,-.02,0]}><cylinderGeometry args={[1.166,1.04,.55,80,1,true,-1.1,2.2]}/><meshStandardMaterial map={label} roughness={.78} bumpMap={bump} bumpScale={.006} side={THREE.DoubleSide}/></mesh>}
 <group ref={lid}><mesh><cylinderGeometry args={[1.205,1.205,.045,80,1,true]}/>{glass}</mesh><mesh position={[0,.018,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[1.2,80]}/>{glass}</mesh><Ring radius={1.19} y={.015} colour="#eee7da" tube={.014}/><Ring radius={1.09} y={.03} colour="#f4efe5" tube={.008}/></group>
 </group>:<group>
 {can?<mesh castShadow><cylinderGeometry args={[.82,.82,1.9,80]}/><meshPhysicalMaterial color={d.colour} roughness={.26} metalness={.65} clearcoat={.3}/></mesh>:<><mesh castShadow><cylinderGeometry args={[.85,.65,1.95,80,1,true]}/>{glass}</mesh>{[0,1,2,3,4].map((n)=><mesh key={n} position={[0,-.75+n*.35,0]} castShadow><cylinderGeometry args={[.68+n*.035,.66+n*.035,.35,80]}/><meshPhysicalMaterial color={n%2===0?(/cookie/.test(d.slug)?'#38271e':d.slug==='mango-cups'?'#f3b424':'#ba8249'):'#f9ebcf'} roughness={n%2?.4:.82} bumpMap={bump} bumpScale={n%2?.012:.065}/></mesh>)}</>}
 <Cream d={d} y={.94} radius={.79} bump={bump}/><Ring y={.97} radius={.86} colour={can?'#b8aaa0':'#f3ece1'} tube={.026} metalness={can?.8:.1}/><Ring y={-.97} radius={can?.82:.66} colour="#e1d8c5" tube={.022} metalness={can?.7:.1}/>
 {label&&<mesh position={[0,-.15,0]}><cylinderGeometry args={[can?.825:.792,can?.825:.73,.64,80,1,true,-1.05,2.1]}/><meshStandardMaterial map={label} roughness={.72} side={THREE.DoubleSide}/></mesh>}
 <group ref={lid}>{can?<><mesh><cylinderGeometry args={[.85,.85,.055,80]}/><meshPhysicalMaterial color="#d9d4c8" metalness={.85} roughness={.22}/></mesh><mesh position={[.12,.04,0]} rotation={[Math.PI/2,0,0]} scale={[1,.6,1]}><torusGeometry args={[.15,.035,8,30]}/><meshStandardMaterial metalness={.8} color="#c9c6ba" roughness={.2}/></mesh></>:<mesh><sphereGeometry args={[.86,64,32,0,Math.PI*2,0,Math.PI/2]}/>{glass}</mesh>}<Ring y={0} radius={.86} colour="#f6efe5" tube={.02}/></group>
 </group>}</group>
}
function Studio(){return <><ambientLight intensity={.45}/><directionalLight position={[-5,6,5]} intensity={2.5} color="#fff1db"/><spotLight position={[3,5,-3]} intensity={45} angle={.6} penumbra={1} color="#ffb6a6"/><Environment resolution={128}><Lightformer intensity={3} position={[-4,3,4]} rotation={[0,Math.PI/4,0]} scale={[5,7,1]}/><Lightformer intensity={2} position={[4,1,3]} rotation={[0,-Math.PI/4,0]} scale={[1,7,1]}/><Lightformer intensity={1.5} position={[0,5,-2]} rotation={[Math.PI/2,0,0]} scale={[5,4,1]}/></Environment></>}
const fragment=`uniform float time;uniform float fade;uniform vec3 colour;varying vec2 vUv;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){vec2 p=vUv*3.;float a=noise(p+time*.07);float b=noise(p*2.+a*2.-time*.06);float light=pow(max(0.,1.-distance(vUv,vec2(.35,.65))),2.);vec3 c=mix(colour*.64,colour*1.22,light);c=mix(c,vec3(1.,.83,.69),smoothstep(.61,.9,b)*.23);c+=pow(abs(sin((vUv.x+vUv.y)*5.+a*4.+time*.12)),15.)*.04;gl_FragColor=vec4(c,fade);}`;
// Screen-space quad at the far plane: always fills the canvas whatever the aspect or camera.
// Being transparent it draws after the models, so it relies on the depth test to stay behind them.
const quadVertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.999,1.);}';
// Opaque only during the intro; afterwards it fades out so the CSS world colour and HTML title show through.
function Gradient({colour,show}:{colour:string;show:{current:number}}){const mesh=useRef<THREE.Mesh>(null),m=useRef<THREE.ShaderMaterial>(null);const uniforms=useMemo(()=>({time:{value:0},fade:{value:show.current},colour:{value:new THREE.Color(colour)}}),[]);useFrame(({clock},dt)=>{if(!m.current||!mesh.current)return;const u=m.current.uniforms;u.time.value=clock.elapsedTime;u.colour.value.lerp(new THREE.Color(colour),Math.min(dt*2,1));u.fade.value=THREE.MathUtils.damp(u.fade.value,show.current,5,dt);mesh.current.visible=u.fade.value>.002});return <mesh ref={mesh} frustumCulled={false} renderOrder={-1}><planeGeometry args={[2,2]}/><shaderMaterial ref={m} uniforms={uniforms} fragmentShader={fragment} vertexShader={quadVertex} transparent depthWrite={false}/></mesh>}
type Frame={t:number;pos:number;vel:number;lean:number;leanVel:number};
const mod=(a:number,n:number)=>((a%n)+n)%n;
// One package on the shelf. Its offset from the shelf position places it on the arc; the shared frame adds lean and the intro.
function Slot({d,i,axis,frame,intro,opened,progress,detail}:{d:Dessert;i:number;axis:'x'|'y';frame:{current:Frame};intro:boolean;opened:boolean;progress:Live;detail?:boolean}){
 const node=useRef<THREE.Group>(null),lid=useRef(0);
 useFrame(({clock},dt)=>{const g=node.current;if(!g)return;const {t,pos,lean}=frame.current,o=i-pos,a=Math.abs(o),near=1-Math.min(a,1),e=clock.elapsedTime,p=read(progress);
  const reveal=beat(t,beats.catch,'snap'),burst=beat(t,beats.burst,'pour'),pop=beat(t,beats.burst,'drop');let x,y,z,rx,ry,rz;
  if(axis==='x'){const ang=o*.55;x=Math.sin(ang)*5.3;y=-.05-.2*Math.min(a,1);z=(Math.cos(ang)-1)*4.6;rx=.05+near*(.03+p*.15);ry=-o*.35;rz=-Math.sign(o)*Math.min(a,1)*.12+lean}
  else{x=0;y=-.05-o*3.8;z=-Math.min(a,2)*2.2;rx=.08+p*.15*near-lean*.8;ry=0;rz=0}
  let s=(1-Math.min(a,2)*(axis==='x'?.32:.42))*(detail?1.15:1);
  // Idle sway, strongest on the centre package.
  y+=Math.sin(e*.7+i)*.025;ry+=Math.sin(e*.45+i)*.06*near;rz+=Math.sin(e*.5+i)*.03*(1-near);
  if(intro){if(i===0){y+=(1-reveal)*2.5;ry+=(1-reveal)*Math.PI*2;rz+=(1-reveal)*.35;s*=.12+.88*pop;g.visible=t>beats.burst[0]}
   else if(a<1.5){x*=.07+.93*burst;y=(1-reveal)*2.1;g.visible=t>beats.burst[0]+.2}else g.visible=false}
  else g.visible=a<2.6;
  g.position.set(x,y,z);g.rotation.set(rx,ry,rz);g.scale.setScalar(s);
  const open=intro?beat(t,beats.open,'snap'):.17;lid.current=THREE.MathUtils.damp(lid.current,near>.5?(opened?Math.min(1,.35+p):open):.05,6,dt)});
 return <group ref={node}><DessertModel d={d} open={lid}/></group>}
function Scene({dessert,neighbours=[],shelf,intro=false,clock:introClock,tier,opened=false,progress=0,onReady,detail}:StageProps){const box=useRef<THREE.Group>(null),particles=useRef<THREE.Group>(null),rig=useRef<THREE.Group>(null);const lid=useRef(0),backdrop=useRef(intro?1:0),frame=useRef<Frame>({t:0,pos:0,vel:0,lean:0,leanVel:0}),last=useRef(0);const [centre,setCentre]=useState(0);const {camera}=useThree();const fired=useRef(false);const axis=shelf?.axis??'x';
 useFrame(({clock,pointer},dt)=>{if(!fired.current){fired.current=true;onReady?.()}
  // Intro time comes from the shared GSAP clock; outside the intro every beat reads as finished.
  const t=intro&&introClock?introClock.current.t:beats.end+4;const p=read(progress);const reveal=beat(t,beats.catch,'snap'),burst=beat(t,beats.burst,'pour');
  // Shelf velocity drives lean through an underdamped spring, so packages tip into the move and overshoot a little as they settle.
  const pos=shelf?shelf.position.current.value:0,f=frame.current,vel=THREE.MathUtils.damp(f.vel,dt>0?(pos-last.current)/dt:0,10,dt);last.current=pos;
  const target=THREE.MathUtils.clamp(-vel*.1,-.38,.38),leanVel=f.leanVel+((target-f.lean)*70-f.leanVel*9)*dt;frame.current={t,pos,vel,leanVel,lean:f.lean+leanVel*dt};
  if(shelf&&Math.round(pos)!==centre)setCentre(Math.round(pos));
  if(rig.current){rig.current.rotation.y=THREE.MathUtils.damp(rig.current.rotation.y,pointer.x*.14,4,dt);rig.current.rotation.x=THREE.MathUtils.damp(rig.current.rotation.x,-pointer.y*.05,4,dt)}
  if(box.current){const b=box.current,squash=Math.sin(beat(t,beats.land,'soft')*Math.PI)*.08,size=1.25-beat(t,[beats.burst[0],beats.exit[1]],'pour')*.5;b.visible=intro&&t<beats.exit[1];b.position.y=-.2+(1-beat(t,beats.drop,'drop'))*5-beat(t,beats.exit,'pour')*4;b.rotation.y=Math.sin(t)*.06;b.scale.set(size*(1+squash*.6),size*(1-squash),size*(1+squash*.6))}
  lid.current=intro?beat(t,beats.open,'snap'):.17;backdrop.current=intro?1-beat(t,beats.fade,'soft'):0;
  if(particles.current){particles.current.rotation.y=clock.elapsedTime*.075;particles.current.children.forEach((g,i)=>{const a=i*2.39996+clock.elapsedTime*.12;const r=intro?1.2+burst*2.3:2.3+(i%3)*.35;g.position.set(Math.sin(a)*r,Math.cos(a*.7)*1.5+.3+(intro?(1-burst)*-1.5:0),Math.cos(a)*1.3);g.rotation.set(a,a*.5,a*.2);g.scale.setScalar(.9+(i%4)*.3)})}
  camera.position.lerp(new THREE.Vector3(0,detail?2.6:2.2,intro?8.6-beat(t,beats.push,'pour')*.9+reveal*.9:8.6-p*1.1),1-Math.exp(-dt*2));camera.lookAt(0,0,0);
 });
 const n=shelf?.desserts.length??1;const slots=shelf?[-2,-1,0,1,2].map(k=>({i:centre+k,d:shelf.desserts[mod(centre+k,n)]})):[{i:0,d:dessert},...(neighbours[0]?[{i:-1,d:neighbours[0]}]:[]),...(neighbours[1]?[{i:1,d:neighbours[1]}]:[])];
 const gift={...dessert,format:'box',name:'Sweet Munchies',colour:'#f6a198'};
 return <><Studio/><Gradient colour={intro?'#512011':dessert.colour} show={backdrop}/><group ref={rig}>{slots.map(({i,d})=><Slot key={i} d={d} i={i} axis={axis} frame={frame} intro={intro} opened={opened} progress={progress} detail={detail}/>)}</group><group ref={box}><DessertModel d={gift} open={lid}/></group><group ref={particles}>{Array.from({length:18},(_,i)=><group key={i}><Ingredient kind={i%3}/></group>)}</group><ContactShadows position={[0,-1.15,0]} opacity={.33} scale={12} blur={2.7} far={5} resolution={tier==='high'?256:128} frames={Infinity}/></>
}
export default function Stage(props:StageProps){return <Canvas dpr={[1,dprCap[props.tier??'mid']]} camera={{position:[0,2.2,8.6],fov:33}} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;gl.domElement.addEventListener('webglcontextlost',props.onFailure||(()=>{}),{once:true})}}><Scene {...props}/></Canvas>}
