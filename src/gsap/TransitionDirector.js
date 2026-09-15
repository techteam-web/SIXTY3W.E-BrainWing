// THE ARCH — the one page transition in this application, and the machinery that plays it.
//
// The logo is three overlapping arches. At viewport scale, three arch-shaped panels
// standing side by side, outlined in gold, ARE that mark — so the transition is the
// brand drawing itself across the screen rather than a wipe borrowed from somewhere else.
//
// Direction carries meaning, because the subject is a 31-storey tower: going deeper into
// the document moves UP (the arches rise from below, crowns leading), coming back moves
// DOWN (the arches descend, crowns leading the other way). One mechanism, two directions.
//
// The panels carry a clone of the DESTINATION's ground — its render and its scrims, with
// its copy hidden — so the page you are arriving at assembles itself arch by arch and
// then hands off, invisibly, to the live screen underneath. The outgoing screen is never
// cloned at all.
//
// Every factory here mutates a timeline the director hands it and must leave behind a
// label called 'swap' — the frame at which the state machine exchanges screens.
//
// THE INVARIANT that makes the imperative swap safe: nothing of the outgoing screen is
// visible at the 'swap' label, and no tween targets it at or after that label.
// assertNoPostSwapTweens enforces the second half in development.

import { gsap, SplitText, D, E, prefersReducedMotion, durationScale, canBlur } from './Gsapconfig';

/* ------------------------------------------------------------------ helpers */

const q = (root, sel) => (root ? Array.from(root.querySelectorAll(sel)) : []);

// Several markers are legitimately optional per screen — the landing has no rule, Floor
// Plans has no [data-headline], and so on. GSAP logs "target not found" for a null or
// empty target, which would train everyone to ignore its warnings. Falling back to a
// detached element keeps the timeline's shape and stays silent: it accepts every CSS
// property GSAP might set and is never in the document.
const INERT = typeof document === 'undefined' ? {} : document.createElement('div');
const some = (...targets) => {
  const list = targets.flat().filter(Boolean);
  return list.length ? list : INERT;
};

const has = (t) => (Array.isArray(t) ? t.length > 0 : !!t);
const to = (tl, targets, vars, pos) => (has(targets) ? tl.to(targets, vars, pos) : tl);
const set = (tl, targets, vars, pos) => (has(targets) ? tl.set(targets, vars, pos) : tl);

// A masked line reveal. The mask opens from the bottom, so text wipes up into place.
const LINE_HIDDEN = 'inset(0 0 100% 0)';
const LINE_SHOWN = 'inset(0 0 -12% 0)';

// SplitText instances must be reverted or the DOM keeps its wrapper spans. The director
// collects them and reverts on completion.
function splitLines(el, cleanups) {
  if (!el) return [];
  const split = new SplitText(el, { type: 'lines', linesClass: 'reveal-line' });
  cleanups.push(() => split.revert());
  return split.lines;
}

/* ------------------------------------------------------------ arch geometry */

// One source of truth for the arch, and it is the stylesheet — see --arch-* in
// theme.css, where the numbers are derived from the logo's own path data. Read live so
// a change to the tokens moves the CSS arches and the JS-driven ones together.
function archRatio() {
  if (typeof window === 'undefined') return 0.31558;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--arch-crown');
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0.31558;
}

// The panels' layout. Recomputed per transition because it depends on the viewport, and
// applied with gsap.set — never authored in CSS, where it could go stale on a resize.
//
// A phone gets two arches rather than three. Not for looks: each panel holds a clone of
// the destination, and a third of a 390px viewport is a 130px-wide arch, which reads as
// a stripe rather than as the mark. Two panels are both a better shape at that width and
// a third less work.
function archLayout() {
  const W = window.innerWidth || 1;
  const H = window.innerHeight || 1;
  const n = W < 768 ? 2 : 3;
  const pw = W / n;
  // The crown is the logo's ratio of the panel's own width, capped so a very short
  // viewport never gets an arch taller than the screen it is crossing.
  const r = Math.min(pw * archRatio(), H * 0.4);
  return { W, H, n, pw, r };
}

/* -------------------------------------------------------------------- clones */

