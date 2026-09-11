import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { Render, CountUp } from '../../components/Primitives';
import { OVERVIEW } from '../../data/content';

// The opening argument, and it is the name itself: SIXTY3W.E. is 400063, Western Express
// Highway. The tower holds the right of the frame the way it does on page 3 of the
// brochure; the four numbers that matter sit under the claim, and the six hallmarks run
// along the foot of the screen where they can be read at a glance without competing.

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
      <span className="text-caption leading-[1.45] text-w-cream/55">{label}</span>
    </div>
  );
}

export function Overview() {
  return (
    <Screen id="overview" padded={false}>
      {/* The render is inset from the left rather than full-bleed, and that is the whole
          composition. The tower stands a third of the way into its own frame; at full
          bleed it therefore lands under the copy column no matter what object-position
          says — the image is wider than 16:9, so object-cover crops the TOP and BOTTOM
          and the horizontal axis cannot move at all. Giving the render the right 78% of
          the screen moves the building where it belongs and leaves the ground gradient
          to carry the left. */}
      <div className="absolute inset-y-0 left-[22%] right-0 max-md:left-0">
        <Render id="tower-night" sizes="80vw" position="50% 46%" priority />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgb(var(--scrim-rgb) / 1) 0%, rgb(var(--scrim-rgb) / 0.98) 22%, rgb(var(--scrim-rgb) / 0.62) 44%, rgb(var(--scrim-rgb) / 0.12) 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgb(var(--scrim-rgb) / 0.82) 0%, rgb(var(--scrim-rgb) / 0.25) 26%, transparent 52%)',
        }}
      />

      <div className="screen-inset relative z-10 grid h-full min-h-0 grid-rows-[1fr_auto] gap-[clamp(1rem,3vh,2.5rem)]">
        <div className="grid min-h-0 grid-cols-[minmax(0,46%)_1fr] items-center gap-[4%] max-lg:grid-cols-1">
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
          <span aria-hidden="true" className="max-lg:hidden" />
        </div>

        {/* The six hallmarks. A rule above, then two rows of three: the same rhythm the
            brochure uses for its icon strip, without the icons, which at this size were
            decoration standing in for information. The rule stays because it divides one
            group from another; the bullets went because they only decorated a row. */}
        <div data-stagger className="shrink-0">
          <span aria-hidden="true" className="mb-[1.1em] block h-px w-full bg-w-gold/25" />
          <ul className="grid grid-cols-3 gap-x-[clamp(1rem,2.4vw,3rem)] gap-y-[0.7em] max-lg:grid-cols-2 max-mob:grid-cols-1">
            {OVERVIEW.marks.map((m) => (
              <li key={m} className="min-w-0 text-caption leading-[1.45] text-w-cream/70">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Screen>
  );
}
