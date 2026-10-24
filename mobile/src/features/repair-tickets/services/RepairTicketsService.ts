import { serverClient } from '../../../utils/serverClient';
import { ApiRepairTicketResponse } from '../types';

export const RepairTicketsService = {
  getTicketByIdOrNumber: async (
    ticketIdOrNumber: string
  ): Promise<ApiRepairTicketResponse> => {
    const encoded = encodeURIComponent(ticketIdOrNumber);
    const response = await serverClient.get<
      { data?: ApiRepairTicketResponse } | ApiRepairTicketResponse
    >(`/api/v1/repair-requests/tickets/${encoded}`);
    const payload = response.data;
    if (
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      payload.data
    ) {
      return payload.data;
    }
    return payload as ApiRepairTicketResponse;
  },

  getTicketByRequestId: async (
    requestId: string
  ): Promise<ApiRepairTicketResponse | null> => {
    const response = await serverClient.get<{
      data?: { repairTicket?: ApiRepairTicketResponse };
      repairTicket?: ApiRepairTicketResponse;
    }>(`/api/v1/repair-requests/${requestId}`);
    const payload = response.data;
    if (payload && 'data' in payload && payload.data) {
      return payload.data.repairTicket ?? null;
    }
    return payload?.repairTicket ?? null;
  },
};
