import { useCallback, useEffect, useRef, useState } from 'react';
type PermissionOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
export function useTilt(active: boolean, reduced: boolean) {
 const [enabled, setEnabled] = useState(false), [status, setStatus] = useState('Drag the water, or use the direction slider.');
 const [direction, setDirection] = useState(50), [sensitivity, setSensitivity] = useState(1);
 const [calibration, setCalibration] = useState(0);
 const latest = useRef<number | null>(null), generation = useRef(0);
 const stop = useCallback(() => { generation.current++; setEnabled(false); }, []);
 useEffect(() => { if (!active || reduced) stop(); }, [active, reduced, stop]);
 useEffect(() => {
  const hide = () => { if (document.hidden) { stop(); setStatus('Motion paused. Enable tilt again to resume.'); } };
  document.addEventListener('visibilitychange', hide); return () => { generation.current++; document.removeEventListener('visibilitychange', hide); };
 }, [stop]);
 useEffect(() => {
  if (!enabled || !active || reduced) return;
  let target = 50, smooth = direction, frame = 0, last = 0;
  const listener = (e: DeviceOrientationEvent) => {
   if (e.gamma === null) return;
   latest.current = e.gamma;
   target = Math.max(0, Math.min(100, 50 + (e.gamma - calibration) * sensitivity * 2));
  };
  const animate = (now: number) => { if (now - last > 40) { smooth += (target - smooth) * .18; setDirection(smooth); last = now; } frame = requestAnimationFrame(animate); };
  window.addEventListener('deviceorientation', listener); frame = requestAnimationFrame(animate);
  const timeout = setTimeout(() => { if (latest.current === null) { setStatus('No motion data arrived. Use the slider or drag instead.'); stop(); } }, 4000);
  return () => { window.removeEventListener('deviceorientation', listener); cancelAnimationFrame(frame); clearTimeout(timeout); };
  // direction is the initial smoothing position; changing it must not reattach listeners.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [enabled, active, reduced, sensitivity, calibration, stop]);
 async function enable() {
  if (!active || reduced || document.hidden) return;
  const token = ++generation.current;
  if (!('DeviceOrientationEvent' in window)) { setStatus('Motion is unavailable here. Drag or use the slider.'); return; }
  try {
   const api = DeviceOrientationEvent as PermissionOrientation;
   if (api.requestPermission && await api.requestPermission() !== 'granted') { if (token === generation.current) setStatus('Motion permission was declined. Drag or use the slider.'); return; }
   if (token !== generation.current || !active) return;
   latest.current = null; setCalibration(0); setEnabled(true); setStatus('Tilt gently left or right. Hold the phone comfortably and calibrate.');
  } catch { if (token === generation.current) setStatus('Motion is unavailable. Drag or use the slider.'); }
 }
 return { direction, setDirection, enabled, status, enable, stop, sensitivity, setSensitivity, calibrate: () => setCalibration(latest.current ?? 0) };
}
