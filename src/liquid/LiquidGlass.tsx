import { useEffect, useRef } from 'react';
import { advanceVolume, chamber, clamp, freeSurface, type Point } from './physics';
type Props = {
    angle: number;
    active: boolean;
    reduced: boolean;
    still?: boolean;
    onProgress?: (volume: number) => void;
    onEmpty?: () => void;
};
type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    age: number;
    radius: number;
};
function path(ctx: CanvasRenderingContext2D, points: Point[]) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
}
export function LiquidGlass({ angle, active, reduced, still = false, onProgress, onEmpty }: Props) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const values = useRef({ angle, onProgress, onEmpty });
    values.current = { angle, onProgress, onEmpty };
    const volume = useRef(.82);
    useEffect(() => {
        const element = canvas.current;
        const ctx = element?.getContext('2d', { alpha: true });
        if (!element || !ctx)
            return;
        let width = 0, height = 0, dpr = 1, frame = 0, previous = 0, renderedAngle = 0, velocity = 0;
        let phase = 0, wave = 0, finished = false, announced = 1, lastEmit = 0;
        let particles: Particle[] = [];
        const resize = new ResizeObserver(entries => {
            const rect = entries[0].contentRect;
            width = rect.width;
            height = rect.height;
            dpr = Math.min(devicePixelRatio || 1, 2);
            element.width = Math.round(width * dpr);
            element.height = Math.round(height * dpr);
            if (reduced || still)
                draw(performance.now());
        });
        resize.observe(element);
        function draw(now: number) {
            if (!ctx || !element || !width || !height)
                return;
            const dt = previous ? clamp((now - previous) / 1000, 0, .05) : 1 / 60;
            previous = now;
            const target = (still ? 0 : values.current.angle) * Math.PI / 180;
            const lastAngle = renderedAngle;
            if (reduced) {
                renderedAngle = target;
                velocity = 0;
            }
            else {
                velocity += ((target - renderedAngle) * 40 - velocity * 11) * dt;
                renderedAngle += velocity * dt;
            }
            wave += ((Math.abs(renderedAngle - lastAngle) * 150 + .6) - wave) * (1 - Math.exp(-4 * dt));
            phase += dt * 2.4;
            const before = volume.current;
            if (active && !still && !document.hidden)
                volume.current = advanceVolume(before, renderedAngle, dt);
            const flow = Math.max(0, before - volume.current) / dt;
            if (active && volume.current < .025 && !finished && !still) {
                volume.current = 0;
                finished = true;
                values.current.onEmpty?.();
            }
            if (now - lastEmit > 120 && Math.abs(announced - volume.current) > .005) {
                announced = volume.current;
                values.current.onProgress?.(volume.current);
                lastEmit = now;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            const scale = Math.min(width / 440, height / 470);
            const cx = width / 2, cy = height * .46;
            ctx.save();
            ctx.translate(cx, cy + 185 * scale);
            ctx.scale(scale, scale * .16);
            const shadow = ctx.createRadialGradient(0, 0, 1, 0, 0, 142);
            shadow.addColorStop(0, '#00000066');
            shadow.addColorStop(1, '#00000000');
            ctx.fillStyle = shadow;
            ctx.fillRect(-150, -150, 300, 300);
            ctx.restore();
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.rotate(renderedAngle);
            // The tapered chamber is transparent; highlights trace real thickness at rim and base.
            path(ctx, chamber);
            const body = ctx.createLinearGradient(-111, 0, 111, 0);
            body.addColorStop(0, '#e0f9f60d');
            body.addColorStop(.1, '#d7eeea03');
            body.addColorStop(.76, '#bce1df08');
            body.addColorStop(1, '#ffffff19');
            ctx.fillStyle = body;
            ctx.fill();
            if (volume.current > 0) {
                const surface = freeSurface(volume.current, renderedAngle);
                ctx.save();
                path(ctx, chamber);
                ctx.clip();
                path(ctx, surface.polygon);
                ctx.clip();
                const fill = ctx.createLinearGradient(-100, -130, 100, 160);
                fill.addColorStop(0, '#c4e9e637');
                fill.addColorStop(.5, '#83c5c74a');
                fill.addColorStop(1, '#bde5df90');
                ctx.fillStyle = fill;
                ctx.fillRect(-110, -170, 220, 350);
                // Refracted caustic bands and glass-edge compression, clipped to actual water volume.
                for (let i = 0; i < 8; i++) {
                    const y = -90 + i * 38 + Math.sin(phase + i * .7) * (reduced ? 0 : 3);
                    ctx.beginPath();
                    ctx.moveTo(-110, y);
                    ctx.bezierCurveTo(-30, y + 10, 45, y - 12, 110, y + 3);
                    ctx.strokeStyle = `rgba(225,255,248,${i % 2 ? .055 : .10})`;
                    ctx.lineWidth = i % 2 ? 11 : 1.2;
                    ctx.stroke();
                }
                const refraction = ctx.createLinearGradient(-104, 0, 104, 0);
                refraction.addColorStop(0, '#edfffa44');
                refraction.addColorStop(.08, '#d8ffec05');
                refraction.addColorStop(.8, '#ffffff00');
                refraction.addColorStop(.96, '#ecfff44d');
                refraction.addColorStop(1, '#ffffff15');
                ctx.fillStyle = refraction;
                ctx.fillRect(-110, -160, 220, 330);
                ctx.restore();
                // Two endpoints of the gravity-aligned surface; transient capillary waves are decorative.
                const endpoints = surface.polygon.filter(p => Math.abs(p.x * surface.nx + p.y * surface.ny - surface.level) < .02);
                if (endpoints.length >= 2) {
                    const a = endpoints[0], b = endpoints[endpoints.length - 1];
                    const length = Math.hypot(b.x - a.x, b.y - a.y);
                    ctx.save();
                    path(ctx, chamber);
                    ctx.clip();
                    ctx.beginPath();
                    for (let i = 0; i <= 40; i++) {
                        const t = i / 40, ripple = reduced ? 0 : Math.sin(t * 8 + phase * 2) * Math.sin(t * Math.PI) * Math.min(wave, 7);
                        const x = a.x + (b.x - a.x) * t + surface.nx * ripple;
                        const y = a.y + (b.y - a.y) * t + surface.ny * ripple;
                        if (i)
                            ctx.lineTo(x, y);
                        else
                            ctx.moveTo(x, y);
                    }
                    ctx.strokeStyle = '#e1fff2bb';
                    ctx.lineWidth = 1.4;
                    ctx.stroke();
                    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
                    ctx.translate(mid.x, mid.y);
                    ctx.rotate(-renderedAngle);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, length / 2, 5, 0, 0, Math.PI * 2);
                    ctx.fillStyle = '#d9f6ed26';
                    ctx.fill();
                    ctx.restore();
                }
            }
            // Optical walls; never a solid blue rectangle or static rotated water picture.
            ctx.beginPath();
            ctx.moveTo(-111, -155);
            ctx.lineTo(-82, 164);
            ctx.quadraticCurveTo(0, 186, 82, 164);
            ctx.lineTo(111, -155);
            ctx.strokeStyle = '#e5f3e76b';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-103, -142);
            ctx.lineTo(-77, 154);
            ctx.quadraticCurveTo(0, 174, 77, 154);
            ctx.lineTo(103, -142);
            ctx.strokeStyle = '#d6f5e524';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0, -155, 111, 15, 0, 0, Math.PI * 2);
            ctx.strokeStyle = '#f5fff7a0';
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0, -155, 105, 11, 0, 0, Math.PI * 2);
            ctx.strokeStyle = '#e5fff544';
            ctx.lineWidth = .8;
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0, 164, 81, 11, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#d6f4ee15';
            ctx.fill();
            ctx.strokeStyle = '#edfcee70';
            ctx.lineWidth = 2;
            ctx.stroke();
            const gleam = ctx.createLinearGradient(-95, -130, -74, 150);
            gleam.addColorStop(0, '#ffffff00');
            gleam.addColorStop(.25, '#ffffffb0');
            gleam.addColorStop(.7, '#ffffff22');
            gleam.addColorStop(1, '#ffffff00');
            ctx.beginPath();
            ctx.moveTo(-98, -133);
            ctx.lineTo(-76, 139);
            ctx.strokeStyle = gleam;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(101, -125);
            ctx.lineTo(79, 139);
            ctx.strokeStyle = '#edfff733';
            ctx.lineWidth = 4;
            ctx.stroke();
            const lipX = renderedAngle >= 0 ? 106 : -106, lipY = -153;
            const worldLip = { x: cx + (lipX * Math.cos(renderedAngle) - lipY * Math.sin(renderedAngle)) * scale,
                y: cy + (lipX * Math.sin(renderedAngle) + lipY * Math.cos(renderedAngle)) * scale };
            ctx.restore();
            if (flow > .003 && !reduced && !still) {
                const direction = Math.sign(renderedAngle);
                const endX = worldLip.x + direction * 42 * scale;
                ctx.beginPath();
                ctx.moveTo(worldLip.x, worldLip.y);
                ctx.bezierCurveTo(worldLip.x + direction * 35 * scale, worldLip.y + 35 * scale, endX, height * .73, endX, height + 20);
                const stream = ctx.createLinearGradient(worldLip.x - 8, 0, worldLip.x + 12, 0);
                stream.addColorStop(0, '#d7eee111');
                stream.addColorStop(.45, '#c7efebaa');
                stream.addColorStop(.75, '#ffffffcc');
                stream.addColorStop(1, '#8db3ac22');
                ctx.strokeStyle = stream;
                ctx.lineWidth = clamp(flow * 37, 2, 13) * scale;
                ctx.lineCap = 'round';
                ctx.stroke();
                if (particles.length < 60)
                    particles.push({ ...worldLip, vx: direction * (28 + Math.random() * 40) * scale,
                        vy: 45 * scale, age: 0, radius: (Math.random() + .5) * scale });
            }
            particles = particles.filter(p => p.age < 1.5 && p.y < height + 10);
            for (const p of particles) {
                p.age += dt;
                p.vy += 460 * scale * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.radius, p.radius * 1.9, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#d9f6ec66';
                ctx.fill();
            }
            element.dataset.volume = volume.current.toFixed(3);
            element.dataset.angle = renderedAngle.toFixed(3);
        }
        function animate(now: number) {
            if (!document.hidden)
                draw(now);
            else
                previous = 0;
            frame = requestAnimationFrame(animate);
        }
        if (active && !still)
            frame = requestAnimationFrame(animate);
        else
            draw(performance.now());
        return () => { resize.disconnect(); cancelAnimationFrame(frame); };
    }, [active, reduced, still]);
    // Static/reduced rendering is also redrawn when the manual slider changes.
    return <canvas ref={canvas} className="liquid-glass" aria-label={still ? 'A full glass of simulated clean water' : 'Simulated water responds to the tilt control'} role="img"/>;
}
