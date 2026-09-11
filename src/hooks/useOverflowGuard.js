import { useCallback, useRef } from 'react';
import { gsap, useGSAP } from '../gsap/Gsapconfig';
import { useEventListener } from './useEventListener';

// LAW 1 enforcement, in development only. Compiled out of production by the
// import.meta.env.DEV guard.
//
// Two checks, because one is not enough:
//   1. A subtree scan for any real scroll container — LAW 1 forbids them outright,
//      except where a panel opts out with [data-scroll-ok].
//   2. Rect containment of every leaf against the screen rect, which catches
//      absolutely-positioned children that `overflow: hidden` clips silently.
//
// Findings are grouped in the console and pushed to window.__W63__.overflows, so a
// headless viewport sweep can assert on them. Add ?overflow to the URL to outline them.

const TOLERANCE = 1;
// Tight leading means a glyph box routinely stands a few px taller than its line box.
// That is the brand, not a violation.
const LEADING_SLACK = 8;

const OUTLINE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('overflow');

function describe(el) {
  const id = el.id ? `#${el.id}` : '';
  const cls =
    typeof el.className === 'string' && el.className
      ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
      : '';
  return `${el.tagName.toLowerCase()}${id}${cls}`;
}

export function useOverflowGuard(ref, label) {
  const reported = useRef(new Set());

  const check = useCallback(() => {
    if (!import.meta.env.DEV) return;
    const root = ref.current;
    if (!root || !root.isConnected) return;

    // Refuse to measure a screen that is still being transformed. Mid-transition a
    // screen can be at scale(0.02), which makes its own rect tiny; every child then
    // "escapes" it. Those are artefacts of the measurement, not layout faults, and
    // reporting them would train everyone to ignore this guard.
    for (let el = root; el && el !== document.body; el = el.parentElement) {
      const t = getComputedStyle(el).transform;
      if (t && t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)') return;
    }

    const findings = [];
    const b = root.getBoundingClientRect();
    if (!(b.width > 1) || !(b.height > 1)) return;

    for (const el of root.querySelectorAll('*')) {
      if (el.closest('[data-overflow-ok]')) continue;
      if (el.classList.contains('sr-only')) continue;

      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const scrolls = /auto|scroll/.test(style.overflowY) || /auto|scroll/.test(style.overflowX);
      if (scrolls && !el.closest('[data-scroll-ok]')) {
        findings.push({ el, why: 'is a scroll container — LAW 1 forbids scrolling' });
        continue;
      }

      // A truncated label is SUPPOSED to overflow its box — that is what text-overflow
      // does. Reporting it turns the guard into noise on every list in the app.
      if (style.textOverflow === 'ellipsis') continue;

      // scrollHeight > clientHeight only means something on an element that could
      // actually scroll. On an `overflow: visible` box the content simply paints
      // outside and is clipped by the Screen, which is the design.
      const clipped = style.overflow !== 'visible' && style.overflowY !== 'visible';
      if (
        clipped &&
        !scrolls &&
        (el.scrollHeight - el.clientHeight > LEADING_SLACK ||
          el.scrollWidth - el.clientWidth > LEADING_SLACK)
      ) {
        findings.push({
          el,
          why: `content ${el.scrollWidth}×${el.scrollHeight} exceeds box ${el.clientWidth}×${el.clientHeight}`,
        });
        continue;
      }

      // Leaf-level containment. Only leaves, or every ancestor reports the same spill.
      if (el.children.length) continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (![r.left, r.top, r.right, r.bottom].every(Number.isFinite)) continue;
      const over =
        Math.max(0, b.left - r.left) +
        Math.max(0, r.right - b.right) +
        Math.max(0, b.top - r.top) +
        Math.max(0, r.bottom - b.bottom);
      if (over > TOLERANCE && over < Math.max(window.innerWidth, window.innerHeight)) {
        findings.push({ el, why: `escapes the screen rect by ${Math.round(over)}px` });
      }
    }

    const store = (window.__W63__ ??= {});
    store.overflows ??= [];
    if (!findings.length) return;

    const key = `${label}:${findings.length}:${describe(findings[0].el)}`;
    for (const f of findings) {
      if (OUTLINE) f.el.style.outline = '2px solid magenta';
      store.overflows.push({ screen: label, node: describe(f.el), why: f.why });
    }
    if (reported.current.has(key)) return;
    reported.current.add(key);

    console.groupCollapsed(
      `%cLAW 1 — "${label}" has ${findings.length} element(s) outside the viewport`,
      'color:#C8A16B;font-weight:600',
    );
    for (const f of findings) console.warn(describe(f.el), '—', f.why, f.el);
    console.groupEnd();
  }, [ref, label]);

  // Two things make an early check lie: fonts that have not loaded yet change every
  // metric, and a transition in flight leaves elements mid-transform. Wait for both.
  useGSAP(
    () => {
      if (!import.meta.env.DEV) return;
      let waited = 0;
      const settle = () => {
        if (document.documentElement.hasAttribute('data-busy') && waited < 10) {
          waited += 1;
          gsap.delayedCall(0.4, settle);
          return;
        }
        check();
      };
      const start = () => gsap.delayedCall(0.2, settle);
      if (document.fonts?.status === 'loaded') start();
      else document.fonts?.ready.then(start);
    },
    { dependencies: [label] },
  );

  useEventListener('resize', check);
}