// Content the destination re-composes for itself once the arches have landed. Hidden in
// the clone so the panels carry only the page's ground — its render, its scrims, its
// furniture — and the copy arrives live rather than sliding in pre-drawn.
const CLONE_QUIET =
  '[data-menu-row],[data-menu-brand],[data-menu-rule],[data-landing-line],' +
  '[data-landing-eyebrow],[data-landing-meta],[data-landing-note],[data-lockup],' +
  '[data-enter],[data-headline],[data-stagger]';

// A screen, frozen. The original may be mid-tween and carrying inline transform and
// opacity from GSAP; .arch-panel-view > * in base.css resets all of that, so the clone
// only has to be structurally faithful.
function cloneScreen(el) {
  if (!el) return null;
  const clone = el.cloneNode(true);

  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden', 'true');
  for (const n of clone.querySelectorAll('[id]')) n.removeAttribute('id');
  for (const n of clone.querySelectorAll('button, a, input, [tabindex]')) {
    n.setAttribute('tabindex', '-1');
  }
  for (const n of clone.querySelectorAll(CLONE_QUIET)) n.style.visibility = 'hidden';

  // The destination's picture layers, forced to the state they are ABOUT to be in.
  //
  // Crossfade fades a layer up only once decode() resolves, and React runs a child's
  // effects before its parent's — so the destination's pictures are always still at
  // opacity 0 in the tick this clone is taken. A clone is a static copy and never
  // catches up, so the arches would carry the 20px poster for the whole sweep while the
  // live screen underneath reached full opacity at ~360ms. Measured on Residences: the
  // image reported complete at 1920px in every panel while its layer sat at opacity 0
  // for all 1.6s of the curtain, which is why the transition looked badly out of focus.
  //
  // Only layers whose real image has actually decoded are lifted. Where it genuinely has
  // not arrived, the clone keeps the poster — and so does the live screen, so the two
  // still agree.
  const srcLayers = el.querySelectorAll('[data-fade-layer]');
  const dstLayers = clone.querySelectorAll('[data-fade-layer]');
  for (let i = 0; i < dstLayers.length; i += 1) {
    const img = srcLayers[i]?.querySelector('img');
    if (!img?.complete || !img.naturalWidth) continue;
    dstLayers[i].style.opacity = '1';
    dstLayers[i].style.visibility = 'visible';
  }

  // cloneNode copies a canvas element but never its pixels.
  const src = el.querySelectorAll('canvas');
  const dst = clone.querySelectorAll('canvas');
  for (let i = 0; i < dst.length; i += 1) {
    if (!src[i]?.width || !src[i]?.height) continue;
    try {
      dst[i].width = src[i].width;
      dst[i].height = src[i].height;
      dst[i].getContext('2d')?.drawImage(src[i], 0, 0);
    } catch {
      /* tainted or context-less — it simply arrives blank */
    }
  }
  return clone;
}

const emptyNode = (el) => {
  while (el?.firstChild) el.removeChild(el.firstChild);
};

/* ------------------------------------------------------------- the aperture */

// Where the aperture opens: around whatever the arriving screen is ABOUT — the menu's
// circle, the plan sheet, the Level 26 plate, the amenity window, the tower in a
// full-bleed render — which the screen marks with [data-ring-focus]. A screen with no one
// subject (a room filling the frame, the map, the specification panels) gets the centre
// of the viewport.
//
//   data-ring-focus="ring"        the node IS a dotted ring (the menu's aperture), and the
//                                 transition's ring takes exactly its place and size, so
//                                 the one lands on the other.
//   data-ring-focus               the node is the subject, and the ring's clear centre is
//                                 sized to it.
//   data-ring-box="x0 y0 x1 y1"   with it: the subject is that part of the PICTURE the node
//                                 holds, in fractions of the image, mapped through
//                                 object-fit: cover and the image's object-position.
//
// Measured once, at build time, before the destination is staged — so from boxes at rest,
// and with the node's own transform taken back out: the plan sheet arrives on an xPercent
// slide, and the ring belongs where the sheet will be, not where its entrance has it.

// The ring's clear centre as a fraction of its diameter: the mask's inner stop in
// .aperture-ring.
const RING_CLEAR = 0.62;

