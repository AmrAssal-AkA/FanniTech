import { History } from "lucide-react";
import type { BenchActivityItem } from "@/types/technicianDashboard";

interface BenchActivityStreamProps {
  activities?: BenchActivityItem[];
}

export function BenchActivityStream({
  activities = [
    {
      id: "act-1",
      time: "11:50",
      type: "primary",
      headline: "Component replacement logged for",
      ticketNumber: "TCK-2042",
      detail: "Reserved PQ301 (AON6414A) from Bin #B-14",
    },
    {
      id: "act-2",
      time: "10:45",
      type: "tertiary",
      headline: "Thermal re-paste finished on",
      ticketNumber: "TCK-2038",
      detail: "Applied PTM7950 phase-change material",
    },
    {
      id: "act-3",
      time: "09:15",
      type: "neutral",
      headline: "Ticket TCK-2042 assigned by Dispatch",
      ticketNumber: "TCK-2042",
      detail: "Tariq Al-Mansoor assigned priority ticket to Bay #04",
    },
    {
      id: "act-4",
      time: "08:10",
      type: "success",
      headline: "Morning Bench Calibration Verified",
      detail: "Grounding ESD mat: < 1.0 MΩ (Passed)",
    },
  ],
}: BenchActivityStreamProps) {
  const getDotColor = (type: string) => {
    switch (type) {
      case "primary":
        return "bg-sky-600";
      case "tertiary":
        return "bg-blue-600";
      case "success":
        return "bg-emerald-600";
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
          Today
        </span>
      </div>

      <div className="flex flex-col gap-3.5 mt-3">
        {activities.map((item) => (
          <div key={item.id} className="flex items-start gap-2.5">
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5 shrink-0 w-9">
              {item.time}
            </span>
            <div
              className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${getDotColor(
                item.type
              )}`}
            />
            <div className="flex flex-col leading-snug">
              <span className="text-xs text-zinc-800 dark:text-zinc-200">
                {item.headline}{" "}
                {item.ticketNumber && (
                  <strong className="text-sky-700 dark:text-sky-400 font-semibold font-mono">
                    {item.ticketNumber}
                  </strong>
                )}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {item.detail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

