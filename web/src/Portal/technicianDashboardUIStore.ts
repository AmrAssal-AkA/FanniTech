import { create } from "zustand";

export type TechnicianQueueTab = "ALL" | "DIAGNOSING" | "IN_REPAIR" | "READY_FOR_PICKUP";

interface TechnicianDashboardUIState {
  searchQuery: string;
  statusFilter: TechnicianQueueTab;
  benchHold: boolean;
  activeStep: number;
  isTimerRunning: boolean;
  timerSeconds: number;
  schematicModalOpen: boolean;
  scratchpadText: string;
  selectedTicketId: string | null;

  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: TechnicianQueueTab) => void;
  toggleBenchHold: () => void;
  setActiveStep: (step: number) => void;
  advanceStep: () => void;
  toggleTimer: () => void;
  incrementTimer: () => void;
  setTimerSeconds: (seconds: number) => void;
  setSchematicModalOpen: (open: boolean) => void;
  setScratchpadText: (text: string) => void;
  setSelectedTicketId: (ticketId: string | null) => void;
  resetFilters: () => void;
}

export const useTechnicianDashboardUIStore = create<TechnicianDashboardUIState>((set) => ({
  searchQuery: "",
  statusFilter: "ALL",
  benchHold: false,
  activeStep: 2,
  isTimerRunning: true,
  timerSeconds: 45 * 60 + 18,
  schematicModalOpen: false,
  scratchpadText:
    "Lenovo T14 VIN short confirmed on PQ301. Need to test driver gate before powering full 65W rail. Zephyrus G14 is ready for 30-min FurMark stress test.",
  selectedTicketId: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  toggleBenchHold: () => set((state) => ({ benchHold: !state.benchHold })),
  setActiveStep: (activeStep) => set({ activeStep }),
  advanceStep: () =>
    set((state) => ({
      activeStep: state.activeStep < 4 ? state.activeStep + 1 : 1,
    })),
  toggleTimer: () => set((state) => ({ isTimerRunning: !state.isTimerRunning })),
  incrementTimer: () => set((state) => ({ timerSeconds: state.timerSeconds + 1 })),
  setTimerSeconds: (timerSeconds) => set({ timerSeconds }),
  setSchematicModalOpen: (schematicModalOpen) => set({ schematicModalOpen }),
  setScratchpadText: (scratchpadText) => set({ scratchpadText }),
  setSelectedTicketId: (selectedTicketId) => set({ selectedTicketId }),
  resetFilters: () => set({ searchQuery: "", statusFilter: "ALL" }),
}));

