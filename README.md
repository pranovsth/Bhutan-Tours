# Bhutan Tours

Run `npm.cmd install` and `npm.cmd run dev`, then open the local Vite URL.
Use `npm.cmd run build` for a production build.

The page reproduces **Desktop - 2 (3:289)** from the supplied Figma file at
its original 1600px-wide geometry on desktop. Below 1100px, the page switches to a readable layout
with flowing text, stacked content, swipeable holiday cards, and a collapsible
navigation menu. Desktop retains the original Figma composition, with additional
travel sections inserted after the prayer flags and before the footer. The three-column
trust panel is intentionally restyled as a responsive card section with clearer
copy and the same Abril Fatface, Noto Serif, burgundy, and ivory palette. The
featured tours section uses the original three photographs in a more readable
card layout. The original “Why Bhutan Tours Trip?” heading, copy, image composition,
and button are preserved. Guide and climate details follow in a separate,
clearly labelled travel essentials panel. Tour controls remain local portfolio
demonstrations.
Navigation stays visible while scrolling: phones and tablets keep their
logo-and-menu header, while desktop keeps the original-style contact strip and
navigation row. The menu is limited to Cultural Tours, Festival Tours,
Trekking, Bhutan Info, About, and Contact; its links remain portfolio demos.
The testimonial area uses one prominent, source-backed review instead of
repeating the same quote across three cards, with responsive editorial layout
and a decorative five-star rating.
The original prayer-flag artwork now divides Bhutan Tour Information from the
festival and travel tabs, on desktop and mobile. The footer follows Bhutan in a
Glance directly.
Bhutan Tour Information now uses one aligned image-and-content grid with evenly
spaced information rows. The flags begin directly beneath it, and GSAP gives
the artwork a smooth, visible sway without a raster-distorting filter.

`src/design/desktop-2.json` contains the original layer transforms and image
crops. `public/assets/figma` contains the original photographs and vector
exports. Desktop text uses the saved Figma letter outlines and line positions;
accessible text accompanies each layer. Mobile and tablet use the same copy
with locally bundled Noto Serif, Abril Fatface, and Inter webfonts.

All navigation, tour, and call-to-action buttons are portfolio demonstrations.
The newsletter accepts local input and sends nothing. Framer Motion supplies
press/hover feedback, GSAP supplies a subtle prayer-flag wave, and Three.js adds subtle
pointer depth to the original monastery cutout. The page returns to its source
appearance at rest and respects reduced-motion preferences.

The local source extraction can be repeated with `node scripts/inspect-fig.mjs`
and `node scripts/export-design.mjs` while `.fig-source/canvas.fig` and its image
directory are available. `node scripts/verify-browser.mjs` checks the running
site in Edge, including every layer's bounds, asset loading, dummy controls,
and responsive mode switching. `node scripts/verify-responsive.mjs` checks
phone, tablet, and desktop widths, text readability, menu controls, image
loading, and horizontal overflow.

The earlier website reference supplies the restored five-tab travel hub,
Electricity information row, and the facts and imagery in **Bhutan in a Glance**.
The Glance section presents its three images as a compact gallery and its seven
travel facts as a readable grid on desktop, tablet, and mobile.
These sections use the current burgundy/ivory palette and locally bundled
Abril Fatface and Noto Serif. Travel tabs support mouse, touch, and arrow-key
navigation; their call-to-action buttons remain portfolio demonstrations.
The three mosaic images are extracted from the supplied previous design by
`scripts/prepare-travel-assets.mjs`. The festival image already existed locally.
`node scripts/verify-travel-sections.mjs` checks these additions at five widths.

Travel content follows the [Department of Tourism visa guidance](https://bhutan.travel/visa),
[visitor FAQs](https://bhutan.travel/faqs),
[travel guidance](https://bhutan.travel/visit), and
[homestay and hotel guide](https://bhutan.travel/experiences-homestays-and-hotels).
Population is explicitly labelled as the 2025 projection, from the
[National Statistics Bureau Statistical Yearbook 2025](https://www.nsb.gov.bt/download/14525/).
The time zone is corrected to Bhutan Time (UTC +06:00).
