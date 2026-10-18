"use client";

import useSWR from "swr";
import {
  TECHNICIAN_WORKBENCH_KEY,
  fetchTechnicianWorkbench,
  updateTechnicianTicketNotes,
} from "@/services/technicianDashboard.service";
import {
  startTicketDiagnosis,
  startTicketRepair,
  markTicketReadyForPickup,
  completeTicket as completeTicketRequest,
  markTicketUnrepairable,
} from "@/services/tickets.service";
import type {
  TechnicianWorkbenchData,
  UpdateTechnicianNotesPayload,
} from "@/types/technicianDashboard";

export function useTechnicianDashboard() {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<TechnicianWorkbenchData>(
      TECHNICIAN_WORKBENCH_KEY,
      fetchTechnicianWorkbench,
      {
        revalidateOnFocus: true,
        refreshInterval: 15000,
        keepPreviousData: true,
      }
    );

  const saveNotes = async (
    ticketId: string,
    payload: UpdateTechnicianNotesPayload
  ) => {
    const updated = await updateTechnicianTicketNotes(ticketId, payload);
    await mutate();
    return updated;
  };

  const startDiagnosis = async (ticketId: string, notes?: string) => {
    const res = await startTicketDiagnosis(ticketId, notes);
    await mutate();
    return res.data;
  };

  const startRepair = async (
    ticketId: string,
    diagnosis: string,
    notes?: string
  ) => {
    const res = await startTicketRepair(ticketId, diagnosis, notes);
    await mutate();
    return res.data;
  };

  const markReadyForPickup = async (
    ticketId: string,
    repairNotes: string,
    notes?: string
  ) => {
    const res = await markTicketReadyForPickup(ticketId, repairNotes, notes);
    await mutate();
    return res.data;
  };

  const completeTicket = async (ticketId: string, notes?: string) => {
    const res = await completeTicketRequest(ticketId, notes);
    await mutate();
    return res.data;
  };

  const markUnrepairable = async (
    ticketId: string,
    reason: string,
    notes?: string
  ) => {
    const res = await markTicketUnrepairable(ticketId, reason, notes);
    await mutate();
    return res.data;
  };

  return {
    data,
    isLoading: isLoading && !data,
    isValidating,
    isError: !!error,
    error,
    mutate,
    saveNotes,
    startDiagnosis,
    startRepair,
    markReadyForPickup,
    completeTicket,
    markUnrepairable,
  };
}

