import { create } from "zustand";

export type TechnicianQueueTab =
  | "ALL"
  | "DIAGNOSING"
  | "IN_REPAIR"
  | "READY_FOR_PICKUP";

interface TechnicianDashboardUIState {
  searchQuery: string;
  statusFilter: TechnicianQueueTab;
  selectedTicketId: string | null;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: TechnicianQueueTab) => void;
  setSelectedTicketId: (ticketId: string | null) => void;
  resetFilters: () => void;
}

export const useTechnicianDashboardUIStore = create<TechnicianDashboardUIState>(
  (set) => ({
    searchQuery: "",
    statusFilter: "ALL",
    selectedTicketId: null,

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setSelectedTicketId: (selectedTicketId) => set({ selectedTicketId }),
    resetFilters: () => set({ searchQuery: "", statusFilter: "ALL" }),
  })
);
