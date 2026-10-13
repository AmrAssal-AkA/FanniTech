import { serverClient } from '../../../utils/serverClient';
import { ApiResponse } from '../../../types/api';
import { ApiDevice, RegisterDeviceInput } from '../types';

export const DevicesService = {
  getDevices: () =>
    serverClient
      .get<ApiResponse<ApiDevice[]>>('/api/v1/devices')
      .then((response) => response.data.data),

  registerDevice: (input: RegisterDeviceInput) => {
    const { serialNumber, ...requiredFields } = input;
    const normalizedSerialNumber = serialNumber?.trim();
    const payload = normalizedSerialNumber
      ? { ...requiredFields, serialNumber: normalizedSerialNumber }
      : requiredFields;

    return serverClient
      .post<ApiResponse<ApiDevice>>('/api/v1/devices', payload)
      .then((response) => response.data.data).then((device) => {
        return device;
      }).catch((error) => {
        console.error('Error registering device:', error);
        throw error;
      });
  },
};
