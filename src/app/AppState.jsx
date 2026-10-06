import { useMemo, useState } from 'react';

import { useTransition } from '../gsap/useTransition';
import { AppContext } from './appContext';
import { SECTIONS, SECTION_BY_ID, sectionIndex } from '../data/sections';

export function AppStateProvider({ children }) {
  const t = useTransition({ stage: 'gate' });
  const { view, navigate } = t;
  // Set by a screen that wants the rail's MENU/HOME pair gone while it's open — the
  // pano viewer, so far. BACK stays: it's owned by the screen itself, not the rail.
  const [immersive, setImmersive] = useState(false);

  const value = useMemo(() => {
    const current = view.section ? SECTION_BY_ID[view.section] : null;

    return {
      ...t,

      stage: view.stage,
      section: view.section,
      prevSection: view.prevSection,
      current,
      renderList: view.renderList,
      immersive,
      setImmersive,

      goTo: (sectionId, opts) => navigate(sectionId, opts),
      goToMenu: () => navigate({ stage: 'menu' }),
      goToLanding: () => navigate({ stage: 'landing' }),

      // Adjacent-section movement, used by keyboard nav. Stops at the ends rather than
      // wrapping — a list that loops silently is a list you get lost in.
      goToAdjacent: (delta) => {
        if (view.stage !== 'section') return false;
        const next = SECTIONS[sectionIndex(view.section) + delta];
        return next ? navigate(next.id) : false;
      },
    };
  }, [t, view, navigate, immersive]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
