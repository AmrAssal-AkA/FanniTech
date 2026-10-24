"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { CustomerFilterCategory } from "@/types/customers";

interface CustomersFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: CustomerFilterCategory;
  onFilterChange: (filter: CustomerFilterCategory) => void;
  allCount: number;
  inLabCount: number;
}

export function CustomersFilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  allCount,
  inLabCount,
}: CustomersFilterBarProps) {
  return (
    <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Universal Customer Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, phone (+966), email, or serial number..."
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
        />
      </div>

      {/* Filter Pills Group */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === "all"
              ? "bg-sky-600 text-white shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
          }`}
        >
          All ({allCount})
        </button>
        <button
          type="button"
          onClick={() => onFilterChange("active")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === "active"
              ? "bg-sky-600 text-white shadow-xs"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
          }`}
        >
          In-Lab ({inLabCount})
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"
          title="More filter criteria"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

