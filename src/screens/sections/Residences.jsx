import { useCallback, useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { Crossfade } from '../../components/Crossfade';
import { RESIDENCES } from '../../data/content';
import { useEventListener } from '../../hooks/useEventListener';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';

// Four rooms, full bleed, one at a time — because that is how the brochure shows them,
// and because a render this good does not want a caption box drawn around it.
//
// The room changes without a page transition: this is movement inside one screen, not
// movement through the document, and reusing the arch cut here would flatten the
// difference between the two. The picture cross-fades under a slow settle; the caption
// is what actually performs.

const { rooms, eyebrow } = RESIDENCES;

export function Residences() {
  const [i, setI] = useState(0);
  const room = rooms[i];

  const go = useCallback((next) => {
    setI((prev) => {
      const n = (next + rooms.length) % rooms.length;
      return n === prev ? prev : n;
    });
  }, []);

  // This screen owns the left/right keys. Up and down stay with the global nav, which
  // moves between sections — so the two axes never mean the same thing.
  useEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    if (e.key === 'ArrowRight') {
      go(i + 1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      go(i - 1);
      e.preventDefault();
    }
  });

  return (
    <Screen id="residences" padded={false}>
      <Crossfade
        id={room.render}
        sizes="100vw"
        className="absolute inset-0"
        position="50% 46%"
        priority
      />

      {/* No teal on these renders. A teal wash turned four interiors lit in warm stone
          and timber green, so the only shading left is neutral — plain shadow, the way a
          photograph darkens toward its edge — and only where the caption needs it: the
          foot of the frame, deepest in the corner the type sits in. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 max-md:hidden"
        style={{
          background:
            'radial-gradient(58% 70% at 0% 100%, rgb(0 0 0 / 0.5) 0%, rgb(0 0 0 / 0.3) 50%, rgb(0 0 0 / 0) 100%), linear-gradient(0deg, rgb(0 0 0 / 0.74) 0%, rgb(0 0 0 / 0.56) 24%, rgb(0 0 0 / 0.22) 42%, rgb(0 0 0 / 0) 58%)',
        }}
      />
      {/* The phone's own, and heavier: the caption covers the bottom 40% of the frame,
          and on the lobby plate that 40% is pale marble. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'linear-gradient(0deg, rgb(0 0 0 / 0.78) 0%, rgb(0 0 0 / 0.66) 30%, rgb(0 0 0 / 0.3) 48%, rgb(0 0 0 / 0) 68%)',
        }}
      />

      <div className="screen-inset relative z-10 flex h-full min-h-0 flex-col justify-end gap-[clamp(1.1rem,3.2vh,2.4rem)]">
        <RoomCaption room={room} index={i} eyebrow={eyebrow} />
        <Selector rooms={rooms} active={i} onSelect={go} />
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ caption */

function RoomCaption({ room, index, eyebrow }) {
  const root = useRef(null);

  // Re-runs whenever the room changes: each line arrives from beneath its own mask, in
  // sequence. No remount, so the layout never shifts under the animation.
  useGSAP(
    () => {
      gsap.fromTo(
        '[data-caption-part]',
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: E.out, stagger: 0.07, overwrite: 'auto' },
      );
    },
    { dependencies: [index], scope: root, revertOnUpdate: false },
  );

  return (
    // A soft shadow under the type, wide and faint: over a bright window or pale stone it
    // is what keeps cream legible without darkening the picture any further.
    <div
      ref={root}
      className="max-w-[46ch] [text-shadow:0_1px_22px_rgb(0_0_0/0.45)] max-md:max-w-none"
    >
      <span data-stagger className="eyebrow mb-[0.9em] block">
        {eyebrow}
      </span>

      {/* Each line sits in its own clipping box so the movement reads as type rising
          into place rather than as a block sliding around. */}
      <div className="overflow-hidden pb-[0.08em]">
        <h1
          data-caption-part
          className="text-headline font-extralight uppercase leading-[1.1] tracking-[0.05em] text-w-cream"
        >
          {room.title}
        </h1>
      </div>

      <div className="mt-[0.7em] flex items-center gap-[0.9em] overflow-hidden py-[0.1em]">
        <span
          data-caption-part
          aria-hidden="true"
          className="h-px w-[clamp(1.6rem,3.4vw,3.6rem)] shrink-0 bg-w-gold"
        />
        <span data-caption-part className="min-w-0 text-subhead font-light text-w-cream/80">
          {room.caption}
        </span>
      </div>

      <div className="overflow-hidden pt-[0.5em]">
        <span
          data-caption-part
          className="block text-caption tracking-[0.2em] text-w-gold/75 uppercase"
        >
          {room.note}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- selector */

// Four numbered tabs on a shared rule. The active marker is ONE element that slides
// between positions rather than a per-tab underline fading in and out: the eye can
// follow a thing that moves, and cannot follow two things that swap.
function Selector({ rooms, active, onSelect }) {
  const root = useRef(null);

  const place = useCallback(
    (animate) => {
      const el = root.current;
      if (!el) return;
      const tab = el.querySelector(`[data-tab="${active}"]`);
      const bar = el.querySelector('[data-tab-bar]');
      if (!tab || !bar) return;
      // Both rects come from the same transformed subtree, so the difference between
      // them is correct even while the screen itself is mid-transition.
      const box = el.getBoundingClientRect();
      const r = tab.getBoundingClientRect();
      const vars = { x: r.left - box.left, width: r.width, overwrite: 'auto' };
      if (animate) gsap.to(bar, { ...vars, duration: 0.55, ease: E.out });
      else gsap.set(bar, vars);
    },
    [active],
  );

  useGSAP(() => place(true), { dependencies: [active], scope: root, revertOnUpdate: false });
  useEventListener('resize', () => place(false));

  return (
    <div data-stagger ref={root} className="relative shrink-0">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-w-cream/15" />
      <span data-tab-bar aria-hidden="true" className="absolute left-0 top-0 h-px w-0 bg-w-gold" />

      <div className="flex gap-[clamp(1.1rem,3vw,4rem)] max-mob:gap-[0.85rem]">
        {rooms.map((room, i) => (
          <button
            key={room.id}
            type="button"
            data-tab={i}
            aria-current={i === active}
            onClick={() => onSelect(i)}
            className="group flex min-w-0 flex-col items-start gap-[0.4em] pt-[1.05em] text-left"
          >
            <span
              className={`text-micro tabular-nums tracking-[0.24em] transition-colors duration-300 ${
                i === active ? 'text-w-gold' : 'text-w-cream/35 group-hover:text-w-gold/70'
              }`}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            {/* "Entrance Lobby" is fourteen characters, and four of those beside each
                other do not fit across 390px at a legible size. The phone gets the short
                name; the full one is the headline directly above it either way. */}
            <span
              className={`truncate text-caption uppercase tracking-[0.16em] transition-colors duration-300 ${
                i === active ? 'text-w-cream' : 'text-w-cream/45 group-hover:text-w-cream/80'
              }`}
            >
              <span className="max-md:hidden">{room.title}</span>
              <span className="md:hidden">{room.short}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
