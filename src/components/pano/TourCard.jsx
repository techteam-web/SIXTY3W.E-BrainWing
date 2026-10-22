// One space in a 360° gallery: its opening view as a thumbnail, its name, and a click
// that steps into the tour there. Sized entirely by the grid cell it sits in, never by
// the picture, so a gallery can't push its screen past its own height.

export function TourCard({ title, image, on, onPoint, onOpen }) {
  return (
    <button
      type="button"
      aria-label={`${title} — open 360° view`}
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch') return;
        onPoint?.();
      }}
      onFocus={() => onPoint?.()}
      onClick={onOpen}
      className={`group relative block h-full w-full overflow-hidden border text-left transition-colors duration-300 ${
        on ? 'border-w-gold' : 'border-w-gold/20 hover:border-w-gold/60'
      }`}
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${
          on ? 'opacity-100' : 'opacity-70'
        }`}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgb(4 26 25 / 0.88) 0%, rgb(4 26 25 / 0.35) 32%, rgb(4 26 25 / 0) 55%)',
        }}
      />
      <span className="absolute left-[0.7em] top-[0.7em] rounded-full border border-w-gold/70 bg-w-deep/70 px-[0.6em] py-[0.15em] text-micro tracking-[0.14em] text-w-gold">
        360°
      </span>
      <span className="absolute inset-x-0 bottom-0 flex min-w-0 flex-col gap-[0.2em] px-[0.9em] pb-[0.8em]">
        <span className="truncate text-caption uppercase tracking-[0.14em] text-w-cream">{title}</span>
        <span
          className={`text-micro uppercase tracking-[0.18em] transition-colors duration-300 ${
            on ? 'text-w-gold' : 'text-w-gold/60'
          }`}
        >
          Step inside →
        </span>
      </span>
    </button>
  );
}
