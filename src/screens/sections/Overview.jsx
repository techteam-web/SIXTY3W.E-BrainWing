import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { Render, CountUp } from '../../components/Primitives';
import { OVERVIEW } from '../../data/content';
import { useMediaQuery } from '../../hooks/useEventListener';

// The opening argument, and it is the name itself: SIXTY3W.E. is 400063, Western Express
// Highway. The render runs full bleed with the tower in the left of the frame, where the
// artist put it, and everything written sits in the open sky to its right: the claim,
// the four numbers that matter, and the six hallmarks under them.

function Stat({ k, unit, label, index }) {
  // The numeric part counts; the unit does not. Splitting them here means "3.2 m" and
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
      <span className="text-caption leading-[1.45] text-w-cream/60">{label}</span>
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
      {/* Full bleed. The render is 1.38:1, narrower than any landscape screen, so cover
          crops only its top and bottom and the tower lands a quarter of the way across —
          which is why the copy lives on the RIGHT: a column there cannot meet the
          building at any landscape ratio. data-ring-box is the two towers' own box in the
          picture, which the page transition's ring opens around. */}
      <div data-ring-focus data-ring-box="0.167 0.233 0.354 0.925" className="absolute inset-0">
        <Render
          id="tower-night"
          sizes="100vw"
          position={stacked ? '84% 50%' : '30% 50%'}
          priority
        />
      </div>

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
            <SectionHead
              eyebrow={OVERVIEW.eyebrow}
              headline={OVERVIEW.headline}
              lede={OVERVIEW.lede}
            />

            <div className="grid grid-cols-4 gap-[clamp(0.8rem,1.6vw,2rem)] max-3xl:grid-cols-2 max-3xl:gap-x-[clamp(1rem,2.4vw,2.6rem)] max-3xl:gap-y-[clamp(0.8rem,2vh,1.4rem)]">
              {OVERVIEW.hallmarks.map((h, i) => (
                <Stat key={h.label} {...h} index={i} />
              ))}
            </div>
          </div>

          {/* The six hallmarks. A rule above, then two columns: the rule stays because it
              divides one group from another; the bullets went because they only
              decorated a row. */}
          <div data-stagger className="shrink-0">
            <span aria-hidden="true" className="mb-[1.1em] block h-px w-full bg-w-gold/25" />
            <ul className="grid grid-cols-2 gap-x-[clamp(1rem,2.4vw,3rem)] gap-y-[0.7em] max-mob:grid-cols-1">
              {OVERVIEW.marks.map((m) => (
                <li key={m} className="min-w-0 text-caption leading-[1.45] text-w-cream/75">
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
