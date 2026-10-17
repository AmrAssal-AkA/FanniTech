"use client";

import { Wrench, Cpu, Activity, Timer, TrendingUp } from "lucide-react";
import type { TechnicianSummaryMetrics } from "@/types/technicians";

interface TechniciansMetricsProps {
  metrics: TechnicianSummaryMetrics;
}

export function TechniciansMetrics({ metrics }: TechniciansMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pt-5">
      {/* KPI 1: Active Specialists */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-xs transition-shadow">
        <div className="absolute right-0 top-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
            Active Specialists
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {metrics.activeOnShift} / {metrics.totalSpecialists}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            On Shift
          </span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 font-medium text-sky-700 dark:text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            75% Capacity Active
          </span>
          <span className="font-mono text-zinc-400 text-[11px]">1 Break · 1 Off</span>
        </div>
      </div>

      {/* KPI 2: Bench Station Utilization */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-xs transition-shadow">
        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
            Bench Station Utilization
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {metrics.occupancyRate}%
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Occupancy
          </span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            {metrics.activeBays} of {metrics.totalBays} Bays Engaged
          </span>
          <span className="font-mono text-zinc-400 text-[11px]">1 Calib Bay Free</span>
        </div>
      </div>

      {/* KPI 3: Bench Workload Density */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-xs transition-shadow">
        <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
            Bench Workload Density
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {metrics.activeTicketsCount}
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Active Tickets
          </span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Avg {metrics.avgTicketsPerTech.toFixed(1)} / Specialist</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold">
            {metrics.urgentTicketsCount} VIP URGENT
          </span>
        </div>
      </div>

      {/* KPI 4: Avg SLA Resolution Turnaround */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:shadow-xs transition-shadow">
        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-start justify-between">
          <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
            Avg SLA Turnaround
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Timer className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-sky-700 dark:text-sky-400 font-mono">
            {metrics.avgTurnaroundHours} hrs
          </span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Target &lt; {metrics.targetTurnaroundHours}.0h
          </span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            {metrics.slaPassRate}% SLA pass
          </span>
          <span className="font-mono text-zinc-400 text-[11px]">Lab Benchmark</span>
        </div>
      </div>
    </div>
  );
}

