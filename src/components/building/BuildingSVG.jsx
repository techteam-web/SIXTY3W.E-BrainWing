import { SvgShape } from '../SvgShape';

// The elevation: the render, and over it the supplied SVG's own floor shapes in the same
// 460.8×259.2 frame. They are the hit targets — the pointer lands on the traced slab
// itself, not on a box laid over it — and at rest they paint nothing, so the building
// reads exactly as the render does.
//
// `slice`, the SVG's own object-fit: cover. The render fills the screen as every other
// full-bleed ground in the app does, and because the floors live inside the same
// viewBox they are cropped and scaled with it, never beside it.
//
// Three layers inside one group, so the transition can scale them as one:
//   the render  ·  a void scrim the transition raises around the chosen floor  ·  the floors
// The cue copies sit under the live shapes and are GSAP's alone (see plans.css).

export function BuildingSVG({
  building,
  hoverId,
  selectedId,
  stageRef,
  scrimRef,
  onEnter,
  onLeave,
  onFocus,
  onBlur,
  onPress,
  onKey,
}) {
  const [x, y, w, h] = building.viewBox;

  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 block h-full w-full"
      role="group"
      aria-label="The tower, floor by floor. Select a floor to open its plan."
    >
      <g ref={stageRef}>
        <image
          href={building.image}
          x={x}
          y={y}
          width={w}
          height={h}
          preserveAspectRatio="none"
          role="img"
          aria-label={building.alt}
        />

        <rect
          ref={scrimRef}
          x={x}
          y={y}
          width={w}
          height={h}
          fill="var(--color-w-void)"
          opacity="0"
          pointerEvents="none"
        />

        <g aria-hidden="true">
          {building.floors
            .filter((f) => f.plan || f.pano)
            .map((f) => (
              <SvgShape key={f.id} shape={f} data-cue className="bw-cue" />
            ))}
        </g>

        {building.floors.map((f) => (
          <SvgShape
            key={f.id}
            shape={f}
            data-floor={f.id}
            data-plan={f.plan || f.pano ? 'yes' : 'none'}
            data-state={selectedId === f.id ? 'selected' : hoverId === f.id ? 'hover' : undefined}
            className="bw-floor"
            role="button"
            tabIndex={0}
            aria-label={
              f.plan && f.pano
                ? `${f.label} — floor plan or 360° view`
                : f.plan
                  ? `${f.label} — floor plan`
                  : f.pano
                    ? `${f.label} — 360° view`
                    : `${f.label} — no plan or view available`
            }
            aria-disabled={f.plan || f.pano ? undefined : true}
            onPointerEnter={(e) => onEnter(f, e)}
            onPointerLeave={(e) => onLeave(f, e)}
            onFocus={() => onFocus(f)}
            onBlur={() => onBlur(f)}
            onClick={() => onPress(f)}
            onKeyDown={(e) => onKey(f, e)}
          />
        ))}
      </g>
    </svg>
  );
}
