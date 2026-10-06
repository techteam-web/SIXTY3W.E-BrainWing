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
export function PanoViewer({
  view,
  mode,
  data = APP_DATA,
  tiles = TILE_BASE,
  onViewChange,
  lock = null,
}) {
  const host = useRef(null);
  const ctx = useRef(null);
  const [ready, setReady] = useState(false);
  const report = useRef(onViewChange);

  useGSAP(
    () => {
      report.current = onViewChange;
    },
    { dependencies: [onViewChange] },
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

      ctx.current = {
        Marzipano,
        viewer,
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
