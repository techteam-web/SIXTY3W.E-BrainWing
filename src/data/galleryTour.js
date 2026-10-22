import GALLERY_DATA from './GalleryPanoData';
import { makeTour } from './tours';

// The amenity level's tour: what its scenes are called, where the full walk begins, and
// which scene each amenity's card opens on. Names come from looking at each scene.

export const AMENITY_TOUR = makeTour({
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
