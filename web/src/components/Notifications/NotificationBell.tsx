"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  Inbox,
  Wrench,
  AlertCircle,
  Clock,
  ExternalLink,
  Volume2,
} from "lucide-react";
import { useNotifications } from "@/Hooks/useNotifications";
import type { NotificationItem, NotificationType } from "@/types/notifications";
import { cn } from "@/lib/utils";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "NEW_REPAIR_REQUEST":
    case "REPAIR_REQUEST_RECEIVED":
      return <Inbox className="w-4 h-4 text-sky-600" />;
    case "REPAIR_REQUEST_ACCEPTED":
    case "REPAIR_COMPLETED":
      return <Check className="w-4 h-4 text-emerald-600" />;
    case "REPAIR_REQUEST_REJECTED":
    case "REPAIR_REQUEST_CANCELLED":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "TECHNICIAN_ASSIGNED":
    case "REPAIR_STATUS_UPDATED":
    case "DIAGNOSTICS_COMPLETED":
    case "REPAIR_READY_FOR_PICKUP":
    default:
      return <Wrench className="w-4 h-4 text-amber-500" />;
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 60_000) return "Just now";
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    activeToast,
    isConnected,
    isLoading,
    isOpen,
    browserPermission,
    requestBrowserPermission,
    toggleOpen,
    setOpen,
    dismissToast,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setOpen]);

  const handleNotificationClick = (item: NotificationItem) => {
    void markAsRead(item.id);

    // Deep link based on notification data or type
    if (item.data?.ticketId) {
      router.push(`/repair-tickets?ticketId=${item.data.ticketId}`);
    } else if (item.data?.repairRequestId || item.type.includes("REQUEST")) {
      router.push("/dashboard/Requests");
    }

    setOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
      >
        <Bell className="w-4 h-4" />

        {/* Live connection dot indicator */}
        <span
          className={cn(
            "absolute bottom-1 left-1 w-2 h-2 rounded-full border border-white dark:border-zinc-950",
            isConnected ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
          )}
          title={isConnected ? "Real-time sync active" : "Reconnecting to live sync..."}
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold leading-none ring-2 ring-white dark:ring-zinc-950 shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[85vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
                Notifications
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                  isConnected
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                  )}
                />
                {isConnected ? "Live" : "Connecting"}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-xs text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Browser Notification Permission Banner (if default) */}
          {browserPermission === "default" && (
            <div className="px-4 py-2.5 bg-sky-50 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/40 flex items-center justify-between text-xs text-sky-900 dark:text-sky-200">
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 shrink-0" />
                <span>Enable desktop sound and popups?</span>
              </div>
              <button
                type="button"
                onClick={() => void requestBrowserPermission()}
                className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-md text-[11px] transition-colors"
              >
                Enable
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto max-h-95 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center text-zinc-400 gap-2">
                <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                <span className="text-xs font-medium">No notifications yet</span>
                <span className="text-[11px] text-zinc-400">
                  New repair tickets and requests will appear here in real time.
                </span>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative group",
                    item.isRead
                      ? "hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50"
                      : "bg-sky-50/40 dark:bg-sky-950/20 hover:bg-sky-50/70 dark:hover:bg-sky-950/40"
                  )}
                >
                  {/* Icon */}
                  <div className="mt-0.5 w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={cn(
                          "text-xs font-semibold truncate",
                          item.isRead
                            ? "text-zinc-700 dark:text-zinc-300"
                            : "text-zinc-900 dark:text-zinc-100 font-bold"
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-sky-600 dark:bg-sky-400 shrink-0 mt-1.5 ring-2 ring-sky-100 dark:ring-sky-950" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Real-Time Toast Banner */}
      {activeToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-zinc-900 border border-sky-300 dark:border-sky-800 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center shrink-0">
            {getNotificationIcon(activeToast.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {activeToast.title}
              </span>
              <button
                type="button"
                onClick={dismissToast}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {activeToast.body}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleNotificationClick(activeToast)}
                className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>View Details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
