export type DeviceCategory = 'Laptop' | 'Desktop';

export type DeviceRepairState = 'ACTIVE_REPAIR' | 'NO_REPAIRS' | 'PENDING_REQUEST';

export interface CustomerDevice {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: DeviceCategory;
  serialNumber: string;
  addedDate: string;
  locationLabel: string;
  repairState: DeviceRepairState;
  repairStatusLabel: string;
  serviceRecordLabel: string;
  activeTicketNumber?: string;
  pendingRequestNumber?: string;
}
