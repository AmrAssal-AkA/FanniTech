"use client";

import { useState } from "react";
import { Edit3, Copy, Send, Check, BadgeInfo } from "lucide-react";
import { useTechnicianDashboardUIStore } from "@/Portal/technicianDashboardUIStore";

interface BenchScratchpadProps {
  technicianTag?: string;
}

export function BenchScratchpad({
  technicianTag = "Ahmed Z. · Bay #04",
}: BenchScratchpadProps) {
  const scratchpadText = useTechnicianDashboardUIStore((state) => state.scratchpadText);
  const setScratchpadText = useTechnicianDashboardUIStore((state) => state.setScratchpadText);

  const [copied, setCopied] = useState(false);
  const [postedMessage, setPostedMessage] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scratchpadText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePost = () => {
    setPostedMessage("Note posted to shift log.");
    setTimeout(() => setPostedMessage(null), 2500);
  };

  return (
    <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Bench Scratchpad / Handoff
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold border border-zinc-200 dark:border-zinc-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400 animate-pulse" />
          <span>Auto-saved 11:58</span>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2.5">
        Shared shift log for next technician rotation &amp; lead engineer sync.
      </p>

      <textarea
        value={scratchpadText}
        onChange={(e) => setScratchpadText(e.target.value)}
        rows={3}
        className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-xs focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-sky-600 border border-zinc-200/80 dark:border-zinc-700 transition-all resize-none leading-relaxed"
        placeholder="Add bench notes for shift lead or night technician (e.g., awaiting 20V ceramic caps on Bay #04)..."
      />

      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-zinc-500 dark:text-zinc-400 font-semibold text-[11px]">
          <BadgeInfo className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>{technicianTag}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1 border border-zinc-200/80 dark:border-zinc-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePost}
            className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post to Shift Log</span>
          </button>
        </div>
      </div>

      {postedMessage && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{postedMessage}</span>
        </div>
      )}
    </div>
  );
}

