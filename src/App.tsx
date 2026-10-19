import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ReferenceLibrary } from './components/ReferenceLibrary';
import { chapters, storyReducer, type Chapter } from './interactions/machine';
import { useReducedMotion } from './hooks/useReducedMotion';
import { FieldScene, PeopleScene, PourScene, RiverScene, SystemScene } from './cinema/Scenes';
import { useAmbience } from './cinema/useAmbience';
const names = ['A glass away', 'Not for everyone', 'A living landscape', 'Beneath the surface', 'The people behind it'];
export default function App() {
    const [chapter, dispatch] = useReducer(storyReducer, 'glass');
    const [replay, setReplay] = useState(0), [audio, setAudio] = useState(false);
    const [transition, setTransition] = useState(false), [inEvidence, setInEvidence] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const transitionEnd = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const reduced = useReducedMotion();
    const index = chapters.indexOf(chapter);
    useAmbience(audio, !inEvidence);
    const navigate = useCallback((target: Chapter, focus = true) => {
        dispatch({ type: 'GO', chapter: target });
        setInEvidence(false);
        history.replaceState(null, '', `#${target}`);
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (focus)
            requestAnimationFrame(() => document.getElementById(`${target}-title`)?.focus({ preventScroll: true }));
    }, []);
    const go = useCallback((target: Chapter) => {
        clearTimeout(timer.current);
        clearTimeout(transitionEnd.current);
        setTransition(false);
        navigate(target);
    }, [navigate]);
    function pourTransition() {
        if (reduced) {
            go('people');
            return;
        }
        setTransition(true);
        timer.current = setTimeout(() => navigate('people'), 550);
        transitionEnd.current = setTimeout(() => setTransition(false), 1100);
    }
    function restart() { setReplay(n => n + 1); setAudio(false); go('glass'); }
    function replayChapter() { setReplay(n => n + 1); go(chapter); }
    useEffect(() => {
        const hash = location.hash.slice(1);
        if (chapters.includes(hash as Chapter))
            navigate(hash as Chapter, false);
        const references = document.getElementById('references');
        const observer = new IntersectionObserver(entries => {
            const entry = entries[0];
            setInEvidence(entry.isIntersecting && entry.boundingClientRect.top < innerHeight * .55);
        }, { threshold: [0, .1, .25], rootMargin: '-20% 0px 0px' });
        if (references)
            observer.observe(references);
        const onHash = () => { const target = location.hash.slice(1); if (chapters.includes(target as Chapter))
            navigate(target as Chapter); };
        window.addEventListener('hashchange', onHash);
        return () => { observer.disconnect(); clearTimeout(timer.current); clearTimeout(transitionEnd.current); window.removeEventListener('hashchange', onHash); };
    }, [navigate]);
    const sceneProps = { active: !inEvidence, reduced, next: () => go(chapters[Math.min(index + 1, 4)]) };
    return <>
    <a className="skip-link" href="#references">Skip the film and explore the sources</a>
    <header className={`film-header ${inEvidence ? 'on-evidence' : ''}`}>
      <a className="wordmark" href="#glass" onClick={event => { event.preventDefault(); go('glass'); }}>ONE GLASS<span>OF WATER</span></a>
      <span className="film-header-caption">A STORY OF OUR MOST ESSENTIAL CONNECTION</span>
      <div className="header-actions"><button onClick={() => setAudio(value => !value)} aria-pressed={audio} title="Optional synthesized water-like sound design">Sound {audio ? 'on' : 'off'}<span className={`sound-lines ${audio ? 'playing' : ''}`} aria-hidden="true"><i /><i /><i /></span></button><a href="#references">Sources ↗</a></div>
    </header>
    <main id="top"><div id="film" className="film" aria-label="One Glass of Water, an interactive short film">
      <section className={`film-scene scene-${chapter}`} id={chapter} key={`${chapter}-${replay}`} aria-labelledby={`${chapter}-title`}>
        {chapter === 'glass' && <PourScene {...sceneProps} next={pourTransition}/>}
        {chapter === 'people' && <PeopleScene {...sceneProps}/>}
        {chapter === 'field' && <FieldScene {...sceneProps}/>}
        {chapter === 'river' && <RiverScene {...sceneProps}/>}
        {chapter === 'system' && <SystemScene {...sceneProps} next={restart}/>}
      </section>
      <div className={`water-wipe ${transition ? 'is-flowing' : ''}`} aria-hidden="true"><span /><span /><span /></div>
    </div><ReferenceLibrary /></main>
    {!inEvidence && <><nav className="film-chapters" aria-label="Film chapters">{chapters.map((id, i) => <button key={id} aria-label={`Chapter ${i + 1}: ${names[i]}`} aria-current={chapter === id ? 'step' : undefined} onClick={() => go(id)}><span /><small>0{i + 1}</small></button>)}</nav>
      <nav className="film-controls" aria-label="Experience controls"><div><button disabled={index === 0} onClick={() => go(chapters[index - 1])} aria-label="Previous chapter">← Back</button><button onClick={replayChapter} aria-label="Replay current chapter">Replay ↺</button></div><span className="film-position">0{index + 1}<span> / 05</span></span><button onClick={() => index < 4 ? go(chapters[index + 1]) : document.getElementById('references')?.scrollIntoView()} aria-label={index < 4 ? 'Skip to next chapter' : 'Skip to references'}>{index < 4 ? 'Skip chapter' : 'Sources'} →</button></nav></>}
  </>;
}
