import { appClient } from "@/lib/appClient";
import type {
  RepairTicket,
  RepairStatusHistoryItem,
  ListTicketsQueryParams,
  ListTicketsResponse,
} from "@/types/tickets";

export const fetchRepairTickets = async (
  params?: ListTicketsQueryParams
): Promise<ListTicketsResponse> => {
  const response = await appClient.get<ListTicketsResponse>("/api/tickets", {
    params,
  });
  return response.data;
};

export const fetchRepairTicketById = async (
  id: string
): Promise<RepairTicket> => {
  const response = await appClient.get<{
    success: boolean;
    ticket: RepairTicket;
  }>(`/api/tickets/${id}`);
  return response.data.ticket;
};

export const fetchTicketHistory = async (
  id: string
): Promise<RepairStatusHistoryItem[]> => {
  const response = await appClient.get<{
    success: boolean;
    history: RepairStatusHistoryItem[];
  }>(`/api/tickets/${id}/history`);
  return response.data.history || [];
};

export const assignTechnicianToTicket = async (
  ticketId: string,
  technicianId: string
): Promise<{ success: boolean; data: RepairTicket }> => {
  const response = await appClient.patch<{
    success: boolean;
    data: RepairTicket;
  }>(`/api/tickets/${ticketId}/assign`, { technicianId });
  return response.data;
};

export const startTicketDiagnosis = async (
  ticketId: string,
  notes?: string
): Promise<{ success: boolean; data: RepairTicket }> => {
  const response = await appClient.patch<{
    success: boolean;
    data: RepairTicket;
  }>(`/api/tickets/${ticketId}/diagnose`, { notes });
  return response.data;
};

export const startTicketRepair = async (
  ticketId: string,
  diagnosis: string,
  notes?: string
): Promise<{ success: boolean; data: RepairTicket }> => {
  const response = await appClient.patch<{
    success: boolean;
    data: RepairTicket;
  }>(`/api/tickets/${ticketId}/repair`, { diagnosis, notes });
  return response.data;
};

export const markTicketReadyForPickup = async (
  ticketId: string,
  repairNotes: string,
  notes?: string
): Promise<{ success: boolean; data: RepairTicket }> => {
  const response = await appClient.patch<{
    success: boolean;
    data: RepairTicket;
  }>(`/api/tickets/${ticketId}/ready-for-pickup`, { repairNotes, notes });
  return response.data;
};

export const completeTicket = async (
  ticketId: string,
  notes?: string
): Promise<{ success: boolean; data: RepairTicket }> => {
  const response = await appClient.patch<{
    success: boolean;
    data: RepairTicket;
  }>(`/api/tickets/${ticketId}/complete`, { notes });
  return response.data;
};

export const markTicketUnrepairable = async (
  ticketId: string,
  reason: string,
  notes?: string
): Promise<{ success: boolean; data: RepairTicket }> => {
  const response = await appClient.patch<{
    success: boolean;
    data: RepairTicket;
  }>(`/api/tickets/${ticketId}/unrepairable`, { reason, notes });
  return response.data;
};

export const cancelTicket = async (
  ticketId: string,
  notes?: string
): Promise<{ success: boolean; data: RepairTicket }> => {
  const response = await appClient.patch<{
    success: boolean;
    data: RepairTicket;
  }>(`/api/tickets/${ticketId}/cancel`, { notes });
  return response.data;
};

