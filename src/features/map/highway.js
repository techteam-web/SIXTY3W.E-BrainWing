import { gsap, prefersReducedMotion } from '../../gsap/Gsapconfig';
import { PROJECT } from '../../data/landmarks';
import { WEH_LINE } from './weHighway';

// The Western Express Highway, drawn by the app rather than by the basemap: one clean
// gold line on a dark casing and a soft glow (see weHighway.js for why the basemap's own
// strands are only a quiet bed under it), its name set once along it.
//
// It animates when the Location screen opens: the line draws itself outward from the
// tower's own stretch of road, north and south at once, and then lights run along it
// from the tower in both directions, pass after pass — the address, connected both ways.
//
// Every layer's colour is a `line-gradient` over the line's own length (`line-progress`,
// which is why the source has `lineMetrics`), so both the draw-in and the moving lights
// are a window of colour slid along one line rather than geometry re-cut every frame.

const SRC = 'w63-weh';
const ROAD = [200, 161, 107]; // --color-w-gold
const CASE = [4, 26, 25];
const LIGHT = [255, 244, 214];

const width = (stops) => ['interpolate', ['exponential', 1.5], ['zoom'], ...stops.flat()];

// How far along the line the tower's stretch of road is, 0 (south) to 1 (north): the
// nearest vertex, by ground distance along the line (longitude scaled by latitude, the
// way line-progress is measured on the projected map).
const k = Math.cos((PROJECT.lat * Math.PI) / 180);
const lengths = [0];
for (let i = 1; i < WEH_LINE.length; i += 1) {
  const [a, b] = [WEH_LINE[i - 1], WEH_LINE[i]];
  lengths.push(lengths[i - 1] + Math.hypot((b[0] - a[0]) * k, b[1] - a[1]));
}
const TOTAL = lengths[lengths.length - 1];
let nearest = 0;
WEH_LINE.forEach(([lng, lat], i) => {
  const d = Math.hypot((lng - PROJECT.lng) * k, lat - PROJECT.lat);
  const best = Math.hypot((WEH_LINE[nearest][0] - PROJECT.lng) * k, WEH_LINE[nearest][1] - PROJECT.lat);
  if (d < best) nearest = i;
});
const HOME = lengths[nearest] / TOTAL;

const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`;

// A gradient from [position, colour] stops: sorted, clamped to 0…1 and kept strictly
// increasing, which `interpolate` insists on.
function gradient(stops, base) {
  const sorted = stops
    .map(([p, c]) => [Math.min(1, Math.max(0, p)), c])
    .sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [p, c] of sorted) {
    if (out.length && p <= out[out.length - 2]) continue;
    out.push(p, c);
  }
  if (out[0] !== 0) out.unshift(0, base);
  if (out[out.length - 2] !== 1) out.push(1, base);
  return ['interpolate', ['linear'], ['line-progress'], ...out];
}

// Drawn from HOME out to `t` of the way to each end.
const E = 0.0015;
function drawn(t, color, alpha) {
  const lo = HOME - t * HOME;
  const hi = HOME + t * (1 - HOME);
  const on = rgba(color, alpha);
  const off = rgba(color, 0);
  return gradient(
    [
      [lo - E, lo <= 0 ? on : off],
      [lo, on],
      [hi, on],
      [hi + E, hi >= 1 ? on : off],
    ],
    off,
  );
}

// Two lights leaving HOME, one north, one south, each `t` of the way to its end, with a
// tail fading back towards the tower. Out past the ends they simply leave the line.
const TAIL = 0.12;
function lights(t) {
  const off = rgba(LIGHT, 0);
  if (t <= 0) return gradient([], off);
  const n = HOME + t * (1 - HOME);
  const s = HOME - t * HOME;
  const fade = Math.min(1, t * 6, (1 - t) * 6);
  const on = rgba(LIGHT, fade);
  return gradient(
    [
      [n - TAIL, off],
      [n, on],
      [n + E, off],
      [s - E, off],
      [s, on],
      [s + TAIL, off],
    ],
    off,
  );
}

const LAYERS = {
  glow: (t) => drawn(t, ROAD, 0.22),
  case: (t) => drawn(t, CASE, 0.85),
  line: (t) => drawn(t, ROAD, 1),
};

// Adds the source and layers, under the 3D buildings so towers still stand in front of
// the road at street zoom. Starts undrawn; animateHighway brings it in.
export function addHighway(m) {
  const before = m.getLayer('building-3d') ? 'building-3d' : undefined;
  m.addSource(SRC, {
    type: 'geojson',
    lineMetrics: true,
    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: WEH_LINE } },
  });
  const line = (id, w, extra = {}) =>
    m.addLayer(
      {
        id,
        type: 'line',
        source: SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-width': width(w), 'line-gradient': gradient([], 'rgba(0,0,0,0)'), ...extra },
      },
      before,
    );
  line('weh-glow', [[10, 6], [13, 16], [17, 52]], { 'line-blur': ['interpolate', ['linear'], ['zoom'], 10, 4, 17, 22] });
  line('weh-case', [[10, 2.8], [13, 6.4], [17, 21]]);
  line('weh-line', [[10, 1.3], [13, 3], [17, 10]]);
  // Wider than the line and soft-edged, so a light reads as light on the road, not as a
  // thicker stretch of it.
  line('weh-flow', [[10, 4.5], [13, 9], [17, 26]], { 'line-blur': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 17, 8] });

  m.addLayer({
    id: 'weh-label',
    type: 'symbol',
    source: SRC,
    minzoom: 11.6,
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 560,
      'text-field': 'WESTERN EXPRESS HIGHWAY',
      'text-font': ['literal', ['Noto Sans Regular']],
      'text-size': ['interpolate', ['linear'], ['zoom'], 11.6, 9, 16, 12],
      'text-letter-spacing': 0.32,
      'text-offset': [0, -1.25],
      'text-keep-upright': true,
    },
    paint: {
      'text-color': '#e7cf95',
      'text-halo-color': '#072928',
      'text-halo-width': 1.6,
      'text-opacity': 0,
      'text-opacity-transition': { duration: 900, delay: 0 },
    },
  });
}

const paint = (m, t) => {
  for (const [id, fn] of Object.entries(LAYERS)) m.setPaintProperty(`weh-${id}`, 'line-gradient', fn(t));
};

// The draw-in, then the lights, forever until the returned function stops them (the
// screen unmounting). Reduced motion: drawn at once, still, no lights.
export function animateHighway(m, { delay = 0.4 } = {}) {
  if (!m.getLayer('weh-line')) return () => {};
  if (prefersReducedMotion()) {
    paint(m, 1);
    m.setPaintProperty('weh-label', 'text-opacity', 0.9);
    return () => {};
  }

  const state = { t: 0, light: 0 };
  const tl = gsap.timeline({ delay });
  tl.to(state, {
    t: 1,
    duration: 2.6,
    ease: 'power2.inOut',
    onUpdate: () => paint(m, state.t),
    onComplete: () => m.setPaintProperty('weh-label', 'text-opacity', 0.9),
  });
  tl.add(
    gsap.fromTo(
      state,
      { light: 0 },
      {
        light: 1,
        duration: 2.6,
        ease: 'sine.inOut',
        repeat: -1,
        repeatDelay: 0.25,
        onUpdate: () => m.getLayer('weh-flow') && m.setPaintProperty('weh-flow', 'line-gradient', lights(state.light)),
      },
    ),
    '-=0.9',
  );
  return () => tl.kill();
}
