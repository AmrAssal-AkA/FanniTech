import React from "react";
import type { RepairTicket } from "@/types/tickets";
import { formatRelativeTime } from "./formatters";

const getTurnaroundTarget = (ticket: RepairTicket) => {
  const updatedText = `Updated ${formatRelativeTime(ticket.updatedAt)}`;

  if (ticket.priority === "HIGH") {
    return (
      <span className="font-mono text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
        {updatedText}
      </span>
    );
  }
  if (ticket.status === "IN_REPAIR") {
    return (
      <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
        {updatedText}
      </span>
    );
  }
  return (
    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
      {updatedText}
    </span>
  );
};

export default getTurnaroundTarget;