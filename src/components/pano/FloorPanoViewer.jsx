import { useCallback, useMemo, useRef, useState } from 'react';
import { PanoViewer } from '../../features/pano/PanoViewer';
import { PanoRadar, radarGeometry, drawCone } from './PanoRadar';
import { RoomSetupPanel, SETUP_MODE } from './RoomSetupPanel';
import { useRoomDrafts, roomViewIn } from '../../data/roomViewDraft';
import { DEFAULT_PITCH } from '../../data/roomViews';
import { BUILDING, planAreas } from '../../data/floors';
import { bboxCenter } from '../../data/svgLayer';
import { complete, pitchToSetup, toDeg } from '../../features/pano/panoLimits';
import { FLOOR_PANOS, PANO_DATA, PANO_TILES } from '../../data/floorPanos';
import { ArrowIcon, SunIcon, MoonIcon } from '../Icons';
import { Portal } from '../Primitives';

// The view from a floor, full screen: the drone panorama shot at that floor's height.
//
// It opens out of the building exactly as a plan does — the explorer runs the same film,
// keyed on the same [data-plan-sheet] and [data-plan-chrome] marks — and it carries
// BACK, day or night, up or down a floor, and the radar: the floor's plan in the corner
// with the camera's cone turning as the view turns (see PanoRadar). Stepping runs past
// the top of the elevation to the roof terrace, which was shot but has no slab of its
// own on the drawing.
//
// Day and night are offered only where the data has both (the 14th and 15th borrow a
// neighbour's night view — see floorPanos.js). Where one is missing the toggle says so
// and the view stays on the other.

const levelLabel = (p) => (p.height != null ? `Shot at ${p.height} m` : null);

// Setup mode's live numbers, in the setup's own terms (degrees, up positive).
function writeReadout(el, v) {
  if (!el || !v) return;
  const yaw = ((((toDeg(v.yaw) + 180) % 360) + 360) % 360) - 180;
  el.textContent = `yaw ${yaw.toFixed(1)}° · pitch ${pitchToSetup(v.pitch).toFixed(1)}° · zoom ${toDeg(v.fov).toFixed(1)}°`;
}

