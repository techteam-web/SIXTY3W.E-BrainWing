import { useCallback, useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { EstateMap } from '../../features/map/EstateMap';
import { formatDistance, travelTimes } from '../../features/map/routing';
import { CATEGORIES, LANDMARKS, ALWAYS_ON } from '../../data/landmarks';
import { LOCATION } from '../../data/content';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';

// Pages 18–20 of the brochure — the neighbourhood, the map, and the list of what is how
// many minutes away — as one live map instead of three printed pages.
//
// The brochure's own drive times are the developer's published figures and are quoted
// as-is on every row. Clicking a row asks OSRM for the real road route, draws it, and
// puts the routed distance and duration next to that figure rather than replacing it:
// one is the marketing claim, the other is the road, and a sales tool that quietly
// swaps one for the other is a sales tool nobody can defend in a meeting.
//
// Layout is deliberately different by size. On a wide screen the panel floats over the
// map on the left. On a phone the map takes the upper half and the panel docks below —
// the map is what people came to look at, and a floating panel on a 390px screen covers
// most of it.

const { eyebrow, headline, lede } = LOCATION;

export function Location() {
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [focus, setFocus] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [route, setRoute] = useState(null);
  const panel = useRef(null);

  const onRoute = useCallback((r) => setRoute(r), []);

  const rows = LANDMARKS.filter((l) => l.cat === category && !ALWAYS_ON.has(l.cat));

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-place]',
        { x: -14, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.5, ease: E.out, stagger: 0.04, overwrite: 'auto' },
      );
    },
    { dependencies: [category], scope: panel, revertOnUpdate: false },
  );

  return (
    <Screen id="location" padded={false}>
      {/* THE MAP IS THE GROUND. There is no holding image behind it and no fade on top of
          it, and that is the point: this screen used to open on the brochure's aerial of
          the same corridor and dissolve it once MapLibre fired `load`. Every version of
          that was wrong in the same way — the arch panels carry a CLONE of this screen,
          and a ground that swaps photograph for map somewhere inside the transition can
          never match the copy sweeping across it. A picture that only exists to be thrown
          away a moment later is not worth one frame of mismatch.
          `.w63-map` paints the style's own teal from its first frame, so what shows before
          the tiles land is the map's ground rather than a hole. */}
      <div className="absolute inset-0 z-0 max-md:bottom-[46%]">
        <EstateMap
          activeCategory={category}
          focusId={focus}
          highlightId={highlight}
          onRoute={onRoute}
        />
      </div>

      {/* No scrim over the map. The panel carries its own glass, and a scrim would only
          dull the ground it is meant to sit on. */}

      <div
        ref={panel}
        data-stagger
        className="glass absolute z-10 left-(--screen-margin) top-[calc(var(--screen-margin)+var(--chrome-top))] flex max-h-[calc(100%-var(--screen-margin)*2-var(--chrome-top)-var(--chrome-bottom))] w-[clamp(17rem,23vw,26rem)] min-w-0 flex-col gap-[clamp(0.6rem,1.6vh,1.1rem)] overflow-hidden p-[clamp(1rem,1.5vw,1.8rem)] pt-[clamp(2.4rem,3.2vw,3.6rem)] max-md:inset-x-0 max-md:bottom-0 max-md:left-0 max-md:top-auto max-md:h-[46%] max-md:max-h-[46%] max-md:w-auto max-md:!rounded-none max-md:pt-[clamp(1rem,1.5vw,1.8rem)] max-md:pb-[calc(var(--screen-margin)+var(--chrome-bottom))]"
        style={{
          // Glass, the app's own material for a panel standing over content. On a teal map a
          // solid teal card has nothing to separate it from the ground it sits on; the
          // blur behind it (desktop only — see .glass) is what makes it the figure.
          background:
            'linear-gradient(168deg, rgb(7 41 40 / 0.9) 0%, rgb(12 59 57 / 0.84) 54%, rgb(15 88 89 / 0.8) 100%)',
          border: '1px solid rgb(var(--gold-rgb) / 0.34)',
          boxShadow: '0 30px 70px -30px rgb(2 12 11 / 0.85)',
          // The arch crown as a LENGTH rather than the `crown` utility's percentage. This
          // panel is portrait, and a percentage radius is elliptical — 31.558% of a 368px
          // width and of a 735px height is a 116×232 corner, which swallows the index
          // line. These three values are 31.558% of the panel's own width formula, so the
          // corner is circular and still exactly the mark's ratio.
          borderTopLeftRadius: 'clamp(5.36rem, 7.26vw, 8.2rem)',
          borderTopRightRadius: 'clamp(5.36rem, 7.26vw, 8.2rem)',
        }}
      >
        <SectionHead eyebrow={eyebrow} headline={headline} compact className="max-md:hidden" />

        <p className="text-caption leading-[1.55] text-w-cream/60 max-xl:hidden">{lede}</p>

        <div
          role="group"
          aria-label="Filter landmarks"
          className="flex shrink-0 flex-wrap gap-x-[1.1em] gap-y-[0.3em]"
        >
          {CATEGORIES.map((c) => {
            const on = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setCategory(c.id);
                  setFocus(null);
                }}
                className="group/f relative shrink-0 pb-[0.35em]"
              >
                <span
                  className={`text-micro uppercase tracking-[0.18em] transition-colors duration-300 ${
                    on ? 'text-w-gold' : 'text-w-cream/45 group-hover/f:text-w-cream/80'
                  }`}
                >
                  {c.title}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-px origin-left bg-w-gold transition-transform duration-400 ease-out ${
                    on ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* The one scroll container in the application, and it is a control surface
            rather than a page: it holds at most six rows on a desktop and is only ever
            reachable inside a panel that is already smaller than the viewport. The
            scrollbar is hidden — it still scrolls by wheel, touch and drag. */}
        <ul
          data-scroll-ok
          data-overflow-ok
          className="rail-none mr-[-0.5em] flex min-h-0 flex-1 flex-col overflow-y-auto pr-[0.5em]"
        >
          {rows.map((l) => {
            const on = focus === l.id;
            return (
              <li key={l.id} data-place>
                <button
                  type="button"
                  onClick={() => setFocus(on ? null : l.id)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'touch') return;
                    setHighlight(l.id);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === 'touch') return;
                    setHighlight(null);
                  }}
                  onFocus={() => setHighlight(l.id)}
                  onBlur={() => setHighlight(null)}
                  aria-pressed={on}
                  className="group/r grid w-full grid-cols-[auto_1fr_auto] items-baseline gap-[0.6em] border-t border-w-line/50 py-[clamp(0.3rem,0.85vh,0.55rem)] text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-[0.42em] block h-px origin-left bg-w-gold transition-[width,opacity] duration-300 ease-out ${
                      on
                        ? 'w-[1.1em] opacity-100'
                        : 'w-0 opacity-0 group-hover/r:w-[0.7em] group-hover/r:opacity-70'
                    }`}
                  />
                  <span
                    className={`min-w-0 truncate text-caption transition-colors duration-300 ${
                      on ? 'text-w-cream' : 'text-w-cream/75 group-hover/r:text-w-cream'
                    }`}
                  >
                    {l.name}
                  </span>
                  <span className="shrink-0 text-caption tabular-nums tracking-[0.1em] text-w-gold">
                    {l.mins} min
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <Directions route={route} />
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------- directions */

function Directions({ route }) {
  const box = useRef(null);

  useGSAP(
    () => {
      if (!box.current) return;
      gsap.fromTo(
        box.current,
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, ease: E.out, overwrite: 'auto' },
      );
    },
    { dependencies: [route?.id, route?.state], revertOnUpdate: false },
  );

  if (!route) return null;

  return (
    <div ref={box} className="shrink-0 border-t border-w-gold/30 pt-[0.8em]">
      <div className="flex items-baseline justify-between gap-[0.8em]">
        <span className="min-w-0 truncate text-caption uppercase tracking-[0.12em] text-w-cream">
          {route.name}
        </span>
        {route.state === 'ready' ? (
          <span className="shrink-0 text-caption tabular-nums text-w-gold">
            {formatDistance(route.distance)}
          </span>
        ) : null}
      </div>

      {route.state === 'loading' ? (
        <p className="pt-[0.4em] text-micro text-w-cream/55">Finding the route…</p>
      ) : null}
      {route.state === 'error' ? (
        <p className="pt-[0.4em] text-micro text-w-cream/55">Route unavailable right now.</p>
      ) : null}

      {route.state === 'ready' ? (
        <>
          <ul className="grid grid-cols-3 gap-[0.5em] pt-[0.7em]">
            {travelTimes(route).map((m) => (
              <li key={m.id} className="flex min-w-0 flex-col gap-[0.18em]">
                <span className="text-micro uppercase tracking-[0.16em] text-w-cream/45">
                  {m.label}
                </span>
                <span className="truncate text-caption tabular-nums text-w-cream">{m.time}</span>
              </li>
            ))}
          </ul>
          <p className="pt-[0.6em] text-micro leading-[1.35] text-w-cream/40">
            Drive time is routed. Metro and walking are estimates from the road distance.
          </p>
        </>
      ) : null}
    </div>
  );
}
