export type Prediction = { class: string; score: number; bbox: [number, number, number, number] };
export function stableBottle(predictions: Prediction[], previous: Prediction | null, streak: number) {
 const bottle = predictions.filter(p => p.class === 'bottle' && p.score >= .65 && p.bbox[2] > 12 && p.bbox[3] > 20).sort((a,b) => b.score-a.score)[0];
 if (!bottle) return { previous: null, streak: 0, recognized: false };
 const near = previous && Math.hypot(bottle.bbox[0]-previous.bbox[0], bottle.bbox[1]-previous.bbox[1]) < Math.max(50, bottle.bbox[2]);
 const next = near ? streak + 1 : 1;
 return { previous: bottle, streak: next, recognized: next >= 3 };
}
