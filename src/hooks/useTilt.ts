import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp, screenTilt } from '../liquid/physics';
type PermissionOrientation = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<string>;
};
export function useTilt(active: boolean, reduced: boolean) {
    const [enabled, setEnabled] = useState(false);
    const [status, setStatus] = useState('Drag the glass or use the tilt slider.');
    const [degrees, setDegrees] = useState(0);
    const target = useRef(0), current = useRef(0), baseline = useRef<number | null>(null);
    const latest = useRef<number | null>(null), generation = useRef(0);
    const stop = useCallback(() => { generation.current++; setEnabled(false); }, []);
    const setManual = useCallback((value: number) => {
        stop();
        target.current = clamp(value, -88, 88);
        current.current = target.current;
        setDegrees(target.current);
    }, [stop]);
    useEffect(() => {
        if (!active || reduced)
            stop();
    }, [active, reduced, stop]);
    useEffect(() => {
        const hide = () => {
            if (document.hidden) {
                stop();
                setStatus('Motion paused. Use the slider or enable motion again.');
            }
        };
        document.addEventListener('visibilitychange', hide);
        return () => { generation.current++; document.removeEventListener('visibilitychange', hide); };
    }, [stop]);
    useEffect(() => {
        if (!enabled || !active || reduced)
            return;
        let frame = 0, previous = performance.now(), lastUpdate = 0;
        const resetBaseline = () => { baseline.current = null; };
        const listener = (event: DeviceOrientationEvent) => {
            if (event.gamma === null || event.beta === null || !Number.isFinite(event.gamma) || !Number.isFinite(event.beta))
                return;
            const screenAngle = screen.orientation?.angle ?? (window as Window & {
                orientation?: number;
            }).orientation ?? 0;
            latest.current = screenTilt(event.beta, event.gamma, screenAngle);
            baseline.current ??= latest.current; // The first real reading calibrates a comfortable neutral.
            const delta = latest.current - baseline.current;
            target.current = Math.abs(delta) < 3 ? 0 : clamp(delta * 1.35, -88, 88);
        };
        const animate = (now: number) => {
            const dt = Math.min((now - previous) / 1000, .1);
            previous = now;
            current.current += (target.current - current.current) * (1 - Math.exp(-8 * dt));
            if (now - lastUpdate > 32) {
                setDegrees(current.current);
                lastUpdate = now;
            }
            frame = requestAnimationFrame(animate);
        };
        window.addEventListener('deviceorientation', listener);
        screen.orientation?.addEventListener('change', resetBaseline);
        window.addEventListener('orientationchange', resetBaseline);
        frame = requestAnimationFrame(animate);
        const timeout = setTimeout(() => {
            if (latest.current === null) {
                setStatus('No motion data arrived. Drag or use the slider.');
                stop();
            }
        }, 3500);
        return () => {
            window.removeEventListener('deviceorientation', listener);
            screen.orientation?.removeEventListener('change', resetBaseline);
            window.removeEventListener('orientationchange', resetBaseline);
            cancelAnimationFrame(frame);
            clearTimeout(timeout);
        };
    }, [enabled, active, reduced, stop]);
    async function enable() {
        if (!active || reduced || document.hidden)
            return;
        const token = ++generation.current;
        if (!('DeviceOrientationEvent' in window)) {
            setStatus('Motion is unavailable. Drag or use the slider.');
            return;
        }
        try {
            const api = DeviceOrientationEvent as PermissionOrientation;
            if (api.requestPermission && await api.requestPermission() !== 'granted') {
                if (token === generation.current)
                    setStatus('Motion permission declined. Drag or use the slider.');
                return;
            }
            if (token !== generation.current || !active)
                return;
            baseline.current = null;
            latest.current = null;
            target.current = 0;
            current.current = 0;
            setEnabled(true);
            setStatus('Tilt sideways to pour. Your starting position is neutral.');
        }
        catch {
            if (token === generation.current)
                setStatus('Motion is unavailable. Drag or use the slider.');
        }
    }
    return { degrees, setManual, enabled, status, enable, stop,
        calibrate: () => { baseline.current = latest.current; target.current = 0; setStatus('Centered. Tilt gently sideways.'); } };
}
