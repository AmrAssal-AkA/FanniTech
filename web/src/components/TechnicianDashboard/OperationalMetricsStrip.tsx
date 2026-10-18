import {
  Inbox,
  Microscope,
  Wrench,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";
import type { WorkbenchMetrics } from "@/types/technicianDashboard";

interface OperationalMetricsStripProps {
  metrics: WorkbenchMetrics;
  diagnosingTicketCode?: string | null;
  diagnosingDevice?: string | null;
  inRepairTicketCode?: string | null;
  inRepairDevice?: string | null;
  readyTicketCode?: string | null;
  readyDevice?: string | null;
}

export function OperationalMetricsStrip({
  metrics,
  diagnosingTicketCode,
  diagnosingDevice,
  inRepairTicketCode,
  inRepairDevice,
  readyTicketCode,
  readyDevice,
}: OperationalMetricsStripProps) {
  const criticalRatio =
    metrics.activeQueueCount > 0
      ? Math.min(100, Math.round((metrics.criticalUrgentCount / metrics.activeQueueCount) * 100))
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Active In-Queue */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            Active Queue
          </span>
          <Inbox className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.activeQueueCount}
          </span>
          <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
            {metrics.criticalUrgentCount} High Priority
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mt-2.5 flex">
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${criticalRatio}%` }}
          />
          <div
            className="h-full bg-sky-500 transition-all"
            style={{ width: `${metrics.activeQueueCount > 0 ? 100 - criticalRatio : 0}%` }}
          />
        </div>
      </div>

      {/* 2. Currently Under Diagnosis */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            Under Diagnosis
          </span>
          <Microscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.underDiagnosisCount}
          </span>
          {diagnosingTicketCode && (
            <span className="font-mono text-xs text-sky-700 dark:text-sky-400 font-bold truncate">
              {diagnosingTicketCode}
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
          {diagnosingDevice || "No ticket in diagnosis"}
        </span>
      </div>

      {/* 3. Currently In Repair */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            In Repair
          </span>
          <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.inRepairCount}
          </span>
          {inRepairTicketCode && (
            <span className="font-mono text-xs text-blue-700 dark:text-blue-400 font-bold truncate">
              {inRepairTicketCode}
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
          {inRepairDevice || "No ticket in repair"}
        </span>
      </div>

      {/* 4. Ready for Pickup */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            Ready for Pickup
          </span>
          <ClipboardCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.readyForQACount}
          </span>
          {readyTicketCode && (
            <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-semibold truncate">
              {readyTicketCode}
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
          {readyDevice || "No units awaiting pickup"}
        </span>
      </div>

      {/* 5. Completed Today */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow col-span-2 md:col-span-1 xl:col-span-1">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            Completed Today
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.completedTodayCount}
          </span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            {metrics.completedTodayCount === 1 ? "Ticket" : "Tickets"}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
          Closed since start of day
        </span>
      </div>
    </div>
  );
}
