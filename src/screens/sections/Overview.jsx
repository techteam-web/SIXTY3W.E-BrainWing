import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { Render, CountUp } from '../../components/Primitives';
import { OVERVIEW } from '../../data/content';
import { useMediaQuery } from '../../hooks/useEventListener';

// The opening argument, and it is the name itself: W.E. is Wonderful living, Exclusive
// lifestyle, in the microsite's own words. The tower stands whole on the left — crown to
// the lawn in front of it, never cropped — and everything written sits in the open sky
// to its right: the claim, the two views, the four numbers that matter, and the
// hallmarks under them.

function Stat({ k, unit, label, index }) {
  // The numeric part counts; the unit does not. Splitting them here means "3.2 mtr" and
  // "579 sq.ft." both animate without the unit flickering through intermediate values.
  const n = Number(k);
  const decimals = k.includes('.') ? 1 : 0;

  return (
    <div data-stagger className="flex min-w-0 flex-col gap-[0.35em]">
      <span className="flex items-baseline gap-[0.22em] text-stat font-extralight leading-none text-w-cream">
        {Number.isFinite(n) ? (
          <CountUp to={n} decimals={decimals} delay={0.35 + index * 0.09} />
        ) : (
          k
        )}
        <span className="text-caption font-normal tracking-[0.16em] text-w-gold uppercase">
          {unit}
        </span>
      </span>
      <span className="text-read leading-[1.45] text-w-cream/70">{label}</span>
    </div>
  );
}