function objectPosition(value) {
  const named = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
  const [a = 'center', b = 'center'] = String(value || 'center').trim().split(/\s+/);
  const pct = (word) => (word in named ? named[word] : parseFloat(word)) / 100;
  const x = pct(a);
  const y = pct(b);
  return [Number.isFinite(x) ? x : 0.5, Number.isFinite(y) ? y : 0.5];
}

function ringFocus(el) {
  const W = window.innerWidth || 1;
  const H = window.innerHeight || 1;
  const centre = { x: W / 2, y: H / 2, d: Math.min(W, H) * 1.04 };
  const node = el?.querySelector('[data-ring-focus]');
  const w = node?.offsetWidth ?? 0;
  const h = node?.offsetHeight ?? 0;
  if (!(w > 1 && h > 1)) return centre;

  // offsetWidth/Height are the layout box, untouched by transforms; the rect's centre
  // less the node's own translation is that box's centre at rest.
  const t = getComputedStyle(node).transform;
  const m = t && t !== 'none' ? new DOMMatrixReadOnly(t) : null;
  const rect = node.getBoundingClientRect();
  const left = rect.left + rect.width / 2 - (m?.m41 ?? 0) - w / 2;
  const top = rect.top + rect.height / 2 - (m?.m42 ?? 0) - h / 2;

  if (node.dataset.ringFocus === 'ring') return { x: left + w / 2, y: top + h / 2, d: w };

  let box = { left, top, w, h };
  const frac = node.dataset.ringBox?.split(/\s+/).map(Number);
  const img = frac?.length === 4 && frac.every(Number.isFinite) ? node.querySelector('img') : null;
  const iw = Number(img?.getAttribute('width')) || img?.naturalWidth || 0;
  const ih = Number(img?.getAttribute('height')) || img?.naturalHeight || 0;
  if (iw && ih) {
    const s = Math.max(w / iw, h / ih);
    const rw = iw * s;
    const rh = ih * s;
    const [px, py] = objectPosition(img.style.objectPosition);
    const x0 = left + (w - rw) * px;
    const y0 = top + (h - rh) * py;
    box = {
      left: x0 + frac[0] * rw,
      top: y0 + frac[1] * rh,
      w: (frac[2] - frac[0]) * rw,
      h: (frac[3] - frac[1]) * rh,
    };
  }

  // A subject the layout has put out of frame — the phone's Overview shows the sky, not
  // the tower — has nothing on screen to open around.
  const cx = box.left + box.w / 2;
  const cy = box.top + box.h / 2;
  if (cx < 0 || cx > W || cy < 0 || cy > H) return centre;

  // Sized to the subject's area rather than its long side, so a tall tower or a wide plan
  // is circled through its middle instead of by a ring twice the height of the screen.
  const d = Math.min(
    Math.max(Math.sqrt(box.w * box.h) / RING_CLEAR, Math.min(W, H) * 0.5),
    Math.max(W, H) * 1.6,
  );
  return { x: cx, y: cy, d };
}

// Written straight onto the element: the ring is invisible between transitions, so there
// is nothing to animate from one placement to the next.
function placeRing(ring, { x, y, d }) {
  gsap.set(ring, { left: x - d / 2, top: y - d / 2, width: d, height: d });
}

/* ----------------------------------------------------------------- the cut */

