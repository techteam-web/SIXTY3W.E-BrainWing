import { useState } from 'react';
import { Screen } from '../../layout/Screen';
import { PanoViewer } from '../../features/pano/PanoViewer';
import { PANO_VIEWS } from '../../data/panoViews';
import { SunIcon, MoonIcon } from '../../components/Icons';

// The brochure has no page for this — it is the one thing a printed document cannot
// show. THE PANORAMA IS THE GROUND, the same rule Location's map follows: no holding
// image behind it, because the arch panels clone this screen and a picture that only
// exists to be thrown away a moment later is not worth a frame of mismatch.
//
// One vantage point — the terrace — and one control: day or night. Nothing else on
// this screen; the tour explains itself the moment a visitor drags it.

const TERRACE_VIEW = PANO_VIEWS.find((v) => v.id === 'terrace');

export function Panorama() {
  const [mode, setMode] = useState('day');

  return (
    <Screen id="views-360" padded={false}>
      <div className="absolute inset-0 z-0">
        <PanoViewer view={TERRACE_VIEW} mode={mode} />
      </div>

      <div
        data-stagger
        className="glass absolute z-10 left-(--screen-margin) top-[calc(var(--screen-margin)+var(--chrome-top))] w-fit p-[clamp(0.8rem,1.2vw,1.1rem)]"
        style={{
          border: '1px solid rgb(var(--gold-rgb) / 0.22)',
          boxShadow: '0 30px 70px -30px rgb(2 12 11 / 0.85)',
          borderTopLeftRadius: 'clamp(2rem, 5.4vw, 2.6rem)',
          borderTopRightRadius: 'clamp(2rem, 5.4vw, 2.6rem)',
        }}
      >
        <ModeToggle mode={mode} onChange={setMode} />
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------- mode toggle */

function ModeToggle({ mode, onChange }) {
  const options = [
    { id: 'day', label: 'Day', icon: <SunIcon size="1em" /> },
    { id: 'night', label: 'Night', icon: <MoonIcon size="1em" /> },
  ];

  return (
    <div role="group" aria-label="Time of day" className="flex shrink-0 gap-x-[1.6em]">
      {options.map((o) => {
        const on = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className="group/m relative flex shrink-0 items-center gap-[0.5em] pb-[0.35em]"
          >
            <span
              className={`flex items-center transition-colors duration-300 ${
                on ? 'text-w-gold' : 'text-w-cream/45 group-hover/m:text-w-cream/80'
              }`}
            >
              {o.icon}
            </span>
            <span
              className={`text-micro uppercase tracking-[0.18em] transition-colors duration-300 ${
                on ? 'text-w-gold' : 'text-w-cream/45 group-hover/m:text-w-cream/80'
              }`}
            >
              {o.label}
            </span>
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 bottom-0 h-px origin-left bg-w-gold transition-transform duration-400 ease-out ${
                on ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
