// Every word in the application. It all comes from the brochure, and there is not much
// of it on purpose: a sales tool that makes you read is a sales tool nobody uses. The
// renders carry the argument; the copy names what you are looking at.

export const PROJECT = {
  name: 'SIXTY3W.E.',
  kind: 'Residences',
  place: 'Goregaon (E)',
  rera: 'MahaRERA PM1180002500670',
  reraUrl: 'https://maharera.maharashtra.gov.in',
  phone: '+91 80888 13333',
  site: 'www.sixty3we-residential.com',
};

export const GATE = {
  eyebrow: 'A world of exclusive lifestyle',
  enter: 'Enter',
  resume: 'Resume',
  unsupported: 'Fullscreen is unavailable here. The presentation will run in the window.',
};

export const LANDING = {
  eyebrow: 'A world of exclusive lifestyle',
  headline: ['Homes with', 'awe-inspiring', 'forest & city views'],
  meta: '400063 · Western Express Highway',
  enter: 'Enter',
  note: 'Artist’s impression. Images, plans and specifications are indicative and subject to approval of the respective authorities.',
};

export const MENU = {
  eyebrow: 'Contents',
};

// ---------------------------------------------------------------- The visitor

// The details card that opens on the way in. Name and mobile only — the microsite's own
// enquiry form asks for the same two, and a site-office visitor will not type more.
export const VISITOR = {
  eyebrow: 'Welcome',
  title: 'Before we begin',
  lede: 'Share your name and number so our team can send you the details you see today.',
  name: 'Full name',
  phone: 'Mobile number',
  submit: 'Continue',
  skip: 'Skip for now',
  consent: 'I agree to get updates via SMS, RCS & WhatsApp.',
  greeting: (name) => `Welcome, ${name}`,
};

// ---------------------------------------------------------------- The Address

// -------------------------------------------------------------------- Legacy

// Chapter 01: who built it. Every figure, name and place is off the presenter brochure
// (AGM_RESI_PRESENTER_A3): the four-number band on its portfolio spread, and the
// twenty-four completed buildings on the spread before it. Nothing is estimated here.
//
// The twenty-four are not printed on the page. They are behind it: the chapter leads
// with the COUNT, inside the brand's own arch, and the arch opens onto every building,
// grouped by where it stands. A name a visitor has never heard proves nothing on its
// own; the same name among six others in one suburb says the developer has been building
// there for years.
//
// One correction only: the brochure spells the same suburb "Bhayander" seven times and
// "Bhayandar" twice. The majority spelling is used throughout.
export const LEGACY = {
  eyebrow: 'Forty years in the making',
  headline: ['Legacy'],
  houses: ['AGM Group', 'Vijaylaxmi Realty'],
  lede: 'Built by AGM Group and Vijaylaxmi Realty — four decades of work across the Mumbai region, Pune and Jodhpur, and four thousand homes already lived in.',

  // The arch: the count, and what pressing it opens.
  arch: {
    k: '24',
    unit: '+',
    label: 'Completed projects',
    cta: 'See every one',
  },

  // The four figures that flank it, in the brochure's own order. `k` counts up; `unit`
  // does not.
  figures: [
    { k: '40', unit: '+ years', label: 'Of combined experience' },
    { k: '2', unit: 'mn sq.ft.', label: 'Built and handed over' },
    { k: '4000', unit: '+', label: 'Happy homes' },
    { k: '40', unit: 'lac sq.ft.', label: 'Of land bank' },
  ],

  // The three buildings the presenter package carries photographs of, which the arch
  // cycles through. Each is also pinned to its own name in the list below.
  // Since Nov 2026: the four photographs on the presenter PDF's Completed Projects
  // spread (page 2), in its order.
  plates: [
    { id: 'legacy-c-93east', name: '93 East', place: 'Andheri East', position: '34% 50%' },
    { id: 'legacy-c-at', name: 'AT', place: 'Andheri East' },
    { id: 'legacy-c-inizio', name: 'Inizio', place: 'Andheri East' },
    { id: 'legacy-c-windermere', name: 'Windermere', place: 'Bhayander West' },
  ],

  // The presenter PDF's Ongoing & Upcoming spread (page 3), shown at the head of the
  // showcase.
  ongoing: {
    title: 'Ongoing & Upcoming',
    headline: ['Four buildings,', 'in the making'],
    items: [
      { id: 'legacy-o-residential', name: 'Sixty3 W.E. Residential', place: 'Goregaon East', status: 'Ongoing' },
      { id: 'legacy-o-bizpark', name: 'Sixty3 W.E. Bizpark', place: 'Goregaon East', status: 'Ongoing' },
      { id: 'legacy-o-wiz', name: 'WIZ', place: 'Goregaon East', status: 'Upcoming' },
      { id: 'legacy-o-soon', name: 'Coming Soon', place: 'Andheri East', status: 'Upcoming' },
    ],
  },

  // The showcase's own words.
  showcase: {
    eyebrow: 'Completed projects',
    headline: ['Twenty-four buildings,', 'ten places'],
    close: 'Back',
  },

  // Twenty-four completed buildings, read down the brochure's four columns in turn. The
  // showcase groups them by `place` and orders the groups by size.
  completed: [
    { name: '93 East', place: 'Andheri East' },
    { name: 'Vu Imperia', place: 'Virar' },
    { name: 'Swapnapoorti', place: 'Jogeshwari East' },
    { name: 'Vijaylaxmi Bliss', place: 'Andheri East' },
    { name: 'Skyline', place: 'Bhayander West' },
    { name: 'Raj Deep', place: 'Vile Parle West' },
    { name: 'AT', place: 'Andheri East' },
    { name: 'Span Signature', place: 'Bhayander West' },
    { name: 'Sai Elegance', place: 'Andheri East' },
    { name: 'River Residency', place: 'Pune' },
    { name: 'Raj Classic', place: 'Bhayander East' },
    { name: 'Span Valencia', place: 'Bhayander East' },
    { name: 'Inizio', place: 'Andheri East' },
    { name: 'The Vinayak', place: 'Goregaon East' },
    { name: 'Span Exitoca', place: 'Bhayander West' },
    { name: 'Vijaylaxmi Heights', place: 'Jodhpur' },
    { name: 'Raj Pushp', place: 'Vile Parle East' },
    { name: 'Span Heights', place: 'Bhayander West' },
    { name: 'Windermere', place: 'Bhayander West' },
    { name: 'Vijaylaxmi Platinum', place: 'Jodhpur' },
    { name: 'Span Excellency', place: 'Bhayander West' },
    { name: 'Raj Mohan', place: 'Vile Parle East' },
    { name: 'Raj Vastu', place: 'Vile Parle West' },
    { name: 'Span Duplex', place: 'Bhayander West' },
  ],
};

