// The view from each room: which way a floor's 360° panorama faces when it is opened
// from a room on the plan, and the slice of it that room may be turned across.
//
// The drone flew the same heading on every floor, so a room looks the same way on every
// floor that shares its plan. Settings are therefore per PLAN and ROOM, set once:
//
//   ROOM_VIEWS[planId][areaId] = {
//     start: { yaw, pitch, fov },   // where the view opens: left/right, up/down (up is
//                                   // positive), zoom (vertical field of view)
//     yaw:   [left, right],         // the room's outlook: the screen's left and right
//                                   // EDGES can go no further. May cross ±180°.
//     pitch: [bottom, top],         // optional; DEFAULT_PITCH when left out
//     camera: [x, y],               // optional — where the radar's dot and cone sit for
//                                   // this room, in the plan SVG's own 460.8×259.2
//                                   // units. Left out, it defaults to the centre of the
//                                   // room's own traced shape, which is what moves the
//                                   // radar onto the room automatically (see PanoRadar).
//   }
//
// planId is a key of PLANS in floors.js ('typical-low', 'typical-high', 'amenity'); areaId
// is the room's id in that plan's SVG ('_1'…'_4', 'Games_Room', 'pool', …). The extra
// group 'floors' holds the views of floors that have no plan (see the bottom). All angles
// in DEGREES.
//
// Set them by eye: open a room's view with ?calibrate on the URL, use the setup panel
// (start view, left edge, right edge), press "Copy" and paste the result in below. A room
// with no entry opens the floor's full 360° view, unlocked.

import { PLANS } from './floors';
import { bboxCenter } from './svgLayer';
import { RADAR } from './floorPanos';

// ---------------------------------------------------------------- the aim
//
// WRITE A `start.yaw` AND YOU OWN THE ROOM. Leave it out and the plan aims it for you.
// That is the whole rule, and both halves of it matter.
//
// They used to disagree. Every apartment's opening yaw was typed in from a calibration
// pass, and the passes drifted: against the plan's own geometry the stored angles were
// out by 12° to 53°, in both directions, differently on each plate — so Apartment 01 and
// Apartment 02 opened on unrelated outlooks, and going back and into a third apartment
// gave a third unrelated one. The radar's cone was right every time (it is drawn from the
// live panorama heading); it was the panorama that was aimed wrong.
//
// The fix was to derive the aim the way PanoRadar derives the dot it draws: the direction
// from the radar's camera point to the centre of the room's own traced shape — which is
// the apartment's outward side, where its windows are — in degrees clockwise from the top
// of the plan, less the radar heading. Every apartment then opens looking straight out of
// itself and the cone on the mini-map points at the apartment the visitor is standing in.
//
// Those derived angles are now WRITTEN OUT below, as ordinary numbers, because a figure
// nobody can edit is its own kind of trap. So:
//
//   · an entry with `start.yaw` is taken exactly as written — aim, outlook, everything.
//     Change the number, the view changes. Nothing overrules you.
//   · an entry WITHOUT one is aimed from the plan, and its `yaw: [left, right]` pair
//     supplies the outlook's WIDTH only, re-centred on that aim.
//
// Set them by eye with ?calibrate and paste the result over the line. The cost of the
// written numbers is that they no longer follow the artwork: if a plate is re-issued with
// its apartments moved, delete the `yaw` out of that room's `start` and it will aim itself
// off the new drawing again.

const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
const r1 = (n) => +n.toFixed(1);
// A [left, right] pair's width, clockwise, crossing ±180° correctly.
const spanOf = ([l, r]) => (((r - l) % 360) + 360) % 360;

// The direction from the radar's camera point to a room's traced shape, in degrees
// clockwise from the top of the plan — the same geometry PanoRadar's `at()` uses, so a
// cone drawn at this angle lands on the room.
function planDirection(planId, areaId) {
  const shape = PLANS[planId]?.layer.shapes.find((s) => s.id === areaId);
  if (!shape?.bbox) return null;
  const [cx, cy] = bboxCenter(shape.bbox);
  const [ox, oy] = RADAR.camera;
  return (Math.atan2(cx - ox, oy - cy) * 180) / Math.PI;
}

// The default outlook for a room whose entry sets no width: 140°, the whole front and
// none of the back.
const DEFAULT_OUTLOOK = 140;

// Aim a plate's rooms off the plan — but only the ones that have not aimed themselves.
// A room whose `start.yaw` is written out, and a room the plan has no shape for, are both
// left exactly as they stand.
function aimed(planId, rooms) {
  const out = {};
  for (const [areaId, v] of Object.entries(rooms)) {
    const dir = v.start?.yaw == null ? planDirection(planId, areaId) : null;
    if (dir == null) {
      out[areaId] = v;
      continue;
    }
    const yaw = r1(wrap(dir - RADAR.heading));
    const half = (v.yaw ? spanOf(v.yaw) : DEFAULT_OUTLOOK) / 2;
    out[areaId] = {
      ...v,
      start: { ...v.start, yaw },
      yaw: [r1(wrap(yaw - half)), r1(wrap(yaw + half))],
    };
  }
  return out;
}

