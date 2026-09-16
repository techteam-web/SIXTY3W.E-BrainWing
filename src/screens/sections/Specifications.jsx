import { useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { SPECS, DISCLAIMER } from '../../data/content';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';

// The specification sheet, and the one screen where the text IS the content.
//
// One arch-topped panel at a time, wide rather than cramped into a third of the
// screen — three columns side by side made every chapter smaller to fit the others in,
// which is the opposite of what a spec sheet is for. The tabs pick the chapter; the
// panel slides to it, left for back and right for forward, so moving through the sheet
// reads as paging through it rather than as a hard cut.

const { columns, eyebrow, headline } = SPECS;

export function Specifications() {
  const [{ index, dir }, setState] = useState({ index: 0, dir: 1 });
  const col = columns[index];

  const select = (i) => {
    if (i === index) return;
    setState({ index: i, dir: i > index ? 1 : -1 });
  };

  return (
    <Screen id="specifications">
      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-[clamp(0.8rem,2.4vh,1.8rem)]">
        <div className="flex min-h-0 flex-col justify-center gap-[clamp(1.1rem,3.4vh,2.6rem)]">
          <div className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[0.9em]">
            <SectionHead eyebrow={eyebrow} headline={headline} />
            <Tabs columns={columns} active={col.id} onSelect={(id) => select(columns.findIndex((c) => c.id === id))} />
          </div>

          <Sheet col={col} direction={dir} />
        </div>

        <p data-stagger className="text-micro leading-[1.5] text-w-cream/35">
          {DISCLAIMER}
        </p>
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------------- tabs */

function Tabs({ columns, active, onSelect }) {
  return (
    <div data-stagger className="flex shrink-0 flex-wrap gap-x-[1.3em] gap-y-[0.4em]">
      {columns.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-current={c.id === active}
          onClick={() => onSelect(c.id)}
          className="group relative shrink-0 pb-[0.4em]"
        >
          <span
            className={`text-micro uppercase tracking-[0.2em] transition-colors duration-300 ${
              c.id === active ? 'text-w-gold' : 'text-w-cream/45'
            }`}
          >
            {c.title}
          </span>
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 bottom-0 h-px origin-left bg-w-gold transition-transform duration-400 ease-out ${
              c.id === active ? 'scale-x-100' : 'scale-x-0'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- sheet */

// One panel, wide rather than a third-width column, sliding to its content the
// direction the tab moved — right for a chapter further along the sheet, left for one
// before it — so the sequence reads as pages turning rather than as a hard swap.
function Sheet({ col, direction }) {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        root.current,
        { xPercent: direction * 5, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: E.out, overwrite: 'auto' },
      );
      gsap.fromTo(
        '[data-spec]',
        { y: 14, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          ease: E.out,
          stagger: 0.022,
          delay: 0.1,
          overwrite: 'auto',
        },
      );
    },
    { dependencies: [col.id], scope: root, revertOnUpdate: false },
  );

  return (
    <div data-stagger ref={root} className="grid min-h-0 w-full grid-rows-[minmax(0,1fr)]">
      <Panel col={col} />
    </div>
  );
}

/* ------------------------------------------------------------------- panel */

function Panel({ col }) {
  const no = String(SPECS.columns.indexOf(col) + 1).padStart(2, '0');

  // Two columns of groups rather than one long stack — the panel now runs the full
  // width the screen has, and thirty lines in a single column left the whole right
  // half of it empty. Split down the middle: hallmarks' two groups land one per side,
  // and interiors/services' three split two-and-one.
  const mid = Math.ceil(col.groups.length / 2);
  const left = col.groups.slice(0, mid);
  const right = col.groups.slice(mid);

  return (
    // A size container, so the crown reads off the panel's OWN width via cqw. The
    // radius is clamped rather than the bare arch-crown ratio: at the panel's full new
    // width, 31.558% of it is taller than the panel itself, which is what was pulling
    // the curve down over the first row of bullets. Clamped, it is the same crown at
    // any reasonable panel size instead of a dome that swallows the content.
    <article className="@container relative flex min-h-0 min-w-0 flex-col">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-t-[clamp(2.2rem,6cqw,3.6rem)] border border-w-gold/22"
        style={{
          background: 'var(--glass-bg)',
          boxShadow:
            'inset 0 1px 0 rgb(240 234 224 / 0.05), 0 30px 60px -34px rgb(2 12 11 / 0.8)',
        }}
      />

      {/* The title stands in the crown, centred under the arch, where the curve leaves
          the most room. */}
      <header
        data-spec
        className="relative flex flex-col items-center gap-[0.5em] px-[10%] pt-[clamp(1.4rem,4cqw,2.1rem)] text-center"
      >
        <span className="text-micro tabular-nums tracking-[0.3em] text-w-gold">{no}</span>
        <h2 className="text-caption uppercase tracking-[0.22em] text-w-cream">{col.title}</h2>
      </header>

      {/* Sized to fit at every common screen, and allowed to scroll only as the last
          resort on a short one — a panel is the one place LAW 1 permits it (.rail-none).
          The fade covers exactly the bottom padding, so it touches no line of type
          unless there is more below it, and then it is the cue that there is. */}
      <div
        data-scroll-ok
        className="rail-none relative grid min-h-0 grid-cols-1 gap-x-[clamp(1.8rem,4vw,4rem)] gap-y-[clamp(0.9rem,2.2vh,1.6rem)] overflow-y-auto px-[clamp(1.6rem,4cqw,3.6rem)] pb-[clamp(1.4rem,3vh,2.6rem)] pt-[clamp(1rem,2.6vh,2rem)] [mask-image:linear-gradient(to_bottom,#000_calc(100%-clamp(1.2rem,3vh,2.4rem)),transparent)] @lg:grid-cols-2"
      >
        <div className="flex min-w-0 flex-col gap-[clamp(0.9rem,2.2vh,1.6rem)]">
          {left.map((g, gi) => (
            <Group key={g.title ?? `l${gi}`} g={g} />
          ))}
        </div>
        {right.length ? (
          <div className="flex min-w-0 flex-col gap-[clamp(0.9rem,2.2vh,1.6rem)]">
            {right.map((g, gi) => (
              <Group key={g.title ?? `r${gi}`} g={g} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------- group */

function Group({ g }) {
  return (
    <section className="flex min-w-0 flex-col gap-[0.6em]">
      {/* Always a title slot, even when this group has none — an untitled group next
          to a titled one otherwise starts a line higher, and the two columns stop
          reading as one aligned sheet. Plain span rather than data-spec: the entrance
          tween sets visibility inline, which would out-rank .invisible the moment it
          plays. */}
      {g.title ? (
        <h3 data-spec className="text-micro uppercase tracking-[0.24em] text-w-gold/80">
          {g.title}
        </h3>
      ) : (
        <span aria-hidden="true" className="invisible text-micro uppercase tracking-[0.24em]">
          —
        </span>
      )}
      {/* No bullets: the panel, its title and the gold subheads do all the grouping
          this list needs. */}
      <ul className="flex min-w-0 flex-col gap-[0.55em]">
        {g.items.map((item) => (
          <li
            key={item}
            data-spec
            className="min-w-0 text-caption font-medium leading-[1.55] text-w-cream/90"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
