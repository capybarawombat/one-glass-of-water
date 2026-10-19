/** A gravity-clipped, volume-preserving 2D approximation. No fluid-library dependency. */
export type Point = {
    x: number;
    y: number;
};
export const chamber: Point[] = [
    { x: -104, y: -153 }, { x: 104, y: -153 },
    { x: 77, y: 157 }, { x: -77, y: 157 },
];
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export function area(polygon: Point[]) {
    return Math.abs(polygon.reduce((sum, p, i) => {
        const next = polygon[(i + 1) % polygon.length];
        return sum + p.x * next.y - next.x * p.y;
    }, 0)) / 2;
}
/** Retain the half-plane below a free surface, in local glass coordinates. */
export function clipBelow(polygon: Point[], nx: number, ny: number, level: number): Point[] {
    const output: Point[] = [];
    for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i], b = polygon[(i + 1) % polygon.length];
        const da = a.x * nx + a.y * ny - level, db = b.x * nx + b.y * ny - level;
        if (da >= 0)
            output.push(a);
        if ((da >= 0) !== (db >= 0)) {
            const t = da / (da - db);
            output.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
        }
    }
    return output;
}
const fullArea = area(chamber);
export function freeSurface(volume: number, angle: number) {
    const nx = Math.sin(angle), ny = Math.cos(angle);
    let low = -400, high = 400;
    const target = fullArea * clamp(volume, 0, 1);
    for (let i = 0; i < 24; i++) {
        const middle = (low + high) / 2;
        if (area(clipBelow(chamber, nx, ny, middle)) > target)
            low = middle;
        else
            high = middle;
    }
    const level = (low + high) / 2;
    return { nx, ny, level, polygon: clipBelow(chamber, nx, ny, level) };
}
export function retainedCapacity(angle: number) {
    const nx = Math.sin(angle), ny = Math.cos(angle);
    const rimLevel = Math.max(-104 * nx - 153 * ny, 104 * nx - 153 * ny);
    return area(clipBelow(chamber, nx, ny, rimLevel)) / fullArea;
}
export function advanceVolume(volume: number, angle: number, dt: number) {
    const capacity = retainedCapacity(angle);
    const excess = Math.max(0, volume - capacity);
    // Exponential time integration avoids frame-rate-dependent drainage.
    return clamp(volume - excess * (1 - Math.exp(-1.45 * clamp(dt, 0, .1))), 0, 1);
}
/** Portrait gamma and landscape beta projected into the screen's horizontal axis. */
export function screenTilt(beta: number, gamma: number, screenDegrees: number) {
    const radians = screenDegrees * Math.PI / 180;
    return gamma * Math.cos(radians) + beta * Math.sin(radians);
}
