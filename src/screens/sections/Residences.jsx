import { Screen } from '../../layout/Screen';
import { Crossfade } from '../../components/Crossfade';
import { RESIDENCES } from '../../data/content';

// One room, full bleed — the arrival, and nothing competing with it.
//
// This screen used to carry four plates behind a numbered selector. With the lobby
// standing alone there is nothing to select between, so the tabs and the left/right
// key handler are gone and the picture is no longer interrupted: the composition is a
// single still, and the type is the only thing drawn on top of it.
//
// What replaces the old bullet list is a specification band — four columns on one gold
// rule, each numbered, each divided by a hairline. That is how the brochure sets a
// specification, and at this size it reads as a plate of credentials rather than as a
// list of points. Nothing animates here on its own: every marked part is staged and
// released by TransitionDirector with the arch, so the screen composes as one movement.

const { rooms, eyebrow } = RESIDENCES;
const room = rooms[0];

export function Residences() {
  return (
    <Screen id="residences" padded={false}>
      <Crossfade
        id={room.render}
        sizes="100vw"
        className="absolute inset-0"
        position="50% 46%"
        priority
      />

      {/* No teal on this render. A teal wash turned an interior lit in warm stone and
          timber green, so the only shading left is neutral — plain shadow, the way a
          photograph darkens toward its edge. The corner pool is deeper than it was:
          with the selector gone the type sits lower in the frame, and the foot of the
          lobby plate is pale marble. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 max-md:hidden"
        style={{
          background:
            'radial-gradient(64% 76% at 0% 100%, rgb(0 0 0 / 0.56) 0%, rgb(0 0 0 / 0.32) 52%, rgb(0 0 0 / 0) 100%), linear-gradient(0deg, rgb(0 0 0 / 0.78) 0%, rgb(0 0 0 / 0.6) 26%, rgb(0 0 0 / 0.24) 46%, rgb(0 0 0 / 0) 62%)',
        }}
      />
      {/* The phone's own, and heavier: the type covers the bottom half of the frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'linear-gradient(0deg, rgb(0 0 0 / 0.82) 0%, rgb(0 0 0 / 0.7) 34%, rgb(0 0 0 / 0.34) 54%, rgb(0 0 0 / 0) 72%)',
        }}
      />

      {/* A soft shadow under the type, wide and faint: over pale stone it is what keeps
          cream legible without darkening the picture any further. */}
      <div className="screen-inset relative z-10 flex h-full min-h-0 flex-col justify-end [text-shadow:0_1px_24px_rgb(0_0_0/0.5)]">
        <span data-stagger className="eyebrow mb-[1em] block">
          {eyebrow}
        </span>

        {/* Split into lines and released from under its own clip by the director. */}
        <h1
          data-headline
          className="max-w-[18ch] text-hero font-extralight uppercase leading-[1.06] tracking-[0.055em] text-w-cream max-md:max-w-[12ch]"
        >
          {room.title}
        </h1>

        <Specification features={room.features} />
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------ specification */

// Four columns on a shared gold rule, each opening with its own numeral. The rule is
// gold at full strength on the left and fades out to the right, so the band is anchored
// where the type is and dissolves into the picture rather than ending on a hard stop.
function Specification({ features }) {
  return (
    <div data-stagger className="mt-[clamp(1.6rem,4.4vh,3.2rem)] shrink-0">
      <span
        aria-hidden="true"
        className="block h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, var(--color-w-gold) 0%, color-mix(in srgb, var(--color-w-gold) 45%, transparent) 46%, transparent 100%)',
        }}
      />

      <dl className="grid grid-cols-4 gap-x-[clamp(1rem,2.4vw,3rem)] max-md:grid-cols-2 max-md:gap-y-[1.4rem]">
        {features.map((f, i) => (
          <div
            key={f}
            className={
              // A hairline divides the columns — never before the first, and on the
              // phone's two-column grid never before the one that opens a row (the
              // odd-numbered children, 01 and 03).
              `relative pt-[1.15em] ${
                i === 0
                  ? ''
                  : 'before:absolute before:inset-y-[1.15em] before:left-[calc(-1*clamp(0.5rem,1.2vw,1.5rem))] before:w-px before:bg-w-cream/12 before:content-[""] max-md:odd:before:hidden'
              }`
            }
          >
            <dt className="text-micro tabular-nums tracking-[0.26em] text-w-gold">
              {String(i + 1).padStart(2, '0')}
            </dt>
            <dd className="mt-[0.85em] max-w-[22ch] text-read font-light leading-[1.5] text-w-cream/85">
              {f}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
