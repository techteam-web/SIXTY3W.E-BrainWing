import { useSyncExternalStore } from 'react';
import { ROOM_VIEWS } from './roomViews';

// Setup mode's scratchpad (?calibrate): room views edited in the app, held in memory and
// read over ROOM_VIEWS until the page reloads. Nothing is saved anywhere — the panel
// copies the result out, and it is pasted into roomViews.js by hand.
//
// An external store, read with useSyncExternalStore, so the pano, the radar and the
// panel all see an edit in the same render.

let drafts = {};
const listeners = new Set();

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useRoomDrafts = () =>
  useSyncExternalStore(
    subscribe,
    () => drafts,
    () => drafts,
  );

// Merge fields into one room's draft; a field set to null is cleared. `seed` is what the
// room shows when it has no entry of its own yet (a plan-less floor on the floors'
// default) — its first edit starts from that, not from nothing.
export function editRoom(planId, areaId, patch, seed = null) {
  const current = drafts[planId]?.[areaId] ?? ROOM_VIEWS[planId]?.[areaId] ?? seed ?? {};
  const next = { ...current };
  for (const [k, v] of Object.entries(patch)) {
    if (v == null) delete next[k];
    else next[k] = v;
  }
  drafts = { ...drafts, [planId]: { ...drafts[planId], [areaId]: next } };
  for (const l of listeners) l();
}

// A room's effective view: its draft while one exists, else the file's entry.
export const roomViewIn = (all, planId, areaId) =>
  all[planId]?.[areaId] ?? ROOM_VIEWS[planId]?.[areaId] ?? null;

// Every room, file entries with this session's drafts over them — what "Copy all" copies.
export function allRoomViews(all) {
  const out = {};
  for (const src of [ROOM_VIEWS, all]) {
    for (const [plan, rooms] of Object.entries(src)) {
      out[plan] = { ...out[plan], ...rooms };
    }
  }
  return out;
}
