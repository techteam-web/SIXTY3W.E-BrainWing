import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

// The only bare useEffect in the codebase.
//
// Every animation goes through useGSAP. A DOM event listener is not an animation, and
// wrapping one in useGSAP would be a lie about what it does. Centralising them here
// means no feature file ever writes a raw effect, and a grep for `useEffect` outside
// this file should return nothing.

export function useEventListener(type, handler, target = window, options) {
  const saved = useRef(handler);
  useEffect(() => {
    saved.current = handler;
  });

  useEffect(() => {
    const el = typeof target === 'function' ? target() : target;
    if (!el?.addEventListener || !type) return;
    const listener = (event) => saved.current?.(event);
    el.addEventListener(type, listener, options);
    return () => el.removeEventListener(type, listener, options);
    // `options` is intentionally not a dependency: callers pass object literals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, target]);
}

// The other non-animation subscription the app needs: a media query.
//
// useSyncExternalStore rather than useState + useEffect, and not for style points: a
// media query IS an external store, and reading it in an effect means the first paint
// renders against a guess and then corrects itself. On a screen that never scrolls, that
// correction is a visible jump in the layout.
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// Deferred, low-priority work — asset preloading, and nothing else. Also not an
// animation, so it lives here with the other non-animation subscriptions.
export function useIdleTask(task, deps = []) {
  const saved = useRef(task);
  useEffect(() => {
    saved.current = task;
  });

  useEffect(() => {
    let dispose;
    const run = () => {
      dispose = saved.current?.();
    };
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(run, { timeout: 1500 })
      : window.setTimeout(run, 500);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      if (typeof dispose === 'function') dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Run an effect when a value changes, skipping the first render. Used to mirror app
// state out to the URL.
export function useOnChange(value, fn) {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  });

  const prev = useRef(value);
  useEffect(() => {
    if (Object.is(prev.current, value)) return;
    const from = prev.current;
    prev.current = value;
    saved.current?.(value, from);
  }, [value]);
}
