"use client";

import { useState } from "react";
import { Check, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { DetailedRepairRequest } from "@/types/requests";
import { cn } from "@/lib/utils";

interface RequestsTableProps {
  requests: DetailedRepairRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (request: DetailedRepairRequest) => void;
  onQuickAccept: (requestId: string) => void;
  onQuickReject: (request: DetailedRepairRequest) => void;
  totalCount: number;
}

const ITEMS_PER_PAGE = 4;

export function RequestsTable({
  requests,
  selectedRequestId,
  onSelectRequest,
  onQuickAccept,
  onQuickReject,
  totalCount,
}: RequestsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = requests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadge = (status: DetailedRepairRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            PENDING
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900/60 text-sky-700 dark:text-sky-300 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            ACCEPTED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            REJECTED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Table Header Bar */}
      <div className="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
        <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider font-semibold">
          Incoming Queue (Showing {paginatedRequests.length} of {requests.length})
        </span>
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
          <span>Live polling</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200/60 dark:border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              <th className="py-2.5 px-4 font-semibold">Request ID</th>
              <th className="py-2.5 px-4 font-semibold">Customer</th>
              <th className="py-2.5 px-4 font-semibold">Device</th>
              <th className="py-2.5 px-4 font-semibold">Problem Summary</th>
              <th className="py-2.5 px-4 font-semibold">Submitted</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500">
                  No repair requests match current filter.
                </td>
              </tr>
            ) : (
              paginatedRequests.map((req) => {
                const isSelected = req.id === selectedRequestId;

                return (
                  <tr
                    key={req.id}
                    onClick={() => onSelectRequest(req)}
                    className={cn(
                      "cursor-pointer transition-colors relative group",
                      isSelected
                        ? "bg-sky-50/80 dark:bg-sky-950/40"
                        : "hover:bg-zinc-50/70 dark:hover:bg-zinc-850/50"
                    )}
                  >
                    {/* Request ID with selection indicator */}
                    <td className="py-3 px-4 font-mono font-bold text-sky-700 dark:text-sky-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="w-1.5 h-6 rounded-full bg-sky-700 dark:bg-sky-400 -ml-2" />
                        )}
                        <span>{req.id}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col min-w-32">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {req.customer.name}
                          </span>
                          {req.customer.isVip && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500">
                          {req.customer.phone}
                        </span>
                      </div>
                    </td>

                    {/* Device */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col min-w-32">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {req.hardware.model}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {req.hardware.serialNumber}
                        </span>
                      </div>
                    </td>

                    {/* Problem Summary */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="truncate text-zinc-700 dark:text-zinc-300">
                        {req.problemTitle || req.problemDescription}
                      </p>
                    </td>

                    {/* Submitted */}
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-500">
                      {req.submittedAt}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {req.status === "PENDING" ? (
                        <div
                          className="inline-flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onQuickAccept(req.id)}
                            className="w-7 h-7 rounded-md bg-sky-700 hover:bg-sky-800 text-white flex items-center justify-center transition-colors shadow-2xs"
                            title="Quick Accept & Convert to Ticket"
                            aria-label={`Quick Accept ${req.id}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickReject(req)}
                            className="w-7 h-7 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 flex items-center justify-center transition-colors shadow-2xs"
                            title="Quick Reject"
                            aria-label={`Quick Reject ${req.id}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectRequest(req)}
                          className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 font-medium inline-flex items-center gap-1 text-[11px] transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Showing {requests.length === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + ITEMS_PER_PAGE, requests.length)} of {requests.length}{" "}
          requests (Total: {totalCount})
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="w-7 h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={cn(
                "w-7 h-7 rounded-md text-xs font-semibold flex items-center justify-center transition-colors",
                safeCurrentPage === page
                  ? "bg-sky-700 text-white"
                  : "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750"
              )}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="w-7 h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
