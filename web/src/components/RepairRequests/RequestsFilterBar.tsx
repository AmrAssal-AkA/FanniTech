"use client";

import { Search, X } from "lucide-react";
import type { RequestFilterTab, RequestsSummaryMetrics } from "@/types/requests";
import { cn } from "@/lib/utils";

interface RequestsFilterBarProps {
  activeTab: RequestFilterTab;
  onTabChange: (tab: RequestFilterTab) => void;
  metrics?: RequestsSummaryMetrics;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function RequestsFilterBar({
  activeTab,
  onTabChange,
  metrics,
  searchQuery,
  onSearchChange,
}: RequestsFilterBarProps) {
  const tabs: { id: RequestFilterTab; label: string; count: number; badgeColor: string }[] = [
    {
      id: "ALL",
      label: "All Requests",
      count: metrics?.totalCount ?? 0,
      badgeColor: activeTab === "ALL" ? "bg-white/20 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
    },
    {
      id: "PENDING",
      label: "Pending Review",
      count: metrics?.pendingCount ?? 0,
      badgeColor:
        activeTab === "PENDING"
          ? "bg-white/20 text-white"
          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    },
    {
      id: "ACCEPTED",
      label: "Accepted",
      count: metrics?.acceptedCount ?? 0,
      badgeColor:
        activeTab === "ACCEPTED"
          ? "bg-white/20 text-white"
          : "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    },
    {
      id: "REJECTED",
      label: "Rejected",
      count: metrics?.rejectedCount ?? 0,
      badgeColor:
        activeTab === "REJECTED"
          ? "bg-white/20 text-white"
          : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300",
    },
    {
      id: "CANCELLED",
      label: "Cancelled",
      count: metrics?.cancelledCount ?? 0,
      badgeColor:
        activeTab === "CANCELLED"
          ? "bg-white/20 text-white"
          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors cursor-pointer",
                isActive
                  ? "bg-sky-700 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full font-mono text-[11px] font-bold",
                  tab.badgeColor
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-80 shrink-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Customer, Phone, Device, or ID..."
          className="w-full h-9 pl-9 pr-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 shadow-2xs focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
