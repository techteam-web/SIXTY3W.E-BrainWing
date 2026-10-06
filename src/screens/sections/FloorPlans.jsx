import { Screen } from '../../layout/Screen';
import { BuildingExplorer } from '../../components/building/BuildingExplorer';

// The tower itself is the way in: point at a floor, open its plan, and work the plan
// down to the unit. THE ELEVATION IS THE GROUND — it fills the screen the way the map and
// the panorama fill theirs, and everything else on this screen stands over it.
export function FloorPlans() {
  return (
    <Screen id="plans" padded={false}>
      <BuildingExplorer />
    </Screen>
  );
}
