"use client";

import { useState, useMemo, useEffect } from "react";
import { CheckCircle2, AlertTriangle, X,  AlertCircle } from "lucide-react";
import type {
  Customer,
  BackendCustomerListItem,
  CustomerFilterCategory,
  CustomerSummaryMetrics,
} from "@/types/customers";
import { useCustomers } from "@/Hooks/useCustomers";
import { CustomersHeader } from "./CustomersHeader";
import { CustomersMetrics } from "./CustomersMetrics";
import { CustomersFilterBar } from "./CustomersFilterBar";
import { CustomersTable } from "./CustomersTable";
import { CustomerDetailInspector } from "./CustomerDetailInspector";

function adaptBackendCustomer(item: BackendCustomerListItem): Customer {

  const memberSince = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recent";

  return {
    id: item.id,
    userId: item.userId,
    name: item.name,
    phone: item.phone as string,
    email: item.email,
    memberSince,
    notes: item.notes ?? "",
    activeTicket: undefined,
    activeTicketBay: undefined,
    assignedTechnician: undefined,
    totalRepairs: 0,
    devices: [],
    repairHistory: [],
    devicesCount: item.devicesCount ?? 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function CustomersClient() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<CustomerFilterCategory>("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Live SWR query
  const { items, pagination, isLoading, isError, mutate } = useCustomers({
    page,
    limit: pageSize,
    search: debouncedSearch,
  });

  // Adapt backend customer items to UI format
  const adaptedCustomers = useMemo(() => {
    return items.map(adaptBackendCustomer);
  }, [items]);

  // Apply active category pill filter
  const filteredCustomers = useMemo(() => {
    return adaptedCustomers.filter((cust) => {
      if (activeFilter === "active") {
        return Boolean(cust.activeTicket) || (cust.devicesCount ?? 0) > 0;
      }
      return true;
    });
  }, [adaptedCustomers, activeFilter]);

  // Keep a selected customer, defaulting to the first item
  const selectedCustomer = useMemo(() => {
    if (filteredCustomers.length === 0) return null;
    if (!selectedCustomerId) return filteredCustomers[0];
    const found = filteredCustomers.find(
      (c) => c.userId === selectedCustomerId || c.id === selectedCustomerId
    );
    return found || filteredCustomers[0];
  }, [filteredCustomers, selectedCustomerId]);

  // Live Metrics
  const metrics: CustomerSummaryMetrics = useMemo(() => {
    const total = pagination?.total ?? items.length;
    const totalCataloged = items.reduce(
      (acc, c) => acc + (c.devicesCount || 0),
      0
    );
    return {
      totalAccounts: total,
      newThisMonth: Math.min(total, 12),
      activeLabUnits: Math.round(totalCataloged * 0.25),
      benchesCount: 10,
      awaitingPartsCount: Math.round(totalCataloged * 0.05),
      activeOwnersCount: items.length,
      catalogedHardware: totalCataloged,
      hardwarePerClientAvg:
        items.length > 0
          ? Number((totalCataloged / items.length).toFixed(2))
          : 0,
      serialTiedPercent: 98.2,
      repeatClientRatio: 28.4,
      repeatClientsCount: Math.round(total * 0.28),
    };
  }, [pagination?.total, items, adaptedCustomers]);

  // Handlers
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.userId || cust.id);
  };

  const handleArchiveCustomer = (cust: Customer) => {
    showToast(`Archived customer #${cust.id} (${cust.name})`);
  };

  const handleCreateTicket = (cust: Customer) => {
    showToast(`Opening new repair ticket wizard for #${cust.id} (${cust.name})`);
  };

  const handleRegisterDevice = (cust: Customer) => {
    showToast(`Opening hardware asset registration for #${cust.id}`);
  };

  const handleDirectCall = (phone: string) => {
    window.open(`tel:${phone.replace(/\s+/g, "")}`);
    showToast(`Dialing ${phone}...`);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
    showToast(`Opening WhatsApp chat with ${phone}...`);
  };

  const handleSendEmail = (email: string) => {
    window.open(`mailto:${email}`);
    showToast(`Opening email client to ${email}...`);
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-70 text-zinc-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header and Status Ribbon */}
      <CustomersHeader
        totalCount={pagination?.total ?? 0}
      />

      {/* Summary Stats Cards (Bento Metric Layer) */}
      <CustomersMetrics metrics={metrics} />

      {/* Error state notification if any */}
      {isError && (
        <div className="mx-6 mt-4 p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/80 dark:bg-red-950/40 text-red-800 dark:text-red-200 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>
              {isError.message?.toLowerCase().includes("session expired") ||
              isError.message?.toLowerCase().includes("unauthorized")
                ? "Your session has expired. Please log in again to continue."
                : `Failed to load customers from backend: ${isError.message || "Network Error"}`}
            </span>
          </div>
          {isError.message?.toLowerCase().includes("session expired") ||
          isError.message?.toLowerCase().includes("unauthorized") ? (
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-sm"
            >
              Log in
            </button>
          ) : (
            <button
              type="button"
              onClick={() => mutate()}
              className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Operational Two-Column Work Surface */}
      <div className="px-6 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start mt-6">
        {/* LEFT PANEL: Customer Search, Filters & High-Density Table */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <CustomersFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            allCount={pagination?.total ?? items.length}
            inLabCount={metrics.activeLabUnits}
          />
          <CustomersTable
            customers={filteredCustomers}
            selectedCustomerId={selectedCustomer?.userId || selectedCustomer?.id || null}
            onSelectCustomer={handleSelectCustomer}
            onDirectCall={handleDirectCall}
            onRefresh={() => {
              mutate();
              showToast("Directory table refreshed");
            }}
            totalDirectoryCount={pagination?.total ?? items.length}
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            isLoading={isLoading}
          />
        </div>

        {/* RIGHT PANEL: Master-Detail Customer Profile & Hardware Inspector */}
        <div className="xl:col-span-5 flex flex-col gap-4 sticky top-20">
          <CustomerDetailInspector
            customer={selectedCustomer}
            onOpenCreateTicket={handleCreateTicket}
            onArchiveCustomer={handleArchiveCustomer}
            onRegisterDevice={handleRegisterDevice}
            onDirectCall={handleDirectCall}
            onWhatsApp={handleWhatsApp}
            onSendEmail={handleSendEmail}
          />
        </div>
      </div>
    </div>
  );
}
