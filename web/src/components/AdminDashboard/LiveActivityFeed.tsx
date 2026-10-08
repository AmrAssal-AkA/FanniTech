import { History, MessageSquare } from "lucide-react";
import type { ActivityFeedItem } from "@/types/dashboard";

interface LiveActivityFeedProps {
  activities: ActivityFeedItem[];
}

export function LiveActivityFeed({ activities }: LiveActivityFeedProps) {
  const getDotColor = (highlight: string) => {
    switch (highlight) {
      case "tertiary":
        return "bg-blue-500 ring-blue-100 dark:ring-blue-950";
      case "secondary":
        return "bg-indigo-500 ring-indigo-100 dark:ring-indigo-950";
      case "error":
        return "bg-red-500 ring-red-100 dark:ring-red-950";
      default:
        return "bg-sky-600 ring-sky-100 dark:ring-sky-950";
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
      {/* Section Header */}
      <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-500" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Live Activity Feed
          </h2>
        </div>
        <span className="font-mono text-xs text-zinc-500 font-medium">Today</span>
      </div>

      <div className="p-5">
        <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
          {activities.map((item) => (
            <div key={item.id} className="relative group">
              <span
                className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ${getDotColor(
                  item.highlightType
                )}`}
              />
              <div className="flex flex-col space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                    {item.referenceId}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  {item.actionText}
                </p>
                {item.detailNote && (
                  <p className="text-[11px] text-zinc-500">
                    {item.detailNote}
                  </p>
                )}
                {item.badgeInfo && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-zinc-500 pt-0.5">
                    <MessageSquare className="w-3 h-3 text-sky-600" />
                    <span>{item.badgeInfo}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
