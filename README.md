# SIXTY3W.E. Residences — sales instrument

A single-screen, non-scrolling presentation of SIXTY3W.E. Residences, Goregaon (E),
rebuilt from the project's own brochure. It is meant to be run fullscreen on a laptop at
a site office, and to work just as well handed to someone on a phone.

```bash
npm install
npm run dev        # http://localhost:5184
npm run build
```

---

## The three laws

**1. It never scrolls.** `src/styles/base.css` is the contract: `html`, `body` and `#root`
are locked to `100dvh` with `overflow: hidden`, and nothing else in the app sets a height.
The one exception is the Location panel's landmark list, which is a control surface inside
a panel already smaller than the viewport and is marked `data-scroll-ok`.

In development, `useOverflowGuard` walks every screen after fonts have loaded and the
transition has settled, and reports anything that escapes the viewport or introduces a
scroll container. Add `?overflow` to the URL to outline the offenders in magenta; findings
also land on `window.__W63__.overflows` so a headless sweep can assert on them.

**2. Fullscreen only.** `useFullscreen` prompts on entry and re-prompts every time
fullscreen is exited, freezing the app underneath with `gsap.globalTimeline.pause()`.
Where the API is unavailable or blocked, the app falls through to a locked `100dvh`
layout instead of trapping the visitor behind a prompt it cannot satisfy.

The freeze **must** stay a root pause. It was once `gsap.exportRoot()`, chosen so the
gate's own entrance — created after the freeze — would keep running while everything
older held still. That works exactly once. `exportRoot()` lifts the root's children onto
a new wrapper timeline and leaves it there; there is no un-export, and resuming the
wrapper does not dispose it. This app carries five infinite tweens (the control sheen,
the menu ring, the map halo, the Level 26 pulses), so the wrapper's duration is Infinity
and GSAP never auto-removes it. The next exit exported *that* wrapper into another one.
Measured over four exit/return cycles the global timeline's nesting depth went 1, 2, 3, 4
and never came back down, and every transition afterwards resolved its playhead through
that many re-timed parents — which is what "the transitions glitch after I come back from
fullscreen" actually was.

The consequence is that **the gate cannot use GSAP**, because it is the one surface that
must animate while GSAP is stopped. Its entrance is CSS, in `base.css`, keyed off
`#gate[data-open]`. That is the only exception to LAW 3, and it is structural.

The other half of the same problem is geometry: `archLayout()` cuts the arch panels in
real pixels for the viewport at build time, and leaving and re-entering fullscreen resizes
the viewport twice. A transition paused across that would resume sweeping a curtain cut
for a screen that no longer exists. `setPaused` compares the viewport on resume and
finishes such a transition where it stands instead.

**3. GSAP owns all motion.** Every animation goes through `useGSAP`. The only bare
`useEffect` in the codebase is in `src/hooks/useEventListener.js`; a grep for `useEffect`
outside that file should return nothing.

---

## The design system

Everything visual is measured off the brochure rather than chosen.

**The palette** is the cover's teal and its gold, sampled from the plates —
`src/styles/theme.css`. The ground is a gradient, not a flat fill, because the cover's is.

**The lattice.** No screen sits on a flat field. The brochure's cover carries a
tone-on-tone lattice under its aperture — the name itself, "3 W E", set in rounded cells and
tiled — and every screen carries the same texture as a static layer behind its content
(`.lattice` in `base.css`, rendered by `Screen`). It is rebuilt as a vector tile from the
cover plate rather than lifted from it, because the plate is a 142dpi JPEG and would go soft
at screen size. White and black at low strength, so it reads tone-on-tone on the teal, and strongest where the ground is lit, as on the cover. It does not move: the
arch transition carries a copy of each screen's ground, and a moving ground cannot match its
copy. Screens with a full-bleed render or the map simply cover it.

**The arch** is the logo, and it is the app's one shape. Its geometry is lifted straight
out of the PDF's path data: width 31.399, height 46.439, crown radius 9.909 (a true
circular quarter — the control offset is the circle kappa), three of them 23.217 apart so
they interlock, six ticks below sitting on the six arch legs. That ratio — radius ÷ width
= 0.31558 — is `--arch-crown`, and it is the only radius in the application. The `.crown`
utility applies it; the transition, the entry control and every framed render use it.

