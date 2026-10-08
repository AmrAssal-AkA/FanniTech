import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/AdminDashboard/AdminSidebar";
import { AdminHeader } from "@/components/AdminDashboard/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 antialiased">
      <AdminSidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="w-full pt-16 flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
}
