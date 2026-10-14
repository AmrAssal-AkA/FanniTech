import useSWR from "swr";
import {
  fetchRepairTicketById,
  fetchTicketHistory,
} from "@/services/tickets.service";
import type { RepairTicket, RepairStatusHistoryItem } from "@/types/tickets";

export function useTicketDetails(ticketId: string | null) {
  const {
    data: ticket,
    error: ticketError,
    isLoading: isTicketLoading,
    mutate: mutateTicket,
  } = useSWR<RepairTicket | null>(
    ticketId ? `/api/tickets/${ticketId}` : null,
    () => (ticketId ? fetchRepairTicketById(ticketId) : null),
    { revalidateOnFocus: true }
  );

  const {
    data: history,
    error: historyError,
    isLoading: isHistoryLoading,
    mutate: mutateHistory,
  } = useSWR<RepairStatusHistoryItem[]>(
    ticketId ? `/api/tickets/${ticketId}/history` : null,
    () => (ticketId ? fetchTicketHistory(ticketId) : []),
    { revalidateOnFocus: true }
  );

  const refreshAll = async () => {
    await Promise.all([mutateTicket(), mutateHistory()]);
  };

  return {
    ticket,
    history: history || [],
    isLoading: isTicketLoading || isHistoryLoading,
    isTicketLoading,
    isHistoryLoading,
    isError: !!ticketError || !!historyError,
    error: ticketError || historyError,
    mutateTicket,
    mutateHistory,
    refreshAll,
  };
}

