import type { RepairTicket, RepairTicketStatus } from "@/types/tickets";

export interface WorkbenchTechnician {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkbenchMetrics {
  activeQueueCount: number;
  criticalUrgentCount: number;
  underDiagnosisCount: number;
  inRepairCount: number;
  readyForQACount: number;
  completedTodayCount: number;
}

export interface WorkbenchActivity {
  id: string;
  ticketId: string;
  status: RepairTicketStatus;
  notes: string | null;
  changedAt: string;
  ticket: {
    id: string;
    ticketNumber: string;
  };
}

export interface TechnicianWorkbenchData {
  technician: WorkbenchTechnician;
  metrics: WorkbenchMetrics;
  activeTicket: RepairTicket | null;
  assignedTickets: RepairTicket[];
  recentActivities: WorkbenchActivity[];
}

export interface UpdateTechnicianNotesPayload {
  diagnosis?: string;
  repairNotes?: string;
  notes?: string;
}
