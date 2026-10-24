import { Users, Laptop, HardDrive, RefreshCcw } from "lucide-react";
import type { CustomerSummaryMetrics } from "@/types/customers";

interface CustomersMetricsProps {
  metrics: CustomerSummaryMetrics;
}

export function CustomersMetrics({ metrics }: CustomersMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pt-5">
      {/* Card 1: Total Accounts */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
            Total Accounts
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {metrics.totalAccounts}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ↑ +{metrics.newThisMonth} this mo
            </span>
          </div>
          {/* Micro sparkline */}
          <svg className="w-16 h-7 text-sky-500 shrink-0" fill="none" viewBox="0 0 64 24">
            <path
              d="M2 18 L14 15 L26 19 L38 9 L50 12 L62 4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          </svg>
        </div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Verified lab client profiles
        </div>
      </div>

      {/* Card 2: Active Lab Units */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
            Active Lab Units
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Laptop className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {metrics.activeLabUnits}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              On {metrics.benchesCount} Benches
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {metrics.awaitingPartsCount} Awaiting Parts
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Across {metrics.activeOwnersCount} individual & fleet owners
        </div>
      </div>

      {/* Card 3: Cataloged Hardware */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
            Cataloged Hardware
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {metrics.catalogedHardware}
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {metrics.hardwarePerClientAvg}/client avg
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] font-semibold">
            {metrics.serialTiedPercent}% SN Tied
          </span>
        </div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Laptops (58%), Desktops (24%), Handhelds (18%)
        </div>
      </div>

      {/* Card 4: Repeat Client Ratio */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 w-24 h-24 bg-violet-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
            Repeat Client Ratio
          </span>
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <RefreshCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {metrics.repeatClientRatio}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              High Retention
            </span>
          </div>
          {/* Circular progress badge */}
          <div className="w-10 h-10 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-200 dark:text-zinc-800"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-violet-600 dark:text-violet-400"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="28, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute text-[10px] font-bold font-mono text-zinc-800 dark:text-zinc-200">
              28%
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {metrics.repeatClientsCount} Clients with &gt; 2 closed tickets
        </div>
      </div>
    </div>
  );
}

