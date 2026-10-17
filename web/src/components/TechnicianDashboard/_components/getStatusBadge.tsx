import React from "react";

import type { RepairTicket } from "@/types/tickets";


export const getStatusBadge = (ticket: RepairTicket) => {
    if (ticket.status === "DIAGNOSING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-xs font-medium border border-sky-200 dark:border-sky-800">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
          Bench #04 Mat
        </span>
      );
    }
    if (ticket.status === "IN_REPAIR") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          In Repair (Reassembly Stage)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700">
        Pending Bench Diagnostic
      </span>
    );
  };