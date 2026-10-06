import { SvgShape } from '../SvgShape';

// One plan: the drawing, and over it the supplied SVG's own unit and amenity shapes.
//
// The drawing and its shapes share the 460.8×259.2 artboard they were traced in, and the
// viewBox opens on the plan's `frame` — the drawing's bounds — rather than the whole
// artboard, whose outer third is empty paper. Because the image and the shapes are both
// placed in artboard units inside that one viewBox, they cannot drift apart at any zoom.
//
// The hit targets are the traced shapes themselves. At rest they paint nothing, so the
// drawing reads exactly as supplied; the highlight is plans.css's gold wash.

export function FloorPlanSVG({ plan, areas, hoverId, activeId, handlers }) {
  const [fx, fy, fw, fh] = plan.frame;
  const [ax, ay, aw, ah] = plan.layer.viewBox;

  return (
    <svg
      viewBox={`${fx} ${fy} ${fw} ${fh}`}
      className="block h-full w-full"
      role="group"
      aria-label={`${plan.title}, ${plan.floorsLabel}`}
    >
      <image
        href={plan.image}
        x={ax}
        y={ay}
        width={aw}
        height={ah}
        preserveAspectRatio="none"
        role="img"
        aria-label={plan.alt}
      />

      <g aria-hidden="true">
        {areas.map((a) => (
          <SvgShape key={a.id} shape={a} data-cue className="bw-cue bw-cue--plan" />
        ))}
      </g>

      {areas.map((a) => (
        <SvgShape
          key={a.id}
          shape={a}
          data-area={a.id}
          data-state={activeId === a.id ? 'active' : hoverId === a.id ? 'hover' : undefined}
          className="bw-area"
          role="button"
          tabIndex={0}
          aria-label={a.kind === 'unit' ? `${a.label}, ${a.type}` : a.label}
          aria-pressed={activeId === a.id}
          onPointerEnter={(e) => handlers.enter(a, e)}
          onPointerMove={(e) => handlers.move(a, e)}
          onPointerLeave={(e) => handlers.leave(a, e)}
          onClick={(e) => handlers.press(a, e)}
          onKeyDown={(e) => handlers.key(a, e)}
        />
      ))}
    </svg>
  );
}
