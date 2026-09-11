// Every place the Location screen can point at, with real coordinates.
//
// The categories mirror the brochure's own list on page 20 — connectivity, commercial,
// malls, education, hospitals, hotels — so the map and the printed sheet answer the same
// questions in the same order. `mins` is the developer's published drive time and is
// quoted as-is; the map's own distance and duration come from OSRM at click time and are
// shown beside it, never instead of it.
//
// `cat: 'node'` entries are orientation, not destinations: they are always drawn, always
// named, and have no row in the list.

export const PROJECT = {
  id: 'sixty3we',
  name: 'SIXTY3W.E.',
  // 400063, Western Express Highway, Goregaon (E) — the address the project is named
  // after. On the brochure's own map it sits on the west side of the highway, between
  // NESCO and the Mrinal Tai Gore flyover.
  lat: 19.1592,
  lng: 72.8534,
};

// The camera opens wide enough to hold Aarey, the highway and the metro line at once —
// which is the whole argument this screen makes. It opens pitched, because a corridor
// seen flat is a diagram and seen in relief is a place.
export const HOME_VIEW = { center: [PROJECT.lng, PROJECT.lat], zoom: 12.7, bearing: 0, pitch: 46 };

export const LANDMARKS = [
  /* ---------------------------------------------------------------- orientation */
  { id: 'aarey', name: 'Aarey Forest', cat: 'node', lat: 19.1668, lng: 72.878 },
  { id: 'weh-node', name: 'Western Express Hwy', cat: 'node', lat: 19.1738, lng: 72.8577 },
  { id: 'jvlr', name: 'JVLR', cat: 'node', lat: 19.1327, lng: 72.8735 },

  /* --------------------------------------------------------------- connectivity */
  { id: 'weh', name: 'Western Express Highway', cat: 'connectivity', mins: 2, lat: 19.1612, lng: 72.8562 },
  { id: 'goregaon-metro', name: 'Goregaon (E) Metro Station', cat: 'connectivity', mins: 3, lat: 19.1656, lng: 72.8582 },
  { id: 'sv-road', name: 'S. V. Road', cat: 'connectivity', mins: 6, lat: 19.164, lng: 72.842 },
  { id: 'goregaon-station', name: 'Goregaon (E) Railway Station', cat: 'connectivity', mins: 6, lat: 19.1648, lng: 72.8494 },
  { id: 'aarey-metro', name: 'Aarey Metro Station', cat: 'connectivity', mins: 5, lat: 19.1751, lng: 72.8592 },

  /* ----------------------------------------------------------------- commercial */
  { id: 'nesco', name: 'NESCO', cat: 'commercial', mins: 2, lat: 19.1552, lng: 72.8548 },
  { id: 'infinity', name: 'Infinity IT Park', cat: 'commercial', mins: 18, lat: 19.1846, lng: 72.8556 },
  { id: 'mindspace', name: 'Mindspace', cat: 'commercial', mins: 25, lat: 19.1745, lng: 72.8375 },

  /* ------------------------------------------------------- malls & entertainment */
  { id: 'hub', name: 'HUB Mall', cat: 'malls', mins: 2, lat: 19.1567, lng: 72.8524 },
  { id: 'oberoi-mall', name: 'Oberoi Mall · PVR', cat: 'malls', mins: 5, lat: 19.1746, lng: 72.857 },
  { id: 'mega-mall', name: 'Mega Mall', cat: 'malls', mins: 10, lat: 19.1476, lng: 72.8339 },
  { id: 'film-city', name: 'Film City', cat: 'malls', mins: 13, lat: 19.1797, lng: 72.8809 },
  { id: 'sky-city', name: 'Oberoi Sky City Mall', cat: 'malls', mins: 15, lat: 19.2199, lng: 72.8617 },
  { id: 'inorbit', name: 'Inorbit Mall', cat: 'malls', mins: 15, lat: 19.1878, lng: 72.8339 },

  /* ------------------------------------------------------------------ education */
  { id: 'gokuldham', name: 'Gokuldham High School & Jr. College', cat: 'education', mins: 5, lat: 19.1691, lng: 72.8622 },
  { id: 'st-pius', name: 'St. Pius College, Aarey Road', cat: 'education', mins: 5, lat: 19.1637, lng: 72.8447 },
  { id: 'oberoi-intl', name: 'Oberoi International School', cat: 'education', mins: 7, lat: 19.1739, lng: 72.856 },
  { id: 'yashodham', name: 'Yashodham School', cat: 'education', mins: 8, lat: 19.1712, lng: 72.8618 },
  { id: 'vibgyor', name: 'Vibgyor High School', cat: 'education', mins: 10, lat: 19.1621, lng: 72.8562 },
  { id: 'ryan', name: 'Ryan International School', cat: 'education', mins: 10, lat: 19.1596, lng: 72.8459 },

  /* ------------------------------------------------------------------ hospitals */
  { id: 'srv', name: 'SRV Hospital', cat: 'hospitals', mins: 7, lat: 19.1607, lng: 72.8497 },
  { id: 'kapadia', name: 'Kapadia Hospital', cat: 'hospitals', mins: 8, lat: 19.1592, lng: 72.8489 },
  { id: 'radhakrishna', name: 'Radhakrishna Hospital', cat: 'hospitals', mins: 11, lat: 19.1624, lng: 72.8462 },
  { id: 'balajee', name: 'Balajee Hospital', cat: 'hospitals', mins: 11, lat: 19.1583, lng: 72.8503 },
  { id: 'lifeline', name: 'Lifeline Medicare Hospital', cat: 'hospitals', mins: 13, lat: 19.1573, lng: 72.8471 },
  { id: 'holy-spirit', name: 'Holy Spirit Hospital', cat: 'hospitals', mins: 13, lat: 19.1238, lng: 72.8508 },

  /* --------------------------------------------------------------------- hotels */
  { id: 'fern', name: 'The Fern', cat: 'hotels', mins: 3, lat: 19.156, lng: 72.8541 },
  { id: 'westin', name: 'Westin Mumbai', cat: 'hotels', mins: 8, lat: 19.1617, lng: 72.8527 },
  { id: 'radisson', name: 'Radisson Mumbai', cat: 'hotels', mins: 11, lat: 19.1583, lng: 72.8481 },
];

export const LANDMARK_BY_ID = Object.fromEntries(LANDMARKS.map((l) => [l.id, l]));

// Orientation is context, not a filterable category: it is always drawn and always named.
export const ALWAYS_ON = new Set(['node']);

// The filter bar, in the brochure's own order.
export const CATEGORIES = [
  { id: 'connectivity', title: 'Connectivity' },
  { id: 'commercial', title: 'Commercial' },
  { id: 'malls', title: 'Malls & Entertainment' },
  { id: 'education', title: 'Education' },
  { id: 'hospitals', title: 'Hospitals' },
  { id: 'hotels', title: 'Hotels' },
];
