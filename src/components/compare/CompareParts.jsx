import { useId, useState } from 'react';
import { SvgShape } from '../SvgShape';
import { ChevronIcon, CloseIcon, CompareIcon, PlusIcon } from '../Icons';
import { areasOf, unitFrame } from '../../data/compare';
import { bboxCenter } from '../../data/svgLayer';

// The pieces every comparison is built from: the column a floor, an apartment or a view
// stands in, the plan you pick apartments on, the plan of one apartment, and the controls
// that choose what goes in a column.

/* ------------------------------------------------------------------- launch */

// The way in, beside BACK on an open plan: two plain choices, said in full.
export function CompareLaunch({ onCompare }) {
  return (
    <div data-plan-chrome role="group" aria-label="Compare" className="pointer-events-auto flex gap-[0.45em]">
      <button type="button" className="bw-btn" onClick={() => onCompare('floors')}>
        <CompareIcon size="1.15em" className="text-w-gold" />
        Compare floors
      </button>
      <button type="button" className="bw-btn" onClick={() => onCompare('units')}>
        <CompareIcon size="1.15em" className="text-w-gold" />
        Compare units
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------- slots */

// One column of a comparison. `add` is the empty column that offers the next choice.
export function Slot({ add = false, className = '', children, ...rest }) {
  return (
    <section
      data-cmp-slot
      className={`bw-slot ${add ? 'bw-slot--add' : ''} relative flex min-h-0 min-w-0 flex-col ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

// The slot's number, as a small arch — the same 1, 2, 3 marks the apartments on the plans.
export function Num({ n, className = '' }) {
  return (
    <span aria-hidden="true" className={`bw-num ${className}`}>
      {n}
    </span>
  );
}

export function RemoveButton({ label, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-[2.75rem] w-[2.75rem] shrink-0 place-items-center text-w-cream/55 transition-colors duration-300 hover:text-w-gold md:h-[2.2rem] md:w-[2.2rem] ${className}`}
    >
      <CloseIcon size="1.1em" />
    </button>
  );
}

// What an empty column says before it offers its choice.
export function AddHead({ title, note }) {
  return (
    <div className="flex flex-col items-center gap-[0.55em] text-center">
      <span className="grid h-[2.6em] w-[2.6em] place-items-center border border-w-gold/45 text-w-gold">
        <PlusIcon size="1.2em" />
      </span>
      <span className="eyebrow">{title}</span>
      {note ? <p className="max-w-[22em] text-caption leading-[1.5] text-w-cream/55">{note}</p> : null}
    </div>
  );
}

// A small tag that says which column wins on a figure — "Largest", "Highest".
export function Lead({ children }) {
  return (
    <span className="ml-[0.6em] inline-block border border-w-gold/55 px-[0.45em] py-[0.1em] align-middle text-micro uppercase tracking-[0.14em] text-w-gold">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- select */

// A native select, dressed: the platform's own list on a phone, a keyboard that already
// works, and nothing to build. Floors are grouped by the plan they share.
export function FloorSelect({
  value,
  floors,
  taken = [],
  placeholder,
  label,
  onChange,
  boxed = false,
  className = '',
}) {
  const groups = [];
  for (const f of floors) {
    const g = groups.find((x) => x.plan === f.plan);
    if (g) g.floors.push(f);
    else groups.push({ plan: f.plan, floors: [f] });
  }

  return (
    <label className={`bw-select ${boxed ? 'bw-select--box' : ''} ${className}`}>
      <span className="sr-only">{label}</span>
      <select value={value ?? ''} onChange={(e) => e.target.value && onChange(e.target.value)}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {groups.map((g) => (
          <optgroup
            key={g.plan.id}
            label={g.plan.kind === 'amenity' ? 'Amenity level' : `Typical · ${g.plan.floorsLabel}`}
          >
            {g.floors.map((f) => (
              <option key={f.id} value={f.id} disabled={f.id !== value && taken.includes(f.id)}>
                {f.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronIcon size="1.05em" />
    </label>
  );
}

/* -------------------------------------------------------------------- sheet */

// An ivory sheet at a given aspect, as large as its box allows — the plan viewer's own
// size-container fit, in CSS alone (see .bw-cmp-sheet).
export function Sheet({ aspect, crown = true, className = '', children }) {
  return (
    <div className={`bw-cmp-sheet-box ${className}`}>
      <div
        className={`bw-cmp-sheet relative bg-w-ivory ${crown ? 'crown' : ''}`}
        style={{ '--aspect': aspect }}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- plans */

// A small arch, centred on a point, in a plan's own units.
function archPath(cx, cy, w, h) {
  const r = w * 0.31558;
  const x = cx - w / 2;
  const y = cy - h / 2;
  return `M${x} ${y + h}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h}Z`;
}

function Marker({ area, n, size }) {
  const [cx, cy] = bboxCenter(area.bbox);
  return (
    <g aria-hidden="true" pointerEvents="none">
      <path d={archPath(cx, cy, size, size * 1.2)} className="bw-plan-num" />
      <text
        x={cx}
        y={cy + size * 0.12}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.62}
        className="bw-plan-num-text"
      >
        {n}
      </text>
    </g>
  );
}

// A floor's whole plan with its apartments as switches: `picked` maps an apartment's id
// to its number in the selection; `locked` is a full selection, where only the picked
// can be pressed (to let go of them).
export function PickPlan({ floor, picked, locked = false, onPick }) {
  const plan = floor.plan;
  const [fx, fy, fw, fh] = plan.frame;
  const [ax, ay, aw, ah] = plan.layer.viewBox;
  const [hoverId, setHoverId] = useState(null);
  const units = areasOf(plan).filter((a) => a.kind === 'unit');

  return (
    <svg
      viewBox={`${fx} ${fy} ${fw} ${fh}`}
      className="block h-full w-full"
      role="group"
      aria-label={`${floor.label} plan — choose apartments to compare`}
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
      {units.map((a) => {
        const n = picked.get(a.id);
        const off = !n && locked;
        return (
          <SvgShape
            key={a.id}
            shape={a}
            className="bw-area"
            data-locked={off ? '' : undefined}
            data-state={n ? 'active' : !off && hoverId === a.id ? 'hover' : undefined}
            role="button"
            tabIndex={off ? -1 : 0}
            aria-pressed={!!n}
            aria-disabled={off || undefined}
            aria-label={`${a.label}, ${a.type}${a.carpet != null ? `, ${a.carpet} sq.ft.` : ''}`}
            onPointerEnter={(e) => e.pointerType !== 'touch' && setHoverId(a.id)}
            onPointerLeave={() => setHoverId((id) => (id === a.id ? null : id))}
            onClick={() => !off && onPick(a)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !off) {
                e.preventDefault();
                onPick(a);
              }
            }}
          />
        );
      })}
      {units.map((a) =>
        picked.get(a.id) ? <Marker key={a.id} area={a} n={picked.get(a.id)} size={fw * 0.042} /> : null,
      )}
    </svg>
  );
}

// One apartment's own plan: the floor's drawing cropped to it, everything around it
// veiled in the sheet's ivory, and its outline in gold.
export function UnitPlan({ plan, area }) {
  const mask = `unit-${useId().replace(/[^\w-]/g, '')}`;
  const [x, y, w, h] = unitFrame(area);
  const [ax, ay, aw, ah] = plan.layer.viewBox;

  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} className="block h-full w-full" role="img" aria-label={`${area.label} plan`}>
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
          <rect x={x} y={y} width={w} height={h} fill="#fff" />
          <SvgShape shape={area} fill="#000" />
        </mask>
      </defs>
      <image href={plan.image} x={ax} y={ay} width={aw} height={ah} preserveAspectRatio="none" />
      <rect x={x} y={y} width={w} height={h} className="bw-unit-veil" mask={`url(#${mask})`} />
      <SvgShape shape={area} className="bw-unit-outline" />
    </svg>
  );
}

// Where the apartment is on its floor: the whole plan, small, with it filled in.
export function KeyPlan({ plan, area, className = '' }) {
  const [fx, fy, fw, fh] = plan.frame;
  const [ax, ay, aw, ah] = plan.layer.viewBox;
  return (
    <svg
      viewBox={`${fx} ${fy} ${fw} ${fh}`}
      className={`block bg-w-ivory ${className}`}
      style={{ aspectRatio: `${fw} / ${fh}` }}
      aria-hidden="true"
    >
      <image href={plan.image} x={ax} y={ay} width={aw} height={ah} preserveAspectRatio="none" opacity="0.6" />
      <SvgShape shape={area} className="bw-key-unit" />
    </svg>
  );
}
