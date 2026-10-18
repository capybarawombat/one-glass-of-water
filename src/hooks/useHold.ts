import { useCallback, useEffect, useRef, useState } from 'react';
export function useHold(active: boolean, duration = 5000) {
 const [progress, setProgress] = useState(0);
 const [holding, setHolding] = useState(false);
 const value = useRef(0);
 const stop = useCallback(() => setHolding(false), []);
 useEffect(() => {
  if (!active) stop();
  const cancel = () => { if (document.hidden) stop(); };
  window.addEventListener('blur', stop); document.addEventListener('visibilitychange', cancel);
  return () => { window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', cancel); };
 }, [active, stop]);
 useEffect(() => {
  if (!holding || !active || value.current >= 1) return;
  let frame = 0, previous = performance.now();
  const tick = (now: number) => {
   value.current = Math.min(1, value.current + Math.min(now - previous, 100) / duration);
   previous = now; setProgress(value.current);
   if (value.current < 1) frame = requestAnimationFrame(tick); else stop();
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
 }, [holding, active, duration, stop]);
 return { progress, holding, start: () => { if (active && value.current < 1) setHolding(true); }, stop };
}
