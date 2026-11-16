import { useMemo, useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { Crossfade } from '../../components/Crossfade';
import { CountUp, Portal } from '../../components/Primitives';
import { ArrowIcon } from '../../components/Icons';
import { LEGACY } from '../../data/content';
import { useEventListener } from '../../hooks/useEventListener';
import { gsap, useGSAP, E, prefersReducedMotion } from '../../gsap/Gsapconfig';

// Chapter 01: who built it.
//
// The page is built around ONE object: an arch — the logo's own, at the logo's own
// crown ratio — standing in the middle of the screen with their finished buildings
// dissolving one into the next inside it, and the count of them set across its foot.
// Everything else on the page is arranged around that arch and is quieter than it.
//
// The arch is also the door. Pressing it opens the showcase: all twenty-four buildings,
// grouped by where they stand, the biggest neighbourhoods first. The list used to be
// printed flat on this page and read as a wall of names; behind the arch it reads as a
// map of where this developer has been working for forty years.
//
// Teal ground and gold rules, the application's own — no photograph washing the whole
// screen. The photographs live inside the arch, where they are the subject, not the
// wallpaper.

const { eyebrow, headline, lede, houses, arch, figures, plates, showcase, completed } = LEGACY;
const CYCLE = 4.6; // seconds per photograph in the arch

export function Legacy() {
  const [open, setOpen] = useState(false);

  return (
    <Screen id="legacy">
      {/* A low gold glow behind the arch, so the eye goes there first. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(34% 46% at 50% 54%, rgb(var(--gold-rgb) / 0.1) 0%, rgb(var(--gold-rgb) / 0.03) 55%, transparent 100%)',
        }}
      />

      <div className="relative grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(1rem,3vh,2.4rem)] pt-[clamp(0.6rem,2.4vh,2rem)]">
        {/* The header, centred over the arch and given air — not pinned into the corner
            beside the menu. */}
        <header className="flex flex-col items-center text-center">
          <span data-stagger className="eyebrow mb-[0.8em]">
            {eyebrow}
          </span>
          <h1
            data-headline
            className="text-headline font-extralight uppercase leading-[1.1] tracking-[0.12em] text-w-cream"
          >
            {headline[0]}
          </h1>
        </header>

        {/* Figures, arch, figures. On a phone the arch leads and the four figures fold
            into a 2 × 2 under it. */}
        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[clamp(1.6rem,5vw,6rem)] max-lg:grid-cols-2 max-lg:grid-rows-[minmax(0,1fr)_auto] max-lg:gap-x-[1.2rem] max-lg:gap-y-[clamp(1rem,3vh,1.6rem)]">
          <Column items={figures.slice(0, 2)} align="right" start={0} />
          <Arch onOpen={() => setOpen(true)} />
          <Column items={figures.slice(2)} align="left" start={2} />
        </div>

        <footer className="flex flex-col items-center gap-[clamp(0.8rem,2vh,1.4rem)] text-center">
          <p data-stagger className="max-w-[62ch] text-body leading-[1.6] text-w-cream/65 max-md:hidden">
            {lede}
          </p>
          <Houses />
        </footer>
      </div>

      {open ? <Showcase onClose={() => setOpen(false)} /> : null}
    </Screen>
  );
}

/* --------------------------------------------------------------------- arch */

// The centrepiece. A size container, so the crown is cut in cqw and stays circular at
// any width (the same reason the specification panels are containers). A second, wider
// arch is drawn just outside it in a hairline — the logo is three interlocking arches,
// and a single one reads as a doorway; two read as the mark.
function Arch({ onOpen }) {
  const [i, setI] = useState(0);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  // The cycle runs on GSAP's clock rather than setInterval: a delayed call pauses with the
  // ticker while the tab is hidden, instead of piling up changes to replay on return.
  useGSAP(
    () => {
      if (reduced || plates.length < 2) return undefined;
      let call;
      const tick = () => {
        setI((n) => (n + 1) % plates.length);
        call = gsap.delayedCall(CYCLE, tick);
      };
      call = gsap.delayedCall(CYCLE, tick);
      return () => call?.kill();
    },
    { dependencies: [reduced] },
  );

  const plate = plates[i];

  return (
    <div
      data-stagger
      className="relative h-full min-h-0 max-lg:col-span-2 max-lg:row-start-1 max-lg:justify-self-center"
      style={{ aspectRatio: 'var(--arch-w) / var(--arch-h)', maxHeight: '100%' }}
    >
      <button
        type="button"
        onClick={onOpen}
        data-ring-focus
        aria-label={`${arch.k}${arch.unit} ${arch.label} — ${arch.cta}`}
        className="group @container absolute inset-0 block text-left outline-none"
      >
        {/* The outer hairline arch, offset outward. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[clamp(0.5rem,0.9vw,0.9rem)] border border-w-gold/30 transition-colors duration-500 group-hover:border-w-gold/70 group-focus-visible:border-w-gold"
          style={{
            borderTopLeftRadius: 'calc(var(--arch-crown) * (100cqw + 2 * clamp(0.5rem, 0.9vw, 0.9rem)))',
            borderTopRightRadius: 'calc(var(--arch-crown) * (100cqw + 2 * clamp(0.5rem, 0.9vw, 0.9rem)))',
          }}
        />

        {/* The window itself. */}
        <span
          className="absolute inset-0 overflow-hidden border border-w-gold/55 bg-w-deep"
          style={{
            borderTopLeftRadius: 'calc(var(--arch-crown) * 100cqw)',
            borderTopRightRadius: 'calc(var(--arch-crown) * 100cqw)',
          }}
        >
          <Crossfade
            id={plate.id}
            sizes="(max-width: 1024px) 60vw, 26vw"
            className="absolute inset-0 transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
            position="50% 40%"
            priority
          />
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(0deg, rgb(4 26 25 / 0.94) 0%, rgb(4 26 25 / 0.72) 30%, rgb(4 26 25 / 0.12) 62%, rgb(4 26 25 / 0.04) 100%)',
            }}
          />

          {/* The count, across the arch's foot. */}
          <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-[0.35em] px-[8%] pb-[9%] text-center [text-shadow:0_1px_20px_rgb(0_0_0/0.5)]">
            <span className="flex items-start leading-none text-w-cream">
              <span className="text-[clamp(3rem,min(6.4vw,11vh),8.5rem)] font-extralight tracking-[0.02em]">
                <CountUp to={Number(arch.k)} decimals={0} delay={0.4} />
              </span>
              <span className="mt-[0.15em] text-[clamp(1.4rem,min(2.6vw,4.6vh),3.4rem)] font-extralight text-w-gold">
                {arch.unit}
              </span>
            </span>
            <span className="text-caption uppercase tracking-[0.3em] text-w-cream">{arch.label}</span>

            <span aria-hidden="true" className="my-[0.5em] h-px w-[2.6em] bg-w-gold/60" />

            <span className="flex items-center gap-[0.6em] text-micro uppercase tracking-[0.26em] text-w-gold">
              {arch.cta}
              <ArrowIcon size="1.1em" className="transition-transform duration-500 group-hover:translate-x-[0.3em]" />
            </span>
          </span>

          {/* Which building is showing, small, under the crown. */}
          <span
            aria-live="polite"
            className="absolute inset-x-0 top-[14%] text-center text-micro uppercase tracking-[0.24em] text-w-cream/80 [text-shadow:0_1px_14px_rgb(0_0_0/0.7)]"
          >
            {plate.name} · {plate.place}
          </span>
        </span>
      </button>

      {/* The three photographs, as three ticks under the arch — the logo's own feet. */}
      <span aria-hidden="true" className="absolute -bottom-[clamp(1.2rem,2.6vh,1.8rem)] inset-x-0 flex justify-center gap-[0.5em]">
        {plates.map((p, n) => (
          <span
            key={p.id}
            className={`h-[2px] w-[1.6em] transition-colors duration-700 ${n === i ? 'bg-w-gold' : 'bg-w-cream/20'}`}
          />
        ))}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ figures */

function Column({ items, align, start }) {
  return (
    <dl
      data-stagger
      className={`flex flex-col gap-[clamp(1.6rem,6vh,4rem)] max-lg:gap-[clamp(1rem,3vh,1.6rem)] ${
        align === 'right' ? 'items-end text-right max-lg:items-center max-lg:text-center' : 'items-start text-left max-lg:items-center max-lg:text-center'
      }`}
    >
      {items.map((f, n) => (
        <div key={f.label} className="flex flex-col gap-[0.55em]">
          <dt
            className={`flex items-baseline gap-[0.2em] text-stat font-extralight leading-none text-w-cream ${
              align === 'right' ? 'justify-end max-lg:justify-center' : 'max-lg:justify-center'
            }`}
          >
            <CountUp to={Number(f.k)} decimals={0} delay={0.5 + (start + n) * 0.1} />
            <span className="text-caption font-normal uppercase tracking-[0.14em] text-w-gold">{f.unit}</span>
          </dt>
          <dd className="text-read leading-[1.4] text-w-cream/65">{f.label}</dd>
          <span
            aria-hidden="true"
            className={`mt-[0.2em] h-px w-[2.4em] bg-w-gold/40 ${
              align === 'right' ? 'self-end max-lg:self-center' : 'max-lg:self-center'
            }`}
          />
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------- houses */

function Houses() {
  return (
    <div data-stagger className="flex items-center gap-[clamp(1rem,2.4vw,2.6rem)]">
      {houses.map((h, n) => (
        <span key={h} className="flex items-center gap-[clamp(1rem,2.4vw,2.6rem)]">
          {n > 0 ? <span aria-hidden="true" className="h-[1.1em] w-px bg-w-gold/40" /> : null}
          <span className="text-caption uppercase tracking-[0.28em] text-w-cream/80">{h}</span>
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- showcase */

// Every completed building, grouped by place, the largest neighbourhoods first. A group
// that has one of the three photographs wears it at its head, so the showcase is not
// only type — and those are the places the brochure itself chose to show.
function groupByPlace() {
  const map = new Map();
  for (const p of completed) {
    if (!map.has(p.place)) map.set(p.place, []);
    map.get(p.place).push(p.name);
  }
  return [...map.entries()]
    .map(([place, names]) => ({
      place,
      names,
      photo: plates.find((pl) => names.includes(pl.name)) ?? null,
    }))
    .sort((a, b) => b.names.length - a.names.length || a.place.localeCompare(b.place));
}

// The data is fixed, so it is grouped once, at load.
const GROUPS = groupByPlace();

function Showcase({ onClose }) {
  const root = useRef(null);
  const groups = GROUPS;

  // The showcase owns the keyboard while it is open. Registered on the DOCUMENT in the
  // CAPTURE phase and marked handled — the same arrangement the floor plan uses — so it
  // runs before the app's global navigation on the window, which skips any key already
  // claimed. Without that, Escape went to the menu instead of closing this, and the
  // arrow keys turned the page underneath it.
  useEventListener(
    'keydown',
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'].includes(e.key)) {
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
      gsap.fromTo(
        '[data-show]',
        { y: 22, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: E.out, stagger: 0.04, delay: 0.12 },
      );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={showcase.eyebrow}
      className="ground absolute inset-0 z-30 flex flex-col bg-w-deep"
    >
      <div aria-hidden="true" className="lattice pointer-events-none absolute inset-0" />

      <div className="screen-inset relative flex h-full min-h-0 flex-col gap-[clamp(1.2rem,3.4vh,2.6rem)]">
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-[1.2em]">
          <div data-show className="flex flex-col">
            <span className="eyebrow mb-[0.7em]">{showcase.eyebrow}</span>
            <h2 className="text-headline font-extralight leading-[1.1] tracking-[0.05em] text-w-cream">
              {showcase.headline.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
          </div>
          <div data-show>
            <Portal
              size="sm"
              iconFirst
              onClick={onClose}
              aria-label="Back to Legacy"
              icon={<ArrowIcon size="1em" className="rotate-180" />}
            >
              {showcase.close}
            </Portal>
          </div>
        </div>

        <span aria-hidden="true" className="block h-px w-full shrink-0 bg-gradient-to-r from-w-gold/70 via-w-gold/25 to-transparent" />

        <div
          data-scroll-ok
          className="rail-none min-h-0 flex-1 overflow-y-auto pb-[clamp(1rem,3vh,2rem)] [mask-image:linear-gradient(to_bottom,#000_calc(100%-clamp(1rem,3vh,2rem)),transparent)]"
        >
          <div className="columns-5 gap-[clamp(0.8rem,1.4vw,1.6rem)] max-2xl:columns-4 max-xl:columns-3 max-md:columns-2 max-mob:columns-1">
            {groups.map((g) => (
              <section
                key={g.place}
                data-show
                className="mb-[clamp(0.8rem,1.4vw,1.6rem)] break-inside-avoid overflow-hidden border border-w-gold/20 bg-w-deep/50"
              >
                {g.photo ? (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Crossfade id={g.photo.id} sizes="22vw" className="absolute inset-0" position="50% 40%" zoom={false} />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(0deg, rgb(4 26 25 / 0.75) 0%, transparent 60%)' }}
                    />
                  </div>
                ) : null}
                <div className="flex flex-col gap-[0.7em] p-[clamp(0.8rem,1.2vw,1.2rem)]">
                  <header className="flex items-baseline justify-between gap-[0.8em]">
                    <h3 className="min-w-0 text-caption uppercase tracking-[0.22em] text-w-gold">{g.place}</h3>
                    <span className="shrink-0 text-micro tabular-nums tracking-[0.2em] text-w-cream/45">
                      {String(g.names.length).padStart(2, '0')}
                    </span>
                  </header>
                  <ul className="flex flex-col gap-[0.45em]">
                    {g.names.map((n) => (
                      <li key={n} className="text-read leading-[1.35] text-w-cream/85">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
