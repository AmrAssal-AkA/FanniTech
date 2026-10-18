"use client";

import { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Inbox,
  CheckCircle2,
} from "lucide-react";

import { useTechnicianDashboard } from "@/Hooks/useTechnicianDashboard";
import { WorkbenchHeader } from "@/components/TechnicianDashboard/WorkbenchHeader";
import { OperationalMetricsStrip } from "@/components/TechnicianDashboard/OperationalMetricsStrip";
import { ActiveBenchCard } from "@/components/TechnicianDashboard/ActiveBenchCard";
import { AssignedQueueSection } from "@/components/TechnicianDashboard/AssignedQueueSection";
import { BenchActivityStream } from "@/components/TechnicianDashboard/BenchActivityStream";
import {
  TechnicianTicketManageModal,
  type TechnicianModalMode,
} from "@/components/TechnicianDashboard/TechnicianTicketManageModal";
import type { RepairTicket } from "@/types/tickets";

export function TechnicianDashboardClient() {
  const {
    data,
    isLoading,
    isError,
    mutate,
    saveNotes,
    startDiagnosis,
    startRepair,
    markReadyForPickup,
    completeTicket,
    markUnrepairable,
  } = useTechnicianDashboard();

  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(
    null
  );
  const [modalConfig, setModalConfig] = useState<{
    ticketId: string;
    fallbackTicket: RepairTicket;
    mode: TechnicianModalMode;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-3" />
        <span className="text-sm font-medium">
          Loading technician workbench...
        </span>
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
          Unable to Load Workbench
        </span>
        <p className="text-xs text-zinc-500 mb-4 max-w-sm text-center">
          Could not retrieve your workbench telemetry and assigned tickets.
          Please check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => mutate()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const formatDeviceName = (t?: RepairTicket | null) =>
    t
      ? `${t.request?.device?.brand || ""} ${
          t.request?.device?.model || ""
        }`.trim() || null
      : null;

  const firstDiagnosing = data.assignedTickets.find(
    (t) => t.status === "DIAGNOSING"
  );
  const firstInRepair = data.assignedTickets.find(
    (t) => t.status === "IN_REPAIR"
  );
  const firstReady = data.assignedTickets.find(
    (t) => t.status === "READY_FOR_PICKUP"
  );

  const benchTicket =
    (selectedTicket &&
      data.assignedTickets.find((t) => t.id === selectedTicket.id)) ||
    data.activeTicket;

  const activeModalTicket = modalConfig
    ? data.assignedTickets.find((t) => t.id === modalConfig.ticketId) ||
      (data.activeTicket?.id === modalConfig.ticketId
        ? data.activeTicket
        : modalConfig.fallbackTicket)
    : null;

  const handleOpenManageModal = (
    ticket: RepairTicket,
    mode: TechnicianModalMode = "transition"
  ) => {
    setModalConfig({
      ticketId: ticket.id,
      fallbackTicket: ticket,
      mode,
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Full-width Top Workbench Context Banner */}
      <WorkbenchHeader
        technician={data.technician}
        activeCount={data.metrics.activeQueueCount}
        readyCount={data.metrics.readyForQACount}
      />

      <div className="flex flex-col w-full px-4 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto">
        {/* 2. Operational Metrics 5-Card Strip */}
        <OperationalMetricsStrip
          metrics={data.metrics}
          diagnosingTicketCode={firstDiagnosing?.ticketNumber || null}
          diagnosingDevice={formatDeviceName(firstDiagnosing)}
          inRepairTicketCode={firstInRepair?.ticketNumber || null}
          inRepairDevice={formatDeviceName(firstInRepair)}
          readyTicketCode={firstReady?.ticketNumber || null}
          readyDevice={formatDeviceName(firstReady)}
        />

        {/* 3. Primary Active Bench Card */}
        {benchTicket ? (
          <ActiveBenchCard
            ticket={benchTicket}
            onManageTicket={handleOpenManageModal}
            onOpenWorkspace={() => {
              const el = document.getElementById("assigned-queue-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs text-zinc-500">
            <Inbox className="w-7 h-7 text-zinc-400 mb-2" />
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No Active Ticket on Bench
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              When tickets are assigned to you, the highest-priority active unit
              will appear here.
            </p>
          </div>
        )}

        {/* 4. Main Split Layout: Left 8 cols Queue vs Right 4 cols Activity Stream */}
        <div
          id="assigned-queue-section"
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
        >
          <div className="xl:col-span-8 flex flex-col space-y-6">
            <AssignedQueueSection
              tickets={data.assignedTickets}
              activeBenchTicketId={benchTicket?.id || null}
              onSelectTicket={(ticket) => {
                setSelectedTicket(ticket);
              }}
              onManageTicket={handleOpenManageModal}
              onSaveNotes={async (ticketId, payload) => {
                const updated = await saveNotes(ticketId, payload);
                showToast("Saved technician notes");
                return updated;
              }}
            />
          </div>

          <div className="xl:col-span-4 flex flex-col space-y-6">
            <BenchActivityStream activities={data.recentActivities} />
          </div>
        </div>
      </div>

      {/* 5. Technician Ticket Management Modal */}
      {modalConfig && activeModalTicket && (
        <TechnicianTicketManageModal
          ticket={activeModalTicket}
          initialMode={modalConfig.mode}
          onClose={() => setModalConfig(null)}
          onStartDiagnosis={startDiagnosis}
          onStartRepair={startRepair}
          onMarkReadyForPickup={markReadyForPickup}
          onCompleteTicket={completeTicket}
          onMarkUnrepairable={markUnrepairable}
          onSaveNotes={saveNotes}
          onSuccess={(msg) => showToast(msg, "success")}
        />
      )}
    </div>
  );
}

