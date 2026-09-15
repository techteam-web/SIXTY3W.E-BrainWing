import { useCallback, useRef, useState } from 'react';
import { Screen } from '../layout/Screen';
import { Crossfade } from '../components/Crossfade';
import { SECTIONS, SECTION_BY_ID, BACKDROP_SIZES } from '../data/sections';
import { MENU } from '../data/content';
import { useApp } from '../app/appContext';
import { gsap, useGSAP, D, E } from '../gsap/Gsapconfig';

// The brochure's divider pages, made interactive.
//
// Those pages are the strongest thing in the source document: a deep teal field, a
// circular photograph inside a ring of gold dots on one side, and the type on the other.
// So the menu is that composition, with the list where the type goes and the aperture
// showing whatever the list is pointing at.
//
// The ring never re-renders and the picture never remounts — <Crossfade> keeps two
// layers alive and tweens between them — so sweeping the list costs two opacity tweens
// rather than seven React commits and seven image decodes.

function Row({ section, active, onEnter, onSelect, disabled }) {
  const row = useRef(null);
  const { contextSafe } = useGSAP({ scope: row });

  const hover = contextSafe((on) => {
    // overwrite:'auto' kills any in-flight tween on the same property before starting.
    // Without it, sweeping the list leaves every row finishing an animation it should
    // have abandoned — which is what reads as the previous item still being there.
    const vars = { ease: E.soft, overwrite: 'auto' };
    gsap.to('[data-row-no]', { opacity: on ? 1 : 0.55, duration: 0.3, ...vars });
    gsap.to('[data-row-mark]', { scaleX: on ? 1 : 0, duration: 0.42, ...vars });
    gsap.to('[data-row-label]', { x: on ? 16 : 0, duration: D.micro, ...vars });
    gsap.to('[data-row-glow]', { opacity: on ? 1 : 0, duration: 0.4, ...vars });
  });

  return (
    <button
      ref={row}
      type="button"
      data-menu-row
      data-section={section.id}
      disabled={disabled}
      aria-current={active}
      // pointerType 'touch' only: a tap on iOS Safari synthesises pointerenter right
      // before the click, and setting the hovered section re-renders the cross-fading
      // aperture mid-gesture — WebKit reads that DOM change as the target moving under
      // the finger and swallows the click, so the first tap only "hovers". Touch has no
      // real hover to preview anyway, so it goes straight to the click.
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch') return;
        onEnter(section.id);
        hover(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'touch') return;
        hover(false);
      }}
      // A tap also focuses the button, which would retrigger that same mid-gesture
      // re-render. :focus-visible is false for a pointer-driven focus and true for real
      // keyboard focus, so this only fires for the case onFocus exists for.
      onFocus={(e) => {
        let visible = true;
        try {
          visible = e.target.matches(':focus-visible');
        } catch {
          /* engines without :focus-visible — fall back to firing */
        }
        if (!visible) return;
        onEnter(section.id);
        hover(true);
      }}
      onBlur={() => hover(false)}
      onClick={() => onSelect(section.id)}
      className="group relative grid w-full grid-cols-[auto_auto_1fr] items-center gap-[1em] py-[clamp(0.35rem,1.05vh,0.9rem)] text-left"
    >
      {/* A pool of shade that follows the pointed-at row, so the label never has to
          compete with the ground behind it. */}
      <span
        data-row-glow
        data-overflow-ok
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-[0.14em] -left-[1.5em] right-[-2em] -z-10 opacity-0"
        style={{
          background:
            'linear-gradient(90deg, rgb(var(--gold-rgb) / 0.14) 0%, rgb(var(--gold-rgb) / 0.05) 42%, transparent 100%)',
        }}
      />

      <span
        data-row-no
        className="text-caption tabular-nums tracking-[0.24em] text-w-gold opacity-55"
      >
        {section.no}
      </span>

      <span className="block h-px w-[clamp(1.4rem,2.6vw,3rem)]">
        <span
          data-row-mark
          aria-hidden="true"
          className="block h-px w-full origin-left scale-x-0 bg-w-gold"
        />
      </span>

      <span
        data-row-label
        className="block truncate text-title font-light uppercase tracking-[0.13em] text-w-cream"
      >
        {section.label}
      </span>
    </button>
  );
}

