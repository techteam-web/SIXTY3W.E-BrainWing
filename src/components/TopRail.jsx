import { useCallback, useState } from 'react';
import { useApp } from '../app/appContext';
import { useMediaQuery } from '../hooks/useEventListener';
import { BrandCorner } from './Lockup';
import { Portal } from './Primitives';
import { BackIcon, HomeIcon } from './Icons';
import { useEventListener } from '../hooks/useEventListener';

// Present on every screen except the gate and the landing.
//
// Navigation lives TOP-LEFT, where the eye goes to get back. The lockup stays top-right
// as the fixed anchor: constant size, constant position, never animated on a page change.
// It is the one thing on screen that holds still.
//
// ONE WAY BACK, ALWAYS ONE LEVEL UP. Two identical buttons called MENU and HOME left
// visitors guessing which one was "back". Now:
//
//   on the menu        ← HOME         back to the cover
//   in a section       ← MENU         back to the contents — the primary, labelled one
//                      ⌂ (icon only)  the cover, and it asks before leaving
//                      Menu / 02 Residences, a breadcrumb saying where you are
//
// The back control is the same framed control as the landing's own call to action —
// Portal's size="sm" variant — with its arrow pointing back.

function NavButton({ label, onClick, disabled, icon, iconFirst = false, className = '', ...rest }) {
  return (
    <Portal
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={icon}
      iconFirst={iconFirst}
      className={`pointer-events-auto ${className}`}
      {...rest}
    >
      {label}
    </Portal>
  );
}

// Leaving a section for the cover throws away where the visitor was, so the icon-only
// HOME asks first. A small card under the button, never a modal over the screen.
function HomeConfirm({ onConfirm, onCancel }) {
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
    // Capture, so this runs before the global Escape → menu binding sees the key.
  }, window, true);

  return (
    <div
      role="dialog"
      aria-label="Go to the home page"
      className="pointer-events-auto absolute left-0 top-[calc(100%+0.7em)] z-10 flex w-max max-w-[80vw] flex-col gap-[0.8em] rounded-t-[1em] border border-w-gold/35 px-[1.1em] py-[0.9em]"
      style={{
        background: 'linear-gradient(180deg, rgb(12 59 57 / 0.96), rgb(4 26 25 / 0.96))',
        boxShadow: '0 18px 40px -16px rgb(2 12 11 / 0.8)',
      }}
    >
      <span className="text-caption text-w-cream/85">Go back to the home page?</span>
      <div className="flex gap-[0.6em]">
        <button
          type="button"
          onClick={onConfirm}
          className="eyebrow rounded-t-[0.7em] bg-w-gold px-[1em] py-[0.55em] text-w-deep"
        >
          Yes, go home
        </button>
        <button
          type="button"
          onClick={onCancel}
          autoFocus
          className="eyebrow rounded-t-[0.7em] border border-w-gold/45 px-[1em] py-[0.55em] text-w-cream"
        >
          Stay here
        </button>
      </div>
    </div>
  );
}

