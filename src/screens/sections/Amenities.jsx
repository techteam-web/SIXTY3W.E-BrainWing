import { useCallback, useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { Crossfade } from '../../components/Crossfade';
import { AMENITIES } from '../../data/content';
import { gsap, useGSAP, E } from '../../gsap/Gsapconfig';

// Ten amenities and one frame. A grid of ten thumbnails would give each of them a
// postage stamp and the visitor a decision to make; a list beside one large arch-topped
// window gives them a name to read and a picture worth looking at.
//
// The window is cut to the logo's crown — the same radius as the mark, the portal and
// the transition — so the brand's one shape is doing the framing rather than a rounded
// rectangle chosen by eye.

const { items, eyebrow, headline, lede } = AMENITIES;

export function Amenities() {
  const [i, setI] = useState(0);
  const item = items[i];

  const onEnter = useCallback((next) => setI(next), []);

  return (
    <Screen id="amenities">
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,40%)_1fr] gap-[clamp(1.5rem,4%,4rem)] max-lg:grid-cols-1 max-lg:grid-rows-[auto_1fr] max-lg:items-start max-lg:gap-[clamp(1rem,2.4vh,1.8rem)]">
        <div className="flex min-h-0 flex-col justify-center gap-[clamp(1rem,3vh,2.4rem)]">
          <SectionHead eyebrow={eyebrow} headline={headline} lede={lede} />
          <List items={items} active={i} onEnter={onEnter} />
        </div>

        <Window item={item} index={i} />
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------------- list */

function List({ items, active, onEnter }) {
  return (
    <ul
      data-stagger
      className="grid grid-cols-2 gap-x-[clamp(1rem,2vw,2.4rem)] gap-y-[0.1em] max-lg:grid-cols-3 max-md:grid-cols-2"
    >
      {items.map((item, i) => (
        <li key={item.id} className="min-w-0">
          <button
            type="button"
            aria-current={i === active}
            onPointerEnter={(e) => {
              if (e.pointerType === 'touch') return;
              onEnter(i);
            }}
            onFocus={() => onEnter(i)}
            onClick={() => onEnter(i)}
            className="group flex w-full min-w-0 items-center gap-[0.6em] py-[clamp(0.28rem,0.85vh,0.6rem)] text-left"
          >
            <span
              aria-hidden="true"
              className={`h-px shrink-0 bg-w-gold transition-all duration-400 ease-out ${
                i === active ? 'w-[1.5em] opacity-100' : 'w-[0.5em] opacity-40'
              }`}
            />
            <span
              className={`min-w-0 truncate text-caption uppercase tracking-[0.14em] transition-colors duration-300 ${
                i === active ? 'text-w-cream' : 'text-w-cream/50 group-hover:text-w-cream/85'
              }`}
            >
              {item.title}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ window */

function Window({ item, index }) {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-window-part]',
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.62, ease: E.out, stagger: 0.06, overwrite: 'auto' },
      );
    },
    { dependencies: [index], scope: root, revertOnUpdate: false },
  );

  return (
    <div
      data-stagger
      ref={root}
      className="relative flex min-h-0 w-full flex-col justify-center gap-[clamp(0.8rem,2vh,1.6rem)]"
    >
      {/* The screen's subject: the page transition's ring opens around it. */}
      <div data-ring-focus className="relative min-h-0">
        {/* A gold hairline standing just outside the frame, offset the way a mount board
            sits behind a print. It is the only decoration on this screen. */}
        <span
          aria-hidden="true"
          className="crown pointer-events-none absolute -inset-[0.7em] border border-w-gold/25 max-md:-inset-[0.45em]"
        />
        <Crossfade
          id={item.render}
          sizes="(max-width: 1024px) 92vw, 52vw"
          className="crown relative aspect-[4/3] max-h-[58vh] w-full max-lg:aspect-[16/10] max-lg:max-h-[38vh]"
          position="50% 50%"
          priority
        />
      </div>

      <div className="flex min-w-0 flex-col gap-[0.4em] overflow-hidden">
        <span
          data-window-part
          className="text-title font-light uppercase tracking-[0.13em] text-w-cream"
        >
          {item.title}
        </span>
        <span data-window-part className="text-caption text-w-cream/60">
          {item.caption}
        </span>
      </div>
    </div>
  );
}
