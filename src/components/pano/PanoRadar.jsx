import { useState } from 'react';
import { BUILDING } from '../../data/floors';
import { radarFor } from '../../data/floorPanos';
import { SvgShape } from '../SvgShape';

// The mini-map on a floor's 360° view: the floor's plan, a dot where the camera stood,
// and a cone showing where the view is pointing — turning as the visitor looks around,
// and widening or narrowing as they zoom.
//
// Floors that have no plan (the 6th, 13th, 20th, 27th and up, the terrace) get the same
// cone on plain rings instead: which way you are facing is still worth showing when
// there is no drawing to show it on.
//
// The cone is drawn by drawCone(), called from the panorama's own change event, and it
// writes straight to the SVG: a React render per frame of a drag would be the whole card.
//
// Where the camera sits and which way is the cone's zero are calibration, not data — see
// RADAR in src/data/floorPanos.js. With ?calibrate on the URL the card prints the live
// yaw, which is what that calibration is measured with.

const CALIBRATE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('calibrate');

const RINGS = { frame: [-50, -50, 100, 100], camera: [0, 0], radius: 44 };

// The sector (the locked-outlook arc) is drawn a little past the cone's own radius — see
// sectorPath — so fitting the circle to the frame has to leave room for that too, or the
// sector would clip even when the cone itself fits cleanly.
const SECTOR_K = 1.08;
// Never shrunk smaller than this fraction of the room-centred radius: past this point a
// locator this small stops being legible, and the rare apartment whose centre is closer
// to the frame edge than that is left to the svg's own overflow instead (see PanoRadar).
const MIN_RADIUS_K = 0.4;

// The largest radius whose circle — and the slightly larger sector built on it — stays
// fully inside the plan's own frame from this camera point, clamped to the room's own
// radius at the top and to MIN_RADIUS_K at the bottom. An apartment is drawn from where
// it actually is, including hard against the building's outer wall, and a locator
// clipped there is worse than one drawn a little smaller.
function fitRadius([cx, cy], [fx, fy, fw, fh], radius) {
  const edge = Math.min(cx - fx, fx + fw - cx, cy - fy, fy + fh - cy);
  // A hair short of the true edge distance, so the stroke itself never grazes the frame.
  const fit = (Math.max(0, edge) * 0.96) / SECTOR_K;
  return Math.max(radius * MIN_RADIUS_K, Math.min(radius, fit));
}

// What the card draws for a vantage: the plan's frame and the camera within it, or rings.
//
// `yawRange`, optional: a room's locked outlook [left, right] in degrees, drawn as a
// faint sector behind the cone.
//
// `roomCamera`, optional: the room being viewed's own dot position, in plan units — its
// bbox centre by default, or a calibrated override (ROOM_VIEWS[plan][room].camera). This
// is what moves the dot and the cone off the building's core and onto the room: heading
// and rotation are untouched, only where they are DRAWN FROM moves, and the radius with
// it (fitRadius) so the circle it is drawn at never runs past the plan's own frame. With
// no room (a plan-less floor, or none given) the floor-wide camera is used, exactly as
// before, at the floor's own fixed radius.
export function radarGeometry(pano, yawRange = null, roomCamera = null) {
  const floor = pano.level != null ? BUILDING.floors.find((f) => f.level === pano.level) : null;
  const plan = floor?.plan ?? null;
  const { heading, camera } = radarFor(pano.level);
  if (!plan) return { plan: null, heading, yawRange, ...RINGS };
  const frame = plan.frame;
  const [x, y, w, h] = frame;
  const point = roomCamera ?? camera ?? [x + w / 2, y + h / 2];
  const baseRadius = Math.min(w, h) * 0.44;
  return {
    plan,
    heading,
    yawRange,
    frame,
    camera: point,
    radius: roomCamera ? fitRadius(point, frame, baseRadius) : baseRadius,
  };
}

// A point `r` out from the camera at a plan angle, degrees clockwise from the plan's top.
const at = ([cx, cy], r, deg) => {
  const t = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(t), cy - r * Math.cos(t)];
};

