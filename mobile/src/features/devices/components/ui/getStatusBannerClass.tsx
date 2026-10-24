
import { DeviceWithRepairState } from '../..';


export function getStatusBannerClass(repairState: DeviceWithRepairState['repairState']) {
  if (repairState === 'ACTIVE_REPAIR') {
    return 'bg-primary-fixed/40';
  }
  if (repairState === 'PENDING_REQUEST') {
    return 'bg-amber-50';
  }
  return 'bg-tertiary-fixed/30';
}
