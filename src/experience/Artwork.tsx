import { useId } from 'react';
export function WaterSurface({ className = '' }: { className?: string }) {
 return <div className={`water-surface ${className}`} aria-hidden="true"><i/><i/><i/></div>;
}
export function LivingGlass({ progress }: { progress: number }) {
 const id = useId().replaceAll(':', '');
 return <svg className="living-glass" viewBox="0 0 400 440" aria-hidden="true"><defs>
  <linearGradient id={`${id}-glass`}><stop stopColor="#d8eeec" stopOpacity=".4"/><stop offset=".22" stopColor="#d8eeec" stopOpacity=".02"/><stop offset=".8" stopColor="#d8eeec" stopOpacity=".05"/><stop offset="1" stopColor="#fff" stopOpacity=".55"/></linearGradient>
  <linearGradient id={`${id}-water`} x2=".3" y2="1"><stop stopColor="#b5e5dd" stopOpacity=".9"/><stop offset="1" stopColor="#438d91" stopOpacity=".65"/></linearGradient>
  <clipPath id={`${id}-clip`}><path d="M90 90L114 367Q200 396 286 367L310 90Z"/></clipPath>
 </defs><ellipse cx="200" cy="400" rx="145" ry="14" fill="#000" opacity=".23"/>
 <g clipPath={`url(#${id}-clip)`}><rect x="80" y={380-progress*250} width="240" height="300" fill={`url(#${id}-water)`}/><ellipse className="liquid-meniscus" cx="200" cy={380-progress*250} rx="110" ry="12" fill="#c0eee1" opacity={progress ? .8 : 0}/><path d="M120 180Q180 205 278 185M118 260Q190 280 286 255M126 340Q210 357 280 335" stroke="#d8fff3" opacity={progress*.17} fill="none"/></g>
 <path d="M90 90L114 367Q200 396 286 367L310 90" fill={`url(#${id}-glass)`} stroke="#dfefdf" strokeOpacity=".7" strokeWidth="1.5"/><ellipse cx="200" cy="90" rx="110" ry="18" fill="#f4f4e2" fillOpacity=".04" stroke="#e2f3e9" strokeOpacity=".8"/>
 <path d="M102 111L124 354M298 114L276 354" stroke="#fff" strokeOpacity=".65" strokeWidth="2"/><path d="M117 128L134 330" stroke="#fff" strokeOpacity=".16" strokeWidth="8"/><ellipse cx="200" cy="369" rx="83" ry="12" stroke="#e7f3eb" strokeOpacity=".4" fill="none"/>
 </svg>;
}
export function FieldArt({ moisture = [0,0,0], direction = 50 }: { moisture?: number[]; direction?: number }) {
 const id = useId().replaceAll(':','');
 return <svg className="field-art" viewBox="0 0 1100 650" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#183d42"/><stop offset=".7" stopColor="#a7a18b"/><stop offset="1" stopColor="#b3936a"/></linearGradient><linearGradient id={`${id}-earth`} x2=".3" y2="1"><stop stopColor="#7f7256"/><stop offset="1" stopColor="#292e29"/></linearGradient></defs>
 <rect width="1100" height="650" fill={`url(#${id}-sky)`}/><circle cx="800" cy="155" r="55" fill="#e7d2a1" opacity=".65"/><path d="M0 290Q160 215 340 282Q490 183 720 270Q910 220 1100 252V420H0Z" fill="#485d53"/><path d="M0 321Q220 290 480 330Q790 266 1100 319V650H0Z" fill={`url(#${id}-earth)`}/>
 {Array.from({length:18},(_,i)=><path key={i} d={`M${520+i*7} 320Q${-220+i*100} 430 ${-450+i*125} 680`} fill="none" stroke={i%2?'#c6ad79':'#161f1d'} strokeOpacity={i%2?'.14':'.5'} strokeWidth={i%2?2:7}/>)}
 {[0,1,2].map(zone=><path key={`soil-${zone}`} d={`M${480+zone*45} 325L${zone*367} 650H${(zone+1)*367}L${525+zone*45} 325Z`} fill="#558369" opacity={moisture[zone]*.28}/>)}
 {[0,1,2].map(zone=><g key={zone} style={{color:`rgb(${145-moisture[zone]*65}, ${119+moisture[zone]*40}, ${69+moisture[zone]*25})`}}>{Array.from({length:19},(_,i)=>{
 const x=90+zone*345+(i%5)*48+(Math.floor(i/5)%2)*15, y=385+Math.floor(i/5)*63; const rise=18+moisture[zone]*26;
 return <g key={i} stroke="currentColor" strokeWidth="2" fill="currentColor"><path d={`M${x} ${y+20}q-4 -${rise} 0 -${rise+15}`} fill="none"/><path d={`M${x} ${y}q-27 -24 -21 -30q23 3 21 30M${x} ${y-8}q25 -29 24 -32q-29 1 -24 32`} opacity={.35+moisture[zone]*.65}/></g>;
 })}</g>)}
 <path d={`M550 300Q${direction*9+100} 395 ${direction*9+100} 580`} stroke="#a5e6db" strokeWidth="14" opacity=".25" fill="none"/><path className="stream-line" d={`M550 300Q${direction*9+100} 395 ${direction*9+100} 580`} stroke="#c1f8e8" strokeWidth="3" strokeDasharray="8 15" opacity=".7" fill="none"/>
 <g stroke="#d2bc8f" strokeOpacity=".18" fill="none"><path d="m10 600 54-44 20 29 55-7 21 43 45-18m460-3 41-36 29 23 36-48 54 34m180-78 27 30-15 40 40 23m-650-131 35 28-18 35 47 17"/></g>
 </svg>;
}
export function CommunityArt() {
 return <svg className="community-art" viewBox="0 0 900 580" role="img" aria-label="Illustration of a shared community water point, containers and people; no real people or location depicted"><defs><linearGradient id="community-sky" x2="0" y2="1"><stop stopColor="#28474b"/><stop offset="1" stopColor="#d0b894"/></linearGradient></defs><rect width="900" height="580" fill="url(#community-sky)"/><circle cx="705" cy="130" r="65" fill="#dec99c" opacity=".5"/><path d="M0 310Q250 220 470 300T900 280V580H0Z" fill="#465a4a"/><path d="M0 393Q320 340 900 370V580H0Z" fill="#a08f6d"/><path d="M0 500Q350 410 900 480V580H0Z" fill="#756b53"/>
 <g fill="#6c7660" stroke="#d6c7a5" strokeOpacity=".4"><path d="M40 281h230v110H40Z"/><path d="m22 284 130-80 138 80Z"/><path d="M655 301h197v98H655Z"/><path d="m638 305 106-70 125 70Z"/></g><path d="M110 331h42v60h-42m582-44h36v52h-36" fill="#34433b"/>
 <path d="M410 296v130h150V296" fill="#bcb89b"/><path d="M402 294h166v22H402Z" fill="#ddd0a8"/><path d="M483 295v-54h36v25h23" stroke="#3a5550" strokeWidth="13" fill="none"/><path d="M544 265v24" stroke="#83c5ba" strokeWidth="4"/>
 {[310,610].map((x,i)=><g key={x} transform={`translate(${x} ${i?6:0})`}><ellipse cx="0" cy="466" rx="55" ry="8" fill="#292f27" opacity=".2"/><path d="m-13 383-9 76m34-76 18 76" stroke="#343f3a" strokeWidth="15"/><path d="M-21 331q21-15 42 0l11 64h-64Z" fill={i?'#b1b5a0':'#a97550'}/><circle cy="306" r="20" fill="#9b7256"/><path d="M-20 301q2-32 33-20l8 20" fill="#283b34"/><path d={i?'m-18 339-32 41 26 8':'m20 341 41 21 20-4'} stroke="#9b7256" strokeWidth="10" strokeLinecap="round" fill="none"/></g>)}
 {[355,560,675].map((x,i)=><g key={x} transform={`translate(${x} ${410+i*14})`}><rect width="39" height="53" rx="5" fill={i===1?'#d7c58d':'#b3baab'} stroke="#e4d8b2"/><path d="M11 0v-9h18V0m-16 12h13" stroke="#435650" strokeWidth="4" fill="none"/></g>)}<path d="M0 540Q400 493 900 530" stroke="#c7b48e" opacity=".3" fill="none"/>
 </svg>;
}
export function RiverArt({ clean }: { clean: boolean }) {
 return <svg className={`river-art ${clean?'is-clear':''}`} viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="river-light" x2=".3" y2="1"><stop stopColor="#8aa69d"/><stop offset="1" stopColor="#173c42"/></linearGradient></defs><rect width="1000" height="650" fill="#385b56"/><path d="M0 0H1000V180Q820 150 680 224Q520 260 420 650H80Q400 350 380 190Q240 90 0 80Z" fill="#1d3834"/><path d="M1000 70Q750 130 668 272Q600 400 500 650H80Q435 365 382 203Q310 145 0 132V260Q300 240 244 350L0 650H1000Z" fill="url(#river-light)"/>
 {Array.from({length:17},(_,i)=><path className="river-ripple" key={i} d={`M${170+i*9} ${260+i*24}q${160+i*8} -20 ${300+i*13} 0`} stroke="#d4e7d8" opacity={.08+(i%3)*.025} strokeWidth="1" fill="none"/>)}
 {[0,1,2,3,4,5].map(i=><g key={i} transform={`translate(${i*190-35} ${i%2?50:10})`} stroke="#739781" opacity=".6"><path d="M0 180V20m0 90-25-35m25 10 30-37" strokeWidth="5"/><path d="M-40 90Q-80 0-10 10Q40-35 64 35Q100 100 35 110Z" fill="#416755" stroke="none"/></g>)}
 </svg>;
}
export function LitterArt({ kind }: { kind: string }) {
 return <svg viewBox="0 0 70 70" aria-hidden="true">{kind==='bottle'?<g transform="rotate(26 35 35)"><path d="M29 6h12v15q10 8 10 15v25q-16 8-32 0V36q0-8 10-15Z" fill="#c9d9ca" stroke="#f1e5bc" strokeWidth="2"/><path d="M21 37h28v15H21Z" fill="#b89362"/><path d="M29 5h12v8H29Z" fill="#75998d"/></g>:kind==='wrapper'?<path d="m7 16 15 3 7-6 14 8 18-3-5 18 6 17-18-3-15 9-10-9-15 3 7-18Z" fill="#c7ae7e" stroke="#e4d3a9" strokeWidth="2"/>:<g transform="rotate(-16 35 35)"><path d="m16 16 6 44q13 9 28 0l6-44Z" fill="#b4b9ab" stroke="#e4d3a9" strokeWidth="2"/><ellipse cx="36" cy="16" rx="20" ry="5" fill="#718781"/></g>}</svg>;
}
