import { create } from "zustand";

interface AdminDashboardUIState {
  searchQuery: string;
  activeFilterOnly: boolean;
  selectedTechFilter: string | null;
  setSearchQuery: (query: string) => void;
  toggleActiveFilter: () => void;
  setSelectedTechFilter: (techId: string | null) => void;
  resetFilters: () => void;
}

export const useAdminDashboardUIStore = create<AdminDashboardUIState>((set) => ({
  searchQuery: "",
  activeFilterOnly: false,
  selectedTechFilter: null,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleActiveFilter: () => set((state) => ({ activeFilterOnly: !state.activeFilterOnly })),
  setSelectedTechFilter: (selectedTechFilter) => set({ selectedTechFilter }),
  resetFilters: () => set({ searchQuery: "", activeFilterOnly: false, selectedTechFilter: null }),
}));