function theArch(ctx, dir) {
  const { outEl, inEl, chrome, tl, cleanups } = ctx;
  const root = chrome.cut;
  const panels = (chrome.panels ?? []).filter(Boolean);
  const ring = chrome.ring ?? null;
  // First, while the destination is still at rest — see ringFocus.
  const focus = ring ? ringFocus(inEl) : null;

  // Nothing to cut with, or nothing to carry: fall back rather than play half of one.
  if (!root || panels.length < 2 || !inEl) return crossfade(ctx);

  const up = dir === 'up';
  const { W, H, n, pw, r } = archLayout();
  const live = panels.slice(0, n);
  const spare = panels.slice(n);
  const travel = H + r + 2;

  // Self-healing: a killed timeline (StrictMode's mount → cleanup → mount) never runs
  // its cleanups, so clear whatever the last build left behind before refilling.
  for (const p of panels) emptyNode(p.querySelector('[data-panel-view]'));

  live.forEach((panel, i) => {
    const left = i * pw;
    const view = panel.querySelector('[data-panel-view]');
    const crown = panel.querySelector('[data-panel-crown]');

    gsap.set(panel, {
      left: left - 0.5,
      width: pw + 1,
      // The crown leads, so it sits on whichever edge is in front: the top going up, the
      // bottom coming down. The panel overhangs the viewport by the crown's own radius
      // so that at rest the curve is off-stage and the three panels read as one plate.
      top: up ? -r : 0,
      height: H + r,
      borderTopLeftRadius: up ? r : 0,
      borderTopRightRadius: up ? r : 0,
      borderBottomLeftRadius: up ? 0 : r,
      borderBottomRightRadius: up ? 0 : r,
      autoAlpha: 1,
      y: up ? travel : -travel,
    });

    // The gold outline. Three adjacent arch outlines with their legs showing IS the
    // lockup — so the panels are not merely arch-shaped, they spell the mark.
    gsap.set(crown, {
      autoAlpha: 1,
      background: up
        ? `linear-gradient(180deg, rgb(var(--gold-rgb) / 0.42) 0%, rgb(var(--gold-rgb) / 0.14) ${Math.round((r / H) * 150)}%, transparent 64%)`
        : `linear-gradient(0deg, rgb(var(--gold-rgb) / 0.42) 0%, rgb(var(--gold-rgb) / 0.14) ${Math.round((r / H) * 150)}%, transparent 64%)`,
    });

    // The clone is viewport-sized and shifted back by this panel's own offset, so the
    // panels together reassemble one continuous page rather than three copies of a crop.
    gsap.set(view, { left: -(left - 0.5), top: up ? r : 0, width: W, height: H });
    const clone = cloneScreen(inEl);
    if (clone) view.appendChild(clone);
  });

  gsap.set(spare, { autoAlpha: 0 });
  cleanups.push(() => {
    for (const p of panels) emptyNode(p.querySelector('[data-panel-view]'));
  });

  // Panel 0 leads and the rest follow, so the mark sweeps rather than snapping — the
  // same left-to-right read as the printed lockup.
  const step = 0.075;
  const lastIn = (n - 1) * step;

  tl.set(root, { autoAlpha: 1 })
    // The destination is live and underneath from the first frame, staged. The gap
    // between the rising panels therefore shows the page being arrived at, not an empty
    // stage — and the hand-off at the end is between two identical grounds.
    .set(inEl, { autoAlpha: 1, zIndex: 1, scale: 1, filter: 'none' })
    .set(some(outEl), { zIndex: 2, transformOrigin: '50% 50%' });

  stageIncoming(tl, inEl, cleanups, 0);

  // The page being left recedes rather than being covered — it reads as an arrival
  // instead of an interruption. Blur is desktop-only: on a phone a full-viewport
  // Gaussian re-raster per frame is the single largest source of stutter there is.
  to(
    tl,
    some(outEl),
    {
      scale: up ? 1.07 : 0.955,
      autoAlpha: 0,
      ...(canBlur() ? { filter: 'blur(14px)' } : {}),
      duration: 0.82,
      ease: E.in,
    },
    0,
  );

  // The arches travel.
  tl.to(
    live,
    { y: 0, duration: 1.18, ease: E.out, stagger: { each: step, from: 'start' } },
    0.06,
  );

  // The aperture: the brochure's ring of gold dots, opening around the arriving screen's
  // subject as the arches land. Transform and opacity only, on a single rasterised layer.
  if (ring) {
    placeRing(ring, focus);
    tl.set(ring, { autoAlpha: 0, scale: up ? 0.55 : 1.5, rotate: up ? -14 : 14 })
      .to(ring, { autoAlpha: 0.6, scale: up ? 1.08 : 1.02, rotate: 0, duration: 1.05, ease: E.out }, 0.1)
      .to(ring, { autoAlpha: 0, scale: up ? 1.5 : 0.6, duration: 0.7, ease: E.in }, 1.05);
  }

  tl.addLabel('swap', 0.92 + lastIn)
    // The hand-off. Both layers are the same picture, so the crossfade cannot be seen.
    .to(live, { autoAlpha: 0, duration: 0.34, ease: 'none' }, 1.06 + lastIn)
    .set(root, { autoAlpha: 0 }, 1.5 + lastIn);

  revealIncoming(tl, inEl, 1.0 + lastIn);
  return tl;
}

