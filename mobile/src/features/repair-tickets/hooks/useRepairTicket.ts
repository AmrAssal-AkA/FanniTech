import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RepairTicketsService } from '../services/RepairTicketsService';
import { RepairRequestsService } from '../../repair-requests/services/RepairRequestsService';
import { ApiRepairRequest } from '../../repair-requests/types';
import { socketService } from '../../../services/socketService';
import {
  RepairTicketDetail,
  RepairTicketStatus,
  TimelineStep,
  AuditLogEntry,
  ApiRepairTicketResponse,
  RepairHubInfo,
} from '../types';

export const STAGE_ORDER: RepairTicketStatus[] = [
  'ACCEPTED',
  'DIAGNOSING',
  'IN_REPAIR',
  'READY_FOR_PICKUP',
  'COMPLETED',
];

export interface LifecycleMetrics {
  stage: number;
  totalStages: number;
  progressPercent: number;
  label: string;
  stageName: string;
  isTerminal: boolean;
  isCompleted: boolean;
}

export function getLifecycleMetrics(
  status?: RepairTicketStatus | string
): LifecycleMetrics {
  switch (status) {
    case 'ACCEPTED':
      return {
        stage: 1,
        totalStages: 5,
        progressPercent: 20,
        label: 'Accepted',
        stageName: 'Intake & Verification',
        isTerminal: false,
        isCompleted: false,
      };
    case 'DIAGNOSING':
      return {
        stage: 2,
        totalStages: 5,
        progressPercent: 40,
        label: 'Diagnosing',
        stageName: 'Hardware Diagnostics',
        isTerminal: false,
        isCompleted: false,
      };
    case 'IN_REPAIR':
      return {
        stage: 3,
        totalStages: 5,
        progressPercent: 60,
        label: 'In Repair',
        stageName: 'Component Repair',
        isTerminal: false,
        isCompleted: false,
      };
    case 'READY_FOR_PICKUP':
      return {
        stage: 4,
        totalStages: 5,
        progressPercent: 80,
        label: 'Ready for Pickup',
        stageName: 'Ready for Collection',
        isTerminal: false,
        isCompleted: false,
      };
    case 'COMPLETED':
      return {
        stage: 5,
        totalStages: 5,
        progressPercent: 100,
        label: 'Completed',
        stageName: 'Repairs Completed',
        isTerminal: true,
        isCompleted: true,
      };
    case 'UNREPAIRABLE':
      return {
        stage: 2,
        totalStages: 5,
        progressPercent: 100,
        label: 'Unrepairable',
        stageName: 'Device Unrepairable',
        isTerminal: true,
        isCompleted: false,
      };
    case 'CANCELLED':
      return {
        stage: 1,
        totalStages: 5,
        progressPercent: 100,
        label: 'Cancelled',
        stageName: 'Ticket Cancelled',
        isTerminal: true,
        isCompleted: false,
      };
    default:
      return {
        stage: 1,
        totalStages: 5,
        progressPercent: 20,
        label: status || 'Pending',
        stageName: 'Service Intake',
        isTerminal: false,
        isCompleted: false,
      };
  }
}

const DEFAULT_HUB_INFO: RepairHubInfo = {
  name: 'FanniTech Central Hub',
  address: 'Al-Olaya St, Riyadh',
  operatingHours: '9:00 AM – 9:00 PM (Sat - Thu)',
  distanceText: 'Central Riyadh Service Center',
  phone: '+966 11 456 7890',
};

