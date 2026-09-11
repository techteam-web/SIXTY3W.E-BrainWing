import { useCallback, useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { Render } from '../../components/Primitives';
import { LEVEL26 } from '../../data/content';
import { getRender } from '../../data/renders';
import { useFitBox } from '../../hooks/useFitBox';
import { gsap, useGSAP } from '../../gsap/Gsapconfig';

// The centrepiece of the brochure, made live.
//
// Eighteen amenities on one deck, and in the printed document they are eighteen numbers
// on a photograph next to a numbered list — which means finding one is a matter of
// reading the list, then hunting the picture. Here the two halves point at each other:
// touch a number and its name lights, touch a name and its number pulses.
//
// The dot positions are not placed by eye. They are the brochure's own callout
// coordinates, lifted out of the PDF's vector data and normalised against the render
// they sit on — see LEVEL26.spots in src/data/content.js.

const { spots, eyebrow, headline } = LEVEL26;

// The plate is sized by the render's own aspect rather than by the container, because
// the callout coordinates are normalised against the render. Any letterboxing has to be
// OUTSIDE the box the dots are positioned in, or every one of them drifts.
const RENDER = getRender('level26');
const ASPECT = RENDER ? RENDER.width / RENDER.height : 1.6;

export function Level26() {
  const [active, setActive] = useState(null);
  const area = useRef(null);
  const plate = useRef(null);

  useFitBox(area, plate, ASPECT, 'contain');

  const onEnter = useCallback((n) => setActive(n), []);
  const onLeave = useCallback(() => setActive(null), []);

  // A slow, permanent breath on every dot, offset per dot so they never pulse in unison.
  // It is what stops eighteen static circles from reading as printed ink.
  useGSAP(
    () => {
      gsap.to('[data-spot-halo]', {
        scale: 1.7,
        opacity: 0,
        duration: 2.4,
        ease: 'power2.out',
        repeat: -1,
        stagger: { each: 0.13, repeat: -1 },
      });
    },
    { scope: plate },
  );

  return (
    <Screen id="level-26">
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,30%)_1fr] gap-[clamp(1.2rem,3%,3rem)] max-xl:grid-cols-[minmax(0,34%)_1fr] max-lg:grid-cols-1 max-lg:grid-rows-[auto_1fr_auto] max-lg:gap-[clamp(0.8rem,2vh,1.4rem)]">
        <div className="flex min-h-0 flex-col justify-center gap-[clamp(1rem,3vh,2rem)]">
          <SectionHead eyebrow={eyebrow} headline={headline} />
          <Legend
            spots={spots}
            active={active}
            onEnter={onEnter}
            onLeave={onLeave}
            className="max-lg:hidden"
          />
        </div>

        {/* The plate. As large as the screen allows and never larger, and always the
            render's own shape — see useFitBox. */}
        <div ref={area} className="grid h-full min-h-0 w-full min-w-0 place-items-center overflow-hidden max-lg:min-h-[30vh]">
          {/* The callout labels hang off their dots and are clipped by the area above —
              which is the design, and which the overflow guard would otherwise report as
              content escaping on every viewport. */}
          <div ref={plate} data-overflow-ok className="relative">
            <div className="crown absolute inset-0 overflow-hidden">
              <Render
                id="level26"
                sizes="(max-width: 1024px) 96vw, 68vw"
                priority
                className="h-full w-full"
              />
              {/* The render is a night shot and the dots are gold: a whisper of extra
                  shade at the edges keeps the outermost callouts off the bright road. */}
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(120% 100% at 50% 45%, transparent 42%, rgb(var(--scrim-rgb) / 0.55) 100%)',
                }}
              />
            </div>

            {spots.map((s) => (
              <Spot
                key={`${s.n}-${s.u}`}
                spot={s}
                active={active === s.n}
                dimmed={active !== null && active !== s.n}
                onEnter={onEnter}
                onLeave={onLeave}
              />
            ))}
          </div>
        </div>

        {/* Below lg the legend moves under the plate and runs three columns wide. It is
            the same list, not a reduced one — a broker on a phone needs all eighteen. */}
        <Legend
          spots={spots}
          active={active}
          onEnter={onEnter}
          onLeave={onLeave}
          className="lg:hidden"
          compact
        />
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------------- spot */

