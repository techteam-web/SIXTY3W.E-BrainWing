import { useCallback, useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { PLANS } from '../../data/content';
import { getRender } from '../../data/renders';
import { useEventListener } from '../../hooks/useEventListener';
import { useFitBox } from '../../hooks/useFitBox';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';

// Three plates and a carpet-area table.
//
// The printed plans are line art on white, so this is the one screen in the application
// that inverts: an ivory sheet carrying the drawing, cut to the arch crown, standing on
// the teal ground. Everything around the drawing — the title, the floor range, the
// areas, the compass — is live DOM rather than baked into the image, so it scales with
// the type instead of with the picture and stays legible at every size. That is also why
// the source plates were cropped to the drawing on the way in (scripts/ingest-assets.mjs)
// rather than shipped whole.

const { plates, eyebrow, headline, areaNote } = PLANS;

export function Plans() {
  const [i, setI] = useState(0);
  const plate = plates[i];

  const go = useCallback((next) => {
    setI((prev) => {
      const n = (next + plates.length) % plates.length;
      return n === prev ? prev : n;
    });
  }, []);

  useEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    if (e.key === 'ArrowRight') {
      go(i + 1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      go(i - 1);
      e.preventDefault();
    }
  });

  return (
    <Screen id="plans" ground="ground-quiet">
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,29%)_1fr] gap-[clamp(1.2rem,3.5%,3.5rem)] max-lg:grid-cols-1 max-lg:grid-rows-[auto_1fr_auto] max-lg:gap-[clamp(0.6rem,1.6vh,1.2rem)]">
        <div className="flex min-h-0 min-w-0 flex-col justify-center gap-[clamp(0.8rem,2.4vh,1.9rem)] max-lg:gap-[clamp(0.5rem,1.4vh,1rem)]">
          <SectionHead
            eyebrow={eyebrow}
            headline={headline}
            compactBelow="lg"
          />
          <Selector plates={plates} active={i} onSelect={go} />
          <Table plate={plate} index={i} areaNote={areaNote} className="max-lg:hidden" />
        </div>

        <Plate plate={plate} index={i} />

        {/* Below lg the table moves under the sheet and runs two columns wide. It is the
            same table, not a shorter one: the carpet areas are the reason anyone opens
            this screen. */}
        <Table
          plate={plate}
          index={i}
          areaNote={areaNote}
          className="lg:hidden"
          columns={2}
        />
      </div>
    </Screen>
  );
}

/* ----------------------------------------------------------------- selector */

