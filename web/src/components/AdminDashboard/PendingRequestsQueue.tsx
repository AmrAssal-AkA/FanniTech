"use client";

import { useState } from "react";
import {
  PowerOff,
  Droplets,
  Flame,
  BatteryMedium,
  Monitor,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import type { RepairRequestItem } from "@/types/dashboard";

interface PendingRequestsQueueProps {
  requests: RepairRequestItem[];
}

export function PendingRequestsQueue({ requests }: PendingRequestsQueueProps) {
  const [items, setItems] = useState<RepairRequestItem[]>(requests);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleAccept = (reqId: string, customer: string) => {
    setItems((prev) => prev.filter((item) => item.id !== reqId));
    setFeedbackMessage(`Accepted ${reqId} for ${customer}. Converted into Repair Ticket.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleReject = (reqId: string, customer: string) => {
    setItems((prev) => prev.filter((item) => item.id !== reqId));
    setFeedbackMessage(`Rejected intake ${reqId} for ${customer}. Notification sent.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const getProblemIcon = (category?: string) => {
    switch (category) {
      case "power":
        return <PowerOff className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case "liquid":
        return <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case "thermal":
        return <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case "battery":
        return <BatteryMedium className="w-3.5 h-3.5 text-red-500 shrink-0" />;
      case "screen":
        return <Monitor className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />;
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
      {/* Section Header */}
      <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Urgent Attention &amp; Pending Requests Queue
          </h2>
        </div>
        <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold self-start sm:self-auto">
          {items.length} Unprocessed Intakes
        </span>
      </div>

      {/* Dynamic Feedback Banner */}
      {feedbackMessage && (
        <div className="bg-sky-50 dark:bg-sky-950/60 border-b border-sky-100 dark:border-sky-900 text-sky-800 dark:text-sky-300 text-xs px-4 py-2 flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-sky-600 hover:text-sky-900 dark:hover:text-sky-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/60 dark:bg-zinc-900/60 border-b border-zinc-200/60 dark:border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Request ID</th>
              <th className="px-4 py-3 font-semibold">Customer &amp; Device</th>
              <th className="px-4 py-3 font-semibold">Stated Hardware Problem</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Operational Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-zinc-900 dark:text-zinc-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No pending customer requests awaiting intake conversion.
                </td>
              </tr>
            ) : (
              items.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50 transition-colors"
                >
                  {/* Request ID */}
                  <td className="px-4 py-3.5 font-mono font-bold text-sky-700 dark:text-sky-400">
                    {req.id}
                  </td>

                  {/* Customer & Device */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {req.customerName}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        {req.deviceModel}
                      </span>
                    </div>
                  </td>

                  {/* Hardware Problem */}
                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      {getProblemIcon(req.problemCategory)}
                      <span className="truncate">{req.hardwareProblem}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-mono text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {req.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAccept(req.id, req.customerName)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept &amp; Convert</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(req.id, req.customerName)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-700 hover:border-red-200 rounded-md text-xs font-medium transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