export const ROOM_VIEWS = {
  // ONE TILT FOR EVERY APARTMENT. All three residential plates open at pitch -2.5, which
  // with FloorPanoViewer's LIFT puts every unit on every floor at the same angle above
  // level. They did not used to: the 2nd–10th was calibrated at -2.5 and the plates above
  // it at -7.5, so walking up the building tipped the opening view five degrees down
  // halfway through, for no reason a visitor could see. Raising the upper plates to match
  // is what levels them, and it tilts the floors a visitor spends most of their time on
  // up and off the ground below.
  //
  // Only the up–down moved. Every `yaw` on these lines is exactly what it was.

  // 2nd–10th. Its ids run the other way round from the plates above: _1 is the LEFT
  // wing, which the drawing calls Apartment 04.
  'typical-low': aimed('typical-low', {
    // Apartment 04 — left wing
    _1: { start: { pitch: -2.5, fov: 55, yaw: -72.2 }, yaw: [-123.9, -20.5], pitch: [-11.4, 43.6] },
    // Apartment 03 — bottom left
    _2: { start: { pitch: -2.5, fov: 55, yaw: -124.5 }, yaw: [172.9, -61.9], pitch: [-18.1, 36.9] },
    // Apartment 02 — bottom right
    _3: { start: { pitch: -2.5, fov: 55, yaw: 122.2 }, yaw: [61.3, -176.9], pitch: [-14, 41] },
    // Apartment 01 — right wing
    _4: { start: { pitch: -2.5, fov: 55, yaw: 72.8 }, yaw: [17.6, 128], pitch: [-17.9, 37.1] },
  }),
  // 11th–25th, keyed by the re-issued plate's ids, which follow the drawing's own
  // apartment numbers (1 right wing, 2 bottom right, 3 bottom left, 4 left wing). The
  // previous plate's ids ran the other way round, and that is precisely the kind of
  // mix-up the derived aim above now makes impossible: each id is aimed at its own
  // traced shape, whatever number the drawing gives it.
  'typical-high': aimed('typical-high', {
    // Apartment 01 — right wing
    _1: { start: { pitch: -2.5, fov: 55, yaw: 77.6 }, yaw: [26.3, 129], pitch: [-22.8, 32.2] },
    // Apartment 02 — bottom right
    _2: { start: { pitch: -2.5, fov: 55, yaw: 129.4 }, yaw: [72.8, -173.9], pitch: [-20.7, 34.3] },
    // Apartment 03 — bottom left
    _3: { start: { pitch: -2.5, fov: 55, yaw: -131.5 }, yaw: [170, -73], pitch: [-24.7, 30.3] },
    // Apartment 04 — left wing
    _4: { start: { pitch: -2.5, fov: 55, yaw: -76.9 }, yaw: [-126.7, -27.1], pitch: [-23, 32] },
  }),
  // 28th–31st: three apartments, Apartment 02 running the whole deck side where the
  // floors below have 02 and 03 — so its width is the wider of the two it replaces, and
  // the plan aims it square at the road by itself.
  'typical-top': aimed('typical-top', {
    // Apartment 04 — left wing
    _4: { start: { pitch: -2.5, fov: 55, yaw: -77 }, yaw: [-126.8, -27.2], pitch: [-23, 32] },
    // Apartment 01 — right wing
    _1: { start: { pitch: -2.5, fov: 55, yaw: 77.4 }, yaw: [26, 128.8], pitch: [-22.8, 32.2] },
    // Apartment 02 — the whole deck side, so it faces the road straight on
    _2: { start: { pitch: -2.5, fov: 55, yaw: 177.8 }, yaw: [110.7, -115.1], pitch: [-24.7, 30.3] },
  }),
  // The amenity level is aimed the same way. Its hand-set angles were already within a
  // couple of degrees of the plan on four of the five — they were worked out from the
  // drawing in the first place — so this changes little here beyond making it certain.
  amenity: aimed('amenity', {
    Games_Room: { start: { pitch: -8, fov: 180, yaw: -102.1 }, yaw: [-172.1, -32.1] },
    F_I_T_N_E_S_S_C_E_N_T_R_E: { start: { pitch: -8, fov: 80, yaw: 178.6 }, yaw: [108.6, -111.4] },
    YOGA_P_I_L_AT_E_S_S_T_U_D_I_O: { start: { pitch: -8, fov: 80, yaw: 139.9 }, yaw: [69.9, -150.1] },
    Lounge: { start: { pitch: -8, fov: 80, yaw: 100.9 }, yaw: [30.9, 170.9] },
    pool: { start: { pitch: -8, fov: 80, yaw: 1.1 }, yaw: [-78.9, 81.1] },
  }),

  // FLOORS WITH NO PLAN — the 6th, 13th, 20th, 27th, 32nd and the terrace have no rooms
  // to look out of, so the whole floor gets one view. Keyed by floor number (or
  // 'terrace'); `default` covers every such floor without its own entry. There is no
  // shape to aim at, so these stay set by eye: the default faces Aarey across the main
  // road (yaw 165°; the forest spans ~120°–220°) with the same 140° outlook as a room.
  floors: {
    default: { start: { yaw: 165, pitch: -8, fov: 80 }, yaw: [110, -110] },
  },
};

// A plan-less floor's view: its own entry, else the default.
export const floorViewFor = (key) => ROOM_VIEWS.floors[key] ?? ROOM_VIEWS.floors.default;

// Up–down for any locked room that does not set its own: no craning at the sky, no
// staring straight down at the drone's own shadow.
export const DEFAULT_PITCH = [-35, 20];

export const roomViewFor = (planId, areaId) => ROOM_VIEWS[planId]?.[areaId] ?? null;
