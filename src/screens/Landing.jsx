import { Screen } from '../layout/Screen';
import { Portal, Render } from '../components/Primitives';
import { Lockup } from '../components/Lockup';
import { LANDING, PROJECT } from '../data/content';
import { useApp } from '../app/appContext';
import { useMediaQuery } from '../hooks/useEventListener';

// Page 3 of the brochure, rebuilt: the tower at dusk holding the left of the frame, the
// lockup and the claim stacked on the right.
//
// The intro sequence (introSequence in TransitionDirector.js) animates this screen's own
// elements rather than a separate intro screen — the data-* markers below are its
// targets, and they are the contract between this file and the director. The lockup here
// is the one that travels from centre stage to its resting position, which is why the
// landing carries no corner mark: on this screen the hero mark IS the mark.
//
// Portrait is a DIFFERENT composition, not the same one squeezed. The copy column would
// be 44% of 390px, so on a phone the render goes full bleed behind, the scrim runs
// bottom-up instead of right-to-left, and every element — the legal note included — sits
// in one bottom-anchored flow. Absolutely positioning that note works at 1920 and lands
// on top of the call to action at 390.

export function Landing() {
  const { goToMenu, isTransitioning } = useApp();
  // The tower sits left of centre in its own frame. On a portrait phone object-cover
  // crops the sides away, so the framing has to move with the viewport or the building
  // leaves the picture.
  const portrait = useMediaQuery('(max-aspect-ratio: 4/5)');

  return (
    <Screen id="landing" padded={false}>
      {/* data-ring-box: the towers' own box in the picture, which the page transition's
          ring opens around when a visitor comes back here. */}
      <div data-ring-focus data-ring-box="0.242 0.117 0.439 0.844" className="absolute inset-0">
        <Render id="tower-dusk" priority sizes="100vw" position={portrait ? '42% 30%' : 'center'} />
      </div>

      {/* Which scrim does the work depends on where the copy is. Landscape: the copy is
          on the right, so it runs right to left. Portrait: the copy is at the foot, so it
          runs bottom up. They are mutually exclusive rather than layered — an inline
          `background` cannot be overridden by a `max-md:` class, so each one is simply
          hidden at the size it does not serve. */}
      <div
        data-scrim
        aria-hidden="true"
        className="absolute inset-0 max-md:hidden"
        style={{
          background:
            'linear-gradient(255deg, rgb(var(--scrim-rgb) / 0.95) 0%, rgb(var(--scrim-rgb) / 0.84) 26%, rgb(var(--scrim-rgb) / 0.34) 56%, transparent 78%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'linear-gradient(0deg, rgb(var(--scrim-rgb) / 0.97) 0%, rgb(var(--scrim-rgb) / 0.95) 38%, rgb(var(--scrim-rgb) / 0.62) 58%, rgb(var(--scrim-rgb) / 0.15) 80%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 max-md:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgb(var(--scrim-rgb) / 0.5) 0%, transparent 22%, transparent 74%, rgb(var(--scrim-rgb) / 0.55) 100%)',
        }}
      />

      <div className="screen-inset-bare relative z-10 grid h-full min-h-0 grid-cols-[1fr_minmax(0,44%)] gap-[3%] max-xl:grid-cols-[1fr_minmax(0,50%)] max-lg:grid-cols-[1fr_minmax(0,58%)] max-md:grid-cols-1">
        <span aria-hidden="true" className="max-md:hidden" />

        <div className="flex min-h-0 flex-col justify-center gap-[clamp(0.7rem,2.2vh,2rem)] max-md:justify-end max-md:gap-[0.8rem] max-md:pb-[0.4rem]">
          <Lockup
            variant="full"
            className="w-[clamp(9rem,17vw,21rem)] shrink-0 self-start text-w-gold max-md:w-[7.6rem] max-mob:w-[6.6rem]"
          />

          {/* The extreme tracking is the brand's own, but at 390px it turns one line into
              three ragged ones — so the phone gets half of it, and a leading that makes
              two lines read as a deliberate pair rather than as an accident. */}
          <span
            data-landing-eyebrow
            className="eyebrow eyebrow-wide block text-w-cream/60 max-md:leading-[1.9] max-md:tracking-[0.34em]"
          >
            {LANDING.eyebrow}
          </span>

          {/* Montserrat ExtraLight. The one place in the app that uses weight 200 — it is
              the single largest thing on screen and any more weight makes it shout. */}
          <h1
            data-headline-landing
            className="text-hero font-extralight uppercase leading-[1.14] tracking-[0.045em] text-w-cream max-md:leading-[1.2]"
          >
            {LANDING.headline.map((line, i) => (
              <span key={line} data-landing-line className="block">
                {i === 2 ? (
                  <>
                    Forest <span className="text-w-gold">&amp;</span> City Views
                  </>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <div data-landing-meta className="flex items-center gap-[0.9em]">
            <span
              aria-hidden="true"
              className="h-px w-[clamp(1.4rem,3vw,3.4rem)] shrink-0 bg-w-gold"
            />
            <span className="min-w-0 text-caption tracking-[0.2em] text-w-gold uppercase max-mob:tracking-[0.1em]">
              {LANDING.meta}
            </span>
          </div>

          <Portal
            onClick={goToMenu}
            disabled={isTransitioning}
            data-enter
            className="mt-[0.3em] self-start"
          >
            {LANDING.enter}
          </Portal>

          {/* In flow on a phone, where every pixel is already spoken for. */}
          <p data-landing-note className="text-micro leading-[1.5] text-w-cream/45 md:hidden">
            {PROJECT.rera}
          </p>
        </div>
      </div>

      {/* Out of the composition and into the corner the eye reaches last, on anything
          wide enough to have one. */}
      <div
        data-landing-note
        className="pointer-events-none absolute bottom-0 left-0 z-10 max-w-[40ch] max-md:hidden"
        style={{ padding: 'var(--screen-margin)' }}
      >
        <p className="text-micro leading-[1.5] text-w-cream/55">
          {PROJECT.rera} · {LANDING.note}
        </p>
      </div>
    </Screen>
  );
}
