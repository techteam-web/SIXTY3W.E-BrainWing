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
    <div data-stagger ref={root} className="grid min-h-0 w-full grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
      <Panel col={col} />
    </div>
  );
}

/* ------------------------------------------------------------------- panel */

// A size container, so the crown and the split read off the panel's OWN width. Wide, the
// title takes a narrow column at the left and the groups sit as tiles to its right; narrow,
// the title stacks above the tiles. The crown is clamped so it stays the same arch at any
// reasonable size rather than a dome that swallows the first line.
function Panel({ col }) {
  const no = String(SPECS.columns.indexOf(col) + 1).padStart(2, '0');
  const points = col.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <article className="@container relative flex min-h-0 min-w-0 flex-col">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-t-[clamp(2.2rem,6cqw,3.6rem)] border border-w-gold/22"
        style={{
          background:
            'linear-gradient(168deg, rgb(7 41 40 / 0.9) 0%, rgb(12 59 57 / 0.84) 54%, rgb(15 88 89 / 0.8) 100%)',
          boxShadow:
            'inset 0 1px 0 rgb(240 234 224 / 0.05), 0 30px 60px -34px rgb(2 12 11 / 0.8)',
        }}
      />

      {/* Sized to fit at every common screen, and allowed to scroll only as the last
          resort on a short one — a panel is the one place LAW 1 permits it (.rail-none).
          The fade covers exactly the bottom padding, so it touches no line of type
          unless there is more below it, and then it is the cue that there is. */}
      <div className="relative grid min-h-0 flex-1 grid-cols-1 content-start gap-y-[clamp(1rem,2.6vh,1.8rem)] px-[clamp(1.6rem,4cqw,3.6rem)] pb-[clamp(1.4rem,3vh,2.6rem)] pt-[clamp(1.6rem,4cqw,2.6rem)] @lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.6fr)] @lg:gap-x-[clamp(2rem,5cqw,4.5rem)]">
        <header data-spec className="flex flex-col items-start gap-[0.7em]">
          <span className="text-micro tabular-nums tracking-[0.3em] text-w-gold">{no}</span>
          <h2 className="text-title font-extralight uppercase leading-[1.1] tracking-[0.12em] text-w-cream">
            {col.title}
          </h2>
          <span aria-hidden="true" className="mt-[0.2em] h-px w-[3em] bg-w-gold/60" />
          <span className="text-micro uppercase tracking-[0.2em] text-w-cream/45">
            {points} points
          </span>
        </header>

        <div
          data-scroll-ok
          className="rail-none grid min-h-0 content-start gap-[clamp(0.8rem,2vh,1.2rem)] overflow-y-auto pr-[clamp(0rem,1cqw,1rem)] [mask-image:linear-gradient(to_bottom,#000_calc(100%-clamp(1.2rem,3vh,2.4rem)),transparent)] @3xl:grid-cols-2"
        >
          {col.groups.map((g, gi) => (
            <Group key={g.title ?? `g${gi}`} g={g} />
          ))}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------- group */

function Group({ g }) {
  return (
    <section
      data-spec
      className="flex min-w-0 flex-col gap-[0.8em] border border-w-line/60 bg-w-deep/35 p-[clamp(1rem,2.2cqw,1.5rem)]"
    >
      {g.title ? (
        <h3 className="text-micro uppercase tracking-[0.24em] text-w-gold">{g.title}</h3>
      ) : null}
      <ul className="flex min-w-0 flex-col gap-[0.55em]">
        {g.items.map((item) => (
          <li
            key={item}
            className="flex min-w-0 items-baseline gap-[0.9em] text-caption leading-[1.6] text-w-cream/85"
          >
            <span aria-hidden="true" className="h-px w-[0.9em] shrink-0 translate-y-[-0.25em] bg-w-gold/70" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
