export type RepairTicketStatus =
  | "ACCEPTED"
  | "DIAGNOSING"
  | "IN_REPAIR"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "UNREPAIRABLE"
  | "CANCELLED";

export type RepairTicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface RepairStatusHistoryItem {
  id: string;
  ticketId: string;
  status: RepairTicketStatus;
  notes: string | null;
  changedAt: string;
}

export interface TicketCustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface TicketDevice {
  id: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string | null;
  customer?: {
    user: TicketCustomerUser;
    notes?: string | null;
  };
}

export interface TicketRequestImage {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface TicketRequest {
  id: string;
  problem: string;
  description: string;
  status: string;
  createdAt: string;
  device: TicketDevice;
  images: TicketRequestImage[];
}

export interface TicketTechnician {
  id: string;
  employeeId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface RepairTicket {
  id: string;
  requestId: string;
  technicianId: string | null;
  ticketNumber: string;
  priority: RepairTicketPriority;
  status: RepairTicketStatus;
  diagnosis: string | null;
  repairNotes: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  request: TicketRequest;
  technician: TicketTechnician | null;
  statusHistory?: RepairStatusHistoryItem[];
}

export interface TicketsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListTicketsResponse {
  items: RepairTicket[];
  pagination: TicketsPagination;
}

export interface ListTicketsQueryParams {
  page?: number;
  limit?: number;
  status?: RepairTicketStatus;
  priority?: RepairTicketPriority;
  technicianId?: string;
  assignedToMe?: boolean;
}

export interface AssignTechnicianPayload {
  technicianId: string;
}

export interface StartDiagnosisPayload {
  notes?: string;
}

export interface StartRepairPayload {
  diagnosis: string;
  notes?: string;
}

export interface MarkReadyForPickupPayload {
  repairNotes: string;
  notes?: string;
}

export interface UpdateTicketStatusPayload {
  notes?: string;
}

export interface MarkUnrepairablePayload {
  reason: string;
  notes?: string;
}

