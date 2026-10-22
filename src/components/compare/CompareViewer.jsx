import { useRef, useState } from 'react';
import { Portal } from '../Primitives';
import { ArrowIcon, PlusIcon } from '../Icons';
import { ModeToggle } from '../pano/FloorPanoViewer';
import { CompareFloors } from './CompareFloors';
import { CompareUnits } from './CompareUnits';
import { CompareViews } from './CompareViews';
import { COMPARE_MAX, resolveUnit } from '../../data/compare';
import { gsap, useGSAP, E, prefersReducedMotion } from '../../gsap/Gsapconfig';

// Compare, full screen, opened from a floor's plan: floors side by side, apartments side
// by side, and — from the apartments, and only from there — the views out of them.
//
// It stands where the plan stood and opens the way the room view does: the explorer fades
// the plan out and this in, keyed on the same [data-plan-sheet] and [data-plan-chrome]
// marks. What is being compared is the explorer's to keep (`compare`), so stepping back
// to the plan and in again finds the comparison as it was left.

const TABS = [
  { id: 'floors', label: 'floors' },
  { id: 'units', label: 'units' },
];

export function CompareViewer({ floor, compare, onChange, onBack, rootRef }) {
  const { tab, floors, units } = compare;
  const views = tab === 'views';
  const [mode, setMode] = useState('day');
  const body = useRef(null);

  const set = (patch) => onChange((c) => ({ ...c, ...patch }));

  // The columns rise in, one after the other, whenever the tab changes.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '[data-cmp-slot]',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: E.out, stagger: 0.07, overwrite: 'auto' },
      );
    },
    { dependencies: [tab], scope: body, revertOnUpdate: false },
  );

  // Day and night are offered as far as the chosen floors were shot that way.
  const panos = units.map(resolveUnit).flatMap((u) => (u?.floor.pano ? [u.floor.pano] : []));
  const shot = { day: panos.some((p) => p.day), night: panos.some((p) => p.night) };

  return (
    <div
      ref={rootRef}
      data-overflow-ok
      className="ground-quiet absolute inset-0 z-20 overflow-hidden bg-w-deep"
    >
      <div aria-hidden="true" className="lattice pointer-events-none absolute inset-0" />

      <div className="relative flex h-full flex-col gap-[clamp(0.7rem,1.8vh,1.3rem)] px-(--screen-margin) pb-[calc(var(--screen-margin)+var(--chrome-bottom)+0.3rem)] pt-[calc(var(--screen-margin)+var(--chrome-top))]">
        <header data-plan-chrome className="flex flex-wrap items-center gap-[0.6em]">
          <Portal
            size="sm"
            iconFirst
            onClick={views ? () => set({ tab: 'units' }) : onBack}
            aria-label={views ? 'Back to the unit comparison' : 'Back to the floor plan'}
            icon={<ArrowIcon size="1em" className="rotate-180" />}
          >
            Back
          </Portal>

          <div role="tablist" aria-label="Compare" className="flex gap-[0.45em]">
            {TABS.map((t) => {
              const on = tab === t.id || (views && t.id === 'units');
              const count = t.id === 'floors' ? floors.length : units.length;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="compare-panel"
                  onClick={() => set({ tab: t.id })}
                  className="bw-btn"
                >
                  <span>
                    <span className="max-md:hidden">Compare </span>
                    {t.label}
                  </span>
                  <span className="bw-count" aria-label={`${count} chosen`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* What the tab leads on to: the views, from the units — and, once there, the
              time of day. Beside the tabs rather than across from them: the far end of
              this row is under the lockup. */}
          {tab === 'units' ? (
            <button
              type="button"
              className="bw-btn bw-btn--cta max-lg:w-full lg:ml-[0.9em]"
              disabled={!units.length}
              title={units.length ? undefined : 'Add a unit first'}
              onClick={() => set({ tab: 'views' })}
            >
              Compare 360° views
              <ArrowIcon size="1.1em" />
            </button>
          ) : null}

          {views ? (
            <div className="flex items-center gap-[1.4em] max-lg:w-full max-lg:justify-between lg:ml-[1.4em]">
              <ModeToggle view={shot} mode={mode} onChange={setMode} />
              {units.length < COMPARE_MAX ? (
                <button type="button" className="bw-btn" onClick={() => set({ tab: 'units' })}>
                  <PlusIcon size="1.1em" className="text-w-gold" />
                  Add unit
                </button>
              ) : null}
            </div>
          ) : null}
        </header>

        <div
          ref={body}
          id="compare-panel"
          role="tabpanel"
          aria-label={views ? 'Compare 360° views' : `Compare ${tab}`}
          data-plan-sheet
          className="relative min-h-0 flex-1"
        >
          {tab === 'floors' ? (
            <CompareFloors
              floors={floors}
              units={units}
              onFloors={(next) => set({ floors: next })}
              onUnits={(next) => set({ units: next })}
              onCompareUnits={() => set({ tab: 'units' })}
            />
          ) : null}

          {tab === 'units' ? (
            <CompareUnits units={units} defaultFloor={floor} onUnits={(next) => set({ units: next })} />
          ) : null}

          {views ? (
            <CompareViews
              units={units}
              mode={mode}
              onUnits={(next) => set({ units: next })}
              onAddUnits={() => set({ tab: 'units' })}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
