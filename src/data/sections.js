// Ten chapters. This is a sales instrument, not a PDF viewer — every screen here is one
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
//
// `backdropFrame` reframes a backdrop inside the aperture, for a render whose subject a
// centred square crop would miss. Percentages of a square box, so it holds at every size
// the aperture takes.

// The menu, in the client's order (Nov 2026), with 360° Views straight after Location.
// Specifications is "What to Expect".
export const SECTIONS = [
  {
    // Coming soon: in the menu at the client's request, not built yet (ComingSoon.jsx).
    id: 'legacy',
    no: '01',
    label: 'Legacy',
    backdrop: 'tower-dusk',
    // Warmed by the preloader, so the transition's arches carry the picture itself.
    lead: { id: 'tower-dusk', sizes: '100vw' },
    soon: true,
  },
  {
    id: 'location',
    no: '02',
    label: 'Location',
    backdrop: 'skyline',
    // No lead render: this screen's ground is the live map, not a picture.
    lead: null,
    caption: 'Map for representation only',
  },
  {
    // Straight after Location, at the client's request.
    id: 'views-360',
    no: '03',
    label: '360° Views',
    backdrop: 'deck',
    // No lead render: this screen's ground is the live panorama, not a picture.
    lead: null,
    caption: 'Interactive 360° tour',
  },
  {
    id: 'overview',
    no: '04',
    label: 'The Address',
    backdrop: 'tower-night',
    // The tower stands 27% of the way across this render, so a centred square crop shows
    // sky. Pinned to the left edge and drawn in 1.35× — the least zoom that brings the
    // tower onto the circle's centre line — with its crown just under the top of the
    // window and its base in the trees.
    backdropFrame: { position: '0% 50%', scale: 1.35, origin: '0% 56%' },
    lead: { id: 'tower-night', sizes: '100vw' },
  },
  {
    // Coming soon: in the menu at the client's request, not built yet (ComingSoon.jsx).
    id: 'master-layout',
    no: '05',
    label: 'Master Layout',
    backdrop: 'level26',
    lead: { id: 'level26', sizes: '100vw' },
    soon: true,
  },
  {
    id: 'residences',
    no: '06',
    label: 'Grand Entrance Lobby',
    backdrop: 'lobby',
    lead: { id: 'lobby', sizes: '100vw' },
  },
  {
    // The amenity level — its 360° gallery of the amenities, under the level's own name.
    id: 'level-26',
    no: '07',
    label: 'Level 26',
    backdrop: 'pool',
    // No lead render: this screen is a gallery of 360° thumbnails, not one picture.
    lead: null,
  },
  {
    id: 'plans',
    no: '08',
    label: 'Floor Plans',
    backdrop: 'lobby',
    // No lead render: this screen's ground is the building elevation, a bundled asset
    // rather than an entry in the render ladder.
    lead: null,
  },
  {
    id: 'apartment',
    no: '09',
    label: 'Apartment',
    backdrop: 'bedroom',
    // No lead render: this screen is a gallery of 360° thumbnails, not one picture.
    lead: null,
    caption: 'Interactive 360° tour',
  },
  {
    // The Specifications sheet, under the client's name for it.
    id: 'specifications',
    no: '10',
    label: 'What to Expect',
    // An interior, not the tower: the sheet is finishes and fittings, and the bedroom is
    // where they show — the flooring, the panelled wall, the full-height glazing.
    backdrop: 'bedroom',
    // No lead render: this screen is three panels on the ground, with no picture behind.
    lead: null,
  },
];

// What the menu's aperture asks for. Kept beside the table it applies to, so the
// preloader and the aperture can never drift apart.
//
// It is the width of the IMAGE, not of the window: a 1.38:1 render covering a circle is
// 1.38 windows wide, and a framed backdrop is drawn larger again (1.35×). The window is
// about 66vh across on a landscape screen and 66% of 114vw on a phone.
export const BACKDROP_SIZES = '(max-width: 767px) 130vw, 72vw';

export const SECTION_IDS = SECTIONS.map((s) => s.id);

export const SECTION_BY_ID = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

export const sectionIndex = (id) => SECTIONS.findIndex((s) => s.id === id);
