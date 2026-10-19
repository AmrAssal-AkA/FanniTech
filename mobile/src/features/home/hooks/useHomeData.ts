import { useCallback, useMemo } from 'react';
import {
  ActiveRepairTicket,
  RegisteredDevice,
  RecentActivityItem,
  RepairStage,
} from '../types';
import { useAuthSession } from '../../auth/session/AuthSession';
import { useGetDevices } from '../../devices';
import { useGetRepairRequests } from '../../repair-requests';

function mapStage(status?: string): { stage: RepairStage; label: string } {
  switch (status) {
    case 'ACCEPTED':
      return { stage: 1, label: 'ACCEPTED' };
    case 'DIAGNOSING':
      return { stage: 2, label: 'DIAGNOSING' };
    case 'IN_REPAIR':
      return { stage: 3, label: 'IN_REPAIR' };
    case 'READY_FOR_PICKUP':
      return { stage: 4, label: 'READY_FOR_PICKUP' };
    case 'COMPLETED':
      return { stage: 5, label: 'COMPLETED' };
    default:
      return { stage: 1, label: status || 'PENDING' };
  }
}

function getDeviceType(
  brand?: string,
  deviceType?: string
): 'laptop_mac' | 'desktop' | 'laptop_windows' {
  const b = (brand || '').toLowerCase();
  const t = (deviceType || '').toLowerCase();
  if (b.includes('apple') || b.includes('mac') || t.includes('mac')) {
    return 'laptop_mac';
  }
  if (t.includes('desktop') || t.includes('pc') || t.includes('workstation')) {
    return 'desktop';
  }
  return 'laptop_windows';
}

export const useHomeData = () => {
  const { user } = useAuthSession();
  const userName = user?.name ? user.name.trim().split(/\s+/)[0] : 'there';
  const isLabOnline = true;
  const labHoursText = 'Open today until 9:00 PM';

  const devicesQuery = useGetDevices();
  const requestsQuery = useGetRepairRequests();

  const requests = requestsQuery.data?.data ?? [];
  const rawDevices = devicesQuery.data ?? [];

  // Map real user devices
  const devices = useMemo<RegisteredDevice[]>(() => {
    return rawDevices.map((device) => {
      const deviceRequests = requests.filter((r) => r.deviceId === device.id);
      const activeRequest = deviceRequests.find(
        (r) => r.status === 'ACCEPTED' || Boolean(r.repairTicket)
      );
      const pendingRequest = deviceRequests.find((r) => r.status === 'PENDING');

      const isInService = Boolean(activeRequest);
      const isPending = Boolean(pendingRequest);

      const status = isInService
        ? 'IN_SERVICE'
        : isPending
        ? 'NEEDS_SERVICE'
        : 'HEALTHY';

      const statusLabel = isInService
        ? 'In Service'
        : isPending
        ? 'Pending Review'
        : 'Healthy';

      const activeTicketNumber =
        activeRequest?.repairTicket?.ticketNumber ||
        (activeRequest ? activeRequest.id.slice(0, 8).toUpperCase() : undefined);

      const name = `${device.brand} ${device.model}`.trim() || 'Device';

      return {
        id: device.id,
        name,
        model: device.model || device.brand,
        type: getDeviceType(device.brand, device.deviceType),
        status,
        statusLabel,
        activeTicketNumber,
      };
    });
  }, [rawDevices, requests]);

  // Find real active ticket (most recent active repair request with a ticket, or accepted)
  const activeTicket = useMemo<ActiveRepairTicket | null>(() => {
    const activeReq = requests.find(
      (r) =>
        (r.repairTicket &&
          r.repairTicket.status !== 'COMPLETED' &&
          r.repairTicket.status !== 'CANCELLED') ||
        r.status === 'ACCEPTED'
    );

    if (!activeReq) return null;

    const ticket = activeReq.repairTicket;
    const stageInfo = mapStage(ticket?.status || activeReq.status);

    const deviceModel = activeReq.device
      ? `${activeReq.device.brand} ${activeReq.device.model}`.trim()
      : 'Registered Device';

    const techName = ticket?.technician?.user?.name || 'Assigned Technician';

    return {
      id: ticket?.id || activeReq.id,
      ticketNumber:
        ticket?.ticketNumber || activeReq.id.slice(0, 8).toUpperCase(),
      deviceModel,
      reportedIssue: activeReq.problem || 'Hardware diagnosis in progress',
      status: (ticket?.status as any) || 'ACCEPTED',
      statusLabel: stageInfo.label,
      priorityLabel: ticket?.priority
        ? `${ticket.priority} Priority`
        : 'Priority Hardware',
      currentStage: stageInfo.stage,
      estimatedDiagnosisTime: 'Diagnostic Active',
      assignedTechnician: techName,
    };
  }, [requests]);

  // Map real recent activities from requests
  const activities = useMemo<RecentActivityItem[]>(() => {
    return requests.slice(0, 5).map((req) => {
      const shortId = req.id.slice(0, 8).toUpperCase();
      const dateStr = req.createdAt
        ? new Date(req.createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Recent';

      const deviceModel = req.device
        ? `${req.device.brand} ${req.device.model}`.trim()
        : 'Device';

      return {
        id: req.id,
        requestNumber: `REQ-${shortId}`,
        deviceModel,
        issueDescription: req.problem || req.description || 'Hardware service',
        date: dateStr,
        status: (req.status as any) || 'PENDING',
        statusLabel: req.status || 'PENDING',
      };
    });
  }, [requests]);

  const isRefreshing = devicesQuery.isRefetching || requestsQuery.isRefetching;

  const refreshHomeData = useCallback(async () => {
    await Promise.all([devicesQuery.refetch(), requestsQuery.refetch()]);
  }, [devicesQuery, requestsQuery]);

  return {
    userName,
    isLabOnline,
    labHoursText,
    activeTicket,
    devices,
    activities,
    isRefreshing,
    refreshHomeData,
  };
};
