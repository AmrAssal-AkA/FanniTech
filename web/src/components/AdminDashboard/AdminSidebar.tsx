"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Inbox,
  Ticket,
  Wrench,
  Bell,
  Settings,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@/Hooks/useAuth";

interface AdminSidebarProps {
  pendingCount?: number;
  ticketsCount?: number;
}

export function AdminSidebar({
  pendingCount = 4,
  ticketsCount = 12,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
      badge: null,
      badgeColor: "",
    },
    {
      title: "Customers",
      href: "/customers",
      icon: Users,
      badge: null,
      badgeColor: "",
    },
    {
      title: "Requests",
      href: "/dashboard/Requests",
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor:
        "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900",
    },
    {
      title: "Tickets",
      href: "/repair-tickets",
      icon: Ticket,
      badge: ticketsCount > 0 ? ticketsCount : null,
      badgeColor:
        "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-900",
    },
    {
      title: "Technicians",
      href: "/technicians",
      icon: Wrench,
      badge: null,
      badgeColor: "",
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: 3,
      badgeColor:
        "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
      badgeColor: "",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Optionally, you can redirect the user to the login page or home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand identity header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-850 bg-white dark:bg-zinc-950">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <Image
              src="/Logo.png"
              alt="FanniTech Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-base text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              FanniTech
            </span>
            <span className="text-[11px] font-mono font-medium text-sky-700 dark:text-sky-400 leading-tight">
              LAB OS v1.0
            </span>
          </div>
        </div>

        {/* Administration Nav Section */}
        <div className="px-3 py-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
            Administration
          </div>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold border border-sky-100 dark:border-sky-900/50"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-sky-700 dark:text-sky-400"
                          : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300",
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[11px] font-bold",
                        item.badgeColor,
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-3 py-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <button
          type="button"
          aria-label="logoutButton"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xl font-medium bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
          onClick={handleLogout}
        >
          <DoorOpen className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
