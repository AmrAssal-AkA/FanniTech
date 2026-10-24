"use client";

import { Layers, CheckSquare, DoorOpen, Mail, Phone } from "lucide-react";
import { useAuth } from "@/Hooks/useAuth";
import type { WorkbenchTechnician } from "@/types/technicianDashboard";

interface WorkbenchHeaderProps {
  technician: WorkbenchTechnician;
  activeCount: number;
  readyCount: number;
}

export function WorkbenchHeader({
  technician,
  activeCount,
  readyCount,
}: WorkbenchHeaderProps) {
  const { logout } = useAuth();

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300">
              <span className="h-2 w-2 rounded-full bg-sky-600 dark:bg-sky-400 animate-ping" />
              {technician.employeeId}
            </span>
            <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium">
              <Mail className="w-3.5 h-3.5" />
              {technician.email}
            </span>
            {technician.phone && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  {technician.phone}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Technician Workbench
            </h1>
            <span className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-normal">
              {technician.name}
            </span>
          </div>
        </div>

        {/* Quick Status Pill Badges & Logout */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                Active Load
              </span>
              <span className="text-xs font-semibold">
                {activeCount} {activeCount === 1 ? "Unit" : "Units"} Queued
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-zinc-900 dark:text-zinc-100">
            <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                Ready for Pickup
              </span>
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                {readyCount} {readyCount === 1 ? "Unit" : "Units"} Ready
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <DoorOpen className="w-4 h-4 text-white" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
