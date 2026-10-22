import { useEffect, useRef, useState } from 'react';
import { Screen } from '../../layout/Screen';
import { SectionHead } from './SectionHead';
import { Portal } from '../../components/Primitives';
import { TourViewer } from '../../components/pano/TourViewer';
import { TourCard } from '../../components/pano/TourCard';
import { APARTMENT } from '../../data/content';
import { APARTMENT_ROOMS, APARTMENT_START, APARTMENT_TOUR } from '../../data/apartmentTour';
import { useApp } from '../../app/appContext';

// The sample 2 BHK, walked in 360°. The whole home from the start (the living room, then
// wherever its arrows lead), or straight into any one room from its card. The first room
// — where the walk begins — stands tall at the head of the gallery.

export function Apartment() {
  const [active, setActive] = useState(APARTMENT_ROOMS[0].id);
  const [tour, setTour] = useState(null);
  const tourRoot = useRef(null);
  const { setImmersive } = useApp();

  // The tour owns its corner (Back alone), the way the other 360° views do.
  useEffect(() => {
    setImmersive(tour != null);
    return () => setImmersive(false);
  }, [tour, setImmersive]);

  return (
    <Screen id="apartment">
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,29%)_1fr] gap-[clamp(1.5rem,3%,3.4rem)] max-xl:grid-cols-[minmax(0,34%)_1fr] max-lg:grid-cols-1 max-lg:grid-rows-[auto_minmax(0,1fr)] max-lg:gap-[clamp(1rem,2.4vh,1.8rem)]">
        <div className="flex min-h-0 flex-col justify-center gap-[clamp(1rem,3vh,2.4rem)]">
          <SectionHead eyebrow={APARTMENT.eyebrow} headline={APARTMENT.headline} lede={APARTMENT.lede} />
          <div data-stagger>
            <Portal onClick={() => setTour(APARTMENT_START)} className="self-start">
              {APARTMENT.start}
            </Portal>
          </div>
        </div>

        <ul
          data-stagger
          data-ring-focus
          className="grid h-full min-h-0 grid-cols-3 grid-rows-2 gap-[clamp(0.6rem,1.1vw,1.2rem)] max-md:grid-cols-2 max-md:grid-rows-3 lg:pt-(--corner-clear)"
        >
          {APARTMENT_ROOMS.map((room, i) => (
            <li
              key={room.id}
              className={`min-h-0 min-w-0 ${i === 0 ? 'row-span-2 max-md:col-span-2 max-md:row-span-1' : ''}`}
            >
              <TourCard
                title={room.title}
                image={APARTMENT_TOUR.thumb(room.scene)}
                on={room.id === active}
                onPoint={() => setActive(room.id)}
                onOpen={() => setTour(room.scene)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Overlaid, not swapped in for the whole screen: the gallery stays mounted behind,
          so coming Back needs nothing re-laid-out. */}
      {tour ? (
        <TourViewer
          tour={APARTMENT_TOUR}
          start={tour}
          onBack={() => setTour(null)}
          backLabel="Back to the apartment"
          rootRef={tourRoot}
        />
      ) : null}
    </Screen>
  );
}
