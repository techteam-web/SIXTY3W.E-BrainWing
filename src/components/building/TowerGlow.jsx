import { useLayoutEffect, useRef, useState } from 'react';
import { BUILDING } from '../../data/floors';
import { SvgShape } from '../SvgShape';
import { gsap, useGSAP, E, prefersReducedMotion } from '../../gsap/Gsapconfig';

// The Floor Plans screen's light, on the landing's tower: a gold wash runs up the floors
// and goes out again, pass after pass. Purely decorative — nothing here is clickable.
//
// The floors are the elevation's own traced shapes (BUILDING, from Sixty3w.e.svg), but
// the landing shows a different render, tower-dusk, which is the same image scaled and
// cropped. Registered by image matching, not by eye:
//
//   tower-dusk px = 5.0583 × elevation viewBox unit + (−506, +4)
//
// The overlay is laid exactly where the <img>'s object-fit: cover puts the render, at the
// same object-position, so the floors stay on their slabs at every size and on a phone's
// shifted crop.

const IMAGE = { w: 1824, h: 1324 };
const PLACE = 'translate(-506 4) scale(5.0583)';
const CUES = BUILDING.floors.filter((f) => f.plan || f.pano);

// "42% 30%" or "center" → [0.42, 0.3]
const parsePosition = (position) => {
  const word = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };
  const [x = 'center', y = x] = String(position).trim().split(/\s+/);
  const f = (v) => (v in word ? word[v] : parseFloat(v) / 100);
  return [f(x), f(y)];
};

export function TowerGlow({ position = 'center', delay = 1.3 }) {
  const root = useRef(null);
  const [box, setBox] = useState(null);
  const [px, py] = parsePosition(position);

  // The visible part of the render, in its own pixels, as object-fit: cover crops it.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const measure = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      if (!w || !h) return;
      const s = Math.max(w / IMAGE.w, h / IMAGE.h);
      const x = ((IMAGE.w * s - w) * px) / s;
      const y = ((IMAGE.h * s - h) * py) / s;
      setBox(`${x} ${y} ${w / s} ${h / s}`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [px, py]);

  useGSAP(
    () => {
      if (!box || prefersReducedMotion()) return;
      const cues = gsap.utils.toArray('[data-cue]', root.current).reverse();
      gsap
        .timeline({ delay, repeat: -1, repeatDelay: 1.4 })
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
    { scope: root, dependencies: [!!box] },
  );

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {box ? (
        <svg viewBox={box} preserveAspectRatio="none" className="absolute inset-0 block h-full w-full">
          <g transform={PLACE}>
            {CUES.map((f) => (
              <SvgShape key={f.id} shape={f} data-cue className="bw-cue" />
            ))}
          </g>
        </svg>
      ) : null}
    </div>
  );
}
