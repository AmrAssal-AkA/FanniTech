import { appClient } from "@/lib/appClient";
import type { RepairTicket } from "@/types/tickets";
import type {
  TechnicianWorkbenchData,
  UpdateTechnicianNotesPayload,
} from "@/types/technicianDashboard";

export const TECHNICIAN_WORKBENCH_KEY = "/api/technician/workbench";

export const fetchTechnicianWorkbench =
  async (): Promise<TechnicianWorkbenchData> => {
    const res = await appClient.get<{
      success: boolean;
      data: TechnicianWorkbenchData;
    }>(TECHNICIAN_WORKBENCH_KEY);
    return res.data.data;
  };

export const updateTechnicianTicketNotes = async (
  ticketId: string,
  payload: UpdateTechnicianNotesPayload
): Promise<RepairTicket> => {
  const res = await appClient.patch<{
    success: boolean;
    data: RepairTicket;
  }>(`/api/technician/tickets/${ticketId}/notes`, payload);
  return res.data.data;
};
