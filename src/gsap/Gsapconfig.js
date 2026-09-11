// The single GSAP entry point. No component imports from 'gsap' directly — this is the
// only module in src/ allowed to.

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(useGSAP, CustomEase, SplitText, Flip);

// Three eases, and no more. Every one has a long decelerating tail — that is the whole
// difference between "expensive" and "poppy".
CustomEase.create('arch', '0.16, 1, 0.3, 1'); // primary — heavy, decisive
CustomEase.create('archIn', '0.7, 0, 0.84, 0'); // accelerate away
CustomEase.create('archSoft', '0.33, 1, 0.68, 1'); // micro-interactions

export const D = {
  cut: 1.2,
  reveal: 0.9,
  micro: 0.32,
  stagger: 0.06,
};

export const E = {
  out: 'arch',
  in: 'archIn',
  soft: 'archSoft',
};

gsap.defaults({ ease: E.out, duration: D.reveal });

// Read live rather than cached: a visitor can change the OS setting mid-session, and
// the director asks on every transition build.
const RM =
  typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => !!RM?.matches;

// Coarse pointer AND a narrow viewport. Both, because a touchscreen laptop is not a
// phone and a narrow desktop window is not one either.
const PHONE =
  typeof window === 'undefined'
    ? null
    : window.matchMedia('(max-width: 767px), (pointer: coarse) and (max-width: 1024px)');

export const isPhone = () => !!PHONE?.matches;

// Transitions run 25% shorter on a phone. Same mechanisms, same shapes — a gesture that
// reads as considered on a desktop reads as slow on a device you are holding.
export const durationScale = () => (isPhone() ? 0.78 : 1);

// The one thing that genuinely does not survive a mid-range phone: animating a
// full-viewport blur. Every frame is a Gaussian re-raster of the whole layer, and it is
// the single largest source of stutter in an application shaped like this one. The
// director asks before it schedules any blur, and substitutes depth it can composite.
export const canBlur = () => !isPhone();

// A handle on GSAP in development only, so a headless run can assert on the shape of the
// global timeline — how many children it carries and how deeply they nest. Both are
// invariants: a session that has been through the fullscreen gate a dozen times must end
// with the same root timeline as one that has never seen it.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__W63GSAP__ = gsap;
}

export { gsap, useGSAP, CustomEase, SplitText, Flip };
