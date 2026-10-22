import { PanoViewer } from '../../features/pano/PanoViewer';
import { PANO_DATA, PANO_TILES } from '../../data/floorPanos';
import { resolveUnit, unitKey } from '../../data/compare';
import { AddHead, Num, RemoveButton, Slot } from './CompareParts';
import { ArrowIcon } from '../Icons';

// The views out of the chosen apartments, side by side: each its floor's panorama, turned
// to face out of that apartment and held to its outlook — the same view "360° View from
// here" opens on the plan, three at once. Side by side on a landscape screen, one above
// the other on a portrait one, since a panorama is wider than it is tall.

export function CompareViews({ units, mode, onUnits, onAddUnits }) {
  const list = units.map(resolveUnit).filter(Boolean);

  if (!list.length) {
    return (
      <div className="grid h-full place-items-center">
        <Slot add className="items-center gap-[1.1em] p-[clamp(1.2rem,2vw,2.2rem)]">
          <AddHead title="No units chosen" note="Pick the apartments whose views you want to compare." />
          <button type="button" className="bw-btn bw-btn--cta" onClick={onAddUnits}>
            Choose units
            <ArrowIcon size="1.1em" />
          </button>
        </Slot>
      </div>
    );
  }

  const tracks = `repeat(${list.length}, minmax(0, 1fr))`;

  return (
    <div className="bw-cmp-grid bw-cmp-grid--views h-full" style={{ '--cmp-cols': tracks, '--cmp-rows': tracks }}>
      {list.map((u, i) => (
        <ViewSlot
          key={u.key}
          unit={u}
          n={i + 1}
          mode={mode}
          onRemove={() => onUnits(units.filter((x) => unitKey(x) !== u.key))}
        />
      ))}
    </div>
  );
}

function ViewSlot({ unit, n, mode, onRemove }) {
  const { floor, area, lock } = unit;
  const pano = floor.pano;
  // Where the floor was not shot at this time of day, the other one stands in.
  const shown = pano?.[mode] ? mode : mode === 'day' ? 'night' : 'day';

  return (
    <Slot className="bw-view-slot overflow-hidden" aria-label={`View from ${area.label}, ${floor.label}`}>
      {pano ? (
        <div className="absolute inset-0">
          <PanoViewer view={pano} mode={shown} data={PANO_DATA} tiles={PANO_TILES} lock={lock} />
        </div>
      ) : (
        <p className="m-auto text-micro uppercase tracking-[0.18em] text-w-cream/50">
          No view was shot from this floor
        </p>
      )}

      {/* The scrim teal under the label, so the sky keeps its colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(9rem,45%)] bg-[linear-gradient(180deg,rgb(var(--scrim-rgb)/0.82)_0%,rgb(var(--scrim-rgb)/0.35)_55%,transparent_100%)]"
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start gap-[0.65em] px-[clamp(0.9rem,1.3vw,1.4rem)] pt-[clamp(0.8rem,1.6vh,1.3rem)] max-md:px-[0.8rem] max-md:pt-[0.6rem]">
        <Num n={n} className="mt-[0.2em]" />
        <div className="flex min-w-0 flex-1 flex-col gap-[0.25em]">
          <span className="eyebrow truncate">{area.label}</span>
          <span className="truncate text-subhead font-light tracking-[0.06em] text-w-cream">
            {floor.label}
            {pano?.height != null ? (
              <span className="text-w-cream/60"> · {pano.height} m</span>
            ) : null}
          </span>
        </div>
        <RemoveButton
          label={`Remove ${area.label}, ${floor.label}`}
          onClick={onRemove}
          className="pointer-events-auto -mr-[0.5em] -mt-[0.35em]"
        />
      </header>

      {pano ? (
        <span className="pointer-events-none absolute bottom-[clamp(0.6rem,1.4vh,1rem)] left-1/2 -translate-x-1/2 whitespace-nowrap text-micro uppercase tracking-[0.2em] text-w-cream/70 [text-shadow:0_1px_8px_rgb(4_26_25/0.9)]">
          Drag to look around
        </span>
      ) : null}
    </Slot>
  );
}
