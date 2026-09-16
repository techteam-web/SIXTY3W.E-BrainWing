import { useRef, useState } from 'react';
import { useGSAP } from '../../gsap/Gsapconfig';
import { useIdleTask } from '../../hooks/useEventListener';
import DAY_DATA from '../../data/Day_PanoData';
import NIGHT_DATA from '../../data/Night_PanoData';

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

export function PanoViewer({ view, mode }) {
  const host = useRef(null);
  const ctx = useRef(null);
  const [ready, setReady] = useState(false);

  useIdleTask(() => {
    let cancelled = false;

    (async () => {
      const mod = await import('marzipano');
      const Marzipano = mod.default ?? mod;
      if (cancelled || !host.current) return;

      const viewer = new Marzipano.Viewer(host.current, {
        controls: { mouseViewMode: 'drag' },
      });

      ctx.current = { Marzipano, viewer, views: new Map(), scenes: new Map() };
      setReady(true);
    })();

    return () => {
      cancelled = true;
      ctx.current?.viewer?.destroy?.();
      ctx.current = null;
    };
  }, []);

  useGSAP(
    () => {
      const c = ctx.current;
      if (!ready || !c || !view) return;
      const { Marzipano, viewer, views, scenes } = c;

      const sceneId = view[mode];
      const key = `${mode}:${sceneId}`;
      let scene = scenes.get(key);

      if (!scene) {
        const sceneData = APP_DATA[mode].scenes.find((s) => s.id === sceneId);
        if (!sceneData) return;

        let sceneView = views.get(view.id);
        if (!sceneView) {
          const limiter = Marzipano.RectilinearView.limit.traditional(
            sceneData.faceSize,
            (100 * Math.PI) / 180,
            (120 * Math.PI) / 180,
          );
          sceneView = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter);
          views.set(view.id, sceneView);
        }

        const source = Marzipano.ImageUrlSource.fromString(
          `${TILE_BASE[mode]}/${sceneId}/{z}/{f}/{y}/{x}.jpg`,
          { cubeMapPreviewUrl: `${TILE_BASE[mode]}/${sceneId}/preview.jpg` },
        );
        const geometry = new Marzipano.CubeGeometry(sceneData.levels);

        scene = viewer.createScene({ source, geometry, view: sceneView, pinFirstLevel: true });
        scenes.set(key, scene);
      }

      scene.switchTo({ transitionDuration: 500 });
      // Settings.autorotateEnabled in the source data — a slow drift back to level
      // whenever the visitor lets go, never while they are holding the view.
      viewer.setIdleMovement(2600, Marzipano.autorotate({ yawSpeed: 0.028, targetPitch: 0 }));
    },
    { dependencies: [ready, view, mode] },
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
