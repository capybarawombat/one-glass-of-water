# One Glass of Water V3 — media and software

The asset catalogue is [media/manifest.json](media/manifest.json). It records the
original source URL, photographer, source organization, reuse license, attribution,
context, scene assignment, and modifications for every selected photograph/video.
Detailed credits are also visible in the website's Sources section.

## Documentary selections

- **Wajir, Kenya, 2011:** Anna Ridout / Oxfam East Africa. Children carrying water
  containers. CC BY 2.0; Commons records a Flickr license review. This is archival
  photography, not evidence that the visitor delivered water to anyone.
- **Drought-affected Texas corn, 2013:** Bob Nichols / USDA. Public domain,
  official US federal government work.
- **Drip-irrigated Woodland tomatoes, 2015:** Lance Cheung / USDA. Public domain,
  official US federal government work.
- **River plastic, 2021:** Ivan Radic. CC BY 2.0; Commons records a Flickr license
  review. The river's location is not specified by the source.
- **Close-up of a floating plastic bottle, 2021:** Ivan Radic. CC BY 2.0.
  Feathered photographic crops are used as symbolic removable overlays. The
  original river photograph is not cleaned, retouched or presented as restored.
- **Blue Plains treatment facility, 2016:** Moreau1. Released into the public
  domain worldwide by its creator. This is wastewater secondary treatment, not
  a drinking-water plant.
- **Schirmer Farms pivot irrigation, Texas, 2020:** Lance Cheung / USDA. Public
  domain, official US federal government work. Optional recorded video excerpt;
  a photograph remains available when playback fails or motion is reduced.

All photographs are resized/converted to WebP; display framing may crop the image.
The optional video is excerpted, silenced and transcoded without changing speed.
Separate digital water, text and gesture layers are not documentary evidence.
The agricultural dissolve is explicitly labeled as a symbolic montage of different
places and times. No real person is shown interacting with simulated water.
Photographers and organizations do not endorse this experience.

## Acquisition status

Source pages and stated licenses were researched on 2026-10-19. The terminal's
network restrictions prevented downloading these files in this implementation
session. A listing here is **not** a claim that a media file has been acquired.
Run `npm run assets:fetch` in a network-enabled environment. It validates returned
license metadata, optimizes local files and saves original metadata plus SHA-256
hashes in `media/acquisition.json`. `npm run assets:verify` blocks publication if
required files or their records are missing. No unverified remote media URLs are
embedded in the page.

## Original code and sound design

The Canvas glass, approximate liquid simulation, digital irrigation stream, and
abstract water transition are original software effects. They are labeled symbolic.
Optional ambience is synthesized water-like noise after user activation, not a
recording from any depicted location. No generated people, generated documentary
media, AI landscape imagery, stock watermarks or third-party brand logos are used.

React / React DOM: MIT. Lucide: ISC. Vite: MIT. TypeScript: Apache-2.0.
The V2 TensorFlow model and its dependency chain are removed from V3.