export function Overview() {
  // Below lg there is one column and it runs the full width, so no part of the frame is
  // free of type. There the render shows its sky, and the tower stays out from under the
  // copy by staying out of frame.
  const stacked = useMediaQuery('(max-width: 63.999rem)');

  return (
    <Screen id="overview" padded={false}>
      {stacked ? (
        // One column, full width: the render shows its sky, and the tower stays out from
        // under the copy by staying out of frame.
        <div className="absolute inset-0">
          <Render id="tower-night" sizes="100vw" position="84% 50%" priority />
        </div>
      ) : (
        <>
          {/* The same picture, blurred and cover-fitted, as the ground the elevation
              stands on — so the band to the right of the picture is its own sky rather
              than a flat fill. */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden" data-overflow-ok>
            <Render
              id="tower-night"
              sizes="60vw"
              position="70% 40%"
              className="scale-110 blur-[28px]"
            />
          </div>

          {/* THE ELEVATION, WHOLE. The render is 1.38:1, narrower than any landscape
              screen, so a full-bleed cover cut the podium and the lawn off the bottom of
              the building. Here the picture is fitted to the screen's HEIGHT instead —
              crown to grass, every storey — and its right edge dissolves into the
              blurred copy behind it. The box is exactly the render's own shape, so
              data-ring-box (the two towers' box in the picture) still maps 1:1. */}
          <div
            data-ring-focus
            data-ring-box="0.167 0.233 0.354 0.925"
            className="absolute inset-y-0 left-0 aspect-[1824/1324] h-full [mask-image:linear-gradient(90deg,#000_0%,#000_72%,transparent_100%)]"
          >
            <Render id="tower-night" sizes="(max-width: 1024px) 100vw, 80vw" priority />
          </div>
        </>
      )}

      {/* The only shading, and it is the sky's own navy rather than the app's teal, so it
          deepens the dusk instead of tinting the picture. Just enough under the copy to
          carry cream over the sunset band; it is gone well before the tower. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 max-lg:hidden"
        style={{
          background:
            // Plus a low band along the foot, and a little more in the corner, for the page
            // label that sits over the trees and the lit block beside the tower.
            'radial-gradient(26% 20% at 0% 100%, rgb(6 12 26 / 0.55) 0%, rgb(6 12 26 / 0) 100%), linear-gradient(0deg, rgb(6 12 26 / 0.6) 0%, rgb(6 12 26 / 0) 22%), linear-gradient(270deg, rgb(6 12 26 / 0.5) 0%, rgb(6 12 26 / 0.36) 36%, rgb(6 12 26 / 0) 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            'linear-gradient(0deg, rgb(6 12 26 / 0.66) 0%, rgb(6 12 26 / 0.36) 30%, rgb(6 12 26 / 0.14) 62%, rgb(6 12 26 / 0.22) 100%)',
        }}
      />

      <div className="screen-inset relative z-10 grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,46%)] max-lg:grid-cols-1">
        <span aria-hidden="true" className="max-lg:hidden" />

        <div className="grid min-h-0 grid-rows-[auto_auto] content-center gap-[clamp(1.6rem,4.8vh,3.6rem)] max-lg:grid-rows-[minmax(0,1fr)_auto] max-lg:content-stretch max-lg:gap-[clamp(1rem,3vh,2.5rem)]">
          <div className="flex min-h-0 flex-col justify-center gap-[clamp(1rem,3.2vh,2.6rem)]">
            <SectionHead eyebrow={OVERVIEW.eyebrow} headline={OVERVIEW.headline} />

            <Name />

            <div className="grid grid-cols-4 gap-[clamp(0.8rem,1.6vw,2rem)] max-3xl:grid-cols-2 max-3xl:gap-x-[clamp(1rem,2.4vw,2.6rem)] max-3xl:gap-y-[clamp(0.8rem,2vh,1.4rem)]">
              {OVERVIEW.hallmarks.map((h, i) => (
                <Stat key={h.label} {...h} index={i} />
              ))}
            </div>

            <Views />
          </div>

          {/* The six hallmarks. A rule above, then two columns: the rule stays because it
              divides one group from another; the bullets went because they only
              decorated a row. On a phone or a short screen they give way to the name and
              the views — every one of them is repeated on the Specifications sheet. */}
          <div data-stagger className="shrink-0 max-lg:hidden [@media(max-height:56rem)]:hidden">
            <span aria-hidden="true" className="mb-[1.1em] block h-px w-full bg-w-gold/25" />
            <ul className="grid grid-cols-2 gap-x-[clamp(1rem,2.4vw,3rem)] gap-y-[0.7em] max-mob:grid-cols-1">
              {OVERVIEW.marks.map((m) => (
                <li key={m} className="min-w-0 text-read leading-[1.45] text-w-cream/80">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------------- name */

// The microsite's own explanation of the name, word for word: the gold initials spell
// W.E., and the paragraph under them is the microsite's, not ours.
function Name() {
  return (
    <div data-stagger className="flex max-w-[52ch] flex-col gap-[0.9em]">
      <p className="text-subhead font-light uppercase tracking-[0.12em] text-w-cream">
        {OVERVIEW.name.map((w) => (
          <span key={w.initial} className="mr-[0.35em] inline-block">
            <span className="text-[1.35em] font-normal text-w-gold">{w.initial}</span>
            {w.rest}
          </span>
        ))}
      </p>
      <p className="text-body leading-[1.6] text-w-cream/70">{OVERVIEW.lede}</p>
    </div>
  );
}

/* ------------------------------------------------------------------- views */

// Aarey Views and City Views: the two outlooks, each under the brand's own arch.
function Views() {
  return (
    <ul data-stagger className="grid grid-cols-2 gap-[clamp(0.6rem,1.6vw,2rem)]">
      {OVERVIEW.views.map((v) => (
        <li
          key={v.id}
          className="flex min-w-0 items-start gap-[0.8em] rounded-t-[1.2em] border border-w-gold/30 bg-w-deep/35 px-[1em] py-[0.8em] max-md:gap-[0.5em] max-md:px-[0.7em] max-md:py-[0.6em]"
        >
          <ArchGlyph className="mt-[0.1em] h-[1.6em] w-auto shrink-0 text-w-gold" />
          <span className="flex min-w-0 flex-col gap-[0.25em]">
            <span className="text-caption font-medium uppercase tracking-[0.2em] text-w-gold">
              {v.title}
            </span>
            <span className="text-caption leading-[1.45] text-w-cream/70">{v.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ArchGlyph({ className = '' }) {
  return (
    <svg viewBox="0 0 32 47" fill="none" aria-hidden="true" className={className}>
      <path
        d="M1 46V11a10 10 0 0 1 10-10h10a10 10 0 0 1 10 10v35"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
