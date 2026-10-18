# Artwork and optional model

All environmental artwork, glass, containers, river and infrastructure diagrams
are original SVG/CSS illustrations created for One Glass of Water. They depict
no real individual, documented location or beneficiary. No documentary photographs,
stock photos, external fonts, recorded audio or third-party logos are included.
Sound is a quiet synthesized tone generated locally only after opt-in.

Optional bottle recognition:
- COCO-SSD 2.2.3, Google LLC / TensorFlow.js authors, Apache-2.0.
- TensorFlow.js 4.22.0 core, converter and CPU/WebGL backends, Apache-2.0.
- Model: SSD Lite MobileNet V2, official TensorFlow.js COCO-SSD weights.
- Unmodified manifest and five weight shards retrieved from
  https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json
- Model source/implementation: https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
- Upstream license: https://github.com/tensorflow/tfjs-models/blob/master/LICENSE
- A copy is distributed at models/bottle/LICENSE.
- COCO training dataset information: https://cocodataset.org/#termsofuse
  No COCO photographs or annotations are redistributed here.

The manifest plus weights total 18561843 bytes (approximately 19 MB decimal).
These are self-hosted and fetched only when recognition is enabled. Loading the
initial story or merely opening the camera does not download the model.
Recognition is a fallible general object detector, not a water-quality or content
classifier. It cannot tell whether a container holds water or whether it is safe.
Three consecutive spatially stable bottle predictions at confidence >=0.65 are
required. Camera frames are transient in-memory inputs. Nothing is uploaded or saved.

React and React DOM: MIT. Lucide icons: ISC. Vite: MIT. TypeScript: Apache-2.0.
Package distributions preserve their upstream license notices.
