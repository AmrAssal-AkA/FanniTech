import { useCallback, useMemo, useState } from 'react';
import { CustomerDevice } from '../types';

export const INITIAL_DEVICES: CustomerDevice[] = [
  {
    id: 'dev-1',
    name: 'Lenovo ThinkPad T14',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    category: 'Laptop',
    serialNumber: 'PF-2X99L1',
    addedDate: 'March 14, 2023',
    locationLabel: 'Bench Rig 04',
    repairState: 'ACTIVE_REPAIR',
    repairStatusLabel: '1 Active Repair (#SR-1001)',
    serviceRecordLabel: '2 Completed, 1 Active',
    activeTicketNumber: 'SR-1001',
  },
  {
    id: 'dev-2',
    name: 'Apple MacBook Air M2',
    brand: 'Apple',
    model: 'MacBook Air M2',
    category: 'Laptop',
    serialNumber: 'C02G4591MD6R',
    addedDate: 'January 10, 2024',
    locationLabel: 'Ready',
    repairState: 'NO_REPAIRS',
    repairStatusLabel: 'No Active Repairs',
    serviceRecordLabel: '0 Total',
  },
  {
    id: 'dev-3',
    name: 'Custom Gaming Desktop PC',
    brand: 'Custom Build',
    model: 'Custom Gaming Desktop PC',
    category: 'Desktop',
    serialNumber: 'FNT-9081-PC',
    addedDate: 'September 28, 2023',
    locationLabel: 'Quote Review',
    repairState: 'PENDING_REQUEST',
    repairStatusLabel: '1 Request Pending (#REQ-8840)',
    serviceRecordLabel: '1 Quote Pending',
    pendingRequestNumber: 'REQ-8840',
  },
];

export function useDevices() {
  const [devices, setDevices] = useState<CustomerDevice[]>(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<CustomerDevice | null>(
    null
  );
  const [menuDevice, setMenuDevice] = useState<CustomerDevice | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registeredCount = useMemo(() => devices.length, [devices]);

  const refreshDevices = useCallback(() => {
    setIsRefreshing(true);
    setError(null);
    setTimeout(() => {
      setDevices([...INITIAL_DEVICES]);
      setIsRefreshing(false);
    }, 600);
  }, []);

  const openDeviceDetails = useCallback((device: CustomerDevice) => {
    setMenuDevice(null);
    setSelectedDevice(device);
  }, []);

  const closeDeviceDetails = useCallback(() => {
    setSelectedDevice(null);
  }, []);

  const openDeviceMenu = useCallback((device: CustomerDevice) => {
    setSelectedDevice(null);
    setMenuDevice(device);
  }, []);

  const closeDeviceMenu = useCallback(() => {
    setMenuDevice(null);
  }, []);

  const removeDevice = useCallback((deviceId: string) => {
    setDevices((previous) =>
      previous.filter((device) => device.id !== deviceId)
    );
    setSelectedDevice((current) =>
      current?.id === deviceId ? null : current
    );
    setMenuDevice((current) => (current?.id === deviceId ? null : current));
  }, []);

  return {
    devices,
    registeredCount,
    selectedDevice,
    menuDevice,
    isRefreshing,
    isLoading,
    error,
    refreshDevices,
    openDeviceDetails,
    closeDeviceDetails,
    openDeviceMenu,
    closeDeviceMenu,
    removeDevice,
  };
}
