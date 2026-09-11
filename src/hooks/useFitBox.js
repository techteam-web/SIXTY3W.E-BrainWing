import { useCallback } from 'react';
import { gsap, useGSAP } from '../gsap/Gsapconfig';
import { useEventListener } from './useEventListener';

// Sizes a box to fit (or fill) its container at a fixed aspect ratio, in real pixels.
//
// CSS can express "fit inside this box" for a bare <img> and for nothing else: a
// percentage max-height only resolves against a parent that has a definite height, and a
// shrink-wrapped parent by definition has not got one. `aspect-ratio` does not help
// either — clamped by max-height it keeps its width and silently changes shape.
//
// Anything that has to line up with the picture therefore needs the picture's real
// rectangle, and this is where it comes from: the Level 26 callouts (whose coordinates
// are normalised against the render itself) and the Floor Plans sheet both depend on it
// being exact, at every viewport, in the first frame.

export function useFitBox(containerRef, boxRef, aspect, mode = 'contain') {
  const apply = useCallback(() => {
    const c = containerRef.current;
    const b = boxRef.current;
    if (!c || !b || !aspect) return;
    const r = c.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // Which axis binds: for `contain` a container wider than the box is bound by height,
    // for `cover` it is the other way round.
    const wide = r.width / r.height > aspect;
    const byHeight = mode === 'contain' ? wide : !wide;
    b.style.width = `${byHeight ? r.height * aspect : r.width}px`;
    b.style.height = `${byHeight ? r.height : r.width / aspect}px`;
  }, [containerRef, boxRef, aspect, mode]);

  // useGSAP runs as a layout effect, so the box is sized in the frame it mounts and is
  // never seen at the wrong size. The two follow-ups catch the reflows that land later:
  // one for the layout settling, one for the webfont arriving and changing the width of
  // whatever sits beside it.
  useGSAP(
    () => {
      apply();
      gsap.delayedCall(0.06, apply);
      document.fonts?.ready.then(apply);
    },
    { dependencies: [aspect, mode] },
  );

  useEventListener('resize', apply);
  useEventListener('orientationchange', apply);

  return apply;
}
