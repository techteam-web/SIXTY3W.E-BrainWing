// A MapLibre style for Goregaon East, drawn in the application's own palette.
//
// Every colour below comes off the same tokens as the rest of the app (theme.css): the
// ground is the brand teal, the road network climbs from muted teal into gold for the
// trunk roads and the Western Express Highway, labels are cream and champagne, and Aarey is
// the one place the teal is allowed to lean green — it is the largest thing this project
// sells. The Location panel, the rail and the markers therefore sit on the same ground
// they sit on on every other screen, and the map reads as part of the application rather
// than as a basemap with a card stuck to it.
//
// Two earlier palettes missed in opposite directions. A near-black night map (land
// #07211f, sea #03110f, bronze roads #6b5433) was darker and dirtier than the brand it was
// meant to carry. An ivory plan sampled off page 20 matched the printed page and nothing
// on screen — cool greys and mint green around a teal card. This one is brighter than the
// first and belongs to the app, unlike the second.
//
// This file decides COLOUR only. The camera and the building massing are set in
// EstateMap.jsx and are deliberately not governed by the brochure.
//
// Tiles: MapTiler when VITE_MAPTILER_KEY is set, otherwise OpenFreeMap's free, keyless
// planet tiles. Both speak the OpenMapTiles schema, so every layer below is identical
// either way and the app works with no signup and no key in the repo.

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY ?? '';

const TILES = MAPTILER_KEY
  ? `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`
  : 'https://tiles.openfreemap.org/planet';

const GLYPHS = MAPTILER_KEY
  ? `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${MAPTILER_KEY}`
  : 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

// Both providers serve the Noto stacks, so this is the one font name that resolves on
// either. A stack neither provider has means every label silently disappears.
const FONT = ['Noto Sans Regular'];
const FONT_BOLD = ['Noto Sans Bold'];

// The app's tokens, carried down one hue line from the water up to the highway.
export const MAP = {
  ground: '#0c3b39', // --color-w-teal
  built: '#0f4341',
  industrial: '#0e3f3d',
  green: '#0f453e',
  greenDeep: '#104c3d',
  water: '#072928', // --color-w-deep
  waterLine: '#1f5a55',
  casing: '#093432',
  roadMinor: '#1b5552',
  road: '#28625b',
  arterial: '#4f877c',
  motorway: '#c8a16b', // --color-w-gold
  rail: '#6f978c',
  building: '#12484b',
  labelPlace: '#f0eae0', // --color-w-cream
  labelRoad: '#c9bfa6',
  labelWater: '#6f9e98',
  halo: '#072928',
};

// Road widths are the one thing that has to scale smoothly across nine zoom levels, so
// every road layer is built from this rather than hand-tuned per class.
const width = (stops) => ['interpolate', ['exponential', 1.5], ['zoom'], ...stops.flat()];

const CLASS = (...values) => ['match', ['get', 'class'], values, true, false];

