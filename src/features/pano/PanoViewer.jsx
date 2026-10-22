import { useRef, useState } from 'react';
import { useGSAP } from '../../gsap/Gsapconfig';
import { useIdleTask } from '../../hooks/useEventListener';
import DAY_DATA from '../../data/Day_PanoData';
import NIGHT_DATA from '../../data/Night_PanoData';
import { lockArea, startParams, yawLocked } from './panoLimits';

// Marzipano is imported dynamically so its tile engine stays out of the initial bundle
// and mounts only on the first visit to this screen — the same rule EstateMap follows
// for MapLibre. Until it lands, the screen shows the ground's own teal, not a spinner.
//
// Each floor gets ONE RectilinearView, shared between its day and its night scene. That
// is what keeps the toggle from resetting where you were looking: day and night are two
// Sources pointed at the same View, so switching time of day only swaps the layer under
// an orientation that never moves.

const TILE_BASE = { day: '/panos/Daytiles', night: '/panos/Nighttiles' };
const APP_DATA = { day: DAY_DATA, night: NIGHT_DATA };

// `data` and `tiles` default to the 360° screen's own set; the Floor Plans screen passes
// its per-floor set (src/data/floorPanos.js) through the same viewer.
//
// `onViewChange({ yaw, pitch, fov, hfov, vfov })`, optional: called whenever the view
// turns or zooms, in Marzipano's own radians — what a map needs to draw the camera's cone,
// and what setup mode reads. Called straight from Marzipano's change event, so the caller
// should write to the DOM rather than set React state sixty times a second.
//
// `lock`, optional: `{ key, start, limits }` in degrees (see panoLimits.js) — the view
// from one room. The limits are applied live whenever they change; the camera is only
// moved to `start` when `key` changes, i.e. when a different room is chosen, never while
// a room's own limits are being edited.
//
// `onLink(targetSceneId)`, optional: makes a scene's own linkHotspots (the Marzipano
// Tool's walk-through arrows) into clickable markers. `linkLabel(targetSceneId)` names
// each one. Without `onLink` no markers are drawn — the floor ladder has none anyway.
export function PanoViewer({
  view,
  mode,
  data = APP_DATA,
  tiles = TILE_BASE,
  onViewChange,
  lock = null,
  onLink = null,
  linkLabel = null,
}) {
  const host = useRef(null);
  const ctx = useRef(null);
  const [ready, setReady] = useState(false);
  const report = useRef(onViewChange);
  // Scenes are built once and cached, so their markers read the latest handlers
  // through refs rather than whatever was current when the scene was first made.
  const link = useRef(onLink);
  const label = useRef(linkLabel);

  useGSAP(
    () => {
      report.current = onViewChange;
      link.current = onLink;
      label.current = linkLabel;
    },
    { dependencies: [onViewChange, onLink, linkLabel] },
  );

  useIdleTask(() => {
    let cancelled = false;

    (async () => {
      const mod = await import('marzipano');
      const Marzipano = mod.default ?? mod;
      if (cancelled || !host.current) return;

      const viewer = new Marzipano.Viewer(host.current, {
        controls: { mouseViewMode: 'drag' },
      });

      // Marzipano re-measures only when the window resizes. A pane that changes size on
      // its own — a compared view when the grid gains or loses a column — would otherwise
      // go on rendering at its old size, stretched.
      const sizer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => viewer.updateSize()) : null;
      sizer?.observe(host.current);

      ctx.current = {
        Marzipano,
        viewer,
        sizer,
        views: new Map(),
        scenes: new Map(),
        // Each view's own resolution/fov limiter, kept so a lock can be composed onto it,
        // and the room it was last aimed for.
        base: new Map(),
        aimed: new Map(),
      };
      setReady(true);
    })();

    return () => {
      cancelled = true;
      ctx.current?.sizer?.disconnect();
      ctx.current?.unfollow?.();
      ctx.current?.viewer?.destroy?.();
      ctx.current = null;
    };
  }, []);

  useGSAP(
    () => {
      const c = ctx.current;
      if (!ready || !c || !view) return;
      const { Marzipano, viewer, views, scenes, base, aimed } = c;

      const sceneId = view[mode];
      const key = `${mode}:${sceneId}`;
      let scene = scenes.get(key);

      if (!scene) {
        if (!sceneId) return;
        const sceneData = data[mode].scenes.find((s) => s.id === sceneId);
        if (!sceneData) return;

        let sceneView = views.get(view.id);
        if (!sceneView) {
          const limiter = Marzipano.RectilinearView.limit.traditional(
            sceneData.faceSize,
            (100 * Math.PI) / 180,
            (120 * Math.PI) / 180,
          );
          sceneView = new Marzipano.RectilinearView(
            startParams(lock?.start, sceneData.initialViewParameters),
            limiter,
          );
          views.set(view.id, sceneView);
          base.set(view.id, limiter);
          aimed.set(view.id, lock?.key ?? null);
        }

        const source = Marzipano.ImageUrlSource.fromString(
          `${tiles[mode]}/${sceneId}/{z}/{f}/{y}/{x}.jpg`,
          { cubeMapPreviewUrl: `${tiles[mode]}/${sceneId}/preview.jpg` },
        );
        const geometry = new Marzipano.CubeGeometry(sceneData.levels);

        scene = viewer.createScene({ source, geometry, view: sceneView, pinFirstLevel: true });
        scenes.set(key, scene);
        if (link.current) addLinks(scene, sceneData.linkHotspots, link, label);
      }

      scene.switchTo({ transitionDuration: 500 });

      // The room's lock, re-applied every time: a live edit lands here with the camera
      // left where it is (the limiter only pulls it back inside, if it must). A different
      // room turns the camera to that room's start first.
      // The new room's limits go on before the camera turns, so its start is not clamped
      // by the last room's.
      const sv = scene.view();
      const area = lockArea(lock?.limits);
      const b = base.get(view.id);
      if (b) sv.setLimiter(area ? Marzipano.util.compose(area, b) : b);
      const roomKey = lock?.key ?? null;
      if (aimed.get(view.id) !== roomKey) {
        aimed.set(view.id, roomKey);
        if (lock?.start) {
          sv.setParameters(
            startParams(lock.start, { yaw: sv.yaw(), pitch: sv.pitch(), fov: sv.fov() }),
          );
        }
      }

      // Follow this scene's view. One listener at a time: day and night share a view, so
      // a time-of-day switch keeps it; a floor change moves it to the new one.
      const v = scene.view();
      if (c.followed !== v) {
        c.unfollow?.();
        const emit = () => {
          const w = v.width?.() || 1;
          const h = v.height?.() || 1;
          const vfov = v.fov();
          const hfov = 2 * Math.atan(Math.tan(vfov / 2) * (w / h));
          report.current?.({ yaw: v.yaw(), pitch: v.pitch(), fov: vfov, hfov, vfov });
        };
        v.addEventListener('change', emit);
        c.unfollow = () => v.removeEventListener('change', emit);
        c.followed = v;
        emit();
      }
      // Settings.autorotateEnabled in the source data — a slow drift back to level
      // whenever the visitor lets go, never while they are holding the view. Not in a
      // room locked left–right: it would only grind against the edge.
      if (yawLocked(lock?.limits)) {
        viewer.stopMovement();
        viewer.setIdleMovement(Infinity, null);
      } else {
        viewer.setIdleMovement(2600, Marzipano.autorotate({ yawSpeed: 0.028, targetPitch: 0 }));
      }
    },
    { dependencies: [ready, view, mode, data, tiles, lock] },
  );

  return (
    <div
      ref={host}
      data-overflow-ok
      className="h-full w-full"
      aria-label={view ? `360° view of the ${view.label}` : '360° panoramic view'}
    />
  );
}

