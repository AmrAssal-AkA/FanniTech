"use client";

import { ChevronRight } from "lucide-react";
import type { TechnicianProfile } from "@/types/technicians";

interface TechnicianCompactRowProps {
  technician: TechnicianProfile;
  onClick?: (techId: string) => void;
}

export function TechnicianCompactRow({
  technician,
  onClick,
}: TechnicianCompactRowProps) {
  const isOffDuty = technician.status === "off_duty";
  const initials = technician.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      onClick={() => onClick?.(technician.id)}
      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-200 text-xs shrink-0 font-mono">
          {initials}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {technician.name} ({technician.arabicName})
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              {technician.techId}
            </span>
            {technician.role === "Senior Supervisor" && (
              <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-mono text-[10px] font-bold border border-sky-200 dark:border-sky-900">
                SENIOR SUPERVISOR
              </span>
            )}
            {technician.role === "Junior Tech" && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-[10px] border border-zinc-200 dark:border-zinc-700">
                Junior Tech
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
            <span>{technician.bayName}</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            {isOffDuty ? (
              <span className="font-mono text-zinc-400">{technician.shift}</span>
            ) : (
              <span className="text-sky-700 dark:text-sky-400 font-mono">
                Active on {technician.activeTicket?.ticketNumber} (
                {technician.activeTicket?.deviceModel})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
        <div className="text-right hidden md:block">
          <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {technician.benchQueueCount} assigned
          </span>
          <span className="block font-mono text-[11px] text-zinc-400">
            {isOffDuty
              ? technician.certifications?.[0]
              : `Pass rate: ${technician.qaPassRate}`}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] ${
            isOffDuty
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
              : "bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOffDuty ? "bg-zinc-400" : "bg-sky-500"
            }`}
          />
          {technician.statusLabel}
        </span>

        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200/80 dark:group-hover:bg-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

