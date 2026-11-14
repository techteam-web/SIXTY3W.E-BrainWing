import { useRef, useState } from 'react';
import { UnitPlan, KeyPlan } from '../compare/CompareParts';
import { ArrowIcon } from '../Icons';
import { Portal } from '../Primitives';
import { NorthArrow } from './NorthArrow';
import { ordinal, PLAN_NORTH } from '../../data/floors';
import { unitFrame } from '../../data/compare';
import { gsap, useGSAP, E, prefersReducedMotion } from '../../gsap/Gsapconfig';

// One apartment's own plan, opened from the floor plan: the floor's drawing cropped to
// the apartment with everything around it veiled (the same UnitPlan the comparison
// draws), its north point, and beside it what the apartment is — its figures, where it
// sits on the floor, the next and previous apartments, and the view out of it.
//
// Where the client supplied the apartment's own sheet (the 28th–31st, A-1 to A-3) it is
// offered too. The sheets are drawn square to the apartment rather than as it stands on
// the floor, so the north point is shown only on the floor's own crop.

const rowsFor = (area, plan, floor) =>
  [
    area.carpet != null ? ['RERA carpet area', `${area.carpet} sq.ft.`] : null,
    ['Type', area.type],
    ['Floor', ordinal(floor.level)],
    ['Typical floors', plan.floorsLabel],
  ].filter(Boolean);

