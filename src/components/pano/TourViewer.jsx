import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanoViewer } from '../../features/pano/PanoViewer';
import { ArrowIcon, ChevronIcon } from '../Icons';
import { Portal } from '../Primitives';
import { TourMap } from './TourMap';
import { useEventListener } from '../../hooks/useEventListener';
import { gsap, useGSAP, E, prefersReducedMotion } from '../../gsap/Gsapconfig';

// A walkable 360° tour (src/data/tours.js): one scene full screen, with the Marzipano
// Tool's own arrows to step to the next. Back sits top-left, and the name of where
// you're standing sits under it, because after a few steps through a lobby or a passage
// that is the one thing a visitor can lose track of.
//
// Bottom-left is the jump menu. The arrows walk the level the way a resident would, but
// a broker standing with a buyer does not want to walk: they want the pool, now, then
// the games room. Going back out to the gallery to pick the next one costs two clicks
// and throws the tour away in between. The menu lists every place in the tour and goes
// straight there.

// Keys the app's own navigation would otherwise act on — up/down change section,
// Escape goes to the menu — none of which should happen from inside the tour.
const BLOCKED = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']);

export function TourViewer({ tour, start, onBack, rootRef, backLabel = 'Back' }) {
  const [sceneId, setSceneId] = useState(start);
  const [menuOpen, setMenuOpen] = useState(false);
  const label = tour.label(sceneId);

  // The shape PanoViewer takes: one scene id under "day", none under "night".
  const view = useMemo(() => ({ id: sceneId, day: sceneId, night: null, label }), [sceneId, label]);

  const onLink = useCallback((target) => setSceneId(target), []);

  const jump = useCallback((target) => {
    setSceneId(target);
    setMenuOpen(false);
  }, []);

  // On the document, so it runs before KeyboardNav on the window and can claim the key.
  // Escape closes the jump menu first and only then leaves the tour: one Escape, one
  // thing undone, in the order the visitor opened them.
  useEventListener(
    'keydown',
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (menuOpen) setMenuOpen(false);
        else onBack();
      } else if (BLOCKED.has(e.key)) {
        // The menu owns up/down while it is open — it moves through the list there.
        if (!menuOpen) e.preventDefault();
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

      <ScenePicker
        places={tour.places}
        here={tour.placeOf(sceneId)}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onPick={jump}
      />

      {/* Bottom-right, for a tour that has one: the same jump, by where it is. */}
      {tour.map ? <TourMap map={tour.map} here={tour.placeOf(sceneId)} onPick={jump} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------ scene picker */

// Bottom-left, opening upward: the place you are standing in, and the list of everywhere
// else. It is the app's own glass-and-arch panel rather than a browser <select>, because
// a native menu on a fullscreen presentation is a grey rectangle from another century.
function ScenePicker({ places, here, open, onOpenChange, onPick }) {
  const root = useRef(null);
  const list = useRef(null);

  // A click anywhere else closes it. Pointerdown rather than click, so it closes on the
  // way down and never swallows the first drag of the panorama behind it.
  useEventListener(
    'pointerdown',
    (e) => {
      if (!open || root.current?.contains(e.target)) return;
      onOpenChange(false);
    },
    document,
  );

  // Opening scrolls to where you are standing, so a long tour does not open on a list
  // that has nothing to do with the view behind it.
  useEffect(() => {
    if (!open) return;
    const el = list.current?.querySelector('[data-here="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [open]);

  useGSAP(
    () => {
      if (!open || !list.current || prefersReducedMotion()) return;
      gsap.fromTo(
        list.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.32, ease: E.out },
      );
    },
    { dependencies: [open], scope: root },
  );

  // Up and down walk the list; Enter and Space pick, which the buttons do themselves.
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = [...(list.current?.querySelectorAll('[data-place-option]') ?? [])];
    if (!items.length) return;
    e.preventDefault();
    e.stopPropagation();
    const at = items.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? at + 1 : at - 1;
    items[(next + items.length) % items.length]?.focus();
  };

  if (!places?.length) return null;

  return (
    <div
      ref={root}
      onKeyDown={onKeyDown}
      className="absolute z-10 bottom-(--screen-margin) left-(--screen-margin) flex flex-col items-start"
    >
      {open ? (
        <ul
          ref={list}
          role="listbox"
          aria-label="Go to"
          data-scroll-ok
          className="rail-none glass mb-[0.6em] w-[min(17rem,calc(100vw-var(--screen-margin)*2))] overflow-y-auto p-[0.45em]"
          style={{
            // Never taller than the room between the trigger below it and the Back
            // control above: on a landscape phone 46vh would open straight through them.
            // The floor keeps two rows visible on the shortest screen, scrolling for the
            // rest; the 11rem reserve is the trigger plus the top-left stack.
            maxHeight:
              'max(7.5rem, min(24rem, calc(100dvh - var(--screen-margin) * 2 - 11rem)))',
            border: '1px solid rgb(var(--gold-rgb) / 0.3)',
            boxShadow: '0 30px 70px -30px rgb(2 12 11 / 0.85)',
            borderTopLeftRadius: 'clamp(2rem, 5.4vw, 2.6rem)',
            borderTopRightRadius: 'clamp(2rem, 5.4vw, 2.6rem)',
          }}
        >
          {places.map((p) => {
            const on = p.label === here;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  data-place-option
                  role="option"
                  aria-selected={on}
                  data-here={String(on)}
                  onClick={() => onPick(p.id)}
                  className="group/p flex w-full items-center gap-[0.6em] px-[0.9em] py-[0.5em] text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`h-px shrink-0 bg-w-gold transition-all duration-300 ease-out ${
                      on ? 'w-[1.2em] opacity-100' : 'w-[0.4em] opacity-35 group-hover/p:w-[0.9em] group-hover/p:opacity-70'
                    }`}
                  />
                  <span
                    className={`min-w-0 truncate text-caption uppercase tracking-[0.12em] transition-colors duration-300 ${
                      on ? 'text-w-gold' : 'text-w-cream/70 group-hover/p:text-w-cream'
                    }`}
                  >
                    {p.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="glass group/t flex max-w-[min(17rem,calc(100vw-var(--screen-margin)*2))] items-center gap-[0.8em] px-[1.1em] py-[0.7em] max-md:gap-[0.6em] max-md:px-[0.9em] max-md:py-[0.55em]"
        style={{
          border: '1px solid rgb(var(--gold-rgb) / 0.3)',
          boxShadow: '0 20px 50px -24px rgb(2 12 11 / 0.8)',
          borderTopLeftRadius: 'clamp(1.4rem, 3.4vw, 1.8rem)',
          borderTopRightRadius: 'clamp(1.4rem, 3.4vw, 1.8rem)',
        }}
      >
        <span className="flex min-w-0 flex-col items-start gap-[0.15em]">
          <span className="text-micro uppercase tracking-[0.2em] text-w-gold/80">Go to</span>
          <span className="min-w-0 truncate text-caption uppercase tracking-[0.12em] text-w-cream">
            {here}
          </span>
        </span>
        <ChevronIcon
          size="1.1em"
          className={`shrink-0 text-w-gold transition-transform duration-300 ease-out ${
            open ? 'rotate-0' : 'rotate-180'
          }`}
        />
      </button>
    </div>
  );
}