export const OVERVIEW = {
  eyebrow: 'The address',
  headline: ['A world of', 'integrated living', 'at 400063'],
  // The name, explained exactly as the project's own microsite explains it: W.E. is
  // Wonderful living, Exclusive lifestyle. Verbatim — do not paraphrase.
  name: [
    { initial: 'W', rest: 'onderful Living,' },
    { initial: 'E', rest: 'xclusive Lifestyle' },
  ],
  // lede: "At Sixty3 W.E. Residences, luxury living is redefined. Wake up to breathtaking views where the morning light dances across premium finishes, and nature's charm flows effortlessly into your living space. Thoughtfully designed with airy layouts and floor-to-ceiling views, your home is a sanctuary that embraces the sky, the greens, and the city in perfect harmony.",
  // The two outlooks the tower is sold on.
  views: [
    { id: 'aarey', title: 'Aarey Views', label: 'Panoramic green vistas over the Aarey forest' },
    { id: 'city', title: 'City Views', label: 'The Goregaon skyline and the W.E. Highway' },
  ],
  hallmarks: [
    { k: '31', unit: 'storeys', label: 'Residential tower defining the skyline' },
    { k: '10.5', unit: 'ft', label: 'Floor-to-floor height in every home' },
    { k: '574', unit: 'sq.ft.', label: '2 BHK RERA carpet, onwards' },
    { k: '26', unit: 'th floor', label: 'Euphoria, the lifestyle level' },
  ],
  marks: [
    'Majestic double-height entrance lobby',
    'Decks with panoramic Aarey vistas',
    'Vastu-compliant homes',
    'High-speed elevators',
    'Dedicated parking tower with valet',
    'Right next to the W.E. Highway',
  ],
};

// -------------------------------------------------------------- 360° Views
// The vantage points themselves — which scene id to load, day and night — live in
// src/data/panoViews.js, because the viewer reads that table and this file is only
// ever read by the screen.

