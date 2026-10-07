export type RepairStage = 1 | 2 | 3 | 4 | 5;

export type RepairStageStatus = 'ACCEPTED' | 'DIAGNOSING' | 'IN_REPAIR' | 'READY_FOR_PICKUP' | 'COMPLETED';

export interface ActiveRepairTicket {
  id: string;
  ticketNumber: string;
  deviceModel: string;
  reportedIssue: string;
  status: RepairStageStatus;
  statusLabel: string;
  priorityLabel: string;
  currentStage: RepairStage;
  estimatedDiagnosisTime: string;
  assignedTechnician: string;
}

export type DeviceHealthStatus = 'IN_SERVICE' | 'HEALTHY' | 'NEEDS_SERVICE';

export interface RegisteredDevice {
  id: string;
  name: string;
  model: string;
  type: 'laptop_windows' | 'laptop_mac' | 'desktop';
  status: DeviceHealthStatus;
  statusLabel: string;
  activeTicketNumber?: string;
}

export type ActivityRequestStatus = 'ACCEPTED' | 'PENDING' | 'DIAGNOSING' | 'COMPLETED';

export interface RecentActivityItem {
  id: string;
  requestNumber: string;
  deviceModel: string;
  issueDescription: string;
  date: string;
  status: ActivityRequestStatus;
  statusLabel: string;
}
