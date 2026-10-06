import { useCallback, useRef, useState } from 'react';
import { useApp } from '../app/appContext';
import { useMediaQuery } from '../hooks/useEventListener';
import { SECTIONS } from '../data/sections';
import { gsap, useGSAP, E } from '../gsap/Gsapconfig';
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

// MENU opens the menu page as before, and on hover or focus also drops the sections down
// beneath it — so a visitor already in a section can jump straight to the next one.
function MenuChip({ current, goTo, goToMenu, disabled }) {
  const [open, setOpen] = useState(false);
  const panel = useRef(null);

  useGSAP(
    () => {
      if (!open || !panel.current) return;
      gsap.fromTo(
        panel.current,
        { autoAlpha: 0, y: -8 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: E.out, overwrite: 'auto' },
      );
    },
    { dependencies: [open], scope: panel, revertOnUpdate: false },
  );

  return (
    <div
      className="pointer-events-auto relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <NavButton label="Menu" onClick={goToMenu} disabled={disabled} icon={<MenuIcon size="1em" />} />

      {open ? (
        <div className="absolute left-0 top-full pt-[0.6em]">
          <nav
            ref={panel}
            aria-label="Sections"
            className="w-[clamp(15rem,20vw,19rem)] py-[0.5em]"
            style={{
              background:
                'linear-gradient(168deg, rgb(7 41 40 / 0.96) 0%, rgb(12 59 57 / 0.94) 100%)',
              border: '1px solid rgb(var(--gold-rgb) / 0.34)',
              boxShadow: '0 24px 60px -28px rgb(2 12 11 / 0.85)',
            }}
          >
            <ul>
              {SECTIONS.map((s) => {
                const on = s.id === current?.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-current={on}
                      onClick={() => {
                        setOpen(false);
                        goTo(s.id);
                      }}
                      className="group flex w-full items-baseline gap-[1em] px-[1.1em] py-[0.6em] text-left disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="text-micro tabular-nums tracking-[0.2em] text-w-gold/70">
                        {s.no}
                      </span>
                      <span
                        className={`text-micro uppercase tracking-[0.2em] transition-colors duration-300 ${
                          on ? 'text-w-gold' : 'text-w-cream/80 group-hover:text-w-gold'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

export function TopRail() {
  const {
    stage,
    current,
    registerChrome,
    goTo,
    goToMenu,
    goToLanding,
    isTransitioning,
    immersive,
  } = useApp();
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
            {/* A screen in its own immersive mode (the 360° viewer, so far) owns this
                corner with its own BACK control — MENU/HOME would only compete with it. */}
            {immersive ? null : (
              <>
                {stage === 'section' ? (
                  <MenuChip
                    current={current}
                    goTo={goTo}
                    goToMenu={goToMenu}
                    disabled={isTransitioning}
                  />
                ) : null}
                <NavButton
                  label="Home"
                  onClick={goToLanding}
                  disabled={isTransitioning}
                  icon={<HomeIcon size="1em" />}
                />
              </>
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