export const PANORAMA = {
  eyebrow: 'Step inside',
  headline: ['360°', 'Views'],
  lede: 'Look around the tower as it stands today — by day and by night.',
};

// ----------------------------------------------------------------- Residences

export const RESIDENCES = {
  eyebrow: 'Wondrous & exclusive',
  headline: ['Residences'],
  // One room, by the client's call: the lobby is the arrival, and the arrival is the
  // whole argument of this screen. The living room, bedroom and deck plates were cut —
  // their renders stay in the ladder, because other screens still use them as backdrops.
  rooms: [
    {
      id: 'lobby',
      render: 'lobby',
      title: 'Grand Entrance Lobby',
      short: 'Lobby',
      // What the lobby is sold on, as the client listed it. Set as a four-column
      // specification band under the title; it says "double-height" itself, so the
      // room carries no separate note.
      features: [
        'Fully air-conditioned, double-height entrance lobby',
        'Premium Italian marble finishes',
        'Dedicated seating zone',
        '24/7 concierge service',
      ],
    },
  ],
};

// ------------------------------------------------------------------ Apartment

// The sample 2 BHK, walked in 360°. Descriptive only — which unit it was rendered from
// isn't stated, so no area is claimed for it.
export const APARTMENT = {
  eyebrow: 'Sample residence',
  headline: ['Walk through', 'a 2 BHK home'],
  lede: 'A two-bedroom residence in 360°, room to room — the living room, kitchen, both bedrooms and the balcony.',
  start: 'Start 360° Tour',
};

// ------------------------------------------------------------------ Amenities

export const AMENITIES = {
  eyebrow: 'Wonderful & exciting',
  headline: ['Euphoria'],
  lede: 'Eighteen amenities, one floor, twenty-six storeys up.',
  items: [
    { id: 'pool', render: 'pool', title: 'Infinity Pool', caption: 'Soak your senses in azure bliss' },
    { id: 'fitness', render: 'fitness', title: 'Fitness Centre', caption: 'Where strength meets sophistication' },
    { id: 'games', render: 'games', title: 'Games Room', caption: 'Indulge in a friendly game or two' },
    { id: 'yoga', render: 'yoga', title: 'Yoga & Pilates', caption: 'Find your zen with breathtaking views' },
    { id: 'library', render: 'library', title: 'Reading Nook', caption: 'Discover a sanctuary for the curious' },
    { id: 'cinema', render: 'cinema', title: 'Outdoor Cinema', caption: 'Immerse in the magic of frames' },
    { id: 'toddlers', render: 'toddlers', title: 'Toddlers Room', caption: 'A joyful wonderland for little ones' },
    { id: 'kids', render: 'kids', title: 'Kids Play Area', caption: 'The beautiful gift called childhood' },
    { id: 'bonsai', render: 'bonsai', title: 'Bonsai Garden', caption: 'Cherish the quiet vibe of plants' },
    { id: 'zen', render: 'zen', title: 'Zen Rock Garden', caption: 'Pause a moment amidst the hustle' },
  ],
};

// ------------------------------------------------------------------- Level 26
// The eighteen amenities and where each one sits on the deck. The u/v pairs are
// normalised coordinates on the level26 render, lifted from the brochure's own callout
// dots — see the derivation note in scripts/. Nothing here was placed by eye.

export const LEVEL26 = {
  eyebrow: 'Level 26',
  headline: ['A planned masterpiece', 'for elevated living'],
  spots: [
    { n: 1, name: 'Fitness Centre', u: 0.4157, v: 0.1949 },
    { n: 2, name: 'Yoga & Pilates Studio', u: 0.2962, v: 0.2593 },
    { n: 3, name: 'Speakeasy Lounge', u: 0.2836, v: 0.3946 },
    { n: 4, name: 'Reading Nook', u: 0.324, v: 0.4229 },
    { n: 5, name: 'Toddlers Room', u: 0.3063, v: 0.4725 },
    { n: 6, name: 'Climbing Wall for Kids', u: 0.2593, v: 0.516 },
    { n: 7, name: 'Interactive Art Wall', u: 0.3968, v: 0.5616 },
    { n: 8, name: 'Soft Turf with Play Panels', u: 0.4068, v: 0.6279 },
    { n: 9, name: 'Musical Play Wall', u: 0.426, v: 0.611 },
    { n: 10, name: 'Infinity Pool', u: 0.5353, v: 0.6398 },
    { n: 11, name: 'Sun Deck with Lounge Beds', u: 0.6123, v: 0.564 },
    { n: 12, name: 'Outdoor Shower Zone', u: 0.6397, v: 0.5168 },
    { n: 13, name: 'Cabana Seating & Hammocks', u: 0.5949, v: 0.5207 },
    { n: 14, name: 'Aromatic Herb Garden', u: 0.5637, v: 0.5 },
    { n: 15, name: 'Bonsai Garden', u: 0.5606, v: 0.4619 },
    { n: 16, name: 'Outdoor Cinema', u: 0.476, v: 0.4445 },
    { n: 17, name: 'Zen Rock Garden', u: 0.5761, v: 0.3377 },
    { n: 18, name: 'Games Room', u: 0.6041, v: 0.2184 },
  ],
};

