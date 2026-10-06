import { useRef } from 'react';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';
import { ArrowIcon } from '../Icons';

// What the pointed-at floor is, said beside the floor itself — and, once the floor is
// chosen, what it opens: its plan, the 360° view from its height, or both.
//
// On a desktop it hangs off the slab's own edge on a gold leader, like a callout on an
// elevation drawing, and flips to the other side when the right edge has no room. While
// the floor is only pointed at, the card is read, not pressed, and never takes the
// pointer. A click pins it, and its choices become real buttons.
//
// On a phone a floor is sixteen pixels tall and a card beside it would cover half the
// tower, so the card docks at the foot of the screen instead, choices and all.

const GAP = 14;
const CARD = 250;

const kindLine = (floor) => {
  if (floor.plan) return floor.plan.kind === 'amenity' ? 'Amenity level' : 'Typical floor';
  return floor.pano ? 'View from this floor' : 'Not available';
};

// What a floor can open, in the order the buttons show.
const choicesFor = (floor) =>
  [
    floor.plan ? { kind: 'plan', label: 'Floor Plan' } : null,
    floor.pano ? { kind: 'pano', label: '360° View' } : null,
  ].filter(Boolean);

function Choices({ floor, onOpen, className = '' }) {
  const choices = choicesFor(floor);
  if (!choices.length) {
    return (
      <span className={`text-micro uppercase tracking-[0.18em] text-w-cream/50 ${className}`}>
        No plan or view for this floor
      </span>
    );
  }
  return (
    <span className={`flex flex-wrap gap-x-[1.4em] gap-y-[0.4em] ${className}`}>
      {choices.map((c, i) => (
        <button
          key={c.kind}
          type="button"
          data-floor-choice={i === 0 ? 'first' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(floor, c.kind);
          }}
          className="group/c flex min-h-[2.75rem] items-center gap-[0.55em] border-b border-w-gold/60 text-micro uppercase tracking-[0.22em] text-w-gold transition-colors duration-300 hover:border-w-gold hover:text-w-gold-lit md:min-h-0 md:pb-[0.35em]"
        >
          {c.label}
          <ArrowIcon
            size="1.1em"
            className="transition-transform duration-300 group-hover/c:translate-x-[0.2em]"
          />
        </button>
      ))}
    </span>
  );
}

// `hover` is the floor being pointed at or chosen now; `shown` is the last one that was,
// kept so the card can fade out still saying what it said.
export function FloorTooltip({ hover, shown, hostWidth, onOpen }) {
  const box = useRef(null);

  const flip = shown ? shown.rect.right + GAP + CARD > hostWidth : false;

  useGSAP(
    () => {
      if (!box.current) return;
      if (hover) {
        gsap.fromTo(
          box.current,
          { autoAlpha: 0, x: flip ? 8 : -8, yPercent: -50 },
          { autoAlpha: 1, x: 0, yPercent: -50, duration: 0.4, ease: E.soft, overwrite: 'auto' },
        );
      } else {
        gsap.to(box.current, { autoAlpha: 0, duration: 0.2, ease: E.soft, overwrite: 'auto' });
      }
    },
    { dependencies: [hover?.floor.id ?? null], revertOnUpdate: false },
  );

  if (!shown) return null;
  const { floor, rect } = shown;
  const pinned = !!hover?.pinned && hover.floor.id === floor.id;
  const any = floor.plan || floor.pano;

  return (
    <div
      ref={box}
      aria-hidden={pinned ? undefined : 'true'}
      className={`invisible absolute z-10 flex items-center max-md:hidden ${
        flip ? 'flex-row-reverse' : ''
      } ${pinned ? '' : 'pointer-events-none'}`}
      style={
        flip
          ? { right: `calc(100% - ${rect.left - GAP}px)`, top: rect.cy }
          : { left: rect.right + GAP, top: rect.cy }
      }
    >
      <span className="hairline w-[2.2em] shrink-0 bg-w-gold/75" />
      <span
        className="glass flex min-w-[10.5em] flex-col gap-[0.3em] px-[1.1em] pb-[0.85em] pt-[0.9em]"
        style={{
          border: `1px solid rgb(var(--gold-rgb) / ${pinned ? 0.5 : 0.3})`,
          boxShadow: '0 24px 60px -28px rgb(2 12 11 / 0.9)',
        }}
      >
        <span className="text-micro uppercase tracking-[0.24em] text-w-gold/80">Floor</span>
        <span className="text-hero font-extralight leading-none tracking-[0.04em] text-w-cream tabular-nums">
          {floor.mark}
        </span>
        <span className="text-micro uppercase tracking-[0.18em] text-w-cream/55">
          {kindLine(floor)}
        </span>
        {pinned ? (
          <Choices
            floor={floor}
            onOpen={onOpen}
            className="mt-[0.45em] border-t border-w-gold/25 pt-[0.7em]"
          />
        ) : any ? (
          <span className="mt-[0.35em] border-t border-w-gold/25 pt-[0.6em] text-micro uppercase tracking-[0.24em] text-w-gold">
            Click to explore
          </span>
        ) : null}
      </span>
    </div>
  );
}

// The phone's version: docked, and its choices are real controls.
export function FloorCard({ hover, onOpen }) {
  const floor = hover?.floor ?? null;

  return (
    <div
      data-stagger
      className="glass absolute inset-x-(--screen-margin) bottom-[calc(var(--screen-margin)+var(--chrome-bottom)+0.4rem)] z-10 flex min-h-[4.25rem] flex-col gap-[0.5em] px-[1.1em] py-[0.75em] md:hidden"
      style={{ border: '1px solid rgb(var(--gold-rgb) / 0.3)' }}
      aria-live="polite"
    >
      {floor ? (
        <>
          <span className="flex min-w-0 items-baseline gap-[0.7em]">
            <span className="text-headline font-extralight leading-none text-w-cream tabular-nums">
              {floor.mark}
            </span>
            <span className="flex min-w-0 flex-col gap-[0.25em]">
              <span className="truncate text-caption uppercase tracking-[0.14em] text-w-cream">
                {floor.label}
              </span>
              <span className="truncate text-micro uppercase tracking-[0.18em] text-w-gold/80">
                {kindLine(floor)}
              </span>
            </span>
          </span>
          <Choices floor={floor} onOpen={onOpen} />
        </>
      ) : (
        <span className="my-auto text-micro uppercase tracking-[0.2em] text-w-cream/60">
          Tap a floor on the tower
        </span>
      )}
    </div>
  );
}
