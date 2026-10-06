import { useRef } from 'react';
import { gsap, useGSAP, D, E } from '../gsap/Gsapconfig';
import { getRender } from '../data/renders';
import { ArrowIcon } from './Icons';

/* ----------------------------------------------------------------- Render */

// Every image in the app goes through here: a WebP ladder, explicit dimensions so the
// box is reserved before the bytes land, an inline LQIP behind it, and async decode.
// A null id renders nothing rather than placeholder art.
export function Render({
  id,
  className = '',
  imgClassName = '',
  priority = false,
  sizes = '100vw',
  alt,
  position = 'center',
}) {
  const render = getRender(id);
  if (!render) return null;

  return (
    <picture data-overflow-ok className={`block h-full w-full ${className}`}>
      <img
        data-hero
        src={render.src}
        srcSet={render.srcSet}
        sizes={sizes}
        width={render.width}
        height={render.height}
        alt={alt ?? render.alt}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={`h-full w-full object-cover ${imgClassName}`}
        style={{
          objectPosition: position,
          backgroundImage: `url(${render.lqip})`,
          backgroundSize: 'cover',
          backgroundPosition: position,
        }}
      />
    </picture>
  );
}

/* ---------------------------------------------------------------- Control */

// Never a filled button. A label over a gold hairline that extends on hover, with the
// label's tracking opening by 0.04em. Three properties, one gesture.
export function Control({ children, onClick, className = '', disabled = false, ...rest }) {
  const root = useRef(null);
  const { contextSafe } = useGSAP({ scope: root });

  const hover = contextSafe((on) => {
    if (disabled) return;
    gsap.to('[data-control-rule]', { scaleX: on ? 1.35 : 1, duration: D.micro, ease: E.soft });
    gsap.to('[data-control-label]', {
      letterSpacing: on ? '0.4em' : '0.34em',
      duration: D.micro,
      ease: E.soft,
    });
  });

  const enter = () => hover(true);
  const leave = () => hover(false);

  return (
    <button
      ref={root}
      type="button"
      onClick={onClick}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
      disabled={disabled}
      className={`group inline-flex flex-col items-start gap-[0.7em] disabled:opacity-40 ${className}`}
      {...rest}
    >
      <span data-control-label className="eyebrow">
        {children}
      </span>
      <span
        data-control-rule
        aria-hidden="true"
        className="hairline w-full origin-left bg-w-gold"
      />
    </button>
  );
}

/* ----------------------------------------------------------------- Portal */

