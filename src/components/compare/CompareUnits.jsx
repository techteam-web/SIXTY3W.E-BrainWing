import { useState } from 'react';
import { AddHead, FloorSelect, KeyPlan, Lead, Num, PickPlan, RemoveButton, Sheet, Slot, UnitPlan } from './CompareParts';
import { ordinal } from '../../data/floors';
import {
  COMPARE_MAX,
  UNIT_FLOORS,
  floorById,
  resolveUnit,
  unitFrame,
  unitKey,
  unitsOf,
} from '../../data/compare';

// Apartments side by side: each column one apartment's own plan and the figures the
// project publishes for it — the same rows the plan's detail panel shows, lined up so
// they can be read across. Where the apartments differ on a figure, the one that leads
// says so.

export function CompareUnits({ units, onUnits, defaultFloor }) {
  const list = units.map(resolveUnit).filter(Boolean);
  const canAdd = list.length < COMPARE_MAX;

  const cols = list.length
    ? `repeat(${list.length}, minmax(0, 1fr))${canAdd ? ' minmax(0, 0.62fr)' : ''}`
    : 'minmax(0, 32rem)';
  // Below md the apartments stack as rows, and the next choice is a bar beneath them.
  const rows = list.length
    ? `repeat(${list.length}, minmax(0, 1fr))${canAdd ? ' max-content' : ''}`
    : 'max-content';

  // Which apartment leads on a figure — said only when they actually differ.
  const lead = (get) => {
    if (list.length < 2) return null;
    const values = list.map(get);
    const top = Math.max(...values);
    return values.every((v) => v === top) ? null : top;
  };
  const topCarpet = lead((u) => u.area.carpet);
  const topLevel = lead((u) => u.floor.level);

  const remove = (key) => onUnits(units.filter((u) => unitKey(u) !== key));

  return (
    <div
      className="bw-cmp-grid bw-cmp-grid--units h-full"
      data-count={list.length}
      style={{ '--cmp-cols': cols, '--cmp-rows': rows }}
    >
      {list.map((u, i) => (
        <UnitSlot
          key={u.key}
          unit={u}
          n={i + 1}
          topCarpet={topCarpet}
          topLevel={topLevel}
          onRemove={() => remove(u.key)}
        />
      ))}
      {canAdd ? (
        <AddUnitSlot
          taken={new Set(units.map(unitKey))}
          first={!list.length}
          defaultFloor={defaultFloor}
          onAdd={(ref) => onUnits([...units, ref])}
        />
      ) : null}
    </div>
  );
}

