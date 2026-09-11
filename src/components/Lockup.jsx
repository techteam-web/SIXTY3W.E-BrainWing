import { useMemo } from 'react';
import lockupSrc from '../assets/brand/lockup.svg?raw';

// THE MARK.
//
// Two halves, and they arrive by different routes on purpose.
//
// The three arches and the six ticks are GEOMETRY, rebuilt here from the numbers in the
// source PDF's path data (see --arch-* in theme.css for the derivation). They are drawn
// rather than imported because the intro sequence strokes each arch on, one after the
// other, and because a shape defined by six numbers should not be a 4 kB asset.
//
// The letterforms are Panton, which is not licensed here and is not being substituted:
// SIXTY3W.E., RESIDENCES and GOREGAON (E) are real vector, lifted straight out of the
// brochure and living in src/assets/brand/lockup.svg. Everything below shares that
// file's page-space coordinate system, so the arches and the type need no reconciling —
// they sit exactly where the printed lockup puts them.

/* ------------------------------------------------------ measured geometry */

const ARCH = { w: 31.399, h: 46.439, r: 9.909, gap: 23.217, stroke: 1.954 };
const ARCH_X = 949.674; // left edge of the first arch, page space
const ARCH_BASE = 173.391; // the arches stand on this line
const ARCH_TOP = ARCH_BASE - ARCH.h;
const ARCH_SHOULDER = ARCH_BASE - 36.53; // where the crown's curve begins

// The six ticks sit on the six arch legs — the two outer edges and the four where the
// arches interlock. That rhythm is the reason the mark reads as one object.
const TICK_Y = 217.39;
const TICK_LEN = 9.976;
const TICK_X = [0, 23.217, 31.399, 46.434, 54.616, 77.833];

// A single arch, as one continuous stroke from the bottom-left leg, over the crown, down
// to the bottom-right. One subpath, so the intro can run it with stroke-dashoffset and
// the ink reads as a hand drawing it.
//
// The strokes deliberately do NOT carry vector-effect="non-scaling-stroke". Two reasons,
// and the second one is a real trap: the printed logo scales its own stroke weight, so a
// hero mark should have a heavier line than a corner mark; and under non-scaling-stroke
// the dash array resolves in DEVICE pixels rather than user units, which silently turns
// the intro's stroke-dashoffset draw into a dashed line at any size but 1:1.
const archPath = (x) =>
  `M${x} ${ARCH_BASE} V${ARCH_SHOULDER} ` +
  `C${x} ${ARCH_TOP + 4.436} ${x + 4.436} ${ARCH_TOP} ${x + ARCH.r} ${ARCH_TOP} ` +
  `H${x + ARCH.w - ARCH.r} ` +
  `C${x + ARCH.w - 4.436} ${ARCH_TOP} ${x + ARCH.w} ${ARCH_TOP + 4.436} ${x + ARCH.w} ${ARCH_SHOULDER} ` +
  `V${ARCH_BASE}`;

const ARCHES = [0, 1, 2].map((i) => archPath(ARCH_X + i * ARCH.gap));

/* -------------------------------------------------- the imported letterforms */

// The three lines of type, split by their shared baseline. The extraction writes one
// <path> per glyph, each carrying its own placement matrix, and every glyph on a line
// shares that matrix's ty.
const TYPE = (() => {
  const paths = [...lockupSrc.matchAll(/<path transform="matrix\(([^)]*)\)" d="([^"]*)"\/>/g)].map(
    (m) => ({ ty: +m[1].split(',')[5], transform: `matrix(${m[1]})`, d: m[2] }),
  );
  const line = (ty) => paths.filter((p) => Math.abs(p.ty - ty) < 1);
  return {
    name: line(194.331), // SIXTY3W.E.
    kind: line(208.239), // RESIDENCES
    place: line(242.415), // GOREGAON (E)
  };
})();

/* ---------------------------------------------------------------- variants */

// Each variant is cropped to exactly what it draws, so the same component can be a
// hero mark, a corner mark or a bare glyph without any of them carrying dead space.
const VIEW = {
  mark: '948.694 125.97 79.793 48.401',
  stack: '913.7 125.9 151.6 102.5', // arches + name + kind + ticks
  full: '913.7 125.9 151.6 118.4', // …and GOREGAON (E)
};

/**
 * variant — 'mark' (three arches only) · 'stack' · 'full'
 * draw    — render the arches as strokes so the intro can draw them on. Off by default:
 *           a stroked mark at corner size is a hairline that shimmers on scroll-free
 *           repaints, and only one instance in the app is ever animated.
 */
export function Lockup({
  variant = 'full',
  className = '',
  title = 'SIXTY3W.E. Residences, Goregaon (E)',
  corner = false,
  ...rest
}) {
  const showType = variant !== 'mark';
  const showPlace = variant === 'full';

  const type = useMemo(
    () => (
      <g data-lockup-type fill="currentColor">
        {TYPE.name.map((p, i) => (
          <path key={`n${i}`} transform={p.transform} d={p.d} />
        ))}
        {TYPE.kind.map((p, i) => (
          <path key={`k${i}`} transform={p.transform} d={p.d} />
        ))}
        {showPlace
          ? TYPE.place.map((p, i) => <path key={`p${i}`} transform={p.transform} d={p.d} />)
          : null}
      </g>
    ),
    [showPlace],
  );

  return (
    <svg
      data-lockup
      // Set by BrandCorner only. The fixed corner mark never animates — it is the one
      // constant on screen — so the intro sequence excludes anything carrying this flag
      // when it decides which lockup travels from centre stage to its resting place.
      {...(corner ? { 'data-corner-mark': true } : null)}
      viewBox={VIEW[variant]}
      role="img"
      aria-label={title}
      className={`block overflow-visible ${className}`}
      {...rest}
    >
      <g data-lockup-arches>
        {ARCHES.map((d, i) => (
          <path
            key={i}
            data-arch-path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={ARCH.stroke}
            strokeLinecap="butt"
          />
        ))}
      </g>

      {showType ? type : null}

      {showType
        ? TICK_X.map((x, i) => (
            <line
              key={i}
              data-tick
              x1={ARCH_X + x}
              y1={TICK_Y}
              x2={ARCH_X + x}
              y2={TICK_Y + TICK_LEN}
              stroke="currentColor"
              strokeWidth={ARCH.stroke}
              style={{ transformOrigin: `${ARCH_X + x}px ${TICK_Y}px` }}
            />
          ))
        : null}
    </svg>
  );
}

// The fixed corner anchor. Same size and position on every screen that carries the rail —
// it is the thing that does not move while everything else does. The only thing that ever
// changes about it is its ink, and only on a screen whose ground is paper: gold on ivory
// is a 1.9:1 mark, which is no mark at all.
export function BrandCorner({ className = '', tone = 'dark' }) {
  return (
    <Lockup
      corner
      variant="stack"
      className={`w-[clamp(5.5rem,7.4vw,10rem)] shrink-0 transition-colors duration-500 max-md:w-[4.6rem] max-mob:w-[3.9rem] ${
        tone === 'light' ? 'text-w-deep' : 'text-w-gold'
      } ${className}`}
    />
  );
}
