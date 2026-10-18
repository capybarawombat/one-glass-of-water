import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Droplet, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ReferenceLibrary } from './components/ReferenceLibrary';
import { chapters, storyReducer, type Chapter } from './interactions/machine';
import { useReducedMotion } from './hooks/useReducedMotion';
import { BuildSystem, CleanRiver, DryField, EmptyGlass, FindBottle } from './experience/Chapters';
const names = ['The empty glass','The dry field','Find a bottle','Clean the river','Build the system'];
export default function App() {
 const [chapter,dispatch] = useReducer(storyReducer, 'glass');
 const [visible,setVisible] = useState<string>('glass');
 const [audio,setAudio] = useState(false), [replays,setReplays] = useState([0,0,0,0,0]);
 const [bridge,setBridge] = useState(false);
 const transition = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const reduced = useReducedMotion(); const current = chapters.indexOf(chapter);
 const go = useCallback((target: Chapter, focus = true) => {
  dispatch({type:'GO',chapter:target}); setVisible(target);
  history.replaceState(null,'',`#${target}`);
  clearTimeout(transition.current); setBridge(true); transition.current = setTimeout(()=>setBridge(false),reduced?0:900);
  document.getElementById(target)?.scrollIntoView({behavior:'instant',block:'start'});
  if (focus) document.getElementById(`${target}-title`)?.focus({preventScroll:true});
 }, [reduced]);
 useEffect(()=>{
  // Read current geometry, rather than queued IntersectionObserver entries from
  // before a rapid navigation or browser scroll-to-focus operation.
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]'));
  let frame = 0;
  const update = () => {
   const point = innerHeight * .35;
   const section = sections.find(node => { const rect=node.getBoundingClientRect();return rect.top<=point && rect.bottom>point; });
   if (!section) return;
   setVisible(section.id);
   if(chapters.includes(section.id as Chapter))dispatch({type:'GO',chapter:section.id as Chapter});
  };
  const onScroll = () => { cancelAnimationFrame(frame);frame=requestAnimationFrame(update); };
  const observer = new IntersectionObserver(update,{rootMargin:'-15% 0px -55% 0px'});
  sections.forEach(section=>observer.observe(section));
  window.addEventListener('scroll',onScroll,{passive:true});
  const hash = location.hash.slice(1); if(chapters.includes(hash as Chapter)) { dispatch({type:'GO',chapter:hash as Chapter}); setVisible(hash); requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView({behavior:'instant'})); }
  return ()=>{observer.disconnect();window.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame);clearTimeout(transition.current)};
 }, []);
 function restart(){setAudio(false);setReplays(old=>old.map(n=>n+1));go('glass')}
 function replay(){setReplays(old=>old.map((n,i)=>i===current?n+1:n));go(chapter)}
 return <><a className="skip-link" href="#references">Skip to all evidence and references</a><header className="site-header"><a className="brand" href="#glass" onClick={e=>{e.preventDefault();go('glass')}}><Droplet size={20} strokeWidth={1.2}/><span>ONE GLASS<br/><span className="brand-sub">OF WATER</span></span></a><span className="header-caption">A STORY OF CONNECTION</span><div className="header-actions"><button className="audio-button" aria-label={audio?'Turn sound off':'Enable gentle sound'} aria-pressed={audio} onClick={()=>setAudio(n=>!n)}>{audio?<Volume2 size={17}/>:<VolumeX size={17}/>}<span>Sound {audio?'on':'off'}</span></button><a href="#references">The evidence ↗</a></div></header>
 <nav className="chapter-nav" aria-label="Story chapters">{chapters.map((id,i)=><button key={id} onClick={()=>go(id)} aria-current={visible===id?'step':undefined} aria-label={`Chapter ${i+1}: ${names[i]}`}><span>0{i+1}</span><span className="chapter-name">{names[i]}</span></button>)}</nav>
 <main id="top"><section id="glass" className={`chapter chapter-glass ${visible==='glass'?'is-active':''}`} aria-labelledby="glass-title"><EmptyGlass key={replays[0]} active={visible==='glass'} next={()=>go('field')} reduced={reduced} audio={audio}/></section>
 <section id="field" className={`chapter chapter-field ${visible==='field'?'is-active':''}`} aria-labelledby="field-title"><DryField key={replays[1]} active={visible==='field'} next={()=>go('bottle')} reduced={reduced}/></section>
 <section id="bottle" className={`chapter chapter-bottle ${visible==='bottle'?'is-active':''}`} aria-labelledby="bottle-title"><FindBottle key={replays[2]} active={visible==='bottle'} next={()=>go('river')} reduced={reduced}/></section>
 <section id="river" className={`chapter chapter-river ${visible==='river'?'is-active':''}`} aria-labelledby="river-title"><CleanRiver key={replays[3]} active={visible==='river'} next={()=>go('system')} reduced={reduced}/></section>
 <section id="system" className={`chapter chapter-system ${visible==='system'?'is-active':''}`} aria-labelledby="system-title"><BuildSystem key={replays[4]} restart={restart}/></section><ReferenceLibrary/></main>
 <div className={`transition-water ${bridge?'flowing':''}`} aria-hidden="true"/>
 <nav className="journey-controls" aria-label="Journey controls"><button aria-label="Previous chapter" disabled={current===0} onClick={()=>go(chapters[current-1])}><ArrowLeft size={16}/><span>Back</span></button><span className="current-chapter">0{current+1} <span>/ 05</span></span><button onClick={replay} aria-label="Replay current chapter"><RotateCcw size={15}/><span>Replay</span></button><button onClick={restart} aria-label="Restart all chapters"><span>Restart</span></button><button onClick={()=>current<4?go(chapters[current+1]):document.getElementById('references')?.scrollIntoView()} aria-label={current<4?'Skip to next chapter':'Skip to references'}><span>{current<4?'Skip':'Sources'}</span><ArrowRight size={16}/></button></nav>
 </>;
}
