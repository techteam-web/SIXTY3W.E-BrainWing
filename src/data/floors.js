// The building, floor by floor, and the plan each floor opens onto.
//
// Every shape comes from the supplied SVGs (see svgLayer.js) and every id below is one
// those SVGs actually carry — nothing here is placed by eye. What this file adds is
// only what the shapes cannot say for themselves: which floors share which plan, and the
// figures the project already publishes for each unit and amenity.
//
//   · Unit carpet areas are the brochure's RERA carpet-area table, the same figures the
//     previous Floor Plans screen carried. Units 01–04 are the SVG shapes _1–_4.
//   · "2 BHK" is the project's own description of every residence (content.js).
//   · Amenity areas are printed on the amenity plan itself, in sq.m and sq.ft.; each
//     pair checks (sq.m × 10.764 = sq.ft.). Where the plan prints no area — the pool
//     deck — none is shown.
//   · An amenity with a photograph in the render ladder links to it by render id.
//
// A floor opens a plan, a 360° view from its height, or both. Floors with a view but no
// plan (6th, 13th, 20th, 27th–32nd) open the view only; the Ground and 1st floors have
// neither and say so. The podium slab is not offered. See BUILDING below for how the SVG's
// shapes map to real floor numbers.

import { parseSvgLayer } from './svgLayer';
import { panoForLevel } from './floorPanos';

import buildingSvg from '../assets/building/Sixty3w.e.svg?raw';
import buildingImage from '../assets/building/Sixty3w.e.png?url';

import typicalLowSvg from '../assets/floorplans/TYPICAL FLOOR PLAN 2ND TO 5TH,7TH TO 10TH FLOOR-22.svg?raw';
import typicalLowImage from '../assets/floorplans/TYPICAL FLOOR PLAN 2ND TO 5TH,7TH TO 10TH FLOOR-22.png?url';
import typicalHighSvg from '../assets/floorplans/TYPICAL FLOOR PLAN 11TH TO 12TH ,14TH TO 19TH , 21ST TO 25TH FLOOR-23.svg?raw';
import typicalHighImage from '../assets/floorplans/TYPICAL FLOOR PLAN 11TH TO 12TH ,14TH TO 19TH , 21ST TO 25TH FLOOR-23.png?url';
import amenitySvg from '../assets/floorplans/AMENITY PLAN 26TH FLOOR-24.svg?raw';
import amenityImage from '../assets/floorplans/AMENITY PLAN 26TH FLOOR-24.PNG?url';

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const residence = (no, carpet) => ({
  kind: 'unit',
  label: `Apartment ${no}`,
  short: no,
  type: '2 BHK',
  carpet,
});

// `frame` is the part of the 460.8×259.2 artboard the viewer opens on: the drawing's own
// bounds, measured off the render's alpha channel, with a margin wide enough that the
// sheet's arch crown never cuts into the linework. It frames; it moves nothing.
export const PLANS = {
  'typical-low': {
    id: 'typical-low',
    kind: 'residential',
    title: 'Typical Floor Plan',
    floorsLabel: '2nd – 5th · 7th – 10th',
    floors: [...range(2, 5), ...range(7, 10)],
    image: typicalLowImage,
    alt: 'Typical floor plan, 2nd to 5th and 7th to 10th floors',
    layer: parseSvgLayer(typicalLowSvg),
    frame: [66, 26, 329, 200],
    areas: {
      _1: residence('01', 579),
      _2: residence('02', 599),
      _3: residence('03', 599),
      _4: residence('04', 579),
    },
  },
  'typical-high': {
    id: 'typical-high',
    kind: 'residential',
    title: 'Typical Floor Plan',
    floorsLabel: '11th – 12th · 14th – 19th · 21st – 25th',
    floors: [...range(11, 12), ...range(14, 19), ...range(21, 25)],
    image: typicalHighImage,
    alt: 'Typical floor plan, 11th to 12th, 14th to 19th and 21st to 25th floors',
    layer: parseSvgLayer(typicalHighSvg),
    frame: [66, 26, 329, 200],
    areas: {
      _1: residence('01', 634),
      _2: residence('02', 686),
      _3: residence('03', 686),
      _4: residence('04', 634),
    },
  },
  amenity: {
    id: 'amenity',
    kind: 'amenity',
    title: 'Amenity Plan',
    subtitle: 'Euphoria, the lifestyle level',
    floorsLabel: '26th Floor',
    floors: [26],
    image: amenityImage,
    alt: 'Amenity plan, 26th floor',
    layer: parseSvgLayer(amenitySvg),
    frame: [100, 14, 262, 226],
    areas: {
      Games_Room: { kind: 'amenity', label: 'Games Room', sqm: 79.18, sqft: 852.29, render: 'games' },
      F_I_T_N_E_S_S_C_E_N_T_R_E: {
        kind: 'amenity',
        label: 'Fitness Centre',
        sqm: 74.42,
        sqft: 801.06,
        render: 'fitness',
      },
      YOGA_P_I_L_AT_E_S_S_T_U_D_I_O: {
        kind: 'amenity',
        label: 'Yoga & Pilates Studio',
        sqm: 33.14,
        sqft: 356.72,
        render: 'yoga',
      },
      Lounge: { kind: 'amenity', label: 'Lounge', sqm: 16.5, sqft: 177.6 },
      pool: { kind: 'amenity', label: 'Pool', render: 'pool' },
    },
  },
};

