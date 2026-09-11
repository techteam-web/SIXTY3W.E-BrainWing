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
      className={`${ground} relative h-full w-full overflow-hidden bg-w-deep ${
        padded ? 'screen-inset' : ''
      } ${className}`}
    >
      {children}
    </section>
  );
}
