import { useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { Render } from '../../components/Primitives';
import { SPECS, DISCLAIMER } from '../../data/content';
import { useMediaQuery } from '../../hooks/useEventListener';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';

// The specification sheet, and the one screen where the text IS the content.
//
// Three columns above lg — which is the whole sheet at a glance, the way a broker wants
// it when someone asks a question mid-conversation. Below lg the same three columns
// become three tabs rather than three shorter columns: a spec list that has to be
// squinted at is a spec list nobody reads out loud.

const { columns, eyebrow, headline } = SPECS;

export function Specifications() {
  const [tab, setTab] = useState(columns[0].id);
  const stacked = useMediaQuery('(max-width: 63.999rem)');
  const shown = stacked ? columns.filter((c) => c.id === tab) : columns;

  return (
    <Screen id="specifications" padded={false}>
      <div className="absolute inset-0">
        <Render id="tower-dusk" sizes="100vw" position="50% 30%" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgb(var(--scrim-rgb) / 0.9) 0%, rgb(var(--scrim-rgb) / 0.96) 30%, rgb(var(--scrim-rgb) / 0.98) 100%)',
        }}
      />
      <div aria-hidden="true" className="ground-quiet absolute inset-0" />

      <div className="screen-inset relative z-10 grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-[clamp(0.9rem,2.6vh,2rem)]">
        <div className="flex flex-wrap items-end justify-between gap-[1.5em]">
          <SectionHead eyebrow={eyebrow} headline={headline} />
          {stacked ? <Tabs columns={columns} active={tab} onSelect={setTab} /> : null}
        </div>

        <Sheet columns={shown} token={stacked ? tab : 'all'} />

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
      className="grid min-h-0 grid-cols-3 gap-[clamp(1.2rem,2.6vw,3.5rem)] max-lg:grid-cols-1"
    >
      {columns.map((col) => (
        <div key={col.id} className="flex min-w-0 flex-col gap-[clamp(0.7rem,1.8vh,1.3rem)]">
          <span
            data-spec
            className="border-b border-w-gold/30 pb-[0.6em] text-caption uppercase tracking-[0.2em] text-w-gold max-lg:hidden"
          >
            {col.title}
          </span>

          {col.groups.map((g, gi) => (
            <div key={g.title ?? gi} className="flex min-w-0 flex-col gap-[0.5em]">
              {g.title ? (
                <span
                  data-spec
                  className="text-micro uppercase tracking-[0.22em] text-w-cream/45"
                >
                  {g.title}
                </span>
              ) : null}
              <ul className="flex min-w-0 flex-col gap-[0.42em]">
                {/* No bullet. Thirty rows each led by a gold dash was thirty marks
                    carrying no information, on the one screen in the app that is already
                    dense — the column heads and the subheads do all the grouping this
                    list needs. */}
                {g.items.map((item) => (
                  <li
                    key={item}
                    data-spec
                    className="min-w-0 text-caption leading-[1.45] text-w-cream/72"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
