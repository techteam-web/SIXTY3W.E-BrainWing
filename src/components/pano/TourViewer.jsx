import { useCallback, useMemo, useState } from 'react';
import { PanoViewer } from '../../features/pano/PanoViewer';
import { ArrowIcon } from '../Icons';
import { Portal } from '../Primitives';
import { useEventListener } from '../../hooks/useEventListener';

// A walkable 360° tour (src/data/tours.js): one scene full screen, with the Marzipano
// Tool's own arrows to step to the next. Back is the only control, as on the other 360°
// views; the name of where you're standing sits under it, because after a few steps
// through a lobby or a passage that is the one thing a visitor can lose track of.

// Keys the app's own navigation would otherwise act on — up/down change section,
// Escape goes to the menu — none of which should happen from inside the tour.
const BLOCKED = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']);

export function TourViewer({ tour, start, onBack, rootRef, backLabel = 'Back' }) {
  const [sceneId, setSceneId] = useState(start);
  const label = tour.label(sceneId);

  // The shape PanoViewer takes: one scene id under "day", none under "night".
  const view = useMemo(() => ({ id: sceneId, day: sceneId, night: null, label }), [sceneId, label]);

  const onLink = useCallback((target) => setSceneId(target), []);

  // On the document, so it runs before KeyboardNav on the window and can claim the key.
  useEventListener(
    'keydown',
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      } else if (BLOCKED.has(e.key)) {
        e.preventDefault();
      }
    },
    document,
  );

  return (
    <div ref={rootRef} data-overflow-ok className="absolute inset-0 z-20 overflow-hidden bg-w-deep">
      <div className="absolute inset-0">
        <PanoViewer
          view={view}
          mode="day"
          data={tour.data}
          tiles={tour.tiles}
          onLink={onLink}
          linkLabel={tour.label}
        />
      </div>

      {/* A shade under the controls, from the scrim teal, so the sky keeps its colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgb(var(--scrim-rgb)/0.55)_0%,rgb(var(--scrim-rgb)/0.2)_24%,transparent_40%)]"
      />

      <div className="pointer-events-none absolute z-10 left-(--screen-margin) top-(--screen-margin) flex flex-col items-start gap-[clamp(0.8rem,2vh,1.2rem)]">
        <Portal
          size="sm"
          iconFirst
          onClick={onBack}
          aria-label={backLabel}
          icon={<ArrowIcon size="1em" className="rotate-180" />}
          className="pointer-events-auto"
        >
          Back
        </Portal>

        <div aria-live="polite" className="flex flex-col gap-[0.3em] [text-shadow:0_1px_14px_rgb(0_0_0/0.55)]">
          <span className="eyebrow">360° Tour</span>
          <span className="text-title font-extralight uppercase tracking-[0.08em] text-w-cream">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
