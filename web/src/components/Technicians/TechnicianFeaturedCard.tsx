"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Wrench,
  Monitor,
  Cpu,
  MoreVertical,
  Activity,
  ArrowRightLeft,
  Eye,
} from "lucide-react";
import type { TechnicianProfile } from "@/types/technicians";

interface TechnicianFeaturedCardProps {
  technician: TechnicianProfile;
  onInspectTicket?: (ticketId: string) => void;
  onReassign?: (techId: string) => void;
  onTelemetryStream?: (techId: string) => void;
}

export function TechnicianFeaturedCard({
  technician,
  onInspectTicket,
  onReassign,
  onTelemetryStream,
}: TechnicianFeaturedCardProps) {
  const [imageError, setImageError] = useState(false);

  const isUrgent = technician.activeTicket?.priority === "VIP URGENT";

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden transition-all hover:shadow-xs">
      {/* Card Header Strip */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            {technician.avatarUrl && !imageError ? (
              <Image
                src={technician.avatarUrl}
                alt={technician.name}
                width={56}
                height={56}
                onError={() => setImageError(true)}
                className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-2xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold flex items-center justify-center text-lg border border-sky-200 dark:border-sky-800">
                {technician.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {technician.name} ({technician.arabicName})
              </h3>
              {technician.role === "Lead Tech" && (
                <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-mono text-[11px] font-bold border border-sky-200 dark:border-sky-900">
                  LEAD TECH
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                {technician.techId}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
              <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400 font-medium">
                {technician.bayNumber === "04" ? (
                  <Cpu className="w-3.5 h-3.5" />
                ) : (
                  <Monitor className="w-3.5 h-3.5" />
                )}
                {technician.bayName}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span>Shift: {technician.shift}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
            {technician.statusLabel}
          </span>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Active Ticket Banner */}
        {technician.activeTicket && (
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                    isUrgent
                      ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                      : "bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900"
                  }`}
                >
                  {technician.activeTicket.priority}
                </span>
                <span className="font-mono text-xs text-sky-700 dark:text-sky-400 font-bold">
                  {technician.activeTicket.ticketNumber}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {technician.activeTicket.deviceModel}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{technician.activeTicket.defectDescription}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <div className="text-right">
                <span className="font-mono text-xs text-sky-700 dark:text-sky-400 font-bold block">
                  {technician.activeTicket.elapsedTime}
                </span>
                <span className="text-[11px] text-zinc-400 block font-medium">
                  {technician.activeTicket.estimatedRemainingTime}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onInspectTicket?.(technician.activeTicket!.ticketNumber)
                }
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sky-700 dark:text-sky-300 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Ticket</span>
              </button>
            </div>
          </div>
        )}

        {/* Specialist Telemetry & Diagnostics Ledger */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
              Bench Queue
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-0.5 block">
              {technician.benchQueueCount} Tickets
            </span>
            <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 block">
              {technician.queueDetails}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
              Today Completed
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-0.5 block">
              {technician.todayCompletedCount} Units
            </span>
            <span className="font-mono text-[11px] text-sky-700 dark:text-sky-400 block">
              {technician.todayTargetOrAvg}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
              First-Pass QA
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-0.5 block">
              {technician.qaPassRate}
            </span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 block">
              {technician.qaPassNote}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
              Specialization
            </span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 block truncate">
              {technician.specialization}
            </span>
            <span className="font-mono text-[11px] text-zinc-400 block truncate">
              {technician.subSpecialization}
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>
              ESD Mat: {technician.esdMatReading} (Calibrated {technician.esdCalibratedTime})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onReassign?.(technician.id)}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500" />
              <span>Reassign Workload</span>
            </button>
            <button
              type="button"
              onClick={() => onTelemetryStream?.(technician.id)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>
                {technician.role === "Lead Tech"
                  ? "Bench Telemetry Stream"
                  : "Bench Details"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