**The letterforms** in the lockup are Panton, which is not licensed here and is not being
substituted: `src/assets/brand/lockup.svg` is real vector lifted from the brochure.
`src/components/Lockup.jsx` composes it with the code-drawn arches in the same page-space
coordinate system, so the mark is exact at any size and the intro can stroke each arch on.

**The type** is Montserrat, which the brochure actually sets. The scale is
`clamp(min, min(Xvw, Yvh), max)`: the design target is 1920×1080, `vw` reproduces that
layout at every width, and the `vh` term keeps it honest on a short viewport, since the
app cannot scroll to absorb the difference. `Y` is set so the two terms are equal at 16:9.

**Breakpoints** are in `@theme`. `mob` (25rem) is the tightest phone step — 320–390px
hardware, where the lockup and the nav can no longer both be full size. General phone
layout keys off `max-md`.

---

## The transition

There is exactly one page transition, and it is the logo: three arch-shaped panels
standing side by side, outlined in gold, sweeping across the viewport. Direction carries
meaning, because the subject is a 31-storey tower — going deeper into the document moves
UP, coming back moves DOWN.

The panels carry a clone of the DESTINATION's ground (its render and scrims, with its copy
hidden by `CLONE_QUIET`), so the page you are arriving at assembles itself arch by arch and
then hands off, invisibly, to the live screen underneath. The outgoing screen is never
cloned; it recedes behind. A phone gets two panels rather than three: a third of a 390px
viewport is a stripe, not an arch, and it is a third less work.

Because the panels carry a copy of the destination's ground, **a screen's ground must
hold still for the length of a transition**. Location once broke this: it opened on the
brochure's aerial and swapped it for the map when MapLibre fired `load`, 300–600ms into a
1.5s transition, so the arches carried a photograph across a screen that had already
become a map. Holding the photograph until the transition ended only moved the seam. The
fix that held was removing the photograph — see *The map* below.

The clone is a STATIC copy, and it is taken in the tick the destination mounts. React
runs a child's effects before its parent's, so anything the destination animates on mount
has not run yet at that moment — and the copy keeps that first frame for the whole sweep
while the live screen underneath moves on. `Crossfade` fades its picture up only after
`decode()` resolves, so a faithful copy caught `opacity: 0` every time and the arches
carried the 20px poster across the viewport, badly out of focus, while the real render sat
decoded and invisible inside them. `cloneScreen` therefore lifts picture layers to their
resting state, but only where the source image has genuinely decoded — where it has not,
the clone keeps the poster and so does the live screen, so the two are at least wrong in
the same way.

That is the rule all three of these bugs come back to: **the destination must be in its
resting state before the arches carry it, and where it cannot be, the clone and the live
screen have to be wrong identically.**

`src/gsap/TransitionDirector.js` owns it. Every factory must leave a `swap` label — the
frame at which the state machine exchanges screens — and in development
`assertNoPostSwapTweens` proves nothing animates the outgoing screen after that frame.

---

## Assets