export const archRise = (ctx) => theArch(ctx, 'up');
export const archFall = (ctx) => theArch(ctx, 'down');

/* ------------------------------------------------- the destination composing */

// One vocabulary, every screen: whatever markers a screen happens to carry are the ones
// that move. A screen that carries none simply arrives — the arches are the animation
// there.
function partsOf(el) {
  // A landing headline marks its own lines, so it must not also be run through
  // SplitText — the two would fight over the same nodes.
  const landing = q(el, '[data-landing-line]');
  return {
    headline: landing.length ? null : (el?.querySelector('[data-headline]') ?? null),
    stagger: q(el, '[data-stagger]'),
    rows: q(el, '[data-menu-row]'),
    spine: el?.querySelector('[data-menu-rule]') ?? null,
    brand: el?.querySelector('[data-menu-brand]') ?? null,
    landing,
    eyebrow: el?.querySelector('[data-landing-eyebrow]') ?? null,
    meta: el?.querySelector('[data-landing-meta]') ?? null,
    // The fixed corner lockup never animates on a page change — see BrandCorner — so it
    // is excluded here and simply sits at full opacity from first paint.
    lockup: el?.querySelector('[data-lockup]:not([data-corner-mark])') ?? null,
    enter: el?.querySelector('[data-enter]') ?? null,
    note: el?.querySelector('[data-landing-note]') ?? null,
  };
}

const STAGED = new WeakMap();

function stageIncoming(tl, inEl, cleanups, at) {
  if (!inEl) return;
  const p = partsOf(inEl);
  p.lines = splitLines(p.headline, cleanups);
  STAGED.set(inEl, p);

  set(tl, p.lines, { clipPath: LINE_HIDDEN }, at);
  set(tl, p.stagger, { y: 26, autoAlpha: 0 }, at);
  set(tl, p.rows, { autoAlpha: 0, y: 26 }, at);
  set(tl, some(p.spine), { scaleY: 0, transformOrigin: 'top center' }, at);
  set(tl, some(p.brand), { autoAlpha: 0, y: 14 }, at);
  set(tl, p.landing, { autoAlpha: 0, y: 26 }, at);
  set(tl, some(p.eyebrow), { autoAlpha: 0, y: 10 }, at);
  set(tl, some(p.meta), { autoAlpha: 0, y: 14 }, at);
  set(tl, some(p.lockup), { autoAlpha: 0, y: 16 }, at);
  set(tl, some(p.enter), { autoAlpha: 0, y: 12 }, at);
  set(tl, some(p.note), { autoAlpha: 0, y: 12 }, at);
}

function revealIncoming(tl, inEl, at) {
  const p = inEl ? STAGED.get(inEl) : null;
  if (!p) return;

  to(tl, p.lines, { clipPath: LINE_SHOWN, duration: 0.85, stagger: 0.08 }, at + 0.06);
  to(tl, p.stagger, { y: 0, autoAlpha: 1, duration: 0.8, stagger: D.stagger }, at + 0.18);

  // The menu's spine stands up first and the rows unfold off it.
  to(tl, some(p.spine), { scaleY: 1, duration: 0.9 }, at - 0.12);
  to(tl, p.rows, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.055 }, at + 0.06);
  to(tl, some(p.brand), { autoAlpha: 1, y: 0, duration: 0.7 }, at + 0.04);

  to(tl, some(p.eyebrow), { autoAlpha: 1, y: 0, duration: 0.8 }, at);
  to(tl, p.landing, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, at + 0.08);
  to(tl, some(p.lockup), { autoAlpha: 1, y: 0, duration: 0.8 }, at + 0.1);
  to(tl, some(p.meta), { autoAlpha: 1, y: 0, duration: 0.75 }, at + 0.3);
  to(tl, some(p.enter, p.note), { autoAlpha: 1, y: 0, duration: 0.7 }, at + 0.44);
}

/* ---------------------------------------------------------------- factories */

