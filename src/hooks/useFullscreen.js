import { useCallback, useRef, useState } from 'react';
import { gsap } from '../gsap/Gsapconfig';
import { useEventListener } from './useEventListener';

// LAW 2 — fullscreen only, re-prompted every time fullscreen is exited, state preserved.
//
// Vendor differences are normalised once at module scope.
const API = (() => {
  const d = typeof document === 'undefined' ? null : document;
  if (!d) return null;
  if ('fullscreenElement' in d) {
    return {
      el: 'fullscreenElement',
      enabled: 'fullscreenEnabled',
      req: 'requestFullscreen',
      exit: 'exitFullscreen',
      change: 'fullscreenchange',
    };
  }
  if ('webkitFullscreenElement' in d) {
    return {
      el: 'webkitFullscreenElement',
      enabled: 'webkitFullscreenEnabled',
      req: 'webkitRequestFullscreen',
      exit: 'webkitExitFullscreen',
      change: 'webkitfullscreenchange',
    };
  }
  return null;
})();

export const fullscreenSupported = !!API && !!document?.[API.enabled];

const NOTE_KEY = 'w63.fsNote';

export function useFullscreen({ onPause, onResume } = {}) {
  // 'native'   — fullscreen is available and in use
  // 'prompt'   — available, currently exited, the gate should show
  // 'fallback' — unavailable or refused; never re-prompt
  const [mode, setMode] = useState(() => (fullscreenSupported ? 'prompt' : 'fallback'));
  const [noteDismissed, setNoteDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(NOTE_KEY) === '1',
  );
  const frozen = useRef(false);
  // A mirror of `mode` readable from an event handler without re-subscribing it.
  const modeRef = useRef(mode);
  const goMode = useCallback((next) => {
    modeRef.current = next;
    setMode(next);
  }, []);

  // THE FREEZE IS gsap.globalTimeline.pause(), AND IT MUST STAY THAT WAY.
  //
  // This used to be gsap.exportRoot(), chosen so that animations created after the
  // freeze — the gate's own entrance — would keep running while everything older stayed
  // still. It worked exactly once. exportRoot() lifts the root's children onto a NEW
  // wrapper timeline and leaves it there; there is no un-export, and resuming the
  // wrapper does not dispose it. The app carries five infinite tweens (the control
  // sheen, the menu ring, the map halo, the Level 26 pulses), so the wrapper's duration
  // is Infinity and GSAP never auto-removes it from the root. The next exit exported
  // THAT wrapper into another one. Measured over four exit/return cycles, the global
  // timeline's nesting depth went 1, 2, 3, 4 and never came back down, and every
  // subsequent transition resolved its playhead through that many re-timed parents.
  //
  // Pausing the root is structural-mutation-free and idempotent: any number of cycles
  // leaves the timeline exactly as it started. The cost is that the gate cannot use GSAP
  // for its own entrance — see FullscreenGate, which animates in CSS for this reason.
  const freeze = useCallback(() => {
    if (frozen.current) return;
    frozen.current = true;
    gsap.globalTimeline.pause();
    document.documentElement.dataset.frozen = 'true';
    onPause?.();
  }, [onPause]);

  const thaw = useCallback(() => {
    if (!frozen.current) return;
    frozen.current = false;
    delete document.documentElement.dataset.frozen;
    gsap.globalTimeline.resume();
    onResume?.();
  }, [onResume]);

  const request = useCallback(async () => {
    if (!fullscreenSupported) {
      setMode('fallback');
      return;
    }
    try {
      await document.documentElement[API.req]({ navigationUI: 'hide' });
      goMode('native');
      thaw();
    } catch {
      // Feature detection is not enough: a permissions-policy-blocked iframe HAS
      // requestFullscreen and rejects at call time. Once here, never re-arm.
      goMode('fallback');
      thaw();
    }
  }, [thaw, goMode]);

  useEventListener(
    API?.change,
    () => {
      if (!API) return;
      if (document[API.el]) {
        goMode('native');
        thaw();
        return;
      }
      // In fallback the gate never opens again, so nothing would ever thaw. Freezing
      // here would strand the application with its global timeline paused and no
      // surface left that could resume it.
      if (modeRef.current === 'fallback') return;
      goMode('prompt');
      freeze();
    },
    () => document,
  );

  const dismissNote = useCallback(() => {
    setNoteDismissed(true);
    try {
      sessionStorage.setItem(NOTE_KEY, '1');
    } catch {
      /* private mode — the note simply shows again next session */
    }
  }, []);

  return {
    mode,
    request,
    supported: fullscreenSupported,
    showNote: mode === 'fallback' && !noteDismissed,
    dismissNote,
  };
}
