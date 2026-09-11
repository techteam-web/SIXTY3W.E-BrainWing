import { useApp } from './appContext';
import { useIdleTask } from '../hooks/useEventListener';
import { SECTIONS, BACKDROP_SIZES } from '../data/sections';
import { getRender } from '../data/renders';

// The application never scrolls and never spins: a render that has not arrived by the
// time the arches land is a hole in the page — and worse, the arch panels CLONE the
// destination, so an unloaded render is a hole photographed three times.
//
// So while the visitor is reading the landing, the browser quietly fetches what the menu
// will show and then what each section opens with. Two rules make it actually useful:
//
//   1. requestIdleCallback, not an effect on mount. This must never compete with the
//      landing's own render or with the intro's first frames.
//   2. It warms through a real <img> carrying the same srcset AND the same `sizes` the
//      screen will use, so the browser's own selection picks the identical file. Warming
//      "the render" at some other width fills the cache with bytes nothing asks for and
//      leaves the real request cold — which looks exactly like no preloading at all.

const warm = (id, sizes, out) => {
  const r = getRender(id);
  if (!r) return;
  const img = new Image();
  img.decoding = 'async';
  img.fetchPriority = 'low';
  img.sizes = sizes;
  img.srcset = r.srcSet;
  img.src = r.src;
  out.push(img);
};

export function Preloader() {
  const { stage } = useApp();

  useIdleTask(() => {
    if (stage === 'gate') return undefined;
    const held = [];
    // The menu first — it is one click away and shows all seven at aperture size.
    for (const s of SECTIONS) warm(s.backdrop, BACKDROP_SIZES, held);
    // Then what each section opens with, at the size that section asks for.
    for (const s of SECTIONS) if (s.lead) warm(s.lead.id, s.lead.sizes, held);
    // Dropping the references is enough — the HTTP cache keeps the bytes.
    return () => held.splice(0, held.length);
  }, [stage]);

  return null;
}
