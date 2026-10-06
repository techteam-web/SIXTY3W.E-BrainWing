import { useRef, useState } from 'react';
import { SvgShape } from '../SvgShape';

// The tower again, small, beside an open plan — so the next floor is one click away
// instead of a trip back out to the elevation.
//
// It is the same render and the same traced floor shapes as the full building, with the
// viewBox closed in on the tower. The crop takes in the whole building as it stands in
// the render — the glass tower beside it from x ≈ 187, the shop fronts to x 266, the
// crown at y ≈ 30 and the foot of the ground floor at 223.1 — with sky on either side and
// headroom above, so it reads as the building rather than a strip of it. It frames; it
// moves nothing.

const CROP = [176, 18, 110, 212];

export function MiniBuilding({ building, currentId, onSelect, className = '' }) {
  const root = useRef(null);
  const [hoverId, setHoverId] = useState(null);
  const [x, y, w, h] = CROP;
  const [ax, ay, aw, ah] = building.viewBox;

  const current = building.floors.find((f) => f.id === currentId);
  const pointed = building.floors.find((f) => f.id === hoverId);
  const caption = pointed ?? current;

  const focusFloor = (floor) =>
    root.current?.querySelector(`[data-mini-floor="${floor.id}"]`)?.focus();

  const onKey = (floor, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (floor.plan) onSelect(floor);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const i = building.floors.findIndex((f) => f.id === floor.id);
      const next = building.floors[i + (e.key === 'ArrowUp' ? -1 : 1)];
      if (next) focusFloor(next);
    }
  };

  return (
    <div
      ref={root}
      className={`flex h-full min-h-0 flex-col items-center gap-[clamp(0.5rem,1.1vh,0.8rem)] px-[clamp(1rem,1.4vw,1.6rem)] pb-[clamp(0.8rem,1.4vh,1.2rem)] pt-[clamp(1.1rem,2.2vh,1.8rem)] ${className}`}
    >
      <span className="text-micro uppercase tracking-[0.22em] text-w-cream/50">Change floor</span>

      {/* A size container: the tower takes the larger of the sizes that fit — the full
          width, or the full height times its own aspect — whichever binds first. */}
      <div
        className="grid min-h-0 w-full flex-1 place-items-center"
        style={{ containerType: 'size' }}
      >
        <svg
          viewBox={`${x} ${y} ${w} ${h}`}
          className="block h-auto border border-w-gold/20"
          style={{
            width: `min(100cqw, calc(100cqh * ${w / h}))`,
            aspectRatio: `${w} / ${h}`,
          }}
          role="group"
          aria-label="Change floor"
        >
          <image
            href={building.image}
            x={ax}
            y={ay}
            width={aw}
            height={ah}
            preserveAspectRatio="none"
            aria-hidden="true"
          />
          {building.floors.map((f) => (
            <SvgShape
              key={f.id}
              shape={f}
              data-mini-floor={f.id}
              data-plan={f.plan ? f.plan.id : 'none'}
              data-state={f.id === currentId ? 'selected' : f.id === hoverId ? 'hover' : undefined}
              className="bw-floor"
              role="button"
              tabIndex={0}
              aria-label={f.plan ? `${f.label} — open plan` : `${f.label} — no plan available`}
              aria-current={f.id === currentId ? 'true' : undefined}
              aria-disabled={f.plan ? undefined : true}
              onPointerEnter={() => setHoverId(f.id)}
              onPointerLeave={() => setHoverId((id) => (id === f.id ? null : id))}
              onFocus={() => setHoverId(f.id)}
              onBlur={() => setHoverId((id) => (id === f.id ? null : id))}
              onClick={() => f.plan && onSelect(f)}
              onKeyDown={(e) => onKey(f, e)}
            />
          ))}
        </svg>
      </div>

      {/* What the pointer is on, or where you are. */}
      <span className="flex flex-col items-center gap-[0.2em] text-center" aria-live="polite">
        <span className="text-caption uppercase tracking-[0.14em] text-w-cream">
          {caption?.label}
        </span>
        <span className="text-micro uppercase tracking-[0.18em] text-w-gold/80">
          {caption?.id === currentId
            ? 'Viewing'
            : caption?.plan
              ? caption.plan.kind === 'amenity'
                ? 'Amenity level · click to open'
                : 'Typical floor · click to open'
              : 'Plan not available'}
        </span>
      </span>
    </div>
  );
}
