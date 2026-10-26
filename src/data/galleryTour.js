import GALLERY_DATA from './GalleryPanoData';
import levelMap from '../assets/mini map/level-26-map.webp?url';
import { makeTour } from './tours';

// The amenity level's tour: what its scenes are called, where the full walk begins, and
// which scene each amenity's card opens on. Names come from looking at each scene.

// The tour's map: the supplied top-down render of Level 26 (src/assets/mini map), drawn
// straight down so every amenity reads from above. Each place's dot is set on what the
// render shows there — the pool, the deck and its umbrella, the play structure, the
// raked-sand zen garden, the cabana pods, the cinema lawn (the screen is on the tower
// wall at its foot, as the cinema camera shows), the games floor, the gym, the yoga mats
// and the toddlers' room — and numbered with the brochure's own callout number, so the
// numbers match the Level 26 page. Lift Lobby, Passage to Terrace and Sky Lawn have no
// callout in the brochure, so they have no dot. u/v are fractions of the render.
const MAP_POINTS = [
  { place: 'Fitness Centre', n: 1, u: 0.493, v: 0.861 },
  { place: 'Yoga & Pilates', n: 2, u: 0.637, v: 0.85 },
  { place: 'Toddlers Room', n: 5, u: 0.742, v: 0.537 },
  { place: 'Kids Play Area', n: 8, u: 0.529, v: 0.191 },
  { place: 'Infinity Pool', n: 10, u: 0.423, v: 0.239 },
  { place: 'Pool Deck', n: 11, u: 0.44, v: 0.398 },
  { place: 'Cabana Seating', n: 13, u: 0.556, v: 0.082 },
  { place: 'Outdoor Cinema', n: 16, u: 0.529, v: 0.34 },
  { place: 'Zen Rock Garden', n: 17, u: 0.589, v: 0.186 },
  { place: 'Games Room', n: 18, u: 0.3, v: 0.606 },
];

export const AMENITY_TOUR = makeTour({
  map: {
    // A web copy (1100 wide, sharp) of "level 26.png", which is 3.5 MB.
    image: { src: levelMap, width: 1672, height: 941 },
    title: 'Euphoria · Level 26',
    // [u0, v0, u1, v1]: the deck and the building, without most of the road and trees
    // around it, which a map this small can't spend its width on.
    crop: [0.15, 0, 0.83, 1],
    points: MAP_POINTS,
  },
  data: GALLERY_DATA,
  // The folder really is spelt "Gallary" on disk, and a production server is
  // case- and spelling-sensitive, so this must match it exactly.
  tiles: '/assets/Gallary/tiles',
  fallback: 'Amenity Level',
  labels: {
    '0-gameroom_cam01': 'Games Room',
    '1-gameroom_cam02': 'Games Room',
    '2-gameroom_cam03': 'Games Room',
    '3-gym_01': 'Fitness Centre',
    '4-gym_02': 'Fitness Centre',
    '5-gym_03_view03': 'Fitness Centre',
    '6-lift-cam_01': 'Lift Lobby',
    '7-lift-cam_02': 'Lift Lobby',
    '8-lift-cam_03': 'Lift Lobby',
    '9-lift-cam_04': 'Lift Lobby',
    '10-lift-cam_05': 'Lift Lobby',
    '11-lift-cam_06': 'Lift Lobby',
    '12-lift-cam_07': 'Lift Lobby',
    '13-passage-to-terrace': 'Passage to Terrace',
    '14-cam_01': 'Sky Lawn',
    '15-cam_02': 'Infinity Pool',
    '16-cam_03': 'Zen Rock Garden',
    '17-cam_10': 'Pool Deck',
    '18-cam04': 'Zen Rock Garden',
    '19-cam06': 'Kids Play Area',
    '20-cam07': 'Kids Play Area',
    '21-cam08': 'Outdoor Cinema',
    '22-cam09': 'Sky Lawn',
    '23-toddler': 'Toddlers Room',
    '24-yoga_cam_01': 'Yoga & Pilates',
    '25-yoga_cam_02': 'Yoga & Pilates',
    '26-yoga_room_cam_03': 'Yoga & Pilates',
    '27-cm05': 'Cabana Seating',
  },
  // Every place shot from more than one camera names each camera for what you see
  // standing there (and, in the lobby, what its arrows lead to), not "· Point 2". The
  // lobby winds past half the level, so its names stand on their own.
  names: {
    '0-gameroom_cam01': 'Games Room · Chess Corner', // chess table at the window
    '1-gameroom_cam02': 'Games Room · Pool Table', // the whole room, pool table alongside
    '2-gameroom_cam03': 'Games Room · Table Tennis', // right at the table-tennis table
    '3-gym_01': 'Fitness Centre · Stretching Zone', // wall bars and mats
    '4-gym_02': 'Fitness Centre · Weights', // benches and the dumbbell racks
    '5-gym_03_view03': 'Fitness Centre · Cardio', // treadmills along the windows
    '6-lift-cam_01': 'Reception Desk', // the concierge desk; Games Room and gym off it
    '7-lift-cam_02': 'Lift Landing', // facing the lift doors
    '8-lift-cam_03': 'Garden Corridor', // the pebble-and-tree garden; leads to Yoga
    '9-lift-cam_04': 'Central Lobby', // the crossroads: lounge, passage, play rooms
    '10-lift-cam_05': 'Lounge Entrance', // the lounge ahead, city windows beyond
    '11-lift-cam_06': 'Toddlers Room Corridor', // the fluted counter; Toddlers Room off it
    '12-lift-cam_07': 'City-View Lounge', // in the lounge, sofa to the window
  },
  // The Pool Table camera's export opens on the table-tennis table, with the pool table
  // off to the right; turn it to face the table it's named for, looking a little down.
  views: {
    '1-gameroom_cam02': { yaw: 1.0, pitch: -0.12 },
  },
});

// Where the full tour begins: stepping out of the lift onto the amenity level, the way a
// resident actually arrives, with every space reachable from there by its arrows.
export const TOUR_START = '6-lift-cam_01';

// AMENITIES.items id → the scene its card opens on. Reading Nook and Bonsai Garden
// weren't shot in 360, so they have no entry and stay list-only.
export const AMENITY_SCENES = {
  pool: '15-cam_02',
  fitness: '3-gym_01',
  games: '0-gameroom_cam01',
  yoga: '24-yoga_cam_01',
  cinema: '21-cam08',
  toddlers: '23-toddler',
  kids: '19-cam06',
  zen: '16-cam_03',
};

export const thumbFor = AMENITY_TOUR.thumb;