function Selector({ plates, active, onSelect }) {
  return (
    <div data-stagger className="flex min-w-0 flex-col">
      {plates.map((p, i) => (
        <button
          key={p.id}
          type="button"
          aria-current={i === active}
          onClick={() => onSelect(i)}
          className="group grid w-full grid-cols-[auto_1fr] items-baseline gap-[0.8em] border-t border-w-line/60 py-[clamp(0.42rem,1.2vh,0.85rem)] text-left last:border-b"
        >
          <span
            className={`text-micro tabular-nums tracking-[0.22em] transition-colors duration-300 ${
              i === active ? 'text-w-gold' : 'text-w-gold/40'
            }`}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="min-w-0">
            <span
              className={`block truncate text-caption uppercase tracking-[0.16em] transition-colors duration-300 ${
                i === active ? 'text-w-cream' : 'text-w-cream/55 group-hover:text-w-cream/85'
              }`}
            >
              {p.title}
            </span>
            <span
              className={`mt-[0.25em] block truncate text-micro tracking-[0.08em] transition-colors duration-300 ${
                i === active ? 'text-w-gold/80' : 'text-w-cream/35'
              }`}
            >
              {p.floors}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- table */

function Table({ plate, index, areaNote, className = '', columns = 1 }) {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-row]',
        { y: 12, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: E.out, stagger: 0.05, overwrite: 'auto' },
      );
    },
    { dependencies: [index], scope: root, revertOnUpdate: false },
  );

  if (!plate.units.length) {
    return (
      <p
        data-stagger
        ref={root}
        className={`text-caption leading-[1.6] text-w-cream/55 ${className}`}
      >
        <span data-row className="block">
          The whole floor is the amenity — eighteen of them, from the infinity pool on the
          highway edge to the zen garden behind.
        </span>
      </p>
    );
  }

  return (
    <div data-stagger ref={root} className={`min-w-0 ${className}`}>
      <div className="mb-[0.7em] flex items-baseline justify-between gap-[1em]">
        <span className="text-micro tracking-[0.22em] text-w-gold uppercase">Apartment</span>
        <span className="text-micro tracking-[0.22em] text-w-gold uppercase">{areaNote}</span>
      </div>
      <ul className={columns === 2 ? 'grid grid-cols-2 gap-x-[1.4em]' : 'flex flex-col'}>
        {plate.units.map((u) => (
          <li
            key={u.no}
            data-row
            className="flex items-baseline justify-between gap-[1em] border-t border-w-line/50 py-[clamp(0.3rem,0.85vh,0.55rem)]"
          >
            <span className="text-caption tabular-nums tracking-[0.14em] text-w-cream/70">
              {u.no}
            </span>
            <span className="text-caption tabular-nums text-w-cream">
              {u.area}
              <span className="ml-[0.4em] text-micro text-w-cream/45">sq.ft.</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------- plate */

function Plate({ plate, index }) {
  const area = useRef(null);
  const sheet = useRef(null);
  const render = getRender(plate.render);
  const aspect = render ? render.width / render.height : 1.5;

  useFitBox(area, sheet, aspect, 'contain');

  // The plates swap with a wipe rather than a cross-fade: two line drawings dissolving
  // through each other is unreadable mush, whereas one arriving over the other stays
  // crisp for every frame of it.
  useGSAP(
    () => {
      gsap.fromTo(
        sheet.current,
        { xPercent: 3.5, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.68, ease: E.out, overwrite: 'auto' },
      );
    },
    { dependencies: [index], revertOnUpdate: false },
  );

  return (
    <div
      data-stagger
      ref={area}
      className="grid h-full min-h-0 w-full min-w-0 place-items-center overflow-hidden max-lg:min-h-[34vh]"
    >
      <div
        ref={sheet}
        className="crown relative bg-w-ivory shadow-[0_28px_70px_-30px_rgb(4_26_25/0.75)]"
      >
        {render ? (
          <img
            key={plate.render}
            src={render.src}
            srcSet={render.srcSet}
            sizes="(max-width: 1024px) 94vw, 64vw"
            alt={render.alt}
            width={render.width}
            height={render.height}
            decoding="async"
            className="crown h-full w-full object-contain"
            style={{ backgroundColor: 'var(--color-w-ivory)' }}
          />
        ) : null}

        {/* The title block, on the drawing's own white margin — where a drawing sheet
            puts it. Below lg the sheet is small enough that the block lands on the
            drawing rather than beside it, and the selector above already names the
            plate, so it goes. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-[1em] p-[clamp(0.7rem,1.5vw,1.6rem)] max-lg:hidden">
          <span className="flex min-w-0 flex-col gap-[0.15em]">
            <span className="truncate text-caption uppercase tracking-[0.18em] text-w-bark">
              {plate.title}
            </span>
            <span className="truncate text-micro tracking-[0.1em] text-w-bark/60">
              {plate.floors}
            </span>
          </span>
          <Compass />
        </span>
      </div>
    </div>
  );
}

// The compass is drawn, not cropped out of the plate: on the printed sheet it is a grey
// disc that goes muddy the moment the plan is scaled down.
function Compass() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center gap-[0.35em] text-w-bark/70">
      <svg
        viewBox="0 0 24 24"
        className="h-[1.7em] w-[1.7em]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      >
        <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
        <path d="M12 5v14" strokeOpacity="0.22" />
        <path d="M12 4.4l2.5 6.4L12 9.5l-2.5 1.3z" fill="currentColor" stroke="none" />
      </svg>
      <span className="text-micro tracking-[0.2em]">N</span>
    </span>
  );
}
