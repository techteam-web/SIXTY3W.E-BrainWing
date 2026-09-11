import { Lockup } from './Lockup';
import { Control } from './Primitives';
import { CloseIcon } from './Icons';
import { GATE } from '../data/content';
import { useApp } from '../app/appContext';
import { INITIAL_TARGET } from '../app/routes';
import { useFullscreen } from '../hooks/useFullscreen';

// The gate is a SIBLING of the frozen layer, never a descendant: `filter` creates a
// containing block for fixed descendants, so a blur on an ancestor would blur the gate
// along with the app it is supposed to sit above.
//
// EVERY animation on this component is CSS, and that is structural rather than stylistic.
// The gate is what appears when the app is frozen, and the freeze is
// gsap.globalTimeline.pause() — so a GSAP tween created here would be created on a paused
// root and would never advance. The entrance lives in base.css, keyed off [data-open].

export function FullscreenGate() {
  const { stage, goToLanding, navigate: go, setPaused } = useApp();

  const { mode, request, showNote, dismissNote } = useFullscreen({
    onPause: () => setPaused(true),
    onResume: () => setPaused(false),
  });

  const first = stage === 'gate';
  const open = mode === 'prompt';

  const onEnter = async () => {
    await request();
    if (!first) return; // a later grant just returns to where we were
    // Honour a deep link. Someone who opened /location asked for the map, not the
    // landing — and the landing's intro would hold the navigation lock for four
    // seconds, so this has to be the first move rather than a follow-up.
    const t = INITIAL_TARGET;
    if (t && t.stage !== 'landing') go(t.section ? t.section : { stage: t.stage });
    else goToLanding();
  };

  if (mode === 'fallback') {
    if (first) {
      // The API is unavailable. Do not trap the visitor behind an unsatisfiable prompt —
      // fall through to a locked 100dvh layout immediately, on the requested page.
      queueMicrotask(() => {
        const t = INITIAL_TARGET;
        if (t && t.stage !== 'landing') go(t.section ? t.section : { stage: t.stage });
        else goToLanding();
      });
    }
    return showNote ? (
      <div className="glass fixed bottom-[var(--screen-margin)] left-1/2 z-200 flex -translate-x-1/2 items-center gap-[1.2em] px-[1.4em] py-[0.8em]">
        <span className="text-caption text-w-cream/85">{GATE.unsupported}</span>
        <button type="button" onClick={dismissNote} aria-label="Dismiss" className="text-w-gold">
          <CloseIcon size="1.1em" />
        </button>
      </div>
    ) : null;
  }

  return (
    <div
      id="gate"
      data-open={open ? 'true' : 'false'}
      role="dialog"
      aria-modal="true"
      aria-label={first ? GATE.enter : GATE.resume}
      className="ground fixed inset-0 z-200 grid place-items-center bg-w-deep"
      style={{
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="relative flex flex-col items-center gap-[2em] px-[var(--screen-margin)]">
        <span data-gate-mark className="relative block">
          <span
            aria-hidden="true"
            data-gate-glow
            className="pointer-events-none absolute -inset-[30%] -z-10 blur-[60px]"
            style={{
              background:
                'radial-gradient(closest-side, rgb(var(--gold-rgb) / 0.5), transparent 72%)',
            }}
          />
          <Lockup
            variant="full"
            className="w-[clamp(11rem,26vw,24rem)] text-w-gold max-md:w-[13rem]"
          />
        </span>

        <span
          data-gate-rule
          aria-hidden="true"
          className="block h-px w-[clamp(4rem,9vw,10rem)] bg-w-gold"
        />

        <span data-gate-eyebrow className="eyebrow text-center text-w-cream/60">
          {GATE.eyebrow}
        </span>

        <span data-gate-cta className="mt-[0.6em] block">
          <Control onClick={onEnter}>{first ? GATE.enter : GATE.resume}</Control>
        </span>
      </div>
    </div>
  );
}
