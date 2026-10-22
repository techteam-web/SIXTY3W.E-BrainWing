// Compare: floor plans side by side, apartments side by side, and the views out of those
// apartments — up to three of each at a time.
//
// A selection is plain data, held by the building explorer for as long as a floor is
// open: floor ids for the plans, and { floorId, areaId } pairs for the apartments. Both
// are the ids the elevation and the plans are already keyed on, so nothing here is new
// data — only a way of putting what exists next to itself.

import { BUILDING, planAreas } from './floors';
import { DEFAULT_PITCH, roomViewFor } from './roomViews';

export const COMPARE_MAX = 3;

export const EMPTY_COMPARE = { tab: 'floors', floors: [], units: [] };

// Every floor with a plan, lowest first — what can be compared as a plan.
export const PLAN_FLOORS = BUILDING.floors.filter((f) => f.plan).sort((a, b) => a.level - b.level);

// The floors with apartments on them. The amenity level has none.
export const UNIT_FLOORS = PLAN_FLOORS.filter((f) => f.plan.kind === 'residential');

const FLOOR_BY_ID = new Map(BUILDING.floors.map((f) => [f.id, f]));
export const floorById = (id) => FLOOR_BY_ID.get(id) ?? null;

// planAreas() sorts on every call; a comparison asks for the same three plans constantly.
const AREAS = new Map();
export const areasOf = (plan) => {
  if (!AREAS.has(plan.id)) AREAS.set(plan.id, planAreas(plan));
  return AREAS.get(plan.id);
};

export const unitsOf = (floor) => areasOf(floor.plan).filter((a) => a.kind === 'unit');

export const unitKey = (u) => `${u.floorId}:${u.areaId}`;

// The crop around one apartment on its plan, with a margin of what is next to it.
export const unitFrame = (area) => {
  const b = area.bbox;
  const pad = Math.max(b.width, b.height) * 0.12;
  return [b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2];
};

// A selected apartment, resolved: its floor, its plan and its traced shape and figures.
// Kept once per apartment, so the same apartment is the same object on every render —
// what lets the panorama below hold on to its lock rather than re-apply it each time.
const RESOLVED = new Map();
export function resolveUnit(ref) {
  const key = unitKey(ref);
  if (!RESOLVED.has(key)) {
    const floor = floorById(ref.floorId);
    const area = floor?.plan ? areasOf(floor.plan).find((a) => a.id === ref.areaId) : null;
    RESOLVED.set(
      key,
      area?.kind === 'unit' ? { key, ref, floor, plan: floor.plan, area, lock: lockFor(floor.plan, area) } : null,
    );
  }
  return RESOLVED.get(key);
}

// The view out of an apartment: its floor's panorama, turned and locked to the room's
// outlook exactly as the single-room view is (see FloorPanoViewer and roomViews.js).
function lockFor(plan, area) {
  const rv = roomViewFor(plan.id, area.id);
  if (!rv) return null;
  return {
    key: `${plan.id}:${area.id}`,
    start: rv.start ?? null,
    limits: { yaw: rv.yaw ?? null, pitch: rv.pitch ?? DEFAULT_PITCH },
  };
}

// Toggle an apartment in or out of the selection. Adding past the limit does nothing;
// the controls show the limit before it is reached.
export function toggleUnit(units, ref) {
  const k = unitKey(ref);
  if (units.some((u) => unitKey(u) === k)) return units.filter((u) => unitKey(u) !== k);
  return units.length < COMPARE_MAX ? [...units, ref] : units;
}

// Opening the comparison from a floor's plan: that floor is always among the plans being
// compared — first, if it was not there already — and an apartment open on the plan is
// among the apartments. A full list makes room by letting go of its last entry.
export function enterCompare(state, tab, floor, area) {
  const floors = state.floors.includes(floor.id)
    ? state.floors
    : [floor.id, ...state.floors].slice(0, COMPARE_MAX);
  let units = state.units;
  if (area?.kind === 'unit') {
    const ref = { floorId: floor.id, areaId: area.id };
    if (!units.some((u) => unitKey(u) === unitKey(ref))) {
      units = [ref, ...units].slice(0, COMPARE_MAX);
    }
  }
  return { ...state, tab, floors, units };
}
