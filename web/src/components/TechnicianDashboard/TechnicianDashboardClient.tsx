"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

import { useAuth } from "@/Hooks/useAuth";
import { useTechnicianDashboard } from "@/Hooks/useTechnicianDashboard";
import { WorkbenchHeader } from "@/components/TechnicianDashboard/WorkbenchHeader";
import { OperationalMetricsStrip } from "@/components/TechnicianDashboard/OperationalMetricsStrip";
import { ActiveBenchCard } from "@/components/TechnicianDashboard/ActiveBenchCard";
import { AssignedQueueSection } from "@/components/TechnicianDashboard/AssignedQueueSection";
import { FastDeviceCheckIn } from "@/components/TechnicianDashboard/FastDeviceCheckIn";
import { BenchRigTelemetry } from "@/components/TechnicianDashboard/BenchRigTelemetry";
import { BenchActivityStream } from "@/components/TechnicianDashboard/BenchActivityStream";
import { BenchScratchpad } from "@/components/TechnicianDashboard/BenchScratchpad";
import { SchematicModal } from "@/components/TechnicianDashboard/SchematicModal";
import type { RepairTicket } from "@/types/tickets";

export function TechnicianDashboardClient() {
  const { user } = useAuth();
  const { data, isLoading, isError, mutate } = useTechnicianDashboard();
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-3" />
        <span className="text-sm font-medium">Connecting to Lab OS Workbench Telemetry...</span>
      </div>
    );
  }

  if (isError && !data) {
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

  const techName = user?.name || data.technicianName || "Ahmed Zaki";
  const techRole = data.technicianRole || "Micro-Soldering & Board Diagnostics";

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Workbench Context Strip */}
      <WorkbenchHeader
        technicianName={techName}
        technicianRole={techRole}
        activeCount={data.assignedTickets.length}
        readyCount={data.metrics.readyForQACount}
      />

      {/* 2. Operational Metrics 5-Card High Density Strip */}
      <OperationalMetricsStrip
        metrics={data.metrics}
        diagnosingTicketCode={data.activeMatTicket.ticketNumber}
        diagnosingDevice={data.activeMatTicket.deviceTitle}
        readyTicketCode="TCK-2038"
        readyDevice="ASUS Zephyrus G14"
      />

      {/* 3. Primary Active Bench Card (Live On Mat Hero Section) */}
      <ActiveBenchCard
        ticket={data.activeMatTicket}
        onOpenWorkspace={() => {
          // Scroll smoothly to the assigned queue
          const el = document.getElementById("assigned-queue-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        onSetInRepair={() => {
          // Trigger optimistic feedback
        }}
      />

      {/* 4. Main Split Layout: Left 8 cols vs Right 4 cols */}
      <div id="assigned-queue-section" className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Assigned Tickets Queue */}
        <div className="xl:col-span-8 flex flex-col space-y-6">
          <AssignedQueueSection
            tickets={data.assignedTickets}
            onSelectTicket={(ticket) => {
              setSelectedTicket(ticket);
            }}
          />
        </div>

        {/* Right 4 Columns: Fast Barcode Scanner, Rig Telemetry, Activity Stream & Scratchpad */}
        <div className="xl:col-span-4 flex flex-col space-y-6">
          {/* Fast Device Check-in / Barcode Scanner */}
          <FastDeviceCheckIn />

          {/* Bench Rig Telemetry */}
          <BenchRigTelemetry devices={data.rigDevices} />

          {/* Bench Activity Stream */}
          <BenchActivityStream activities={data.recentActivities} />

          {/* Bench Scratchpad / Shift Handoff */}
          <BenchScratchpad technicianTag={`${techName.split(" ")[0]} Z. · ${data.bayNumber}`} />
        </div>
      </div>

      {/* Schematic Boardview Modal */}
      <SchematicModal />
    </div>
  );
}

