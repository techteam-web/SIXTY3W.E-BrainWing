import { Screen } from '../../layout/Screen';
import { Render } from '../../components/Primitives';
import { SectionHead } from './SectionHead';
import { SECTION_BY_ID } from '../../data/sections';

// A chapter that is in the menu but not built yet (Legacy, Master Layout): its own
// picture, deep in shade, and its name over "Coming soon". The same header as every
// other section, so the director animates it like one; data-ring-focus gives the page
// transition's ring a subject to open around.

export function comingSoon(id) {
  const section = SECTION_BY_ID[id];

  function ComingSoonScreen() {
    return (
      <Screen id={id} padded={false}>
        {section.backdrop ? (
          <div data-ring-focus className="absolute inset-0">
            {/* Eager, and warmed by the preloader (the section's `lead`): the arches
                carry a copy of this screen, and a lazy picture is blank in the copy. */}
            <Render id={section.backdrop} sizes="100vw" priority />
          </div>
        ) : null}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgb(4 26 25 / 0.92) 0%, rgb(4 26 25 / 0.78) 45%, rgb(4 26 25 / 0.5) 100%)',
          }}
        />

        <div className="screen-inset relative z-10 flex h-full flex-col justify-center">
          <SectionHead eyebrow={`Chapter ${section.no}`} headline={[section.label]} />
          <div data-stagger className="mt-[clamp(1.2rem,3vh,2.2rem)] flex items-center gap-[0.9em]">
            <span aria-hidden="true" className="h-px w-[clamp(1.6rem,3.4vw,3.6rem)] bg-w-gold" />
            <span className="text-subhead uppercase tracking-[0.3em] text-w-gold">Coming soon</span>
          </div>
        </div>
      </Screen>
    );
  }
  ComingSoonScreen.displayName = `ComingSoon(${id})`;
  return ComingSoonScreen;
}
