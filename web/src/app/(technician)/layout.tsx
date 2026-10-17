import type { ReactNode } from "react";

import { Roles } from "@/lib/auth/roles";
import { PrivateRoute } from "@/components/auth/protectedRoute";

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
      <div className="flex flex-col min-h-screen ">
        <main className="w-full pt-16 flex-1 flex flex-col">{children}</main>
      </div>
    </PrivateRoute>
  );
}
