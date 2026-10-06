import { useControls } from 'react-zoom-pan-pinch';

// Three controls and no more: in, out, and back to the whole plan. The wheel, the pinch
// and the drag do everything else, and they explain themselves the moment anyone tries.
//
// Square glass cells, stacked, in the corner the caption line leaves free. Each is a
// full 44px target below md, where these are thumbs rather than a cursor.

const ANIM = 'easeOutCubic';

export function PanZoomControls({ className = '' }) {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div
      data-plan-chrome
      role="group"
      aria-label="Zoom"
      className={`glass absolute z-20 right-(--screen-margin) bottom-[calc(var(--screen-margin)+var(--chrome-bottom)+0.4rem)] flex flex-col ${className}`}
      style={{
        border: '1px solid rgb(var(--gold-rgb) / 0.3)',
        boxShadow: '0 24px 60px -28px rgb(2 12 11 / 0.9)',
      }}
    >
      <Cell label="Zoom in" onClick={() => zoomIn(0.6, 320, ANIM)}>
        <Glyph d="M12 5v14M5 12h14" />
      </Cell>
      <Cell label="Zoom out" onClick={() => zoomOut(0.6, 320, ANIM)}>
        <Glyph d="M5 12h14" />
      </Cell>
      <Cell label="Reset view" onClick={() => resetTransform(480, ANIM)} wide>
        <span className="text-[length:var(--text-micro)] uppercase tracking-[0.18em]">Reset</span>
      </Cell>
    </div>
  );
}

function Cell({ label, onClick, children, wide = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`group grid place-items-center border-t border-w-gold/20 text-w-cream/75 transition-colors duration-300 first:border-t-0 hover:text-w-gold ${
        wide
          ? 'h-[clamp(2.4rem,3.4vw,3rem)] px-[0.7em] max-md:h-[2.75rem]'
          : 'h-[clamp(2.4rem,3.4vw,3rem)] max-md:h-[2.75rem]'
      }`}
    >
      {children}
    </button>
  );
}

// The app's icon grid and hairline weight (see Icons.jsx), for the two signs it lacks.
function Glyph({ d }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.15em"
      height="1.15em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
