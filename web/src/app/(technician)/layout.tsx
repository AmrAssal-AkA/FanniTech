import type { ReactNode } from "react";
import { PrivateRoute } from "@/components/auth/protectedRoute";
import { Roles } from "@/lib/auth/roles";
import { Header } from "@/components/Header&Footer/Header";
import { Footer } from "@/components/Header&Footer/Footer";

export const metadata = {
  title: "Technician Workbench | FanniTech Lab OS",
  description: "Bench operations and hardware diagnosis workbench for technicians.",
};

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  return (
    <PrivateRoute allowedRoles={[Roles.ADMIN, Roles.TECHNICIAN]} redirectTo="/unauthorized">
      <div className="min-h-screen bg-zinc-50/70 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 antialiased flex flex-col justify-between">
        <Header />
        <main className="w-full pt-16 flex-1 flex flex-col">{children}</main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

