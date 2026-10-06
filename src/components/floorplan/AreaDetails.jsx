import { useRef } from 'react';
import { Render } from '../Primitives';
import { ArrowIcon, CloseIcon } from '../Icons';
import { LANDING } from '../../data/content';
import { ordinal } from '../../data/floors';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';
import { useMediaQuery } from '../../hooks/useEventListener';

// What a unit or an amenity is, once it has been chosen.
//
// Only what the project already publishes: a residence's RERA carpet area and its type,
// an amenity's area as printed on its plan, and — where the brochure photographed it — the
// room itself. Nothing is estimated and nothing is filled in to make the panel look fuller.
//
// Glass on the right on a wide screen, the app's material for a panel standing over
// content; a sheet from the bottom on a phone, where a side panel would cover the plan.

const sqm = (v) => `${v.toFixed(2)} sq.m`;
const sqft = (v) => `${Number.isInteger(v) ? v : v.toFixed(2)} sq.ft.`;

function rowsFor(area, plan, floor) {
  if (area.kind === 'unit') {
    return [
      ['RERA carpet area', sqft(area.carpet)],
      ['Floor', ordinal(floor.level)],
      ['Typical floors', plan.floorsLabel],
    ];
  }
  const rows = [];
  if (area.sqm != null) rows.push(['Area', `${sqm(area.sqm)} · ${sqft(area.sqft)}`]);
  rows.push(['Floor', ordinal(floor.level)]);
  return rows;
}

// `onRoomView(area)`, optional: offered when the floor has a 360° view.
export function AreaDetails({ area, plan, floor, onClose, onRoomView }) {
  const box = useRef(null);
  const wide = useMediaQuery('(min-width: 48rem)');

  // The panel arrives once; switching from one unit to the next re-sets only the rows,
  // so the panel holds still while what it says changes.
  useGSAP(
    () => {
      if (!box.current) return;
      gsap.fromTo(
        box.current,
        wide ? { x: 28, yPercent: 0, autoAlpha: 0 } : { x: 0, yPercent: 100, autoAlpha: 1 },
        { x: 0, yPercent: 0, autoAlpha: 1, duration: 0.6, ease: E.out, overwrite: 'auto' },
      );
    },
    { dependencies: [!!area, wide], revertOnUpdate: false },
  );

  useGSAP(
    () => {
      if (!box.current) return;
      gsap.fromTo(
        '[data-detail-row]',
        { y: 10, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: E.out, stagger: 0.05, delay: 0.1, overwrite: 'auto' },
      );
    },
    { dependencies: [area?.id], scope: box, revertOnUpdate: false },
  );

  if (!area) return null;

  const unit = area.kind === 'unit';

  return (
    <aside
      ref={box}
      aria-label={`${area.label} details`}
      data-overflow-ok
      className="glass absolute z-30 flex flex-col gap-[clamp(0.7rem,1.6vh,1.1rem)] overflow-hidden md:right-(--screen-margin) md:top-[calc(var(--screen-margin)+var(--chrome-top))] md:max-h-[calc(100%-var(--screen-margin)*2-var(--chrome-top)-var(--chrome-bottom))] md:w-[clamp(17rem,23vw,24rem)] md:px-[clamp(1.1rem,1.5vw,1.8rem)] md:pb-[clamp(1.1rem,1.5vw,1.8rem)] md:pt-[clamp(2.2rem,3vw,3.4rem)] max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[62%] max-md:border-x-0 max-md:border-b-0 max-md:px-(--screen-margin) max-md:pb-[calc(var(--screen-margin)+var(--chrome-bottom))] max-md:pt-[1.1rem]"
      style={{
        background:
          'linear-gradient(168deg, rgb(7 41 40 / 0.94) 0%, rgb(12 59 57 / 0.9) 54%, rgb(15 88 89 / 0.86) 100%)',
        border: '1px solid rgb(var(--gold-rgb) / 0.34)',
        boxShadow: '0 30px 70px -30px rgb(2 12 11 / 0.85)',
        // The arch crown as a LENGTH — 31.558% of the panel's own width formula — for the
        // reason the Location panel gives: a percentage radius on a portrait box is an
        // ellipse that swallows the heading. A bottom sheet stays square.
        borderTopLeftRadius: wide ? 'clamp(5.36rem, 7.26vw, 7.57rem)' : 0,
        borderTopRightRadius: wide ? 'clamp(5.36rem, 7.26vw, 7.57rem)' : 0,
      }}
    >
      <div className="flex items-start justify-between gap-[1em]">
        <div className="flex min-w-0 flex-col gap-[0.45em]">
          <span data-detail-row className="eyebrow">
            {unit ? area.label : `Amenity · ${ordinal(floor.level)} Floor`}
          </span>
          <h3
            data-detail-row
            className="text-title font-extralight leading-[1.12] tracking-[0.06em] text-w-cream"
          >
            {unit ? `${area.type} Residence` : area.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="-mr-[0.6em] -mt-[0.5em] grid h-[2.75rem] w-[2.75rem] shrink-0 place-items-center text-w-cream/60 transition-colors duration-300 hover:text-w-gold"
        >
          <CloseIcon size="1.15em" />
        </button>
      </div>

      {area.render ? (
        <div
          data-detail-row
          className="crown relative aspect-[16/10] w-full shrink-0 overflow-hidden max-md:aspect-[16/7]"
        >
          <Render id={area.render} sizes="(max-width: 767px) 94vw, 24vw" />
        </div>
      ) : null}

      <dl className="flex min-w-0 flex-col">
        {rowsFor(area, plan, floor).map(([k, v]) => (
          <div
            key={k}
            data-detail-row
            className="flex items-baseline justify-between gap-[1em] border-t border-w-line/60 py-[clamp(0.4rem,1vh,0.65rem)]"
          >
            <dt className="shrink-0 text-micro uppercase tracking-[0.18em] text-w-cream/50">{k}</dt>
            <dd className="m-0 min-w-0 text-right text-caption tabular-nums text-w-cream">{v}</dd>
          </div>
        ))}
      </dl>

      {/* The view from this room: the floor's panorama, turned to face out of it. */}
      {onRoomView ? (
        <button
          data-detail-row
          type="button"
          onClick={() => onRoomView(area)}
          className="group/v flex min-h-[2.75rem] items-center justify-between gap-[1em] border border-w-gold/50 px-[1em] py-[0.6em] text-micro uppercase tracking-[0.22em] text-w-gold transition-colors duration-300 hover:bg-w-gold hover:text-w-deep md:min-h-0"
        >
          360° View from here
          <ArrowIcon
            size="1.1em"
            className="transition-transform duration-300 group-hover/v:translate-x-[0.2em]"
          />
        </button>
      ) : null}

      <p data-detail-row className="text-micro leading-[1.45] text-w-cream/35 max-md:hidden">
        {LANDING.note}
      </p>
    </aside>
  );
}
