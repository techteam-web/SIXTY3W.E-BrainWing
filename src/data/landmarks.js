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
//
// Coordinates are Google Maps' own pins for each place, taken one by one (Sept 2026)
// after the client's review found several in the wrong place — Google is the map the
// client and their buyers check against. Where a place has a side that matters, the
// point is on THAT side: Goregaon station is its EAST entrance, so the route never
// crosses the tracks to reach it from the west; S. V. Road is the point where the
// Mrinaltai Gore flyover comes down onto it.

export const PROJECT = {
  id: 'sixty3we',
  name: 'SIXTY3W.E.',
  // Sixty3 W.E. Residences, Indira Nagar, Cama Industrial Estate, Goregaon (E) 400063 —
  // on the Western Express Highway, behind HUB Mall. Google Maps' own pin for the project.
  lat: 19.1577063,
  lng: 72.8538494,
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
  { id: 'weh', name: 'Western Express Highway', cat: 'connectivity', mins: 2, lat: 19.1566, lng: 72.8573 },
  // Metro Line 7's Goregaon (East) station, on the highway at HUB Mall and NESCO.
  { id: 'goregaon-metro', name: 'Goregaon (E) Metro Station', cat: 'connectivity', mins: 3, lat: 19.152507, lng: 72.856522 },
  // Where the Mrinaltai Gore flyover lands on S. V. Road.
  { id: 'sv-road', name: 'S. V. Road', cat: 'connectivity', mins: 6, lat: 19.1523151, lng: 72.8445866 },
  // The EAST side — Station Road, Goregaon (E), so the route never crosses the tracks.
  { id: 'goregaon-station', name: 'Goregaon (E) Railway Station', cat: 'connectivity', mins: 6, lat: 19.1652279, lng: 72.8505383 },
  { id: 'aarey-metro', name: 'Aarey Metro Station', cat: 'connectivity', mins: 5, lat: 19.16927, lng: 72.858735 },

  /* ----------------------------------------------------------------- commercial */
  { id: 'nesco', name: 'NESCO', cat: 'commercial', mins: 2, lat: 19.150269, lng: 72.8530249 },
  { id: 'infinity', name: 'Infinity IT Park', cat: 'commercial', mins: 18, lat: 19.1798644, lng: 72.8807167 },
  { id: 'mindspace', name: 'Mindspace', cat: 'commercial', mins: 25, lat: 19.1834447, lng: 72.8324277 },

  /* ------------------------------------------------------- malls & entertainment */
  { id: 'hub', name: 'HUB Mall', cat: 'malls', mins: 2, lat: 19.1547995, lng: 72.8562558 },
  { id: 'oberoi-mall', name: 'Oberoi Mall · PVR', cat: 'malls', mins: 5, lat: 19.173808, lng: 72.8605943 },
  { id: 'mega-mall', name: 'Mega Mall', cat: 'malls', mins: 10, lat: 19.1488696, lng: 72.8329435 },
  { id: 'film-city', name: 'Film City', cat: 'malls', mins: 13, lat: 19.1620094, lng: 72.8779522 },
  { id: 'sky-city', name: 'Oberoi Sky City Mall', cat: 'malls', mins: 15, lat: 19.223302, lng: 72.8642378 },
  { id: 'inorbit', name: 'Inorbit Mall', cat: 'malls', mins: 15, lat: 19.1729281, lng: 72.8359056 },

  /* ------------------------------------------------------------------ education */
  { id: 'gokuldham', name: 'Gokuldham High School & Jr. College', cat: 'education', mins: 5, lat: 19.1736365, lng: 72.8679887 },
  { id: 'st-pius', name: 'St. Pius College, Aarey Road', cat: 'education', mins: 5, lat: 19.1679704, lng: 72.8569886 },
  // The Oberoi Garden City campus, Goregaon (E) — not the JVLR campus.
  { id: 'oberoi-intl', name: 'Oberoi International School', cat: 'education', mins: 7, lat: 19.1690827, lng: 72.8664005 },
  { id: 'yashodham', name: 'Yashodham School', cat: 'education', mins: 8, lat: 19.1733842, lng: 72.8665437 },
  { id: 'vibgyor', name: 'Vibgyor High School', cat: 'education', mins: 10, lat: 19.1594674, lng: 72.8355775 },
  { id: 'ryan', name: 'Ryan International School', cat: 'education', mins: 10, lat: 19.1723453, lng: 72.8730094 },

  /* ------------------------------------------------------------------ hospitals */
  { id: 'srv', name: 'SRV Hospital', cat: 'hospitals', mins: 7, lat: 19.1591367, lng: 72.8491711 },
  { id: 'kapadia', name: 'Kapadia Hospital', cat: 'hospitals', mins: 8, lat: 19.1630706, lng: 72.8434104 },
  { id: 'radhakrishna', name: 'Radhakrishna Hospital', cat: 'hospitals', mins: 11, lat: 19.1728079, lng: 72.8740547 },
  { id: 'balajee', name: 'Balajee Hospital', cat: 'hospitals', mins: 11, lat: 19.1826169, lng: 72.8567513 },
  { id: 'lifeline', name: 'Lifeline Medicare Hospital', cat: 'hospitals', mins: 13, lat: 19.1743581, lng: 72.8446157 },
  { id: 'holy-spirit', name: 'Holy Spirit Hospital', cat: 'hospitals', mins: 13, lat: 19.1273935, lng: 72.8671834 },

  /* --------------------------------------------------------------------- hotels */
  { id: 'fern', name: 'The Fern', cat: 'hotels', mins: 3, lat: 19.1621953, lng: 72.8570176 },
  { id: 'westin', name: 'Westin Mumbai', cat: 'hotels', mins: 8, lat: 19.1728698, lng: 72.860506 },
  { id: 'radisson', name: 'Radisson Mumbai', cat: 'hotels', mins: 11, lat: 19.1733403, lng: 72.8458571 },
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
