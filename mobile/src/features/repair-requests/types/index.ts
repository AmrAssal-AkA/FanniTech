export type RepairRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface RepairRequestImage {
  id: string;
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface ApiRepairRequest {
  id: string;
  deviceId: string;
  problem: string;
  description: string;
  status: RepairRequestStatus;
  images: RepairRequestImage[];
  device?: {
    id: string;
    brand: string;
    model: string;
    deviceType: string;
    serialNumber?: string | null;
  };
  repairTicket?: {
    id: string;
    ticketNumber: string;
    priority: string;
    status: string;
    diagnosis?: string | null;
    repairNotes?: string | null;
    statusHistory?: Array<{
      id: string;
      status: string;
      notes?: string | null;
      changedAt: string;
    }>;
    technician?: {
      id: string;
      user?: {
        name: string;
        phone?: string;
        email?: string;
      };
    } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitRepairRequestInput {
  deviceId: string;
  problem: string;
  description: string;
  images?: { uri: string; name: string; type: string }[];
}

export interface RepairRequestsQuery {
  page?: number;
  limit?: number;
  status?: RepairRequestStatus;
}
