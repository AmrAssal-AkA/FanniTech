import React from "react";

import UnauthorizedClientPage from "@/components/unAuthorizedComponent/unauthorizedClientPage";


export const metadata = {
  title: "Unauthorized Access",
  description: "You do not have permission to access this page.",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/70 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 antialiased">
        <UnauthorizedClientPage />
    </main>
  );
}
