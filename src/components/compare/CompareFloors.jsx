import { AddHead, FloorSelect, Num, PickPlan, RemoveButton, Sheet, Slot } from './CompareParts';
import { ArrowIcon, CloseIcon } from '../Icons';
import {
  COMPARE_MAX,
  PLAN_FLOORS,
  floorById,
  resolveUnit,
  toggleUnit,
  unitKey,
  unitsOf,
} from '../../data/compare';

// Floors side by side: each column one floor's whole plan, its apartments pressable, so
// the apartments to compare can be picked straight off the plans — from one floor or
// from several. What has been picked collects in the tray along the foot.

export function CompareFloors({ floors, units, onFloors, onUnits, onCompareUnits }) {
  const slots = floors.map(floorById).filter((f) => f?.plan);
  const canAdd = slots.length < COMPARE_MAX;
  const full = units.length >= COMPARE_MAX;

  // Equal columns for the floors, and a narrower one for the next choice.
  const cols = slots.length
    ? `repeat(${slots.length}, minmax(0, 1fr))${canAdd ? ' minmax(0, 0.5fr)' : ''}`
    : 'minmax(0, 32rem)';

  return (
    <div className="flex h-full min-h-0 flex-col gap-[clamp(0.6rem,1.4vh,1rem)]">
      <div
        data-overflow-ok
        className="bw-cmp-grid bw-cmp-grid--floors rail-none min-h-0 flex-1"
        style={{ '--cmp-cols': cols }}
      >
        {slots.map((floor, i) => (
          <FloorSlot
            key={floor.id}
            floor={floor}
            n={i + 1}
            floors={floors}
            twin={slots.slice(0, i).find((f) => f.plan === floor.plan) ?? null}
            units={units}
            full={full}
            onPick={(a) => onUnits(toggleUnit(units, { floorId: floor.id, areaId: a.id }))}
            onReplace={(id) => onFloors(floors.map((f) => (f === floor.id ? id : f)))}
            onRemove={() => onFloors(floors.filter((f) => f !== floor.id))}
          />
        ))}

        {canAdd ? (
          <Slot add className="items-center justify-center gap-[1.1em] p-[clamp(1rem,1.6vw,1.8rem)]">
            <AddHead
              title="Add a floor"
              note={`Put up to ${COMPARE_MAX} floor plans side by side.`}
            />
            <FloorSelect
              boxed
              value=""
              floors={PLAN_FLOORS}
              taken={floors}
              placeholder="Choose a floor"
              label="Add a floor to compare"
              onChange={(id) => onFloors([...floors, id])}
            />
          </Slot>
        ) : null}
      </div>

      <UnitTray units={units} onUnits={onUnits} onCompare={onCompareUnits} />
    </div>
  );
}

function FloorSlot({ floor, n, floors, twin, units, full, onPick, onReplace, onRemove }) {
  const plan = floor.plan;
  const [, , fw, fh] = plan.frame;
  const flats = unitsOf(floor);

  // This floor's apartments that are in the selection, by their number in it.
  const picked = new Map();
  units.forEach((u, i) => {
    if (u.floorId === floor.id) picked.set(u.areaId, i + 1);
  });

  return (
    <Slot aria-label={`${floor.label} plan`}>
      <header className="flex items-start gap-[0.65em] px-[clamp(0.9rem,1.3vw,1.4rem)] pt-[clamp(0.9rem,1.7vh,1.4rem)]">
        <Num n={n} className="mt-[0.2em]" />
        <div className="flex min-w-0 flex-1 flex-col gap-[0.3em]">
          <span className="eyebrow">{plan.kind === 'amenity' ? 'Amenity level' : 'Typical floor'}</span>
          <FloorSelect
            value={floor.id}
            floors={PLAN_FLOORS}
            taken={floors}
            label={`Change the ${floor.label} for another floor`}
            onChange={onReplace}
            className="text-title font-extralight uppercase tracking-[0.06em] text-w-cream"
          />
          <span className="text-micro uppercase tracking-[0.14em] text-w-cream/50">
            {twin ? `Same layout as the ${twin.label}` : `Plan of the ${plan.floorsLabel}`}
          </span>
        </div>
        <RemoveButton label={`Remove the ${floor.label}`} onClick={onRemove} className="-mr-[0.5em] -mt-[0.35em]" />
      </header>

      <Sheet aspect={fw / fh} className="px-[clamp(0.9rem,1.3vw,1.4rem)] py-[clamp(0.6rem,1.3vh,1rem)]">
        <PickPlan floor={floor} picked={picked} locked={full} onPick={onPick} />
      </Sheet>

      <div className="px-[clamp(0.9rem,1.3vw,1.4rem)] pb-[clamp(0.9rem,1.7vh,1.4rem)]">
        {flats.length ? (
          <div role="group" aria-label={`Apartments on the ${floor.label}`} className="grid grid-cols-4 gap-[0.4em]">
            {flats.map((a) => {
              const on = picked.has(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && full}
                  title={!on && full ? `Up to ${COMPARE_MAX} units — remove one to add another` : undefined}
                  onClick={() => onPick(a)}
                  className="bw-pick"
                >
                  <span className="bw-pick-name">Apt {a.short}</span>
                  <span className="bw-pick-meta">{a.carpet} sq.ft.</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-micro uppercase leading-[1.5] tracking-[0.16em] text-w-cream/45">
            The amenity level — no apartments on this floor
          </p>
        )}
      </div>
    </Slot>
  );
}

// What has been picked off the plans, and the way on to comparing it.
function UnitTray({ units, onUnits, onCompare }) {
  const list = units.map(resolveUnit).filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-x-[0.7em] gap-y-[0.5em] border-t border-w-line/70 pt-[clamp(0.6rem,1.3vh,0.9rem)]">
      <span className="text-micro uppercase tracking-[0.18em] text-w-cream/60">
        {list.length >= COMPARE_MAX
          ? `Units to compare · ${COMPARE_MAX} of ${COMPARE_MAX} — remove one to pick another`
          : list.length
            ? `Units to compare · ${list.length} of ${COMPARE_MAX}`
            : `Tap apartments on the plans to compare them — up to ${COMPARE_MAX}`}
      </span>

      {list.map((u, i) => (
        <span key={u.key} className="bw-tag">
          <Num n={i + 1} />
          <span>
            Apt {u.area.short} · {u.floor.label}
          </span>
          <button
            type="button"
            aria-label={`Remove ${u.area.label}, ${u.floor.label}`}
            onClick={() => onUnits(units.filter((x) => unitKey(x) !== u.key))}
            className="grid h-[1.8em] w-[1.8em] place-items-center text-w-cream/55 transition-colors duration-300 hover:text-w-gold"
          >
            <CloseIcon size="1em" />
          </button>
        </span>
      ))}

      <button
        type="button"
        className="bw-btn bw-btn--cta ml-auto"
        disabled={!list.length}
        onClick={onCompare}
      >
        Compare units
        <ArrowIcon size="1.1em" />
      </button>
    </div>
  );
}
