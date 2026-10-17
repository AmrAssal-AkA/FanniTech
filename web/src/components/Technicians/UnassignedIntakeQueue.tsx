"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import type { PendingIntakeItem } from "@/types/technicians";

interface UnassignedIntakeQueueProps {
  intakes: PendingIntakeItem[];
  onAssignRequest: (item: PendingIntakeItem) => void;
  onAutoBalance: () => void;
  isBalancing?: boolean;
}

export function UnassignedIntakeQueue({
  intakes,
  onAssignRequest,
  onAutoBalance,
  isBalancing = false,
}: UnassignedIntakeQueueProps) {
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Unassigned Intake Queue
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold border border-rose-200 dark:border-rose-900">
          {intakes.length} PENDING
        </span>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Customer intake requests approved by reception awaiting bench assignment based on specialization.
      </p>

      {/* Items list */}
      <div className="space-y-2.5">
        {intakes.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-sky-300 dark:hover:border-sky-900 transition-colors"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                  {item.requestCode}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-semibold">
                  {item.categoryTag}
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                {item.deviceTitle}
              </span>
              <span className="font-mono text-[10px] text-zinc-400 block truncate">
                {item.intakeTimeAgo} · Rec: {item.recommendedTechnician} ({item.recommendedBay})
              </span>
            </div>

            <button
              type="button"
              onClick={() => onAssignRequest(item)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>Assign</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* 1-Click Auto-Balance Action */}
      <button
        type="button"
        onClick={onAutoBalance}
        disabled={isBalancing}
        className="w-full py-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900 hover:bg-sky-100/80 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
      >
        <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        <span>
          {isBalancing ? "Balancing Workbench Load..." : "1-Click Auto-Balance Workbench"}
        </span>
      </button>
    </div>
  );
}

