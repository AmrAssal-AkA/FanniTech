"use client";

import { GitBranch, ArrowRight } from "lucide-react";

export function PipelineLifecycleBanner() {
  const steps = [
    { id: 1, label: "1. Customer App", active: false, dotColor: "bg-zinc-400" },
    { id: 2, label: "2. Repair Request", active: true, dotColor: "bg-white" },
    { id: 3, label: "3. Triage & Accept", active: false, dotColor: "bg-sky-500" },
    { id: 4, label: "4. Repair Ticket", active: false, dotColor: "bg-blue-600" },
    { id: 5, label: "5. Tech Assigned", active: false, dotColor: "bg-zinc-400" },
  ];

  return (
    <div className="bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Title & icon */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-700 dark:text-sky-300">
          <GitBranch className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-wider text-sky-800 dark:text-sky-300 font-bold">
            Standard Pipeline
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Intake to Workbench Lifecycle
          </span>
        </div>
      </div>

      {/* Pipeline Stages Strip */}
      <div className="flex items-center overflow-x-auto w-full md:w-auto py-1 gap-2 text-zinc-600 dark:text-zinc-300">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs transition-all ${
                step.active
                  ? "bg-sky-700 text-white shadow-xs font-bold"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${step.dotColor}`} />
              <span>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
