"use client";

import { useState } from "react";
import { PlusCircle, AlertCircle, Filter, X } from "lucide-react";
import { useAdminDashboardUIStore } from "@/Portal/adminDashboardUIStore";

interface OperationalHeaderProps {
  pendingCount?: number;
}

export function OperationalHeader({ pendingCount = 4 }: OperationalHeaderProps) {
  const activeFilterOnly = useAdminDashboardUIStore((state) => state.activeFilterOnly);
  const toggleActiveFilter = useAdminDashboardUIStore((state) => state.toggleActiveFilter);

  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [issue, setIssue] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !deviceModel) return;

    setSubmittedMessage(
      `Intake ticket registered for ${customerName} (${deviceModel}). Sent to queue.`
    );
    setCustomerName("");
    setDeviceModel("");
    setIssue("");
    setTimeout(() => {
      setSubmittedMessage(null);
      setIntakeModalOpen(false);
    }, 2500);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title and Telemetry Subheading */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold">
              Live Workbench Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Operational Overview - Main Repair Lab
          </h1>
          <p className="text-sm text-zinc-500 max-w-2xl">
            Live status of customer devices, technician assignments, and intake queue for single-center physical throughput.
          </p>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIntakeModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Customer Intake</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs sm:text-sm font-medium transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>Review Pending</span>
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 text-xs font-bold">
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleActiveFilter}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
              activeFilterOnly
                ? "bg-sky-50 dark:bg-sky-950 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 font-semibold"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{activeFilterOnly ? "Filtered: Active Only" : "Filter Active"}</span>
          </button>
        </div>
      </div>

      {/* New Customer Intake Dialog */}
      {intakeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  New Customer Device Intake
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIntakeModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedMessage ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs text-center font-medium">
                {submittedMessage}
              </div>
            ) : (
              <form onSubmit={handleCreateIntake} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariq Al-Hassan"
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Device Model &amp; Serial/IMEI
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="e.g. MacBook Pro 14 M2 / SN-891823"
                    className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Stated Symptom / Issue
                  </label>
                  <textarea
                    rows={3}
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="Describe problem reported by the client..."
                    className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIntakeModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Register Intake
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
