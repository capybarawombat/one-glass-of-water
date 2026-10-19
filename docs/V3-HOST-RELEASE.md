# Final V3 QA and GitHub Pages release — Arch host

Run outside Codex's restricted sandbox, in the regular Arch terminal. The existing
V3 implementation and all seven documentary assets are already committed at
`585467a6130a4358348f2dd26b35beb4bff3310a`. Do not rewrite that commit or redesign the
website. The current follow-up changes are QA tests and release documentation only.

## 1. Run the release checks

```bash
cd /extra/nh/one-glass-of-water
set -euo pipefail
gh auth status
npm ci
npx playwright install chromium
npm run assets:verify
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Stop on any failure. On Arch, if Chromium reports missing system libraries, install
the specific libraries reported by Playwright through pacman; do not use the
Debian-only `playwright install-deps` installer.

## 2. Inspect the actual rendered experience

In terminal A:

```bash
cd /extra/nh/one-glass-of-water
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

In terminal B:

```bash
xdg-open http://127.0.0.1:4173/one-glass-of-water/
```

Walk through all five scenes at desktop and 390×844 mobile viewport sizes. Inspect
these before release:

- The initially full glass remains steady; drag/slider causes sloshing, the water
  level decreases during pouring, the stream joins the lip, and the water wipe
  finishes before the real children's photograph appears.
- Wajir imagery and its credit are visible without text obscuring the children;
  no simulated water is composited onto people.
- The field gesture responds directly, the montage disclosure stays legible,
  recorded irrigation plays, and no photograph is described as instant restoration.
- Bottle overlays look like photographic objects, can be swiped/tapped away, and
  never imply the river is safe. If the crop looks visibly like a floating piece
  of a photograph, treat that as a visual defect and refine the crop before release.
- Closing transitions, sources, replay, keyboard focus and reduced-motion behavior
  work. Real phone motion still requires an HTTPS device test after deployment.

Press Ctrl+C in terminal A when finished. The automated suite starts its own
preview server and requires port 4173 to be free.

## 3. Review and commit the QA follow-up, then push

Only proceed after the checks and visual inspection pass.

```bash
cd /extra/nh/one-glass-of-water
set -euo pipefail
git status --short
git show --stat 585467a
git diff --check
git diff -- README.md docs/V3-QA.md public/ASSET-LICENSES.md tests/browser/journey.spec.ts
git add README.md docs/V3-QA.md docs/V3-HOST-RELEASE.md public/ASSET-LICENSES.md tests/browser/journey.spec.ts
git diff --cached --stat
git commit -m "Finalize V3 release QA and live verification tests"
git push origin main
release_sha=$(git rev-parse HEAD)
printf 'Release commit: %s\n' "$release_sha"

release_run=''
for attempt in {1..20}; do
  release_run=$(gh run list --repo capybarawombat/one-glass-of-water \
    --workflow deploy.yml --branch main --event push --commit "$release_sha" \
    --limit 1 --json databaseId --jq '.[0].databaseId // empty')
  if [ -n "$release_run" ]; then break; fi
  sleep 3
done
if [ -z "$release_run" ]; then
  echo 'No push-triggered deployment found. Inspect GitHub Actions before proceeding.' >&2
  exit 1
fi
gh run watch "$release_run" --repo capybarawombat/one-glass-of-water --exit-status
gh run view "$release_run" --repo capybarawombat/one-glass-of-water \
  --json databaseId,headSha,status,conclusion,url
```

A failed push or failed Actions run must stop the release. Do not force push.
The local remote-tracking ref was not refreshed in the sandbox and is not proof
of the current remote/deployment state.

## 4. Verify the deployed revision and media, then run live tests

```bash
cd /extra/nh/one-glass-of-water
set -euo pipefail
node --input-type=module <<'NODE'
import fs from 'node:fs';
import crypto from 'node:crypto';
const base='https://capybarawombat.github.io/one-glass-of-water/';
const localHTML=fs.readFileSync('dist/index.html','utf8');
const bundle=localHTML.match(/src="[^"]*\/assets\/([^\"]+\.js)"/)?.[1];
if(!bundle)throw Error('No local production bundle found');
const response=await fetch(base,{cache:'no-store',signal:AbortSignal.timeout(30000)});
if(!response.ok)throw Error(`Page returned HTTP ${response.status}`);
const html=await response.text();
if(!html.includes(bundle))throw Error(`Pages is not serving this build (${bundle}). Check deployment/caching; do not claim success.`);
const manifest=JSON.parse(fs.readFileSync('public/media/manifest.json','utf8'));
const records=JSON.parse(fs.readFileSync('public/media/acquisition.json','utf8'));
for(const asset of manifest){
  const result=await fetch(new URL(`media/${asset.filename}`,base),{signal:AbortSignal.timeout(30000)});
  if(!result.ok)throw Error(`${asset.filename}: HTTP ${result.status}`);
  const bytes=Buffer.from(await result.arrayBuffer());
  const sha=crypto.createHash('sha256').update(bytes).digest('hex');
  if(sha!==records[asset.id].sha256)throw Error(`${asset.filename}: deployed hash mismatch`);
  console.log(`Verified deployed media: ${asset.id}`);
}
console.log(`Verified current V3 bundle: ${bundle}`);
NODE
PLAYWRIGHT_BASE_URL=https://capybarawombat.github.io/one-glass-of-water/ npm run test:e2e
xdg-open https://capybarawombat.github.io/one-glass-of-water/
```

Finish with a live visual walkthrough, including phone tilt on an actual device.
Report the release SHA, Actions URL/conclusion, local/live test counts and visual
findings. A successful build alone is not proof that the updated site is live.
