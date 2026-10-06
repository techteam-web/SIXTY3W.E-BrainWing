import { useCallback, useRef, useState } from 'react';
import { gsap, useGSAP, E, prefersReducedMotion, isPhone } from '../../gsap/Gsapconfig';
import { useIdleTask } from '../../hooks/useEventListener';
import { PROJECT, LANDMARKS, LANDMARK_BY_ID, ALWAYS_ON, HOME_VIEW } from '../../data/landmarks';
import { buildMapStyle } from './mapStyle';
import { fetchRoute } from './routing';

// MapLibre is imported dynamically so ~1 MB of map code and CSS stays out of the initial
// bundle, and it mounts only on the first visit to this section. Until it lands, the
// screen shows the map's own teal ground, not a spinner.
//
// Fully interactive: drag to pan, wheel to zoom, right-drag or two fingers to pitch and
// rotate. Pitch opens at 46° so it reads as a place rather than as a diagram.

const ROUTE_SRC = 'w63-route';
const EMPTY = { type: 'FeatureCollection', features: [] };
const lineFeature = (coordinates) => ({
  type: 'FeatureCollection',
  features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates } }],
});

// The distance rings from page 20 — faint concentric circles centred on the project, so
// "two minutes away" has something to be two minutes across. Generated rather than
// authored: a 96-gon at a true radius in kilometres, with the longitude degree scaled by
// the cosine of the latitude so the circle is round on the ground rather than only on the
// page.
const RING_KM = [1, 2, 3];

function distanceRings(lng, lat) {
  const features = [];
  for (const km of RING_KM) {
    const dLat = km / 110.574;
    const dLng = km / (111.32 * Math.cos((lat * Math.PI) / 180));
    const ring = [];
    for (let i = 0; i <= 96; i += 1) {
      const t = (i / 96) * Math.PI * 2;
      ring.push([lng + dLng * Math.cos(t), lat + dLat * Math.sin(t)]);
    }
    features.push({
      type: 'Feature',
      properties: { km },
      geometry: { type: 'LineString', coordinates: ring },
    });
    features.push({
      type: 'Feature',
      properties: { km, label: `${km} KM` },
      geometry: { type: 'Point', coordinates: [lng, lat + dLat] },
    });
  }
  return { type: 'FeatureCollection', features };
}

// The route draws itself once, from the tower to the destination, and then holds
// still. It used to be overlaid with dashes marching along it forever, which read as
// noise — a direction is shown once, not repeated. `upTo` is the leading part of the
// line, `t` of the way along it by ground distance, so the pen moves at an even speed
// however the vertices happen to be spaced.
function upTo(coords, t) {
  if (t >= 1 || coords.length < 2) return coords;
  const seg = [];
  let total = 0;
  for (let i = 1; i < coords.length; i += 1) {
    const d = Math.hypot(coords[i][0] - coords[i - 1][0], coords[i][1] - coords[i - 1][1]);
    seg.push(d);
    total += d;
  }
  let left = total * Math.max(0, t);
  const out = [coords[0]];
  for (let i = 1; i < coords.length; i += 1) {
    const d = seg[i - 1];
    if (left >= d) {
      out.push(coords[i]);
      left -= d;
      continue;
    }
    const k = d ? left / d : 0;
    const [a, b] = [coords[i - 1], coords[i]];
    out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    break;
  }
  return out.length > 1 ? out : [coords[0], coords[0]];
}

// The project marker: the logo's three arches, drawn at the exact geometry the mark uses
// everywhere else (see src/components/Lockup.jsx), standing on a lit ground pad. It is
// the one place on the map that is allowed to be the brightest thing on it.
const PROJECT_MARK =
  '<svg viewBox="948.7 125.9 79.8 48.4" class="w63-project__mark" aria-hidden="true">' +
  [0, 1, 2]
    .map((i) => {
      const x = 949.674 + i * 23.217;
      return (
        `<path d="M${x} 173.391 V136.861 C${x} 131.388 ${x + 4.436} 126.952 ${x + 9.909} 126.952 ` +
        `H${x + 21.49} C${x + 26.963} 126.952 ${x + 31.399} 131.388 ${x + 31.399} 136.861 V173.391" ` +
        'fill="none" stroke="currentColor" stroke-width="4.6"/>'
      );
    })
    .join('') +
  '</svg>';

