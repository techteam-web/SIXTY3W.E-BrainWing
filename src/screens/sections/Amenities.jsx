import { useCallback, useEffect, useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { TourViewer } from '../../components/pano/TourViewer';
import { TourCard } from '../../components/pano/TourCard';
import { Portal } from '../../components/Primitives';
import { AMENITIES } from '../../data/content';
import { AMENITY_SCENES, AMENITY_TOUR, TOUR_START, thumbFor } from '../../data/galleryTour';
import { useApp } from '../../app/appContext';

// Ten amenities, and a 360° gallery of the eight that were shot in the round.
//
// The list stays as the index — every amenity, by name — and points at the gallery:
// pointing at a name lights its card. The gallery is where a visitor steps in: a card
// opens the walkable tour on that space, and the tour's own arrows lead on from there
// (src/data/galleryTour.js). Reading Nook and Bonsai Garden weren't shot in 360, so they
// are names in the list with no card.

const { items, eyebrow, headline, lede } = AMENITIES;
const CARDS = items.filter((item) => AMENITY_SCENES[item.id]);

export function Amenities() {
  const [active, setActive] = useState(CARDS[0]?.id ?? null);
  const [tour, setTour] = useState(null);
  const tourRoot = useRef(null);
  const { setImmersive } = useApp();

  // The tour owns its corner (Back alone), the way the other 360° views do.
  useEffect(() => {
    setImmersive(tour != null);
    return () => setImmersive(false);
  }, [tour, setImmersive]);

  const point = useCallback((id) => setActive(id), []);
  const open = useCallback((id) => {
    const scene = AMENITY_SCENES[id];
    if (scene) setTour(scene);
    else setActive(id);
  }, []);

  return (
    <Screen id="amenities">
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,29%)_1fr] gap-[clamp(1.5rem,3%,3.4rem)] max-xl:grid-cols-[minmax(0,34%)_1fr] max-lg:grid-cols-1 max-lg:grid-rows-[auto_minmax(0,1fr)] max-lg:gap-[clamp(1rem,2.4vh,1.8rem)]">
        <div className="flex min-h-0 flex-col justify-center gap-[clamp(1rem,3vh,2.4rem)]">
          <SectionHead eyebrow={eyebrow} headline={headline} lede={lede} />
          <List items={items} active={active} onPoint={point} onOpen={open} />
          {/* The whole level from the beginning: out of the lift, then wherever the
              arrows lead. The cards drop a visitor straight into one space instead. */}
          <div data-stagger>
            <Portal onClick={() => setTour(TOUR_START)} className="self-start">
              Start 360° Tour
            </Portal>
          </div>
        </div>

        <Gallery cards={CARDS} active={active} onPoint={point} onOpen={open} />
      </div>

      {/* Overlaid, not swapped in for the whole screen: the gallery stays mounted behind,
          so coming Back needs nothing re-laid-out. */}
      {tour ? (
        <TourViewer
          tour={AMENITY_TOUR}
          start={tour}
          onBack={() => setTour(null)}
          backLabel="Back to the amenities"
          rootRef={tourRoot}
        />
      ) : null}
    </Screen>
  );
}

/* -------------------------------------------------------------------- list */

function List({ items, active, onPoint, onOpen }) {
  return (
    <ul
      data-stagger
      className="grid grid-cols-2 gap-x-[clamp(0.8rem,1.4vw,1.8rem)] gap-y-[0.1em] max-lg:grid-cols-3 max-md:hidden"
    >
      {items.map((item) => {
        const on = item.id === active;
        const has360 = !!AMENITY_SCENES[item.id];
        return (
          <li key={item.id} className="min-w-0">
            <button
              type="button"
              aria-current={on}
              aria-label={has360 ? `${item.title} — open 360° view` : item.title}
              onPointerEnter={(e) => {
                if (e.pointerType === 'touch') return;
                onPoint(item.id);
              }}
              onFocus={() => onPoint(item.id)}
              onClick={() => onOpen(item.id)}
              className="group flex w-full min-w-0 items-center gap-[0.6em] py-[clamp(0.28rem,0.85vh,0.6rem)] text-left"
            >
              <span
                aria-hidden="true"
                className={`h-px shrink-0 bg-w-gold transition-all duration-400 ease-out ${
                  on ? 'w-[1.5em] opacity-100' : 'w-[0.5em] opacity-40'
                }`}
              />
              <span
                className={`min-w-0 truncate text-caption uppercase tracking-[0.14em] transition-colors duration-300 ${
                  on ? 'text-w-cream' : 'text-w-cream/50 group-hover:text-w-cream/85'
                }`}
              >
                {item.title}
              </span>
              {has360 ? (
                <span
                  className={`shrink-0 text-micro tracking-[0.12em] transition-colors duration-300 ${
                    on ? 'text-w-gold' : 'text-w-gold/40'
                  }`}
                >
                  360°
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ----------------------------------------------------------------- gallery */

// Four across, two down, filling the column — sized by the grid, never by the picture,
// so it can't push the screen past its own height. The thumbnail is the scene's own
// lowest tile on the face it opens facing (thumbFor), so a card shows what stepping in
// will show.
function Gallery({ cards, active, onPoint, onOpen }) {
  return (
    <ul
      data-stagger
      data-ring-focus
      className="grid h-full min-h-0 grid-cols-4 grid-rows-2 gap-[clamp(0.6rem,1.1vw,1.2rem)] max-md:grid-cols-2 max-md:grid-rows-4"
    >
      {cards.map((item) => (
        <li key={item.id} className="min-h-0 min-w-0">
          <TourCard
            title={item.title}
            image={thumbFor(AMENITY_SCENES[item.id])}
            on={item.id === active}
            onPoint={() => onPoint(item.id)}
            onOpen={() => onOpen(item.id)}
          />
        </li>
      ))}
    </ul>
  );
}