// One marker per walk-through arrow, built as plain DOM because Marzipano owns where it
// sits: it writes its own transform onto the element it is given, so that element is a
// zero-size anchor and the visible button is centred on it from inside.
function addLinks(scene, hotspots, link, label) {
  const container = scene.hotspotContainer();
  for (const h of hotspots ?? []) {
    const name = label.current?.(h.target) ?? h.target;

    const anchor = document.createElement('div');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Go to ${name}`);
    button.className =
      'group absolute left-0 top-0 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center gap-[0.45em]';

    // The glow: a steady gold halo on the ring, and behind it a soft pulse that keeps
    // ringing out so an arrow is found at a glance against a busy, bright render — the
    // one moving thing in the scene. Stilled for visitors who ask for reduced motion.
    const pulse = document.createElement('span');
    pulse.setAttribute('aria-hidden', 'true');
    pulse.className =
      'pointer-events-none absolute left-1/2 top-[1.3rem] h-[2.6rem] w-[2.6rem] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-w-gold/45 [animation-duration:1.8s] motion-reduce:hidden';

    const ring = document.createElement('span');
    ring.className =
      'relative grid h-[2.6rem] w-[2.6rem] place-items-center rounded-full border border-w-gold-lit bg-w-deep/70 text-w-gold-lit shadow-[0_0_18px_4px_rgb(var(--gold-rgb)/0.6),0_0_42px_10px_rgb(var(--gold-rgb)/0.25)] backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-w-gold group-hover:text-w-deep group-hover:shadow-[0_0_26px_8px_rgb(var(--gold-rgb)/0.8)]';
    ring.innerHTML =
      '<svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></svg>';

    const text = document.createElement('span');
    text.className =
      'whitespace-nowrap rounded-full bg-w-deep/85 px-[0.75em] py-[0.25em] text-[0.62rem] uppercase tracking-[0.18em] text-w-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100';
    text.textContent = name;

    button.append(pulse, ring, text);
    anchor.append(button);

    // Marzipano drags the view from any press inside it; a press on a marker must stay a
    // click, not start a drag.
    for (const type of ['mousedown', 'touchstart', 'pointerdown', 'wheel']) {
      button.addEventListener(type, (e) => e.stopPropagation(), { passive: type !== 'mousedown' });
    }
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      link.current?.(h.target);
    });

    container.createHotspot(anchor, { yaw: h.yaw, pitch: h.pitch });
  }
}
