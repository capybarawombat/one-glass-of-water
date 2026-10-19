# One Glass of Water — V3

A five-chapter, visitor-paced cinematic water-awareness experience built with
React 19, TypeScript and Vite. Canvas 2D simulates a transparent glass, gravity-aligned
water surface and pouring stream. Documentary imagery is self-hosted and separately
credited. No backend, tracking, donation mechanism, camera, or model download.

**Current status: implementation builds; release is blocked by missing media and
unavailable browser/GitHub access in this sandbox. V3 is not deployed.**

## Setup

Node 22.18+ and npm. The lockfile is committed in the existing project.

```sh
npm ci
npm run dev
```

The site uses `/one-glass-of-water/` as its Vite base. Open the URL printed by Vite.

## Acquire the documentary media

Requirements: network access, Python 3 with Pillow, and ffmpeg with libx264.

```sh
npm run assets:fetch
npm run assets:verify
```

The acquisition script reads `public/media/manifest.json`, queries Commons for each
reviewed original, checks its license against the manifest, downloads and optimizes
it, and records source metadata plus SHA-256 hashes in `public/media/acquisition.json`.
An error stops acquisition instead of substituting an unverified file. Retry one
item with `npm run assets:fetch -- --only=community` (or another manifest ID).

Photography is converted to at most 1600 px WebP. The optional irrigation footage
becomes a 12-second silent H.264 clip at 960 px. Asset-size limits are checked before
publication. Review actual framing, object crops and people visibility after
acquisition; their appearance has not been inspected in this restricted session.

All runtime assets are local. The page never hotlinks source imagery. A missing
image shows an honest typographic fallback; missing optional video retains the
photographic sequence. These fallbacks keep navigation usable but do not satisfy
the completed documentary campaign's acceptance criteria.

## Story and architecture

See [the asset-backed storyboard](docs/V3-STORYBOARD.md) for the 90–150-second edit,
media choices, permissions and ethical constraints.

- `src/App.tsx`: five chapters, navigation, replay, source access and the water wipe.
- `src/cinema/Scenes.tsx`: the glass, archival human moment, agricultural gesture,
  photographic litter overlays, treatment/system message and closing glass.
- `src/liquid/physics.ts`: polygon clipping, volume-conserving free surface,
  lower-rim capacity, time-based drainage and orientation projection.
- `src/liquid/LiquidGlass.tsx`: Canvas optical highlights, water surface, caustic
  bands, variable-width stream and bounded droplet particles. Device pixel ratio
  is capped at 2. Animation is paused off-scene and drawing stops in hidden tabs.
- `src/hooks/useTilt.ts`: explicit sensor permission, first-sample calibration,
  portrait/landscape axis projection, dead zone, smoothing and manual fallback.
- `src/cinema/FieldStream.tsx`: digital stream and wetting/runoff overlay.
- `src/cinema/Media.tsx`: local documentary media, error fallback and full credits.
- `src/cinema/useAmbience.ts`: optional synthesized water-like sound design.
- `src/data/references.ts`: numbered scientific references; original [1]–[8]
  preserved, with V2's policy and agriculture sources [9]–[11] retained.
- `public/media/manifest.json`: media selection/licensing source of truth.
- `src/styles/global.css`: full-screen editorial layouts, safe areas, responsive
  controls and reduced-motion styling.

The liquid is a perceptual 2D approximation, not computational fluid dynamics.
Its cross-sectional area tracks simulated volume; free-surface clipping follows
gravity. Transient surface waves add small decorative displacements. Actual optical
realism, thermal behavior and phone frame rates still need visual/device validation.

## Accessibility and interaction

Phone motion is opt-in. Denied permission, absent sensors or no readings leave a
slider and direct action available. Pointer dragging uses capture and disables
scrolling only over the interactive region. Page scrolling remains available
elsewhere. Keyboard sliders, explicit gesture alternatives, chapter skip/replay,
visible focus, status text and reduced-motion controls are included. No camera
permission is requested. Sound starts off and is enabled only through a button.

Chapters can be skipped without waiting. Sources are below the film and reachable
from the header and skip link, independent of completion. A generated no-JavaScript
fallback includes every scientific reference.

## Checks

```sh
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts the production preview under the repository subpath. It
covers pouring, drag/keyboard input, sensor permission/calibration, replay races,
field alternatives, cleanup, source access, reduced motion, ending/replay, local
requests, decoded media, and overflow at 320–1280 px. It must pass after media
acquisition before release. Read [V3-QA.md](docs/V3-QA.md) for executed results and
unverified checks; test code being present does not mean it has passed.

## GitHub Pages deployment

The existing pinned `.github/workflows/deploy.yml` deploys `main`. It now verifies
media records before tests/build/browser QA. No blank-media revision should publish.

After acquiring/inspecting media and passing the checks:

```sh
git add -A
git commit -m "Create documentary water experience with motion-driven liquid"
git push origin main
gh run list --workflow deploy.yml --limit 1
gh run watch <run-id> --exit-status
```

Verify https://capybarawombat.github.io/one-glass-of-water/ after the successful
Actions deployment, including real media playback, interactions and touch alternatives.
Do not claim deployment based on the build alone. Vercel/other static hosts can
serve `dist`, but should use `/` as the Vite base when hosted at their root.
