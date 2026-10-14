import useSWR from "swr";
import {
  fetchRepairTickets,
  assignTechnicianToTicket,
  startTicketDiagnosis,
  startTicketRepair,
  markTicketReadyForPickup,
  completeTicket,
  markTicketUnrepairable,
  cancelTicket,
} from "@/services/tickets.service";
import type {
  ListTicketsQueryParams,
  ListTicketsResponse,
  RepairTicket,
} from "@/types/tickets";

export function useRepairTickets(filters: ListTicketsQueryParams = {}) {
  const queryParams = new URLSearchParams();
  if (filters.page) queryParams.set("page", String(filters.page));
  if (filters.limit) queryParams.set("limit", String(filters.limit));
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.priority) queryParams.set("priority", filters.priority);
  if (filters.technicianId) queryParams.set("technicianId", filters.technicianId);
  if (filters.assignedToMe !== undefined)
    queryParams.set("assignedToMe", String(filters.assignedToMe));

  const cacheKey = `/api/tickets?${queryParams.toString()}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListTicketsResponse>(
    cacheKey,
    () => fetchRepairTickets(filters),
    {
      revalidateOnFocus: true,
      refreshInterval: 12000,
      keepPreviousData: true,
    }
  );

  const assignTech = async (ticketId: string, technicianId: string) => {
    const res = await assignTechnicianToTicket(ticketId, technicianId);
    await mutate();
    return res;
  };

  const diagnose = async (ticketId: string, notes?: string) => {
    const res = await startTicketDiagnosis(ticketId, notes);
    await mutate();
    return res;
  };

  const repair = async (ticketId: string, diagnosis: string, notes?: string) => {
    const res = await startTicketRepair(ticketId, diagnosis, notes);
    await mutate();
    return res;
  };

  const readyForPickup = async (
    ticketId: string,
    repairNotes: string,
    notes?: string
  ) => {
    const res = await markTicketReadyForPickup(ticketId, repairNotes, notes);
    await mutate();
    return res;
  };

  const complete = async (ticketId: string, notes?: string) => {
    const res = await completeTicket(ticketId, notes);
    await mutate();
    return res;
  };

  const markUnrepair = async (ticketId: string, reason: string, notes?: string) => {
    const res = await markTicketUnrepairable(ticketId, reason, notes);
    await mutate();
    return res;
  };

  const cancel = async (ticketId: string, notes?: string) => {
    const res = await cancelTicket(ticketId, notes);
    await mutate();
    return res;
  };

  return {
    tickets: (data?.items || []) as RepairTicket[],
    pagination: data?.pagination,
    isLoading,
    isValidating,
    isError: !!error,
    error,
    mutate,
    assignTech,
    diagnose,
    repair,
    readyForPickup,
    complete,
    markUnrepair,
    cancel,
  };
}

