
import { Activity, FileText, Wrench} from 'lucide-react-native';
import { DeviceWithRepairState } from '../..';


export function getPrimaryAction(repairState: DeviceWithRepairState['repairState']) {
  if (repairState === 'ACTIVE_REPAIR') {
    return {
      label: 'Track Repair',
      buttonClass: 'bg-secondary-container',
      textClass: 'text-on-secondary-container',
      icon: <Activity size={18} color="#fefcff" />,
    };
  }
  if (repairState === 'PENDING_REQUEST') {
    return {
      label: 'View Request',
      buttonClass: 'bg-primary-container',
      textClass: 'text-on-primary',
      icon: <FileText size={18} color="#ffffff" />,
    };
  }

  return {
    label: 'Request Repair',
    buttonClass: 'bg-primary',
    textClass: 'text-on-primary',
    icon: <Wrench size={18} color="#ffffff" />,
  };
}
