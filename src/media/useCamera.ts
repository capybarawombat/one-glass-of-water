import { useCallback, useEffect, useRef, useState } from 'react';
import { stableBottle, type Prediction } from './detectionPolicy';
type Detector = { detect: (input: HTMLCanvasElement, max: number, score: number) => Promise<Prediction[]>; dispose: () => void };
export function useCamera(active: boolean, onRecognized: () => void) {
 const video = useRef<HTMLVideoElement>(null), stream = useRef<MediaStream | null>(null);
 const detector = useRef<Detector | null>(null), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
 const generation = useRef(0), detecting = useRef(false), callback = useRef(onRecognized);
 callback.current = onRecognized;
 const [status, setStatus] = useState('Camera is off.'), [running, setRunning] = useState(false), [loading, setLoading] = useState(false);
 const stop = useCallback(() => {
  generation.current++; clearTimeout(timer.current);
  stream.current?.getTracks().forEach(track => track.stop()); stream.current = null;
  if (video.current) video.current.srcObject = null;
  // An in-flight inference owns its model until its finally block.
  if (!detecting.current) { detector.current?.dispose(); detector.current = null; }
  setRunning(false); setLoading(false); setStatus('Camera is off.');
 }, []);
 useEffect(() => { if (!active) stop(); return stop; }, [active, stop]);
 useEffect(() => { const hide = () => { if (document.hidden) { stop(); setStatus('Camera stopped while this tab was hidden.'); } }; document.addEventListener('visibilitychange', hide); return () => document.removeEventListener('visibilitychange', hide); }, [stop]);
 async function enable() {
  if (!active || document.hidden) return;
  stop(); const token = generation.current;
  setStatus('Requesting camera permission…'); setLoading(true);
  try {
   if (!navigator.mediaDevices?.getUserMedia) throw new Error('unavailable');
   const incoming = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } } });
   if (token !== generation.current) { incoming.getTracks().forEach(t => t.stop()); return; }
   stream.current = incoming;
   if (!video.current) { stop(); return; }
   video.current.srcObject = incoming; await video.current.play();
   if (token !== generation.current) return;
   setRunning(true); setLoading(false); setStatus('Camera ready. You can look for a bottle yourself, or enable local recognition.');
  } catch { if (token === generation.current) { stop(); setStatus('Camera unavailable or permission declined. You can continue without a camera.'); } }
 }
 async function recognize() {
  if (!running || loading || detecting.current || detector.current) return;
  const token = generation.current; setLoading(true); setStatus('Loading local recognition. This optional model is about 19 MB.');
  try {
   const { loadBottleDetector } = await import('./bottleDetector');
   if (token !== generation.current) return;
   const model = await loadBottleDetector();
   if (token !== generation.current) { model.dispose(); return; }
   detector.current = model; setLoading(false); setStatus('Keep a bottle in view. Recognition can make mistakes; manual continuation is always available.');
   const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 240;
   let previous: Prediction | null = null, streak = 0;
   const tick = async () => {
    if (token !== generation.current || !video.current || document.hidden) return;
    detecting.current = true;
    try {
     canvas.getContext('2d')!.drawImage(video.current, 0, 0, 320, 240);
     const result = stableBottle(await model.detect(canvas, 5, .65), previous, streak);
     if (token !== generation.current) return;
     previous = result.previous; streak = result.streak;
     if (result.recognized) { stop(); callback.current(); return; }
    } catch { if (token === generation.current) { stop(); setStatus('Recognition could not run. Continue manually.'); } }
    finally { detecting.current = false; if (token !== generation.current) { model.dispose(); if (detector.current === model) detector.current = null; } }
    if (token === generation.current) timer.current = setTimeout(tick, 650);
   };
   timer.current = setTimeout(tick, 100);
  } catch { if (token === generation.current) { setLoading(false); setStatus('Recognition could not load. Use manual continuation, especially on a slow connection.'); } }
 }
 return { video, status, running, loading, enable, recognize, stop };
}
