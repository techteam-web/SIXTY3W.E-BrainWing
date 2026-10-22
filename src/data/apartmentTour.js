import APARTMENT_DATA from './ApartmentPanoData';
import { makeTour } from './tours';

// The sample 2 BHK's tour: what each scene is called, where the full walk begins, and
// the rooms offered as cards — each opening on the camera with the best view of it.

export const APARTMENT_TOUR = makeTour({
  data: APARTMENT_DATA,
  // The export's folder is named "bedroom" though it holds the whole home; it must match
  // the folder on disk exactly.
  tiles: '/assets/bedroom/tiles',
  fallback: '2 BHK Residence',
  labels: {
    '0-balcony_cam_01': 'Balcony',
    '1-bedroom_01_cam_01': 'Bedroom 1',
    '2-bedroom_01_cam_02': 'Bedroom 1',
    '3-bedroom_01_cam_03': 'Bedroom 1',
    '4-bedroom_02_cam_01': 'Bedroom 2',
    '5-bedroom_02_cam_02': 'Bedroom 2',
    '6-bedroom_02_cam_03': 'Bedroom 2',
    '7-bedroom_pasage': 'Passage',
    '8-kitchen_cam_01': 'Kitchen',
    '9-kitchen_cam_02': 'Kitchen',
    '10-living_cam_01': 'Living Room',
    '11-living_cam_02': 'Living Room',
    '12-living_cam_03': 'Living Room',
  },
});

// The walk starts in the living room, the way a visitor enters a home, at its first
// camera — "Living Room · Point 1" — with every other room reachable from there by its
// arrows.
export const APARTMENT_START = '10-living_cam_01';

// The first room is where the walk begins, and stands tall at the head of the gallery.
// Every room opens on its first camera, Point 1, so the name a visitor lands on always
// starts the count.
export const APARTMENT_ROOMS = [
  { id: 'living', title: 'Living Room', scene: APARTMENT_START },
  { id: 'bedroom-1', title: 'Bedroom 1', scene: '1-bedroom_01_cam_01' },
  { id: 'kitchen', title: 'Kitchen', scene: '8-kitchen_cam_01' },
  { id: 'bedroom-2', title: 'Bedroom 2', scene: '4-bedroom_02_cam_01' },
  { id: 'balcony', title: 'Balcony', scene: '0-balcony_cam_01' },
];