export function Menu() {
  const { goTo, isTransitioning } = useApp();
  const [active, setActive] = useState(SECTIONS[0].id);
  const onEnter = useCallback((id) => setActive(id), []);

  // The aperture's slow permanent rotation, and the only thing on this screen that moves
  // when nobody is touching it. 300 seconds for a full turn: it should never be caught
  // moving, only noticed to have moved.
  const ring = useRef(null);
  useGSAP(
    () => {
      gsap.to(ring.current, { rotate: 360, duration: 300, ease: 'none', repeat: -1 });
    },
    { scope: ring },
  );

  return (
    <Screen id="menu">
      <div className="relative grid h-full min-h-0 grid-cols-[minmax(0,40%)_1fr] grid-rows-[minmax(0,1fr)] items-center gap-[3%] max-md:grid-cols-1 max-md:grid-rows-[auto_auto] max-md:content-center max-md:items-stretch max-md:gap-[3vh]">
        <div className="relative z-10 flex min-h-0 flex-col justify-center max-md:order-2 max-md:justify-start">
          <span data-menu-brand className="eyebrow mb-[clamp(0.9rem,2.4vh,2rem)] block">
            {MENU.eyebrow}
          </span>

          <div className="relative flex min-h-0 gap-[clamp(1rem,1.6vw,2em)]">
            <span
              data-menu-rule
              aria-hidden="true"
              className="w-px shrink-0 origin-top bg-w-gold/45"
            />
            <nav className="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
              {SECTIONS.map((section) => (
                <Row
                  key={section.id}
                  section={section}
                  active={active === section.id}
                  onEnter={onEnter}
                  onSelect={goTo}
                  disabled={isTransitioning}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* The aperture, and the largest thing on the screen, as it is on the printed
            divider pages. Its box is centred ABSOLUTELY in the cell so it can run larger
            than the cell: the outer dots fade out, and where they reach the screen's edge
            they are cut the way the print bleeds them — while the grid, which never sees
            the box, keeps the list on its centre line. On a phone the cell takes an
            explicit height a little under the ring's, so the list tucks under its faint
            outer dots rather than waiting below them. */}
        <div
          data-stagger
          className="relative min-h-0 self-stretch max-md:order-1 max-md:pointer-events-none max-md:h-[min(90vw,41vh)]"
        >
          {/* 100vh, and centred 45% of the way across the cell rather than half: the size
              and the nudge at which the ring's outer dots fade out just short of the
              corner lockup above it and the compliance line below — both on the right. */}
          {/* data-ring-focus="ring": the page transition's ring lands exactly on this one. */}
          <div data-ring-focus="ring" className="absolute left-[45%] top-1/2 aspect-square w-[min(126%,100vh)] -translate-x-1/2 -translate-y-1/2 max-md:left-1/2 max-md:w-[min(114vw,52vh)]">
            <span ref={ring} aria-hidden="true" className="aperture-ring" data-overflow-ok />

            {/* The window. Inset 17% puts its edge at 66% of the ring's radius, just
                inside where the mask in .aperture-ring turns the dots fully on (67%), so
                the innermost dots sit tight against the photograph and the picture takes
                as much of the ring as it can. No label under it: the row being pointed at
                already names the picture. */}
            <Crossfade
              id={SECTION_BY_ID[active]?.backdrop}
              frame={SECTION_BY_ID[active]?.backdropFrame}
              sizes={BACKDROP_SIZES}
              className="absolute inset-[17%] rounded-full"
              priority
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[17%] rounded-full"
              style={{
                background:
                  'radial-gradient(closest-side, transparent 52%, rgb(var(--scrim-rgb) / 0.5) 100%)',
                boxShadow: 'inset 0 0 0 1px rgb(var(--gold-rgb) / 0.22)',
              }}
            />
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {SECTION_BY_ID[active]?.label}
      </span>
    </Screen>
  );
}
