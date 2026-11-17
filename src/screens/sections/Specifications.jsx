import { useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { Crossfade } from '../../components/Crossfade';
import { Lockup } from '../../components/Lockup';
import { Portal } from '../../components/Primitives';
import { ArrowIcon } from '../../components/Icons';
import { SPECS, DISCLAIMER } from '../../data/content';
import { useEventListener, useMediaQuery } from '../../hooks/useEventListener';
import { gsap, useGSAP, E, prefersReducedMotion } from '../../gsap/Gsapconfig';

// What to Expect, set the way the presenter PDF sets it (page 21): the family at home in
// the living room, full bleed and left light, and one tall teal panel standing on the
// right with the mark, the title and the seven points the tower is sold on. Nothing
// else is drawn over the photograph.
//
// The panel is also the door to the specification sheet. Pressing any point, or the
// button at its foot, opens the full sheet over the screen — three arch-topped panels
// side by side above lg, tabs over one panel below it.

const { columns, eyebrow, headline, points, cta, close } = SPECS;

export function Specifications() {
  const [open, setOpen] = useState(false);

  return (
    <Screen id="specifications">
      <Crossfade id="expect-living" sizes="100vw" className="absolute inset-0" position="28% 62%" priority />
      {/* Plain shadow, light — only enough at the top for MENU and HOME and at the foot
          for the caption line. A teal wash would turn warm timber and stone green. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgb(0 0 0 / 0.38) 0%, rgb(0 0 0 / 0.08) 22%, rgb(0 0 0 / 0) 55%, rgb(0 0 0 / 0.34) 100%)',
        }}
      />

      <div className="relative flex h-full min-h-0 justify-end max-md:items-end">
        <ExpectPanel onOpen={() => setOpen(true)} />
      </div>

      {open ? <Details onClose={() => setOpen(false)} /> : null}
    </Screen>
  );
}

/* -------------------------------------------------------------------- panel */

function ExpectPanel({ onOpen }) {
  return (
    <aside
      data-stagger
      className="relative flex h-auto min-h-0 w-[clamp(19.5rem,23vw,38rem)] flex-col md:mt-[calc(var(--corner-clear)+clamp(0.8rem,2vh,1.6rem))] items-center overflow-hidden rounded-[clamp(1rem,1.6vw,2.2rem)] border border-w-gold/25 px-[clamp(1rem,1.8vw,2.6rem)] py-[clamp(0.9rem,2.6vh,3rem)] text-center shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] max-md:h-auto max-md:w-full max-md:py-[1.1rem]"
      style={{ background: 'linear-gradient(170deg, #0c3b39 0%, #0a3533 45%, #17635c 140%)' }}
    >
      <header className="flex shrink-0 flex-col items-center gap-[clamp(0.4rem,1vh,0.9rem)]">
        <Lockup variant="mark" className="w-[clamp(2.4rem,3.2vw,4.6rem)] text-w-gold max-md:w-[2.4rem] [@media(max-height:760px)]:hidden" title="SIXTY3W.E." />
        <h1 className="text-subhead uppercase tracking-[0.12em] text-w-gold 4xl:text-[min(1.02vw,1.813vh)]">
          {headline[0]}
        </h1>
        <Ticks />
      </header>

      <ul className="flex min-h-0 w-full flex-1 flex-col justify-evenly py-[clamp(0.2rem,0.8vh,1rem)] max-md:grid max-md:grid-cols-2 max-md:gap-x-[0.8rem] max-md:gap-y-[0.9rem]">
        {points.map((p) => (
          <li key={p.icon} className="max-md:last:col-span-2">
            <button
              type="button"
              onClick={onOpen}
              className="group flex w-full flex-col items-center gap-[clamp(0.3rem,0.8vh,0.7rem)] outline-none"
            >
              <PointIcon
                name={p.icon}
                className="size-[clamp(1.35rem,min(1.6vw,2.85vh),2.8rem)] text-w-cream/90 transition-colors duration-300 group-hover:text-w-gold group-focus-visible:text-w-gold"
              />
              <span className="text-eyebrow font-semibold uppercase leading-[1.5] tracking-[0.16em] text-w-cream transition-colors duration-300 group-hover:text-w-gold-lit 4xl:text-[min(0.62vw,1.102vh)]">
                {p.label.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="shrink-0">
        <Portal onClick={onOpen}>{cta}</Portal>
      </div>
    </aside>
  );
}

// The six ticks under the logo's arches, at the logo's own spacing.
function Ticks() {
  const X = [0, 23.217, 31.399, 46.434, 54.616, 77.833];
  return (
    <svg viewBox="-1 0 80 10" aria-hidden="true" className="w-[clamp(3.4rem,5vw,7rem)] text-w-gold max-md:w-[3.2rem]">
      {X.map((x) => (
        <path key={x} d={`M${x} 0V10`} stroke="currentColor" strokeWidth="1.6" />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------- icons */

// The page's seven pictograms, redrawn on the app's 24-unit hairline grid so they sit
// with every other icon in the application.
const ICONS = {
  legacy: (
    <>
      <circle cx="12" cy="9" r="5.2" />
      <path d="M12 6.4l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 8.5l2-.3z" />
      <path d="M8.6 13l-1.6 7 3-1.4 2 2.1" />
      <path d="M15.4 13l1.6 7-3-1.4-2 2.1" />
    </>
  ),
  tower: (
    <>
      <path d="M8 21V4.5L12 3l4 1.5V21" />
      <path d="M5 21h14" />
      <path d="M10.2 7h3.6M10.2 10h3.6M10.2 13h3.6M10.2 16h3.6" />
      <path d="M11 21v-2.6h2V21" />
    </>
  ),
  pool: (
    <>
      <path d="M8 14V5.5a1.6 1.6 0 0 1 3.2 0" />
      <path d="M14 14V5.5a1.6 1.6 0 0 1 3.2 0" />
      <path d="M8 8.5h6M8 11.5h6" />
      <path d="M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M3 20.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" />
      <path d="M12 6.5l1.6 4.4L18 12l-4.4 1.1L12 17.5l-1.6-4.4L6 12l4.4-1.1z" />
    </>
  ),
  house: (
    <>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
      <path d="M8.5 13h0M15.5 13h0" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-5.6-6-10.6a6 6 0 0 1 12 0C18 15.4 12 21 12 21z" />
      <circle cx="12" cy="10.2" r="2.2" />
    </>
  ),
  fittings: (
    <>
      <path d="M6 9.5h7a3 3 0 0 1 3 3V14" />
      <path d="M6 7v5" />
      <path d="M9.5 9.5V7.2M7.8 7.2h3.4" />
      <path d="M16 16.6v.4M14.8 19v.4M17.2 19v.4" />
      <path d="M3 4h18M3 4v16h18V4" strokeOpacity="0.55" />
    </>
  ),
};

function PointIcon({ name, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {ICONS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ details */

// The full specification sheet, over the screen. The same arrangement the Legacy
// showcase uses: the ground and lattice, a head with a way back, and the content —
// which is sized to fit and never scrolls the page.
function Details({ onClose }) {
  const root = useRef(null);
  const [tab, setTab] = useState(columns[0].id);
  const stacked = useMediaQuery('(max-width: 63.999rem)');
  const shown = stacked ? columns.filter((c) => c.id === tab) : columns;

  // Registered on the document in the capture phase so Escape closes this rather than
  // reaching the app's own navigation, and the arrow keys do not turn the page beneath.
  useEventListener(
    'keydown',
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.key)) {
        e.preventDefault();
      }
    },
    document,
    { capture: true },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: E.out });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={headline[0]}
      className="ground absolute inset-0 z-30 flex flex-col bg-w-deep"
    >
      <div aria-hidden="true" className="lattice pointer-events-none absolute inset-0" />

      <div className="screen-inset relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-[clamp(0.8rem,2.4vh,1.8rem)]">
        <div className="flex min-h-0 flex-col justify-center gap-[clamp(1.1rem,3.4vh,2.6rem)]">
          <div className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[0.9em]">
            <SectionHead eyebrow={eyebrow} headline={headline} />
            <div className="flex min-w-0 flex-wrap items-center gap-x-[2em] gap-y-[0.8em]">
              {stacked ? <Tabs columns={columns} active={tab} onSelect={setTab} /> : null}
              <Portal
                size="sm"
                iconFirst
                onClick={onClose}
                aria-label="Back to What to Expect"
                icon={<ArrowIcon size="1em" className="rotate-180" />}
              >
                {close}
              </Portal>
            </div>
          </div>

          <Sheet columns={shown} token={stacked ? tab : 'all'} />
        </div>

        <p className="text-micro leading-[1.5] text-w-cream/45">{DISCLAIMER}</p>
      </div>
    </div>
  );
}


/* -------------------------------------------------------------------- tabs */

function Tabs({ columns, active, onSelect }) {
  return (
    <div data-stagger className="flex min-w-0 flex-wrap gap-x-[1.3em] gap-y-[0.4em]">
      {columns.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-current={c.id === active}
          onClick={() => onSelect(c.id)}
          className="group relative shrink-0 pb-[0.4em]"
        >
          <span
            className={`text-caption uppercase tracking-[0.2em] transition-colors duration-300 ${
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
        className="pointer-events-none absolute inset-0 rounded-t-[calc(var(--arch-crown)*100cqw)] border border-w-gold/30 md:backdrop-blur-[14px]"
        style={{
          background: 'linear-gradient(180deg, rgb(7 41 40 / 0.8), rgb(4 26 25 / 0.84))',
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
        <span className="text-caption tabular-nums tracking-[0.3em] text-w-gold">{no}</span>
        <h2 className="text-subhead uppercase tracking-[0.2em] text-w-cream">{col.title}</h2>
      </header>

      {/* Sized to fit at every common screen, and allowed to scroll only as the last
          resort on a short one — a panel is the one place LAW 1 permits it (.rail-none).
          The fade covers exactly the bottom padding, so it touches no line of type
          unless there is more below it, and then it is the cue that there is. */}
      <div
        data-scroll-ok
        className="rail-none relative flex min-h-0 flex-col gap-[clamp(0.7rem,2vh,1.6rem)] overflow-y-auto px-[clamp(1.1rem,2.2vw,2.6rem)] pb-[clamp(1.2rem,3vh,2.4rem)] pt-[clamp(1rem,2.6vh,2rem)] [mask-image:linear-gradient(to_bottom,#000_calc(100%-clamp(1.2rem,3vh,2.4rem)),transparent)]"
      >
        {col.groups.map((g, gi) => (
          <section key={g.title ?? gi} className="flex min-w-0 flex-col gap-[0.6em]">
            {g.title ? (
              <h3
                data-spec
                className="text-eyebrow uppercase tracking-[0.22em] text-w-gold/90"
              >
                {g.title}
              </h3>
            ) : null}
            {/* No bullets: the panel, its title and the gold subheads do all the grouping
                this list needs. */}
            <ul className="flex min-w-0 flex-col gap-[0.42em]">
              {g.items.map((item) => (
                <li
                  key={item}
                  data-spec
                  className="min-w-0 text-read leading-[1.42] text-w-cream/85"
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
