
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DevicesService } from '../services/DevicesService';
import { ApiDevice, DeviceWithRepairState, RegisterDeviceInput } from '../types';
import { useGetRepairRequests } from '../../repair-requests/hooks/useRepairRequests';

export const DEVICES_QUERY_KEY = ['devices'] as const;

export function useGetDevices() {
  return useQuery<ApiDevice[]>({ queryKey: DEVICES_QUERY_KEY, queryFn: DevicesService.getDevices });
}

export function useRegisterDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterDeviceInput) => DevicesService.registerDevice(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DEVICES_QUERY_KEY }),
  });
}

export function useDevicesUiState() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithRepairState | null>(null);
  const [menuDevice, setMenuDevice] = useState<DeviceWithRepairState | null>(null);

  return {
    selectedDevice,
    menuDevice,
    openDeviceDetails: useCallback((device: DeviceWithRepairState) => {
      setMenuDevice(null);
      setSelectedDevice(device);
    }, []),
    closeDeviceDetails: useCallback(() => setSelectedDevice(null), []),
    openDeviceMenu: useCallback((device: DeviceWithRepairState) => {
      setSelectedDevice(null);
      setMenuDevice(device);
    }, []),
    closeDeviceMenu: useCallback(() => setMenuDevice(null), []),
  };
}

export function useDevices() {
  const devicesQuery = useGetDevices();
  const requestsQuery = useGetRepairRequests();
  const uiState = useDevicesUiState();

  const devices = useMemo<DeviceWithRepairState[]>(() => {
    const requests = requestsQuery.data?.data ?? [];
    return (devicesQuery.data ?? []).map((device) => {
      const deviceRequests = requests.filter((request) => request.deviceId === device.id);
      const hasActiveRepair = deviceRequests.some((request) => request.status === 'ACCEPTED');
      const hasPendingRequest = deviceRequests.some((request) => request.status === 'PENDING');
      return {
        ...device,
        repairState: hasActiveRepair ? 'ACTIVE_REPAIR' : hasPendingRequest ? 'PENDING_REQUEST' : 'NO_REPAIRS',
      };
    });
  }, [devicesQuery.data, requestsQuery.data]);

  return {
    ...uiState,
    devices,
    registeredCount: devices.length,
    isRefreshing: devicesQuery.isRefetching || requestsQuery.isRefetching,
    isLoading: devicesQuery.isLoading || requestsQuery.isLoading,
    error: devicesQuery.error || requestsQuery.error,
    refreshDevices: () => {
      void Promise.all([devicesQuery.refetch(), requestsQuery.refetch()]);
    },
  };
}
