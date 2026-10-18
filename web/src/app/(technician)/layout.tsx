import type { ReactNode } from "react";

import { Roles } from "@/lib/auth/roles";
import { PrivateRoute } from "@/components/auth/protectedRoute";
import { Header } from "@/components/Header&Footer/Header";
import { Footer } from "@/components/Header&Footer/Footer";

export const metadata = {
  title: "Technician Dashboard",
  description:
    "Dashboard for technicians to manage their tasks and view relevant information.",
};

export default function TechnicianLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PrivateRoute allowedRoles={[Roles.TECHNICIAN]}>
      <div className="flex flex-col min-h-screen bg-zinc-50/60 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 antialiased">
        <Header />
        <main className="w-full flex-1 flex flex-col">{children}</main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}
