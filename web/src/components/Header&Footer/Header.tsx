"use client";
import Image from "next/image";
import { ShieldCheck, Store } from "lucide-react";

import { NotificationBell } from "@/components/Notifications/NotificationBell";


export function Header() {
  return (
    <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800 shadow-[0_1px_8px_rgba(0,0,0,0.03)] py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <Image
              src="/Logo.png"
              alt="FanniTech Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[17px] text-zinc-900 dark:text-zinc-50 tracking-tight">
                FanniTech
              </span>
              <span className="font-bold text-[17px] text-sky-700 dark:text-sky-400">
                فني تك
              </span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Repair Center Lab OS
            </span>
          </div>
        </div>
        {/* Lab branch status and portal badges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-sky-50/70 dark:bg-zinc-900/80 border border-sky-100 dark:border-zinc-800 px-3 py-1.5 rounded-lg">
          <NotificationBell />
          </div>
          <div className="flex items-center gap-1.5 bg-sky-100/70 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border border-sky-200/60 dark:border-sky-800 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-sky-700 dark:text-sky-300" />
            <span className="text-[11px] font-semibold tracking-wide">
              Lab Access Portal v1.0
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
