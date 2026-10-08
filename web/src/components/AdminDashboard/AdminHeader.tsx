"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { useAdminDashboardUIStore } from "@/Portal/adminDashboardUIStore";

interface AdminHeaderProps {
  benchCapacity?: string;
  slaRate?: string;
  unreadNotifications?: number;
}

export function AdminHeader({
  benchCapacity = "8/10",
  slaRate = "98.4%",
  unreadNotifications = 3,
}: AdminHeaderProps) {
  const searchQuery = useAdminDashboardUIStore((state) => state.searchQuery);
  const setSearchQuery = useAdminDashboardUIStore((state) => state.setSearchQuery);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 z-40 flex items-center justify-between px-6 shadow-xs">
      {/* Universal Search & Branch Indicator */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Universal search (Ticket #, Serial, IMEI, Customer, Model)..."
            className="w-full h-9.5 pl-9 pr-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 transition-all"
          />
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Branch #01 - Main Lab
          </span>
        </div>
      </div>

      {/* Operational SLA telemetry, Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Bench & SLA Pills */}
        <div className="hidden xl:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900 text-sky-800 dark:text-sky-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
            Bench: {benchCapacity}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            SLA: {slaRate}
          </span>
        </div>

        {/* Notifications button */}
        <div className="relative">
          <button
            type="button"
            aria-label="View notifications"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold leading-none ring-2 ring-white dark:ring-zinc-950">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* User profile dropdown snippet */}
        <div className="flex items-center gap-3 pl-2 border-l border-zinc-200/80 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs ring-1 ring-zinc-200 dark:ring-zinc-700">
            TM
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
              Tariq Al-Mansoor
            </span>
            <span className="text-[11px] text-zinc-500 leading-tight">
              Owner / Admin
            </span>
          </div>
          <button
            type="button"
            aria-label="User menu"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
