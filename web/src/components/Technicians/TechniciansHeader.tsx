"use client";

import { UserPlus } from "lucide-react";

interface TechniciansHeaderProps {
  onAddTechnician: () => void;
}

export function TechniciansHeader({
  onAddTechnician,
}: TechniciansHeaderProps) {
  return (
    <div className="flex flex-col w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">

      {/* Top Action Deck & Title */}
      <div className="px-6 py-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Technician Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sky-700 dark:text-sky-400 text-xs font-semibold font-mono">
              فني تك  Station
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl">
            Real-time oversight of hardware specialists, active component diagnostics, and throughput calibration across Lab #01.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onAddTechnician}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add / Invite Technician</span>
          </button>
        </div>
      </div>
    </div>
  );
}

