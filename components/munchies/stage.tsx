'use client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Environment,Lightformer,useTexture} from '@react-three/drei';
import {Suspense,useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import type {Dessert} from '@/lib/munchies/data';
import {beat,intro as beats} from '@/lib/motion';
import {dprCap,type Tier} from '@/lib/device-tier';
import {dessertImage} from './art';

type Live=number|{current:number};
// The home shelf passes its whole list plus a continuous position; other pages pass a single dessert.
export type ShelfInput={desserts:Dessert[];position:{current:{value:number}};axis:'x'|'y';leaving?:boolean};
export type Zone={x:number;y:number;w:number;h:number};
export type StageProps={dessert:Dessert;neighbours?:Dessert[];shelf?:ShelfInput;zone?:{current:Zone|null};intro?:boolean;clock?:{current:{t:number}};tier?:Tier;opened?:boolean;progress?:Live;onReady?:()=>void;onFailure?:()=>void;detail?:boolean};
// Per-frame values are read from refs so animating them never re-renders the model tree.
const read=(v:Live)=>typeof v==='number'?v:v.current;
export function Ingredient({kind=0}:{kind?:number}){return kind===0?<mesh rotation={[.3,0,.4]} castShadow scale={[.07,.018,.12]}><sphereGeometry args={[1,12,8]}/><meshPhysicalMaterial color="#ad1649" roughness={.38} clearcoat={.3}/></mesh>:kind===1?<group><mesh castShadow scale={[.065,.035,.13]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#9caa3d" roughness={.65}/></mesh><mesh position={[.012,.031,0]} scale={[.015,.01,.115]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#cbd18a"/></mesh></group>:<mesh castShadow rotation={[.15,0,.1]}><coneGeometry args={[.07,.13,12]}/><meshPhysicalMaterial color="#361509" roughness={.31} clearcoat={.6}/></mesh>}
// Concept render cutouts as camera-facing cards. The closed shot cross-fades to the open shot as the lid value rises;
// they are flat, so the scene only ever tilts them in-plane and never turns them edge-on.
const CARD=3.4;
function Billboard({slug,open,lidded=true,face='closed'}:{slug:string;open:Live;lidded?:boolean;face?:'closed'|'open'}){
 // The home shelf shows every package open (face open), so it skips the closed shot and the lid cross-fade entirely.
 const closed=useTexture(dessertImage(slug,face));const a=useRef<THREE.MeshBasicMaterial>(null);
 useEffect(()=>{closed.colorSpace=THREE.SRGBColorSpace;closed.anisotropy=4;closed.needsUpdate=true},[closed]);
 useFrame(()=>{if(a.current)a.current.opacity=face==='open'?1:1-THREE.MathUtils.smoothstep(read(open),.25,.75)});
 // Only a package that can open (the centre one) fetches its open shot, in its own boundary so the closed card shows meanwhile.
 return <group position={[0,.25,0]}><mesh><planeGeometry args={[CARD,CARD]}/><meshBasicMaterial ref={a} map={closed} transparent toneMapped={false} depthWrite={false}/></mesh>{lidded&&face==='closed'&&<Suspense fallback={null}><OpenShot slug={slug} open={open}/></Suspense>}</group>}
function OpenShot({slug,open}:{slug:string;open:Live}){
 const opened=useTexture(dessertImage(slug,'open'));const b=useRef<THREE.MeshBasicMaterial>(null);
 useEffect(()=>{opened.colorSpace=THREE.SRGBColorSpace;opened.anisotropy=4;opened.needsUpdate=true},[opened]);
 useFrame(()=>{if(b.current)b.current.opacity=THREE.MathUtils.smoothstep(read(open),.25,.75)});
 return <mesh position={[0,0,.002]}><planeGeometry args={[CARD,CARD]}/><meshBasicMaterial ref={b} map={opened} transparent opacity={0} toneMapped={false} depthWrite={false}/></mesh>}
function Studio(){return <><ambientLight intensity={.45}/><directionalLight position={[-5,6,5]} intensity={2.5} color="#fff1db"/><spotLight position={[3,5,-3]} intensity={45} angle={.6} penumbra={1} color="#ffb6a6"/><Environment resolution={128}><Lightformer intensity={3} position={[-4,3,4]} rotation={[0,Math.PI/4,0]} scale={[5,7,1]}/><Lightformer intensity={2} position={[4,1,3]} rotation={[0,-Math.PI/4,0]} scale={[1,7,1]}/><Lightformer intensity={1.5} position={[0,5,-2]} rotation={[Math.PI/2,0,0]} scale={[5,4,1]}/></Environment></>}
const fragment=`uniform float time;uniform float fade;uniform vec3 colour;varying vec2 vUv;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}void main(){vec2 p=vUv*3.;float a=noise(p+time*.07);float b=noise(p*2.+a*2.-time*.06);float light=pow(max(0.,1.-distance(vUv,vec2(.35,.65))),2.);vec3 c=mix(colour*.64,colour*1.22,light);c=mix(c,vec3(1.,.83,.69),smoothstep(.61,.9,b)*.23);c+=pow(abs(sin((vUv.x+vUv.y)*5.+a*4.+time*.12)),15.)*.04;gl_FragColor=vec4(c,fade);}`;
// Screen-space quad at the far plane: always fills the canvas whatever the aspect or camera.
// Being transparent it draws after the models, so it relies on the depth test to stay behind them.
// The backdrop renders on its own layer so the zone clip in Scene never cuts it.
const BACKDROP=1;
const quadVertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.999,1.);}';
// Opaque only during the intro; afterwards it fades out so the CSS world colour and HTML title show through.
function Gradient({colour,show}:{colour:string;show:{current:number}}){const mesh=useRef<THREE.Mesh>(null),m=useRef<THREE.ShaderMaterial>(null);const uniforms=useMemo(()=>({time:{value:0},fade:{value:show.current},colour:{value:new THREE.Color(colour)}}),[]);useFrame(({clock},dt)=>{if(!m.current||!mesh.current)return;const u=m.current.uniforms;u.time.value=clock.elapsedTime;u.colour.value.lerp(new THREE.Color(colour),Math.min(dt*2,1));u.fade.value=THREE.MathUtils.damp(u.fade.value,show.current,5,dt);mesh.current.visible=u.fade.value>.002});return <mesh ref={el=>{mesh.current=el;el?.layers.set(BACKDROP)}} frustumCulled={false} renderOrder={-1}><planeGeometry args={[2,2]}/><shaderMaterial ref={m} uniforms={uniforms} fragmentShader={fragment} vertexShader={quadVertex} transparent depthWrite={false}/></mesh>}
type Frame={t:number;pos:number;vel:number;lean:number;leanVel:number;leave:number};
const mod=(a:number,n:number)=>((a%n)+n)%n;
// One package on the shelf. Its offset from the shelf position places it on the arc; the shared frame adds lean and the intro.
function Slot({d,i,axis,frame,intro,opened,progress,detail,lidded,face}:{lidded?:boolean;face?:'closed'|'open';d:Dessert;i:number;axis:'x'|'y';frame:{current:Frame};intro:boolean;opened:boolean;progress:Live;detail?:boolean}){
 const node=useRef<THREE.Group>(null),lid=useRef(0);
 useFrame(({clock},dt)=>{const g=node.current;if(!g)return;const {t,pos,lean,leave}=frame.current,o=i-pos,a=Math.abs(o),near=1-Math.min(a,1),e=clock.elapsedTime,p=read(progress);
  const reveal=beat(t,beats.catch,'snap'),burst=beat(t,beats.burst,'pour'),pop=beat(t,beats.burst,'drop');let x,y,z,rx,ry,rz;
  if(axis==='x'){const ang=o*.55;x=Math.sin(ang)*5.3;y=-.05-.2*Math.min(a,1);z=(Math.cos(ang)-1)*4.6;rx=.05+near*(.03+p*.15);ry=-o*.35;rz=-Math.sign(o)*Math.min(a,1)*.12+lean}
  else{x=0;y=-.05-o*3.8;z=-Math.min(a,2)*2.2;rx=.08+p*.15*near-lean*.8;ry=0;rz=0}
  let s=(1-Math.min(a,2)*(axis==='x'?.32:.42))*(detail?1.15:1);
  // Idle sway, strongest on the centre package.
  y+=Math.sin(e*.7+i)*.025;ry+=Math.sin(e*.45+i)*.06*near;rz+=Math.sin(e*.5+i)*.03*(1-near);
  // Leaving for a dessert page: neighbours slide off and shrink, the centre package rises and opens.
  if(leave>.001){if(near>.5){y+=leave*.35;s*=1+leave*.3}else{x*=1+leave*1.6;y*=1+leave;s*=1-leave}}
  if(intro){if(i===0){y+=(1-reveal)*2.5;rz+=(1-reveal)*1.9;s*=.12+.88*pop;g.visible=t>beats.burst[0]}
   else if(a<1.5){x*=.07+.93*burst;y=(1-reveal)*2.1;g.visible=t>beats.burst[0]+.2}else g.visible=false}
  else g.visible=a<2.6;
  g.position.set(x,y,z);g.rotation.set(rx*.3,ry*.25,rz);g.scale.setScalar(s);
  const open=intro?beat(t,beats.open,'snap'):.17;lid.current=THREE.MathUtils.damp(lid.current,near>.5?Math.max(leave,opened?Math.min(1,.35+p):open):.05,6,dt)});
 return <group ref={node}><Suspense fallback={null}><Billboard slug={d.slug} open={lid} lidded={lidded} face={face}/></Suspense></group>}
function Scene({dessert,neighbours=[],shelf,zone,intro=false,clock:introClock,opened=false,progress=0,onReady,detail}:StageProps){const particles=useRef<THREE.Group>(null),rig=useRef<THREE.Group>(null);const backdrop=useRef(intro?1:0),frame=useRef<Frame>({t:0,pos:0,vel:0,lean:0,leanVel:0,leave:0}),last=useRef(0);const [centre,setCentre]=useState(0);const {camera}=useThree();const fired=useRef(false);const axis=shelf?.axis??'x';const clip=useRef<Zone|null>(null);
 useFrame(({clock,pointer,size},dt)=>{if(!fired.current){fired.current=true;onReady?.()}
  // Intro time comes from the shared GSAP clock; outside the intro every beat reads as finished.
  const t=intro&&introClock?introClock.current.t:beats.end+4;const p=read(progress);const reveal=beat(t,beats.catch,'snap'),burst=beat(t,beats.burst,'pour');
  // Shelf velocity drives lean through an underdamped spring, so packages tip into the move and overshoot a little as they settle.
  const pos=shelf?shelf.position.current.value:0,f=frame.current,vel=THREE.MathUtils.damp(f.vel,dt>0?(pos-last.current)/dt:0,10,dt);last.current=pos;
  const target=THREE.MathUtils.clamp(-vel*.1,-.38,.38),leanVel=f.leanVel+((target-f.lean)*70-f.leanVel*9)*dt;frame.current={t,pos,vel,leanVel,lean:f.lean+leanVel*dt,leave:THREE.MathUtils.damp(f.leave,shelf?.leaving?1:0,4.5,dt)};
  if(shelf&&Math.round(pos)!==centre)setCentre(Math.round(pos));
  if(rig.current){rig.current.rotation.y=THREE.MathUtils.damp(rig.current.rotation.y,pointer.x*.14,4,dt);rig.current.rotation.x=THREE.MathUtils.damp(rig.current.rotation.x,-pointer.y*.05,4,dt)}
  backdrop.current=intro?1-beat(t,beats.fade,'soft'):0;
  if(particles.current){particles.current.rotation.y=clock.elapsedTime*.075;particles.current.children.forEach((g,i)=>{const a=i*2.39996+clock.elapsedTime*.12;const r=intro?1.2+burst*2.3:2.3+(i%3)*.35;g.position.set(Math.sin(a)*r,Math.cos(a*.7)*1.5+.3+(intro?(1-burst)*-1.5:0),Math.cos(a)*1.3);g.rotation.set(a,a*.5,a*.2);g.scale.setScalar(.9+(i%4)*.3)})}
  camera.position.lerp(new THREE.Vector3(0,detail?2.6:2.2,intro?8.6-beat(t,beats.push,'pour')*.9+reveal*.9:8.6-p*1.1),1-Math.exp(-dt*2));camera.lookAt(0,0,0);
  // Frame the shot into the shelf's stage zone with a view offset, so the canvas box itself never moves or resizes.
  // During the intro the frame is the whole canvas, easing into the zone from the reveal to the end.
  const cam=camera as THREE.PerspectiveCamera,z=zone?.current;
  if(z&&size.width&&size.height){const k=intro?beat(t,[beats.reveal,beats.end],'pour'):1,zw=size.width+(z.w-size.width)*k,zh=size.height+(z.h-size.height)*k;cam.aspect=zw/zh;cam.setViewOffset(zw,zh,-z.x*k,-z.y*k,size.width,size.height);cam.updateProjectionMatrix();clip.current={x:z.x*k,y:z.y*k,w:zw,h:zh}}
  else{clip.current=null;if(cam.view){cam.clearViewOffset();cam.aspect=size.width/size.height;cam.updateProjectionMatrix()}}
 });
 // Only the five packages on screen load up front (open shots, as the shelf shows them); the next one each side follows.
 // Preloading every dessert used to pull about 1.5MB of textures on the first visit.
 const list=shelf?.desserts;useEffect(()=>{if(!list)return;const n=list.length,id=window.setTimeout(()=>{[-3,3].forEach(k=>useTexture.preload(dessertImage(list[mod(centre+k,n)].slug,'open')))},1500);return()=>clearTimeout(id)},[list,centre]);
 // Packages outside the stage zone (the phone neighbours above and below) are clipped to it, as the old smaller canvas did.
 // Priority 1 means this callback does the render.
 // Two passes: the backdrop (layer 1) across the whole canvas, then everything else clipped to the zone.
 useFrame(({gl,scene,camera,size})=>{const c=clip.current;gl.autoClear=false;gl.setScissorTest(false);gl.clear();camera.layers.set(BACKDROP);gl.render(scene,camera);camera.layers.set(0);if(c){gl.setScissorTest(true);gl.setScissor(c.x,size.height-c.y-c.h,c.w,c.h)}gl.render(scene,camera);gl.setScissorTest(false)},1);
 const n=shelf?.desserts.length??1;const slots=shelf?[-2,-1,0,1,2].map(k=>({i:centre+k,d:shelf.desserts[mod(centre+k,n)]})):[{i:0,d:dessert},...(neighbours[0]?[{i:-1,d:neighbours[0]}]:[]),...(neighbours[1]?[{i:1,d:neighbours[1]}]:[])];
 return <><Studio/><Gradient colour={intro?'#512011':dessert.colour} show={backdrop}/><group ref={rig}>{slots.map(({i,d})=><Slot key={i} d={d} i={i} axis={axis} frame={frame} intro={intro} opened={opened} progress={progress} detail={detail} lidded={i===centre} face={shelf?'open':'closed'}/>)}</group><group ref={particles}>{Array.from({length:18},(_,i)=><group key={i}><Ingredient kind={i%3}/></group>)}</group></>
}
export default function Stage(props:StageProps){return <Canvas dpr={[1,dprCap[props.tier??'mid']]} camera={{position:[0,2.2,8.6],fov:33}} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;gl.domElement.addEventListener('webglcontextlost',props.onFailure||(()=>{}),{once:true})}}><Scene {...props}/></Canvas>}
