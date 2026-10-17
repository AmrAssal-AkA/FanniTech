"use client";

import Image from "next/image";
import { useState } from "react";
import { Bell, Wrench } from "lucide-react";
import type { TechnicianProfile } from "@/types/technicians";

interface TechnicianSecondaryCardProps {
  technician: TechnicianProfile;
  onActionClick?: (techId: string) => void;
}

export function TechnicianSecondaryCard({
  technician,
  onActionClick,
}: TechnicianSecondaryCardProps) {
  const [imageError, setImageError] = useState(false);
  const isBreak = technician.status === "break";

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {technician.avatarUrl && !imageError ? (
                <Image
                  src={technician.avatarUrl}
                  alt={technician.name}
                  width={48}
                  height={48}
                  onError={() => setImageError(true)}
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold flex items-center justify-center text-sm border border-sky-200 dark:border-sky-800">
                  {technician.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {technician.name}
              </h4>
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {technician.techId} • {technician.bayName}
              </span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
              isBreak
                ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                : "bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBreak ? "bg-amber-500" : "bg-sky-500 animate-pulse"
              }`}
            />
            {technician.statusLabel}
          </span>
        </div>

        {/* Bench Task Container */}
        {isBreak ? (
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500 font-bold">PAUSED BENCH</span>
              <span className="text-zinc-400">Standby: {technician.benchQueueCount} units</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic truncate">
              {technician.pausedBenchReason}
            </p>
          </div>
        ) : (
          technician.activeTicket && (
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-sky-700 dark:text-sky-400 font-bold">
                  {technician.activeTicket.ticketNumber}
                </span>
                <span className="text-zinc-400">{technician.activeTicket.defectDescription}</span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate font-medium">
                {technician.activeTicket.deviceModel}
              </p>
            </div>
          )
        )}

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80">
            <span className="font-mono text-[10px] text-zinc-400 uppercase block">QUEUE</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {technician.benchQueueCount} units
            </span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80">
            <span className="font-mono text-[10px] text-zinc-400 uppercase block">TODAY</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {technician.todayTargetOrAvg}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80">
            <span className="font-mono text-[10px] text-zinc-400 uppercase block">
              {isBreak ? "SLA" : "QA PASS"}
            </span>
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 font-mono">
              {technician.qaPassRate}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
          {isBreak ? technician.returnTime : technician.specialization}
        </span>
        <button
          type="button"
          onClick={() => onActionClick?.(technician.id)}
          className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
        >
          {isBreak ? (
            <>
              <Bell className="w-3.5 h-3.5 text-zinc-500" />
              <span>Page Tech</span>
            </>
          ) : (
            <>
              <Wrench className="w-3.5 h-3.5 text-zinc-500" />
              <span>Bench Hub</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

