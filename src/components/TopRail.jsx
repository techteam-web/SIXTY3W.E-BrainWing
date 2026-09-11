import { useCallback } from 'react';
import { useApp } from '../app/appContext';
import { useMediaQuery } from '../hooks/useEventListener';
import { BrandCorner } from './Lockup';
import { Portal } from './Primitives';
import { MenuIcon, HomeIcon } from './Icons';

// Present on every screen except the gate and the landing.
//
// Navigation lives TOP-LEFT, where the eye goes to get back. The lockup stays top-right
// as the fixed anchor: constant size, constant position, never animated on a page change.
// It is the one thing on screen that holds still.
//
// MENU and HOME are the same framed control as the landing's own call to action —
// Portal's size="sm" variant exists for exactly this, so the rail's one interactive
// gesture is the one a visitor already learned on the way in.

function NavButton({ label, onClick, disabled, icon }) {
  return (
    <Portal
      size="sm"
      onClick={onClick}
      disabled={disabled}
      icon={icon}
      className="pointer-events-auto"
    >
      {label}
    </Portal>
  );
}

export function TopRail() {
  const { stage, current, registerChrome, goToMenu, goToLanding, isTransitioning } = useApp();
  const railRef = useCallback((el) => registerChrome('rail', el), [registerChrome]);
  // A light screen is not light everywhere at every size: below md the Location plan
  // docks a dark panel over its own bottom half, so the FOOT of the rail is back on teal
  // while its head is still on paper. The two ends therefore ask separately.
  const wide = useMediaQuery('(min-width: 48rem)');

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
          <div className="flex shrink-0 items-start gap-[1.1em] max-md:gap-[0.7em]">
            {stage === 'section' ? (
              <NavButton
                label="Menu"
                onClick={goToMenu}
                disabled={isTransitioning}
                icon={<MenuIcon size="1em" />}
              />
            ) : null}
            <NavButton
              label="Home"
              onClick={goToLanding}
              disabled={isTransitioning}
              icon={<HomeIcon size="1em" />}
            />
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
