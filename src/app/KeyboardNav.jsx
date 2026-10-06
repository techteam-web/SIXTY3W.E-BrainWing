import { useApp } from './appContext';
import { useEventListener } from '../hooks/useEventListener';
import { exportLeads } from './visitor';

// Global keyboard navigation. Screens that own their own keys (Residences, and Floor
// Plans while a floor is focused or its plan is open) handle them locally and stop them
// reaching here.
export function KeyboardNav() {
  const { stage, goToMenu, goToAdjacent } = useApp();

  useEventListener('keydown', (event) => {
    // Ctrl/Cmd + Shift + L: the sales team's export of every visitor captured on this
    // device. Deliberately not on screen — it is a back-office action, not a feature.
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      exportLeads();
      return;
    }
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    if (event.key === 'Escape' && stage === 'section') {
      goToMenu();
    } else if (stage === 'section' && (event.key === 'PageDown' || event.key === 'ArrowDown')) {
      if (goToAdjacent(1)) event.preventDefault();
    } else if (stage === 'section' && (event.key === 'PageUp' || event.key === 'ArrowUp')) {
      if (goToAdjacent(-1)) event.preventDefault();
    }
  });

  return null;
}
