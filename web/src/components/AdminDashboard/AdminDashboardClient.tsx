"use client";

import { useAdminDashboard } from "@/Hooks/useAdminDashboard";
import { useAdminDashboardUIStore } from "@/Portal/adminDashboardUIStore";
import { OperationalHeader } from "@/components/AdminDashboard/OperationalHeader";
import { MetricsTicker } from "@/components/AdminDashboard/MetricsTicker";
import { PendingRequestsQueue } from "@/components/AdminDashboard/PendingRequestsQueue";
import { ActiveTicketsPipeline } from "@/components/AdminDashboard/ActiveTicketsPipeline";
import { TechnicianWorkload } from "@/components/AdminDashboard/TechnicianWorkload";
import { LiveActivityFeed } from "@/components/AdminDashboard/LiveActivityFeed";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

export function AdminDashboardClient() {
  const { data, isLoading, isError, mutate } = useAdminDashboard();
  const searchQuery = useAdminDashboardUIStore((state) => state.searchQuery);
  const activeFilterOnly = useAdminDashboardUIStore((state) => state.activeFilterOnly);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-3" />
        <span className="text-sm font-medium">Connecting to Lab OS Workbench Telemetry...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-500">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Workbench Telemetry Offline
        </span>
        <p className="text-xs text-zinc-500 mb-4 max-w-sm text-center">
          Unable to establish connection with local Node 192.168.1.14. Verify lab service connectivity.
        </p>
        <button
          type="button"
          onClick={() => mutate()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Filter requests based on universal search query
  const filteredRequests = data.pendingRequests.filter((req) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.id.toLowerCase().includes(q) ||
      req.customerName.toLowerCase().includes(q) ||
      req.deviceModel.toLowerCase().includes(q) ||
      req.hardwareProblem.toLowerCase().includes(q)
    );
  });

  // Filter tickets based on active filter and search query
  const filteredTickets = data.activeTickets.filter((ticket) => {
    if (activeFilterOnly && ticket.status === "READY_FOR_PICKUP") {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ticket.id.toLowerCase().includes(q) ||
      ticket.deviceModel.toLowerCase().includes(q) ||
      ticket.assignedTechName.toLowerCase().includes(q) ||
      ticket.currentStageNote.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full px-6 py-6 space-y-6 max-w-7xl mx-auto">
      {/* Operational Header */}
      <OperationalHeader pendingCount={filteredRequests.length} />

      {/* Operational Metrics Ticker Strip */}
      <MetricsTicker metrics={data.metrics} />

      {/* Dual Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT 8 COLS: Queues & Pipelines */}
        <div className="xl:col-span-8 flex flex-col space-y-6">
          {/* Section A: Urgent Attention & Pending Requests Queue */}
          <PendingRequestsQueue requests={filteredRequests} />

          {/* Section B: Active Tickets Pipeline Overview */}
          <ActiveTicketsPipeline tickets={filteredTickets} />
        </div>

        {/* RIGHT 4 COLS: Lab Technician Capacity & Activity Feed */}
        <div className="xl:col-span-4 flex flex-col space-y-6">
          {/* Section C: Technician Workload & Availability */}
          <TechnicianWorkload
            technicians={data.technicians}
            capacityAssigned={data.metrics.labBenchCapacity.assigned}
            capacityTotal={data.metrics.labBenchCapacity.total}
          />

          {/* Section D: Live Activity & Status History Feed */}
          <LiveActivityFeed activities={data.recentActivities} />
        </div>
      </div>
    </div>
  );
}
