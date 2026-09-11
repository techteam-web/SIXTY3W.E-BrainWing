// Seven screens. This is a sales instrument, not a PDF viewer — every screen here is one
// a broker actually stops on and works from, and the brochure's twenty-five pages
// collapse onto them rather than being paged through.
//
// `backdrop` is what the menu's aperture shows when the row is pointed at. `lead` is the
// render the section itself opens with, WITH the `sizes` that section uses for it — the
// preloader needs both halves to warm the file the browser will actually request, and
// warming the wrong width is the same as not warming anything.
//
// `tone: 'light'` means the screen's own ground is paper rather than teal, and the fixed
// top rail has to invert over it: gold is the app's accent because everything else sits
// on a dark ground, and gold on ivory is a 1.9:1 mark nobody can see. No screen is light at
// present — the Location map is drawn in the app's own teal — but the rail and the studio
// mark still honour the flag.
//
// `caption` is the compliance line for that screen. Every render is an artist's
// impression; a map is not, and captioning it as one would be wrong.

export const SECTIONS = [
  {
    id: 'overview',
    no: '01',
    label: 'The Address',
    backdrop: 'tower-night',
    lead: { id: 'tower-night', sizes: '80vw' },
  },
  {
    id: 'residences',
    no: '02',
    label: 'Residences',
    backdrop: 'living',
    lead: { id: 'lobby', sizes: '100vw' },
  },
  {
    id: 'amenities',
    no: '03',
    label: 'Amenities',
    backdrop: 'pool',
    lead: { id: 'pool', sizes: '(max-width: 1024px) 92vw, 52vw' },
  },
  {
    id: 'level-26',
    no: '04',
    label: 'Level 26',
    backdrop: 'level26',
    lead: { id: 'level26', sizes: '(max-width: 1024px) 96vw, 68vw' },
  },
  {
    id: 'plans',
    no: '05',
    label: 'Floor Plans',
    backdrop: 'lobby',
    lead: { id: 'plan-low', sizes: '(max-width: 1024px) 94vw, 64vw' },
  },
  {
    id: 'location',
    no: '06',
    label: 'Location',
    backdrop: 'skyline',
    // No lead render: this screen's ground is the live map, not a picture.
    lead: null,
    caption: 'Map for representation only',
  },
  {
    id: 'specifications',
    no: '07',
    label: 'Specifications',
    backdrop: 'tower-dusk',
    lead: { id: 'tower-dusk', sizes: '100vw' },
  },
];

// What the menu's aperture asks for. Kept beside the table it applies to, so the
// preloader and the aperture can never drift apart.
export const BACKDROP_SIZES = '(max-width: 767px) 62vw, 32vw';

export const SECTION_IDS = SECTIONS.map((s) => s.id);

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

export const sectionIndex = (id) => SECTIONS.findIndex((s) => s.id === id);