// The landing's single call to action, and the only framed control in the app.
//
// Every other control here is a label over a hairline, which is right for a rail you
// have already learned and wrong for the one thing a first-time visitor has to find:
// nothing about a line of tracked-out gold says "press me". So this one is framed as an
// arch — the brand mark used as a button — and it moves on its own: a light travels the
// frame every few seconds, unprompted, which is what makes the eye come back to it. On
// hover the gold fills in behind the label and the type inverts to the ground colour.
//
// `size="sm"` is the top-rail variant: the same control and the same three gestures,
// tightened, so MENU and HOME read as a constant pair rather than as a second vocabulary.
export function Portal({
  children,
  onClick,
  className = '',
  disabled = false,
  size = 'md',
  icon = <ArrowIcon size="1.05em" />,
  // A back control reads its arrow first: ← MENU, not MENU ←.
  iconFirst = false,
  ...rest
}) {
  const root = useRef(null);
  const nav = size === 'sm';
  const restColor = nav ? 'var(--color-w-cream)' : 'var(--color-w-gold)';

  useGSAP(
    (self) => {
      const q = self.selector;
      // The attractor. A long pause between passes so it reads as an occasional catch
      // of light rather than as a loading shimmer.
      gsap.fromTo(
        q('[data-portal-sheen]'),
        { xPercent: -140 },
        { xPercent: 140, duration: 1.6, ease: 'power2.inOut', repeat: -1, repeatDelay: 2.8 },
      );
      // Self-healing rest state for the pieces the hover handler drives — StrictMode's
      // mount → cleanup → mount never runs the leave state, so the hit-sheen needs its
      // own reset here rather than trusting a prior pointer event.
      gsap.set(q('[data-portal-hit]'), { xPercent: -140, autoAlpha: 0 });
    },
    { scope: root },
  );

  const { contextSafe } = useGSAP({ scope: root });

  const hover = contextSafe((on) => {
    if (disabled) return;
    const vars = { duration: 0.5, ease: E.out, overwrite: 'auto' };
    gsap.to('[data-portal-fill]', { scaleX: on ? 1 : 0, ...vars });
    gsap.to('[data-control-label]', {
      color: on ? 'var(--color-w-deep)' : restColor,
      letterSpacing: on ? '0.4em' : '0.34em',
      ...vars,
    });
    gsap.to('[data-portal-mark]', { color: on ? 'var(--color-w-deep)' : restColor, ...vars });
    if (on) {
      gsap.fromTo(
        '[data-portal-hit]',
        { xPercent: -140, autoAlpha: 0.8 },
        { xPercent: 140, duration: 0.62, ease: 'power2.out', overwrite: 'auto' },
      );
    }
  });

  const enter = () => hover(true);
  const leave = () => hover(false);

  return (
    <button
      ref={root}
      type="button"
      onClick={onClick}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
      disabled={disabled}
      // The sheen layers and the fill deliberately overhang the button and are clipped
      // by its own overflow — that is the effect, not a layout fault.
      data-overflow-ok
      // The 40% disabled fade is for the LANDING CTA only — there it acknowledges the
      // click you just made while the intro holds the nav lock. The rail's MENU/HOME are
      // disabled for the whole of every transition, arrivals included, where the visitor
      // has clicked nothing; fading them there takes their panel down too, so they read
      // as unstyled text for two seconds and then "gain a background" when the lock
      // releases. The sm variant changes nothing at all while disabled.
      className={`portal group ${nav ? 'portal--sm' : 'disabled:opacity-40'} ${className}`}
      {...rest}
    >
      {/* All four layers ride outside the button's own box and are clipped by its
          overflow — which is the point of them, and which the overflow guard would
          otherwise report as content escaping. */}
      <span data-overflow-ok aria-hidden="true" className="portal-panel" />
      <span data-overflow-ok aria-hidden="true" className="portal-fill">
        <span data-portal-fill className="portal-fill-bar" />
      </span>
      <span data-portal-sheen data-overflow-ok aria-hidden="true" className="portal-sheen" />
      <span data-portal-hit data-overflow-ok aria-hidden="true" className="portal-sheen" />

      {children != null ? (
        <span
          data-control-label
          className={`eyebrow portal-label ${nav ? 'text-w-cream' : 'text-w-gold'} ${
            iconFirst ? 'order-2' : ''
          }`}
        >
          {children}
        </span>
      ) : null}

      <span
        data-portal-mark
        className={`portal-label flex items-center ${nav ? 'text-w-cream' : 'text-w-gold'} ${
          iconFirst ? 'order-1' : ''
        }`}
      >
        {icon}
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------- CountUp */

// Counts once on entry, never loops. gsap.to on a plain object, so no React state is
// touched sixty times a second.
export function CountUp({ to, decimals = 0, duration = 1.3, delay = 0, className = '' }) {
  const el = useRef(null);

  useGSAP(
    () => {
      if (to == null || !el.current) return;
      const box = { v: 0 };
      el.current.textContent = (0).toFixed(decimals);
      gsap.to(box, {
        v: to,
        duration,
        delay,
        ease: E.out,
        onUpdate: () => {
          if (el.current) el.current.textContent = box.v.toFixed(decimals);
        },
      });
    },
    { dependencies: [to, decimals, duration, delay] },
  );

  return <span ref={el} className={className} />;
}