Every pixel comes from the brochure, and `scripts/ingest-assets.mjs` is the only way it
gets in. It pulls the embedded rasters out of the PDF with `mutool extract` (so the
photographs arrive without the page's overlaid type), crops the plan plates to the drawing,
writes a WebP ladder at 480/768/1200/1600/2000 and an inline 20px LQIP, and regenerates
`src/data/renders.js`.

```bash
node scripts/ingest-assets.mjs
```

A phone loads at most ~440 kB of imagery for the entire application.

Two coordinate sets are also lifted from the PDF's vector data rather than placed by eye:
the eighteen Level 26 callouts (`LEVEL26.spots`) and, previously, the Location leader
lines. Both derivations are documented where the numbers live.

---

## The map

`Location` runs a real MapLibre map of Goregaon East, drawn in the application's own
palette (`src/features/map/mapStyle.js`): the brand teal as the ground, deep teal water, a
road network that stays in the teal range with gold reserved for the Western Express
Highway and the trunk roads, cream labels, and Aarey as the one place the teal leans
green. Markers, the routed line and the distance rings are gold and cream on that teal —
the same pairing as every other screen — and the Location panel is glass, the app's own
material for a panel standing over content.

Two palettes came before this one and are worth not repeating. A near-black night map was
darker and muddier than the brand. An ivory plan sampled off page 20 of the brochure
matched the printed page and nothing on screen. The rule that came out of both: **the
map's colours come from the app's tokens, not from the brochure's map page.** Colour is
also the only thing the palette decides — the buildings are extruded and the camera opens
pitched and free to rotate, and those are separate decisions.

Tiles come from MapTiler when `VITE_MAPTILER_KEY` is set and from OpenFreeMap's free,
keyless planet tiles otherwise — both speak the OpenMapTiles schema, so the style is
identical either way and the app works with no signup and no key in the repo.

Clicking a landmark asks the public OSRM demo server for the real road route and draws it
with marching dashes. The developer's published drive time stays on every row; the routed
distance and duration appear beside it, never instead of it.

MapLibre is imported dynamically, so its megabyte stays out of the initial bundle and
loads only on the first visit to that screen. Until it lands, the screen shows `.w63-map`'s own
teal — the map's ground, not a spinner.

There is deliberately **no holding image** behind the map. This screen used to open on the
brochure's aerial of the same corridor and dissolve it once MapLibre fired `load`, and
every version of that was wrong the same way: the arch panels carry a clone of the screen,
and a ground that swaps photograph for map somewhere inside the transition can never match
the copy sweeping across it. A picture that exists only to be thrown away a moment later is
not worth one frame of mismatch.

> MapLibre is pinned to 5.x. From 6.0 the worker ships as a separate ESM file loaded by
> relative URL, which Vite's dependency pre-bundling does not copy into `.vite/deps` — the
> map then creates a canvas, never fires `load`, and shows as a black rectangle with one
> failed request and no error.

---

## Layout notes worth knowing

- **`useFitBox`** sizes a box to fit or fill its container at a fixed aspect ratio, in real
  pixels. CSS can express "fit inside this box" for a bare `<img>` and nothing else, and
  anything that has to line up with the picture — the Level 26 callouts, the plan sheet —
  needs the picture's real rectangle. Any track it measures must carry `min-w-0`: a `1fr`
  track floors at its own min-content width, so one wide measurement would otherwise
  ratchet the track permanently wider.
- **`Crossfade`** gates its fade on `img.decode()`. An `<img>` whose src is assigned
  imperatively can finish loading and still not paint, because the layer it lives in was
  promoted to the compositor and the decode never invalidates it. It also carries
  `isolate`: neither `position: absolute` nor `overflow: hidden` creates a stacking
  context, so without it the layer at `z-index: 2` joins the screen's stacking context and
  paints over every scrim.
- **`Preloader`** warms through a real `<img>` with the same `srcset` AND `sizes` the
  screen will use. Warming a render at some other width fills the cache with bytes nothing
  asks for and leaves the real request cold.
- **`--screen-margin` is a length, not a percentage,** and that is deliberate. A
  percentage resolves against a different base depending on where it lands: `padding`
  always resolves against the containing block's *inline* size, while `top`, `bottom` and
  `max-height` resolve against its *block* size. The rail insets itself with padding and
  the Location panel positions itself with `top`, so as a percentage the token meant 86px
  to one and 49px to the other at 1920×1080, and the panel's crown climbed into MENU and
  HOME — worse the wider the aspect ratio. `--chrome-top` is likewise floored at 2.9rem
  rather than following its `vw` line all the way down, because the control it reserves
  for stops shrinking first: `.eyebrow` hits its own clamp floor below ~1370px.
- **The `.crown` utility** is a percentage border-radius, which resolves *per axis* — the
  horizontal against width, the vertical against height. On a landscape box that reads as
  the arch; on a portrait one it is a tall ellipse that swallows the top of the box. Tall
  surfaces take the same ratio as an explicit length instead (see the Location panel), so
  the corner stays circular and still measures the mark.

---

## Type licensing

Montserrat and Pinyon Script load from Google Fonts (see the swap point in `index.html`).
The brochure also sets Gotham and Coronet; if either is licensed, add it ahead of the
current stack in `--font-display` / `--font-script` and nothing else changes. The lockup
needs no swap — it is vector.