// ------------------------------------------------------------------- Location

// The places themselves — coordinates, categories and the developer's published drive
// times — live in src/data/landmarks.js, because the map reads them and this file is
// only ever read by the screens. Two copies of that table is one too many.
export const LOCATION = {
  eyebrow: 'Goregaon East',
  headline: ['Where else can', 'you have it all'],
  lede: 'A dynamic Mumbai hub with top schools, business districts and retail, plus green pockets like Aarey that give the city back its air.',
};

// ------------------------------------------------------------- Specifications

export const SPECS = {
  // The sheet is the menu's "What to Expect" (Nov 2026): the specifications, renamed.
  eyebrow: 'Specifications',
  headline: ['What to Expect'],
  columns: [
    {
      id: 'hallmarks',
      title: 'Project Hallmarks',
      groups: [
        {
          items: [
            'An iconic 31-storey residential tower',
            'A lavish grand entrance lobby with a refined waiting lounge',
            'Well-planned 2 BHK residences from 579 sq. ft. onwards',
            'A dedicated parking tower with professional valet services',
            'Prime location right next to the W.E. Highway',
            'Airy 3.2 mtr floor-to-floor height',
          ],
        },
        {
          title: 'Building & Safety',
          items: [
            'High-speed elevators: 3 passenger lifts and 1 fire evacuation lift',
            '24×7 manned security with CCTV vigilance',
            'Next-generation fire-fighting systems',
            'Earthquake-resistant RCC structure',
            'Vastu-optimised layouts',
            'Video door phone in every home',
          ],
        },
      ],
    },
    {
      id: 'interiors',
      title: 'Internal Finishes',
      groups: [
        {
          title: 'Flooring',
          items: [
            'Living spaces: large-format vitrified tiles, anti-skid in utility and balcony',
            'Bathrooms: anti-skid ceramic tiles with dado to lintel height',
            'Kitchen: vitrified / ceramic tiles with dado above counter',
          ],
        },
        {
          title: 'Doors & Windows',
          items: [
            'Main door: solid teakwood / 1-hr FRD-rated flush door with digital lock',
            'Internal doors: premium laminated flush doors with SS hardware',
            'Powder-coated aluminium / uPVC sliding windows',
          ],
        },
        {
          title: 'Kitchen & Bath',
          items: [
            'Granite platform with stainless steel sink',
            'Modular cabinetry with soft-close fittings',
            'Designer sanitaryware and premium CP fittings',
          ],
        },
      ],
    },
    {
      id: 'services',
      title: 'Services',
      groups: [
        {
          title: 'Electricals',
          items: [
            'Modular switches: Legrand / Schneider',
            'Concealed copper wiring',
            'AC points in the living room and all bedrooms',
            'DTH and high-speed internet provisions',
          ],
        },
        {
          title: 'Utilities',
          items: [
            '24×7 DG backup for common areas, limited in residences',
            'Sewage treatment plant and rainwater harvesting',
            'Multi-level automated tower car parking',
          ],
        },
        {
          title: 'Common Areas',
          items: [
            'Opulent double-height entrance lobby',
            'Lift lobbies on every floor with vitrified / marble flooring and wall cladding',
          ],
        },
      ],
    },
  ],
};

export const DISCLAIMER =
  'The images, plans, elevations, designs and specifications are indicative and subject to the approval of the respective authorities. The developers reserve the right to change specifications or features without notice. This document does not constitute an offer or contract of any type.';
