# V3 QA and release status

## Final-QA follow-up (latest)

- Existing V3 commit: `585467a6130a4358348f2dd26b35beb4bff3310a`; working tree
  was initially clean. Local `main` and cached `origin/main` point to this commit.
  This is not a fresh verification of the remote.
- All six required photographs and optional video are now present. Their SHA-256
  acquisition records and size limits pass `npm run assets:verify`. Recorded source
  metadata identifies the three Oxfam/Ivan Radic images as CC BY 2.0; the USDA and
  Moreau1 media as public domain. All six photographs were visually inspected.
- ffprobe confirms the video is H.264, 960×540, 12 seconds, 1,305,458 bytes.
- `npm run typecheck`, all 12 `npm test` checks, and `npm run build` pass.
- `npm run test:e2e` was attempted once and failed before test execution because
  its preview server could not start in the sandbox. Rendered-site inspection,
  glass realism and scene-transition assessment therefore remain unverified.
- The network-isolation browser test now derives its allowed origin from the
  configured base URL, so GitHub Pages itself is not falsely flagged as external.
  The photograph test polls for decoding instead of racing the network. These
  test fixes have not been executed in a browser here.
- Network/DNS remains blocked in this session; the host authentication reported
  by the user cannot be verified from the sandbox. `.git` is mounted read-only.
  No new commit, push, Actions monitoring or live verification was performed.
- Follow `V3-HOST-RELEASE.md` on the Arch host to finish and report the new commit,
  Actions run, visual inspection and live tests. The older record below is
  historical and its missing-media observations are superseded.

## Original implementation-session record

2026-10-19. Existing repository: `capybarawombat/one-glass-of-water`; branch `main`.

## Executed

- Existing V2 baseline: TypeScript checking, build and seven unit tests passed
  before changes, using the actual installed React dependencies.
- V3: `npm run typecheck` passed.
- V3: `npm run build` passed, including TypeScript and Vite production compilation.
- V3: 12 Node tests passed. Original service-state/reference checks are retained;
  new tests cover volume-area preservation through tilt, symmetric rim capacity,
  no water creation, frame-rate-independent drainage, screen orientation projection,
  chapter navigation and media-manifest integrity.
- React server-render smoke checks passed for all five scenes using esbuild and
  `react-dom/server`. This verifies renderability and heading IDs, not layout.
- `git diff --check` passed.
- Optional TensorFlow dependencies/model removed. Initial production JavaScript
  is approximately 84.24 KB gzip; CSS approximately 6.71 KB gzip. No optional 19 MB
  model remains. Media bytes cannot be measured until acquisition.
- Original eight sources plus V2's [9]–[11] remain numbered and linked.

## Blocked and not claimed

- **Media:** Commons license/source pages were researched via web tools. The real
  selected photo/video bytes are absent. Shell DNS fails; `npm run assets:fetch
  -- --only=community` fails with `fetch failed`. An elevated curl download was
  automatically rejected by the granular approval policy. No generated imagery,
  unverified hotlinks or existing screenshots were substituted.
- **Asset release gate:** `npm run assets:verify` correctly fails for all six
  required photographic files. Optional footage is also not present. This failure
  is intentional protection against publishing the incomplete media package.
- **Browser QA:** `npm run test:e2e` was attempted and failed before tests because
  Playwright's configured production web server could not start under the sandbox.
  No V3 browser tests, screenshots, measured overflow, touch behavior, visual liquid
  assessment, screen-reader pass, physical-device checks or Lighthouse result are
  claimed. V2 screenshots/records are historical and do not validate V3.
- **GitHub:** `gh auth status` reports its active token invalid; the sandbox also
  cannot reach api.github.com. The Pages API request failed to connect. Repository
  permissions and deployment status cannot be verified from this session.
- **Commit:** `git add -A` failed because `.git/index.lock` cannot be created on
  the read-only `.git` filesystem. No files were staged, no V3 commit was created
  and nothing was pushed. The public URL was also inaccessible through the web
  tool, so live verification is not claimed.

## Required before release

1. Acquire local media and metadata/hash records in a network-enabled environment.
2. Inspect each image and video, mobile crops, legibility and photographic bottle
   crop. Replace unsuitable photographic overlays with properly cut-out crops from
   the licensed original; do not substitute generated or vector litter.
3. Run the media gate, full tests, TypeScript build and browser suite.
4. Inspect the actual rendered glass and pouring effect; refine highlights,
   refraction and stream based on observed output, not assumptions.
5. Test real iPhone orientation permission, Android sensors, landscape changes,
   denied permissions, touch gestures, reduced motion and performance. Sensor unit
   tests and planned browser mocks are not hardware verification.
6. Commit/push the completed media-backed revision, wait for Actions, and inspect
   the updated public Pages URL. Current live content must not be called V3 until
   the new revision is verified there.
