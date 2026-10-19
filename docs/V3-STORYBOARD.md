# V3 — Every glass has a story

## Audit

V2 is a React 19 / TypeScript / Vite app, deployed from `main` through the existing pinned GitHub Pages workflow. Its five SVG/CSS scenes, hold interaction, optional 19 MB model and extended infrastructure diagrams do not satisfy the new documentary brief. Reuse the reference data, secure external links, reduced-motion preference and deployment base. Replace the main story and motion hook. Remove camera/model loading from the experience; camera is not required for the five-chapter arc.

## Asset-backed edit (90–150 seconds, visitor-paced)

| Chapter | Intended time | Picture / verified license | Gesture and edit |
|---|---:|---|---|
| 01 · A glass away | 20–30 s | Original Canvas optical glass; digital simulation, not documentary | Tilt, pointer drag or slider changes a gravity-aligned free surface. Volume drains at the lower rim. A full-screen abstract water wipe ends before documentary imagery appears. |
| 02 · Not for everyone | 20–25 s | Anna Ridout / Oxfam East Africa: children carrying jerry cans, Wajir, 2011 · CC BY 2.0 | An unobstructed archival photograph, context and unobtrusive credit. 2.1 billion / 2024 / JMP 2025, then the human message. No water is composited onto people; no receiving-water event is fabricated. |
| 03 · A living landscape | 20–35 s | Bob Nichols / USDA: drought-affected Texas corn (2013); Lance Cheung / USDA: irrigated Woodland tomatoes (2015) · public domain. Optional real Schirmer Farms irrigation footage (2020), public domain. | Guide a digital stream across three ground positions by tilt or drag. Continuous wetting/runoff overlay; dissolve between unrelated real scenes, always labeled “Symbolic montage · different places and times.” No instant biological growth. |
| 04 · Beneath the surface | 20–30 s | Ivan Radic: river plastic (2021) · CC BY 2.0; Ivan Radic: close-up bottle photograph · CC BY 2.0 | Swipe three photographic object overlays away, or tap/remove via keyboard. The source photograph itself stays intact. As the overlays leave, “But clear water isn’t always safe water.” No implication that the real river has been cleaned. |
| 05 · The people behind it | 15–30 s | Moreau1: Blue Plains wastewater secondary treatment (2016), public domain; return to original Canvas glass | Protection, treatment and people. Three brief actor labels. The facility is explicitly wastewater treatment, not a drinking-water plant. Return to the full glass; sources / replay / UNICEF WASH. |

Transitions are brief dissolves and a single abstract water wipe. No timed gate is mandatory. Chapters can be skipped, revisited, or replayed. Main film uses one live scene at a time; references remain available independently below it. Sound is optional synthesized water-like ambience, labeled as sound design, never passed off as recorded location audio.

## Sourcing and ethics

`public/media/manifest.json` holds original pages, creators, organizations, reuse licenses, attribution, scene assignments and modifications. Source-page license details were checked with web research on 2026-10-19. No general permission to reuse UNICEF/WaterAid imagery is assumed. Oxfam's Commons/Flickr-reviewed CC BY photograph provides a permission-compatible archival alternative. No video of a child receiving water is licensed for this project; the honest alternative is a still photograph with an explicit symbolic transition.

Use `npm run assets:fetch` in a network-enabled environment to acquire originals through Commons metadata, validate licenses and generate optimized local assets. The app must never hotlink media. `npm run assets:verify` is a deployment gate: missing media must prevent publication. A failed media load shows typography and an honest unavailable-media notice, never a fake substitute.

## Current production blocker

This session's terminal cannot resolve network hosts, and elevated downloads are rejected by policy. Therefore the verified source media cannot yet be downloaded, optimized or visually inspected. The manifest records selections, not a claim that their bytes are present. Do not deploy this revision as the finished campaign until acquisition, visual framing, physical-device checks and browser QA have passed.
