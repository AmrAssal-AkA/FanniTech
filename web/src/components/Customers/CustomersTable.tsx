"use client";

import { Phone, ChevronRight, RefreshCw, Columns, ChevronLeft, Loader2 } from "lucide-react";
import type { Customer, CustomerPagination } from "@/types/customers";

interface CustomersTableProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  onDirectCall: (phone: string) => void;
  onRefresh?: () => void;
  totalDirectoryCount: number;
  pagination?: CustomerPagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

export function CustomersTable({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onDirectCall,
  onRefresh,
  totalDirectoryCount,
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: CustomersTableProps) {
  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.limit ?? 10;
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.total ?? totalDirectoryCount;

  const startIndex = (currentPage - 1) * pageSize;


  const getTicketBadge = (customer: Customer) => {
    if (!customer.activeTicket) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Active Account
        </span>
      );
    }

    if (customer.activeTicket.startsWith("TCK")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-300 font-mono text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          {customer.activeTicket} · Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-mono text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {customer.activeTicket}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden flex flex-col">
      {/* Quick Batch Toolbar Meta */}
      <div className="px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
            {customers.length} Customers Shown
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Sorted by:{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Registration Date (Newest)
            </span>
          </span>
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-mono text-[11px] ml-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Refresh table"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Adjust columns"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="h-9 bg-zinc-50/50 dark:bg-zinc-800/40 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase text-[11px] font-semibold tracking-wider font-mono">
              <th className="px-4 py-2">Client Identity</th>
              <th className="px-4 py-2">Contact &amp; Location</th>
              <th className="px-4 py-2">Linked Hardware</th>
              <th className="px-4 py-2">Live Ticket</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
            {isLoading && customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-600 dark:text-sky-400" />
                    <span className="text-xs">Fetching customers from server...</span>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                  No customers found matching the search criteria.
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const isSelected = selectedCustomerId === customer.userId || selectedCustomerId === customer.id;
                const devicesCount = customer.devicesCount ?? customer.devices.length;

                return (
                  <tr
                    key={customer.userId || customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-sky-50/70 dark:bg-sky-950/40 border-l-4 border-l-sky-600 font-medium"
                        : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    {/* 1. Client Identity */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 border border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {(customer.name || "CL")
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {customer.name}
                            </span>
                          </div>
                          <span className="text-zinc-400 font-mono text-[11px] truncate">
                            #{customer.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Contact & Location */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-zinc-900 dark:text-zinc-200 font-medium">
                          {customer.phone}
                        </span>
                        <span className="text-zinc-400 text-xs truncate max-w-40">
                          {customer.email}
                        </span>
                      </div>
                    </td>

                    {/* 3. Linked Hardware */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          {devicesCount} {devicesCount === 1 ? "Device" : "Devices"}
                        </span>
                        <span className="text-zinc-400 font-mono text-[11px] truncate max-w-37.5">
                          {customer.devices.length > 0
                            ? customer.devices.map((d) => d.model.replace("Lenovo ThinkPad ", "").replace("Apple ", "")).join(" / ")
                            : "Cataloged Hardware"}
                        </span>
                      </div>
                    </td>

                    {/* 4. Live Ticket */}
                    <td className="px-4 py-3">{getTicketBadge(customer)}</td>

                    {/* 5. Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onDirectCall(customer.phone)}
                          className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
                          title={`Call ${customer.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(customer)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          }`}
                          title="View Inspector"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span>
            Showing rows {totalCount === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, totalCount)} of {totalCount}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange?.(Number(e.target.value));
            }}
            aria-label="Rows per page"
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded px-2 py-1 text-xs focus:outline-none"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            className="px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
            Previous
          </button>
          <span className="px-2 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
            className="px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