export const buildMapStyle = () => ({
  version: 8,
  name: 'SIXTY3W.E. — Goregaon East',
  glyphs: GLYPHS,
  sources: {
    omt: { type: 'vector', url: TILES },
  },
  // A low, near-neutral sun from the north-west, so the extruded blocks read as volumes.
  // Not a warm one: a gold light mixed into teal faces comes out OLIVE, which is exactly
  // what the first version of this palette did. Intensity stays near the floor as well —
  // MapLibre's extrusion light BRIGHTENS what it hits, and at the default 0.5 a teal city
  // comes back as pale clay.
  light: { anchor: 'viewport', color: '#f4f1ea', intensity: 0.18, position: [1.4, 210, 42] },
  layers: [
    // Land is the ground: OpenMapTiles ships no landmass polygon, so the background IS
    // the ground and water is painted over it. Getting this the wrong way round leaves an
    // entirely blank map, with no error to explain it.
    { id: 'land', type: 'background', paint: { 'background-color': MAP.ground } },

    /* ------------------------------------------------------------- ground cover */

    // Built-up land, one whisper above the ground. It is most of what makes the sheet
    // read as a city rather than as an empty page at the wide zooms.
    {
      id: 'landuse-built',
      type: 'fill',
      source: 'omt',
      'source-layer': 'landuse',
      filter: CLASS('residential', 'commercial', 'retail', 'neighbourhood', 'suburb'),
      paint: { 'fill-color': MAP.built },
    },
    {
      id: 'landuse-industrial',
      type: 'fill',
      source: 'omt',
      'source-layer': 'landuse',
      filter: CLASS('industrial', 'railway', 'quarry'),
      paint: { 'fill-color': MAP.industrial },
    },
    {
      id: 'landcover',
      type: 'fill',
      source: 'omt',
      'source-layer': 'landcover',
      filter: CLASS('wood', 'grass', 'scrub', 'farmland'),
      paint: { 'fill-color': MAP.green },
    },
    // Aarey. The reason this project has a view, and the one place the teal is
    // allowed to lean green.
    {
      id: 'green',
      type: 'fill',
      source: 'omt',
      'source-layer': 'park',
      paint: { 'fill-color': MAP.greenDeep },
    },

    /* -------------------------------------------------------------------- water */

    {
      id: 'water',
      type: 'fill',
      source: 'omt',
      'source-layer': 'water',
      paint: { 'fill-color': MAP.water },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'omt',
      'source-layer': 'waterway',
      minzoom: 11,
      paint: { 'line-color': MAP.waterLine, 'line-width': width([[11, 0.6], [16, 3]]) },
    },
    {
      id: 'coastline',
      type: 'line',
      source: 'omt',
      'source-layer': 'water',
      paint: { 'line-color': MAP.waterLine, 'line-width': width([[8, 0.5], [14, 1.2]]) },
    },

    /* --------------------------------------------------------------------- roads
       Casings a step darker than the ground: on a dark map a casing's job is to cut one
       road cleanly out of the road it crosses, so junctions stay legible at every zoom. */

    {
      id: 'road-minor-casing',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      minzoom: 13,
      filter: CLASS('minor', 'service', 'track'),
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': MAP.casing, 'line-width': width([[13, 1.6], [18, 9]]) },
    },
    {
      id: 'road-secondary-casing',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      minzoom: 10,
      filter: CLASS('secondary', 'tertiary'),
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': MAP.casing, 'line-width': width([[10, 2], [18, 15]]) },
    },
    {
      id: 'road-major-casing',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: CLASS('motorway', 'trunk', 'primary'),
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': MAP.casing, 'line-width': width([[8, 2.4], [12, 5.6], [18, 24]]) },
    },

    {
      id: 'road-minor',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      minzoom: 13,
      filter: CLASS('minor', 'service', 'track'),
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': MAP.roadMinor,
        'line-width': width([[13, 0.6], [18, 6]]),
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.5, 15, 1],
      },
    },
    {
      id: 'road-tertiary',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      minzoom: 10,
      filter: CLASS('tertiary'),
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': MAP.road, 'line-width': width([[10, 0.6], [14, 2], [18, 9]]) },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      minzoom: 9,
      filter: CLASS('secondary'),
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': MAP.road, 'line-width': width([[9, 0.8], [14, 2.6], [18, 12]]) },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: CLASS('primary', 'trunk'),
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        // Trunk roads take the highway's gold; ordinary arterials stay in the teal range,
        // so gold marks the spine of the network rather than every main road in it.
        'line-color': ['match', ['get', 'class'], 'trunk', MAP.motorway, MAP.arterial],
        'line-width': width([[8, 1], [12, 2.8], [18, 16]]),
      },
    },
    // The Western Express Highway is the address, so it is the widest thing the basemap
    // draws, and it is drawn in gold with the trunk roads; ordinary arterials stay teal.
    {
      id: 'road-motorway',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: CLASS('motorway'),
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': MAP.motorway, 'line-width': width([[7, 1.6], [12, 4.6], [18, 22]]) },
    },
    // Metro Line 7 runs the length of the highway, and the walk to it is half the pitch.
    // Dashed, as the brochure draws it.
    {
      id: 'rail',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      minzoom: 10,
      filter: CLASS('rail', 'transit'),
      paint: {
        'line-color': MAP.rail,
        'line-width': width([[10, 0.7], [16, 2.2]]),
        'line-dasharray': [3, 2.2],
        'line-opacity': 0.5,
      },
    },

    /* ---------------------------------------------------------------- buildings
       Extruded, in the ground's teal a step lifted. `vertical-gradient` shades the sides
       away from the roofs, which is what gives each block its edge against the ground. */

    {
      id: 'building-3d',
      type: 'fill-extrusion',
      source: 'omt',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': MAP.building,
        'fill-extrusion-height': ['get', 'render_height'],
        'fill-extrusion-base': ['get', 'render_min_height'],
        'fill-extrusion-vertical-gradient': true,
        'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.2, 0.94],
      },
    },

    /* ------------------------------------------------------------------- labels
       Restrained on purpose: settlements, water, and named roads from 13.5 in. POIs would
       compete with the landmark labels, which are the ones that matter here. */

    {
      id: 'label-road',
      type: 'symbol',
      source: 'omt',
      'source-layer': 'transportation_name',
      minzoom: 13.5,
      filter: CLASS('motorway', 'trunk', 'primary', 'secondary'),
      layout: {
        'symbol-placement': 'line',
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        'text-font': FONT,
        'text-size': ['interpolate', ['linear'], ['zoom'], 13.5, 9.5, 18, 13],
        'text-letter-spacing': 0.05,
      },
      paint: {
        'text-color': MAP.labelRoad,
        'text-halo-color': MAP.halo,
        'text-halo-width': 1.4,
      },
    },
    {
      id: 'label-water',
      type: 'symbol',
      source: 'omt',
      'source-layer': 'water_name',
      minzoom: 9,
      layout: {
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        'text-font': FONT,
        'text-size': ['interpolate', ['linear'], ['zoom'], 9, 10, 14, 13],
        'text-letter-spacing': 0.22,
        'text-transform': 'uppercase',
        'text-max-width': 7,
      },
      paint: {
        'text-color': MAP.labelWater,
        'text-halo-color': MAP.water,
        'text-halo-width': 1.2,
      },
    },
    {
      id: 'label-place',
      type: 'symbol',
      source: 'omt',
      'source-layer': 'place',
      filter: CLASS('city', 'town', 'suburb', 'neighbourhood'),
      layout: {
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        // 'literal' is not optional: a bare array in an expression slot is parsed as an
        // expression, and ["Noto Sans Bold"] is not one.
        'text-font': [
          'match',
          ['get', 'class'],
          ['city', 'town'],
          ['literal', FONT_BOLD],
          ['literal', FONT],
        ],
        'text-size': [
          'interpolate', ['linear'], ['zoom'],
          9, ['match', ['get', 'class'], ['city'], 12, ['town'], 10, 8.5],
          15, ['match', ['get', 'class'], ['city'], 16, ['town'], 13, 11.5],
        ],
        'text-letter-spacing': 0.16,
        'text-transform': 'uppercase',
        'text-max-width': 8,
        'text-padding': 6,
      },
      paint: {
        'text-color': MAP.labelPlace,
        'text-halo-color': MAP.halo,
        'text-halo-width': 1.6,
        'text-opacity': ['match', ['get', 'class'], ['city', 'town'], 0.92, 0.62],
      },
    },
  ],
});
