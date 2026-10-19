import { History } from "lucide-react";
import type { WorkbenchActivity } from "@/types/technicianDashboard";
import type { RepairTicketStatus } from "@/types/tickets";
import { formatClock, statusLabel } from "./_components/formatters";

interface BenchActivityStreamProps {
  activities: WorkbenchActivity[];
}

export function BenchActivityStream({ activities }: BenchActivityStreamProps) {
  const getDotColor = (status: RepairTicketStatus) => {
    switch (status) {
      case "DIAGNOSING":
        return "bg-sky-600";
      case "IN_REPAIR":
        return "bg-blue-600";
      case "READY_FOR_PICKUP":
      case "COMPLETED":
        return "bg-emerald-600";
      case "UNREPAIRABLE":
      case "CANCELLED":
        return "bg-red-600";
      default:
        return "bg-zinc-400 dark:bg-zinc-600";
    }
  };

  return (
    <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Bench Activity Stream
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Recent
        </span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 py-6 text-center">
          No status history recorded yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5 mt-3">
          {activities.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5">
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5 shrink-0 w-10">
                {formatClock(item.changedAt)}
              </span>
              <div
                className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${getDotColor(
                  item.status
                )}`}
              />
              <div className="flex flex-col leading-snug min-w-0">
                <span className="text-xs text-zinc-800 dark:text-zinc-200">
                  Status → <strong>{statusLabel(item.status)}</strong>{" "}
                  {item.ticket?.ticketNumber && (
                    <strong className="text-sky-700 dark:text-sky-400 font-semibold font-mono">
                      {item.ticket.ticketNumber}
                    </strong>
                  )}
                </span>
                {item.notes && (
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 wrap-break-word">
                    {item.notes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
