"use client";

import { Sliders, Layers, CheckSquare, AlertTriangle, ShieldCheck, DoorOpen } from "lucide-react";
import { useTechnicianDashboardUIStore } from "@/Portal/technicianDashboardUIStore";
import { useAuth } from "@/Hooks/useAuth";

interface WorkbenchHeaderProps {
  technicianName?: string;
  technicianRole?: string;
  activeCount?: number;
  readyCount?: number;
}

export function WorkbenchHeader({
  technicianName,
  technicianRole,
  activeCount = 3,
  readyCount = 1,
}: WorkbenchHeaderProps) {
  const benchHold = useTechnicianDashboardUIStore((state) => state.benchHold);
  const toggleBenchHold = useTechnicianDashboardUIStore((state) => state.toggleBenchHold);
  const { logout } = useAuth();

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold transition-colors ${
              benchHold
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300"
                : "bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full animate-ping ${
                benchHold ? "bg-amber-600 dark:bg-amber-400" : "bg-sky-600 dark:bg-sky-400"
              }`}
            />
            {benchHold ? "BAY #04-M ON BENCH HOLD" : "BAY #04-M ACTIVE"}
          </span>
          <span className="font-mono text-zinc-500 dark:text-zinc-400 font-medium">
            CAL-ID: FT-HW-8892
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
            Shift 08:00 - 17:30 AST
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Technician Workbench
          </h1>
          <span className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-normal">
            {technicianName} · {technicianRole}
          </span>
        </div>
      </div>

      {/* Quick Status Pill Badges & Bench Control */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100">
          <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              Bench Station
            </span>
            <span className="text-xs font-semibold">
              {benchHold ? "Held for Parts" : "Calibrated & Ready"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              Active Load
            </span>
            <span className="text-xs font-semibold">{activeCount} Units Queued</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-zinc-900 dark:text-zinc-100">
          <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              Pending QA
            </span>
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
              {readyCount} Unit Ready
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleBenchHold}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
            benchHold
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-sky-700 hover:bg-sky-800 text-white"
          }`}
        >
          {benchHold ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Resume Active</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>Bench Hold</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
        >
          <DoorOpen className="w-4 h-4 text-black" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