// A floor's view is always the view from ONE ROOM on it: turned to that room's outlook
// and locked left–right to it (src/data/roomViews.js), with the floor's rooms offered to
// switch between. It opens on the room it was opened from (`room`, when that was a room
// on the plan — BACK then returns to the plan), or else on the floor's first room.
// Stepping up or down a floor keeps the same room wherever that floor has it. Floors with
// no plan have no rooms, and their view stays a free 360°.
export function FloorPanoViewer({ floor, room: from = null, onBack, onStep, rootRef }) {
  const [id, setId] = useState(floor.pano.id);
  const [mode, setMode] = useState('day');
  const [areaId, setAreaId] = useState(from?.areaId ?? null);
  // The floor-info card starts collapsed to a small pill beside Back.
  const [cardOpen, setCardOpen] = useState(false);

  const i = FLOOR_PANOS.findIndex((p) => p.id === id);
  const view = FLOOR_PANOS[i];
  const shown = view[mode] ? mode : mode === 'day' ? 'night' : 'day';
  const up = FLOOR_PANOS[i + 1] ?? null;
  const down = FLOOR_PANOS[i - 1] ?? null;

  // The rooms of the floor on screen — which, once stepped, need not be `floor`.
  const viewPlan = useMemo(
    () => BUILDING.floors.find((f) => f.level != null && f.level === view.level)?.plan ?? null,
    [view],
  );
  const rooms = useMemo(() => (viewPlan ? planAreas(viewPlan) : []), [viewPlan]);
  const area = rooms.find((a) => a.id === areaId) ?? rooms[0] ?? null;
  const room = useMemo(
    () => (area ? { planId: viewPlan.id, areaId: area.id, label: area.label } : null),
    [area, viewPlan],
  );

  // What the view is locked to: the room, or — on a floor with no plan — the floor
  // itself, filed under the 'floors' group of roomViews.js.
  const floorKey = view.level != null ? String(view.level) : 'terrace';
  const target = useMemo(
    () => room ?? { planId: 'floors', areaId: floorKey, label: view.label },
    [room, floorKey, view.label],
  );

  // Its view: the setup-mode draft while one exists, else roomViews.js. A plan-less floor
  // with no entry of its own takes the floors' default.
  const drafts = useRoomDrafts();
  const roomView = room
    ? roomViewIn(drafts, room.planId, room.areaId)
    : (roomViewIn(drafts, 'floors', floorKey) ?? roomViewIn(drafts, 'floors', 'default'));
  const lock = useMemo(
    () =>
      roomView
        ? {
            key: `${target.planId}:${target.areaId}`,
            start: roomView.start ?? null,
            limits: { yaw: roomView.yaw ?? null, pitch: roomView.pitch ?? DEFAULT_PITCH },
          }
        : null,
    [target, roomView],
  );

  // The radar's dot sits on the room being viewed, not the building's core: the room's
  // own calibrated point (roomView.camera) if one is set, else the centre of its traced
  // shape — so every apartment has its own radar position automatically, with no
  // measuring required, and switching rooms moves the dot (and the cone that turns from
  // it) there too. A plan-less floor has no room and keeps the floor-wide camera.
  const roomCamera = room
    ? (roomView?.camera ?? (area?.bbox ? bboxCenter(area.bbox) : null))
    : null;

  // The radar follows the view. The last view is kept so the cone can be redrawn the
  // moment its element is (re)mounted — shown again after Hide, or on a new floor — and so
  // setup mode can capture it.
  const geo = useMemo(
    () => radarGeometry(view, complete(roomView?.yaw) ? roomView.yaw : null, roomCamera),
    [view, roomView, roomCamera],
  );
  const els = useRef({ cone: null, readout: null, setup: null });
  const last = useRef(null);

  const onViewChange = useCallback(
    (v) => {
      last.current = v;
      drawCone(els.current, geo, v);
      writeReadout(els.current.setup, v);
    },
    [geo],
  );

  const setupReadoutRef = useCallback((el) => {
    els.current.setup = el;
    writeReadout(el, last.current);
  }, []);

  const getView = useCallback(() => last.current, []);

  const coneRef = useCallback(
    (el) => {
      els.current.cone = el;
      if (el && last.current) drawCone(els.current, geo, last.current);
    },
    [geo],
  );

  const readoutRef = useCallback((el) => {
    els.current.readout = el;
  }, []);

  const step = (p) => {
    if (!p) return;
    setId(p.id);
    onStep?.(p);
  };

  return (
    <div
      ref={rootRef}
      data-overflow-ok
      className="absolute inset-0 z-20 overflow-hidden bg-w-deep"
    >
      <div data-plan-sheet className="absolute inset-0">
        <PanoViewer
          view={view}
          mode={shown}
          data={PANO_DATA}
          tiles={PANO_TILES}
          onViewChange={onViewChange}
          lock={lock}
        />
      </div>

      {SETUP_MODE ? (
        <RoomSetupPanel
          room={target}
          roomView={roomView}
          getView={getView}
          readoutRef={setupReadoutRef}
        />
      ) : null}

      {/* No plan, no map to put a dot on — the compass-rings fallback existed only for
          want of one, and reads as a locator with nothing to locate. A plan-less floor
          (the 6th, 13th, 20th, 27th–32nd, the terrace) shows no radar at all. */}
      {geo.plan ? (
        <PanoRadar
          pano={view}
          geo={geo}
          coneRef={coneRef}
          readoutRef={readoutRef}
          rooms={rooms}
          activeAreaId={area?.id}
          onSelectRoom={setAreaId}
        />
      ) : null}

      {/* A shade under the controls, from the scrim teal, so the sky keeps its colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgb(var(--scrim-rgb)/0.55)_0%,rgb(var(--scrim-rgb)/0.2)_24%,transparent_40%)]"
      />

      <div className="pointer-events-none absolute z-10 left-(--screen-margin) top-(--screen-margin) flex flex-col items-start gap-[clamp(0.6rem,1.6vh,1rem)]">
        {/* Back and the floor pill share one row, in the corner MENU and HOME used to hold. */}
        <div className="flex items-center gap-[0.6em]">
          <Portal
            data-plan-chrome
            size="sm"
            iconFirst
            onClick={onBack}
            aria-label={from ? 'Back to the floor plan' : 'Back to the building'}
            icon={<ArrowIcon size="1em" className="rotate-180" />}
            className="pointer-events-auto"
          >
            Back
          </Portal>

          <Portal
            data-plan-chrome
            size="sm"
            onClick={() => setCardOpen((v) => !v)}
            aria-expanded={cardOpen}
            aria-label={cardOpen ? 'Collapse floor details' : 'Expand floor details'}
            icon={
              <ArrowIcon
                size="1em"
                className={`transition-transform duration-300 ${cardOpen ? '-rotate-90' : 'rotate-90'}`}
              />
            }
            className="pointer-events-auto"
          >
            {view.label}
          </Portal>
        </div>

        {cardOpen ? (
          <div
            data-plan-chrome
            className="glass pointer-events-auto flex w-[clamp(14rem,19vw,19rem)] flex-col gap-[clamp(0.7rem,1.6vh,1rem)] overflow-hidden p-[clamp(0.9rem,1.3vw,1.3rem)] pt-[clamp(1.6rem,3vw,2.2rem)]"
            style={{
              background:
                'linear-gradient(168deg, rgb(7 41 40 / 0.9) 0%, rgb(12 59 57 / 0.84) 54%, rgb(15 88 89 / 0.8) 100%)',
              border: '1px solid rgb(var(--gold-rgb) / 0.34)',
              boxShadow: '0 30px 70px -30px rgb(2 12 11 / 0.85)',
              borderTopLeftRadius: 'clamp(2.6rem, 4vw, 3.6rem)',
              borderTopRightRadius: 'clamp(2.6rem, 4vw, 3.6rem)',
            }}
          >
            <div className="flex flex-col gap-[0.35em]">
              <span className="eyebrow">{room ? `View from ${room.label}` : '360° View'}</span>
              <h2 className="text-title font-extralight leading-[1.12] tracking-[0.06em] text-w-cream">
                {view.label}
              </h2>
              {levelLabel(view) ? (
                <span className="text-micro uppercase tracking-[0.16em] text-w-cream/55">
                  {levelLabel(view)}
                </span>
              ) : null}
            </div>

            <ModeToggle view={view} mode={shown} onChange={setMode} />

            {/* The floor's rooms — the view is always from one of them. */}
            {room ? (
              <div className="flex flex-col gap-[0.45em] border-t border-w-line/60 pt-[0.6em]">
                <span className="text-micro uppercase tracking-[0.18em] text-w-cream/50">
                  Rooms
                </span>
                <div className="flex flex-wrap gap-[0.4em]">
                  {rooms.map((a) => {
                    const on = a.id === room.areaId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setAreaId(a.id)}
                        className={`border px-[0.7em] py-[0.35em] text-micro uppercase tracking-[0.14em] transition-colors duration-300 ${
                          on
                            ? 'border-w-gold bg-w-gold text-w-deep'
                            : 'border-w-gold/35 text-w-cream/75 hover:border-w-gold hover:text-w-gold'
                        }`}
                      >
                        {a.kind === 'unit' ? `Apt ${a.short}` : a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col border-t border-w-line/60 pt-[0.4em]">
              <Step dir="up" to={up} onStep={step} />
              <Step dir="down" to={down} onStep={step} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Step({ dir, to, onStep }) {
  return (
    <button
      type="button"
      disabled={!to}
      onClick={() => onStep(to)}
      aria-label={to ? `${dir === 'up' ? 'Up' : 'Down'} to the ${to.label}` : undefined}
      className="group/s flex min-h-[2.4rem] items-center justify-between gap-[1em] text-left disabled:opacity-35"
    >
      <span className="text-micro uppercase tracking-[0.18em] text-w-cream/50">
        {dir === 'up' ? 'Up' : 'Down'}
      </span>
      <span className="flex items-center gap-[0.55em] text-caption uppercase tracking-[0.12em] text-w-cream transition-colors duration-300 group-hover/s:text-w-gold group-disabled/s:text-w-cream">
        {to ? to.label : '—'}
        <ArrowIcon
          size="1em"
          className={`text-w-gold ${dir === 'up' ? '-rotate-90' : 'rotate-90'}`}
        />
      </span>
    </button>
  );
}

function ModeToggle({ view, mode, onChange }) {
  const options = [
    { id: 'day', label: 'Day', icon: <SunIcon size="1em" /> },
    { id: 'night', label: 'Night', icon: <MoonIcon size="1em" /> },
  ];

  return (
    <div role="group" aria-label="Time of day" className="flex shrink-0 gap-x-[1.6em]">
      {options.map((o) => {
        const on = mode === o.id;
        const missing = !view[o.id];
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            disabled={missing}
            title={missing ? `No ${o.label.toLowerCase()} view was shot from this floor` : undefined}
            onClick={() => onChange(o.id)}
            className="group/m relative flex shrink-0 items-center gap-[0.5em] pb-[0.35em] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span
              className={`flex items-center transition-colors duration-300 ${
                on ? 'text-w-gold' : 'text-w-cream/45 group-hover/m:text-w-cream/80'
              }`}
            >
              {o.icon}
            </span>
            <span
              className={`text-micro uppercase tracking-[0.18em] transition-colors duration-300 ${
                on ? 'text-w-gold' : 'text-w-cream/45 group-hover/m:text-w-cream/80'
              }`}
            >
              {o.label}
            </span>
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-px origin-left bg-w-gold transition-transform duration-400 ease-out ${
                on ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