export function TopRail() {
  const { stage, current, registerChrome, goToMenu, goToLanding, isTransitioning } = useApp();
  const railRef = useCallback((el) => registerChrome('rail', el), [registerChrome]);
  // A light screen is not light everywhere at every size: below md the Location plan
  // docks a dark panel over its own bottom half, so the FOOT of the rail is back on teal
  // while its head is still on paper. The two ends therefore ask separately.
  const wide = useMediaQuery('(min-width: 48rem)');
  // Keyed to the section it was asked on, so a pending question never outlives that
  // screen: navigate anywhere and it is simply no longer this screen's question.
  const [askedOn, setAskedOn] = useState(null);
  const confirming = stage === 'section' && askedOn != null && askedOn === current?.id;
  const setConfirming = (on) => setAskedOn(on ? (current?.id ?? null) : null);

  // The landing carries no rail — it IS home, so a HOME button there navigates nowhere.
  if (stage !== 'menu' && stage !== 'section') return null;

  // MENU and HOME need no branch: they are dark chips, which read on paper and on teal
  // alike. It is the bare type — the corner mark and the two caption lines — that has to
  // change ink when the ground does.
  const light = current?.tone === 'light';
  const lightFoot = light && wide;
  const quiet = lightFoot ? 'text-w-deep/45' : 'text-w-cream/40';
  const quieter = lightFoot ? 'text-w-deep/50' : 'text-w-cream/45';

  return (
    <div
      ref={railRef}
      className="pointer-events-none fixed inset-0 z-100"
      style={{ padding: 'var(--screen-margin)' }}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-[2em]">
          {/* shrink-0, not min-w-0. The lockup opposite already carries shrink-0, so with
              no counterweight here flexbox puts the whole squeeze on this cluster once
              the row runs out of room, and MENU/HOME shrink below their own labels. These
              are the working controls; the mark is decorative and clamps itself. */}
          <div className="relative flex shrink-0 items-center gap-[1.1em] max-md:gap-[0.7em]">
            {stage === 'section' ? (
              <>
                <NavButton
                  label="Menu"
                  onClick={goToMenu}
                  disabled={isTransitioning}
                  icon={<BackIcon size="1em" />}
                  iconFirst
                  data-nav="back"
                  aria-label="Back to the menu"
                />
                <NavButton
                  label={<span className="sr-only">Home</span>}
                  onClick={() => setConfirming(!confirming)}
                  disabled={isTransitioning}
                  icon={<HomeIcon size="1.1em" />}
                  className="portal--icon"
                  data-nav="home"
                  title="Home page"
                  aria-label="Home page"
                  aria-expanded={confirming}
                />
                <Breadcrumb
                  current={current}
                  onMenu={goToMenu}
                  disabled={isTransitioning}
                />
                {confirming ? (
                  <HomeConfirm
                    onConfirm={() => {
                      setConfirming(false);
                      goToLanding();
                    }}
                    onCancel={() => setConfirming(false)}
                  />
                ) : null}
              </>
            ) : (
              <NavButton
                label="Home"
                onClick={goToLanding}
                disabled={isTransitioning}
                icon={<BackIcon size="1em" />}
                iconFirst
                data-nav="back"
                aria-label="Back to the home page"
              />
            )}
          </div>

          <BrandCorner tone={light ? 'light' : 'dark'} />
        </div>

        {/* The compliance line. Present on every screen — Indian real-estate marketing
            requires it and it is not optional, so it is furniture rather than a per-screen
            decision. What it SAYS is per-screen, because a map is not an impression. */}
        <div className="flex items-end justify-between gap-[2em]">
          <span
            className={`text-micro tracking-[0.24em] uppercase transition-colors duration-500 max-md:hidden ${quiet}`}
          >
            {current?.label ?? null}
          </span>
          <span
            className={`text-micro tracking-[0.2em] uppercase transition-colors duration-500 ${quieter}`}
          >
            {current?.caption ?? 'Artist’s impression'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Where you are, in words: MENU / 02 RESIDENCES. The first crumb is a link back.
function Breadcrumb({ current, onMenu, disabled }) {
  if (!current) return null;
  // Always cream: the crumb carries its own dark backing, so it reads on any ground.
  const ink = 'text-w-cream';
  return (
    <nav
      aria-label="Breadcrumb"
      className="pointer-events-auto relative isolate flex min-w-0 items-center gap-[0.7em] px-[1.2em] py-[0.8em] [text-shadow:0_1px_8px_rgb(4_26_25/0.7)] max-lg:hidden"
    >
      {/* A frosted teal pill behind the words, so the crumb reads over a bright render.
          Quieter than the buttons beside it — no frame, no arch — so it never looks like
          a third control. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-full bg-w-void/55 backdrop-blur-[10px]"
        style={{ boxShadow: '0 4px 18px rgb(4 26 25 / 0.35)' }}
      />
      <button
        type="button"
        onClick={onMenu}
        disabled={disabled}
        className={`eyebrow ${ink} opacity-75 transition-opacity hover:opacity-100`}
      >
        Menu
      </button>
      <span aria-hidden="true" className="eyebrow text-w-gold">
        /
      </span>
      <span aria-current="page" className={`eyebrow whitespace-nowrap ${ink}`}>
        <span className="text-w-gold">{current.no}</span> {current.label}
      </span>
    </nav>
  );
}
