"use client";

import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { TechnicianStatus } from "@/types/technicians";

interface TechniciansFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: TechnicianStatus | "all";
  onStatusFilterChange: (status: TechnicianStatus | "all") => void;
  specializationFilter: string;
  onSpecializationFilterChange: (spec: string) => void;
  specializations: string[];
}

export function TechniciansFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  specializationFilter,
  onSpecializationFilterChange,
  specializations,
}: TechniciansFilterBarProps) {
  return (
    <div className="px-6 pt-5">
      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onStatusFilterChange("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-sky-600 text-white font-semibold shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60"
            }`}
          >
            All Specialists (8)
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("active")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "active"
                ? "bg-sky-600 text-white font-semibold shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                statusFilter === "active" ? "bg-white" : "bg-sky-500"
              }`}
            />
            Active on Bench (6)
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("break")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "break"
                ? "bg-amber-600 text-white font-semibold shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                statusFilter === "break" ? "bg-white" : "bg-amber-500"
              }`}
            />
            On Break (1)
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("off_duty")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "off_duty"
                ? "bg-zinc-700 text-white font-semibold shadow-2xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                statusFilter === "off_duty" ? "bg-white" : "bg-zinc-400"
              }`}
            />
            Off Duty (1)
          </button>
        </div>

        {/* Search & Specialization selector */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search specialist name, TECH-ID, bay station, specialty..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={specializationFilter}
              onChange={(e) => onSpecializationFilterChange(e.target.value)}
              className="h-9 pl-8 pr-7 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 appearance-none focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer"
            >
              <option value="all">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

