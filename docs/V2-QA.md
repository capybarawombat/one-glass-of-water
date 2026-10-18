# V2 QA record

Date: 2026-10-19. Production base: `/one-glass-of-water/`.

## Local verification

- Clean `npm ci`: passed. `npm audit`: zero reported vulnerabilities.
- Seven Node integrity tests: passed, including original service-state behavior
  and original eight references, V2 chapter navigation and bottle detection policy.
- `npm run typecheck`: passed.
- `npm run build`: passed using the declared React dependencies.
- `actionlint` 1.7.12: passed for the unchanged, pinned Pages workflow.
- Production browser suite: **25 passed**, 54.7 seconds.
- All five chapter layouts checked for document overflow at 320, 360, 375, 390,
  430, 768 and 1280 CSS pixels. Mobile (390×844) and desktop (1440×1000)
  screenshots inspected, including the field, camera, river and infrastructure.
- Initial JavaScript: approximately 87 KB gzip. CSS: approximately 7 KB gzip.
  The optional recognition chunk is ~233 KB gzip / 1.44 MB uncompressed. Vite
  reports a chunk-size warning for this intentionally lazy optional component.
- Self-hosted manifest and five model shards: 18,561,843 bytes. SHA-256 records
  are in `MODEL-SHA256.txt`. Initial page loading does not fetch these assets.

## Browser coverage

Hold timing, partial release/pause and completion; pointer and keyboard input;
manual crop controls; motion denial, absent sensors, smoothed mocked input and
calibration; listener removal; camera denial, explicit rear-camera/no-audio request;
late permission resolution; track cleanup on navigation, replay, restart and tab
hiding; model failure and late-model disposal; three stable mocked detections;
river dragging and keyboard collection; full story and system activation;
back/replay/restart; bibliography and subpath loading; reduced motion and all
seven viewport widths.

A separate **real model** test loads the bundled weights and performs inference
on a flat synthetic frame using the CPU backend with WebGL disabled. This verifies
model execution and fallback, not accuracy on bottles or camera hardware.
Sensor and camera lifecycle tests use browser mocks. No real camera photographs
are captured and no camera frames are uploaded.

## Visual evidence

- [Mobile opening](qa/mobile-opening.png)
- [Desktop opening](qa/desktop-opening.png)

All art is original illustration, not documentary evidence. Community art is
labeled accordingly in the experience. The original reference list is preserved
and supplemented with the Government of Vietnam strategy and World Bank project
approval/agriculture sources.

## Scope and limitations

No physical iPhone/Android test, Safari device test, screen-reader audit, measured
battery/thermal test or Lighthouse score is claimed. General bottle recognition
is fallible and its real-world accuracy has not been quantified for this site.
The model download is optional and disclosed; manual continuation is available
while it loads, if loading fails, and on slow or unsupported devices.

## Deployment verification

Pending the successful local browser suite, existing GitHub Pages workflow and
post-publication live-site tests. Do not treat the intended URL as proof of release.
