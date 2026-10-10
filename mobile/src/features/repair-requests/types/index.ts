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
