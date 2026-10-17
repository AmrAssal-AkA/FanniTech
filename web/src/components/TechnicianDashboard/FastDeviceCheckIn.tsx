"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, Search, Check } from "lucide-react";
import { useTechnicianDashboardUIStore } from "@/Portal/technicianDashboardUIStore";

interface FastDeviceCheckInProps {
  onScan?: (barcode: string) => void;
}

export function FastDeviceCheckIn({ onScan }: FastDeviceCheckInProps) {
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setSearchQuery = useTechnicianDashboardUIStore((state) => state.setSearchQuery);

  // Global keyboard shortcut: Ctrl + / or Cmd + /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setFeedback("Scanner input focused (Ctrl + /)");
        setTimeout(() => setFeedback(null), 2000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    setSearchQuery(val);
    onScan?.(val);
    setFeedback(`Scanned: ${val}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Fast Device Check-in
          </h3>
        </div>
        <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-semibold border border-zinc-200 dark:border-zinc-700">
          USB-HID
        </span>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
        Scan device label, chassis QR, or intake barcode to instantly open ticket on Bench #04.
        Press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-mono">Ctrl+/</kbd> to focus.
      </p>

      <form onSubmit={handleLookup} className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setSearchQuery(e.target.value);
          }}
          placeholder="Scan Barcode or Type TCK-#..."
          className="w-full h-10 pl-9 pr-20 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono text-xs focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-sky-600 border border-zinc-200/80 dark:border-zinc-700 transition-all"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-colors shadow-2xs"
        >
          Lookup
        </button>
      </form>

      {feedback && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}

