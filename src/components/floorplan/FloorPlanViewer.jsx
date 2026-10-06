import { useMemo, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { FloorPlanSVG } from './FloorPlanSVG';
import { PanZoomControls } from './PanZoomControls';
import { AreaDetails } from './AreaDetails';
import { MiniBuilding } from '../building/MiniBuilding';
import { ArrowIcon } from '../Icons';
import { Portal } from '../Primitives';
import { planAreas } from '../../data/floors';
import { gsap, useGSAP, E, prefersReducedMotion } from '../../gsap/Gsapconfig';
import { useEventListener } from '../../hooks/useEventListener';

// One floor's plan, full screen.
//
// The plan stands on an ivory sheet cut to the arch crown — the renders have transparent
// grounds, and line art wants paper under it — on the screen's own quiet teal. The sheet
// is laid out at rest to fit the space the chrome leaves, and pan and zoom move the whole
// stage from there, so "reset" is the identity transform and always lands back exactly
// on the laid-out plan.
//
// The viewer does not animate its own arrival or exit: those belong to the building,
// which knows where the floor was (see BuildingExplorer). It marks what moves —
// [data-plan-sheet] and [data-plan-chrome] — and leaves the timing to it.

const ANIM = 'easeOutCubic';
// Past this many pixels between press and release a gesture was a pan, not a choice.
const DRAG = 6;

const summary = (a) =>
  a.kind === 'unit'
    ? `${a.type} · ${a.carpet} sq.ft.`
    : a.sqft != null
      ? `${a.sqft.toFixed(2)} sq.ft.`
      : 'View details';

function PlanTitle({ floor, plan, centred = false }) {
  return (
    <div
      className={`flex max-w-[min(34rem,70vw)] flex-col gap-[0.4em] ${
        centred ? 'items-center text-center' : ''
      }`}
    >
      <span className="eyebrow">{floor.label}</span>
      <h2 className="text-title font-extralight leading-[1.12] tracking-[0.06em] text-w-cream">
        {plan.title}
      </h2>
      <span className="text-micro uppercase tracking-[0.16em] text-w-cream/55">
        {plan.subtitle ?? plan.floorsLabel}
      </span>
    </div>
  );
}

export function FloorPlanViewer({ floor, building, onBack, onSwitch, onRoomView, rootRef }) {
  const plan = floor.plan;
  const areas = useMemo(() => planAreas(plan), [plan]);
  const [, , fw, fh] = plan.frame;

  const [hoverId, setHoverId] = useState(null);
  const [tipArea, setTipArea] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const zoom = useRef(null);
  const tip = useRef(null);
  const press = useRef(null);

  const active = areas.find((a) => a.id === activeId) ?? null;

  // The cursor's label follows the cursor. Written straight to the transform — it is
  // position, not animation, and a React render per mousemove would be the whole plan.
  const place = (e) => {
    const host = rootRef.current;
    const el = tip.current;
    if (!host || !el) return;
    const r = host.getBoundingClientRect();
    let x = e.clientX - r.left + 18;
    let y = e.clientY - r.top + 20;
    if (x + el.offsetWidth > r.width - 8) x = e.clientX - r.left - el.offsetWidth - 14;
    if (y + el.offsetHeight > r.height - 8) y = e.clientY - r.top - el.offsetHeight - 14;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const wasDrag = (e) => {
    const p = press.current;
    return !!p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > DRAG;
  };

  const handlers = {
    enter: (a, e) => {
      if (e.pointerType === 'touch') return;
      setHoverId(a.id);
      setTipArea(a);
      place(e);
    },
    move: (a, e) => {
      if (e.pointerType === 'touch') return;
      place(e);
    },
    leave: (a, e) => {
      if (e.pointerType === 'touch') return;
      setHoverId((id) => (id === a.id ? null : id));
    },
    press: (a, e) => {
      if (wasDrag(e)) return;
      setActiveId((id) => (id === a.id ? null : a.id));
    },
    key: (a, e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveId(a.id);
      }
    },
  };

  // A short sweep across the selectable shapes once the plan has landed, so the first
  // thing a visitor learns is that the rooms answer — then they go back to plain paper.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '[data-cue]',
        { fillOpacity: 0, strokeOpacity: 0 },
        {
          keyframes: { fillOpacity: [0, 0.22, 0], strokeOpacity: [0, 0.85, 0] },
          duration: 1.1,
          ease: E.soft,
          stagger: 0.09,
          delay: 1,
        },
      );
    },
    { scope: rootRef },
  );

  // Keys the plan owns. Registered on the document so they run before the app's global
  // navigation on the window, and marked handled so it leaves them alone.
  useEventListener(
    'keydown',
    (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const z = zoom.current;
      if (e.key === 'Escape' && activeId) {
        setActiveId(null);
      } else if ((e.key === '+' || e.key === '=') && z) {
        z.zoomIn(0.6, 320, ANIM);
      } else if ((e.key === '-' || e.key === '_') && z) {
        z.zoomOut(0.6, 320, ANIM);
      } else if (e.key === '0' && z) {
        z.resetTransform(480, ANIM);
      } else {
        return;
      }
      e.preventDefault();
    },
    document,
  );

  return (
    <div
      ref={rootRef}
      data-overflow-ok
      className="bw-viewer ground-quiet absolute inset-0 z-20 overflow-hidden bg-w-deep"
      onPointerDownCapture={(e) => {
        press.current = { x: e.clientX, y: e.clientY };
      }}
    >
      <div aria-hidden="true" className="lattice pointer-events-none absolute inset-0" />

      {/* THE PLAN PANEL. Full screen below lg; above it, the framed panel on the right
          (see .bw-plan-panel). Pan and zoom live inside it, so a zoomed plan is clipped
          to its own frame and never runs under the tower. */}
      <section className="bw-panel bw-plan-panel absolute overflow-hidden">
        <TransformWrapper
          ref={zoom}
          minScale={1}
          maxScale={5}
          limitToBounds
          centerZoomedOut
          doubleClick={{ disabled: true }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            {/* The stage: the whole panel, padded clear of the title and the controls, and a
                size container so the sheet can fit itself to it — the smaller of the width
                and the height times its own aspect — in CSS alone. */}
            <div
              className="grid h-full w-full place-items-center pb-[calc(var(--screen-margin)+var(--chrome-bottom))] pt-[calc(var(--screen-margin)+var(--chrome-top)+clamp(7rem,15vh,9rem))] px-(--screen-margin) lg:px-[clamp(4.5rem,6vw,7rem)] lg:pb-[clamp(1.2rem,2.5vh,2rem)] lg:pt-[clamp(5.5rem,12vh,8rem)]"
              style={{ containerType: 'size' }}
              onClick={(e) => {
                if (e.target.closest('[data-area]') || wasDrag(e)) return;
                setActiveId(null);
              }}
            >
              <div
                data-plan-sheet
                className="crown relative bg-w-ivory shadow-[0_28px_70px_-30px_rgb(4_26_25/0.75)]"
                style={{
                  aspectRatio: `${fw} / ${fh}`,
                  width: `min(calc(100cqw * var(--sheet-k)), calc(100cqh * ${fw / fh} * var(--sheet-k)))`,
                }}
              >
                <FloorPlanSVG
                  plan={plan}
                  areas={areas}
                  hoverId={hoverId}
                  activeId={activeId}
                  handlers={handlers}
                />
              </div>
            </div>
          </TransformComponent>

          <PanZoomControls
            className={`lg:bottom-[clamp(1rem,1.6vw,1.6rem)] lg:right-[clamp(1rem,1.6vw,1.6rem)] ${
              active ? 'max-md:hidden' : ''
            }`}
          />
        </TransformWrapper>

        {/* The title, centred in the panel's crown. */}
        <div className="pointer-events-none absolute left-1/2 top-[clamp(1.4rem,3vh,2.4rem)] z-10 -translate-x-1/2 max-lg:hidden">
          <div data-plan-chrome>
            <PlanTitle floor={floor} plan={plan} centred />
          </div>
        </div>
      </section>

      {/* THE TOWER PANEL, on a wide screen: change floor without leaving the plan. */}
      <aside data-plan-chrome className="bw-panel bw-tower-panel absolute z-10 max-lg:hidden">
        <MiniBuilding building={building} currentId={floor.id} onSelect={onSwitch} />
      </aside>

      {/* Back, and — below lg — what this is. */}
      <div className="pointer-events-none absolute z-20 left-(--screen-margin) top-[calc(var(--screen-margin)+var(--chrome-top))] flex flex-col items-start gap-[clamp(0.8rem,2.2vh,1.5rem)]">
        {/* The rail's own control — MENU and HOME's twin, gold fill on hover and all. */}
        <Portal
          data-plan-chrome
          size="sm"
          iconFirst
          onClick={onBack}
          aria-label="Back to the building"
          icon={<ArrowIcon size="1em" className="rotate-180" />}
          className="pointer-events-auto"
        >
          Back
        </Portal>

        <div data-plan-chrome className="lg:hidden">
          <PlanTitle floor={floor} plan={plan} />
        </div>
      </div>

      {/* The cursor's label. Never on touch — a tap opens the details directly. */}
      <div
        ref={tip}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-30 transition-opacity duration-200 ${
          hoverId && hoverId !== activeId ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {tipArea ? (
          <div
            className="flex flex-col gap-[0.3em] whitespace-nowrap px-[0.95em] py-[0.6em]"
            style={{
              // Solid, not .glass's translucent fill: this label sits on the plan's
              // bright ivory sheet, and any amount of see-through (plus .glass's own
              // backdrop-filter blur/saturate) let that brightness in and washed the
              // card out. A flat, fully opaque fill of the app's own deep ground — the
              // colour MENU and HOME sit on — reads as dark and on-theme at a glance.
              background: 'var(--color-w-deep)',
              border: '1px solid rgb(var(--gold-rgb) / 0.55)',
              boxShadow: '0 18px 40px -20px rgb(2 12 11 / 0.9)',
            }}
          >
            <span className="text-caption uppercase tracking-[0.14em] text-w-cream">
              {tipArea.label}
            </span>
            <span className="text-micro tracking-[0.12em] text-w-gold">{summary(tipArea)}</span>
            {/* The gold wash and the pointer cursor say "this answers" to a mouse that's
                already moving — but nothing told a visitor THAT before they tried it. A
                one-line call to action, same voice as AreaDetails' own "360° View from
                here", removes the guess. */}
            <span className="mt-[0.1em] flex items-center gap-[0.35em] border-t border-w-gold/25 pt-[0.35em] text-micro uppercase tracking-[0.18em] text-w-gold/80">
              View details
              <ArrowIcon size="0.95em" />
            </span>
          </div>
        ) : null}
      </div>

      <AreaDetails
        area={active}
        plan={plan}
        floor={floor}
        onClose={() => setActiveId(null)}
        onRoomView={floor.pano && onRoomView ? onRoomView : undefined}
      />
    </div>
  );
}
