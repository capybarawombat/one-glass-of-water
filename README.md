# One Glass of Water · V2

An interactive educational documentary built with React, TypeScript, Vite, CSS
and original SVG artwork. Five connected chapters link an empty glass, food
production, unequal access, river pollution and the systems behind safe water.
Gestures are symbolic: the site does not donate, deliver water or identify beneficiaries.

Public site: https://capybarawombat.github.io/one-glass-of-water/
Repository: https://github.com/capybarawombat/one-glass-of-water

## Develop and validate

Use Node.js 24 and npm. The lockfile is committed.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The production browser suite starts Vite preview under `/one-glass-of-water/`.
For Ubuntu CI, install browser system dependencies with
`npx playwright install --with-deps chromium`. Arch Linux browser testing uses
Playwright's fallback Linux browser build; physical-device testing is separate.

```sh
PLAYWRIGHT_BASE_URL=https://capybarawombat.github.io/one-glass-of-water/ npm run test:e2e
npm audit
```

## Experience and accessibility

1. **The empty glass:** hold a pointer, Space or Enter for five seconds to fill.
   Release pauses progress. Context is readable without completing the gesture.
   Completion reveals the 2024 JMP estimate and flows into the field; reduced
   motion keeps progression manual. Sound is off by default and opt-in only.
2. **The dry field:** explicitly enable phone tilt, calibrate a comfortable
   position and adjust sensitivity, or drag the water / use the direction slider.
   Tap each crop label for an equivalent keyboard-accessible interaction.
   Vegetation and moisture changes are symbolic, not quantitative agronomy.
3. **Find a bottle:** camera activation is optional and separate from optional
   local recognition. Manual continuation offers the same narrative. The revealed
   community artwork is labeled illustration, not documentary photography.
4. **Clean the river:** drag litter to the collection area, tap it, or activate
   its button with the keyboard. Visible cleanup is explicitly distinguished
   from drinking-water safety; invisible hazards can remain.
5. **Build the system:** activate five components in sequence. Drinking-water
   and wastewater pathways have different labels, colors and objectives, with
   no direct potable reuse connection. Every component explanation and Vietnam
   example is readable without completing the sequence.

Back, Skip, Replay and Restart controls remain available. All chapters and
references are readable without granting camera or motion permission. Reduced
motion removes decorative animation and provides direct field controls.
System fonts and inline vector art support slow connections. No WebGL is needed
for the story; local recognition can fall back to TensorFlow's CPU backend.

## Architecture

- `src/App.tsx`: chapter navigation, observation, focus, replay/restart, transitions.
- `src/interactions/machine.ts`: V2 narrative reducer alongside the preserved V1
  service-state reducer. Narrative, gestures and permission states are separate.
- `src/experience/Chapters.tsx`: five connected scenes and accessible alternatives.
- `src/experience/Artwork.tsx`: original glass, landscape, community, river and water.
- `src/hooks/useHold.ts`: pausable hold timing and cancellation.
- `src/hooks/useTilt.ts`: permission, calibration, smoothing, sensitivity and cleanup.
- `src/media/useCamera.ts`: explicit capture, generation guards, inference lifecycle.
- `src/media/bottleDetector.ts`: lazy TensorFlow/COCO-SSD load with CPU fallback.
- `src/media/detectionPolicy.ts`: confidence, size and three-frame stability policy.
- `src/data/system.ts`: infrastructure explanations and responsible actors.
- `src/data/references.ts`: original eight citations preserved, three primary
  references added for policy, wastewater financing and sustainable agriculture.
- `src/components/ReferenceLibrary.tsx`: citations, bibliography and asset credits.

V1 scene, illustration and copy modules are retained as source history, not loaded
into V2. `src/styles/v1.css` archives the previous stylesheet. No new framework,
3D library, tracking, analytics, external font or cloud recognition is used.

## Camera, motion and licenses

No camera request occurs on page load. `getUserMedia` runs only after Enable
camera. It requests rear-facing video and no microphone. No still photographs
are captured or stored. Frames are transient in-memory recognition inputs; they
are never uploaded. No photograph capture feature is included.

Recognition is a second opt-in. Approximately 19 MB of self-hosted model data
and a separate ~233 KB gzipped JavaScript chunk load only on request. COCO-SSD
Lite MobileNet V2 is a general object detector: it can miss or misclassify a
container and cannot determine its contents or water safety. It requires three
spatially stable bottle predictions at >=0.65 confidence, at most one inference
every 650 ms after the previous inference ends, on a 320×240 input. Manual
continuation remains available while loading and on slow devices.

Streams, timers and orientation listeners stop on navigation, replay, restart
and tab hiding. Late permission/model responses are discarded and cleaned up;
an in-flight inference disposes its model when it settles. No permission is
requested automatically when returning to a chapter.

Original illustrations depict no real people or documented locations. No source
photographs were copied without established reuse rights. Credits, provenance
and upstream licenses are in `public/ASSET-LICENSES.md` and the model's Apache-2.0
license is bundled in `public/models/bottle/LICENSE`.

## Research integrity

The 2.1 billion estimate describes people lacking **safely managed** drinking water
in **2024**, from the WHO/UNICEF JMP **2025** report. Safely managed means water from
an improved source, on premises, available when needed and free from specified
contamination. Rural 60% and urban 83% are global 2024 coverage shares.

Vietnam's national rural water/sanitation strategy is a **2021 policy** with a
2030 horizon and 2045 vision. The Bình Dương project figures refer to **2024
approval/financing**, with approximately 550,000 direct beneficiaries by 2032 a
**projection**, not an achieved outcome. UNICEF's 2024 Mekong Delta account
reports affected households/children and a **response plan** for 17,000 households;
it is not represented as completed delivery. The original 2013–2018 rural program
result remains historical and uses an improved-water-resource indicator distinct
from national safely managed coverage. The original rounded ~59% Vietnam
presentation figure remains qualified in the expandable historical context.

Water appearance is not proof of safety. This is not a home treatment recipe,
water-quality test, irrigation prescription or scientific crop-growth model.

## Deployment

Vite's base remains `/one-glass-of-water/`. The existing pinned GitHub Pages
workflow installs locked dependencies with Node 24, runs unit tests, TypeScript,
a production build and browser tests, then uploads `dist` and deploys. Only the
default branch deploys; the remote history is preserved.

```sh
git add src tests public package.json package-lock.json index.html README.md docs
git commit -m "Create the five-chapter One Glass of Water experience"
git push origin main
gh run list --workflow deploy.yml
gh run watch RUN_ID --exit-status
```

Use the writable host for Git and authenticated GitHub operations. Sandbox
credentials and read-only Git mounts may differ from the host. Do not reauthenticate
merely because a sandbox credential check fails.

Audit/implementation plan: `docs/V2-PLAN.md`. QA evidence and limits are recorded
in `docs/V2-QA.md`. Never infer deployment success merely from the intended URL;
verify the completed Actions run and the live site.
