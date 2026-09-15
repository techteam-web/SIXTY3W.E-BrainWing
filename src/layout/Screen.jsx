import { useRef } from 'react';
import { useOverflowGuard } from '../hooks/useOverflowGuard';

// Every screen is exactly the viewport. Nothing else in the app sets a height, and no
// component may introduce a scroll container.
//
// Screen never sets its own opacity or transform: the transition director owns those,
// and a component fighting it for the same property is the classic way an overlapping
// swap goes wrong.

export function Screen({ id, className = '', children, padded = true, ground = 'ground' }) {
  const ref = useRef(null);
  useOverflowGuard(ref, id);

  return (
    <section
      ref={ref}
      data-screen-root={id}
      className={`${ground} relative isolate h-full w-full overflow-hidden bg-w-deep ${
        padded ? 'screen-inset' : ''
      } ${className}`}
    >
      {/* The cover's lattice, behind everything the screen draws — see .lattice in
          base.css. `isolate` on the section is what keeps this -z-10 layer above the
          ground and beneath the content: with no stacking context of its own, the
          section's background would paint straight over it. Screens with a full-bleed
          render or the map simply cover it. */}
      <div aria-hidden="true" className="lattice pointer-events-none absolute inset-0 -z-10" />
      {children}
    </section>
  );
}
