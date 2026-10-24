"use client";

import Link from "next/link";
import {
  AlertTriangle,
  FlaskConical,
  CheckCircle2,
  Package,
  MoreVertical,
} from "lucide-react";
import type { ActiveTicketItem } from "@/types/dashboard";

interface ActiveTicketsPipelineProps {
  tickets: ActiveTicketItem[];
}

export function ActiveTicketsPipeline({ tickets }: ActiveTicketsPipelineProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-900 font-mono text-[10px] font-bold">
            CRITICAL PRIORITY
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-mono text-[10px] font-bold">
            HIGH PRIORITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] font-medium">
            NORMAL PRIORITY
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_REPAIR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200 dark:border-sky-900 text-[11px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            IN_REPAIR
          </span>
        );
      case "DIAGNOSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            DIAGNOSING
          </span>
        );
      case "READY_FOR_PICKUP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 text-[11px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            READY_FOR_PICKUP
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[11px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {status}
          </span>
        );
    }
  };

  const getIconForStage = (status: string, priority: string) => {
    if (priority === "CRITICAL") {
      return (
        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200/60 dark:border-red-900">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
    }
    if (status === "DIAGNOSING") {
      return (
        <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/60 dark:border-sky-900">
          <FlaskConical className="w-5 h-5" />
        </div>
      );
    }
    if (status === "READY_FOR_PICKUP") {
      return (
        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-900">
          <Package className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-900">
        <CheckCircle2 className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
      {/* Section Header */}
      <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Active Tickets Pipeline Overview
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/repair-tickets"
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
          >
            Open All Tickets &rarr;
          </Link>
        </div>
      </div>

      {/* Tickets List */}
      <div className="p-4 space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-zinc-100/70 dark:hover:bg-zinc-850/60 border border-zinc-200/70 dark:border-zinc-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              {getIconForStage(ticket.status, ticket.priority)}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                    {ticket.id}
                  </span>
                  {getPriorityBadge(ticket.priority)}
                  {ticket.slaDue && (
                    <span className="text-[11px] font-medium text-zinc-500">
                      SLA Due: {ticket.slaDue}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {ticket.deviceModel}
                </div>
                <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                  <span>Assigned:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {ticket.assignedTechName}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span>{ticket.assignedTechRole}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
              <div className="text-left sm:text-right">
                {getStatusBadge(ticket.status)}
                <p className="font-mono text-xs text-zinc-500 mt-1">
                  {ticket.currentStageNote}
                </p>
              </div>
              <button
                type="button"
                aria-label="Ticket options"
                className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
