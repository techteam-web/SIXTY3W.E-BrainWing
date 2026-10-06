import { useEffect, useRef, useState } from 'react';
import { BUILDING, PLANS } from '../../data/floors';
import { BuildingSVG } from './BuildingSVG';
import { FloorTooltip, FloorCard } from './FloorTooltip';
import { FloorPlanViewer } from '../floorplan/FloorPlanViewer';
import { FloorPanoViewer } from '../pano/FloorPanoViewer';
import { gsap, useGSAP, E, prefersReducedMotion, durationScale } from '../../gsap/Gsapconfig';
import { useEventListener } from '../../hooks/useEventListener';
import { useApp } from '../../app/appContext';

// The building is the floor selector.
//
// Point at the tower and the slab under the cursor lights; click it and the rest of the
// building steps back into shade, the tower leans in on that floor, and the plan opens
// out of the slab's own line — a horizontal cut widening to the full screen, the way a
// section is drawn from an elevation. Back runs the same film in reverse and closes the
// plan onto the floor it came from.
//
// A floor opens two ways — its plan, or the 360° view from its height — so a click only
// chooses: the floor stays lit, and its card offers what that floor has. The view opens
// with the same film as the plan. On a phone the card docks at the foot of the screen,
// since a slab there is about sixteen pixels tall.

const LEGEND = Object.values(PLANS).map((p) => ({
  id: p.id,
  kind: p.kind === 'amenity' ? 'Amenity' : 'Typical',
  floors: p.floorsLabel,
}));

const BLOCKED_WHILE_OPEN = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']);