// The locked outlook: from its left edge to its right edge, clockwise.
function sectorPath(geo) {
  if (!geo.yawRange) return null;
  const [l, r] = geo.yawRange;
  const span = (((r - l) % 360) + 360) % 360;
  if (span < 0.1) return null;
  const R = geo.radius * SECTOR_K;
  const [sx, sy] = at(geo.camera, R, l + geo.heading);
  const [ex, ey] = at(geo.camera, R, r + geo.heading);
  const [cx, cy] = geo.camera;
  return `M${cx} ${cy}L${sx} ${sy}A${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${ex} ${ey}Z`;
}

// The cone, pointing up the plan at yaw 0 and turned clockwise by yaw + heading.
export function drawCone(els, geo, { yaw, hfov }) {
  const { cone, readout } = els;
  if (cone) {
    const [cx, cy] = geo.camera;
    const r = geo.radius;
    const a = Math.min(hfov, Math.PI * 0.95) / 2;
    const sx = cx - r * Math.sin(a);
    const ex = cx + r * Math.sin(a);
    const ey = cy - r * Math.cos(a);
    cone.setAttribute('d', `M${cx} ${cy}L${sx} ${ey}A${r} ${r} 0 0 1 ${ex} ${ey}Z`);
    const deg = (yaw * 180) / Math.PI + geo.heading;
    cone.setAttribute('transform', `rotate(${deg} ${cx} ${cy})`);
  }
  if (readout) {
    const d = (((yaw * 180) / Math.PI) % 360 + 360) % 360;
    readout.textContent = `yaw ${d.toFixed(1)}°`;
  }
}

