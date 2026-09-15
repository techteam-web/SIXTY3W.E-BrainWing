import { useCallback, useRef } from 'react';
import { useApp } from '../app/appContext';

// Persistent transition furniture. Mounted once at app root, never unmounted, and
// animated only by the director — which is why these elements live here rather than
// inside any screen.
//
// There is exactly one page transition in this app: the arch. Its parts are three
// panels, each cut to the logo's arch profile and each filled at build time with a clone
// of whichever screen is arriving, and the aperture ring that opens behind them.
//
// Four panels are rendered for three, because the phone layout uses two: the director
// picks how many it needs per transition (see archLayout) and parks the rest. Mounting
// them all up front means a viewport that crosses the breakpoint mid-session never has
// to add a DOM node inside a running timeline.

const PANELS = [0, 1, 2, 3];

export function ArchCurtain() {
  const { registerChrome } = useApp();
  const panels = useRef([]);

  const ref = useCallback((name) => (el) => registerChrome(name, el), [registerChrome]);

  const setPanel = useCallback(
    (i) => (el) => {
      panels.current[i] = el;
      registerChrome('panels', panels.current);
    },
    [registerChrome],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-90" aria-hidden="true">
      {/* THE ARCHES. */}
      <div ref={ref('cut')} className="arch-cut">
        {PANELS.map((i) => (
          <div key={i} ref={setPanel(i)} className="arch-panel" data-panel={i}>
            <div data-panel-view className="arch-panel-view" />
            <span data-panel-crown className="arch-crown" />
          </div>
        ))}
      </div>

      {/* The aperture. OVER the arches: they carry the arriving screen's picture, and the
          ring opens around the subject in that picture — behind them it was covered within
          half a second and only ever showed above their crowns. Outside the clipped
          .arch-cut box, so it can scale past the viewport without being cropped by it. No
          place or size of its own: the director sets both every time it plays — see
          ringFocus. (Sized here and centred by a grid, it was neither: .aperture-ring is
          absolutely positioned, which a grid cannot centre.) */}
      <div className="absolute inset-0 overflow-hidden">
        <span ref={ref('ring')} className="aperture-ring block opacity-0" />
      </div>
    </div>
  );
}