// Used for every in-screen layer swap: plate-to-plate in Floor Plans, room-to-room in
// Residences. No arches — these are not page changes, and reusing the page transition
// for them would flatten the difference between moving through the document and moving
// inside one screen.
export function plateSlide({ outEl, inEl, tl, opts = {} }) {
  const dir = opts.direction === 'back' ? -1 : 1;

  tl.set(inEl, { autoAlpha: 0, zIndex: 2, xPercent: 6 * dir, scale: 1.03 })
    .set(some(outEl), { zIndex: 1 })
    .to(some(outEl), { xPercent: -5 * dir, autoAlpha: 0, duration: 0.46, ease: E.in }, 0)
    .addLabel('swap', 0.26)
    .set(inEl, { autoAlpha: 1 }, 'swap')
    .to(inEl, { xPercent: 0, scale: 1, duration: 0.72 }, 'swap');

  return tl;
}

// Fullscreen granted → the landing. ~4.6s, runs once, and it is the only place the
// lockup is ever drawn rather than simply shown: the three arches stroke themselves in,
// the aperture opens around them, and the mark then travels to the corner it lives in
// for the rest of the session.
export function introSequence({ inEl, chrome, tl }) {
  const arches = q(inEl, '[data-lockup]:not([data-corner-mark]) [data-arch-path]');
  const ticks = q(inEl, '[data-lockup]:not([data-corner-mark]) [data-tick]');
  const type = q(inEl, '[data-lockup]:not([data-corner-mark]) [data-lockup-type]');
  const lockup = inEl?.querySelector('[data-lockup]:not([data-corner-mark])') ?? null;
  const ring = chrome.ring ?? null;
  const eyebrow = inEl?.querySelector('[data-landing-eyebrow]') ?? null;
  const hero = inEl?.querySelector('[data-hero]') ?? null;
  const scrim = inEl?.querySelector('[data-scrim]') ?? null;
  const meta = inEl?.querySelector('[data-landing-meta]') ?? null;
  const enter = inEl?.querySelector('[data-enter]') ?? null;
  const note = inEl?.querySelector('[data-landing-note]') ?? null;
  const lines = q(inEl, '[data-landing-line]');

  // Stroke-draw needs a measured length per arch.
  for (const p of arches) {
    const len = typeof p.getTotalLength === 'function' ? p.getTotalLength() : 0;
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  }

  // The mark starts centred in the viewport and travels to its landing position. Its
  // rest position is wherever the layout puts it, so the offset is measured rather than
  // authored — and measured after fonts are ready, which the gate guarantees.
  const travel = { x: 0, y: 0, scale: 1 };
  if (lockup) {
    const r = lockup.getBoundingClientRect();
    travel.x = window.innerWidth / 2 - (r.left + r.width / 2);
    travel.y = window.innerHeight / 2 - (r.top + r.height / 2);
    travel.scale = Math.min(2.6, (window.innerWidth * 0.3) / Math.max(r.width, 1));
  }

  tl.set(inEl, { autoAlpha: 1, zIndex: 2 })
    .set(some(lockup), { autoAlpha: 1, x: travel.x, y: travel.y, scale: travel.scale })
    .set(some(type), { autoAlpha: 0, y: 6 })
    .set(some(ticks), { scaleY: 0, transformOrigin: 'top center' })
    .set(some(hero, scrim), { autoAlpha: 0 })
    .set(some(hero), { scale: 1.14 })
    .set(some(eyebrow), { autoAlpha: 0, letterSpacing: '1.1em' })
    .set(some(meta, enter, note), { autoAlpha: 0, y: 14 })
    .set(lines.length ? lines : INERT, { autoAlpha: 0, y: 26 });

  if (ring) {
    // Centred: here the subject is the mark itself, drawing at centre stage.
    placeRing(ring, ringFocus(null));
    gsap.set(ring, { autoAlpha: 0, scale: 0.2, rotate: -30 });
  }

  tl
    // 1. The arches draw themselves, left to right — the logo's own construction.
    .to(some(arches), { strokeDashoffset: 0, duration: 1.15, stagger: 0.14 }, 0.15)
    // 2. The aperture opens around them.
    .to(some(ring), { autoAlpha: 0.85, scale: 1, rotate: 0, duration: 1.5 }, 0.5)
    // 3. The type and the ticks arrive beneath.
    .to(some(type), { autoAlpha: 1, y: 0, duration: 0.75 }, 1.2)
    .to(some(ticks), { scaleY: 1, duration: 0.5, stagger: 0.035 }, 1.45)
    // 4. The aperture closes down and away as the render comes up behind it.
    .to(some(ring), { autoAlpha: 0, scale: 1.9, duration: 1.1, ease: E.in }, 2.05)
    .to(some(hero, scrim), { autoAlpha: 1, duration: 2.2 }, 2.05)
    .to(some(hero), { scale: 1, duration: 2.6 }, 2.05)
    // 5. The mark travels from centre stage to the corner it keeps.
    .to(some(lockup), { x: 0, y: 0, scale: 1, duration: 1.25 }, 2.35)
    .addLabel('swap', 2.35)
    .to(some(eyebrow), { autoAlpha: 1, letterSpacing: '0.72em', duration: 1 }, 3.05)
    .to(lines.length ? lines : INERT, { autoAlpha: 1, y: 0, duration: 0.95, stagger: 0.09 }, 3.2)
    .to(some(meta), { autoAlpha: 1, y: 0, duration: 0.8 }, 3.7)
    .to(some(enter, note), { autoAlpha: 1, y: 0, duration: 0.75 }, 3.95);

  return tl;
}

