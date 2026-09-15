import { useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { SPECS, DISCLAIMER } from '../../data/content';
import { useMediaQuery } from '../../hooks/useEventListener';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';

// The specification sheet, and the one screen where the text IS the content.
//
// Three arch-topped panels side by side: the logo's own three arches, each holding one
// chapter of the sheet. A panel gives each chapter an edge and a title to stand under,
// which is what loose columns of type on an open ground did not have; cutting it to the
// arch makes it the building's shape rather than a card. There is no picture here —
// behind thirty lines of type a render can only be shown so dark that it reads as dirt.
//
// Three panels above lg: the whole sheet at a glance, the way a broker wants it when
// someone asks a question mid-conversation. Below lg the panels become tabs over one
// panel: a spec list that has to be squinted at is a spec list nobody reads out loud.

const { columns, eyebrow, headline } = SPECS;

export function Specifications() {
  const [tab, setTab] = useState(columns[0].id);
  const stacked = useMediaQuery('(max-width: 63.999rem)');
  const shown = stacked ? columns.filter((c) => c.id === tab) : columns;

  return (
    <Screen id="specifications">
      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-[clamp(0.8rem,2.4vh,1.8rem)]">
        <div className="flex min-h-0 flex-col justify-center gap-[clamp(1.1rem,3.4vh,2.6rem)]">
          <div className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[0.9em]">
            <SectionHead eyebrow={eyebrow} headline={headline} />
            {stacked ? <Tabs columns={columns} active={tab} onSelect={setTab} /> : null}
          </div>

          <Sheet columns={shown} token={stacked ? tab : 'all'} />
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

function Sheet({ columns, token }) {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-spec]',
        { y: 14, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.5,
          ease: E.out,
          stagger: 0.022,
          overwrite: 'auto',
        },
      );
    },
    { dependencies: [token], scope: root, revertOnUpdate: false },
  );

  return (
    <div
      data-stagger
      ref={root}
      className="grid min-h-0 grid-cols-3 grid-rows-[minmax(0,1fr)] gap-[clamp(1rem,1.8vw,2.4rem)] max-lg:grid-cols-1"
    >
      {columns.map((col) => (
        <Panel key={col.id} col={col} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- panel */

function Panel({ col }) {
  const no = String(SPECS.columns.indexOf(col) + 1).padStart(2, '0');

  return (
    // A size container, because the arch has to be CIRCULAR at every width: a percentage
    // radius resolves against the height on the vertical axis and turns a tall panel's
    // crown into a long ellipse (see .crown). In cqw it is the logo's ratio of the
    // panel's width on both axes.
    <article className="@container relative flex min-h-0 min-w-0 flex-col">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-t-[calc(var(--arch-crown)*100cqw)] border border-w-gold/22"
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
        className="relative flex flex-col items-center gap-[0.6em] px-[10%] pt-[calc(var(--arch-crown)*32cqw)] text-center"
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
        className="rail-none relative flex min-h-0 flex-col gap-[clamp(0.9rem,2.2vh,1.6rem)] overflow-y-auto px-[clamp(1.1rem,2.2vw,2.6rem)] pb-[clamp(1.2rem,3vh,2.4rem)] pt-[clamp(1rem,2.6vh,2rem)] [mask-image:linear-gradient(to_bottom,#000_calc(100%-clamp(1.2rem,3vh,2.4rem)),transparent)]"
      >
        {col.groups.map((g, gi) => (
          <section key={g.title ?? gi} className="flex min-w-0 flex-col gap-[0.6em]">
            {g.title ? (
              <h3
                data-spec
                className="text-micro uppercase tracking-[0.24em] text-w-gold/80"
              >
                {g.title}
              </h3>
            ) : null}
            {/* No bullets: the panel, its title and the gold subheads do all the grouping
                this list needs. */}
            <ul className="flex min-w-0 flex-col gap-[0.5em]">
              {g.items.map((item) => (
                <li
                  key={item}
                  data-spec
                  className="min-w-0 text-caption leading-[1.5] text-w-cream/80"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
