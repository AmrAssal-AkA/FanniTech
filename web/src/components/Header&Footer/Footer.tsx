import { Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 py-3.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
          <span>End-to-End Encrypted Hardware Diagnostic Session</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-zinc-500">ISO/IEC 27001 Certified Lab</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>Internal Personnel Only</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>© 2024 FanniTech OS</span>
        </div>
      </div>
    </footer>
  );
}
