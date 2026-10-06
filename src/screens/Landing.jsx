import { useRef, useState } from 'react';
import { Screen } from '../layout/Screen';
import { Portal, Render } from '../components/Primitives';
import { Lockup } from '../components/Lockup';
import { VisitorCard } from '../components/VisitorCard';
import { LANDING, PROJECT } from '../data/content';
import { useApp } from '../app/appContext';
import { sessionVisitor } from '../app/visitor';
import { useMediaQuery } from '../hooks/useEventListener';
import { gsap, useGSAP, prefersReducedMotion } from '../gsap/Gsapconfig';

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
//
// BRIGHT, NOT DIM. The first version sat the tower under a heavy teal scrim and read as
// dusk turning to night. Now the render itself is lifted and warmed, the scrim only
// darkens as much as the copy needs, a low gold glow sits on the horizon, and the
// picture drifts in very slowly so the cover is never a still photograph.
//
// ENTER opens the visitor card (name and mobile — see VisitorCard) the first time in a
// session; after that, or once skipped, it goes straight to the menu.

export function Landing() {
  const { goToMenu, isTransitioning } = useApp();
  const [asking, setAsking] = useState(false);
  const drift = useRef(null);

  const enter = () => {
    if (sessionVisitor()) goToMenu();
    else setAsking(true);
  };

  // The slow drift. 24 seconds each way, 5% of scale: never caught moving, only noticed
  // to have moved. On a wrapper, not the <img>, which the intro scales on its own.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !drift.current) return;
      gsap.fromTo(
        drift.current,
        { scale: 1 },
        { scale: 1.05, duration: 24, ease: 'sine.inOut', repeat: -1, yoyo: true },
      );
    },
    { scope: drift },
  );
  // The tower sits left of centre in its own frame. On a portrait phone object-cover
  // crops the sides away, so the framing has to move with the viewport or the building
  // leaves the picture.
  const portrait = useMediaQuery('(max-aspect-ratio: 4/5)');

  return (
    <Screen id="landing" padded={false}>
      {/* data-ring-box: the towers' own box in the picture, which the page transition's
          ring opens around when a visitor comes back here. */}
      <div data-ring-focus data-ring-box="0.242 0.117 0.439 0.844" className="absolute inset-0 overflow-hidden">
        <div
          ref={drift}
          className="h-full w-full origin-[34%_60%] [filter:brightness(1.14)_saturate(1.14)_contrast(1.03)]"
        >
          <Render id="tower-dusk" priority sizes="100vw" position={portrait ? '42% 30%' : 'center'} />
        </div>
      </div>

      {/* The horizon glow: warm light pooled at the foot of the tower and across the
          sunset band, screened over the picture so it brightens rather than tints. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            'radial-gradient(55% 38% at 30% 78%, rgb(231 207 149 / 0.2) 0%, rgb(231 207 149 / 0) 100%), radial-gradient(40% 30% at 78% 70%, rgb(200 161 107 / 0.12) 0%, rgb(200 161 107 / 0) 100%)',
        }}
      />

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
            'linear-gradient(255deg, rgb(var(--scrim-rgb) / 0.82) 0%, rgb(var(--scrim-rgb) / 0.62) 28%, rgb(var(--scrim-rgb) / 0.18) 56%, transparent 74%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'linear-gradient(0deg, rgb(var(--scrim-rgb) / 0.94) 0%, rgb(var(--scrim-rgb) / 0.86) 38%, rgb(var(--scrim-rgb) / 0.5) 58%, rgb(var(--scrim-rgb) / 0.1) 80%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 max-md:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgb(var(--scrim-rgb) / 0.3) 0%, transparent 18%, transparent 80%, rgb(var(--scrim-rgb) / 0.4) 100%)',
        }}
      />

      <div className="screen-inset-bare relative z-10 grid h-full min-h-0 grid-cols-[1fr_minmax(0,44%)] gap-[3%] max-xl:grid-cols-[1fr_minmax(0,50%)] max-lg:grid-cols-[1fr_minmax(0,58%)] max-md:grid-cols-1">
        <span aria-hidden="true" className="max-md:hidden" />

        <div className="flex min-h-0 flex-col justify-center gap-[clamp(0.7rem,2.2vh,2rem)] max-md:justify-end max-md:gap-[0.8rem] max-md:pb-[0.4rem]">
          <div className="flex shrink-0 flex-col items-start gap-[clamp(0.5rem,1.4vh,1rem)]">
            <Lockup
              variant="full"
              className="w-[clamp(9rem,17vw,21rem)] shrink-0 text-w-gold max-md:w-[7.6rem] max-mob:w-[6.6rem]"
            />
            {/* Where it is, under the mark, centred on the lockup the way the printed
                GOREGAON (E) line is. */}
            <span
              data-landing-near
              className="flex w-[clamp(9rem,17vw,21rem)] items-center justify-center gap-[0.45em] whitespace-nowrap text-caption uppercase tracking-[0.12em] text-w-gold-lit max-md:w-auto max-md:justify-start max-mob:tracking-[0.06em]"
            >
              <PinIcon />
              {LANDING.near}
            </span>
          </div>

          {/* The extreme tracking is the brand's own, but at 390px it turns one line into
              three ragged ones — so the phone gets half of it, and a leading that makes
              two lines read as a deliberate pair rather than as an accident. */}
          <span
            data-landing-eyebrow
            className="eyebrow eyebrow-wide block text-w-cream/85 max-md:leading-[1.9] max-md:tracking-[0.34em]"
          >
            {LANDING.eyebrow}
          </span>

          {/* Montserrat ExtraLight. The one place in the app that uses weight 200 — it is
              the single largest thing on screen and any more weight makes it shout. */}
          <h1
            data-headline-landing
            className="text-hero font-extralight uppercase leading-[1.14] tracking-[0.045em] text-w-cream [text-shadow:0_2px_30px_rgb(4_26_25/0.35)] max-md:leading-[1.2]"
          >
            {LANDING.headline.map((line, i) => (
              <span key={line} data-landing-line className="block">
                {i === 2 ? (
                  <>
                    <span className="gold-text font-light">Forest</span>{' '}
                    <span className="amp text-w-gold-lit">&</span>{' '}
                    <span className="gold-text font-light">City Views</span>
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
            <span className="min-w-0 text-caption tracking-[0.2em] text-w-gold-lit uppercase max-mob:tracking-[0.1em]">
              {LANDING.meta}
            </span>
          </div>

          <Portal
            onClick={enter}
            disabled={isTransitioning || asking}
            data-enter
            className="portal--cta mt-[0.3em] self-start"
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

      {asking ? (
        <VisitorCard
          onClose={() => setAsking(false)}
          onDone={() => {
            setAsking(false);
            goToMenu();
          }}
        />
      ) : null}
    </Screen>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 14.9 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="9.8" r="2.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