const PLAN_BY_FLOOR = new Map(
  Object.values(PLANS).flatMap((plan) => plan.floors.map((n) => [n, plan])),
);

export const ordinal = (n) => {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'}`;
};

// THE SVG'S FLOOR NAMES ARE ONE LOW. The traced layer calls its lowest residential slab
// "1st Floor", but on the render that slab is the 2nd: the open amenity level with the
// glass balustrade (the 26th) is the band the SVG names "25th Floor". So every numbered
// shape is its SVG number plus one, and the two shapes beneath them are the lower floors:
//
//   Shop_G → Ground   ·   Shop_1 → 1st   ·   "1st Floor" → 2nd   …   "30th Floor" → 31st
//
// The top shape, "31st Floor Terrace", is therefore the 32nd — and the drone panoramas
// agree: they step 3.2 m a floor to the 32nd at 107.5 m, with the roof terrace above it at
// 110.7 m (see floorPanos.js). The Podium is the thin slab between Shop_1 and the 2nd
// floor and is not a floor; it is not offered.
const SHIFT = 1;
const LOWER = { Shop_G: 0, Shop_1: 1 };

const levelOf = (shape) => {
  if (shape.id in LOWER) return LOWER[shape.id];
  const m = /^(\d+)(?:st|nd|rd|th)\b/i.exec(shape.name.trim());
  return m ? Number(m[1]) + SHIFT : null;
};

const building = parseSvgLayer(buildingSvg);

// Top to bottom, in the SVG's own order. `mark` is what the floor card prints large:
// G, 01 … 32. `plan` and `pano` are what the floor can open; either may be null.
export const BUILDING = {
  image: buildingImage,
  alt: 'SIXTY3W.E. tower at dusk — artist’s impression',
  viewBox: building.viewBox,
  floors: building.shapes
    .map((shape) => {
      const level = levelOf(shape);
      return {
        ...shape,
        level,
        label: level === 0 ? 'Ground Floor' : `${ordinal(level)} Floor`,
        mark: level === 0 ? 'G' : String(level).padStart(2, '0'),
        plan: level != null ? (PLAN_BY_FLOOR.get(level) ?? null) : null,
        pano: panoForLevel(level),
      };
    })
    .filter((f) => f.level != null),
};

// The plan's selectable areas: the SVG's named shapes that the plan has something to say
// about — residences first, by their own apartment number, then whatever else the plan
// has (the amenities) in the SVG's own order.
//
// NOT the SVG's own order throughout: the typical-low and typical-high plates were traced
// in opposite directions (one lists _4 first, the other _1), so reading units straight off
// the file put a different apartment first on every other floor — both in the "Rooms" row
// and in which one a view opens on by default. Residences are sorted so a visitor always
// meets Apartment 01 first, on every floor.
export const planAreas = (plan) =>
  plan.layer.shapes
    .filter((s) => plan.areas[s.id])
    .map((s) => ({ ...s, ...plan.areas[s.id] }))
    .sort((a, b) => (a.kind === 'unit' && b.kind === 'unit' ? Number(a.short) - Number(b.short) : 0));
