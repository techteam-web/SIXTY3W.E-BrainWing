import { Landing } from '../screens/Landing';
import { Menu } from '../screens/Menu';
import { Overview } from '../screens/sections/Overview';
import { Panorama } from '../screens/sections/Panorama';
import { Residences } from '../screens/sections/Residences';
import { Amenities } from '../screens/sections/Amenities';
import { Level26 } from '../screens/sections/Level26';
import { Plans } from '../screens/sections/Plans';
import { Location } from '../screens/sections/Location';
import { Specifications } from '../screens/sections/Specifications';

// Every screen is statically imported: the incoming screen must be mounted and laid out
// before the transition timeline is built, because the arch panels clone it. A screen
// still resolving behind a Suspense boundary would be cloned empty.
export const SECTION_SCREENS = {
  overview: Overview,
  'views-360': Panorama,
  residences: Residences,
  amenities: Amenities,
  'level-26': Level26,
  plans: Plans,
  location: Location,
  specifications: Specifications,
};

// Stage → component. 'gate' mounts nothing: the gate is an overlay outside the stage,
// and the intro runs on the Landing screen's own elements rather than a separate screen.
export const STAGE_SCREENS = {
  gate: null,
  intro: Landing,
  landing: Landing,
  menu: Menu,
};
