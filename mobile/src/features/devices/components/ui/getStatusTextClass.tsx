import { DeviceWithRepairState } from '../..';


export function getStatusTextClass(repairState: DeviceWithRepairState['repairState']) {
  if (repairState === 'ACTIVE_REPAIR') {
    return 'text-primary';
  }
  if (repairState === 'PENDING_REQUEST') {
    return 'text-amber-900';
  }
  return 'text-tertiary';
}
