import { DeviceWithRepairState } from '../..';


export function getLocationTextClass(repairState: DeviceWithRepairState['repairState']) {
  if (repairState === 'ACTIVE_REPAIR') {
    return 'text-secondary-container';
  }
  if (repairState === 'PENDING_REQUEST') {
    return 'text-on-error-container';
  }
  return 'text-on-surface-variant';
}
