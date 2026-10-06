// A room's view setup (src/data/roomViews.js), turned into what Marzipano takes: start
// parameters and a view limiter.
//
// Two conventions meet here, and this is the only file that knows both.
//
//   The setup is in DEGREES, with pitch the everyday way round: up is positive.
//   Marzipano is in RADIANS, and its pitch runs the other way — positive looks DOWN. Its
//   documentation says the opposite, but its own up-arrow key lowers pitch
//   (controls/registerDefaultControls.js), and the view follows the key, not the doc.
//
// Marzipano's own limit.yaw/limit.pitch clamp the view's CENTRE, so at the limit half the
// screen is still past it, and a yaw range across the ±180° seam cannot be expressed at
// all. lockArea() clamps the screen's EDGES instead, measures yaw as a wrapped offset
// from the range's middle so any range works, and caps the zoom so the view is never
// wider than the range it is locked to.

const RAD = Math.PI / 180;
const TAU = Math.PI * 2;

export const toRad = (deg) => deg * RAD;
export const toDeg = (rad) => rad / RAD;

// The view's centre in the setup's terms, and back.
export const pitchToSetup = (marzipanoPitch) => -toDeg(marzipanoPitch);
export const pitchFromSetup = (setupPitch) => -toRad(setupPitch);

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Horizontal ↔ vertical field of view for a viewport's aspect.
const hFromV = (v, aspect) => 2 * Math.atan(Math.tan(v / 2) * aspect);
const vFromH = (h, aspect) => 2 * Math.atan(Math.tan(h / 2) / aspect);

// A range is only a range once both its ends are set — setup mode records them one
// press at a time, so a half-set range ([left, null]) locks nothing yet.
export const complete = (range) =>
  Array.isArray(range) && range.length === 2 && range.every(Number.isFinite);

// setup.start → Marzipano view parameters, over a fallback (the tiler's own).
export function startParams(start, fallback) {
  if (!start) return fallback;
  return {
    ...fallback,
    yaw: start.yaw != null ? toRad(start.yaw) : fallback.yaw,
    pitch: start.pitch != null ? pitchFromSetup(start.pitch) : fallback.pitch,
    fov: start.fov != null ? toRad(start.fov) : fallback.fov,
  };
}

// limits { yaw: [left, right], pitch: [bottom, top] } → a Marzipano limiter, or null.
export function lockArea(limits) {
  const yaw = complete(limits?.yaw) ? limits.yaw.map(toRad) : null;
  // Setup pitch [bottom, top], up positive → Marzipano's [top, bottom], down positive.
  const pitch = complete(limits?.pitch)
    ? [pitchFromSetup(Math.max(...limits.pitch)), pitchFromSetup(Math.min(...limits.pitch))]
    : null;

  // A yaw range read left edge to right edge, clockwise; a zero-width one locks nothing.
  const ySpan = yaw ? (((yaw[1] - yaw[0]) % TAU) + TAU) % TAU : 0;
  const yawOn = ySpan > 1e-3;
  const yMid = yawOn ? yaw[0] + ySpan / 2 : 0;
  const pitchOn = !!pitch && pitch[1] > pitch[0];

  if (!yawOn && !pitchOn) return null;

  return function limitArea(params) {
    const w = params.width;
    const h = params.height;
    const aspect = w > 0 && h > 0 ? w / h : 1;

    // Never wider or taller than the area itself.
    let vfov = params.fov;
    if (yawOn) vfov = Math.min(vfov, vFromH(Math.min(ySpan, Math.PI * 0.98), aspect));
    if (pitchOn) vfov = Math.min(vfov, pitch[1] - pitch[0]);
    params.fov = vfov;
    const hfov = hFromV(vfov, aspect);

    if (yawOn) {
      const room = Math.max(0, ySpan / 2 - hfov / 2);
      params.yaw = wrap(yMid + clamp(wrap(params.yaw - yMid), -room, room));
    }
    if (pitchOn) {
      const lo = pitch[0] + vfov / 2;
      const hi = pitch[1] - vfov / 2;
      params.pitch = lo <= hi ? clamp(params.pitch, lo, hi) : (pitch[0] + pitch[1]) / 2;
    }
    return params;
  };
}

// Whether yaw is locked — autorotate is pointless against a wall.
export const yawLocked = (limits) =>
  complete(limits?.yaw) && Math.abs(limits.yaw[1] - limits.yaw[0]) % 360 > 0.1;
