import { useState } from 'react';
import { Render } from '../Primitives';
import { getRender } from '../../data/renders';

// The tour's own map, bottom-right: the whole level from above with a numbered dot on
// every place the tour can take you. The arrows walk the level a step at a time; this is
// for the visitor who wants the pool now — one click, no walking through the lift lobby
// to get there. Where you are standing glows.
//
// The numbers are the places' own in the tour's "Go to" menu (tours.js), 1 upwards.
// The dots are positioned against the render itself, so the box is always exactly the
// render's shape and a dot can never drift off its spot.

export function TourMap({ map, here, onPick }) {
  // Open on a wide screen, folded away on a phone, where the jump menu already holds the
  // bottom-left and an open map would sit on top of it.
  const [open, setOpen] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 48rem)').matches,
  );
  const [hover, setHover] = useState(null);

  // The picture: an image of its own (`map.image`: { src, width, height }), or one of the
  // app's renders by id (`map.render`).
  const render = map.image ?? getRender(map.render);
  // The window shows only `crop` of the render; the render itself (and every dot, placed
  // against it) is drawn at full size behind the window and shifted, so a dot still sits
  // exactly on its spot however tight the crop.
  const [u0, v0, u1, v1] = map.crop ?? [0, 0, 1, 1];
  const cw = u1 - u0;
  const ch = v1 - v0;
  const aspect = render ? `${render.width * cw} / ${render.height * ch}` : '16 / 10';
  const layer = {
    width: `${100 / cw}%`,
    height: `${100 / ch}%`,
    left: `${(-u0 / cw) * 100}%`,
    top: `${(-v0 / ch) * 100}%`,
  };

  const panel =
    'glass absolute z-10 right-(--screen-margin) bottom-[calc(var(--screen-margin)+var(--chrome-bottom)+0.4rem)]';
  const border = { border: '1px solid rgb(var(--gold-rgb) / 0.34)' };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${panel} flex min-h-[2.75rem] items-center gap-[0.6em] px-[1em] text-micro uppercase tracking-[0.22em] text-w-gold md:min-h-0 md:py-[0.6em]`}
        style={border}
      >
        <Dot />
        Show map
      </button>
    );
  }

  return (
    <div
      className={`${panel} flex w-[clamp(11rem,15vw,16rem)] flex-col gap-[0.5em] p-[clamp(0.45rem,0.6vw,0.7rem)] max-md:w-[10rem]`}
      style={{ ...border, boxShadow: '0 30px 70px -30px rgb(2 12 11 / 0.85)' }}
    >
      <div className="flex items-center justify-between gap-[0.8em]">
        <span className="flex min-w-0 items-center gap-[0.55em]">
          <Dot />
          <span className="truncate text-[0.55rem] uppercase tracking-[0.18em] text-w-cream">
            {map.title}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="shrink-0 border border-w-gold/35 px-[0.6em] py-[0.15em] text-[0.5rem] uppercase tracking-[0.16em] text-w-cream/70 transition-colors duration-300 hover:border-w-gold hover:text-w-gold"
        >
          Hide
        </button>
      </div>

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
       <div className="absolute" style={layer}>
        {map.image ? (
          <img
            src={map.image.src}
            alt=""
            draggable={false}
            decoding="async"
            className="block h-full w-full object-cover"
          />
        ) : (
          <Render id={map.render} sizes="(max-width: 767px) 20rem, 30vw" className="h-full w-full" />
        )}
        {/* A whisper of shade, so cream numbers and gold dots hold up on a bright deck. */}
        <span aria-hidden="true" className="absolute inset-0 bg-w-deep/25" />

        {map.points.map((pt) => {
          const on = pt.place === here;
          const shown = on || hover === pt.id;
          return (
            <button
              key={pt.id}
              type="button"
              aria-label={`Go to ${pt.place}`}
              aria-current={on}
              onPointerEnter={() => setHover(pt.id)}
              onPointerLeave={() => setHover((h) => (h === pt.id ? null : h))}
              onFocus={() => setHover(pt.id)}
              onBlur={() => setHover((h) => (h === pt.id ? null : h))}
              onClick={() => onPick(pt.id)}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 ${shown ? 'z-20' : 'z-10'}`}
              style={{ left: `${pt.u * 100}%`, top: `${pt.v * 100}%` }}
            >
              <span
                className={`relative grid h-[1.05rem] w-[1.05rem] place-items-center rounded-full text-[0.48rem] font-medium tabular-nums transition-all duration-300 ${
                  on
                    ? 'scale-110 bg-w-gold text-w-deep shadow-[0_0_14px_3px_rgb(var(--gold-rgb)/0.75)]'
                    : 'bg-w-deep/85 text-w-cream ring-1 ring-w-gold/75 group-hover:bg-w-gold group-hover:text-w-deep'
                }`}
              >
                {on ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 animate-ping rounded-full bg-w-gold/50 [animation-duration:1.6s] motion-reduce:hidden"
                  />
                ) : null}
                <span className="relative">{pt.n}</span>
              </span>

              {/* The name, for the dot you are on or pointing at. Flipped to the left past
                  the middle, so a label on the right-hand spots never leaves the map. */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-[0.55em] py-[0.2em] text-[0.5rem] uppercase tracking-[0.14em] text-w-cream transition-opacity duration-300 ${
                  pt.u > (u0 + u1) / 2 ? 'right-[calc(100%+0.4em)]' : 'left-[calc(100%+0.4em)]'
                } ${shown ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  background: 'rgb(var(--scrim-rgb) / 0.9)',
                  border: '1px solid rgb(var(--gold-rgb) / 0.35)',
                }}
              >
                {pt.place}
              </span>
            </button>
          );
        })}
       </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span aria-hidden="true" className="h-[0.45em] w-[0.45em] shrink-0 rounded-full bg-w-gold" />;
}
