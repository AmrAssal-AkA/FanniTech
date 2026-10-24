export type RepairTicketStatus =
  | 'ACCEPTED'
  | 'DIAGNOSING'
  | 'IN_REPAIR'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'UNREPAIRABLE'
  | 'CANCELLED';

export type RepairTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuditLogEntry {
  id: string;
  author: string;
  role: string;
  initial: string;
  timestamp: string;
  content: string;
  isMaster?: boolean;
}

export interface TimelineStep {
  key: RepairTicketStatus;
  stepNumber: number;
  title: string;
  timestamp?: string;
  description: string;
  stationNote?: string;
  status: 'completed' | 'active' | 'pending';
}

export interface DiagnosticFeedItem {
  imageUrl: string;
  caption: string;
  badge: string;
}

export interface RepairHubInfo {
  name: string;
  address: string;
  operatingHours: string;
  distanceText: string;
  phone: string;
}

export interface RepairTicketDetail {
  id: string;
  ticketNumber: string;
  requestNumber: string;
  requestId: string;
  status: RepairTicketStatus;
  priority: RepairTicketPriority;
  statusDescription: string;
  currentStage: number;
  totalStages: number;
  progressPercent?: number;
  device: {
    id?: string;
    brand: string;
    model: string;
    deviceType?: string;
    serialNumber?: string | null;
    categoryLabel?: string;
    specs?: string[];
  };
  problem: string;
  description: string;
  diagnosis?: string | null;
  repairNotes?: string | null;
  diagnosticFeed?: DiagnosticFeedItem;
  auditLogs: AuditLogEntry[];
  timeline: TimelineStep[];
  technician?: {
    name: string;
    roleTitle: string;
    phone?: string;
  };
  hubInfo: RepairHubInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRepairStatusHistory {
  id: string;
  ticketId: string;
  status: RepairTicketStatus;
  notes?: string | null;
  changedAt: string;
}

export interface ApiRepairTicketResponse {
  id: string;
  requestId: string;
  technicianId?: string | null;
  ticketNumber: string;
  priority: RepairTicketPriority;
  status: RepairTicketStatus;
  diagnosis?: string | null;
  repairNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  request?: {
    id: string;
    deviceId: string;
    problem: string;
    description: string;
    status: string;
    createdAt: string;
    device?: {
      id: string;
      brand: string;
      model: string;
      deviceType: string;
      serialNumber?: string | null;
    };
    images?: Array<{
      id: string;
      url: string;
      fileName: string;
    }>;
  };
  technician?: {
    id: string;
    employeeId: string;
    user?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
  } | null;
  statusHistory?: ApiRepairStatusHistory[];
}

