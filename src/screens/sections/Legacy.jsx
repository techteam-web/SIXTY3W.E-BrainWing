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

const { eyebrow, headline, lede, houses, arch, figures, plates, ongoing, showcase, completed } = LEGACY;
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

      <div className="relative grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(0.6rem,1.6vh,1.4rem)] pt-[clamp(0.2rem,1vh,1rem)]">
        {/* The header, centred over the arch and given air — not pinned into the corner
            beside the menu. */}
        <header className="flex flex-col items-center text-center">
          <span data-stagger className="eyebrow mb-[0.8em]">
            {eyebrow}
          </span>
          <h1
            data-headline
            className="text-hero font-extralight uppercase leading-[1.05] tracking-[0.12em] text-w-cream 4xl:text-[min(2.85vw,5.067vh)]"
          >
            {headline[0]}
          </h1>
        </header>

        {/* Figures, arch, figures. On a phone the arch leads and the four figures fold
            into a 2 × 2 under it. */}
        <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[clamp(1.4rem,4vw,7rem)] max-lg:grid-cols-2 max-lg:grid-rows-[minmax(0,1fr)_auto] max-lg:gap-x-[1.2rem] max-lg:gap-y-[clamp(1rem,3vh,1.6rem)]">
          <Column items={figures.slice(0, 2)} align="right" start={0} />
          <Arch onOpen={() => setOpen(true)} />
          <Column items={figures.slice(2)} align="left" start={2} />
        </div>

        <footer className="flex flex-col items-center gap-[clamp(0.6rem,1.6vh,1.2rem)] pt-[clamp(1.1rem,2.4vh,1.8rem)] text-center">
          <p data-stagger className="max-w-[66ch] text-body leading-[1.6] text-w-cream/65 max-md:hidden 4xl:text-[min(0.86vw,1.529vh)]">
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
      className="relative aspect-[1/1] h-full min-h-0 max-lg:col-span-2 max-lg:row-start-1 max-lg:justify-self-center max-lg:aspect-[5/6] max-md:aspect-[7/10]"
      style={{ maxHeight: '100%' }}
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
            sizes="(max-width: 1024px) 80vw, 44vw"
            className="absolute inset-0 transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
            position={plate.position ?? '50% 50%'}
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
              <span className="text-[clamp(3rem,min(7.2vw,12.8vh),14rem)] font-extralight tracking-[0.02em]">
                <CountUp to={Number(arch.k)} decimals={0} delay={0.4} />
              </span>
              <span className="mt-[0.15em] text-[clamp(1.4rem,min(2.9vw,5.2vh),5.6rem)] font-extralight text-w-gold">
                {arch.unit}
              </span>
            </span>
            <span className="text-subhead uppercase tracking-[0.3em] text-w-cream 4xl:text-[min(1.02vw,1.813vh)]">{arch.label}</span>

            <span aria-hidden="true" className="my-[0.5em] h-px w-[2.6em] bg-w-gold/60" />

            <span className="flex items-center gap-[0.6em] text-caption uppercase tracking-[0.26em] text-w-gold 4xl:text-[min(0.7vw,1.244vh)]">
              {arch.cta}
              <ArrowIcon size="1.1em" className="transition-transform duration-500 group-hover:translate-x-[0.3em]" />
            </span>
          </span>

          {/* Which building is showing, small, under the crown. */}
          <span
            aria-live="polite"
            className="absolute inset-x-0 top-[12%] text-center text-caption 4xl:text-[min(0.7vw,1.244vh)] uppercase tracking-[0.24em] text-w-cream/80 [text-shadow:0_1px_14px_rgb(0_0_0/0.7)]"
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
      className={`flex flex-col gap-[clamp(1.6rem,7vh,5rem)] max-lg:gap-[clamp(1rem,3vh,1.6rem)] ${
        align === 'right' ? 'items-end text-right max-lg:items-center max-lg:text-center' : 'items-start text-left max-lg:items-center max-lg:text-center'
      }`}
    >
      {items.map((f, n) => (
        <div key={f.label} className="flex flex-col gap-[0.55em]">
          <dt
            className={`flex items-baseline gap-[0.25em] text-hero font-extralight leading-none text-w-cream max-lg:text-stat 4xl:text-[min(2.85vw,5.067vh)] ${
              align === 'right' ? 'justify-end max-lg:justify-center' : 'max-lg:justify-center'
            }`}
          >
            <CountUp to={Number(f.k)} decimals={0} delay={0.5 + (start + n) * 0.1} />
            <span className="text-subhead font-normal uppercase tracking-[0.14em] text-w-gold max-lg:text-caption 4xl:text-[min(1.02vw,1.813vh)]">{f.unit}</span>
          </dt>
          <dd className="text-body leading-[1.4] text-w-cream/70 max-lg:text-read 4xl:text-[min(0.86vw,1.529vh)]">{f.label}</dd>
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
          <span className="text-caption uppercase tracking-[0.28em] text-w-cream/80 4xl:text-[min(0.7vw,1.244vh)]">{h}</span>
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- showcase */

// Behind the arch: two slides, never a scroll. The first is the presenter PDF's Ongoing &
// Upcoming spread (page 3), the second its Completed Projects spread (page 2) — the four
// photographed buildings over all twenty-four names, grouped by where they stand. The
// arrow on the right, the arrow keys or a swipe moves between them.

// Every completed building, grouped by place, the largest neighbourhoods first.
function groupByPlace() {
  const map = new Map();
  for (const p of completed) {
    if (!map.has(p.place)) map.set(p.place, []);
    map.get(p.place).push(p.name);
  }
  return [...map.entries()]
    .map(([place, names]) => ({ place, names }))
    .sort((a, b) => b.names.length - a.names.length || a.place.localeCompare(b.place));
}

// The data is fixed, so it is grouped once, at load.
const GROUPS = groupByPlace();

const SLIDES = [
  { id: 'ongoing', eyebrow: ongoing.title, headline: ongoing.headline, Body: OngoingSlide },
  { id: 'completed', eyebrow: showcase.eyebrow, headline: showcase.headline, Body: CompletedSlide },
];

function Showcase({ onClose }) {
  const root = useRef(null);
  const stage = useRef(null);
  const swipe = useRef(null);
  const [n, setN] = useState(0);
  const dir = useRef(1);

  const go = (to) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, to));
    if (next === n) return;
    dir.current = next > n ? 1 : -1;
    setN(next);
  };

  // The showcase owns the keyboard while it is open. Registered on the DOCUMENT in the
  // CAPTURE phase and marked handled — the same arrangement the floor plan uses — so it
  // runs before the app's global navigation on the window, which skips any key already
  // claimed. Left and right turn the slides here, not the app's pages.
  useEventListener(
    'keydown',
    (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        go(n + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(n - 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    },
    document,
    { capture: true },
  );

  // The showcase itself fades in once.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: E.out });
    },
    { scope: root },
  );

  // Each slide's parts slide in from the side it is coming from.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '[data-show]',
        { x: 40 * dir.current, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.6, ease: E.out, stagger: 0.035, delay: 0.08, overwrite: 'auto' },
      );
    },
    { dependencies: [n], scope: stage, revertOnUpdate: false },
  );

  const slide = SLIDES[n];
  const Body = slide.Body;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={slide.eyebrow}
      className="ground absolute inset-0 z-30 flex flex-col bg-w-deep"
      onPointerDown={(e) => {
        swipe.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const s = swipe.current;
        swipe.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.4) go(n + (dx < 0 ? 1 : -1));
      }}
    >
      <div aria-hidden="true" className="lattice pointer-events-none absolute inset-0" />

      <div
        ref={stage}
        className="screen-inset relative flex h-full min-h-0 flex-col gap-[clamp(0.8rem,2.4vh,2rem)]"
      >
        <div className="flex shrink-0 items-end justify-between gap-[1.2em]">
          <div key={slide.id} data-show className="flex min-w-0 flex-col">
            <span className="eyebrow mb-[0.7em]">{slide.eyebrow}</span>
            <h2 className="text-headline font-extralight uppercase leading-[1.1] tracking-[0.05em] text-w-cream 4xl:text-[min(2.15vw,3.822vh)]">
              {slide.headline.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h2>
          </div>
          <div className="shrink-0">
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

        <div key={slide.id} className="min-h-0 flex-1">
          <Body />
        </div>

        <Pager n={n} go={go} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- pager */

// The slides by name on the left, the two arrows on the right — the right-hand arrow is
// the one a visitor reaches for, so it is the larger, gold one.
function Pager({ n, go }) {
  const last = SLIDES.length - 1;
  return (
    <nav aria-label="Slides" className="flex shrink-0 items-center justify-between gap-[1.2em]">
      <div className="flex min-w-0 items-center gap-x-[clamp(1rem,2.4vw,2.8rem)]">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-current={i === n}
            onClick={() => go(i)}
            className="group relative flex min-w-0 items-baseline gap-[0.7em] pb-[0.45em]"
          >
            <span className={`text-micro tabular-nums tracking-[0.26em] ${i === n ? 'text-w-gold' : 'text-w-gold/45'}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={`truncate text-caption uppercase tracking-[0.22em] transition-colors duration-300 max-md:hidden 4xl:text-[min(0.7vw,1.244vh)] ${
                i === n ? 'text-w-cream' : 'text-w-cream/45 group-hover:text-w-cream/75'
              }`}
            >
              {s.eyebrow}
            </span>
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-px origin-left bg-w-gold transition-transform duration-500 ease-out ${
                i === n ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-[clamp(0.6rem,1vw,1rem)]">
        <ArrowButton label="Previous" disabled={n === 0} onClick={() => go(n - 1)} back />
        <ArrowButton label={n < last ? `Next: ${SLIDES[n + 1].eyebrow}` : 'Next'} disabled={n === last} onClick={() => go(n + 1)} />
      </div>
    </nav>
  );
}

function ArrowButton({ label, disabled, onClick, back = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`group flex size-[clamp(2.6rem,3.4vw,4.4rem)] items-center justify-center rounded-full border transition-colors duration-300 disabled:cursor-default disabled:opacity-30 ${
        back
          ? 'border-w-cream/25 text-w-cream enabled:hover:border-w-gold enabled:hover:text-w-gold'
          : 'border-w-gold bg-w-gold/10 text-w-gold enabled:hover:bg-w-gold enabled:hover:text-w-deep'
      }`}
    >
      <ArrowIcon
        size="38%"
        className={`transition-transform duration-300 ${back ? 'rotate-180 group-enabled:group-hover:-translate-x-[0.15em]' : 'group-enabled:group-hover:translate-x-[0.15em]'}`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------- slides */

// A photograph with its caption laid over its foot: a frame of the app's own hairline
// gold, the type on a teal shadow rising from the bottom edge.
function Plate({ id, name, place, status, position = '50% 50%', sizes }) {
  return (
    <figure data-show className="relative h-full min-h-0 overflow-hidden border border-w-gold/30 bg-w-void">
      <Crossfade id={id} sizes={sizes} className="absolute inset-0" position={position} zoom={false} />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'linear-gradient(0deg, rgb(4 26 25 / 0.92) 0%, rgb(4 26 25 / 0.55) 26%, transparent 55%)' }}
      />
      {status ? (
        <span className="absolute left-[clamp(0.6rem,1vw,1.2rem)] top-[clamp(0.6rem,1vw,1.2rem)] border border-w-gold/55 bg-w-deep/75 px-[0.8em] py-[0.4em] text-micro uppercase tracking-[0.24em] text-w-gold 4xl:text-[min(0.54vw,0.96vh)]">
          {status}
        </span>
      ) : null}
      <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-[0.35em] p-[clamp(0.7rem,1.4vw,1.6rem)] [text-shadow:0_1px_16px_rgb(0_0_0/0.5)]">
        <span className="text-subhead uppercase leading-[1.2] tracking-[0.14em] text-w-cream max-md:text-caption 4xl:text-[min(1.02vw,1.813vh)]">
          {name}
        </span>
        <span className="text-micro uppercase tracking-[0.24em] text-w-cream/65 4xl:text-[min(0.54vw,0.96vh)]">{place}</span>
      </figcaption>
    </figure>
  );
}

// Four photographs across the slide; a two-by-two on anything narrower than a laptop.
function OngoingSlide() {
  return (
    <ul className="grid h-full min-h-0 grid-cols-4 grid-rows-[minmax(0,1fr)] gap-[clamp(0.8rem,1.4vw,1.8rem)] max-lg:grid-cols-2 max-lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
      {ongoing.items.map((o) => (
        <li key={o.id} className="min-h-0 min-w-0">
          <Plate {...o} sizes="(max-width: 1023px) 48vw, 24vw" />
        </li>
      ))}
    </ul>
  );
}

// The four photographed buildings over the full list. On a phone the photographs give way
// to the list, which is the part that has to be read.
function CompletedSlide() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-[clamp(0.9rem,2.4vh,2rem)] max-md:grid-rows-[auto]">
      <ul className="grid min-h-0 grid-cols-4 gap-[clamp(0.8rem,1.4vw,1.8rem)] max-md:hidden">
        {plates.map((p) => (
          <li key={p.id} className="min-h-0 min-w-0">
            <Plate {...p} sizes="24vw" />
          </li>
        ))}
      </ul>

      <div className="columns-5 gap-x-[clamp(1rem,2vw,2.6rem)] max-xl:columns-4 max-md:columns-2">
        {GROUPS.map((g) => (
          <section key={g.place} data-show className="mb-[clamp(0.6rem,1.6vh,1.2rem)] break-inside-avoid">
            <h3 className="mb-[0.5em] flex items-baseline justify-between gap-[0.6em] border-b border-w-gold/20 pb-[0.4em] text-eyebrow uppercase tracking-[0.22em] text-w-gold 4xl:text-[min(0.62vw,1.102vh)]">
              <span className="min-w-0">{g.place}</span>
              <span className="shrink-0 tabular-nums text-w-cream/40">{String(g.names.length).padStart(2, '0')}</span>
            </h3>
            <ul className="flex flex-col gap-[0.2em]">
              {g.names.map((name) => (
                <li key={name} className="text-read leading-[1.35] text-w-cream/85 4xl:text-[min(0.82vw,1.458vh)]">
                  {name}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