function Spot({ spot, active, dimmed, onEnter, onLeave }) {
  // Past the midpoint the label would run off the right edge, so it flips to the other
  // side of its own dot. One rule, applied from the coordinate itself — and 0.55 rather
  // than a half, because "Cabana Seating & Hammocks" is a long way past its own dot.
  const flip = spot.u > 0.55;

  return (
    <button
      type="button"
      data-overflow-ok
      aria-label={`${spot.n}. ${spot.name}`}
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch') return;
        onEnter(spot.n);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'touch') return;
        onLeave();
      }}
      onFocus={() => onEnter(spot.n)}
      onBlur={onLeave}
      onClick={() => onEnter(active ? null : spot.n)}
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${spot.u * 100}%`, top: `${spot.v * 100}%` }}
    >
      <span
        className={`relative grid h-[clamp(1.1rem,1.5vw,1.7rem)] w-[clamp(1.1rem,1.5vw,1.7rem)] place-items-center rounded-full text-[clamp(0.5rem,0.68vw,0.75rem)] font-medium tabular-nums transition-all duration-300 ease-out ${
          active
            ? 'scale-125 bg-w-gold text-w-deep'
            : dimmed
              ? 'bg-w-deep/70 text-w-cream/50 ring-1 ring-w-gold/35'
              : 'bg-w-deep/85 text-w-cream ring-1 ring-w-gold/70'
        }`}
      >
        {/* The breath. Behind the dot, so a pulse never obscures its own number. */}
        <span
          data-spot-halo
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-w-gold/40"
        />
        <span className="relative">{spot.n}</span>
      </span>

      {/* The name, only while this dot is the one being pointed at. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-[0.7em] py-[0.32em] text-[clamp(0.5rem,0.62vw,0.7rem)] uppercase tracking-[0.14em] transition-all duration-300 ease-out ${
          flip ? 'right-[calc(100%+0.5em)]' : 'left-[calc(100%+0.5em)]'
        } ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        style={{
          background: 'rgb(var(--scrim-rgb) / 0.88)',
          border: '1px solid rgb(var(--gold-rgb) / 0.3)',
          color: 'var(--color-w-cream)',
        }}
      >
        {spot.name}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ legend */

function Legend({ spots, active, onEnter, onLeave, className = '', compact = false }) {
  return (
    <ul
      data-stagger
      className={`grid min-w-0 gap-x-[clamp(0.8rem,1.6vw,2rem)] ${
        compact ? 'grid-cols-3 gap-y-0 max-mob:grid-cols-2' : 'grid-cols-1'
      } ${className}`}
    >
      {spots.map((s) => (
        <li key={s.n} className="min-w-0">
          <button
            type="button"
            aria-current={active === s.n}
            onPointerEnter={(e) => {
              if (e.pointerType === 'touch') return;
              onEnter(s.n);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'touch') return;
              onLeave();
            }}
            onFocus={() => onEnter(s.n)}
            onBlur={onLeave}
            onClick={() => onEnter(active === s.n ? null : s.n)}
            className="group flex w-full min-w-0 items-center gap-[0.55em] py-[clamp(0.12rem,0.5vh,0.34rem)] text-left"
          >
            <span
              className={`w-[1.6em] shrink-0 text-micro tabular-nums tracking-[0.16em] transition-colors duration-300 ${
                active === s.n ? 'text-w-gold' : 'text-w-gold/45'
              }`}
            >
              {String(s.n).padStart(2, '0')}
            </span>
            <span
              className={`min-w-0 truncate text-[length:var(--text-micro)] uppercase tracking-[0.1em] transition-colors duration-300 ${
                compact ? '' : 'text-caption'
              } ${
                active === s.n ? 'text-w-cream' : 'text-w-cream/50 group-hover:text-w-cream/85'
              }`}
            >
              {s.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
