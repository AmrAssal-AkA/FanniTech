"use client";

import { RefreshCw, Zap, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestsHeaderProps {
  avgResponseTime?: string;
  appVersion?: string;
  isValidating?: boolean;
  onRefresh: () => void;
}

export function RequestsHeader({
  avgResponseTime = "14 mins",
  appVersion = "Live Sync (App v2.4.1)",
  isValidating = false,
  onRefresh,
}: RequestsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Title & Stream Meta */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-pulse" />
            Intake Stream
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {appVersion}
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Repair Requests
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manage incoming customer requests from the FanniTech customer mobile app
        </p>
      </div>

      {/* Right Metric Card & Action */}
      <div className="flex items-center gap-3 self-start lg:self-auto">
        <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Avg Response Time
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {avgResponseTime}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-700 dark:text-sky-300">
            <Zap className="w-4 h-4 fill-sky-700/20 dark:fill-sky-300/20" />
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isValidating}
          className="h-10 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn("w-3.5 h-3.5", isValidating && "animate-spin text-sky-600")}
          />
          <span>{isValidating ? "Syncing..." : "Sync Feed"}</span>
        </button>
      </div>
    </div>
  );
}
