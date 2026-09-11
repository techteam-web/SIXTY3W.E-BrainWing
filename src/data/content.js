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

// ---------------------------------------------------------------- The Address

export const OVERVIEW = {
  eyebrow: 'The address',
  headline: ['A world of', 'integrated living', 'at 400063'],
  lede: 'The name is the address. Six-three, Western Express Highway, where Goregaon East meets the Aarey green belt.',
  hallmarks: [
    { k: '31', unit: 'storeys', label: 'Residential tower defining the skyline' },
    { k: '3.2', unit: 'm', label: 'Floor-to-floor height in every home' },
    { k: '579', unit: 'sq.ft.', label: '2 BHK RERA carpet, onwards' },
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

// ----------------------------------------------------------------- Residences

export const RESIDENCES = {
  eyebrow: 'Wondrous & exclusive',
  headline: ['Residences'],
  rooms: [
    {
      id: 'lobby',
      render: 'lobby',
      title: 'Entrance Lobby',
      short: 'Lobby',
      caption: 'Where luxury greets you first',
      note: 'Majestic double height',
    },
    {
      id: 'living',
      render: 'living',
      title: 'Living Room',
      short: 'Living',
      caption: 'Where grand spaces define comfort',
      note: 'Floor-to-ceiling views',
    },
    {
      id: 'bedroom',
      render: 'bedroom',
      title: 'Bedroom',
      short: 'Bedroom',
      caption: 'Where every morning feels refreshing',
      note: 'Forest-facing',
    },
    {
      id: 'deck',
      render: 'deck',
      title: 'The Deck',
      short: 'Deck',
      caption: 'Where nature and luxury exist in harmony',
      note: 'Panoramic Aarey vistas',
    },
  ],
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

// ---------------------------------------------------------------- Floor Plans

export const PLANS = {
  eyebrow: 'Well-planned & efficient',
  headline: ['Floor Plans'],
  plates: [
    {
      id: 'low',
      render: 'plan-low',
      title: 'Typical Floor',
      floors: '2nd – 5th · 7th – 10th',
      units: [
        { no: '01', area: '579.00' },
        { no: '02', area: '599.00' },
        { no: '03', area: '599.00' },
        { no: '04', area: '579.00' },
      ],
    },
    {
      id: 'high',
      render: 'plan-high',
      title: 'Typical Floor',
      floors: '11th – 12th · 14th – 19th · 21st – 25th',
      units: [
        { no: '01', area: '634.00' },
        { no: '02', area: '686.00' },
        { no: '03', area: '686.00' },
        { no: '04', area: '634.00' },
      ],
    },
    {
      id: 'amenity',
      render: 'plan-amenity',
      title: 'Euphoria',
      floors: '26th, the amenity level',
      units: [],
    },
  ],
  areaNote: 'RERA carpet area',
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
  eyebrow: 'At a glance',
  headline: ['Specifications'],
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
            'Airy 3.2 m floor-to-floor height',
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
