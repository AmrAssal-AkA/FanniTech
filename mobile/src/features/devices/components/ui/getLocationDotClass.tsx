import { DeviceWithRepairState } from '../..';


export function getLocationDotClass(repairState: DeviceWithRepairState['repairState']) {
  if (repairState === 'ACTIVE_REPAIR') {
    return 'bg-secondary-container';
  }
  if (repairState === 'PENDING_REQUEST') {
    return 'bg-error';
  }
  return 'bg-outline';
}