/* ------------------------------------------------------------------ director */

// One transition, played one way to go deeper and the other to come back. The table is
// therefore only deciding which direction the arches travel in.
const PAIRS = {
  'gate>intro': introSequence,
  'gate>landing': introSequence,
  'intro>landing': introSequence,

  'landing>menu': archRise,
  'menu>section': archRise,
  'landing>section': archRise,
  'section>section': archRise,

  'section>menu': archFall,
  'menu>landing': archFall,
  'section>landing': archFall,
};

// Reduced motion: identical swap semantics, one mechanism, 0.28s.
function crossfade({ outEl, inEl, tl }) {
  tl.set(inEl, { autoAlpha: 0, zIndex: 2, scale: 1, filter: 'none' })
    .set(some(outEl), { zIndex: 1 })
    .to(some(outEl), { autoAlpha: 0, duration: 0.28, ease: 'none' }, 0)
    .addLabel('swap', 0.14)
    .set(inEl, { autoAlpha: 1 }, 'swap')
    .to(inEl, { autoAlpha: 1, duration: 0.28, ease: 'none' }, 0);
  return tl;
}

// Hiding the outgoing screen in-frame at 'swap' is only safe if nothing animates it
// afterwards. This proves it on every transition, in development.
function assertNoPostSwapTweens(tl, outEl) {
  if (!outEl) return;
  const at = tl.labels.swap ?? 0;
  for (const child of tl.getChildren(true, true, false)) {
    if (child.startTime() < at - 1e-6) continue;
    const targets = typeof child.targets === 'function' ? child.targets() : [];
    if (targets.includes(outEl)) {
      console.error(
        '[director] a tween targets the outgoing screen at or after the swap label. ' +
          'The outgoing screen is hidden at that frame, so this tween cannot be seen.',
        child,
      );
    }
  }
}

export function buildTransition(ctx) {
  const key = `${ctx.from.stage}>${ctx.to.stage}`;
  const factory = ctx.opts?.transition ?? PAIRS[key] ?? archRise;
  const cleanups = [];
  const scale = durationScale();

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: E.out, duration: D.reveal },
    onComplete: () => {
      for (const fn of cleanups) fn();
      ctx.onComplete?.();
    },
  });

  (prefersReducedMotion() ? crossfade : factory)({ ...ctx, tl, cleanups });

  if (!('swap' in tl.labels)) {
    console.error(`[director] ${key}: factory produced no 'swap' label.`);
    tl.addLabel('swap', tl.duration() * 0.5);
  }

  tl.call(ctx.onSwap, null, 'swap');
  if (scale !== 1) tl.timeScale(1 / scale);
  if (import.meta.env.DEV) assertNoPostSwapTweens(tl, ctx.outEl);

  return tl;
}
