import { useApp } from '../app/appContext';
import { useMediaQuery } from '../hooks/useEventListener';

// The studio's lockup, bottom-right, on every screen.
//
// It ships as white artwork, which is right on teal and invisible on paper — so on a
// light screen (none at present) it inverts to ink rather than
// disappearing. `filter` rather than a second asset: the mark is a flat knockout, so
// inverting it is exact, and a second file would be one more thing to keep in step.
export function StudioMark() {
  const { current } = useApp();
  // Bottom-right, so it asks about the bottom of the screen: below md the Location plan
  // docks a dark panel over its own foot, and the mark is back on teal there.
  const wide = useMediaQuery('(min-width: 48rem)');
  const light = current?.tone === 'light' && wide;

  return (
    <img
      src="/assets/brand/brainwing.webp"
      alt="Brainwing"
      width="420"
      height="112"
      className="pointer-events-none fixed bottom-2 right-2 z-2 w-[5.5rem] transition-[filter,opacity] duration-500
        mob:w-[6.5rem]
        sm:bottom-3 sm:right-3 sm:w-[8rem]
        md:bottom-4 md:right-4 md:w-[9rem]
        lg:bottom-3 lg:right-5 lg:w-[10rem]
        xl:w-[11rem]
        2xl:bottom-4 2xl:right-6 2xl:w-[12rem]
        3xl:bottom-5 3xl:right-8 3xl:w-[13rem]
        4xl:bottom-8 4xl:right-10 4xl:w-[17rem]
        5xl:bottom-12 5xl:right-14 5xl:w-[24rem]
        [@media(max-height:520px)]:w-[5rem]"
      style={{
        filter: light ? 'invert(1)' : 'none',
        opacity: light ? 0.5 : 0.8,
      }}
    />
  );
}
