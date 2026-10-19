import { useEffect, useRef } from 'react';
import { clamp } from '../liquid/physics';
export function FieldStream({ direction, flowing, active, reduced, onWater }: {
    direction: number;
    flowing: boolean;
    active: boolean;
    reduced: boolean;
    onWater: (direction: number, dt: number) => void;
}) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const current = useRef({ direction, flowing, onWater });
    current.current = { direction, flowing, onWater };
    useEffect(() => {
        const element = canvas.current, ctx = element?.getContext('2d');
        if (!element || !ctx || !active || reduced)
            return;
        let frame = 0, last = 0, width = 0, height = 0, dpr = 1, position = .5, phase = 0;
        const wet = [0, 0, 0];
        const resize = new ResizeObserver(entries => {
            ({ width, height } = entries[0].contentRect);
            dpr = Math.min(devicePixelRatio || 1, 1.5);
            element.width = Math.round(width * dpr);
            element.height = Math.round(height * dpr);
        });
        resize.observe(element);
        function animate(now: number) {
            if (!ctx || !element)
                return;
            const dt = last ? clamp((now - last) / 1000, 0, .05) : 1 / 60;
            last = now;
            if (document.hidden || !width || !height) {
                last = 0;
                frame = requestAnimationFrame(animate);
                return;
            }
            position += (current.current.direction / 100 - position) * (1 - Math.exp(-10 * dt));
            phase += dt;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            const x = width * (.15 + position * .7), y = height * .72;
            if (current.current.flowing) {
                current.current.onWater(position * 100, dt);
                const index = Math.min(2, Math.floor(position * 3));
                wet[index] = Math.min(1, wet[index] + dt * .3);
                ctx.beginPath();
                ctx.moveTo(width * .5, height * .19);
                ctx.bezierCurveTo(width * .5, height * .35, x, height * .52, x, y);
                ctx.strokeStyle = '#d9f6f28c';
                ctx.lineWidth = 7;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.strokeStyle = '#f8fff9ae';
                ctx.lineWidth = 1.3;
                ctx.stroke();
                for (let i = 0; i < 14; i++) {
                    const t = (phase * 1.4 + i / 14) % 1;
                    const px = x + Math.sin(i * 7.2) * t * 45, py = y - Math.sin(t * Math.PI) * 23 + t * 12;
                    ctx.beginPath();
                    ctx.ellipse(px, py, 1, 2, i, 0, Math.PI * 2);
                    ctx.fillStyle = '#effff488';
                    ctx.fill();
                }
            }
            for (let i = 0; i < 3; i++) {
                if (!wet[i])
                    continue;
                ctx.save();
                ctx.translate(width * (.15 + ((i + .5) / 3) * .7), y + 8);
                ctx.scale(1, .25);
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 95);
                gradient.addColorStop(0, `rgba(15,40,34,${wet[i] * .6})`);
                gradient.addColorStop(1, '#15372800');
                ctx.fillStyle = gradient;
                ctx.fillRect(-95, -95, 190, 190);
                ctx.beginPath();
                ctx.ellipse(0, 0, (phase * 35) % 80, (phase * 35) % 80, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(214,235,212,${wet[i] * .18})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
            frame = requestAnimationFrame(animate);
        }
        frame = requestAnimationFrame(animate);
        return () => { resize.disconnect(); cancelAnimationFrame(frame); };
    }, [active, reduced]);
    return <canvas ref={canvas} className="field-stream" aria-hidden="true"/>;
}