// `rooms`, `activeAreaId`, `onSelectRoom`: the plan's own rooms, drawn on the map so one
// can be chosen from here too — the same switch the Rooms row under the card makes.
export function PanoRadar({ pano, geo, coneRef, readoutRef, rooms = [], activeAreaId, onSelectRoom }) {
  const [hidden, setHidden] = useState(false);
  const [hoverId, setHoverId] = useState(null);
  const [x, y, w, h] = geo.frame;
  const [cx, cy] = geo.camera;
  const gradId = `radar-cone-${pano.id}`;
  const sector = sectorPath(geo);

  if (hidden) {
    return (
      <button
        data-plan-chrome
        type="button"
        onClick={() => setHidden(false)}
        className="glass absolute z-10 right-(--screen-margin) bottom-[calc(var(--screen-margin)+var(--chrome-bottom)+0.4rem)] flex min-h-[2.75rem] items-center gap-[0.6em] px-[1em] text-micro uppercase tracking-[0.22em] text-w-gold md:min-h-0 md:py-[0.6em]"
        style={{ border: '1px solid rgb(var(--gold-rgb) / 0.3)' }}
      >
        <Dot />
        Show map
      </button>
    );
  }

  return (
    <div
      data-plan-chrome
      className="glass absolute z-10 right-(--screen-margin) bottom-[calc(var(--screen-margin)+var(--chrome-bottom)+0.4rem)] flex w-[clamp(13rem,19vw,22rem)] flex-col gap-[0.6em] p-[clamp(0.6rem,0.8vw,0.9rem)] max-md:w-[11.5rem]"
      style={{
        border: '1px solid rgb(var(--gold-rgb) / 0.3)',
        boxShadow: '0 30px 70px -30px rgb(2 12 11 / 0.85)',
      }}
    >
      <div className="flex items-center justify-between gap-[0.8em]">
        <span className="flex min-w-0 items-center gap-[0.55em]">
          <Dot />
          <span className="truncate text-micro uppercase tracking-[0.2em] text-w-cream">
            {geo.plan ? `${pano.label} Plan` : pano.label}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="shrink-0 border border-w-gold/35 px-[0.7em] py-[0.25em] text-micro uppercase tracking-[0.16em] text-w-cream/70 transition-colors duration-300 hover:border-w-gold hover:text-w-gold"
        >
          Hide
        </button>
      </div>

      {/* Two SVGs, exactly stacked, sharing one viewBox. The base one is the plan itself
          — the render and the room shapes — and keeps its ordinary clipped overflow: that
          crop to the drawing is deliberate (see PLANS.frame in floors.js) and must never
          show the artwork past it. The overlay carries only the locator — the dot, the
          cone, the locked-outlook sector — and is left to overflow: fitRadius (above)
          keeps it inside the frame for every room this plan actually has, but an overlay
          of its own is what guarantees it rather than hoping the fit is exact, and the
          one layer it can safely bleed past is this one, which draws nothing a crop
          would need to hide. */}
      <div className="relative w-full" style={{ aspectRatio: `${w} / ${h}` }}>
        <svg
          viewBox={`${x} ${y} ${w} ${h}`}
          className={`block h-full w-full ${geo.plan ? 'bg-w-ivory' : ''}`}
          role="img"
          aria-label={`Where the view is facing, on the ${geo.plan ? 'floor plan' : 'compass'}`}
        >
          {geo.plan ? (
            <image
              href={geo.plan.image}
              x={geo.plan.layer.viewBox[0]}
              y={geo.plan.layer.viewBox[1]}
              width={geo.plan.layer.viewBox[2]}
              height={geo.plan.layer.viewBox[3]}
              preserveAspectRatio="none"
            />
          ) : (
            <g fill="none" stroke="var(--color-w-gold)" strokeOpacity="0.25" vectorEffect="non-scaling-stroke">
              <circle cx="0" cy="0" r="44" />
              <circle cx="0" cy="0" r="29" />
              <circle cx="0" cy="0" r="14" />
              <path d="M-48 0H48M0 -48V48" strokeOpacity="0.14" />
            </g>
          )}

          {/* The floor's rooms, drawn over the plan — the same shapes the plan itself
              uses, so a room here is exactly where it is there. Clicking one switches the
              view the way the Rooms row does. */}
          {rooms.map((a) => (
            <SvgShape
              key={a.id}
              shape={a}
              data-state={a.id === activeAreaId ? 'active' : a.id === hoverId ? 'hover' : undefined}
              className="bw-area"
              role="button"
              tabIndex={-1}
              aria-label={a.kind === 'unit' ? `${a.label}, ${a.type}` : a.label}
              aria-pressed={a.id === activeAreaId}
              onPointerEnter={() => setHoverId(a.id)}
              onPointerLeave={() => setHoverId((id) => (id === a.id ? null : id))}
              onClick={() => onSelectRoom?.(a.id)}
            />
          ))}
        </svg>

        <svg
          aria-hidden="true"
          viewBox={`${x} ${y} ${w} ${h}`}
          className="pointer-events-none absolute inset-0 block h-full w-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id={gradId} cx={cx} cy={cy} r={geo.radius} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--color-w-gold)" stopOpacity="0.75" />
              <stop offset="100%" stopColor="var(--color-w-gold)" stopOpacity="0.08" />
            </radialGradient>
          </defs>

          {sector ? (
            <path
              d={sector}
              fill="var(--color-w-gold)"
              fillOpacity="0.12"
              stroke="var(--color-w-gold)"
              strokeOpacity="0.45"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          <path
            ref={coneRef}
            fill={`url(#${gradId})`}
            stroke="var(--color-w-gold-deep)"
            strokeWidth="1"
            strokeOpacity="0.6"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={cx} cy={cy} r={geo.radius * 0.07} fill="var(--color-w-gold-deep)" />
          <circle
            cx={cx}
            cy={cy}
            r={geo.radius * 0.07}
            fill="none"
            stroke="var(--color-w-ivory)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {CALIBRATE ? (
        <span ref={readoutRef} className="text-micro tabular-nums tracking-[0.1em] text-w-gold" />
      ) : null}
    </div>
  );
}

function Dot() {
  return <span aria-hidden="true" className="h-[0.45em] w-[0.45em] shrink-0 rounded-full bg-w-gold" />;
}
