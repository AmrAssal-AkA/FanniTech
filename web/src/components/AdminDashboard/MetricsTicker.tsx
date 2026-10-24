import {
  Inbox,
  Wrench,
  FlaskConical,
  Hammer,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";
import type { DashboardMetrics } from "@/types/dashboard";

interface MetricsTickerProps {
  metrics: DashboardMetrics;
}

export function MetricsTicker({ metrics }: MetricsTickerProps) {
  const cards = [
    {
      title: "Pending Requests",
      count: metrics.pendingRequestsCount,
      subtext: "Needs Triage",
      icon: Inbox,
      accentBorder: "border-l-red-500",
      iconColor: "text-red-500",
      subtextColor: "text-red-600 dark:text-red-400 font-medium",
      progressBg: "bg-red-100 dark:bg-red-950/60",
      progressBar: "bg-red-500",
      progressWidth: "75%",
    },
    {
      title: "Active Tickets",
      count: metrics.activeTicketsCount,
      subtext: "In Center",
      icon: Wrench,
      accentBorder: "border-l-sky-600",
      iconColor: "text-sky-600 dark:text-sky-400",
      subtextColor: "text-zinc-500 dark:text-zinc-400",
      progressBg: "bg-sky-100 dark:bg-sky-950/60",
      progressBar: "bg-sky-600",
      progressWidth: "66%",
    },
    {
      title: "In Diagnosis",
      count: metrics.inDiagnosisCount,
      subtext: "Diagnostic Bench",
      icon: FlaskConical,
      accentBorder: "border-l-sky-500",
      iconColor: "text-sky-500 dark:text-sky-400",
      subtextColor: "text-sky-700 dark:text-sky-300",
      progressBg: "bg-sky-100 dark:bg-sky-950/60",
      progressBar: "bg-sky-500",
      progressWidth: "25%",
    },
    {
      title: "In Repair",
      count: metrics.inRepairCount,
      subtext: "Micro-soldering/OS",
      icon: Hammer,
      accentBorder: "border-l-blue-600",
      iconColor: "text-blue-600 dark:text-blue-400",
      subtextColor: "text-blue-700 dark:text-blue-300",
      progressBg: "bg-blue-100 dark:bg-blue-950/60",
      progressBar: "bg-blue-600",
      progressWidth: "42%",
    },
    {
      title: "Ready Pickup",
      count: metrics.readyForPickupCount,
      subtext: "Front Locker",
      icon: PackageCheck,
      accentBorder: "border-l-indigo-600",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      subtextColor: "text-indigo-700 dark:text-indigo-300 font-medium",
      progressBg: "bg-indigo-100 dark:bg-indigo-950/60",
      progressBar: "bg-indigo-600",
      progressWidth: "33%",
    },
    {
      title: "Completed Today",
      count: metrics.completedTodayCount,
      subtext: "100% QA Passed",
      icon: CheckCircle2,
      accentBorder: "border-l-emerald-600",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      subtextColor: "text-emerald-700 dark:text-emerald-300",
      progressBg: "bg-emerald-100 dark:bg-emerald-950/60",
      progressBar: "bg-emerald-600",
      progressWidth: "100%",
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 border-l-4 ${card.accentBorder} shadow-xs flex flex-col justify-between space-y-2 hover:shadow-sm transition-all group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold truncate">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.iconColor} shrink-0`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {card.count}
              </span>
              <span className={`text-[11px] truncate ${card.subtextColor}`}>
                {card.subtext}
              </span>
            </div>
            <div className={`h-1 w-full ${card.progressBg} rounded-full overflow-hidden`}>
              <div
                className={`h-full ${card.progressBar} rounded-full transition-all duration-500`}
                style={{ width: card.progressWidth }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
