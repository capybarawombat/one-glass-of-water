# V2 audit and implementation plan

React, TypeScript and Vite remain. Reuse ReferenceLibrary/Citation, the original
bibliography, the original integrity-tested reducer and SVG illustration assets.
The V1 journey remains in source as a historical implementation; V2 extends its
state module with independent chapter navigation. No donor or delivery claims.

Five connected, navigable chapters: pausable 5-second fill; symbolic field with
calibrated tilt and pointer/range alternatives; optional local bottle recognition;
visible river litter removal; sequential drinking-water/wastewater system.
Chapter state, gesture state, permissions, presentation and research are separate.
Keep all explanations and references available independently of interaction.

Use original vector artwork rather than source photographs without confirmed
reuse rights. CSS/SVG provides depth without WebGL. Lazy-load local COCO-SSD
Lite MobileNet V2 and TensorFlow only on recognition request. Explicit camera
activation, no still capture/storage/upload, <=2 inferences/second, three stable
bottle detections at >=0.65. Dispose model, tracks, listeners, frames and timers
on navigation, tab hiding and restart. Denial/manual paths never block progress.

Validate npm ci/audit, existing tests, added state/detection tests, TypeScript,
production build, actionlint, browser gesture/permission/resource mocks, keyboard,
reduced-motion and 320px+ layouts. Inspect screenshots. Deploy existing main branch
only after passing local QA, then run tests against the public Pages URL.
Real-device testing is distinct from browser emulation and will not be claimed.
