export type DeviceRepairState = 'ACTIVE_REPAIR' | 'NO_REPAIRS' | 'PENDING_REQUEST';

export interface ApiDevice {
  id: string;
  customerId: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDeviceInput {
  deviceType: string;
  brand: string;
  model: string;
  serialNumber?: string;
}

export interface DeviceWithRepairState extends ApiDevice {
  repairState: DeviceRepairState;
}
