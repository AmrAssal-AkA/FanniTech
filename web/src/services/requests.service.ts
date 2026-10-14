import { appClient } from "@/lib/appClient";
import type {
  DetailedRepairRequest,
  RequestsSummaryMetrics,
  TriageConversionPayload,
  RejectRequestPayload,
  TechnicianOption,
} from "@/types/requests";

export interface FetchRequestsResponse {
  success?: boolean;
  requests: DetailedRepairRequest[];
  items?: DetailedRepairRequest[];
  metrics: RequestsSummaryMetrics;
  technicians: TechnicianOption[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ConvertRequestResponse {
  success: boolean;
  message: string;
  ticketId: string;
  data?: unknown;
}

export interface RejectRequestResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const fetchRepairRequests = async (
  status?: string,
  query?: string,
  page = 1,
  limit = 50
): Promise<FetchRequestsResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (status && status !== "ALL") {
    params.status = status;
  }
  if (query) {
    params.q = query;
  }

  const response = await appClient.get<FetchRequestsResponse>(
    "/api/admin/requests",
    { params }
  );
  return response.data;
};

export const fetchRepairRequestById = async (
  id: string
): Promise<{ success: boolean; request: DetailedRepairRequest }> => {
  const response = await appClient.get<{
    success: boolean;
    request: DetailedRepairRequest;
  }>(`/api/admin/requests/${id}`);
  return response.data;
};

export const fetchTechnicians = async (): Promise<TechnicianOption[]> => {
  const response = await appClient.get<{
    success: boolean;
    technicians: TechnicianOption[];
  }>("/api/admin/technicians");
  return response.data.technicians || [];
};

export const convertRequestToTicket = async (
  payload: TriageConversionPayload
): Promise<ConvertRequestResponse> => {
  const response = await appClient.patch<ConvertRequestResponse>(
    `/api/admin/requests/${payload.requestId}/accept`,
    {
      assignedTechnicianId: payload.assignedTechnicianId,
      technicianId: payload.assignedTechnicianId,
      priority: payload.priority,
    }
  );
  return response.data;
};

export const rejectRepairRequest = async (
  payload: RejectRequestPayload
): Promise<RejectRequestResponse> => {
  const response = await appClient.patch<RejectRequestResponse>(
    `/api/admin/requests/${payload.requestId}/reject`,
    {
      reason: payload.reason,
    }
  );
  return response.data;
};

export const quickAcceptRequest = async (
  requestId: string
): Promise<ConvertRequestResponse> => {
  const response = await appClient.patch<ConvertRequestResponse>(
    `/api/admin/requests/${requestId}/accept`,
    {
      priority: "NORMAL",
    }
  );
  return response.data;
};
