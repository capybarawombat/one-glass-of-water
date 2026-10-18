# One Glass of Water

A mobile-first interactive editorial story about safely managed drinking water. Built with React, TypeScript, Vite, custom SVG illustrations, and CSS. No backend, analytics, hosted fonts, video, or runtime API calls. External requests occur only when a reader opens a source.

## Run

Requires Node.js 22.18+ (for native TypeScript test execution) and npm.

```sh
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run preview
```

Vite prints the local development URL. All interactions work offline once the document and bundled assets have loaded. This is not an installable offline PWA; opening a new session still requires access to the host.

## GitHub Pages deployment

Deployment is **blocked and unpublished**. No repository or public URL has been verified.
The saved GitHub CLI authentication is invalid; run `gh auth login` in your terminal.
This workspace's `.git` directory is read-only and contains no usable repository.
Use a workspace with writable Git metadata before initializing or committing.
The npm registry is unreachable here, so no lockfile could be generated and the
standard production build and browser verification remain blocked.

- Repository URL: pending authenticated repository inspection/creation.
- Published URL: pending a successful Pages deployment; do not use an assumed URL for a QR code.

The intended repository is `one-glass-of-water`. Vite uses
`base: '/one-glass-of-water/'`. If the actual repository name differs, update
that base and the Playwright preview URL. For a root Pages site or custom domain,
inspect the hosting configuration and use `/` where appropriate.
There is no client-side router: navigation uses document fragments.
Illustrations are inline SVG, fonts are local system fonts, and the favicon is local.

Before the first deployment, on a machine with npm registry access:

```sh
npm install --package-lock-only
npm ci
npm test
npm run typecheck
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Commit `package-lock.json` with the source and workflow. The workflow intentionally
uses `npm ci` and requires this lockfile; do not substitute an unpinned install.
It follows the [official Vite Pages workflow](https://vite.dev/guide/static-deploy#github-pages),
using pinned official actions, Node.js 24 LTS, separate build and deploy jobs,
Pages permissions, and serialized deployments. Only `dist` is published.
Pushes to the default branch build, validate, browser-test and deploy the site;
manual execution is available in Actions. Other branches skip deployment.

Enable publishing at Repository → Settings → Pages → Build and deployment →
Source → GitHub Actions. This setting has **not** been configured yet.
After the workflow succeeds, obtain the actual URL from Settings → Pages or the
`github-pages` environment and test that live URL before making a classroom QR code.

To update the website, edit the source, run the validation commands above,
commit, and push to the default branch. Watch the Deploy GitHub Pages run in Actions
or use `gh run watch RUN_ID --exit-status`.

If deployment fails, use `gh run view RUN_ID --log-failed`. For installation errors,
check that the lockfile is committed and matches `package.json`. For build failures,
run typecheck and build locally. For Pages permission errors, check the Actions
source setting and repository Actions permissions. For blank pages or asset 404s,
check the Vite base against the actual Pages URL and inspect browser network errors.
Never publish the existing `dist` as proof of a new build: it predates this deployment work.

## Architecture

- `src/App.tsx`: five-scene narrative, scene navigation, restart orchestration.
- `src/scenes/WaterJourney.tsx`: accessible button interactions, timed visual transitions, progress and announcements. Restart cancels pending transitions.
- `src/interactions/machine.ts`: explicit `intro → collect → treatment → testing → delivery → complete` reducer. Only the next state or a reset is accepted.
- `src/components/Illustrations.tsx`: locally rendered SVG glass, landscape, source, treatment, monitoring station, home, and fictional child.
- `src/components/ReferenceLibrary.tsx`: semantic numbered reference library and in-text citation links.
- `src/data/references.ts`: single source of truth for all eight supplied references and supplementary links.
- `src/data/content.ts`: interaction copy.
- `src/styles/global.css`: responsive layout, typography, animations, visible keyboard focus and reduced-motion overrides.

Buttons provide equivalent touch, mouse and keyboard input without requiring dragging. All narrative scenes and references are reachable without completing the journey. The experience has no scroll locking. Local system serif and sans-serif fonts keep the page independent of font services.

## Tests

```sh
npm test                 # state transitions, stage gating, resets and reference data
npx playwright install chromium
npm run build
npm run test:e2e         # starts the production preview under /one-glass-of-water/
```

The browser suite covers completion, restart (including during processing), reference presence and link attributes, keyboard input, reduced motion, and document overflow at 320, 360, 375, 390, 430, 768 and 1280 pixels.

### Verification in this implementation environment

- **Passed:** all five Node state-machine and data-integrity tests.
- **Passed with qualification:** Vite production bundling, using locally cached Vite 6.3.6 and a locally available Preact React-compatibility runtime for this environment only. This is a bundle/syntax check, not validation of the standard React dependency installation. The source and package manifest target React 19; no Preact aliases are committed in the configuration.
- **Blocked:** standard `npm install` could not resolve registry.npmjs.org under the sandbox's disabled network. Consequently a clean React 19 installation, full `npm run build`, and TypeScript checking could not be verified. The locally available editor runtime lacks React declaration packages, so its attempted typecheck was inconclusive.
- **Blocked:** Vite and Python HTTP servers could not create listening sockets (`EPERM`). Playwright/Brave launch also failed under socket restrictions. Browser end-to-end tests, screenshots, physical touch testing, measured overflow checks, screen-reader testing and Lighthouse scores remain unverified.
- **Verified via web tools:** all eight supplied source pages and both supplementary pages were reachable; some redirect to updated canonical locations. Original supplied URLs remain preserved. No supplied `.docx` existed in the repository.
- The World Bank page identifies the Vietnam indicator and 2024 series, but did not expose the numeric value in its text view. The requested approximately 59% is retained as the presentation's rounded figure, explicitly labeled. A separate World Bank API request was inaccessible through the web tool; it is not used by the app.

Run the clean installation, build, typecheck, and browser suite above before publication. The checked-in source is not dependent on the local QA fallback. No public deployment was made.

## Evidence and interpretation

WHO/UNICEF's 2025 report supports the global 2024 figures (2.1 billion; 60% rural and 83% urban). The national Vietnam service estimate and the rural program's improved-water-resource outcome are explicitly different indicators. The UNICEF drought example and World Bank program result retain their population, dates, and original citation numbers.

This is a conceptual simulation. Water appearance is not proof of safety. A positive simulated verification represents appropriate treatment, standards and continuing monitoring, not a universal guarantee from one test or a home filtration procedure. No scientific measurements are fabricated.

The story is designed for a quick scan and short interaction; reading every reference takes longer than the presentation's one-minute target.
