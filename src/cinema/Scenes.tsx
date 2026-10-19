import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Citation } from '../components/ReferenceLibrary';
import { useTilt } from '../hooks/useTilt';
import { LiquidGlass } from '../liquid/LiquidGlass';
import { clamp } from '../liquid/physics';
import { Documentary, FieldVideo, mediaURL } from './Media';
import { FieldStream } from './FieldStream';
type SceneProps = {
    active: boolean;
    reduced: boolean;
    next: () => void;
};
export function SceneLabel({ number, children }: {
    number: string;
    children: React.ReactNode;
}) {
    return <p className="scene-kicker"><span>{number} / 05</span><i />{children}</p>;
}
export function Next({ onClick, children = 'Continue' }: {
    onClick: () => void;
    children?: React.ReactNode;
}) {
    return <button className="next-action" onClick={onClick}>{children}<span aria-hidden="true">↗</span></button>;
}
export function PourScene({ active, reduced, next }: SceneProps) {
    const tilt = useTilt(active, reduced);
    const [remaining, setRemaining] = useState(.82);
    const start = useRef({ x: 0, angle: 0 });
    const [pouring, setPouring] = useState(false);
    const finished = useRef(false);
    function empty() { if (!finished.current) {
        finished.current = true;
        next();
    } }
    return <div className="opening-layout">
    <div className="opening-text"><SceneLabel number="01">A FAMILIAR BEGINNING</SceneLabel>
      <p className="opening-prelude">For you, clean water is only</p><h1 id="glass-title" tabIndex={-1}>a glass<br /><em>away.</em></h1>
      <p className="opening-after">But not for everyone.</p>
      <div className="opening-aside"><span className="hairline"/><p>One simple gesture.<br />A story that goes much further.</p></div>
    </div>
    <div className={`pour-stage ${pouring ? 'is-pouring' : ''}`}>
      <span className="glass-note note-top">THE ORDINARY IS EXTRAORDINARY.</span>
      <div className="glass-touch" onPointerDown={event => {
            if (event.button !== 0)
                return;
            event.currentTarget.setPointerCapture(event.pointerId);
            start.current = { x: event.clientX, angle: tilt.degrees };
        }} onPointerMove={event => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId))
                return;
            setPouring(true);
            tilt.setManual(start.current.angle + (event.clientX - start.current.x) * .65);
        }}>
        <LiquidGlass active={active} angle={tilt.degrees} reduced={reduced} onProgress={setRemaining} onEmpty={empty}/>
      </div>
      <span className="glass-note note-bottom">H₂O <i /> ESSENTIAL. EVERY DAY.</span>
    </div>
    <div className="pour-controls">
      <p className="gesture-title">{reduced ? 'Pour at your own pace.' : 'Tilt your phone to pour.'}</p>
      <span className="gesture-subtitle">Or drag the glass. Watch where it takes you.</span>
      <div className="tilt-control"><span aria-hidden="true">−</span><label className="sr-only" htmlFor="pour-angle">Glass tilt</label><input id="pour-angle" type="range" min="-88" max="88" value={Math.round(tilt.degrees)} onChange={e => { setPouring(true); tilt.setManual(+e.target.value); }}/><span aria-hidden="true">+</span></div>
      <div className="motion-actions">{!reduced && <button className="quiet-button" onClick={() => void tilt.enable()} disabled={tilt.enabled}>{tilt.enabled ? 'Motion enabled' : 'Enable phone motion'}</button>}{tilt.enabled && <button className="quiet-button" onClick={tilt.calibrate}>Recenter</button>}<button className="quiet-button" onClick={() => { setPouring(true); tilt.setManual(88); }}>Pour without tilting ↗</button></div>
      <p className="motion-status" role="status">{tilt.status}</p><progress className="sr-only" value={.82 - remaining} max=".82" aria-label="Water poured"/>
    </div>
    <span className="opening-duration">AN INTERACTIVE SHORT FILM <i /> ABOUT 2 MINUTES</span>
  </div>;
}
export function PeopleScene({ next }: SceneProps) {
    const [moment, setMoment] = useState(false);
    return <>
    <Documentary id="community" className="scene-backdrop people-backdrop"/>
    <div className="picture-shade"/>
    <div className="people-layout"><SceneLabel number="02">NOT FOR EVERYONE</SceneLabel>
      <div className="documentary-message" aria-live="polite">{!moment ? <>
        <h2 id="people-title" tabIndex={-1}><span className="big-figure">2.1 billion</span><span className="figure-sentence">people lacked safely managed<br className="desktop-only"/> drinking water in 2024. <Citation id={1}/></span></h2>
        <p className="source-line">WHO / UNICEF JMP · 2025</p>
      </> : <h2 id="people-title" tabIndex={-1}>For millions of children,<br />water is <em>never just water.</em></h2>}</div>
      <div className="moment-footer"><div><p className="location-label">WAJIR, KENYA · 2011</p><p className="scene-disclosure">An archival moment. A symbolic connection.<br />Your gesture did not deliver water to these children.</p></div><Next onClick={() => moment ? next() : setMoment(true)}>{moment ? 'Follow the water' : 'Stay with the story'}</Next></div>
    </div>
  </>;
}
export function FieldScene({ active, reduced, next }: SceneProps) {
    const tilt = useTilt(active, reduced);
    const [direction, setDirection] = useState(50), [flowing, setFlowing] = useState(false);
    const [watered, setWatered] = useState([0, 0, 0]), [automatic, setAutomatic] = useState(false);
    const moisture = useRef([0, 0, 0]);
    const lastUpdate = useRef(0);
    const progress = watered.reduce((a, b) => a + b, 0) / 3;
    const complete = progress >= .995;
    useEffect(() => { if (!active) {
        setFlowing(false);
        setAutomatic(false);
    } }, [active]);
    useEffect(() => {
        if (!automatic || !active || complete)
            return;
        const timer = setInterval(() => { const index = moisture.current.findIndex(n => n < 1); if (index >= 0)
            setDirection((index + .5) / 3 * 100); }, 100);
        return () => clearInterval(timer);
    }, [automatic, active, complete]);
    const desiredDirection = tilt.enabled ? clamp(50 + tilt.degrees * .65, 0, 100) : direction;
    function water(position: number, dt: number) {
        const index = Math.min(2, Math.floor(position / 100 * 3));
        moisture.current[index] = Math.min(1, moisture.current[index] + dt * .55);
        if (performance.now() - lastUpdate.current > 100) {
            setWatered([...moisture.current]);
            lastUpdate.current = performance.now();
        }
    }
    function guide(event: PointerEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        tilt.stop();
        setDirection(clamp((event.clientX - rect.left) / rect.width * 100, 0, 100));
    }
    return <>
    <Documentary id="dry" className="scene-backdrop"/>
    <Documentary id="crops" className="scene-backdrop irrigated-backdrop" style={{ opacity: progress }}/>
    <FieldVideo active={complete && active} reduced={reduced}/>
    <div className="picture-shade"/>
    <div className="field-gesture" role="group" aria-label="Guide the water across the field" onPointerDown={event => { if (event.button !== 0)
        return; event.currentTarget.setPointerCapture(event.pointerId); setAutomatic(false); setFlowing(true); guide(event); }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId))
        guide(event); }} onPointerUp={() => setFlowing(false)} onPointerCancel={() => setFlowing(false)} onLostPointerCapture={() => setFlowing(false)}>
      <FieldStream direction={desiredDirection} flowing={!complete && (flowing || tilt.enabled || automatic)} active={active} reduced={reduced} onWater={water}/>
    </div>
    <div className="field-layout"><SceneLabel number="03">A LIVING LANDSCAPE</SceneLabel>
      <div className="field-message"><h2 id="field-title" tabIndex={-1}>{complete ? <>Water sustains<br /><em>livelihoods.</em></> : <>Life follows<br /><em>the water.</em></>}</h2><p>{complete ? 'It sustains more than people.' : 'Guide the water.'}</p></div>
      <div className="field-bottom"><p className="sr-only" role="status">{complete ? "Water guided across the symbolic field. Continue downstream when ready." : "Guide water left, center and right, or use the gesture alternative."}</p><div className="furrow-progress" aria-label="Water guided across the field">{watered.map((n, i) => <span key={i} style={{ '--wet': `${n * 100}%` } as React.CSSProperties}/>)}</div>
        {!complete && <><div className="field-control-row"><label htmlFor="field-direction">Direction</label><input id="field-direction" type="range" min="0" max="100" value={Math.round(desiredDirection)} onChange={e => { tilt.stop(); setAutomatic(false); setDirection(+e.target.value); setFlowing(true); }}/></div><div className="motion-actions">{!reduced && <button className="quiet-button" onClick={() => void tilt.enable()}>Enable phone motion</button>}<button className="quiet-button" onClick={() => { if (reduced) {
        moisture.current = [1, 1, 1];
        setWatered([1, 1, 1]);
    }
    else {
        setAutomatic(true);
        setFlowing(true);
    } }}>Guide without gestures ↗</button></div></>}
        <p className="field-ethics">SYMBOLIC MONTAGE · DIFFERENT PLACES AND TIMES<br /><span>Digital water; no crop was restored by this gesture.</span></p>
        {tilt.enabled && <p className="motion-status" role="status">{tilt.status}</p>}
        {complete && <Next onClick={next}>Follow it downstream</Next>}
      </div>
    </div>
  </>;
}
const debris = [
    { id: 'one', x: 27, y: 48, rotate: -22 }, { id: 'two', x: 68, y: 57, rotate: 35 }, { id: 'three', x: 41, y: 71, rotate: -55 },
];
export function RiverScene({ active, next }: SceneProps) {
    const [removed, setRemoved] = useState<string[]>([]), [dragging, setDragging] = useState<string | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const origin = useRef({ x: 0, y: 0 });
    const [unavailable, setUnavailable] = useState(false);
    const complete = removed.length === debris.length;
    useEffect(() => { if (!active) {
        setDragging(null);
        setOffset({ x: 0, y: 0 });
    } }, [active]);
    function remove(id: string) { setRemoved(old => old.includes(id) ? old : [...old, id]); setDragging(null); }
    return <>
    <Documentary id="river" className="scene-backdrop river-backdrop"/><div className="picture-shade"/>
    <div className="river-layout"><SceneLabel number="04">BENEATH THE SURFACE</SceneLabel>
      <div className="river-message" aria-live="polite"><h2 id="river-title" tabIndex={-1}>{complete ? <>But clear water<br />isn’t always <em>safe water.</em></> : <>What you see<br />isn’t <em>everything.</em></>}</h2><p>{complete ? 'Bacteria, chemicals and other pollutants can remain invisible.' : 'Swipe away what you can see.'}</p></div>
      <div className="river-footer"><span className="scene-disclosure">{complete ? 'Visible overlays removed. The real river photograph is unchanged.' : 'Photographic litter overlays · symbolic cleanup'}<br />No gesture makes this water drinkable.</span><div className="river-alternatives">{!complete && <button className="quiet-button" onClick={() => setRemoved(debris.map(d => d.id))}>{unavailable ? 'Continue without image interaction' : 'Remove the visible layer'} ↗</button>}{complete && <Next onClick={next}>See what safety takes</Next>}</div></div>
    </div>
    {!unavailable && debris.filter(item => !removed.includes(item.id)).map((item, i) => <button key={item.id} className={`photo-litter ${dragging === item.id ? 'dragging' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%`, '--rotation': `${item.rotate}deg`, transform: dragging === item.id ? `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${item.rotate}deg)` : undefined } as React.CSSProperties} aria-label={`Remove photographed litter ${i + 1}`} onPointerDown={event => {
                if (event.button !== 0)
                    return;
                event.currentTarget.setPointerCapture(event.pointerId);
                origin.current = { x: event.clientX, y: event.clientY };
                setOffset({ x: 0, y: 0 });
                setDragging(item.id);
            }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId))
            setOffset({ x: event.clientX - origin.current.x, y: event.clientY - origin.current.y }); }} onPointerUp={event => { const distance = Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y); if (distance > 35 || distance < 8)
            remove(item.id); setDragging(null); }} onPointerCancel={() => setDragging(null)} onLostPointerCapture={() => setDragging(null)} onClick={event => { if (event.detail === 0)
            remove(item.id); }}>
      <img src={mediaURL('bottle')} alt="" draggable="false" onError={() => setUnavailable(true)}/>
    </button>)}
    <p className="sr-only" role="status">{removed.length} of 3 symbolic photographic overlays removed.</p>
  </>;
}
export function SystemScene({ active, reduced, next }: SceneProps & {
    next: () => void;
}) {
    const [ending, setEnding] = useState(false);
    useEffect(() => { if (ending) document.getElementById("system-title")?.focus({ preventScroll: true }); }, [ending]);
    return <>{!ending ? <>
    <Documentary id="treatment" className="scene-backdrop treatment-backdrop"/><div className="picture-shade"/>
    <div className="system-layout"><SceneLabel number="05">THE PEOPLE BEHIND IT</SceneLabel>
      <div className="system-message"><h2 id="system-title" tabIndex={-1}>A glass of safe water<br />takes more than <em>water.</em></h2><p>It takes protection, treatment,<br />and people who make it possible.</p></div>
      <div className="actor-labels"><div><span>01</span><h3>Government action</h3><p>Infrastructure. Regulations. Monitoring.</p></div><div><span>02</span><h3>Community action</h3><p>Protection. Maintenance. Safe use.</p></div><div><span>03</span><h3>International cooperation</h3><p>Funding. Expertise. Humanitarian assistance.</p></div></div>
      <div className="system-footer"><p className="scene-disclosure">Shown: wastewater treatment at Blue Plains, Washington, D.C.<br />Drinking-water treatment requires its own appropriate processes and monitoring.</p><Next onClick={() => setEnding(true)}>One last glass</Next></div>
    </div>
  </> : <div className="ending-layout"><SceneLabel number="05">EVERYDAY WATER. EXTRAORDINARY WORK.</SceneLabel><div className="ending-glass"><LiquidGlass still active={active} angle={0} reduced={reduced}/></div><div className="ending-copy"><p>Every glass has a story.</p><h2 id="system-title" tabIndex={-1}>One Glass<br />of <em>Water.</em></h2><div className="ending-actions"><a href="#references">Explore the sources ↗</a><button onClick={next}>Replay the experience ↺</button><a href="https://www.unicef.org/wash" target="_blank" rel="noopener noreferrer">Learn more ↗<span className="sr-only"> (opens in a new tab)</span></a></div><small>Symbolic gestures. Shared responsibility.<br />No donation or physical water delivery takes place.</small></div></div>}</>;
}
