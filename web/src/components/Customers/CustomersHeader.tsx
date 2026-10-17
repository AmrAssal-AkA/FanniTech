"use client";

import { ChevronRight, ShieldCheck, Activity } from "lucide-react";

interface CustomersHeaderProps {
  totalCount: number;
}

export function CustomersHeader({
  totalCount,
}: CustomersHeaderProps) {
  return (
    <div className="flex flex-col w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      {/* Top Breadcrumb & Status Ribbon */}
      <div className="px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-zinc-200/70 dark:border-zinc-800/70">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Administration</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Customers Management</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold">
            Branch #01 (Eastern Province)
          </span>
        </div>

        {/* Quick Stats Metric Ticker */}
        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Active Workstation Sync:{" "}
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">OK</span>
            </span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>
              Avg TAT: <span className="font-semibold text-zinc-900 dark:text-zinc-100">18.4 hrs</span>
            </span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              Active SLA: <span className="font-semibold text-zinc-900 dark:text-zinc-100">99.1%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Operational Header with Action Toolbar */}
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Customer Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-semibold font-mono">
              {totalCount} Total Registered
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage client profiles, cross-reference serial-bound hardware inventories, and audit repair tickets across Eastern Lab #01.
          </p>
        </div>
      </div>
    </div>
  );
}