function formatTimeSafe(dateStr?: string | null, fallback = 'Recent'): string {
  if (!dateStr) return fallback;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStatusDescription(
  status: RepairTicketStatus,
  diagnosis?: string | null
): string {
  if (diagnosis && (status === 'DIAGNOSING' || status === 'IN_REPAIR')) {
    return diagnosis;
  }
  switch (status) {
    case 'ACCEPTED':
      return 'Repair request has been approved and device is checked in at our service hub.';
    case 'DIAGNOSING':
      return 'Our certified hardware technician is currently running diagnostics on the device.';
    case 'IN_REPAIR':
      return 'Repairs are actively underway by certified lab technicians.';
    case 'READY_FOR_PICKUP':
      return 'Your device has passed final quality checks and is ready for pickup at the hub.';
    case 'COMPLETED':
      return 'All repair operations completed successfully. Device handed over.';
    case 'UNREPAIRABLE':
      return 'Device was thoroughly inspected and determined unrepairable according to lab standards.';
    case 'CANCELLED':
      return 'Ticket has been cancelled.';
    default:
      return 'Processing ticket at FanniTech Central Hub.';
  }
}

function buildTimeline(
  currentStatus: RepairTicketStatus,
  createdAt: string,
  statusHistory?: ApiRepairTicketResponse['statusHistory']
): TimelineStep[] {
  const currentIndex = STAGE_ORDER.indexOf(currentStatus);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;
  const isAllCompleted = currentStatus === 'COMPLETED';
  const isTerminal = currentStatus === 'UNREPAIRABLE' || currentStatus === 'CANCELLED';

  const defaultDescriptions: Record<RepairTicketStatus, string> = {
    ACCEPTED: 'Repair request approved and device checked in at center.',
    DIAGNOSING: 'Hardware stress testing and thermals inspection in progress.',
    IN_REPAIR: 'Component repair or part replacement.',
    READY_FOR_PICKUP: 'Customer notification sent for collection.',
    COMPLETED: 'Device handed over and verified.',
    UNREPAIRABLE: 'Device inspected and closed.',
    CANCELLED: 'Ticket cancelled.',
  };

  return STAGE_ORDER.map((stageKey, idx) => {
    const historyItem = statusHistory?.find((h) => h.status === stageKey);
    let isCompleted = false;
    let isActive = false;

    if (isAllCompleted) {
      isCompleted = true;
    } else if (isTerminal) {
      isCompleted = Boolean(historyItem);
    } else {
      isCompleted = idx < activeIdx;
      isActive = idx === activeIdx;
    }

    let timestamp: string;
    if (historyItem) {
      timestamp = formatTimeSafe(historyItem.changedAt, 'Updated');
    } else if (idx === 0) {
      timestamp = formatTimeSafe(createdAt, 'Received');
    } else if (isCompleted) {
      timestamp = 'Completed';
    } else if (isActive) {
      timestamp = 'In Progress';
    } else {
      timestamp = 'Pending';
    }

    return {
      key: stageKey,
      stepNumber: idx + 1,
      title: `${idx + 1}. ${stageKey}`,
      timestamp,
      description: historyItem?.notes || defaultDescriptions[stageKey],
      stationNote:
        stageKey === 'DIAGNOSING' && isActive
          ? 'Diagnostics & bench verification active'
          : undefined,
      status: isCompleted ? 'completed' : isActive ? 'active' : 'pending',
    };
  });
}

export function transformApiResponse(
  apiData: ApiRepairTicketResponse
): RepairTicketDetail {
  const metrics = getLifecycleMetrics(apiData.status);

  const device = apiData.request?.device;
  const techUser = apiData.technician?.user;

  const auditLogs: AuditLogEntry[] = [];
  if (apiData.diagnosis) {
    auditLogs.push({
      id: 'log-diag',
      author: techUser?.name || 'Assigned Technician',
      role: 'Hardware Diagnostics',
      initial: (techUser?.name || 'T').charAt(0).toUpperCase(),
      timestamp: formatTimeSafe(apiData.updatedAt || apiData.createdAt),
      content: apiData.diagnosis,
      isMaster: true,
    });
  }
  if (apiData.repairNotes) {
    auditLogs.push({
      id: 'log-repair',
      author: techUser?.name || 'Assigned Technician',
      role: 'Repair Operations',
      initial: (techUser?.name || 'T').charAt(0).toUpperCase(),
      timestamp: formatTimeSafe(apiData.updatedAt || apiData.createdAt),
      content: apiData.repairNotes,
      isMaster: false,
    });
  }
  if (apiData.statusHistory && apiData.statusHistory.length > 0) {
    for (const h of apiData.statusHistory) {
      if (h.notes) {
        auditLogs.push({
          id: `log-history-${h.id}`,
          author: 'Central Hub',
          role: h.status,
          initial: 'H',
          timestamp: formatTimeSafe(h.changedAt),
          content: h.notes,
          isMaster: false,
        });
      }
    }
  }

  const firstImage = apiData.request?.images?.[0]?.url;
  const deviceSpecs: string[] = [];
  if (device?.deviceType) deviceSpecs.push(device.deviceType);
  if (device?.serialNumber) deviceSpecs.push(`SN: ${device.serialNumber}`);

  const reqShortId = (apiData.request?.id || apiData.requestId || apiData.id)
    .slice(0, 8)
    .toUpperCase();

  return {
    id: apiData.id,
    ticketNumber: apiData.ticketNumber || `SR-${reqShortId}`,
    requestNumber: `REQ-${reqShortId}`,
    requestId: apiData.requestId,
    status: apiData.status,
    priority: apiData.priority,
    statusDescription: formatStatusDescription(
      apiData.status,
      apiData.diagnosis
    ),
    currentStage: metrics.stage,
    totalStages: 5,
    progressPercent: metrics.progressPercent,
    device: {
      id: device?.id,
      brand: device?.brand || 'Device',
      model: device?.model || '',
      deviceType: device?.deviceType,
      serialNumber: device?.serialNumber || null,
      categoryLabel: device?.deviceType?.toUpperCase() || 'HARDWARE',
      specs: deviceSpecs,
    },
    problem: apiData.request?.problem || 'Hardware issue reported',
    description: apiData.request?.description || '',
    diagnosis: apiData.diagnosis || null,
    repairNotes: apiData.repairNotes || null,
    diagnosticFeed: firstImage
      ? {
          imageUrl: firstImage,
          caption: 'Diagnostic photo inspection',
          badge: 'LAB-01',
        }
      : undefined,
    auditLogs,
    timeline: buildTimeline(apiData.status, apiData.createdAt, apiData.statusHistory),
    technician: techUser?.name
      ? {
          name: techUser.name,
          roleTitle: 'Certified Technician',
          phone: techUser.phone || DEFAULT_HUB_INFO.phone,
        }
      : undefined,
    hubInfo: DEFAULT_HUB_INFO,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
  };
}

export function transformRequestToTicketDetail(
  request: ApiRepairRequest
): RepairTicketDetail {
  const shortId = request.id ? request.id.slice(0, 8).toUpperCase() : '0000';
  const reqNum = `REQ-${shortId}`;
  const device = request.device;
  const firstImage = request.images?.[0]?.url;

  const deviceSpecs: string[] = [];
  if (device?.deviceType) deviceSpecs.push(device.deviceType);
  if (device?.serialNumber) deviceSpecs.push(`SN: ${device.serialNumber}`);

  const mappedStatus: RepairTicketStatus =
    request.status === 'PENDING' || request.status === 'ACCEPTED'
      ? 'ACCEPTED'
      : request.status === 'CANCELLED' || request.status === 'REJECTED'
      ? 'CANCELLED'
      : 'ACCEPTED';

  const metrics = getLifecycleMetrics(mappedStatus);

  return {
    id: `ticket-${request.id}`,
    ticketNumber: request.repairTicket?.ticketNumber || reqNum,
    requestNumber: reqNum,
    requestId: request.id,
    status: mappedStatus,
    priority: 'MEDIUM',
    statusDescription:
      request.status === 'PENDING'
        ? 'Your repair request has been submitted and is queued for intake verification at FanniTech Central Hub.'
        : formatStatusDescription(mappedStatus),
    currentStage: metrics.stage,
    totalStages: 5,
    progressPercent: metrics.progressPercent,
    device: {
      id: device?.id,
      brand: device?.brand || 'Device',
      model: device?.model || '',
      deviceType: device?.deviceType,
      serialNumber: device?.serialNumber || null,
      categoryLabel: device?.deviceType?.toUpperCase() || 'HARDWARE',
      specs: deviceSpecs,
    },
    problem: request.problem || 'Hardware issue reported',
    description: request.description || '',
    diagnosis: null,
    repairNotes: null,
    diagnosticFeed: firstImage
      ? {
          imageUrl: firstImage,
          caption: 'Customer intake photo',
          badge: 'INTAKE',
        }
      : undefined,
    auditLogs: [
      {
        id: `log-intake-${request.id}`,
        author: 'Service Intake',
        role: 'Intake Queue',
        initial: 'I',
        timestamp: formatTimeSafe(request.createdAt, 'Just now'),
        content: `Service request ${reqNum} registered in queue. Bench technician allocation pending.`,
        isMaster: false,
      },
    ],
    timeline: buildTimeline(mappedStatus, request.createdAt),
    technician: undefined,
    hubInfo: DEFAULT_HUB_INFO,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export function useRepairTicket(params?: {
  ticketNumber?: string;
  ticketId?: string;
  requestId?: string;
  onStatusChange?: (newStatus: RepairTicketStatus, previousStatus?: RepairTicketStatus) => void;
}) {
  const cleanTicketNumber = params?.ticketNumber?.trim() || undefined;
  const cleanTicketId = params?.ticketId?.trim() || undefined;
  const cleanRequestId = params?.requestId?.trim() || undefined;

  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(socketService.isConnected());
  const prevStatusRef = useRef<RepairTicketStatus | undefined>(undefined);

  useEffect(() => {
    return socketService.onConnectionChange((connected) => {
      setIsLiveConnected(connected);
    });
  }, []);

  const queryIdentifier =
    cleanTicketNumber || cleanTicketId || cleanRequestId || 'latest';

  const query = useQuery<RepairTicketDetail, Error>({
    queryKey: ['repairTicket', queryIdentifier, cleanRequestId],
    queryFn: async () => {
      if (cleanRequestId) {
        const request = await RepairRequestsService.getRequestById(
          cleanRequestId
        );
        if (!request) {
          throw new Error('Repair request not found.');
        }
        if (request.repairTicket) {
          return transformApiResponse({
            id: request.repairTicket.id,
            ticketNumber: request.repairTicket.ticketNumber,
            requestId: request.id,
            priority: (request.repairTicket.priority || 'MEDIUM') as any,
            status: request.repairTicket.status as any,
            diagnosis: request.repairTicket.diagnosis,
            repairNotes: request.repairTicket.repairNotes,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
            statusHistory: request.repairTicket.statusHistory as any,
            technician: request.repairTicket.technician as any,
            request: {
              id: request.id,
              deviceId: request.deviceId,
              problem: request.problem,
              description: request.description,
              status: request.status,
              createdAt: request.createdAt,
              device: request.device,
              images: request.images,
            },
          });
        }
        return transformRequestToTicketDetail(request);
      }

      const apiData = await RepairTicketsService.getTicketByIdOrNumber(
        queryIdentifier
      );
      if (!apiData) {
        throw new Error('Repair ticket not found.');
      }
      return transformApiResponse(apiData);
    },
    staleTime: 1000 * 30, // 30 seconds fresh cache
    retry: process.env.NODE_ENV === 'test' ? false : 1,
  });

  useEffect(() => {
    const currentStatus = query.data?.status;
    if (currentStatus) {
      if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
        params?.onStatusChange?.(currentStatus, prevStatusRef.current);
      }
      prevStatusRef.current = currentStatus;
    }
  }, [query.data?.status, params]);

  return {
    ticket: query.data,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    error: query.error,
    isLiveConnected,
    refetch: query.refetch,
  };
}
