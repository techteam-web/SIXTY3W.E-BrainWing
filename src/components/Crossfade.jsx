import { useRef } from 'react';
import { gsap, useGSAP, E } from '../gsap/Gsapconfig';
import { getRender } from '../data/renders';

// Two <img> layers that never unmount, a poster behind them, and a cross-fade between.
//
// The naive version of this — one <img> whose src changes — flashes, because the browser
// tears down the old bitmap the moment the new src is set and there is nothing to fade
// from. The version with a React key remounts a DOM node inside a running timeline. This
// keeps both layers alive for the life of the screen, paints the incoming picture into
// whichever is at the back, and then animates nothing but opacity and scale.
//
// THE FADE IS GATED ON decode(), and that is load-bearing twice over.
//
// Correctness first: an <img> whose src is assigned imperatively can finish loading —
// complete, naturalWidth set, opacity 1, box laid out — and still not paint, because the
// layer it lives in was promoted to the compositor (this app puts `will-change` on every
// screen for the duration of a transition, which is exactly when these images arrive) and
// the decode never invalidates it. The result is an image that is provably there and
// visibly is not: the poster underneath shows instead, indefinitely. Waiting for decode()
// and THEN writing opacity is what invalidates the layer.
//
// And quality second: without the gate the cross-fade starts against a 20px poster and
// sharpens a beat later, which reads as the app being slow rather than as a dissolve.

export function Crossfade({
  id,
  sizes = '100vw',
  className = '',
  imgClassName = '',
  position = 'center',
  zoom = true,
  priority = false,
  // A framing for THIS picture — { position, scale, origin } — for a box whose crop the
  // picture's composition does not survive. See `backdropFrame` in src/data/sections.js.
  frame = null,
}) {
  const root = useRef(null);
  const layers = useRef([]);
  const poster = useRef(null);
  const front = useRef(0);
  const shown = useRef(null);

  const setLayer = (i) => (el) => {
    layers.current[i] = el;
  };

  useGSAP(
    () => {
      const render = getRender(id);
      const [a, b] = layers.current;
      if (!render || !a || !b) return undefined;

      let cancelled = false;
      const stop = () => {
        cancelled = true;
      };

      // Written onto the element as it is dressed, never through a style prop: both
      // layers belong to one component, so a prop would re-frame the OUTGOING picture in
      // the same commit that chooses the incoming one, and it would jump as it fades. The
      // scale is on the <img>, the cross-fade's settle is on the layer, so the two compose.
      const place = (el, bg) => {
        const s = el.style;
        s[bg ? 'backgroundPosition' : 'objectPosition'] = frame?.position ?? position;
        s.transform = frame?.scale ? `scale(${frame.scale})` : '';
        s.transformOrigin = frame?.origin ?? '';
      };

      const dress = (layer) => {
        const img = layer.querySelector('img');
        place(img, false);
        // `sizes` FIRST. Setting srcset runs the selection algorithm immediately, and it
        // runs it against whatever `sizes` says at that moment — which, if sizes has not
        // been assigned yet, is the 100vw default. Get the order wrong and every layer
        // downloads the largest file in the ladder for a box a fraction of that size.
        img.sizes = sizes;
        img.srcset = render.srcSet;
        img.src = render.src;
        img.alt = render.alt ?? '';
        return img.decode?.().catch(() => {}) ?? Promise.resolve();
      };

      if (poster.current) {
        poster.current.style.backgroundImage = `url(${render.lqip})`;
        place(poster.current, true);
      }

      // First paint: the poster is already up, so the picture simply resolves onto it.
      if (shown.current === null) {
        gsap.set(a, { autoAlpha: 0, zIndex: 2, scale: 1 });
        gsap.set(b, { autoAlpha: 0, zIndex: 1 });
        shown.current = id;
        front.current = 0;
        dress(a).then(() => {
          if (cancelled) return;
          gsap.to(a, { autoAlpha: 1, duration: 0.5, ease: E.out, overwrite: 'auto' });
        });
        return stop;
      }

      if (id === shown.current) return undefined;

      const back = layers.current[1 - front.current];
      const top = layers.current[front.current];

      gsap.killTweensOf([back, top]);
      gsap.set(back, { zIndex: 2, autoAlpha: 0, scale: zoom ? 1.07 : 1 });
      gsap.set(top, { zIndex: 1 });

      front.current = 1 - front.current;
      shown.current = id;

      dress(back).then(() => {
        if (cancelled) return;
        gsap.to(back, { autoAlpha: 1, duration: 0.6, ease: E.out, overwrite: 'auto' });
        // The incoming picture settles out of a slow zoom rather than simply appearing.
        // It is the difference between a slideshow and a camera move, and it costs one
        // transform.
        if (zoom) gsap.to(back, { scale: 1, duration: 2.6, ease: E.out, overwrite: 'auto' });
        gsap.to(top, { autoAlpha: 0, duration: 0.6, ease: E.out, overwrite: 'auto' });
      });

      return stop;
    },
    { dependencies: [id], scope: root, revertOnUpdate: false },
  );

  // StrictMode's mount → cleanup → mount would otherwise leave `shown` pointing at a
  // layer the second pass has already reset.
  useGSAP(
    () => () => {
      shown.current = null;
      front.current = 0;
    },
    { scope: root },
  );

  return (
    // Two rules here, and both were bugs first.
    //
    // No `position` of its own: the caller decides whether this is an absolutely
    // positioned full-bleed layer or a relatively positioned box in a grid, and a base
    // `relative` here would silently win over an `absolute` passed in className (Tailwind
    // orders `relative` after `absolute`, so the later rule takes it).
    //
    // `isolate`, because the cross-fade swaps its two layers by z-index. Neither
    // `position: absolute` alone nor `overflow: hidden` creates a stacking context, so
    // without this the layer sitting at z-index 2 joins the SCREEN's stacking context and
    // paints over every scrim and every caption the screen draws after it.
    <div ref={root} data-overflow-ok className={`isolate overflow-hidden ${className}`}>
      <div
        ref={poster}
        aria-hidden="true"
        className="absolute inset-0 bg-cover"
        style={{ backgroundPosition: position }}
      />
      {[0, 1].map((i) => (
        <div
          key={i}
          ref={setLayer(i)}
          data-overflow-ok
          // Marked so the transition director can find these when it clones a screen.
          // A layer only fades up after decode() resolves, and the director clones the
          // destination in the tick it mounts — so a faithful copy always catches this
          // opacity 0. See cloneScreen.
          data-fade-layer
          aria-hidden={i === 1}
          className="absolute inset-0 opacity-0"
        >
          <img
            data-hero
            alt=""
            decoding="async"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            className={`h-full w-full object-cover ${imgClassName}`}
            style={{ objectPosition: position }}
          />
        </div>
      ))}
    </div>
  );
}