export function BuildingExplorer() {
  const root = useRef(null);
  const stage = useRef(null);
  const scrim = useRef(null);
  const viewer = useRef(null);
  const origin = useRef(null);
  const busy = useRef(false);
  const pointer = useRef('mouse');

  const [hover, setHover] = useState(null);
  const [shown, setShown] = useState(null);
  const [hostWidth, setHostWidth] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [open, setOpen] = useState(null);
  // What the open floor is showing: 'plan' or 'pano'.
  const [openKind, setOpenKind] = useState(null);
  const { setImmersive } = useApp();
  // The pano viewer owns its own corner (BACK plus the floor-info card) — the rail's
  // MENU/HOME would only compete with it there. Restored the moment it's not showing,
  // including on unmount, so leaving the explorer never strands the rail hidden.
  useEffect(() => {
    setImmersive(openKind === 'pano');
    return () => setImmersive(false);
  }, [openKind, setImmersive]);
  // Counts openings from the building. The cinematic runs on this, not on the floor, so
  // changing floor from inside the plan does not replay it.
  const [session, setSession] = useState(0);
  const swapping = useRef(false);
  // The room a 360° view was opened from, when it was — { planId, areaId, label }. Its
  // view is locked to that room's outlook (src/data/roomViews.js).
  const [room, setRoom] = useState(null);

  const floorEl = (floor) => root.current?.querySelector(`[data-floor="${floor.id}"]`);

  // The slab's rectangle on screen, in the explorer's own coordinates — where the card
  // hangs. Measured when the floor is pointed at, never during render.
  const show = (floor, pinned = false) => {
    const el = floorEl(floor);
    const host = root.current?.getBoundingClientRect();
    if (!el || !host) return;
    const r = el.getBoundingClientRect();
    const h = {
      floor,
      pinned,
      rect: {
        left: r.left - host.left,
        right: r.right - host.left,
        cy: r.top - host.top + r.height / 2,
      },
    };
    setHostWidth(host.width);
    setHover(h);
    setShown(h);
  };

  const hide = (floor) =>
    setHover((h) => (h && h.floor.id === floor.id && !h.pinned ? null : h));

  /* ------------------------------------------------------------ open & close */

  // Where a floor sits: its slab's centre in the SVG's own units — the point the tower
  // leans in on — and its height on screen as a percentage — the line the plan opens
  // from and closes back onto. Measured with the tower at rest.
  const measureOrigin = (floor) => {
    const el = floorEl(floor);
    const host = root.current?.getBoundingClientRect();
    if (!el || !host) return null;
    const bb = el.getBBox();
    const r = el.getBoundingClientRect();
    return {
      svg: `${bb.x + bb.width / 2} ${bb.y + bb.height / 2}`,
      y: Math.min(100, Math.max(0, ((r.top + r.height / 2 - host.top) / host.height) * 100)),
    };
  };

  const openFloor = (floor, kind = 'plan') => {
    if (busy.current || open || !floor[kind]) return;
    const o = measureOrigin(floor);
    if (!o) return;
    origin.current = o;
    busy.current = true;
    setSelectedId(floor.id);
    setHover(null);
    setOpen(floor);
    setOpenKind(kind);
    setSession((s) => s + 1);
  };

  const { contextSafe } = useGSAP(
    () => {
      if (!open || !viewer.current || !origin.current) return;
      const { svg, y } = origin.current;
      const q = gsap.utils.selector(viewer.current);
      const tl = gsap.timeline({
        defaults: { ease: E.out },
        onComplete: () => {
          busy.current = false;
        },
      });

      if (prefersReducedMotion()) {
        tl.set(scrim.current, { opacity: 0.6 }).fromTo(
          viewer.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.28 },
        );
        return;
      }

      const k = durationScale();
      tl.to(stage.current, { scale: 1.06, svgOrigin: svg, duration: 0.95 * k }, 0)
        .to(scrim.current, { opacity: 0.62, duration: 0.55 * k }, 0)
        .fromTo(
          viewer.current,
          { clipPath: `inset(${y}% 0% ${100 - y}% 0%)` },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75 * k },
          0.2 * k,
        )
        .fromTo(
          q('[data-plan-sheet]'),
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.7 * k },
          0.32 * k,
        )
        .fromTo(
          q('[data-plan-chrome]'),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5 * k, stagger: 0.06 },
          0.5 * k,
        );
    },
    { dependencies: [session], scope: root, revertOnUpdate: false },
  );

  // A floor chosen from the tower inside the plan. The same plan simply relabels — the
  // drawing, the zoom and any open detail stay put. A different plan swaps the sheet:
  // out, the viewer remounts on the new plan, in. Either way the building underneath
  // re-aims on the new floor, so Back closes onto the floor you ended on.
  // Re-aim the tower underneath on another floor, so Back closes onto it.
  const reaim = contextSafe((floor) => {
    gsap.set(stage.current, { scale: 1 });
    const o = measureOrigin(floor);
    if (o) {
      origin.current = o;
      gsap.set(stage.current, { scale: 1.06, svgOrigin: o.svg });
    } else {
      gsap.set(stage.current, { scale: 1.06 });
    }
    setSelectedId(floor.id);
  });

  // Stepping floors inside the 360° view. The terrace has no slab on the elevation; the
  // tower stays aimed on the last floor that does.
  const onPanoStep = (pano) => {
    const floor = BUILDING.floors.find((f) => f.level != null && f.level === pano.level);
    if (floor) reaim(floor);
  };

  const switchFloor = contextSafe((floor) => {
    if (busy.current || !open || openKind !== 'plan' || !floor.plan || floor.id === open.id) return;

    reaim(floor);

    if (floor.plan === open.plan || !viewer.current) {
      setOpen(floor);
      return;
    }

    busy.current = true;
    const q = gsap.utils.selector(viewer.current);
    gsap.to(q('[data-plan-sheet]'), {
      autoAlpha: 0,
      scale: 0.98,
      duration: 0.3 * durationScale(),
      ease: E.in,
      onComplete: () => {
        swapping.current = true;
        setOpen(floor);
      },
    });
  });

  // From a room on the plan to the view from that room, and back: the same floor, so no
  // trip through the building — what is on screen fades, the other viewer mounts, and
  // the swap-in below brings it up.
  const swapView = contextSafe((apply) => {
    if (busy.current) return;
    if (!viewer.current) {
      apply();
      return;
    }
    busy.current = true;
    const q = gsap.utils.selector(viewer.current);
    gsap.to([...q('[data-plan-sheet]'), ...q('[data-plan-chrome]')], {
      autoAlpha: 0,
      duration: 0.3 * durationScale(),
      ease: E.in,
      onComplete: () => {
        swapping.current = true;
        apply();
      },
    });
  });

  const openRoomView = (area) => {
    if (!open?.pano || !open.plan) return;
    swapView(() => {
      setRoom({ planId: open.plan.id, areaId: area.id, label: area.label });
      setOpenKind('pano');
    });
  };

  const backToPlan = () =>
    swapView(() => {
      setRoom(null);
      setOpenKind('plan');
    });

  useGSAP(
    () => {
      if (!swapping.current || !viewer.current) return;
      swapping.current = false;
      const q = gsap.utils.selector(viewer.current);
      gsap.fromTo(
        q('[data-plan-sheet]'),
        { autoAlpha: 0, scale: 0.98 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.5 * durationScale(),
          ease: E.out,
          onComplete: () => {
            busy.current = false;
          },
        },
      );
    },
    {
      dependencies: [`${openKind ?? ''}:${open?.plan?.id ?? ''}`],
      scope: root,
      revertOnUpdate: false,
    },
  );

  const closeFloor = contextSafe(() => {
    if (busy.current || !open || !viewer.current || !origin.current) return;
    busy.current = true;
    const { y } = origin.current;
    const q = gsap.utils.selector(viewer.current);
    const done = () => {
      busy.current = false;
      setOpen(null);
      setOpenKind(null);
      setRoom(null);
      setSelectedId(null);
    };

    if (prefersReducedMotion()) {
      gsap
        .timeline({ onComplete: done })
        .to(viewer.current, { autoAlpha: 0, duration: 0.25 })
        .set(scrim.current, { opacity: 0 });
      return;
    }

    const k = durationScale();
    gsap
      .timeline({ defaults: { ease: E.in }, onComplete: done })
      .to(q('[data-plan-chrome]'), { autoAlpha: 0, y: 8, duration: 0.28 * k }, 0)
      .to(q('[data-plan-sheet]'), { autoAlpha: 0, scale: 0.97, duration: 0.42 * k }, 0.04 * k)
      .to(viewer.current, { clipPath: `inset(${y}% 0% ${100 - y}% 0%)`, duration: 0.55 * k }, 0.1 * k)
      .to(stage.current, { scale: 1, duration: 0.6 * k, ease: E.out }, 0.35 * k)
      .to(scrim.current, { opacity: 0, duration: 0.55 * k, ease: E.out }, 0.4 * k);
  });

  // A light runs up the floors that open something and goes out again — the only
  // instruction the building gives, given without a word. It keeps running, pass after
  // pass, until a floor is chosen; it stops the moment one is, and picks up again once
  // the choice is let go or the visitor comes back from a plan or a view.
  const sweep = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cues = gsap.utils.toArray('[data-cue]', stage.current).reverse();
      sweep.current = gsap
        .timeline({ delay: 1.3, repeat: -1, repeatDelay: 1.4 })
        .fromTo(
          cues,
          { fillOpacity: 0, strokeOpacity: 0 },
          {
            keyframes: { fillOpacity: [0, 0.24, 0], strokeOpacity: [0, 0.75, 0] },
            duration: 0.9,
            ease: E.soft,
            stagger: 0.045,
          },
        );
    },
    { scope: root },
  );

  const chosen = !!open || !!hover?.pinned;

  useGSAP(
    () => {
      const tl = sweep.current;
      if (!tl) return;
      if (chosen) {
        // Stop clean: back to the start, every cue dark, so nothing is left half-lit
        // beside the chosen floor.
        tl.pause(0);
      } else if (tl.paused()) {
        tl.restart(true);
      }
    },
    { dependencies: [chosen], revertOnUpdate: false },
  );

  /* ------------------------------------------------------------------ input */

  // While a floor is chosen, pointing at others does not take its card away — the
  // pointer has to be able to travel to the card's buttons across the tower.
  const onEnter = (floor, e) => {
    pointer.current = e.pointerType;
    if (e.pointerType === 'touch' || hover?.pinned) return;
    show(floor);
  };

  const onLeave = (floor, e) => {
    if (e.pointerType === 'touch') return;
    hide(floor);
  };

  // A click chooses the floor and offers what it opens. Choosing it again, when it has
  // only one thing to offer, opens that.
  const onPress = (floor) => {
    const again = hover?.pinned && hover.floor.id === floor.id;
    const only = floor.plan && !floor.pano ? 'plan' : floor.pano && !floor.plan ? 'pano' : null;
    if (again && only) {
      openFloor(floor, only);
      return;
    }
    show(floor, true);
  };

  const onKey = (floor, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      show(floor, true);
      // Straight on to the card's first choice, so the keyboard reaches it.
      requestAnimationFrame(() =>
        root.current?.querySelector('[data-floor-choice="first"]')?.focus(),
      );
      return;
    }
    // Up and down walk the tower while a floor has focus, and stop there: the app's own
    // up/down (next and previous section) would otherwise fire on the same press.
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const i = BUILDING.floors.findIndex((f) => f.id === floor.id);
      const next = BUILDING.floors[i + (e.key === 'ArrowUp' ? -1 : 1)];
      if (next) floorEl(next)?.focus();
    }
  };

  // While a plan is open it is the screen: Escape goes back to the building rather than
  // out to the menu, and up/down do not leave the section from under it. The viewer's
  // own listener runs first and claims Escape while a detail panel is open.
  useEventListener(
    'keydown',
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      // A chosen floor lets go on Escape before Escape means "back to the menu".
      if (!open && hover?.pinned && e.key === 'Escape') {
        e.preventDefault();
        setHover(null);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        // A room's view steps back to its plan; anything else back to the building.
        if (room) backToPlan();
        else closeFloor();
      } else if (BLOCKED_WHILE_OPEN.has(e.key)) {
        e.preventDefault();
      }
    },
    document,
  );

  // The card's anchor is a measured rectangle; after a resize it points at nothing.
  useEventListener('resize', () => {
    setHover(null);
    setShown(null);
  });

  return (
    <div ref={root} className="absolute inset-0">
      <div
        inert={!!open}
        className="absolute inset-0"
        onClick={(e) => {
          // A tap anywhere off the tower lets go of a chosen floor.
          if (hover?.pinned && !e.target.closest('[data-floor], button')) setHover(null);
        }}
      >
        <BuildingSVG
          building={BUILDING}
          hoverId={hover?.floor.id ?? null}
          selectedId={selectedId}
          stageRef={stage}
          scrimRef={scrim}
          onEnter={onEnter}
          onLeave={onLeave}
          onFocus={(f) => show(f)}
          onBlur={hide}
          onPress={onPress}
          onKey={onKey}
        />

        {/* A shade behind the words, mixed from the scrim teal rather than black, so the
            dusk in the render keeps its colour. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--scrim-rgb)/0.6)_0%,rgb(var(--scrim-rgb)/0.25)_26%,transparent_44%)] max-md:bg-[linear-gradient(180deg,rgb(var(--scrim-rgb)/0.5)_0%,transparent_16%,transparent_78%,rgb(var(--scrim-rgb)/0.55)_100%)]"
        />

        <div className="pointer-events-none absolute z-10 left-(--screen-margin) top-[calc(var(--screen-margin)+var(--chrome-top))] flex max-w-[min(25rem,30vw)] flex-col gap-[clamp(0.6rem,1.6vh,1.1rem)] max-md:max-w-[70vw]">
          <span data-stagger className="eyebrow">
            Floor Plans
          </span>
          <h1
            data-headline
            className="text-headline font-extralight leading-[1.1] tracking-[0.05em] text-w-cream max-md:hidden"
          >
            <span className="block">Choose</span>
            <span className="block">a floor</span>
          </h1>
          <p data-stagger className="text-caption leading-[1.55] text-w-cream/65 max-md:hidden">
            Point at the tower to find a floor, then click it to open its plan or the view
            from its height.
          </p>
          <ul data-stagger className="mt-[0.4em] flex flex-col max-md:hidden">
            {LEGEND.map((l) => (
              <li
                key={l.id}
                className="grid grid-cols-[5.2em_1fr] items-baseline gap-[0.8em] border-t border-w-line/60 py-[clamp(0.35rem,0.9vh,0.6rem)] last:border-b"
              >
                <span className="text-micro uppercase tracking-[0.2em] text-w-gold">{l.kind}</span>
                <span className="text-micro tracking-[0.08em] text-w-cream/70">{l.floors}</span>
              </li>
            ))}
          </ul>
        </div>

        <FloorTooltip hover={hover} shown={shown} hostWidth={hostWidth} onOpen={openFloor} />
        <FloorCard hover={hover} onOpen={openFloor} />
      </div>

      {open && openKind === 'plan' ? (
        <FloorPlanViewer
          key={open.plan.id}
          floor={open}
          building={BUILDING}
          onBack={closeFloor}
          onSwitch={switchFloor}
          onRoomView={openRoomView}
          rootRef={viewer}
        />
      ) : null}

      {open && openKind === 'pano' ? (
        <FloorPanoViewer
          floor={open}
          room={room}
          onBack={room ? backToPlan : closeFloor}
          onStep={onPanoStep}
          rootRef={viewer}
        />
      ) : null}
    </div>
  );
}
