"use client";

import { Wrench, SlidersHorizontal } from "lucide-react";
import type { TechnicianWorkloadItem } from "@/types/dashboard";

interface TechnicianWorkloadProps {
  technicians: TechnicianWorkloadItem[];
  capacityAssigned?: number;
  capacityTotal?: number;
}

export function TechnicianWorkload({
  technicians,
  capacityAssigned = 7,
  capacityTotal = 10,
}: TechnicianWorkloadProps) {
  const percentage = Math.round((capacityAssigned / capacityTotal) * 100);

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
      {/* Section Header */}
      <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-sky-700 dark:text-sky-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Technician Workload
          </h2>
        </div>
        <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
          {technicians.length} Active Techs
        </span>
      </div>

      <div className="p-4 space-y-3.5">
        {technicians.map((tech) => (
          <div
            key={tech.id}
            className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 hover:bg-zinc-100/60 transition-colors space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold text-xs flex items-center justify-center border border-sky-200 dark:border-sky-800">
                  {tech.initials}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                    {tech.name}
                  </div>
                  <div className="text-[11px] text-zinc-500">{tech.role}</div>
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 font-bold text-sky-800 dark:text-sky-300">
                {tech.activeTicketsCount} Tickets
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                <span className="text-zinc-500">On Bench:</span>
                <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                  {tech.currentTicketId}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">
                {tech.currentTaskName}
              </span>
            </div>
          </div>
        ))}

        {/* Workstation Capacity Meter */}
        <div className="pt-2 space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-500">Lab Workstation Capacity</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {capacityAssigned} / {capacityTotal} Assigned
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-sky-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Action Trigger */}
        <button
          type="button"
          className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-zinc-200 dark:border-zinc-700"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Rebalance Technician Load</span>
        </button>
      </div>
    </div>
  );
}
