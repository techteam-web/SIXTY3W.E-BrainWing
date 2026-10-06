// The view from every floor — drone panoramas shot at each floor's height, day and night,
// tiled by the Marzipano tool into public/assets/pano/panoday and panonight.
//
// Floors are read from the scene names the tiler kept ("DJI_0014_20th Floor_68.1M",
// "DJI_0001_Terrace 110.7M"), never keyed by hand. One of them is spelled "4rh", and the
// pattern accepts it. The altitudes step 3.2 m a floor from 10.5 m at the 2nd, which is
// what fixes the numbering: the same floors the building elevation now uses.
//
// Not every floor was shot both ways. Day covers the 2nd to the 32nd and the terrace;
// night has no 14th or 15th, which borrow a neighbour's (NIGHT_STAND_INS below). Any
// other missing side is null, and the viewer offers only what exists.

import DAY from './FloorPanoDay';
import NIGHT from './FloorPanoNight';

export const PANO_TILES = {
  day: '/assets/pano/panoday/tiles',
  night: '/assets/pano/panonight/tiles',
};

export const PANO_DATA = { day: DAY, night: NIGHT };

const keyOf = (name) => {
  if (/terrace/i.test(name)) return 'terrace';
  const m = /(\d+)(?:st|nd|rd|th|rh)\s+floor/i.exec(name);
  return m ? Number(m[1]) : null;
};

const ordinal = (n) => {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'}`;
};

// The drone's height, as the tiler kept it at the end of the name: "…_68.1M", "…_97.9".
const heightOf = (name) => {
  const m = /([\d.]+)\s*m?\s*$/i.exec(name);
  return m ? Number(m[1]) : null;
};

const heights = new Map();

const index = (data) => {
  const map = new Map();
  for (const s of data.scenes) {
    const k = keyOf(s.name);
    if (k == null) continue;
    map.set(k, s.id);
    if (!heights.has(k)) heights.set(k, heightOf(s.name));
  }
  return map;
};

const day = index(DAY);
const night = index(NIGHT);

// The two floors with no night shot borrow the nearest neighbour's, by the client's
// choice: the 14th shows the 13th's night view and the 15th shows the 16th's. Only ever
// fills a gap — a real shot, if one is added later, wins.
const NIGHT_STAND_INS = { 14: 13, 15: 16 };
for (const [floor, from] of Object.entries(NIGHT_STAND_INS)) {
  const k = Number(floor);
  if (!night.has(k) && night.has(from)) night.set(k, night.get(from));
}

// Every vantage, bottom to top, the terrace last. Shaped like PANO_VIEWS, so the one
// PanoViewer serves both screens.
export const FLOOR_PANOS = [...new Set([...day.keys(), ...night.keys()])]
  .sort((a, b) => (a === 'terrace' ? 1 : b === 'terrace' ? -1 : a - b))
  .map((k) => ({
    id: k === 'terrace' ? 'pano-terrace' : `pano-${k}`,
    level: k === 'terrace' ? null : k,
    label: k === 'terrace' ? 'Terrace' : `${ordinal(k)} Floor`,
    height: heights.get(k) ?? null,
    day: day.get(k) ?? null,
    night: night.get(k) ?? null,
  }));

// THE RADAR — the mini-map on a floor's 360° view: a dot where the camera stood, and a
// cone that turns as the view turns.
//
// The cone's turning is live and exact: it is the panorama's own heading. Where it is
// DRAWN from and which way is its zero are not in any supplied asset, and they are
// placeholders until someone measures them:
//
//   heading  the plan direction, in degrees clockwise from the top of the plan, that a
//            panorama faces at yaw 0. To measure: open any floor's view with ?calibrate
//            on the URL, turn to face a landmark whose direction on the plan you know,
//            and set heading = (its plan direction) − (the yaw the card shows).
//   camera   where the drone stood, in the plan's artboard units (the same 460.8×259.2
//            frame as the plan SVGs). null = the centre of the plan's frame.
//   floors   per-floor overrides of either, keyed by floor number, for any shot taken
//            from a different spot or with the drone turned differently.
export const RADAR = {
  // Measured on the 16th floor against the main road, which runs along the bottom of
  // the plan (the side of the balconied Apartments 02 and 03): facing the road reads
  // yaw ≈ 180°, and the road is at 180° on the plan, so heading = 180 − 180 = 0.
  heading: 0,
  // A working choice, not a survey: the heart of the tower's core, the middle of the
  // "Passage & Lift Lobby" on the typical plans (≈ 960, 570 px on the 1920×1080 renders).
  // Both typical plans and the amenity plan share the artboard's alignment, so on the
  // 26th this lands in the same core, by the lifts. Change it if the drone flew
  // elsewhere.
  camera: [230.4, 137],
  // Same heading everywhere until a floor proves otherwise, e.g. { 25: { heading: 4 } }.
  floors: {},
};

export const radarFor = (level) => ({
  heading: RADAR.floors[level]?.heading ?? RADAR.heading,
  camera: RADAR.floors[level]?.camera ?? RADAR.camera,
});

const BY_LEVEL = new Map(FLOOR_PANOS.filter((p) => p.level != null).map((p) => [p.level, p]));

export const panoForLevel = (level) => (level != null ? (BY_LEVEL.get(level) ?? null) : null);
