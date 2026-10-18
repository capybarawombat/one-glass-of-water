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

The React/Vite source is stored directly in this project directory; no transfer is needed.
The host GitHub CLI authenticates successfully as `capybarawombat`. The sandbox
has isolated credentials and read-only Git metadata, so Git and authenticated
GitHub operations must run on the writable host.

- Repository: https://github.com/capybarawombat/one-glass-of-water
- Intended Pages URL: https://capybarawombat.github.io/one-glass-of-water/
- Deployment status: see the latest **Deploy GitHub Pages** Actions run. A URL
  alone is not evidence that publication has completed.

The intended repository is `one-glass-of-water`. Vite uses
`base: '/one-glass-of-water/'`. If the actual repository name differs, update
that base and the Playwright preview URL. For a root Pages site or custom domain,
inspect the hosting configuration and use `/` where appropriate.
There is no client-side router: navigation uses document fragments.
Illustrations are inline SVG, fonts are local system fonts, and the favicon is local.

The lockfile is included. Validate on the host with Node.js 24:

```sh
npm ci
npm test
npm run typecheck
npm run build
npx playwright install chromium
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
Source → GitHub Actions. The deployment procedure configures this through the GitHub API.
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

### Verification

The standard React installation, five integrity tests, TypeScript checks and
production build passed. The dependency lockfile uses compatible patched versions;
`npm audit` reported zero vulnerabilities after installation.

The workflow runs the production browser suite before deploying. It checks the
complete journey, restart, keyboard input, reduced motion, all eight references,
and overflow at 320, 360, 375, 390, 430, 768 and 1280 pixels.

To run the same suite against the published site:

```sh
PLAYWRIGHT_BASE_URL=https://capybarawombat.github.io/one-glass-of-water/ npm run test:e2e
```

The local browser checks emulate viewport widths; physical device and screen-reader
testing are separate checks. No Lighthouse score is claimed.

## Evidence and interpretation

WHO/UNICEF's 2025 report supports the global 2024 figures (2.1 billion; 60% rural and 83% urban). The national Vietnam service estimate and the rural program's improved-water-resource outcome are explicitly different indicators. The UNICEF drought example and World Bank program result retain their population, dates, and original citation numbers.

This is a conceptual simulation. Water appearance is not proof of safety. A positive simulated verification represents appropriate treatment, standards and continuing monitoring, not a universal guarantee from one test or a home filtration procedure. No scientific measurements are fabricated.

The story is designed for a quick scan and short interaction; reading every reference takes longer than the presentation's one-minute target.