export function UnitPlanViewer({ floor, plan, units, area, onPick, onClose, onRoomView }) {
  const root = useRef(null);
  const [sheet, setSheet] = useState(false);
  // The supplied sheet's own shape, read off the image once it loads (they run from
  // near-square wings to Apartment 02's long strip), so its paper fits it.
  const [sheetAspect, setSheetAspect] = useState(1.25);
  const [x, y, w, h] = unitFrame(area);
  const i = units.findIndex((u) => u.id === area.id);
  const prev = units.length > 1 ? units[(i - 1 + units.length) % units.length] : null;
  const next = units.length > 1 ? units[(i + 1) % units.length] : null;
  const showSheet = sheet && !!area.sheet;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '[data-unit-sheet]',
        { autoAlpha: 0, scale: 0.97 },
        { autoAlpha: 1, scale: 1, duration: 0.55, ease: E.out },
      );
      gsap.fromTo(
        '[data-unit-row]',
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: E.out, stagger: 0.04, delay: 0.1 },
      );
    },
    { scope: root, dependencies: [area.id, showSheet], revertOnUpdate: false },
  );

  // The sheet is fitted in CSS alone: the smaller of the space's width and its height
  // times the drawing's own aspect.
  const aspect = showSheet ? sheetAspect : w / h;

  return (
    <div
      ref={root}
      role="dialog"
      aria-label={`${area.label} plan`}
      className="ground-quiet absolute inset-0 z-40 overflow-hidden bg-w-deep"
    >
      <div aria-hidden="true" className="lattice pointer-events-none absolute inset-0" />

      <div className="absolute inset-0 grid grid-cols-[minmax(0,1fr)_clamp(17rem,24vw,24rem)] gap-[clamp(1.2rem,2.6vw,2.8rem)] px-(--screen-margin) pb-[calc(var(--screen-margin)+var(--chrome-bottom))] pt-[calc(var(--screen-margin)+var(--chrome-top)+clamp(3.4rem,7vh,4.6rem))] max-lg:grid-cols-1 max-lg:grid-rows-[minmax(16rem,1fr)_auto] max-lg:gap-[1.2rem] max-lg:overflow-y-auto">
        {/* The plan, on its ivory sheet. */}
        <div className="grid min-h-0 place-items-center" style={{ containerType: 'size' }}>
          <div
            data-unit-sheet
            className="crown relative bg-w-ivory shadow-[0_28px_70px_-30px_rgb(4_26_25/0.75)]"
            style={{
              aspectRatio: `${aspect}`,
              width: `min(100cqw, calc(100cqh * ${aspect}))`,
            }}
          >
            {showSheet ? (
              <img
                src={area.sheet}
                alt={`${area.label}, plan`}
                draggable={false}
                onLoad={(e) => {
                  const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget;
                  // The paper is a little taller than the drawing, for the crown's curve.
                  if (nw && nh) setSheetAspect(nw / (nh * 1.22));
                }}
                className="absolute inset-0 h-full w-full object-contain p-[3%] pt-[12%]"
              />
            ) : (
              <>
                <UnitPlan plan={plan} area={area} />
                <NorthArrow
                  deg={PLAN_NORTH}
                  className="absolute bottom-[3%] right-[2%] w-[clamp(3.2rem,4.8vw,5rem)]"
                />
              </>
            )}
          </div>
        </div>

        {/* What it is. */}
        {/* Centred beside the plan; on a phone it flows down beneath it and scrolls. */}
        <aside className="flex min-h-0 flex-col justify-center gap-[clamp(0.8rem,1.8vh,1.2rem)] max-lg:justify-start">
          <div data-unit-row className="flex flex-col gap-[0.4em]">
            <span className="eyebrow">
              {area.label} · {floor.label}
            </span>
            <h2 className="text-title font-extralight leading-[1.12] tracking-[0.06em] text-w-cream">
              {area.type} Residence
            </h2>
          </div>

          <dl data-unit-row className="flex flex-col">
            {rowsFor(area, plan, floor).map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-[1em] border-t border-w-line/60 py-[clamp(0.4rem,1vh,0.6rem)]"
              >
                <dt className="shrink-0 text-micro uppercase tracking-[0.18em] text-w-cream/50">{k}</dt>
                <dd className="m-0 min-w-0 text-right text-caption tabular-nums text-w-cream">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Where it sits on the floor. */}
          <div data-unit-row className="flex flex-col gap-[0.45em]">
            <span className="text-micro uppercase tracking-[0.18em] text-w-cream/50">On the floor</span>
            <KeyPlan plan={plan} area={area} className="w-full" />
          </div>

          {area.sheet ? (
            <div data-unit-row role="group" aria-label="Plan drawing" className="flex gap-[0.4em]">
              {[
                [false, 'As on the floor'],
                [true, 'Unit sheet'],
              ].map(([v, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={sheet === v}
                  onClick={() => setSheet(v)}
                  className={`flex-1 border px-[0.7em] py-[0.45em] text-micro uppercase tracking-[0.14em] transition-colors duration-300 ${
                    sheet === v
                      ? 'border-w-gold bg-w-gold text-w-deep'
                      : 'border-w-gold/35 text-w-cream/75 hover:border-w-gold hover:text-w-gold'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {/* The next apartment along, either way — without going back to the floor. */}
          {prev && next ? (
            <div data-unit-row className="flex gap-[0.4em]">
              <button type="button" className="bw-btn flex-1 justify-center" onClick={() => onPick(prev.id)}>
                <ArrowIcon size="1em" className="rotate-180 text-w-gold" />
                Apt {prev.short}
              </button>
              <button type="button" className="bw-btn flex-1 justify-center" onClick={() => onPick(next.id)}>
                Apt {next.short}
                <ArrowIcon size="1em" className="text-w-gold" />
              </button>
            </div>
          ) : null}

          {onRoomView ? (
            <button
              data-unit-row
              type="button"
              onClick={() => onRoomView(area)}
              className="group/v flex min-h-[2.75rem] items-center justify-between gap-[1em] border border-w-gold/50 px-[1em] py-[0.6em] text-micro uppercase tracking-[0.22em] text-w-gold transition-colors duration-300 hover:bg-w-gold hover:text-w-deep md:min-h-0"
            >
              360° View from here
              <ArrowIcon size="1.1em" className="transition-transform duration-300 group-hover/v:translate-x-[0.2em]" />
            </button>
          ) : null}
        </aside>
      </div>

      <div className="absolute z-10 left-(--screen-margin) top-[calc(var(--screen-margin)+var(--chrome-top))]">
        <Portal
          size="sm"
          iconFirst
          onClick={onClose}
          aria-label="Back to the floor plan"
          icon={<ArrowIcon size="1em" className="rotate-180" />}
        >
          Floor plan
        </Portal>
      </div>
    </div>
  );
}