export function EstateMap({ activeCategory, focusId, highlightId, onRoute }) {
  const host = useRef(null);
  const map = useRef(null);
  const markers = useRef(new Map());
  const draw = useRef({ t: 0 });
  const abort = useRef(null);
  const routeFade = useRef({ o: 0 });
  const hasFocused = useRef(false);
  const destMarker = useRef(null);
  const destTimeout = useRef(0);
  const [loaded, setLoaded] = useState(false);

  useIdleTask(() => {
    let cancelled = false;
    let observer = null;

    (async () => {
      let mod;
      try {
        [mod] = await Promise.all([
          import('maplibre-gl'),
          import('maplibre-gl/dist/maplibre-gl.css'),
        ]);
      } catch (err) {
        // The map's code is a lazy chunk fetched on the first visit to this screen. If the
        // server restarted (or the app was redeployed) since the page loaded, that chunk's
        // URL is stale and the import rejects — which used to leave the map blank for good.
        // Reload once, on this same screen, to pick up the current build.
        console.error('[map] failed to load MapLibre', err);
        try {
          if (!sessionStorage.getItem('w63.mapReload')) {
            sessionStorage.setItem('w63.mapReload', '1');
            window.location.reload();
          }
        } catch {
          /* storage blocked: stay on the teal ground rather than loop */
        }
        return;
      }
      try {
        sessionStorage.removeItem('w63.mapReload');
      } catch {
        /* ignore */
      }
      const maplibregl = mod.default ?? mod;
      if (cancelled || !host.current || map.current) return;

      const m = new maplibregl.Map({
        container: host.current,
        style: buildMapStyle(),
        ...HOME_VIEW,
        attributionControl: { compact: true },
        scrollZoom: true,
        doubleClickZoom: true,
        keyboard: false,
        // Fully interactive: drag to pan, wheel to zoom, right-drag or two fingers to
        // pitch and rotate. The camera opens pitched so the corridor reads as a place
        // rather than as a diagram.
        touchZoomRotate: true,
        minZoom: 10,
        maxZoom: 17,
        // A phone that also has to run the arch transition does not need a third
        // reprojection pass every frame.
        antialias: !isPhone(),
      });

      m.addControl(new maplibregl.NavigationControl(), 'bottom-right');
      m.on('error', (e) => console.error('[map]', e?.error?.message ?? e));

      // Publish and size the map NOW. MapLibre computes its tile cover from its own
      // transform, which stays 0×0 until resize() is called — if resize() were only
      // reachable from the 'load' handler, the map would never request a tile, so 'load'
      // would never fire. That deadlock reads as a black map with no error at all.
      map.current = { maplibregl, m };
      m.resize();

      const ro = new ResizeObserver(() => m.resize());
      ro.observe(host.current);
      observer = ro;

      m.on('load', () => {
        if (cancelled) return;

        m.addSource('w63-rings', { type: 'geojson', data: distanceRings(PROJECT.lng, PROJECT.lat) });
        m.addLayer({
          id: 'ring-line',
          type: 'line',
          source: 'w63-rings',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: {
            'line-color': '#c8a16b',
            'line-width': 1,
            'line-opacity': 0.3,
            'line-dasharray': [4, 4],
          },
        });
        m.addLayer({
          id: 'ring-label',
          type: 'symbol',
          source: 'w63-rings',
          filter: ['==', ['geometry-type'], 'Point'],
          minzoom: 11.6,
          layout: {
            'text-field': ['get', 'label'],
            'text-font': ['literal', ['Noto Sans Regular']],
            'text-size': 9.5,
            'text-letter-spacing': 0.18,
            'text-offset': [0, -0.5],
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#e7cf95',
            'text-opacity': 0.4,
            'text-halo-color': '#0c3b39',
            'text-halo-width': 1.6,
          },
        });

        m.addSource(ROUTE_SRC, { type: 'geojson', data: EMPTY });

        // The routed line, in three passes: a faint halo, a dark casing and the gold
        // path. Every one is born at opacity 0 and brought up by the same fade that
        // lowers it later.
        m.addLayer({
          id: 'dir-glow',
          type: 'line',
          source: ROUTE_SRC,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#E7CF95', 'line-width': 14, 'line-opacity': 0, 'line-blur': 10 },
        });
        m.addLayer({
          id: 'dir-case',
          type: 'line',
          source: ROUTE_SRC,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          // The casing is the deepest teal: its job is to cut the gold route cleanly out of the
          // gold arterials it runs along, so the line never merges into the road beneath it.
          paint: { 'line-color': '#041A19', 'line-width': 8.5, 'line-opacity': 0 },
        });
        m.addLayer({
          id: 'dir-base',
          type: 'line',
          source: ROUTE_SRC,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#E7CF95', 'line-width': 4, 'line-opacity': 0 },
        });

        const projectEl = document.createElement('div');
        projectEl.className = 'w63-project';
        projectEl.innerHTML =
          '<span class="w63-project__halo" data-halo></span>' +
          PROJECT_MARK +
          `<span class="w63-project__name">${PROJECT.name}</span>`;
        new maplibregl.Marker({ element: projectEl, anchor: 'center' })
          .setLngLat([PROJECT.lng, PROJECT.lat])
          .addTo(m);

        for (const l of LANDMARKS) {
          const el = document.createElement('div');
          el.className = 'w63-landmark';
          if (ALWAYS_ON.has(l.cat)) el.classList.add('w63-landmark--node');
          el.innerHTML =
            '<span class="w63-landmark__dot"></span>' +
            '<span class="w63-landmark__spark" style="--a: 25deg"></span>' +
            '<span class="w63-landmark__spark" style="--a: 155deg"></span>' +
            '<span class="w63-landmark__spark" style="--a: 265deg"></span>' +
            `<span class="w63-landmark__label">${l.name}</span>`;
          new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([l.lng, l.lat])
            .addTo(m);
          markers.current.set(l.id, el);
        }

        setLoaded(true);
      });
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      abort.current?.abort();
      gsap.killTweensOf(draw.current);
      clearTimeout(destTimeout.current);
      destMarker.current = null;
      gsap.killTweensOf(routeFade.current);
      map.current?.m?.remove?.();
      map.current = null;
    };
  });

  // The project marker breathes. It is the only thing on this screen that moves without
  // being asked, and it is what stops the map reading as a screenshot.
  useGSAP(
    () => {
      if (!loaded || prefersReducedMotion()) return;
      const halo = document.querySelector('.w63-project [data-halo]');
      if (!halo) return;
      gsap.set(halo, { scale: 1, opacity: 0.6, transformOrigin: 'center center' });
      gsap.to(halo, { scale: 2.2, opacity: 0, duration: 2.8, ease: E.out, repeat: -1 });
    },
    { dependencies: [loaded] },
  );

  // Only the chosen category is drawn, plus the orientation nodes. Thirty dots at once
  // is a map nobody can read — and their NAMES stay off until a dot or its row in the
  // panel is pointed at, because five connectivity landmarks inside one kilometre put
  // five labels on top of each other and that is worse than no labels at all. Pointing
  // at a row is the gesture that answers "which one is that".
  useGSAP(
    () => {
      for (const l of LANDMARKS) {
        const el = markers.current.get(l.id);
        if (!el) continue;
        const on = l.cat === activeCategory || ALWAYS_ON.has(l.cat);
        el.setAttribute('data-dim', String(!on));
      }
    },
    { dependencies: [activeCategory, loaded] },
  );

  useGSAP(
    () => {
      for (const [id, el] of markers.current) {
        el.setAttribute('data-active', String(id === highlightId));
      }
    },
    { dependencies: [highlightId, loaded] },
  );

  /* ------------------------------------------------------------- directions */

  // Draws the line from the tower outward, once. ~1.2s, eased so it lands softly.
  const drawRoute = useCallback((m, coordinates) => {
    const state = draw.current;
    gsap.killTweensOf(state);
    const src = () => m.getSource(ROUTE_SRC);
    if (prefersReducedMotion()) {
      src()?.setData(lineFeature(coordinates));
      return;
    }
    state.t = 0;
    src()?.setData(lineFeature(upTo(coordinates, 0)));
    gsap.to(state, {
      t: 1,
      duration: 1.2,
      ease: E.out,
      onUpdate() {
        src()?.setData(lineFeature(upTo(coordinates, state.t)));
      },
    });
  }, []);

  const showDest = useCallback((maplibregl, m, dest) => {
    clearTimeout(destTimeout.current);
    destMarker.current?.remove();

    const el = document.createElement('div');
    el.className = 'w63-dest';
    el.innerHTML =
      '<span class="w63-dest__pin"></span>' + `<span class="w63-dest__name">${dest.name}</span>`;
    destMarker.current = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([dest.lng, dest.lat])
      .addTo(m);

    // Born invisible and flipped next frame so the CSS transition has a 0 → 1 change to
    // animate, rather than painting in at full strength on the frame it is added.
    requestAnimationFrame(() => el.setAttribute('data-visible', 'true'));
  }, []);

  const hideDest = useCallback(() => {
    const marker = destMarker.current;
    if (!marker) return;
    destMarker.current = null;
    marker.getElement().setAttribute('data-visible', 'false');
    clearTimeout(destTimeout.current);
    destTimeout.current = window.setTimeout(() => marker.remove(), 350);
  }, []);

  // Opacity is STATE, not a constant: every fade starts from wherever the layers actually
  // are, so picking a second destination while the first route is still fading never
  // flashes the line back to full strength for a frame before continuing.
  const fadeRoute = useCallback((m, to) => {
    const state = routeFade.current;
    gsap.to(state, {
      o: to ? 1 : 0,
      duration: to ? 0.6 : 0.4,
      ease: E.out,
      overwrite: true,
      onUpdate() {
        if (!m.getLayer('dir-base')) return;
        m.setPaintProperty('dir-glow', 'line-opacity', 0.16 * state.o);
        m.setPaintProperty('dir-case', 'line-opacity', 0.85 * state.o);
        m.setPaintProperty('dir-base', 'line-opacity', state.o);
      },
      onComplete() {
        if (!to) m.getSource(ROUTE_SRC)?.setData(EMPTY);
      },
    });
  }, []);

  useGSAP(
    () => {
      const ctx = map.current;
      if (!ctx || !loaded) return;
      const { maplibregl, m } = ctx;

      abort.current?.abort();
      const dest = focusId ? LANDMARK_BY_ID[focusId] : null;

      if (!dest) {
        gsap.killTweensOf(draw.current);
        fadeRoute(m, false);
        hideDest();
        onRoute?.(null);
        // Only fly home if we ever left. This branch also runs once when the map first
        // loads, and a 1.4s camera move to the position the camera is already in wastes
        // the entrance and fights the screen transition.
        if (hasFocused.current) {
          m.easeTo({ ...HOME_VIEW, duration: 1400, easing: (t) => 1 - Math.pow(1 - t, 3) });
        }
        return;
      }

      hasFocused.current = true;
      const controller = new AbortController();
      abort.current = controller;
      onRoute?.({ id: dest.id, name: dest.name, mins: dest.mins, state: 'loading' });
      showDest(maplibregl, m, dest);

      fetchRoute([dest.lng, dest.lat], controller.signal)
        .then(({ coordinates, distance, duration }) => {
          if (controller.signal.aborted || !m.getSource(ROUTE_SRC)) return;
          fadeRoute(m, true);
          drawRoute(m, coordinates);
          onRoute?.({
            id: dest.id,
            name: dest.name,
            mins: dest.mins,
            state: 'ready',
            distance,
            duration,
          });

          const bounds = new maplibregl.LngLatBounds(coordinates[0], coordinates[0]);
          for (const c of coordinates) bounds.extend(c);
          m.fitBounds(bounds, {
            duration: 1500,
            padding: fitPadding(),
            maxZoom: 15.4,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error('[map] route', err);
          onRoute?.({ id: dest.id, name: dest.name, mins: dest.mins, state: 'error' });
        });
    },
    { dependencies: [focusId, loaded] },
  );

  const setHost = useCallback((el) => {
    host.current = el;
  }, []);

  // A map pans: its canvas and markers extend past the viewport by design.
  return (
    <div
      ref={setHost}
      data-overflow-ok
      className="w63-map"
      data-loaded={loaded ? 'true' : 'false'}
      aria-label="Map of Goregaon East, Mumbai"
    />
  );
}

// The panel sits OVER the map on wide screens, so the route has to be framed clear of it.
// On a phone the map element is already cut short above the docked panel, so padding
// there only needs to clear the top rail — reserving space for the panel as well would
// double-count it and squeeze the route off screen entirely.
function fitPadding() {
  const w = window.innerWidth;
  if (w < 768) return { top: 96, bottom: 56, left: 26, right: 26 };
  if (w < 1280) return { top: 110, bottom: 120, left: 340, right: 70 };
  return { top: 130, bottom: 130, left: 440, right: 110 };
}
