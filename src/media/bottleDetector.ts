import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { load } from '@tensorflow-models/coco-ssd';
export async function loadBottleDetector() {
 try { if (!await tf.setBackend('webgl')) await tf.setBackend('cpu'); } catch { await tf.setBackend('cpu'); }
 await tf.ready();
 return load({ base: 'lite_mobilenet_v2', modelUrl: `${import.meta.env.BASE_URL}models/bottle/model.json` });
}
