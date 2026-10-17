import {
  Inbox,
  Microscope,
  CheckCircle2,
  Timer,
  ClipboardCheck,
} from "lucide-react";
import type { WorkbenchMetrics } from "@/types/technicianDashboard";

interface OperationalMetricsStripProps {
  metrics: WorkbenchMetrics;
  diagnosingTicketCode?: string;
  diagnosingDevice?: string;
  readyTicketCode?: string;
  readyDevice?: string;
}

export function OperationalMetricsStrip({
  metrics,
  diagnosingTicketCode = "TCK-2042",
  diagnosingDevice = "Lenovo ThinkPad T14",
  readyTicketCode = "TCK-2038",
  readyDevice = "ASUS Zephyrus G14",
}: OperationalMetricsStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* 1. Active In-Queue */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">Active Queue</span>
          <Inbox className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.activeQueueCount}
          </span>
          <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
            {metrics.criticalUrgentCount} Critical Urgent
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="h-1.5 w-1/3 rounded-full bg-red-500" />
          <div className="h-1.5 w-1/3 rounded-full bg-sky-500" />
          <div className="h-1.5 w-1/3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>

      {/* 2. Currently Under Diagnosis */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">Under Diagnosis</span>
          <Microscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.underDiagnosisCount}
          </span>
          <span className="font-mono text-xs text-sky-700 dark:text-sky-400 font-bold truncate">
            {diagnosingTicketCode}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
          {diagnosingDevice}
        </span>
      </div>

      {/* 3. Ready for Assembly / QA */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">Ready for QA / Run-in</span>
          <ClipboardCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.readyForQACount}
          </span>
          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-semibold truncate">
            {readyTicketCode}
          </span>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
          {readyDevice}
        </span>
      </div>

      {/* 4. Completed Today */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">Completed Today</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.completedTodayCount}
          </span>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            {metrics.passRatePercentage}% Pass Rate
          </span>
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 truncate mt-1">
          +{metrics.aheadOfTargetCount} ahead of daily target
        </span>
      </div>

      {/* 5. Average Bench Diagnostic Time */}
      <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-shadow col-span-2 md:col-span-1 xl:col-span-1">
        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider font-semibold">Avg Diagnostic Time</span>
          <Timer className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {metrics.avgDiagnosticMinutes}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">mins / unit</span>
        </div>
        <span className="text-xs text-sky-700 dark:text-sky-400 font-medium truncate mt-1">
          SLA Target: &lt; {metrics.slaTargetMinutes} mins
        </span>
      </div>
    </div>
  );
}

