"use client";

import { X, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useTicketDetails } from "@/Hooks/useTicketDetails";
import type { RepairTicket, RepairTicketStatus } from "@/types/tickets";

interface TicketHistoryModalProps {
  ticket: RepairTicket;
  onClose: () => void;
}

export function TicketHistoryModal({
  ticket,
  onClose,
}: TicketHistoryModalProps) {
  const { history, isHistoryLoading } = useTicketDetails(ticket.id);

  const getStatusColor = (status: RepairTicketStatus) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
      case "DIAGNOSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300";
      case "IN_REPAIR":
        return "bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300";
      case "READY_FOR_PICKUP":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300";
      case "UNREPAIRABLE":
        return "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300";
      case "CANCELLED":
        return "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {ticket.ticketNumber}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-mono font-medium">
                  {ticket.request?.device?.brand} {ticket.request?.device?.model}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Customer: {ticket.request?.device?.customer?.user?.name || "Client"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {isHistoryLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
              <span className="text-xs">Loading audit timeline...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <AlertCircle className="w-6 h-6 text-zinc-300" />
              <span className="text-xs">No status transitions recorded yet</span>
            </div>
          ) : (
            <div className="relative pl-6 flex flex-col gap-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {history.map((item, index) => {
                const dateStr = new Date(item.changedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={item.id || index} className="relative flex flex-col gap-1">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-sky-600 flex items-center justify-center" />

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {dateStr}
                      </span>
                    </div>

                    {item.notes ? (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 mt-1">
                        {item.notes}
                      </p>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">
                        No transition notes provided
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Ticket Technical Context */}
          {(ticket.diagnosis || ticket.repairNotes) && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3">
              {ticket.diagnosis && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    Diagnosis Record:
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
                    {ticket.diagnosis}
                  </p>
                </div>
              )}
              {ticket.repairNotes && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    Repair Summary:
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-sky-50/50 dark:bg-sky-950/20 p-2.5 rounded-lg border border-sky-100 dark:border-sky-900/40">
                    {ticket.repairNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-4 h-9 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

