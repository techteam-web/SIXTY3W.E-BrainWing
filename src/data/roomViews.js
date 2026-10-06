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
// planId is a key of PLANS in floors.js ('typical-low', 'typical-high', 'amenity');
// areaId is the room's id in that plan's SVG ('_1'…'_4', 'Games_Room', 'pool', …). The
// extra group 'floors' holds the views of floors that have no plan (see the bottom). All
// angles in DEGREES.
//
// Set them by eye: open a room's view with ?calibrate on the URL, use the setup panel
// (start view, left edge, right edge), press "Copy" and paste the result in below. A room
// with no entry opens the floor's full 360° view, unlocked.

// STARTING POINTS, worked out from the plans rather than set by eye. For each room: the
// direction from the camera (the tower's core, radar camera [230.4, 137]) to the centre of
// the room's traced shape — which is the room's outward side, where its windows are — in
// plan degrees clockwise from the top of the plan. With the radar heading at 0 (measured
// against the main road) that plan direction IS the pano's yaw. Each room opens facing it
// and is locked to 70° either side: a 140° outlook, the whole front and none of the back.
// The pool deck, a wide open terrace, gets 80° either side.
//
// Room → direction (plan°): typical-low 01 −68, 02 −126, 03 125, 04 71; typical-high
// 01 −69, 02 −130, 03 129, 04 73; amenity Games −95, Fitness 179, Yoga 140, Lounge 101,
// Pool 11. Fine-tune any of them with ?calibrate and paste the result over its line.
export const ROOM_VIEWS = {
  'typical-low': {
    _1: { start: { yaw: -68, pitch: 0, fov: 180 }, yaw: [-138, 2] },
    _2: { start: { yaw: -126, pitch: 0, fov: 180 }, yaw: [164, -56] },
    _3: { start: { yaw: 125, pitch: 0, fov: 180 }, yaw: [55, -165] },
    _4: { start: { yaw: 71, pitch: 0, fov: 180 }, yaw: [1, 141] },
  },
  'typical-high': {
    _1: { start: { yaw: -69, pitch: -8, fov: 80 }, yaw: [-139, 1] },
    _2: { start: { yaw: -130, pitch: -8, fov: 80 }, yaw: [160, -60] },
    _3: { start: { yaw: 129, pitch: -8, fov: 80 }, yaw: [59, -161] },
    _4: { start: { yaw: 73, pitch: -8, fov: 80 }, yaw: [3, 143] },
  },
  amenity: {
    Games_Room: { start: { yaw: -95, pitch: -8, fov: 180 }, yaw: [-165, -25] },
    F_I_T_N_E_S_S_C_E_N_T_R_E: { start: { yaw: 179, pitch: -8, fov: 80 }, yaw: [109, -111] },
    YOGA_P_I_L_AT_E_S_S_T_U_D_I_O: { start: { yaw: 140, pitch: -8, fov: 80 }, yaw: [70, -150] },
    Lounge: { start: { yaw: 101, pitch: -8, fov: 80 }, yaw: [31, 171] },
    pool: { start: { yaw: 11, pitch: -8, fov: 80 }, yaw: [-69, 91] },
  },

  // FLOORS WITH NO PLAN — the 6th, 13th, 20th, 27th–32nd and the terrace have no rooms
  // to look out of, so the whole floor gets one view. Keyed by floor number (or
  // 'terrace'); `default` covers every such floor without its own entry. The default
  // faces the main road (yaw 180°, the side the radar was measured against) with the
  // same 140° outlook as a room.
  floors: {
    default: { start: { yaw: 180, pitch: -8, fov: 80 }, yaw: [110, -110] },
  },
};

// A plan-less floor's view: its own entry, else the default.
export const floorViewFor = (key) => ROOM_VIEWS.floors[key] ?? ROOM_VIEWS.floors.default;

// Up–down for any locked room that does not set its own: no craning at the sky, no
// staring straight down at the drone's own shadow.
export const DEFAULT_PITCH = [-35, 20];

export const roomViewFor = (planId, areaId) => ROOM_VIEWS[planId]?.[areaId] ?? null;