function UnitSlot({ unit, n, topCarpet, topLevel, onRemove }) {
  const { floor, plan, area } = unit;
  const [, , w, h] = unitFrame(area);

  const rows = [
    ['RERA carpet area', `${area.carpet} sq.ft.`, topCarpet === area.carpet ? 'Largest' : null],
    ['Type', area.type],
    ['Floor', ordinal(floor.level), topLevel === floor.level ? 'Highest' : null],
    ['Typical floors', plan.floorsLabel, null, true],
    floor.pano?.height != null ? ['View captured at', `${floor.pano.height} m`, null, true] : null,
  ].filter(Boolean);

  return (
    <Slot className="bw-unit-slot" aria-label={`${area.label}, ${floor.label}`}>
      <header className="bw-unit-head relative flex items-start gap-[0.65em] px-[clamp(0.9rem,1.3vw,1.4rem)] pt-[clamp(0.9rem,1.7vh,1.4rem)] max-md:px-[0.8rem] max-md:pt-[0.7rem]">
        <Num n={n} className="mt-[0.2em]" />
        <div className="flex min-w-0 flex-1 flex-col gap-[0.3em]">
          <span className="eyebrow truncate">{area.label}</span>
          <h3 className="text-title font-extralight leading-[1.12] tracking-[0.06em] text-w-cream">
            {floor.label}
          </h3>
        </div>
        <KeyPlan plan={plan} area={area} className="mt-[0.2em] w-[clamp(3.6rem,5.6vw,6.2rem)] max-lg:hidden" />
        <RemoveButton
          label={`Remove ${area.label}, ${floor.label}`}
          onClick={onRemove}
          className="-mr-[0.5em] -mt-[0.35em]"
        />
      </header>

      <Sheet
        aspect={w / h}
        crown={false}
        className="px-[clamp(0.9rem,1.3vw,1.4rem)] py-[clamp(0.6rem,1.3vh,1rem)] max-md:p-[0.6rem]"
      >
        <UnitPlan plan={plan} area={area} />
      </Sheet>

      <dl className="bw-unit-rows flex flex-col px-[clamp(0.9rem,1.3vw,1.4rem)] pb-[clamp(0.9rem,1.7vh,1.4rem)] max-md:px-[0.8rem] max-md:pb-[0.6rem]">
        {rows.map(([k, v, tag, wideOnly]) => (
          <div
            key={k}
            className={`flex items-baseline justify-between gap-[1em] border-t border-w-line/60 py-[clamp(0.35rem,0.9vh,0.6rem)] max-md:flex-col max-md:gap-[0.15em] max-md:py-[0.3rem] ${
              wideOnly ? 'max-md:hidden' : ''
            }`}
          >
            <dt className="shrink-0 text-micro uppercase tracking-[0.18em] text-w-cream/50">{k}</dt>
            <dd className="m-0 min-w-0 text-right text-caption tabular-nums text-w-cream max-md:text-left">
              {v}
              {tag ? <Lead>{tag}</Lead> : null}
            </dd>
          </div>
        ))}
      </dl>
    </Slot>
  );
}

// The next apartment: a floor, then one of its apartments — off its plan, or by name.
function AddUnitSlot({ taken, first, defaultFloor, onAdd }) {
  const start = UNIT_FLOORS.some((f) => f.id === defaultFloor?.id) ? defaultFloor.id : UNIT_FLOORS[0].id;
  const [floorId, setFloorId] = useState(start);
  const floor = floorById(floorId);
  const flats = unitsOf(floor);
  const full = taken.size >= COMPARE_MAX;

  const picked = new Map();
  flats.forEach((a) => {
    if (taken.has(unitKey({ floorId, areaId: a.id }))) picked.set(a.id, '✓');
  });
  const add = (a) => {
    const ref = { floorId, areaId: a.id };
    if (!taken.has(unitKey(ref)) && !full) onAdd(ref);
  };

  return (
    <Slot add className="bw-unit-add gap-[clamp(0.7rem,1.6vh,1.1rem)] p-[clamp(1rem,1.5vw,1.6rem)] max-md:p-[0.8rem]">
      <div className={first ? '' : 'max-md:hidden'}>
        <AddHead
          title="Add a unit"
          note={first ? `Choose a floor, then an apartment — compare up to ${COMPARE_MAX}.` : 'Choose a floor, then an apartment.'}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-[0.6em]">
        <span className="eyebrow md:hidden">{first ? 'Floor' : 'Add a unit'}</span>
        <FloorSelect
          boxed
          value={floorId}
          floors={UNIT_FLOORS}
          label="Floor of the apartment to add"
          onChange={setFloorId}
        />
      </div>

      <Sheet aspect={floor.plan.frame[2] / floor.plan.frame[3]} className="bw-add-plan">
        <PickPlan floor={floor} picked={picked} onPick={add} />
      </Sheet>

      <div role="group" aria-label={`Apartments on the ${floor.label}`} className="grid grid-cols-4 gap-[0.4em]">
        {flats.map((a) => {
          const on = taken.has(unitKey({ floorId, areaId: a.id }));
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={on}
              disabled={on}
              onClick={() => add(a)}
              className="bw-pick"
            >
              <span className="bw-pick-name">Apt {a.short}</span>
              <span className="bw-pick-meta">{on ? 'Added' : `${a.carpet} sq.ft.`}</span>
            </button>
          );
        })}
      </div>
    </Slot>
  );
}
